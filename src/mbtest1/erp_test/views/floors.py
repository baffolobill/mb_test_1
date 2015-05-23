# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import generics, filters

from .base import SimpleServerList
from ..filters import FloorFilter
from ..models import Floor
from ..serializers import FloorSerializer


class FloorList(generics.ListCreateAPIView):
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter, filters.DjangoFilterBackend]
    filter_class = FloorFilter
    ordering_fields = '__all__'
    search_fields = ['name']


class FloorDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer


class FloorServerList(SimpleServerList):
    queryset = Floor.objects.all()
