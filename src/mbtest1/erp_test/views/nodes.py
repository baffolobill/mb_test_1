# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import generics, filters

from .base import SimpleServerList
from ..filters import NodeFilter
from ..models import Node
from ..serializers import NodeSerializer


class NodeList(generics.ListCreateAPIView):
    queryset = Node.objects.all()
    serializer_class = NodeSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter, filters.DjangoFilterBackend]
    filter_class = NodeFilter
    ordering_fields = ['id', 'name', 'servers_count', 'created_at', 'updated_at']
    search_fields = ['name', 'address']


class NodeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Node.objects.all()
    serializer_class = NodeSerializer


class NodeServerList(SimpleServerList):
    queryset = Node.objects.all()
