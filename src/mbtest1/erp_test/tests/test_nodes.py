# coding: utf-8
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Node


class TestNodeCRUD(APITestCase):
    """
        3.1.1 Пользователь может выполнять CRUD операции с узлами
    """

    def setUp(self):
        items = [
            {'name': 'ams1', 'address': 'Washington DC'},
            {'name': 'nyc1', 'address': 'New York'},
            {'name': 'frt1', 'address': 'Frankfurt'},
        ]

        for item in items:
            Node.objects.create(**item)

    def test_node_list(self):
        url = reverse('api:node-list')
        response = self.client.get(url, format='json')
        data = [{'id': obj.id, 'name': obj.name, 'address': obj.address}
                for obj in Node.objects.all()]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_node_detail(self):
        url = reverse('api:node-detail', args=[1])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'id': 1, 'name': 'ams1', 'address': 'Washington DC'})

    def test_node_create(self):
        url = reverse('api:node-list')
        data = {'name': 'nyc2', 'address': 'New York'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response_data = response.data
        del response_data['id']
        self.assertEqual(response_data, data)

    def test_node_update(self):
        url = reverse('api:node-detail', args=[2])
        data = {'address': 'New York, New York'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['address'], data['address'])

    def test_node_delete(self):
        url = reverse('api:node-detail', args=[3])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Node.objects.count(), 2)


class TestNodeServer(APITestCase):
    """
        3.4 Пользователь может просмотривать список
            серверов определнного узла (включая blade)
    """
    fixtures = ['erp_test/tests/fixtures/node_servers.json',]

    def test_node_server_list(self):
        url = reverse('api:node-server-list', args=[1])
        response = self.client.get(url, format='json')
        # тупая проверка количеством
        self.assertEqual(len(response.data), 2)
