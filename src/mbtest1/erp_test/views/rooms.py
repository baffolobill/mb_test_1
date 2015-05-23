# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import generics, filters

from .base import SimpleServerList
from ..filters import RoomFilter
from ..models import Room
from ..serializers import RoomSerializer


class RoomList(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter, filters.DjangoFilterBackend]
    filter_class = RoomFilter
    ordering_fields = '__all__'
    search_fields = ['name']


class RoomDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class RoomServerList(SimpleServerList):
    queryset = Room.objects.all()
