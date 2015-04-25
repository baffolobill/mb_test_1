from rest_framework import serializers

from ..models import Row


class RowSerializer(serializers.ModelSerializer):

    class Meta:
        model = Row
        fields = ('id', 'name', 'room')
