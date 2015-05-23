# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django_filters import FilterSet

from ..models import Basket


class BasketFilter(FilterSet):
    class Meta:
        model = Basket
        fields = ['node', 'rack', 'slot_qty', 'unit_takes']
