# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django_filters import FilterSet

from ..models import Floor


class FloorFilter(FilterSet):
    class Meta:
        model = Floor
        fields = ['node']
