# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import serializers

from . import generics
from ..models import ServerTemplate, ServerTemplateHdd


class ServerTemplateHddSerializer(serializers.ModelSerializer):
    hdd_form_factor = generics.SimplePropertyOptionModelSerializer(many=False, read_only=False)
    hdd_connection_type = generics.SimplePropertyOptionModelSerializer(many=False, read_only=False)

    class Meta:
        model = ServerTemplateHdd
        fields = ('id', 'hdd_form_factor', 'hdd_connection_type', 'hdd_qty')
        extra_kwargs = {
            'id': {'read_only': True},
        }


class ServerTemplateSerializer(serializers.HyperlinkedModelSerializer):
    hdds = ServerTemplateHddSerializer(many=True, required=True)
    cpu_socket = generics.SimplePropertyOptionModelSerializer(many=False, read_only=False)
    ram_standard = generics.SimplePropertyOptionModelSerializer(many=False, read_only=False)

    class Meta:
        model = ServerTemplate
        fields = ('id', 'name', 'servers_uses', 'href', 'unit_takes',
                  'cpu_socket', 'cpu_qty',
                  'ram_standard', 'ram_qty',
                  'hdds'
                  )
        extra_kwargs = {
            'id': {'read_only': True},
            'href': {'read_only': True},
            'servers_uses': {'read_only': True},
        }

    def to_internal_value(self, data):
        ret = super(ServerTemplateSerializer, self).to_internal_value(data)
        ret['cpu_socket_id'] = ret.pop('cpu_socket')['id']
        ret['ram_standard_id'] = ret.pop('ram_standard')['id']

        hdds = data.get('hdds', [])
        for hdd in hdds:
            hdd['hdd_form_factor_id'] = hdd.pop('hdd_form_factor')
            hdd['hdd_connection_type_id'] = hdd.pop('hdd_connection_type')
        ret['hdds'] = hdds
        return ret

    def _create_hdds(self, server_template, hdds):
        bulk_hdd_create = []
        for hdd in hdds:
            hdd['template'] = server_template
            bulk_hdd_create.append(ServerTemplateHdd(**hdd))
        if len(bulk_hdd_create):
            ServerTemplateHdd.objects.bulk_create(bulk_hdd_create)

    def create(self, validated_data):
        hdds = validated_data.pop('hdds')
        server_template = ServerTemplate.objects.create(**validated_data)
        self._create_hdds(server_template, hdds)
        return server_template

    def update(self, instance, validated_data):
        hdds = validated_data.pop('hdds')
        map(lambda (k,v): setattr(instance, k, v), validated_data.items())
        instance.save()
        instance.hdds.all().delete()
        self._create_hdds(instance, hdds)
        return instance
