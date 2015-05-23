# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import serializers

from ..models import Node


class NodeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Node
        fields = ('id', 'name', 'address', 'servers_count', 'href')
        extra_kwargs = {
            'id': {'read_only': True},
            'servers_count': {'read_only': True},
            'href': {'read_only': True},
        }
