# coding: utf-8
from rest_framework import generics

from ..models import Floor
from ..serializers import FloorSerializer, NodeServerSerializer


class FloorList(generics.ListCreateAPIView):
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer
    resource_name = 'floor'


class FloorDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer
    resource_name = 'floor'


class FloorServerList(generics.ListAPIView):
    queryset = Floor.objects.all()
    serializer_class = NodeServerSerializer

    def get_queryset(self):
        obj = Floor.objects.get(id=self.kwargs['pk'])
        return obj.get_server_list()
