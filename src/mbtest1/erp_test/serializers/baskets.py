from rest_framework import serializers

from ..models import Basket, Rack
from .nodes import NodeSerializer
from .rows import RowFloorSerializer, RowRoomSerializer
from .racks import RackRowSerializer


class BasketRackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rack
        fields = ('id', 'name', 'href')


class BasketSerializer(serializers.HyperlinkedModelSerializer):
    node = NodeSerializer(many=False, read_only=True)
    floor = RowFloorSerializer(many=False, read_only=True)
    room = RowRoomSerializer(many=False, read_only=True)
    row = RackRowSerializer(many=False, read_only=True)
    rack = BasketRackSerializer(many=False, read_only=False)

    class Meta:
        model = Basket
        fields = ('id', 'name', 'slot_qty', 'unit_takes',
                  'node', 'floor', 'room', 'row', 'rack', 'href')
        extra_kwargs = {
            'id': {'read_only': True},
            'href': {'read_only': True},
        }

    def to_internal_value(self, data):
        return {
            'name': data.get('name'),
            'rack': data.get('rack'),
            'unit_takes': data.get('unit_takes'),
            'slot_qty': data.get('slot_qty'),
        }

    def create(self, validated_data):
        rack = validated_data.get('rack')
        if rack:
            rack = Rack.objects.create(id=rack)

        basket = Basket(
            name=validated_data.get('name'),
            rack=rack,
            unit_takes=validated_data.get('unit_takes'),
            slot_qty=validated_data.get('slot_qty'))
        basket.save()
        return basket

    def update(self, instance, validated_data):
        rack_id = validated_data.pop('rack', None)
        if rack_id:
            instance.rack = Rack.objects.get(id=rack_id)
        else:
            instance.rack = None
        for k,v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance
