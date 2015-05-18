from rest_framework import serializers

from ..models import Floor, Node
from .nodes import NodeSerializer


class FloorSerializer(serializers.HyperlinkedModelSerializer):
    node = NodeSerializer(many=False, read_only=False)

    class Meta:
        model = Floor
        fields = ('id', 'name', 'node', 'href')
        extra_kwargs = {
            'id': {'read_only': True},
            'href': {'read_only': True},
        }

    def to_internal_value(self, data):
        return {
            'name': data.get('name'),
            'node': data.get('node'),
        }

    def create(self, validated_data):
        return Floor.objects.create(
            name=validated_data.get('name'),
            node=Node.objects.get(id=validated_data.get('node')))

    def update(self, instance, validated_data):
        node_id = validated_data.pop('node', None)
        instance.node = Node.objects.get(id=node_id)
        for k,v in validated_data.items():
            setattr(instance, k, v)

        instance.save()
        return instance
