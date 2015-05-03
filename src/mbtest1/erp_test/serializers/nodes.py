from rest_framework import serializers

from ..models import Node, Server


class NodeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Node
        fields = ('id', 'name', 'address', 'servers')
        extra_kwargs = {
            'servers': {'read_only': True},
        }
