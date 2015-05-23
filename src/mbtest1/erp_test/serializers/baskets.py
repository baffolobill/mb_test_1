# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import serializers

from . import generics
from ..models import Basket


class BasketSerializer(serializers.HyperlinkedModelSerializer):
    node = generics.SimpleNodeModelSerializer(many=False, read_only=True)
    floor = generics.SimpleFloorModelSerializer(many=False, read_only=True)
    room = generics.SimpleRoomModelSerializer(many=False, read_only=True)
    row = generics.SimpleRowModelSerializer(many=False, read_only=True)
    rack = generics.SimpleRackModelSerializer(many=False, read_only=False, required=False)

    class Meta:
        model = Basket
        fields = ('id', 'name', 'slot_qty', 'unit_takes',
                  'node', 'floor', 'room', 'row', 'rack', 'href')
        extra_kwargs = {
            'id': {'read_only': True},
            'href': {'read_only': True},
        }

    def create(self, validated_data):
        rack = validated_data.pop('rack', None)
        if rack:
            validated_data['rack_id'] = rack['id']
        return Basket.objects.create(**validated_data)

    def update(self, instance, validated_data):
        rack = validated_data.pop('rack', None)
        if rack:
            instance.rack_id = rack['id']
        else:
            instance.rack = None
        return super(BasketSerializer, self).update(instance, validated_data)
