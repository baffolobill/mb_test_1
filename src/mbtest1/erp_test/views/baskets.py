# coding: utf-8
from django.http import Http404

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Basket
from ..serializers import BasketSerializer, BasketServerSerializer


class BasketList(generics.ListCreateAPIView):
    queryset = Basket.objects.all()
    serializer_class = BasketSerializer


class BasketDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Basket.objects.all()
    serializer_class = BasketSerializer


class BasketServerList(generics.ListAPIView):
    queryset = Basket.objects.all()
    serializer_class = BasketServerSerializer

    def get_queryset(self):
        basket = Basket.objects.get(pk=self.kwargs['pk'])
        return basket.get_server_list()


class BasketActions(APIView):

    def delete(self, request, *args, **kwargs):
        action = request.data['type']
        if action == 'uninstall_server':
            return self._uninstall_server()
        elif action == 'unmount_from_rack':
            return self._unmount_from_rack()
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, *args, **kwargs):
        action = request.data['type']
        if action == 'install_server':
            return self._install_server()
        elif action == 'mount_to_rack':
            return self._mount_to_rack()
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def get_basket(self):
        try:
            return Basket.objects.get(id=self.kwargs['pk'])
        except Basket.DoesNotExist:
            raise Http404

    def _mount_to_rack(self):
        data = self.request.data
        rack_id = data['rack_id']
        try:
            rack = Rack.objects.get(id=rack_id)
        except Rack.DoesNotExist:
            raise Http404

        basket = self.get_basket()
        height = basket.get_height()
        position = data.get('position', rack.find_position_of_height(height))
        rack.mount(basket=basket, position=position, height=height)
        return Response(status=status.HTTP_201_CREATED)

    def _unmount_from_rack(self):
        raise NotImplemented

    def _install_server(self):
        data = self.request.data
        server_id = data['server_id']
        try:
            server = Server.objects.get(id=server_id)
        except Server.DoesNotExist:
            raise Http404

        basket = self.get_basket()
        position = data.get('position', basket.find_position())
        basket.mount(server, position=position)
        return Response(status=status.HTTP_201_CREATED)

    def _uninstall_server(self):
        raise NotImplemented
