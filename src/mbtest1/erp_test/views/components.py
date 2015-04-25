# coding: utf-8
from rest_framework import generics

from ..models import Component
from ..serializers import ComponentSerializer


class ComponentList(generics.ListCreateAPIView):
    queryset = Component.objects
    serializer_class = ComponentSerializer

    def get_queryset(self):
        kind = self.kwargs.get('kind', None)
        state = self.request.query_params.get('state', None)
        return self.queryset.of_kind(kind=kind).with_state(state)


class ComponentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer
