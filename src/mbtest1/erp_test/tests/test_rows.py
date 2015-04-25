# coding: utf-8
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Row, Room, Floor, Node


class TestRowCRUD(APITestCase):
    """
        3.1.4 Пользователь может выполнять CRUD операции с рядами
    """

    def setUp(self):
        nodes = [
            {'name': 'ams1', 'address': 'Washington DC'},
        ]

        for item in nodes:
            Node.objects.create(**item)

        floors = [
            {'name': '#1', 'node_id': 1},
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

        rows = [
            {'name': '#1', 'room_id': 1},
            {'name': 'foo', 'room_id': 2},
            {'name': 'bar', 'room_id': 2},
        ]

        for item in rows:
            Row.objects.create(**item)

    def test_row_list(self):
        url = reverse('row-list')
        response = self.client.get(url, format='json')
        data = [{'id': obj.id, 'name': obj.name, 'room': obj.room_id}
                for obj in Row.objects.all()]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_row_detail(self):
        url = reverse('row-detail', args=[1])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'id': 1, 'name': '#1', 'room': 1})

    def test_row_create(self):
        url = reverse('row-list')
        data = {'name': 'baz', 'room': 3}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, {'id': 4, 'name': 'baz', 'room': 3})

    def test_row_update(self):
        url = reverse('row-detail', args=[2])
        data = {'room': 3}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['room'], data['room'])

    def test_row_delete(self):
        url = reverse('row-detail', args=[3])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Row.objects.count(), 2)
