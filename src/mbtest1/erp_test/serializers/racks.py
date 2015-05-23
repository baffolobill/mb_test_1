# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import serializers

from . import generics
from ..models import Rack, Row


class RackSerializer(serializers.HyperlinkedModelSerializer):
    node = generics.SimpleNodeModelSerializer(many=False, read_only=True)
    floor = generics.SimpleFloorModelSerializer(many=False, read_only=True)
    room = generics.SimpleRoomModelSerializer(many=False, read_only=True)
    row = generics.SimpleRowModelSerializer(many=False, read_only=False)

    class Meta:
        model = Rack
        fields = ('id', 'name', 'max_gap', 'total_units', 'row',
                  'node', 'href', 'floor', 'room')
        extra_kwargs = {
            'id': {'read_only': True},
            'href': {'read_only': True},
            'max_gap': {'read_only': True},
        }

    def create(self, validated_data):
        validated_data['row_id'] = validated_data.pop('row')['id']
        return Rack.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data['row_id'] = validated_data.pop('row')['id']
        return super(RackSerializer, self).update(instance, validated_data)
