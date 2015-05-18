# coding: utf-8
from rest_framework import generics

from ..models import Component
from ..serializers import ComponentSerializer, ComponentPropertySerializer


class ComponentList(generics.ListCreateAPIView):
    queryset = Component.objects
    serializer_class = ComponentSerializer
    resource_name = 'component'

    def get_queryset(self):
        kind = self.kwargs.get('kind', None)
        state = self.request.query_params.get('state', None)
        return self.queryset.of_kind(kind=kind).with_state(state)


class ComponentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer
    resource_name = 'component'


class ComponentPropertyList(generics.ListAPIView):
    queryset = Component.objects.all()
    serializer_class = ComponentPropertySerializer

    def get_queryset(self):
        instance = self.queryset.get(pk=self.kwargs['pk'])
        return instance.get_properties()
