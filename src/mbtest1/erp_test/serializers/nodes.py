from rest_framework import serializers

from ..models import Node, Server


class NodeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Node
        fields = ('id', 'name', 'address')


class NodeServerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Server
        fields = ('id', 'name', 'template', 'rack')
