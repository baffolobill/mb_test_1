# coding: utf-8
from rest_framework import generics

from ..models import Row
from ..serializers import RowSerializer
from ..serializers.generics import SimpleServerHyperlinkedModelSerializer


class RowList(generics.ListCreateAPIView):
    queryset = Row.objects.all()
    serializer_class = RowSerializer
    resource_name = 'row'


class RowDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Row.objects.all()
    serializer_class = RowSerializer
    resource_name = 'row'


class RowServerList(generics.ListAPIView):
    queryset = Row.objects.all()
    serializer_class = SimpleServerHyperlinkedModelSerializer

    def get_queryset(self):
        obj = Row.objects.get(id=self.kwargs['pk'])
        return obj.get_server_list()
