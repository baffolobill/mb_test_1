# coding: utf-8
from django.db.models import Q
from rest_framework import generics

from ..models import Property, PropertyOption, PropertyGroup
from ..serializers import (
    PropertySerializer, PropertyGroupSerializer,
    SimplePropertyGroupSerializer,
    PropertyOptionSerializer)


class PropertyList(generics.ListAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    resource_name = 'property'

    def get_queryset(self):
        kind = self.kwargs.get('kind', None)
        return self.queryset.of_kind(kind=kind)


class PropertyDetail(generics.RetrieveAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    resource_name = 'property'

    def get_object(self):
        if 'pk' in self.kwargs:
            query = Q(pk=self.kwargs['pk'])
        elif 'name' in self.kwargs:
            query = Q(name=self.kwargs['name'])
        else:
            raise ValueError('<pk> or <name> is required.')

        return self.queryset.get(query)


class PropertyOptionList(generics.ListAPIView):
    queryset = PropertyOption.objects.all()
    serializer_class = PropertyOptionSerializer

    def get_queryset(self):
        return PropertyOption.objects.filter(property__name=self.kwargs['name'])


class PropertyGroupList(generics.ListAPIView):
    queryset = PropertyGroup.objects.all()
    serializer_class = SimplePropertyGroupSerializer
    resource_name = 'property-group'


class PropertyGroupDetail(generics.RetrieveAPIView):
    queryset = PropertyGroup.objects
    serializer_class = PropertyGroupSerializer
    resource_name = 'property-group'

    def get_object(self):
        if 'name' in self.kwargs:
            return self.queryset.get(name=self.kwargs['name'])
        return super(PropertyGroupDetail, self).get_object()
