# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import serializers

from ..models import Property, PropertyGroup


class PropertySerializer(serializers.ModelSerializer):

    class Meta:
        model = Property
        fields = ('id', 'name', 'title', 'position', 'unit',
                  'type', 'required')


class PropertyGroupSerializer(serializers.ModelSerializer):
    properties = PropertySerializer(many=True)

    class Meta:
        model = PropertyGroup
        fields = ('id', 'name', 'properties')
