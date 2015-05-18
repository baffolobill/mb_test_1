# coding: utf-8
"""
3.2 Пользователь может размещать корзины в юнитах
"""
from django.test import TestCase
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Basket, BasketSlot, Server, ServerTemplate, Rack
from ..exceptions import BasketIsFilled, BasketSlotIsBusy


class TestBasketCRUD(APITestCase):

    def setUp(self):
        baskets = [
            {'name': 'basket #1', 'slot_qty': 8, 'unit_takes': 4},
            {'name': 'basket #2', 'slot_qty': 8, 'unit_takes': 4},
            {'name': 'basket #3', 'slot_qty': 8, 'unit_takes': 4},
        ]
        for item in baskets:
            Basket.objects.create(**item)

    def test_basket_list(self):
        url = reverse('api:basket-list')
        response = self.client.get(url, format='json')
        data = [{'id': obj.id, 'name': obj.name, 'slot_qty': obj.slot_qty, 'unit_takes': obj.unit_takes}
                for obj in Basket.objects.all()]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_basket_detail(self):
        url = reverse('api:basket-detail', args=[1])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'id': 1, 'name': 'basket #1', 'slot_qty': 8, 'unit_takes': 4})

    def test_basket_create(self):
        url = reverse('api:basket-list')
        data = {'name': 'baz', 'slot_qty': 8, 'unit_takes': 4}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data,
                         {'id': 4, 'name': 'baz', 'slot_qty': 8, 'unit_takes': 4})

    def test_basket_update(self):
        url = reverse('api:basket-detail', args=[2])
        data = {'name': 'basket #4'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], data['name'])

    def test_basket_delete(self):
        url = reverse('api:basket-detail', args=[3])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Basket.objects.count(), 2)


class TestBasketModel(TestCase):
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


class TestBasketActions(APITestCase):
    fixtures = ['erp_test/tests/fixtures/basket_actions.json']

    def test_action_install_server(self):
        url = reverse('api:basket-actions', args=[1])
        data = {'type': 'install_server', 'server_id': 1}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        basket = Basket.objects.get(id=1)
        self.assertEqual(basket.slots.count(), 1)

    def test_action_install_server_at_position(self):
        url = reverse('api:basket-actions', args=[1])
        data = {'type': 'install_server', 'server_id': 1, 'position': 3}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        basket = Basket.objects.get(id=1)
        self.assertEqual(basket.slots.count(), 1)
        self.assertEqual(basket.slots.get(id=1).position, 3)

    def test_action_install_server_with_wrong_server_id(self):
        url = reverse('api:basket-actions', args=[1])
        data = {'type': 'install_server', 'server_id': 199999}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        basket = Basket.objects.get(id=1)
        self.assertEqual(basket.slots.count(), 0)

    def test_action_mount_to_rack(self):
        url = reverse('api:basket-actions', args=[1])
        data = {'type': 'mount_to_rack', 'rack_id': 1}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        rack = Rack.objects.get(id=1)
        self.assertEqual(rack.units.count(), 1)

    def test_action_mount_to_rack_at_position(self):
        url = reverse('api:basket-actions', args=[1])
        data = {'type': 'mount_to_rack', 'rack_id': 1, 'position': 3}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        rack = Rack.objects.get(id=1)
        self.assertEqual(rack.units.count(), 1)
        self.assertEqual(rack.units.get(id=1).position, 3)

    def test_action_mount_at_rack_with_wrong_rack_id(self):
        url = reverse('api:basket-actions', args=[1])
        data = {'type': 'mount_to_rack', 'rack_id': 199999}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        rack = Rack.objects.get(id=1)
        self.assertEqual(rack.units.count(), 0)

    def test_action_uninstall_server(self):
        basket = Basket.objects.get(id=1)
        server = Server.objects.get(id=1)
        basket.mount(server=server)
        self.assertEqual(basket.slots.count(), 1)

        url = reverse('api:basket-actions', args=[1])
        data = {'type': 'uninstall_server', 'server_id': 1}
        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(basket.slots.count(), 0)

    def test_action_uninstall_server_with_wrong_server_id(self):
        basket = Basket.objects.get(id=1)
        server = Server.objects.get(id=1)
        basket.mount(server=server)
        self.assertEqual(basket.slots.count(), 1)

        url = reverse('api:basket-actions', args=[1])
        data = {'type': 'uninstall_server', 'server_id': 12112}
        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(basket.slots.count(), 1)

    def test_action_unmount_from_rack(self):
        rack = Rack.objects.get(id=1)
        basket = Basket.objects.get(id=1)
        rack.mount(basket=basket, position=1)
        self.assertEqual(rack.units.count(), 1)

        url = reverse('api:basket-actions', args=[1])
        data = {'type': 'unmount_from_rack', 'rack_id': 1}
        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.assertEqual(rack.units.count(), 0)

    def test_action_unmount_from_rack_with_wrong_rack_id(self):
        rack = Rack.objects.get(id=1)
        basket = Basket.objects.get(id=1)
        rack.mount(basket=basket, position=1)
        self.assertEqual(rack.units.count(), 1)

        url = reverse('api:basket-actions', args=[1])
        data = {'type': 'unmount_from_rack', 'rack_id': 11212}
        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.assertEqual(rack.units.count(), 1)
