# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django_filters import FilterSet

from ..models import Rack


class RackFilter(FilterSet):
    class Meta:
        model = Rack
        fields = ['node', 'row', 'total_units', 'max_gap']
