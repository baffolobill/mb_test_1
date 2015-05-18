from collections import OrderedDict

from rest_framework import serializers
from rest_framework.fields import SkipField

from ..models import Node, Server, Rack, Basket, ServerTemplate


class NodeSerializer(serializers.HyperlinkedModelSerializer):
    #title = serializers.CharField(source='name')

    class Meta:
        model = Node
        fields = ('id', 'name', 'address', 'servers_count')# 'servers')
        #extra_kwargs = {
        #    'servers': {'read_only': True},
        #}


class NodeServerRackSerializer(serializers.ModelSerializer):

    class Meta:
        model = Rack
        fields = ('id', 'name', 'row', 'node')


class NodeServerBasketSerializer(serializers.ModelSerializer):
    rack = NodeServerRackSerializer(many=False, read_only=True)

    class Meta:
        model = Basket
        fields = ('id', 'name', 'rack')


class NodeServerTemplateSerializer(serializers.ModelSerializer):

    class Meta:
        model = ServerTemplate
        fields = ('id', 'name')


class NodeServerSerializer(serializers.HyperlinkedModelSerializer):
    rack = NodeServerRackSerializer(many=False, read_only=True)
    basket = NodeServerBasketSerializer(many=False, read_only=True, required=False)
    template = NodeServerTemplateSerializer(many=False, read_only=True)

    class Meta:
        model = Server
        fields = ('id', 'name', 'template', 'rack', 'basket')
