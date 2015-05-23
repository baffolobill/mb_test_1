# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django_filters import FilterSet

from ..models import Row


class RowFilter(FilterSet):
    class Meta:
        model = Row
        fields = ['node', 'floor', 'room']
