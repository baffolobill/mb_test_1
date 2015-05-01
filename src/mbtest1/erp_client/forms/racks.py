# coding: utf-8
from django import forms
from django.utils.translation import ugettext as _

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Div, Submit, HTML, Button, Row, Field
from crispy_forms.bootstrap import AppendedText, PrependedText, FormActions

from erp_test.models import Rack, Basket, Server
from erp_test.exceptions import RackUnitIsBusy


class RackFullness(object):
    ALL = 'all'
    EMPTY = 'empty'
    HAS_EMPTY = 'has_empty'
    FILLED = 'filled'
    HAS_EMPTY_HEIGHT = 'has_empty_height'

    CHOICES = [
        (ALL, _('All')),
        (EMPTY, _('Empty')),
        (HAS_EMPTY, _('Has empty units')),
        (HAS_EMPTY_HEIGHT, _('Has empty with min height of')),
        (FILLED, _('FIlled')),
    ]


class RackForm(forms.ModelForm):

    helper = FormHelper()
    helper.form_class = 'form-horizontal'
    helper.layout = Layout(
        Div(
            Div('name'),
            css_class='row-fluid'
        ),
        Div(
            Div('row'),
            css_class='row-fluid'
        ),
        Div(
            Div('total_units'),
            css_class='row-fluid'
        ),

        FormActions(
            Submit('save_changes', _('Save changes'), css_class="btn-primary"),
            Submit('cancel', 'Cancel'),
        )
    )

    class Meta:
        model = Rack
        fields = ('name', 'row', 'total_units')


class RackFilterForm(forms.Form):
    fullness = forms.ChoiceField(
        choices=RackFullness.CHOICES,
        required=False)
    height = forms.IntegerField(
        label=_('Min gap height'),
        min_value=1,
        required=False)


class RackBasketForm(forms.Form):

    basket = forms.ChoiceField(
        choices=[('', 'Choose a basket')],
        required=True,
        help_text='displayed only unmounted baskets which can fit to the rack')
    position = forms.IntegerField(
        required=False,
        min_value=1)

    def __init__(self, *args, **kwargs):
        self.rack = kwargs.pop('rack', None)
        self.basket = kwargs.pop('basket', None)
        super(RackBasketForm, self).__init__(*args, **kwargs)
        if self.rack:
            baskets = Basket.objects.uninstalled().filter(unit_takes__lte=self.rack.max_gap)
            if self.basket:
                baskets = list(baskets.exclude(id=self.basket.pk))
                baskets.insert(0, self.basket)
            self.fields['basket'].choices += [
                (b.id, b.get_name())
                for b in baskets
            ]

        self.helper = FormHelper()
        self.helper.form_tag = False
        self.helper.form_class = 'form-horizontal'
        self.helper.layout = Layout(
            Div(
                Div('basket'),
                css_class='row-fluid'
            ),
            Div(
                Div('position'),
                css_class='row-fluid'
            ),

            FormActions(
                Submit('save_changes', _('Save changes'), css_class="btn-primary"),
                Submit('cancel', 'Cancel'),
            )
        )

    def clean_position(self):
        pos = self.cleaned_data.get('position', None)
        if not pos:
            return pos

        if pos > self.rack.total_units:
            raise forms.ValidationError(_('Rack has only {} units.').format(self.rack.total_units), code='invalid')

        try:
            self.rack.validate_position(pos)
        except RackUnitIsBusy:
            raise forms.ValidationError(_('This unit already taken.'), code='invalid')

        return pos

    def clean(self):
        cd = super(RackBasketForm, self).clean()
        basket_id = cd.get('basket')
        position = cd.get('position')
        if basket_id:
            try:
                basket = Basket.objects.get(id=basket_id)
            except Basket.DoesNotExist:
                self.add_error('basket', _('There is no Basket with ID:{}').format(basket_id))
            else:
                if position:
                    is_position_ok = False
                    for gap in self.rack.find_gaps():
                        gap_start = gap['position']
                        gap_end = gap_start + gap['position'] - 1
                        if position >= gap_start and (position+basket.get_height()-1)<=gap_end:
                            is_position_ok = True
                            break
                    if not is_position_ok:
                        self.add_error('position',
                                       _('Basket height is greater than the gap at the'
                                         ' selected position. Basket height is {}. Gap'
                                         ' size is {}.').format(basket.get_height(), gap['height']))
        return cd


class RackServerForm(forms.Form):
    server = forms.ChoiceField(
        choices=[('', 'Choose a server')],
        required=True,
        help_text='displayed only unmounted servers which can fit to the rack')
    position = forms.IntegerField(
        required=False,
        min_value=1)

    def __init__(self, *args, **kwargs):
        self.rack = kwargs.pop('rack', None)
        self.server = kwargs.pop('server', None)
        super(RackServerForm, self).__init__(*args, **kwargs)

        servers = Server.objects.uninstalled().filter(template__unit_takes__lte=self.rack.max_gap)
        if self.server:
            servers = list(servers.exclude(id=self.server.pk))
            servers.insert(0, self.server)
        self.fields['server'].choices += [
            (s.id, s.get_name())
            for s in servers
        ]

        self.helper = FormHelper()
        self.helper.form_tag = False
        self.helper.form_class = 'form-horizontal'
        self.helper.layout = Layout(
            Div(
                Div('server'),
                css_class='row-fluid'
            ),
            Div(
                Div('position'),
                css_class='row-fluid'
            ),

            FormActions(
                Submit('save_changes', _('Save changes'), css_class="btn-primary"),
                Submit('cancel', 'Cancel'),
            )
        )

    def clean_position(self):
        pos = self.cleaned_data.get('position', None)
        if not pos:
            return pos

        if pos > self.rack.total_units:
            raise forms.ValidationError(_('Rack has only {} units.').format(self.rack.total_units), code='invalid')

        try:
            self.rack.validate_position(pos)
        except RackUnitIsBusy:
            raise forms.ValidationError(_('This unit already taken.'), code='invalid')

        return pos

    def clean(self):
        cd = super(RackServerForm, self).clean()
        server_id = cd.get('server')
        position = cd.get('position')
        if server_id:
            try:
                server = Server.objects.get(id=server_id)
            except Server.DoesNotExist:
                self.add_error('server', _('There is no Server with ID:{}').format(server_id))
            else:
                if position:
                    is_position_ok = False
                    for gap in self.rack.find_gaps():
                        gap_start = gap['position']
                        gap_end = gap_start + gap['position'] - 1
                        if position >= gap_start and (position+server.get_height()-1)<=gap_end:
                            is_position_ok = True
                            break

                    if not is_position_ok:
                        self.add_error('position',
                                       _('Server height is greater than the gap at the'
                                         ' selected position. Server height is {}. Gap'
                                         ' size is {}.').format(server.get_height(), gap['height']))
        return cd
