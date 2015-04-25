from collections import OrderedDict

from rest_framework import serializers

from ..models import PropertyGroup, ComponentPropertyValue


class ServerTemplateHddSerializer(serializers.Serializer):

    def __init__(self, *args, **kwargs):
        super(ServerTemplateHddSerializer, self).__init__(self, *args, **kwargs)



    def to_representation(self, value):
        ret = OrderedDict()


        return ret

    def create(self, validated_data):


        return None

    def update(self, instance, validated_data):
        return None


class ServerTemplateSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=200)
    hdd = ServerTemplateHddSerializer(many=True)

    def __init__(self, *args, **kwargs):
        super(ServerTemplateSerializer, self).__init__(*args, **kwargs)



    def to_representation(self, value):
        ret = OrderedDict()

        return ret

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.save()



        return instance

