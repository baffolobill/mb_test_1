# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django_filters import FilterSet

from ..models import Room


class RoomFilter(FilterSet):
    class Meta:
        model = Room
        fields = ['node', 'floor']
