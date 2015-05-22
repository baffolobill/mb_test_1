from collections import OrderedDict

from rest_framework import serializers
from rest_framework.fields import SkipField

from ..models import Node, Floor, Room, Row, Server, Rack, Basket, ServerTemplate


class NodeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Node
        fields = ('id', 'name', 'address', 'servers_count', 'href')
        extra_kwargs = {
            'servers_count': {'read_only': True},
            'href': {'read_only': True},
        }



class BaseServerAttributeModelSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('id', 'name', 'href')


class NodeServerNodeSerializer(BaseServerAttributeModelSerializer):
    class Meta(BaseServerAttributeModelSerializer.Meta):
        model = Node


class NodeServerFloorSerializer(BaseServerAttributeModelSerializer):
    class Meta(BaseServerAttributeModelSerializer.Meta):
        model = Floor


class NodeServerRoomSerializer(BaseServerAttributeModelSerializer):
    class Meta(BaseServerAttributeModelSerializer.Meta):
        model = Room


class NodeServerRowSerializer(BaseServerAttributeModelSerializer):
    class Meta(BaseServerAttributeModelSerializer.Meta):
        model = Row


class NodeServerRackSerializer(BaseServerAttributeModelSerializer):
    class Meta(BaseServerAttributeModelSerializer.Meta):
        model = Rack


class NodeServerBasketSerializer(BaseServerAttributeModelSerializer):
    class Meta(BaseServerAttributeModelSerializer.Meta):
        model = Basket


class NodeServerServerTemplateSerializer(BaseServerAttributeModelSerializer):
    class Meta(BaseServerAttributeModelSerializer.Meta):
        model = ServerTemplate


class NodeServerSerializer(serializers.HyperlinkedModelSerializer):
    node = NodeServerNodeSerializer(many=False, read_only=True)
    floor = NodeServerFloorSerializer(many=False, read_only=True)
    room = NodeServerRoomSerializer(many=False, read_only=True)
    row = NodeServerRowSerializer(many=False, read_only=True)
    rack = NodeServerRackSerializer(many=False, read_only=True)
    basket = NodeServerBasketSerializer(many=False, read_only=True)
    template = NodeServerServerTemplateSerializer(many=False, read_only=True)

    class Meta:
        model = Server
        fields = ('id', 'name', 'template', 'rack', 'basket', 'node', 'floor', 'room', 'row')
