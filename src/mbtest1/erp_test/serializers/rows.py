from rest_framework import serializers

from ..models import Row, Room, Floor, Node
from .nodes import NodeSerializer


class RowFloorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Floor
        fields = ('id', 'name', 'href')


class RowRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'name', 'href')


class RowSerializer(serializers.HyperlinkedModelSerializer):
    node = NodeSerializer(many=False, read_only=False)
    floor = RowFloorSerializer(many=False, read_only=False)
    room = RowRoomSerializer(many=False, read_only=False)

    class Meta:
        model = Row
        fields = ('id', 'name', 'room', 'floor', 'node', 'href')
        extra_kwargs = {
            'id': {'read_only': True},
            'href': {'read_only': True},
        }

    def to_internal_value(self, data):
        return {
            'name': data.get('name'),
            'room': data.get('room'),
        }

    def create(self, validated_data):
        room = Room.objects.get(id=validated_data.get('room'))
        return Row.objects.create(
            name=validated_data.get('name'),
            room=room,
            floor=room.get_floor(),
            node=room.get_node())

    def update(self, instance, validated_data):
        room_id = validated_data.pop('room', None)
        instance.room = Room.objects.get(id=room_id)
        for k,v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance
