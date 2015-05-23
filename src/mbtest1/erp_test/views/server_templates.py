# coding: utf-8
from rest_framework import generics

from ..models import ServerTemplate
from ..serializers import ServerTemplateSerializer
from ..serializers.generics import SimpleServerHyperlinkedModelSerializer


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
    serializer_class = SimpleServerHyperlinkedModelSerializer
    resource_name = 'server'

    def get_queryset(self):
        instance = ServerTemplate.objects.get(pk=self.kwargs['pk'])
        return instance.get_server_list()
