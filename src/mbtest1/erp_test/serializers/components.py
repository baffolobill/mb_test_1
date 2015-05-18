# coding: utf-8
from collections import OrderedDict

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from ..models import (
    Component, PropertyOption, PropertyGroup,
    ComponentPropertyValue, Property)
from ..defaults import ComponentState
from .servers import ServerSerializer

class ComponentPropertySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    title = serializers.CharField()
    type = serializers.CharField()
    value = serializers.CharField()

    #def to_representation(self, instance):
    #    pass

    #def to_internal_value(self, data):
    #    pass

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass


class ComponentKindSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyOption
        fields = ('id', 'name')


class ComponentSerializer(serializers.HyperlinkedModelSerializer):
    kind = ComponentKindSerializer(many=False, read_only=False)
    server = ServerSerializer(many=False, read_only=True)

    class Meta:
        model = Component
        fields = ('id', 'name', 'manufacturer', 'model_name',
                  'serial_number', 'kind', 'state', 'server', 'href')
        extra_kwargs = {
            'kind': {'required': False},
            'href': {'read_only': True},
        }

    def _get_properties_for_kind(self, kind):
        try:
            group = PropertyGroup.objects.get(name=kind.name)
        except PropertyGroup.DoesNotExist:
            # There are no properties for the kind.
            return []

        return group.properties.all()

    def _get_properties_values_of_object(self, properties, instance):
        values = ComponentPropertyValue.objects\
                    .select_related('option', 'property')\
                    .filter(property__in=properties, component=instance)

        prop_value_map = {}
        for item in values:
            if item.property.is_text_field:
                real_value = item.value
            elif item.property.is_number_field:
                real_value = item.value_as_float
            elif item.property.is_select_field:
                real_value = {
                    'id': item.option_id,
                    'name': item.option.name
                }
            else:
                continue
            prop_value_map[item.property_id] = real_value

        return prop_value_map

    def _get_kind_by_id(self, kind_id):
        try:
            kind_option = PropertyOption.objects\
                            .get(property__name='component.kind', id=kind_id)
        except PropertyOption.DoesNotExist:
            raise ValueError('Passed unsupported <kind>.')

        return kind_option

    def to_representation(self, instance):
        ret = super(ComponentSerializer, self).to_representation(instance)

        ret['properties'] = []
        properties = self._get_properties_for_kind(instance.kind)
        prop_values = self._get_properties_values_of_object(properties, instance)
        for prop in properties:
            ret['properties'].append({
                'id': prop.pk,
                'name': prop.name,
                'title': prop.title,
                'type': prop.type,
                'type_str': prop.get_type_display(),
                'value': prop_values.get(prop.pk, None),
            })
        return ret

    def to_internal_value(self, data):
        uri_kind = self.context['view'].kwargs.get('kind', None)
        component_id = self.context['view'].kwargs.get('pk', None)
        if uri_kind is not None:
            try:
                po = PropertyOption.objects.get(name=uri_kind, property__name='component.kind')
            except PropertyOption.DoesNotExist:
                raise ValidationError({
                        'kind': 'Specified unsupported component <kind>.'
                    })
            else:
                data['kind'] = po.pk
        elif component_id is not None:
            try:
                component = Component.objects.get(id=component_id)
            except Component.DoesNotExist:
                raise ValidationError({
                        'kind': 'Cannot find out component kind, because there is no component with given ID.'
                    })
            else:
                data['kind'] = component.kind_id


        # validate kind of component
        try:
            kind = self._get_kind_by_id(data.get('kind', 0))
        except ValueError as exc:
            raise ValidationError({
                'kind': str(exc)
                })

        # validate properties
        is_properties_required = self.context['request'].method.lower() in ('post', 'put')
        valid_properties = []
        properties = data.pop('properties', None)
        if is_properties_required:
            if not properties:
                raise ValidationError({
                    'properties': 'This field is required.'
                    })
            if not isinstance(properties, (list, tuple)):
                raise ValidationError({
                    'properties': 'Invalid format. Must be: [{property_id: ..., value: ...}, ...]'
                    })

            ## performance improvement
            property_bulk = dict([(p.pk, p) for p in self._get_properties_for_kind(kind)])
            options = PropertyOption.objects.filter(property__in=property_bulk.keys())
            option_bulk = {}
            for option in options:
                option_bulk.setdefault(option.property_id, {})[option.pk] = option

            for item in properties:
                if not isinstance(item, dict):
                    raise ValidationError({
                        'properties': 'Invalid item format. Must be: {property_id: ..., value: ...}'
                    })
                if 'property_id' not in item:
                    raise ValidationError({
                        'properties': 'Item must contain <propety_id> key/value.'
                    })
                if 'value' not in item:
                    raise ValidationError({
                        'properties': 'Item must contain <avlue> key/value.'
                    })
                try:
                    property_id = int(item['property_id'])
                except ValueError:
                    raise ValidationError({
                        'properties': '<property_id> must be valid integer type.'
                        })
                prop = property_bulk.get(property_id, None)
                if not prop:
                    raise ValidationError({
                        'properties': 'Specified property <{}> is not in the list of Component:{} properties.'.format(
                                            prop.name, kind.name)
                        })
                value = item['value']
                if prop.required and not value:
                    raise ValidationError({
                        'properties': 'Property:{} is required.'.format(prop.name)
                        })
                if prop.is_text_field:
                    valid_properties.append({'property': prop, 'value': value})
                elif prop.is_number_field:
                    try:
                        value = int(value)
                    except ValueError:
                        raise ValidationError({
                            'properties': 'Property:{} require valid number value.'.format(prop.name)
                            })
                    else:
                        valid_properties.append({'property': prop, 'value': value})
                elif prop.is_select_field:
                    try:
                        value = int(value)
                    except ValueError:
                        raise ValidationError({
                            'properties': 'Value of fields with select type must be valid integer.'
                            })
                    if value not in option_bulk[prop.pk]:
                        raise ValidationError({
                            'properties': 'Specified value is not in the list of the property options.'
                            })
                    value = option_bulk[prop.pk][value]
                    valid_properties.append({'property': prop, 'value': value})
                else:
                    raise ValidationError({
                        'properties': 'Serializer does not support the Property:{} type.'.format(prop.name)
                        })

        ret = super(ComponentSerializer, self).to_internal_value(data)
        ret['properties'] = valid_properties
        return ret

    def create(self, validated_data):
        properties = validated_data.pop('properties', None)
        kind = self.context['view'].kwargs.get('kind', None)
        if kind is not None:
            try:
                kind_option = PropertyOption.objects.get(property__name='component.kind', name=kind)
            except PropertyOption.DoesNotExist:
                raise ValidationError({
                    'kind': 'Specified <kind> does not in the list of possible values.'
                })
            validated_data['kind'] = kind_option
        else:
            if 'kind' not in validated_data:
                raise ValidationError({
                    'kind': 'This field is required.'
                })

        if properties is None:
            raise ValidationError({
                'properties': 'This field is required.'
                })

        instance = super(ComponentSerializer, self).create(validated_data)
        prop_bulk_create = []
        property_group = PropertyGroup.objects.get(name=validated_data['kind'].name)
        for item in properties:
            kwargs = {
                'component': instance,
                'property': item['property'],
                'property_group': property_group,
            }
            if item['property'].is_select_field:
                kwargs.update({
                    'option': item['value'],
                    'value': item['value'].pk,
                    'value_as_float': item['value'].pk
                })
            else:
                kwargs.update({
                    'value': item['value'],
                    'value_as_float': item['value']
                })
            prop_bulk_create.append(ComponentPropertyValue(**kwargs))
        if len(prop_bulk_create):
            ComponentPropertyValue.objects.bulk_create(prop_bulk_create)
        return instance

    def update(self, instance, validated_data):
        properties = validated_data.pop('properties', None)

        if 'kind' in validated_data and \
           instance.kind != validated_data['kind']:
            raise ValidationError({
                'kind': 'You cannot change Component kind. Use delete/create instead.'
                })

        for k,v in validated_data.items():
            setattr(instance, k, v)
        instance.save()

        values = ComponentPropertyValue.objects.filter(component=instance)
        values_bulk = dict([(v.property_id, v) for v in values])
        bulk_create = []
        property_group = PropertyGroup.objects.get(name=validated_data['kind'].name)
        for item in properties:
            current_value = values_bulk.get(item['property'].pk, None)
            if current_value is None:
                kwargs = {
                    'component': instance,
                    'property': item['property'],
                    'property_group': property_group,
                }
                if item['property'].is_select_field:
                    kwargs.update({
                        'option': item['value'],
                        'value': item['value'].pk,
                        'value_as_float': item['value'].pk
                    })
                else:
                    kwargs.update({
                        'value': item['value'],
                        'value_as_float': item['value']
                    })
                bulk_create.append(ComponentPropertyValue(**kwargs))
            else:
                if item['property'].is_select_field:
                    current_value.option = item['value']
                else:
                    current_value.value = item['value']
                current_value.save()
        if len(bulk_create):
            ComponentPropertyValue.objects.bulk_create(bulk_create)
        return instance
