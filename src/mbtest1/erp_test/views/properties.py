# coding: utf-8
from rest_framework import generics

from ..models import Property
from ..serializers import PropertySerializer


class PropertyList(generics.ListCreateAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

    def get_queryset(self):
        kind = self.kwargs.get('kind', None)
        return self.queryset.of_kind(kind=kind)


class PropertyDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
