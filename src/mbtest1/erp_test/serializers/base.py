# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.core.exceptions import ObjectDoesNotExist
from django.utils.translation import ugettext_lazy as _

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.settings import api_settings


class IdNameModelSerializer(serializers.ModelSerializer):

    class Meta:
        fields = ['id', 'name']
        extra_kwargs = {
            'id': {'read_only': False},
            'name': {'read_only': True, 'required': False},
        }

    def to_internal_value(self, data):
        if not isinstance(data, dict):
            data = {
                'id': data
            }
        return super(IdNameModelSerializer, self).to_internal_value(data)


class IdNameHrefModelSerializer(IdNameModelSerializer):

    class Meta(IdNameModelSerializer.Meta):
        fields = IdNameModelSerializer.Meta.fields + ['href']
        extra_kwargs = {
            'id': {'read_only': False},
            'name': {'read_only': True},
            'href': {'read_only': True},
        }
