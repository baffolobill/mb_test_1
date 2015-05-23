# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import Http404

from rest_framework import generics, status, mixins, filters
from rest_framework.response import Response
from rest_framework.views import APIView

from ..filters import ServerFilter, ComponentFilter
from ..models import Server, Component, Basket, Rack
from ..serializers import ServerSerializer, ComponentSerializer
from ..exceptions import ComponentPlugFailed


class ServerList(generics.ListCreateAPIView):
    queryset = Server.objects.all()
    serializer_class = ServerSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter, filters.DjangoFilterBackend]
    filter_class = ServerFilter
    ordering_fields = '__all__'
    search_fields = ['name']


class ServerDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Server.objects.all()
    serializer_class = ServerSerializer


class ServerComponentList(mixins.DestroyModelMixin, generics.ListCreateAPIView):
    queryset = Server.objects
    serializer_class = ComponentSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter, filters.DjangoFilterBackend]
    filter_class = ComponentFilter
    ordering_fields = '__all__'
    search_fields = ['name', 'manufacturer', 'serial_number', 'model_name']

    def get_queryset(self):
        server = self.queryset.get(pk=self.kwargs['pk'])
        return server.get_installed_components()

    def get(self, *args, **kwargs):
        return self.list(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        action = request.data['type']
        if action == 'plug':
            return self._plug_components()
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        action = request.data['type']
        if action == 'unplug':
            return self._unplug_components()
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def get_server(self):
        try:
            return Server.objects.get(id=self.kwargs['pk'])
        except Server.DoesNotExist:
            raise Http404

    def _plug_components(self):
        server = self.get_server()
        component_ids = []
        if self.request.data.get('component_id'):
            component_ids = [self.request.data['component_id']]
        elif self.request.data.get('component_ids'):
            component_ids = self.request.data['component_ids']
        else:
            raise AttributeError('You have to pass <component_id> or <component_ids>.')
        res = server.install_components(self._get_component_list(component_ids))
        errors = []
        for r in res:
            if r['state'] == 'error':
                errors.append({'component_id': r['component'].pk, 'error': r['message']})
        if len(errors):
            raise ComponentPlugFailed(errors)
        return Response(status=status.HTTP_201_CREATED)

    def _unplug_components(self):
        server = self.get_server()
        component_ids = []
        if self.request.data.get('component_id'):
            component_ids = [self.request.data['component_id']]
        elif self.request.data.get('component_ids'):
            component_ids = self.request.data['component_ids']
        else:
            raise AttributeError('You have to pass <component_id> or <component_ids>.')
        server.uninstall_components(self._get_component_list(component_ids))
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _get_component_list(self, ids):
        return Component.objects.filter(id__in=ids)


class ServerActions(APIView):

    def delete(self, request, *args, **kwargs):
        action = request.data['type']
        if action == 'unmount_from_basket':
            return self._unmount_from_basket()
        elif action == 'unmount_from_rack':
            return self._unmount_from_rack()
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, *args, **kwargs):
        action = request.data['type']
        if action == 'mount_to_basket':
            return self._mount_to_basket()
        elif action == 'mount_to_rack':
            return self._mount_to_rack()
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def get_basket(self):
        try:
            return Basket.objects.get(id=self.request.data['basket_id'])
        except Basket.DoesNotExist:
            raise Http404

    def get_server(self):
        try:
            return Server.objects.get(id=self.kwargs['pk'])
        except Server.DoesNotExist:
            raise Http404

    def get_rack(self):
        try:
            return Rack.objects.get(id=self.request.data['rack_id'])
        except Rack.DoesNotExist:
            raise Http404

    def _mount_to_basket(self):
        data = self.request.data
        server = self.get_server()
        basket = self.get_basket()
        position = data.get('position', basket.find_free_position())
        basket.mount(server, position=position)
        return Response(status=status.HTTP_201_CREATED)

    def _unmount_from_basket(self):
        data = self.request.data
        server = self.get_server()
        basket = self.get_basket()
        basket.unmount(server)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _mount_to_rack(self):
        data = self.request.data
        rack = self.get_rack()
        server = self.get_server()
        height = server.get_height()
        position = data.get('position', rack.find_position_of_height(height))
        rack.mount(server=server, position=position, height=height)
        return Response(status=status.HTTP_201_CREATED)

    def _unmount_from_rack(self):
        data = self.request.data
        rack = self.get_rack()
        server = self.get_server()
        rack.unmount(server=server)
        return Response(status=status.HTTP_204_NO_CONTENT)
