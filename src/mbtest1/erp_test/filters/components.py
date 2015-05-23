# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django_filters import FilterSet

from ..models import Component


class ComponentFilter(FilterSet):
    class Meta:
        model = Component
        fields = ['state', 'server', 'kind']
