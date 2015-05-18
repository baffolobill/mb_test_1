# coding: utf-8
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Room, Floor, Node


class TestRoomCRUD(APITestCase):
    """
        3.1.3 Пользователь может выполнять CRUD операции с помещениями
    """

    def setUp(self):
        nodes = [
            {'name': 'ams1', 'address': 'Washington DC'},
            {'name': 'nyc1', 'address': 'New York'},
            {'name': 'frt1', 'address': 'Frankfurt'},
        ]

        for item in nodes:
            Node.objects.create(**item)

        floors = [
            {'name': '#1', 'node_id': 1},
            {'name': 'foo', 'node_id': 2},
            {'name': 'bar', 'node_id': 2},
        ]

        for item in floors:
            Floor.objects.create(**item)

        rooms = [
            {'name': '#1', 'floor_id': 1},
            {'name': 'foo', 'floor_id': 2},
            {'name': 'bar', 'floor_id': 2},
        ]

        for item in rooms:
            Room.objects.create(**item)

    def test_room_list(self):
        url = reverse('api:room-list')
        response = self.client.get(url, format='json')
        data = [{'id': obj.id, 'name': obj.name, 'floor': obj.floor_id}
                for obj in Room.objects.all()]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_room_detail(self):
        url = reverse('api:room-detail', args=[1])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'id': 1, 'name': '#1', 'floor': 1})

    def test_room_create(self):
        url = reverse('api:room-list')
        data = {'name': 'baz', 'floor': 3}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, {'id': 4, 'name': 'baz', 'floor': 3})

    def test_room_update(self):
        url = reverse('api:room-detail', args=[2])
        data = {'floor': 3}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['floor'], data['floor'])

    def test_room_delete(self):
        url = reverse('api:room-detail', args=[3])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Room.objects.count(), 2)
