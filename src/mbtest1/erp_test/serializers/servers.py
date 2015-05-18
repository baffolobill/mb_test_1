# coding: utf-8
from rest_framework import serializers

from ..models import Server, ServerTemplate
from .nodes import NodeSerializer
from .rows import RowFloorSerializer, RowRoomSerializer
from .racks import RackRowSerializer
from .baskets import BasketRackSerializer


class ServerBasketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Server
        fields = ('id', 'name')


class ServerServerTemplateSerializer(serializers.ModelSerializer):

    class Meta:
        model = ServerTemplate
        fields = ('id', 'name')


class ServerSerializer(serializers.HyperlinkedModelSerializer):
    node = NodeSerializer(many=False, read_only=True)
    floor = RowFloorSerializer(many=False, read_only=True)
    room = RowRoomSerializer(many=False, read_only=True)
    row = RackRowSerializer(many=False, read_only=True)
    rack = BasketRackSerializer(many=False, read_only=True)
    basket = ServerBasketSerializer(many=False, read_only=True)
    template = ServerServerTemplateSerializer(many=False, read_only=False)

    class Meta:
        model = Server
        fields = ('id', 'name', 'template', 'rack', 'node', 'basket',
                  'floor', 'room', 'row', 'href')
        extra_kwargs = {
            'id': {'read_only': True},
            'href': {'read_only': True},
        }

    def to_internal_value(self, data):
        return {
            'name': data.get('name'),
            'template': data.get('template'),
        }

    def create(self, validated_data):
        template = ServerTemplate.objects.get(id=validated_data.get('template'))

        server = Server(
            name=validated_data.get('name'),
            template=template)
        server.save()
        return server

    def update(self, instance, validated_data):
        # изменение "шаблона" запрещено
        validated_data.pop('template', None)

        for k,v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance
