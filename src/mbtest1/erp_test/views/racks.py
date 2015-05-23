# coding: utf-8
from rest_framework import generics

from ..models import Rack
from ..serializers import RackSerializer
from ..serializers.generics import SimpleServerHyperlinkedModelSerializer


class RackList(generics.ListCreateAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer
    resource_name = 'rack'

    def get_queryset(self):
        fullness = self.request.query_params.get('fullness', None)
        height = self.request.query_params.get('height', None)
        return self.queryset.with_fullness(fullness, height=height)


class RackDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer
    resource_name = 'rack'


class RackServerList(generics.ListAPIView):
    queryset = Rack.objects.all()
    serializer_class = SimpleServerHyperlinkedModelSerializer

    def get_queryset(self):
        obj = Rack.objects.get(id=self.kwargs['pk'])
        return obj.get_server_list()
