from collections import OrderedDict

from rest_framework import serializers

from ..models import ServerTemplate, ServerTemplateHdd, PropertyOption


class ServerTemplatePropertyOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyOption
        fields = ('id', 'name')


class ServerTemplateHddSerializer(serializers.ModelSerializer):
    hdd_form_factor = ServerTemplatePropertyOptionSerializer(many=False, read_only=False)
    hdd_connection_type = ServerTemplatePropertyOptionSerializer(many=False, read_only=False)

    class Meta:
        model = ServerTemplateHdd
        fields = ('id', 'hdd_form_factor', 'hdd_connection_type', 'hdd_qty')


class ServerTemplateSerializer(serializers.HyperlinkedModelSerializer):
    hdds = ServerTemplateHddSerializer(many=True)
    cpu_socket = ServerTemplatePropertyOptionSerializer(many=False, read_only=False)
    ram_standard = ServerTemplatePropertyOptionSerializer(many=False, read_only=False)

    class Meta:
        model = ServerTemplate
        fields = ('id', 'name', 'servers_uses', 'href',
                  'cpu_socket', 'cpu_qty', 'unit_takes',
                  'ram_standard', 'ram_qty', 'hdds'
                  )
        extra_kwargs = {
            'id': {'read_only': True},
            'href': {'read_only': True},
            'servers_uses': {'read_only': True},
        }

    def to_internal_value(self, data):
        ret = {
            'name': data.get('name'),
            'unit_takes': data.get('unit_takes'),
            'cpu_socket_id': data.get('cpu_socket'),
            'cpu_qty': data.get('cpu_qty'),
            'ram_standard_id': data.get('ram_standard'),
            'ram_qty': data.get('ram_qty'),
        }

        hdds = data.get('hdds')
        if hdds:
            for hdd in hdds:
                hdd['hdd_form_factor_id'] = hdd['hdd_form_factor']
                hdd['hdd_connection_type_id'] = hdd['hdd_connection_type']
                del hdd['hdd_form_factor']
                del hdd['hdd_connection_type']
            ret['hdds'] = hdds
        return ret

    def create(self, validated_data):
        hdds = validated_data.pop('hdds', None)
        server_template = ServerTemplate.objects.create(**validated_data)
        for hdd in hdds:
            hdd['template'] = server_template
            ServerTemplateHdd.objects.create(**hdd)

        return server_template

    def update(self, instance, validated_data):
        hdds = validated_data.pop('hdds', None)

        for k,v in validated_data.items():
            setattr(instance, k, v)

        if hdds is not None:
            instance.hdds.all().delete()
            for hdd in hdds:
                hdd['template'] = instance
                ServerTemplateHdd.objects.create(**hdd)

        instance.save()
        return instance
