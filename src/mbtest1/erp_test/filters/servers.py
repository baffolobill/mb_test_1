# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django_filters import FilterSet

from ..models import Server


class SimpleServerFilter(FilterSet):
    class Meta:
        model = Server
        fields = ['node', 'floor', 'room', 'row', 'rack', 'basket', 'template']


class ServerFilter(SimpleServerFilter): pass
