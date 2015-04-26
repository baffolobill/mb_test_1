# coding: utf-8
from rest_framework import generics

from ..models import ServerTemplate
from ..serializers import ServerTemplateSerializer


class ServerTemplateList(generics.ListCreateAPIView):
    queryset = ServerTemplate.objects.all()
    serializer_class = ServerTemplateSerializer


class ServerTemplateDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServerTemplate.objects.all()
    serializer_class = ServerTemplateSerializer
