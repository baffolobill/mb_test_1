# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import generics, filters

from ..filters import SimpleServerFilter
from ..serializers.generics import SimpleServerHyperlinkedModelSerializer


class SimpleServerList(generics.ListAPIView):
    serializer_class = SimpleServerHyperlinkedModelSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter, filters.DjangoFilterBackend]
    filter_class = SimpleServerFilter
    ordering_fields = ['id', 'name', 'created_at', 'updated_at']
    search_fields = ['name']

    def get_queryset(self):
        obj = self.queryset.get(id=self.kwargs['pk'])
        return obj.get_server_list()
