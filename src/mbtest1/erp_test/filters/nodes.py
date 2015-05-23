# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django_filters import FilterSet

from ..models import Node


class NodeFilter(FilterSet):
    class Meta:
        model = Node
        fields = ['servers_count']
