from rest_framework import serializers

from ..models import Rack


class RackSerializer(serializers.ModelSerializer):
    max_gap = serializers.IntegerField(read_only=True)

    class Meta:
        model = Rack
        fields = ('id', 'name', 'max_gap', 'total_units', 'row', 'node')
