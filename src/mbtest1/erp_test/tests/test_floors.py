# coding: utf-8
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Floor, Node


class TestFloorCRUD(APITestCase):
    """
        3.1.2 Пользователь может выполнять CRUD операции с этажами
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

    def test_floor_list(self):
        url = reverse('floor-list')
        response = self.client.get(url, format='json')
        data = [{'id': obj.id, 'name': obj.name, 'node': obj.node_id}
                for obj in Floor.objects.all()]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_floor_detail(self):
        url = reverse('floor-detail', args=[1])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'id': 1, 'name': '#1', 'node': 1})

    def test_floor_create(self):
        url = reverse('floor-list')
        data = {'name': 'baz', 'node': 3}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, {'id': 4, 'name': 'baz', 'node': 3})

    def test_floor_update(self):
        url = reverse('floor-detail', args=[2])
        data = {'node': 3}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['node'], data['node'])

    def test_floor_delete(self):
        url = reverse('floor-detail', args=[3])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Floor.objects.count(), 2)
