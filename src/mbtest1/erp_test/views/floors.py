# coding: utf-8
from rest_framework import generics

from ..models import Floor
from ..serializers import FloorSerializer


class FloorList(generics.ListCreateAPIView):
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer


class FloorDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer
