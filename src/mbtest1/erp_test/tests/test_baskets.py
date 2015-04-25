# coding: utf-8
"""
3.2 Пользователь может размещать корзины в юнитах
"""
from django.test import TestCase
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Basket, BasketSlot, Server, ServerTemplate
from ..exceptions import BasketIsFilled, BasketSlotIsBusy


class TestBasketCRUD(APITestCase):

    fixtures = []

    def setUp(self):
        baskets = [
            {'name': 'basket #1', 'slot_qty': 8, 'unit_takes': 4},
            {'name': 'basket #2', 'slot_qty': 8, 'unit_takes': 4},
            {'name': 'basket #3', 'slot_qty': 8, 'unit_takes': 4},
        ]
        for item in baskets:
            Basket.objects.create(**item)

    def test_basket_list(self):
        url = reverse('basket-list')
        response = self.client.get(url, format='json')
        data = [{'id': obj.id, 'name': obj.name, 'slot_qty': obj.slot_qty, 'unit_takes': obj.unit_takes}
                for obj in Basket.objects.all()]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_basket_detail(self):
        url = reverse('basket-detail', args=[1])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'id': 1, 'name': 'basket #1', 'slot_qty': 8, 'unit_takes': 4})

    def test_basket_create(self):
        url = reverse('basket-list')
        data = {'name': 'baz', 'slot_qty': 8, 'unit_takes': 4}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data,
                         {'id': 4, 'name': 'baz', 'slot_qty': 8, 'unit_takes': 4})

    def test_basket_update(self):
        url = reverse('basket-detail', args=[2])
        data = {'name': 'basket #4'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], data['name'])

    def test_basket_delete(self):
        url = reverse('basket-detail', args=[3])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Basket.objects.count(), 2)


class TestBasketModel(TestCase):
    fixtures = ['erp_test/tests/fixtures/basket_model_test.json']

    def test_find_position(self):
        pass

    def _create_server(self):
        template = ServerTemplate.objects.all()[0]
        return Server.objects.create(template=template)

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


class TestBasketActions(APITestCase):
    fixtures = []

    def test_action_install_server(self):
        pass

    def test_action_mount_to_rack(self):
        pass

    def test_action_uninstall_server(self):
        pass

    def test_action_unmount_from_rack(self):
        pass
