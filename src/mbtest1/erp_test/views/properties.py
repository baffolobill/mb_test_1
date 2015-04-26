# coding: utf-8
from rest_framework import generics

from ..models import Property, PropertyGroup
from ..serializers import (
    PropertySerializer, PropertyGroupSerializer,
    SimplePropertyGroupSerializer)


class PropertyList(generics.ListAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

    def get_queryset(self):
        kind = self.kwargs.get('kind', None)
        return self.queryset.of_kind(kind=kind)


class PropertyDetail(generics.RetrieveAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer


class PropertyGroupList(generics.ListAPIView):
    queryset = PropertyGroup.objects.all()
    serializer_class = SimplePropertyGroupSerializer


class PropertyGroupDetail(generics.RetrieveAPIView):
    queryset = PropertyGroup.objects
    serializer_class = PropertyGroupSerializer

    def get_object(self):
        if 'name' in self.kwargs:
            return self.queryset.get(name=self.kwargs['name'])
        return super(PropertyGroupDetail, self).get_object()
