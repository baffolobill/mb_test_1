from collections import OrderedDict

from rest_framework import serializers

from ..models import ServerTemplate, ServerTemplateHdd


class ServerTemplateHddSerializer(serializers.ModelSerializer):

    class Meta:
        model = ServerTemplateHdd
        fields = ('hdd_form_factor', 'hdd_connection_type', 'hdd_qty')


class ServerTemplateSerializer(serializers.ModelSerializer):
    hdds = ServerTemplateHddSerializer(many=True)

    class Meta:
        model = ServerTemplate
        fields = ('id', 'name', 'cpu_socket', 'cpu_qty', 'unit_takes',
                  'ram_standard', 'ram_qty', 'hdds')

    def create(self, validated_data):
        hdds = validated_data.pop('hdds')
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
