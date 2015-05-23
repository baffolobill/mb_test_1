# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import serializers

from . import generics
from ..models import Server, ServerTemplate


class ServerSerializer(serializers.HyperlinkedModelSerializer):
    node = generics.SimpleNodeModelSerializer(many=False, read_only=True)
    floor = generics.SimpleFloorModelSerializer(many=False, read_only=True)
    room = generics.SimpleRoomModelSerializer(many=False, read_only=True)
    row = generics.SimpleRowModelSerializer(many=False, read_only=True)
    rack = generics.SimpleRackModelSerializer(many=False, read_only=True)
    basket = generics.SimpleBasketModelSerializer(many=False, read_only=True)
    template = generics.SimpleServerTemplateModelSerializer(many=False, read_only=False, required=True)

    class Meta:
        model = Server
        fields = ('id', 'name', 'template', 'rack', 'node', 'basket',
                  'floor', 'room', 'row', 'href')
        extra_kwargs = {
            'id': {'read_only': True},
            'href': {'read_only': True},
        }

    def create(self, validated_data):
        validated_data['template_id'] = validated_data.pop('template')['id']
        return Server.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # изменение "шаблона" запрещено
        validated_data.pop('template', None)
        return super(ServerSerializer, self).update(instance, validated_data)
