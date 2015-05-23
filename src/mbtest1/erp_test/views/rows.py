# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import generics, filters

from .base import SimpleServerList
from ..filters import RowFilter
from ..models import Row
from ..serializers import RowSerializer


class RowList(generics.ListCreateAPIView):
    queryset = Row.objects.all()
    serializer_class = RowSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter, filters.DjangoFilterBackend]
    filter_class = RowFilter
    ordering_fields = '__all__'
    search_fields = ['name']


class RowDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Row.objects.all()
    serializer_class = RowSerializer


class RowServerList(SimpleServerList):
    queryset = Row.objects.all()
