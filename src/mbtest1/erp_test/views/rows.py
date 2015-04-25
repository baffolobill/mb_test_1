# coding: utf-8
from rest_framework import generics

from ..models import Row
from ..serializers import RowSerializer


class RowList(generics.ListCreateAPIView):
    queryset = Row.objects.all()
    serializer_class = RowSerializer


class RowDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Row.objects.all()
    serializer_class = RowSerializer
