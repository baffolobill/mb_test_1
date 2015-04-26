# coding: utf-8
"""
1.1 Пользователь может управлять компонентами и их характеристиками (CRUD).
1.2 Пользователь может просмотривать свободные компоненты
    (недобавленные к серверу)
"""
import copy

from django.test import TestCase
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Component
from ..defaults import ComponentState


class TestComponentsCRUD(APITestCase):
    """
        TODO: не реализована работа с характеристиками
    """
    fixtures = ['erp_test/tests/fixtures/components_crud.json',]

    def test_component_list(self):
        url = reverse('component-list')
        response = self.client.get(url, format='json')
        data = [{'id': obj.id, 'name': obj.name, 'manufacturer': obj.manufacturer,
                 'model_name': obj.model_name, 'serial_number': obj.serial_number,
                 'state': obj.state, 'kind': obj.kind_id}
                for obj in Component.objects.all()]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_component_list_of_kind(self):
        url = reverse('component-list-of_kind', args=['cpu'])
        response = self.client.get(url, format='json')
        data = [{'id': obj.id, 'name': obj.name, 'manufacturer': obj.manufacturer,
                 'model_name': obj.model_name, 'serial_number': obj.serial_number,
                 'state': obj.state, 'kind': obj.kind_id}
                for obj in Component.objects.of_kind(kind='cpu')]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_component_detail(self):
        url = reverse('component-detail', args=[1])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data,
                         {'id': 1,
                          'name': 'Intel Xeon Haswell-EP',
                          'state': 'free',
                          'serial_number': '1234',
                          'model_name': 'Xeon Haswell-EP',
                          'manufacturer': 'Intel',
                          'kind': 1})

    def test_component_create(self):
        url = reverse('component-list')
        data = {
            'name': 'Intel Outside',
            'state': 'free',
            'serial_number': '4321',
            'model_name': 'Outside',
            'manufacturer': 'Intel',
            'kind': 1,
        }
        have_to_return = copy.copy(data)
        have_to_return['id'] = 5
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, have_to_return)

    def test_component_create__kind_required(self):
        url = reverse('component-list')
        data = {
            'name': 'Intel Outside',
            'state': 'free',
            'serial_number': '4321',
            'model_name': 'Outside',
            'manufacturer': 'Intel',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_component_create_of_kind(self):
        url = reverse('component-list-of_kind', args=['cpu'])
        data = {
            'name': 'Intel Outside',
            'state': 'free',
            'serial_number': '4321',
            'model_name': 'Outside',
            'manufacturer': 'Intel',
        }
        have_to_return = copy.copy(data)
        have_to_return['id'] = 5
        have_to_return['kind'] = 1
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, have_to_return)

    def test_component_update(self):
        url = reverse('component-detail', args=[2])
        data = {'state': 'installed'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['state'], data['state'])

    def test_component_delete(self):
        url = reverse('component-detail', args=[3])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Component.objects.count(), 3)


if False:
    class TestComponentModel(TestCase):
        fixtures = ['erp_test/tests/fixtures/basket_model_test.json']

        def _create_server(self):
            template = ServerTemplate.objects.all()[0]
            return Server.objects.create(template=template)

        def test_find_free_position(self):
            basket = Basket.objects.all()[0]

            # initial
            self.assertEqual(basket.slots.count(), 0)
            self.assertEqual(basket.find_free_position(), 1)

            # with server at position 1
            basket.mount(server=self._create_server(), position=1)
            self.assertEqual(basket.slots.count(), 1)
            self.assertEqual(basket.find_free_position(), 2)

            # with server at position 3
            basket.mount(server=self._create_server(), position=3)
            self.assertEqual(basket.slots.count(), 2)
            self.assertEqual(basket.find_free_position(), 2)

        def test_find_free_position_in_filled_basket(self):
            basket = Basket.objects.all()[0]
            for position in xrange(1, 9):
                basket.mount(server=self._create_server(), position=position)

            with self.assertRaises(BasketIsFilled):
                basket.mount(server=self._create_server())

        def test_mount(self):
            basket = Basket.objects.all()[0]

            self.assertEqual(basket.slots.count(), 0)
            basket.mount(server=self._create_server(), position=1)
            self.assertEqual(basket.slots.count(), 1)

        def test_mount_at_the_same_position(self):
            basket = Basket.objects.all()[0]

            self.assertEqual(basket.slots.count(), 0)
            basket.mount(server=self._create_server(), position=1)
            self.assertEqual(basket.slots.count(), 1)

            with self.assertRaises(BasketSlotIsBusy):
                basket.mount(server=self._create_server(), position=1)

        def test_mount_in_filled_basket(self):
            basket = Basket.objects.all()[0]
            for position in xrange(1, 9):
                basket.mount(server=self._create_server(), position=position)

            with self.assertRaises(BasketIsFilled):
                basket.mount(server=self._create_server())

        def test_mount_with_position_None(self):
            basket = Basket.objects.all()[0]
            basket.mount(server=self._create_server(), position=None)
            self.assertEqual(basket.slots.all()[0].position, 1)

        def test_unmount(self):
            basket = Basket.objects.all()[0]
            server_1 = self._create_server()

            self.assertEqual(basket.slots.count(), 0)

            basket.mount(server=server_1, position=1)
            self.assertEqual(basket.slots.count(), 1)

            basket.unmount(server=server_1)
            self.assertEqual(basket.slots.count(), 0)


class TestComponentActions(APITestCase):
    fixtures = ['erp_test/tests/fixtures/component_actions.json']

    def test_list_all_free_components(self):
        url = reverse('component-list')
        url = "{}?state=free".format(url)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Component.objects.with_state(ComponentState.FREE).count(), 4)

    def test_list_free_components_of_kind(self):
        url = reverse('component-list')
        url = "{}?state=free".format(url)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Component.objects.of_kind(kind='cpu').with_state(ComponentState.FREE).count(), 1)
