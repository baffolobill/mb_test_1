from rest_framework import serializers

from ..models import Server, Component


class ServerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Server
        fields = ('id', 'name', 'template')
