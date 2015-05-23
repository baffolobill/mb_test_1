# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import serializers

from . import generics
from ..models import Floor


class FloorSerializer(serializers.HyperlinkedModelSerializer):
    node = generics.SimpleNodeModelSerializer(many=False, read_only=False)

    class Meta:
        model = Floor
        fields = ('id', 'name', 'node', 'href')
        extra_kwargs = {
            'id': {'read_only': True},
            'href': {'read_only': True},
        }

    def create(self, validated_data):
        validated_data['node_id'] = validated_data.pop('node')['id']
        return Floor.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data['node_id'] = validated_data.pop('node')['id']
        return super(FloorSerializer, self).update(instance, validated_data)
