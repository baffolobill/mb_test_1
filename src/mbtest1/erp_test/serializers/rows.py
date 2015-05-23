# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import serializers

from . import generics
from ..models import Row, Room


class RowSerializer(serializers.HyperlinkedModelSerializer):
    node = generics.SimpleNodeModelSerializer(many=False, read_only=True)
    floor = generics.SimpleFloorModelSerializer(many=False, read_only=True)
    room = generics.SimpleRoomModelSerializer(many=False, read_only=False)

    class Meta:
        model = Row
        fields = ('id', 'name', 'room', 'floor', 'node', 'href')
        extra_kwargs = {
            'id': {'read_only': True},
            'href': {'read_only': True},
        }

    def create(self, validated_data):
        validated_data['room_id'] = validated_data.pop('room')['id']
        return Row.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data['room_id'] = validated_data.pop('room')['id']
        return super(RowSerializer, self).update(instance, validated_data)
