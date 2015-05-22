from rest_framework import serializers

from ..models import Room, Node, Floor
from .nodes import NodeSerializer
from .floors import FloorSerializer


class RoomFloorSerializer(FloorSerializer):

    class Meta:
        model = Floor
        fields = ('id', 'name', 'href')


class RoomSerializer(serializers.HyperlinkedModelSerializer):
    floor = RoomFloorSerializer(many=False, read_only=False)
    node = NodeSerializer(many=False, read_only=False)

    class Meta:
        model = Room
        fields = ('id', 'name', 'floor', 'node', 'href')
        extra_kwargs = {
            'id': {'read_only': True},
            'href': {'read_only': True},
        }

    def to_internal_value(self, data):
        return {
            'name': data.get('name'),
            'floor': data.get('floor'),
        }

    def create(self, validated_data):
        floor = Floor.objects.get(id=validated_data.get('floor'))
        return Room.objects.create(
            name=validated_data.get('name'),
            floor=floor,
            node=floor.node)

    def update(self, instance, validated_data):
        floor_id = validated_data.pop('floor', None)
        instance.floor = Floor.objects.get(id=floor_id)
        for k,v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance
