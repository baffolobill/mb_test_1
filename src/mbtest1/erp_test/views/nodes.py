# coding: utf-8
from rest_framework import generics

from ..models import Node
from ..serializers import NodeSerializer, NodeServerSerializer


class NodeList(generics.ListCreateAPIView):
    queryset = Node.objects.all()
    serializer_class = NodeSerializer


class NodeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Node.objects.all()
    serializer_class = NodeSerializer


class NodeServerList(generics.ListAPIView):
    queryset = Node.objects.all()
    serializer_class = NodeServerSerializer

    def get_queryset(self):
        node = Node.objects.get(pk=self.kwargs['pk'])
        return node.get_server_list()
