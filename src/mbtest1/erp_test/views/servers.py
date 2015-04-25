# coding: utf-8
from rest_framework import generics
from rest_framework.views import APIView

from ..models import Server
from ..serializers import ServerSerializer


class ServerList(generics.ListCreateAPIView):
    queryset = Server.objects.all()
    serializer_class = ServerSerializer


class ServerDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Server.objects.all()
    serializer_class = ServerSerializer


class ServerComponentList(generics.ListAPIView):
    pass


class ServerActions(APIView):
    pass
