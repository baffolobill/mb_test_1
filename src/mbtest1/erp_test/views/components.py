# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import generics, filters

from ..filters import ComponentFilter
from ..models import Component
from ..serializers import ComponentSerializer, ComponentPropertySerializer


class ComponentList(generics.ListCreateAPIView):
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter, filters.DjangoFilterBackend]
    filter_class = ComponentFilter
    ordering_fields = '__all__'
    search_fields = ['name', 'manufacturer', 'serial_number', 'model_name']

    def get_queryset(self):
        kind = self.kwargs.get('kind', None)
        state = self.request.query_params.get('state', None)
        return self.queryset.of_kind(kind=kind).with_state(state)


class ComponentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer


class ComponentPropertyList(generics.ListAPIView):
    queryset = Component.objects.all()
    serializer_class = ComponentPropertySerializer

    def get_queryset(self):
        instance = self.queryset.get(pk=self.kwargs['pk'])
        return instance.get_properties()
