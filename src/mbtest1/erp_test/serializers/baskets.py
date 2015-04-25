from rest_framework import serializers

from ..models import Basket, ServerTemplate, Server, Rack


class BasketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Basket
        fields = ('id', 'name', 'slot_qty', 'unit_takes')


class BasketServerTemplateSerializer(serializers.ModelSerializer):

    class Meta:
        model = ServerTemplate
        fields = ('id', 'name', )


class BasketServerRackSerializer(serializers.ModelSerializer):

    class Meta:
        model = Rack
        fields = ('id', 'name')


class BasketServerSerializer(serializers.ModelSerializer):
    template = BasketServerTemplateSerializer()
    rack = BasketServerRackSerializer()

    class Meta:
        model = Server
        fields = ('id', 'name', 'template', 'rack')

