# encoding: utf-8
from collections import OrderedDict

from django.db import models
from django.db.models import F, Q
from django.db.models.query import QuerySet
from django.db.models.signals import post_save, pre_delete, m2m_changed
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext as _

from model_utils.managers import PassThroughManager
from django_fsm import FSMField, transition

from .exceptions import (
    ComponentAlreadyInstalled, ComponentNotInstalled,
    ComponentIsBroken, RackIsFilled, BasketIsFilled, BasketSlotIsBusy)
from .defaults import (
    PROPERTY_TEXT_FIELD, PROPERTY_SELECT_FIELD,
    PROPERTY_NUMBER_FIELD, PROPERTY_FIELD_CHOICES,
    ComponentState)


@python_2_unicode_compatible
class NamedModel(models.Model):
    name = models.CharField(
        max_length=255,
        verbose_name=_('Name'),
        blank=False,
        null=False)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name

    def get_name(self):
        return self.name


class Node(NamedModel):
    """
        Узел (дата-центр)
    """
    address = models.TextField(
        blank=True)

    class Meta:
        verbose_name = _('Node')
        verbose_name_plural = _('Nodes')

    def get_server_list(self):
        return self.servers.all()


class Floor(NamedModel):
    """
        Этаж
    """
    node = models.ForeignKey(Node)

    class Meta:
        verbose_name = _('Floor')
        verbose_name_plural = _('Floors')


class Room(NamedModel):
    """
        Помещение
    """
    floor = models.ForeignKey(Floor)

    class Meta:
        verbose_name = _('Room')
        verbose_name_plural = _('Rooms')


class Row(NamedModel):
    """
        Ряд
    """
    room = models.ForeignKey(Room)

    class Meta:
        verbose_name = _('Row')
        verbose_name_plural = _('Rows')


class RackQuerySet(QuerySet):

    def with_fullness(self, fullness=None, height=1):
        """
            Valid values for 'fullness': all | empty | has_empty | filled | has_empty_height
        """
        if fullness is None or fullness == 'all':
            return self.all()

        elif fullness == 'empty':
            return self.filter(max_gap=F('total_units'))

        elif fullness == 'has_empty':
            return self.filter(max_gap__gt=0)

        elif fullness == 'has_empty_height':
            try:
                height = int(height) if height is not None else 1
            except ValueError:
                height = 1
            return self.filter(max_gap__gte=height)

        elif fullness == 'filled':
            return self.filter(max_gap=0)

        raise ValueError('Unsupported fullness value. Must be one of the following values: '
                         'all | empty | has_empty | filled | has_empty_height.')


class Rack(NamedModel):
    """
        Стойка
    """
    node = models.ForeignKey(Node)
    row = models.ForeignKey(Row)
    total_units = models.PositiveSmallIntegerField(
        verbose_name=_('total units'),
        default=1)
    max_gap = models.PositiveSmallIntegerField(
        verbose_name=_('max gap'),
        default=0)

    objects = PassThroughManager.for_queryset_class(RackQuerySet)()

    class Meta:
        verbose_name = _('Rack')
        verbose_name_plural = _('Racks')

    def save(self, *args, **kwargs):
        if not self.id:
            self.max_gap = self.total_units
        else:
            try:
                gaps = [g['height'] for g in self.find_gaps()]
            except:
                gaps = []
            self.max_gap = max(gaps) if len(gaps) else 0

        return super(Rack, self).save(*args, **kwargs)

    def find_gaps(self):
        last_unit = None
        gaps = []
        for unit in self.units.all().order_by('position'):
            # if first server/basket in the rack
            if last_unit is None:
                if unit.position > 1:
                    gaps.append({
                        'height': unit.position - 1,
                        'position': 1
                    })
            # otherwise
            else:
                last_unit_ends = last_unit.position + last_unit.unit_takes - 1
                # there is a gap between last unit and current
                if (unit.position - last_unit_ends) > 1:
                    gaps.append({
                        'height': unit.position - last_unit_ends - 1,
                        'position': last_unit_ends + 1
                    })
            last_unit = unit

        # does last server/basket in the rack take all units till rack bottom (floor)
        # or there is a gap there?
        if last_unit and \
           last_unit.position != self.total_units and \
           (last_unit.position + last_unit.unit_takes - 1) < self.total_units:
            last_unit_ends = last_unit.position + last_unit.unit_takes - 1
            gaps.append({
                'height': self.total_units - last_unit_ends,
                'position': last_unit_ends + 1
            })

        # in this case rack is empty
        elif last_unit is None:
            gaps.append({
                'height': self.total_units,
                'position': 1
            })

        return gaps

    def find_position_of_height(self, height):
        for gap in self.find_gaps():
            if gap['height'] >= height:
                return gap['position']

        raise RackIsFilled

    def mount(self, server=None, basket=None, position=None, height=None):
        if height is None:
            if server:
                height = server.get_height()
            elif basket:
                height = basket.get_height()
            else:
                raise ValueError('Specify <height> of server/basket to mount it.')

        if position is None:
            position = self.find_position_of_height(height)

        unit_kwargs = {
            'rack': self,
            'position': position,
        }
        if basket is not None:
            unit_kwargs['basket'] = basket
            unit_entity = basket
        elif server is not None:
            unit_kwargs['server'] = server
            unit_entity = server
        else:
            raise ValuerError('You cannot mount server and basket at the same time.')

        unit_entity.node = self.node
        unit_entity.rack = self
        unit_entity.save()

        return Unit.objects.get_or_create(**unit_kwargs)

    def unmount(self, server=None, basket=None):
        query = Q(rack=self)
        if basket is not None:
            query &= Q(basket=basket)
        elif server is not None:
            query &= Q(server=server)
        else:
            raise ValuerError('You cannot unmount server and basket at the same time.')
        Unit.objects.filter(query).delete()


class Unit(models.Model):
    """
        Описывает юнит
    """
    rack = models.ForeignKey(Rack, related_name='units')
    position = models.PositiveSmallIntegerField(default=1)
    basket = models.ForeignKey('Basket', blank=True, null=True)
    server = models.ForeignKey('Server', blank=True, null=True)

    class Meta:
        verbose_name = _('Unit')
        verbose_name_plural = _('Units')

    @property
    def unit_takes(self):
        if self.basket:
            return self.basket.get_height()

        elif self.server:
            return self.server.get_height()

        raise AttributeError

###############
 # # # # # # #
###############

class ComponentQuerySet(QuerySet):

    def of_kind(self, kind=None):
        if kind is None:
            return self.all()

        try:
            po = PropertyOption.objects.get(property__name='component.kind', name=kind)
        except PropertyOption.DoesNotExist:
            return self.none()

        return self.filter(kind=po)

    def with_state(self, state=None):
        if state is None or ComponentState.show_all(state):
            return self.all()

        if not ComponentState.is_valid(state):
            return self.none()

        return self.filter(state=state)


class Component(NamedModel):
    manufacturer = models.CharField(max_length=200)
    model_name = models.CharField(max_length=200)
    serial_number = models.CharField(max_length=200)
    state = FSMField(
        default=ComponentState.FREE,
        verbose_name=_('Component State'),
        choices=ComponentState.CHOICES,
        protected=False)
    server = models.ForeignKey(
        'Server',
        related_name='components',
        blank=True, null=True)
    kind = models.ForeignKey(
        'PropertyOption',
        related_name='kind_opts',
        limit_choices_to={'property__name': 'component.kind'})

    objects = PassThroughManager.for_queryset_class(ComponentQuerySet)()

    class Meta:
        verbose_name = _('Component')
        verbose_name_plural = _('Components')

    @transition(field=state, source=[ComponentState.FREE], target=ComponentState.INSTALLED)
    def install(self, server=None):
        """
            Install component.
        """
        self.server = server

    @transition(field=state, source=[ComponentState.INSTALLED], target=ComponentState.FREE)
    def uninstall(self):
        """
            Uninstall component.
        """
        self.server = None

    @transition(field=state, source='*', target=ComponentState.BROKEN)
    def broken(self):
        """
            Component is broken.
        """

    @property
    def properties_dict(self):
        ret = OrderedDict()
        values = self.property_values.all().order_by('property__position')

        for val in values:
            prop_value = val.get_value()
            if val.property.is_select_field:
                prop_value = prop_value.name

            ret[val.property.name] = prop_value

        return ret

    def is_installed(self):
        return self.state == ComponentState.INSTALLED

    def is_free(self):
        return self.state == ComponentState.FREE

    def is_broken(self):
        return self.state == ComponentState.BROKEN

    def is_uninstalled(self):
        return self.is_free() or self.is_broken()


class PropertyGroup(models.Model):
    """
    Groups component properties together.
    Can belong to several servers components, servers components can
    have several groups.
    **Attributes:**
    name
        The name of the property group.
    servers components
        The assigned servers components of the property group.

    """
    name = models.CharField(
        _(u"Name"),
        blank=True,
        max_length=50)
    components = models.ManyToManyField(
        Component,
        blank=True,
        verbose_name=_(u"Servers Components"),
        related_name="property_groups")
    position = models.IntegerField(
        _(u"Position"),
        default=1000)

    class Meta:
        ordering = ("position", )

    def __str__(self):
        return self.name


class PropertyQuerySet(QuerySet):

    def of_kind(self, kind=None):
        if kind is None:
            return self.all()

        return self.filter(name__startswith='{}.'.format(kind))


class Property(models.Model):
    """
        Represents a property of a server like cpu or hdd.
        A property has several ``PropertyOptions`` from which the user can choose
        (like 512mb, 1gb, 1tb).
        A property belongs to exactly one group xor server.
    """
    name = models.CharField(
        _(u"Name"),
        max_length=100)
    title = models.CharField(
        _(u"Title"),
        max_length=100)
    groups = models.ManyToManyField(
        PropertyGroup,
        verbose_name=_(u"Group"),
        blank=True,
        through="GroupsPropertiesRelation",
        related_name="properties")
    components = models.ManyToManyField(
        Component,
        verbose_name=_(u"Components"),
        blank=True,
        through="ComponentsPropertiesRelation",
        related_name="properties")
    position = models.IntegerField(
        _(u"Position"),
        blank=True, null=True)
    unit = models.CharField(
        _(u"Unit"),
        blank=True,
        max_length=15)

    type = models.PositiveSmallIntegerField(
        _(u"Type"),
        choices=PROPERTY_FIELD_CHOICES,
        default=PROPERTY_TEXT_FIELD)

    required = models.BooleanField(_(u"Required"), default=False)


    objects = PassThroughManager.for_queryset_class(PropertyQuerySet)()

    class Meta:
        verbose_name_plural = _(u"Properties")
        ordering = ["position"]

    def __str__(self):
        return self.name

    @property
    def is_select_field(self):
        return self.type == PROPERTY_SELECT_FIELD

    @property
    def is_text_field(self):
        return self.type == PROPERTY_TEXT_FIELD

    @property
    def is_number_field(self):
        return self.type == PROPERTY_NUMBER_FIELD

    def is_valid_value(self, value):
        """
        Returns True if given value is valid for this property.
        """
        if self.is_number_field:
            try:
                float(value)
            except ValueError:
                return False
        return True


@python_2_unicode_compatible
class GroupsPropertiesRelation(models.Model):
    """
    Represents the m:n relationship between Groups and Properties.
    This is done via an explicit class to store the position of the property
    within the group.
    **Attributes:**
    group
        The property group the property belongs to.
    property
        The property of question of the relationship.
    position
        The position of the property within the group.
    """
    group = models.ForeignKey(
        PropertyGroup,
        verbose_name=_(u"Group"),
        related_name="groupproperties")
    property = models.ForeignKey(
        Property,
        verbose_name=_(u"Property"),
        related_name="groupproperties")
    position = models.IntegerField(
        _(u"Position"),
        default=999)

    class Meta:
        ordering = ("position", )
        unique_together = ("group", "property")

    def __str__(self):
        return "Group:{} -> Property:{}".format(self.group.name, self.property.name)


class ComponentsPropertiesRelation(models.Model):
    """
    Represents the m:n relationship between Servers components and Properties.
    This is done via an explicit class to store the position of the property
    within the server component.
    **Attributes:**
    server component
        The server component of the relationship.
    property
        The property of the relationship.
    position
        The position of the property within the server component.
    """
    component = models.ForeignKey(
        Component,
        verbose_name=_(u"Components"),
        related_name="componentsproperties")
    property = models.ForeignKey(
        Property,
        verbose_name=_(u"Property"))
    position = models.IntegerField(
        _(u"Position"),
        default=999)

    class Meta:
        ordering = ("position", )
        unique_together = ("component", "property")


@python_2_unicode_compatible
class PropertyOption(models.Model):
    """
    Represents a choosable option of a ``Property`` like red, green, blue.
    **Attributes:**
    property
        The property to which the option belongs
    name
        The name of the option
    position
        The position of the option within the property
    """
    property = models.ForeignKey(
        Property,
        verbose_name=_(u"Property"),
        related_name="options")
    name = models.CharField(
        _(u"Name"),
        max_length=100)
    position = models.IntegerField(
        _(u"Position"),
        default=99)


    class Meta:
        ordering = ["position"]

    def __str__(self):
        return self.name


@python_2_unicode_compatible
class ComponentPropertyValue(models.Model):
    """
    Stores the value resp. selected option of a server component/property combination.
    This is some kind of EAV.
    **Attributes:**
    server component
        The server component for which the value is stored.
    property
        The property for which the value is stored.
    property_group
        The property group for which the value is stored, if none then it's a local property
    value
        The value for the server component/property pair. Dependent of the property
        type the value is either a number, a text or an id of an option.
    """
    component = models.ForeignKey(
        Component,
        verbose_name=_(u"Component"),
        related_name="property_values")
    property = models.ForeignKey(
        Property,
        verbose_name=_(u"Property"),
        related_name="property_values")
    property_group = models.ForeignKey(
        PropertyGroup,
        verbose_name=_(u"Property group"),
        blank=True, null=True,
        related_name="property_values")
    value = models.CharField(
        _(u"Value"),
        blank=True,
        max_length=100)
    value_as_float = models.FloatField(
        _(u"Value as float"),
        blank=True, null=True)
    option = models.ForeignKey(
        PropertyOption,
        blank=True, null=True)


    class Meta:
        unique_together = ("component", "property", "property_group", "value")

    def __str__(self):
        property_group_name = self.property_group.name if self.property_group_id else ''
        return u"{}/{}/{}: {}".format(self.component.get_name(),
                                      property_group_name,
                                      self.property.name,
                                      self.value)

    def save(self, *args, **kwargs):
        if self.option:
            self.value = self.option.pk
            self.value_as_float = self.option.pk
        else:
            try:
                float(self.value)
            except ValueError:
                pass
            else:
                self.value_as_float = self.value

        super(ComponentPropertyValue, self).save(*args, **kwargs)

    def get_value(self):
        if self.property.is_select_field:
            return self.option
        elif self.property.is_number_field:
            return self.value_as_float
        else:
            return self.value


class ServerTemplate(NamedModel):
    cpu_socket = models.ForeignKey(
        PropertyOption,
        related_name='cpu_socket_opts',
        limit_choices_to={'property__name': 'cpu.socket'})

    cpu_qty = models.PositiveSmallIntegerField(default=1)

    ram_standard = models.ForeignKey(
        PropertyOption,
        related_name='ram_standard_opts',
        limit_choices_to={'property__name': 'ram.standard'})

    ram_qty = models.PositiveSmallIntegerField(default=1)

    unit_takes = models.PositiveSmallIntegerField(
        verbose_name=_('height in units'),
        default=1)


    class Meta:
        verbose_name = _('Server Template')
        verbose_name_plural = _('Servers Templates')

    def get_height(self):
        return self.unit_takes


class ServerTemplateHdd(models.Model):
    template = models.ForeignKey(
        ServerTemplate,
        related_name='hdds')
    hdd_qty = models.PositiveSmallIntegerField(default=1)
    hdd_form_factor = models.ForeignKey(
        PropertyOption,
        related_name='form_factor_opts',
        limit_choices_to={'property__name': 'hdd.form_factor'})
    hdd_connection_type = models.ForeignKey(
        PropertyOption,
        related_name='conn_type_opts',
        limit_choices_to={'property__name': 'hdd.connection_type'})


    class Meta:
        unique_together = ('template', 'hdd_form_factor', 'hdd_connection_type')


class Server(NamedModel):
    node = models.ForeignKey(Node,
        related_name='servers',
        blank=True, null=True)
    rack = models.ForeignKey(Rack,
        related_name='servers',
        blank=True, null=True)
    basket = models.ForeignKey(
        'Basket',
        related_name='servers',
        blank=True, null=True)
    template = models.ForeignKey(
        ServerTemplate,
        related_name='servers')

    @property
    def slot_takes(self):
        """
        На текущий момент поддерживаются только blade-сервера размером в 1 слот.

        TODO: возможно blade-сервера могут занимать несколько слотов в корзине.
            В тоже время корзина может представлять из себя двумерный массив:
            ___________________
            |  1  |  2  |  3  |
            -------------------
            |  4  |  5  |  6  |
            -------------------
            В этом случае нужно знать:
            - поддерживает ли корзина размещение blade-серверов в несколько слотов;
            - какие слоты возможно объединить: (1, 2) или (1, 4).

        """
        return 1

    def get_height(self):
        if self.basket:
            return self.basket.get_height()

        return self.template.get_height()

    def install_component(self, component):
        if component.is_installed():
            raise ComponentAlreadyInstalled

        if component.is_broken():
            raise ComponentIsBroken

        component.install(server=self)
        component.save()

    def uninstall_component(self, component):
        if component.is_free():
            raise ComponentNotInstalled

        component.uninstall()
        component.save()

    def install_components(self, components):
        map(self.install_component, components)

    def uninstall_components(self, components):
        map(self.uninstall_component, components)

    def get_installed_components(self):
        return self.components.filter(state=ComponentState.INSTALLED)

    def find_all_valid_components(self):
        tmpl = self.template
        cpu_socket_prop = Property.objects.get(name='cpu.socket')
        ram_standard_prop = Property.objects.get(name='ram.standard')
        hdd_connection_type_prop = Property.objects.get(name='hdd.connection_type')
        hdd_form_factor_prop = Property.objects.get(name='hdd.form_factor')

        cpu_socket = tmpl.cpu_socket
        ram_standard = tmpl.ram_standard
        hdd_connection_type = []
        hdd_form_factor = []
        for hdd in tmpl.hdds.all():
            hdd_connection_type.append(hdd.hdd_connection_type)
            hdd_form_factor.append(hdd.hdd_form_factor)

        query = (Q(property=cpu_socket_prop)&Q(option=cpu_socket))
        query |= (Q(property=ram_standard_prop)&Q(option=ram_standard))
        query |= (Q(property=hdd_connection_type_prop)&Q(option__in=hdd_connection_type))
        query |= (Q(property=hdd_form_factor_prop)&Q(option__in=hdd_form_factor))

        component_ids = ComponentPropertyValue.objects\
                    .values_list('component', flat=True)\
                    .select_related('component')\
                    .filter(query)

        return Component.objects.filter(state=ComponentState.FREE, id__in=component_ids)

    def find_valid_cpu_components(self):
        raise NotImplemented

    def find_valid_hdd_components(self):
        raise NotImplemented

    def find_valid_ram_components(self):
        raise NotImplemented

    def find_valid_raid_components(self):
        raise NotImplemented

    def find_valid_net_components(self):
        raise NotImplemented


class Basket(NamedModel):
    node = models.ForeignKey(Node,
        related_name='baskets',
        blank=True, null=True)
    rack = models.ForeignKey(Rack,
        related_name='baskets',
        blank=True, null=True)
    slot_qty = models.PositiveSmallIntegerField(
        verbose_name=_('Total slots Qty'),
        default=8)
    unit_takes = models.PositiveSmallIntegerField(
        verbose_name=_('height in units'),
        default=1)

    def get_height(self):
        return self.unit_takes

    def validate_position(self, position):
        if self.slots.filter(position=position).exists():
            raise BasketSlotIsBusy

    def mount(self, server=None, position=None, slots_takes=None):
        if slots_takes is None:
            slots_takes = server.slot_takes

        if position is None:
            position = self.find_free_position(slots_takes)

        self.validate_position(position)

        server.basket = self
        server.node = self.node
        server.rack = self.rack
        server.save()

        slot_kwargs = {
            'basket': self,
            'position': position,
            'server': server,
        }
        return BasketSlot.objects.get_or_create(**slot_kwargs)

    def unmount(self, server=None):
        server.node = None
        server.rack = None
        server.basket = None
        server.save()

        BasketSlot.objects\
            .filter(basket=self, server=server)\
            .delete()

    def find_gaps(self):
        last_slot = None
        gaps = []
        for slot in self.slots.all().order_by('position'):
            # if first server in the slot
            if last_slot is None:
                if slot.position > 1:
                    gaps.append({
                        'slots': slot.position - 1,
                        'position': 1
                    })
            # otherwise
            else:
                last_slot_ends = last_slot.position + last_slot.slot_takes - 1
                # there is a gap between last slot and current
                if (slot.position - last_slot_ends) > 1:
                    gaps.append({
                        'slots': slot.position - last_slot_ends - 1,
                        'position': last_slot_ends + 1
                    })
            last_slot = slot

        # does last server in the basket take all slots till basket bottom
        # or there is a gap there?
        if last_slot and \
           last_slot.position != self.slot_qty and \
           (last_slot.position + last_slot.slot_takes - 1) < self.slot_qty:
            last_slot_ends = last_slot.position + last_slot.slot_takes - 1
            gaps.append({
                'slots': self.slot_qty - last_slot_ends,
                'position': last_slot_ends + 1
            })

        # in this case basket is empty
        elif last_slot is None:
            gaps.append({
                'slots': self.slot_qty,
                'position': 1
            })

        return gaps

    def find_free_position(self, slots_takes=1):
        if slots_takes > 1:
            raise NotImplemented

        gaps = self.find_gaps()
        if not len(gaps):
            raise BasketIsFilled

        return gaps[0]['position']


class BasketSlot(models.Model):
    """
        Описывает слот (ячейку) в корзине
    """
    basket = models.ForeignKey(Basket, related_name='slots')
    position = models.PositiveSmallIntegerField(default=1)
    server = models.ForeignKey(Server)

    class Meta:
        verbose_name = _('Basket slot')
        verbose_name_plural = _('Baskets slots')
        unique_together = ('basket', 'server')

    @property
    def slot_takes(self):
        return self.server.slot_takes

if False:
    # сломал, удалив m2m в Server
    def server_components_changed(sender, **kwargs):
        action = kwargs['action']
        if action not in ('post_add', 'post_remove'):
            return

        if not kwargs['reverse']:
            server = kwargs['instance']
            components = Component.objects.filter(pk__in=kwargs['pk_set'])
        else:
            components = [kwargs['instance']]
            if len(kwargs['pk_set']) > 1:
                raise ValueError('Component cannot belong to multiple servers.')
            server = Server.objects.get(pk=kwargs['pk_set'][0])

        if action == 'post_add':
            for component in components:
                try:
                    server.install_component(component)
                except (ComponentIsBroken, ComponentAlreadyInstalled):
                    pass
        elif action == 'post_remove':
            for component in components:
                try:
                    server.uninstall_component(component)
                except ComponentNotInstalled:
                    pass
    m2m_changed.connect(server_components_changed, sender=Server.components.through)


def unit_saved(sender, instance, **kwargs):
    rack = instance.rack
    gaps = [g['height'] for g in rack.find_gaps()]
    rack.max_gap = max(gaps) if len(gaps) else 0
    rack.save()
post_save.connect(unit_saved, sender=Unit)
pre_delete.connect(unit_saved, sender=Unit)
