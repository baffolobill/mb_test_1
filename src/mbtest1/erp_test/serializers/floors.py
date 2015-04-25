from rest_framework import serializers

from ..models import Floor


class FloorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Floor
        fields = ('id', 'name', 'node')
