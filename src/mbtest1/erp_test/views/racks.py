# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import generics, filters

from .base import SimpleServerList
from ..filters import RackFilter
from ..models import Rack
from ..serializers import RackSerializer


class RackList(generics.ListCreateAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter, filters.DjangoFilterBackend]
    filter_class = RackFilter
    ordering_fields = '__all__'
    search_fields = ['name']

    def get_queryset(self):
        fullness = self.request.query_params.get('fullness', None)
        height = self.request.query_params.get('height', None)
        return self.queryset.with_fullness(fullness, height=height)


class RackDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


class RackServerList(SimpleServerList):
    queryset = Rack.objects.all()
