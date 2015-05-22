from rest_framework import serializers

from ..models import Rack, Row
from .nodes import NodeSerializer
from .rows import RowFloorSerializer, RowRoomSerializer


class RackRowSerializer(serializers.ModelSerializer):

    class Meta:
        model = Row
        fields = ('id', 'name', 'href')


class RackSerializer(serializers.HyperlinkedModelSerializer):
    node = NodeSerializer(many=False, read_only=True)
    floor = RowFloorSerializer(many=False, read_only=True)
    room = RowRoomSerializer(many=False, read_only=True)
    row = RackRowSerializer(many=False, read_only=False)

    class Meta:
        model = Rack
        fields = ('id', 'name', 'max_gap', 'total_units', 'row',
                  'node', 'href', 'floor', 'room')
        extra_kwargs = {
            'id': {'read_only': True},
            'href': {'read_only': True},
            'max_gap': {'read_only': True},
        }

    def to_internal_value(self, data):
        return {
            'name': data.get('name'),
            'row': data.get('row'),
            'total_units': data.get('total_units'),
        }

    def create(self, validated_data):
        row = Row.objects.get(id=validated_data.get('row'))
        rack = Rack(
            name=validated_data.get('name'),
            row=row,
            total_units=validated_data.get('total_units'))
        rack.save()
        return rack

    def update(self, instance, validated_data):
        row_id = validated_data.pop('row', None)
        instance.row = Row.objects.get(id=row_id)
        for k,v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance
