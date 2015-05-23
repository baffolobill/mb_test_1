# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import generics, filters

from .base import SimpleServerList
from ..filters import ServerTemplateFilter
from ..models import ServerTemplate
from ..serializers import ServerTemplateSerializer


class ServerTemplateList(generics.ListCreateAPIView):
    queryset = ServerTemplate.objects.all()
    serializer_class = ServerTemplateSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter, filters.DjangoFilterBackend]
    filter_class = ServerTemplateFilter
    ordering_fields = '__all__'
    search_fields = ['name']


class ServerTemplateDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServerTemplate.objects.all()
    serializer_class = ServerTemplateSerializer


class ServerTemplateServerList(SimpleServerList):
    queryset = ServerTemplate.objects.all()
