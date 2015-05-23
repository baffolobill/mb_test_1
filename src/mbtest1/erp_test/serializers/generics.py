# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import serializers

from .base import IdNameModelSerializer, IdNameHrefModelSerializer
from ..models import (
    Node, Floor, Room, Row, Rack, Basket, ServerTemplate,
    PropertyGroup, PropertyOption, Server)


class SimpleNodeModelSerializer(IdNameHrefModelSerializer):
    class Meta(IdNameHrefModelSerializer.Meta):
        model = Node


class SimpleFloorModelSerializer(IdNameHrefModelSerializer):
    class Meta(IdNameHrefModelSerializer.Meta):
        model = Floor


class SimpleRoomModelSerializer(IdNameHrefModelSerializer):
    class Meta(IdNameHrefModelSerializer.Meta):
        model = Room


class SimpleRowModelSerializer(IdNameHrefModelSerializer):
    class Meta(IdNameHrefModelSerializer.Meta):
        model = Row


class SimpleRackModelSerializer(IdNameHrefModelSerializer):
    class Meta(IdNameHrefModelSerializer.Meta):
        model = Rack


class SimpleBasketModelSerializer(IdNameHrefModelSerializer):
    class Meta(IdNameHrefModelSerializer.Meta):
        model = Basket


class SimpleServerTemplateModelSerializer(IdNameHrefModelSerializer):
    class Meta(IdNameHrefModelSerializer.Meta):
        model = ServerTemplate


class SimplePropertyGroupModelSerializer(IdNameHrefModelSerializer):
    class Meta(IdNameHrefModelSerializer.Meta):
        model = PropertyGroup


class SimplePropertyOptionModelSerializer(IdNameModelSerializer):
    class Meta(IdNameModelSerializer.Meta):
        model = PropertyOption


class SimpleServerHyperlinkedModelSerializer(serializers.HyperlinkedModelSerializer):
    node = SimpleNodeModelSerializer(many=False, read_only=True)
    floor = SimpleFloorModelSerializer(many=False, read_only=True)
    room = SimpleRoomModelSerializer(many=False, read_only=True)
    row = SimpleRowModelSerializer(many=False, read_only=True)
    rack = SimpleRackModelSerializer(many=False, read_only=True)
    basket = SimpleBasketModelSerializer(many=False, read_only=True)
    template = SimpleServerTemplateModelSerializer(many=False, read_only=True)

    class Meta:
        model = Server
        fields = ('id', 'name', 'template', 'rack', 'basket', 'node', 'floor', 'room', 'row')
        extra_kwargs = {
            'id': {'read_only': True},
            'name': {'read_only': True},
        }
