from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from ..models import Component, PropertyOption
from ..defaults import ComponentState


class ComponentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Component
        fields = ('id', 'name', 'manufacturer', 'model_name',
                  'serial_number', 'kind', 'state')#, 'properties_dict')
        extra_kwargs = {
            'kind': {'required': False},
        }

    def create(self, validated_data):
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

        return super(ComponentSerializer, self).create(validated_data)


if False:
    class ComponentSerializer(serializers.Serializer):
        id = serializers.IntegerField(read_only=True)
        name = serializers.CharField(max_length=200)
        manufacturer = serializers.CharField(max_length=200)
        model_name = serializers.CharField(max_length=200)
        serial_number = serializers.CharField(max_length=200)
        state = serializers.ChoiceField(choices=ComponentState.CHOICES)

        def __init__(self, *args, **kwargs):
            super(ComponentSerializer, self).__init__(*args, **kwargs)

            self.fields['kind'] = serializers.ChoiceField(choices=self._get_kind_choices())
            self.fields['properties_dict'] = serializers.DictField(child=serializers.CharField(), read_only=True)

        def _get_kind_choices(self):
            return PropertyOption.objects.values_list('id', 'name')\
                .filter(property__name='global.kind').order_by('position')

        def to_representation(self, value):
            return {
                'id': value.pk,
                'name': value.name,
                'manufacturer': value.manufacturer,
                'model_name': value.model_name,
                'serial_number': value.serial_number,
                'state': value.state,
                'kind': value.get_kind_str(),
                'properties': value.properties_dict,
            }

        def create(self, validated_data):
            inst = Component.objects.create(
                name=validated_data.get('name'),
                manufacturer=validated_data.get('manufacturer'),
                model_name=validated_data.get('model_name'),
                serial_number=validated_data.get('serial_number'),
                state=validated_data.get('state'))
            inst.set_kind(validated_data.get('kind'))

            return inst

        if False:

            def update(self, instance, validated_data):
                instance.email = validated_data.get('email', instance.email)
                instance.content = validated_data.get('content', instance.content)
                instance.created = validated_data.get('created', instance.created)
                instance.save()
                return instance
