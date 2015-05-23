# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import serializers

from . import generics
from ..models import Room, Floor


class RoomSerializer(serializers.HyperlinkedModelSerializer):
    node = generics.SimpleNodeModelSerializer(many=False, read_only=True)
    floor = generics.SimpleFloorModelSerializer(many=False, read_only=False)

    class Meta:
        model = Room
        fields = ('id', 'name', 'floor', 'node', 'href')
        extra_kwargs = {
            'id': {'read_only': True},
            'href': {'read_only': True},
        }

    def create(self, validated_data):
        validated_data['floor_id'] = validated_data.pop('floor')['id']
        return Room.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data['floor_id'] = validated_data.pop('floor')['id']
        return super(RoomSerializer, self).update(instance, validated_data)
