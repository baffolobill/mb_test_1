# coding: utf-8
from rest_framework import generics, filters

from ..models import Node
from ..serializers import NodeSerializer
from ..serializers.generics import SimpleServerHyperlinkedModelSerializer


class NodeList(generics.ListCreateAPIView):
    queryset = Node.objects.all()
    serializer_class = NodeSerializer
    resource_name = 'node'
    filter_backends = (filters.OrderingFilter,)


class NodeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Node.objects.all()
    serializer_class = NodeSerializer
    resource_name = 'node'


class NodeServerList(generics.ListAPIView):
    queryset = Node.objects.all()
    serializer_class = SimpleServerHyperlinkedModelSerializer

    def get_queryset(self):
        node = Node.objects.get(pk=self.kwargs['pk'])
        return node.get_server_list()
