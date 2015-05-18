# coding: utf-8
from rest_framework import generics

from ..models import Room
from ..serializers import RoomSerializer, NodeServerSerializer


class RoomList(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    resource_name = 'room'


class RoomDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    resource_name = 'room'


class RoomServerList(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = NodeServerSerializer

    def get_queryset(self):
        obj = Room.objects.get(id=self.kwargs['pk'])
        return obj.get_server_list()
