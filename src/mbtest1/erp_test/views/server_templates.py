# coding: utf-8
from rest_framework import generics

from ..models import ServerTemplate
from ..serializers import ServerTemplateSerializer, NodeServerSerializer


class ServerTemplateList(generics.ListCreateAPIView):
    queryset = ServerTemplate.objects.all()
    serializer_class = ServerTemplateSerializer
    resource_name = 'server-template'


class ServerTemplateDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServerTemplate.objects.all()
    serializer_class = ServerTemplateSerializer
    resource_name = 'server-template'


class ServerTemplateServerList(generics.ListAPIView):
    queryset = ServerTemplate.objects.all()
    serializer_class = NodeServerSerializer
    resource_name = 'server'

    def get_queryset(self):
        instance = ServerTemplate.objects.get(pk=self.kwargs['pk'])
        return instance.get_server_list()
