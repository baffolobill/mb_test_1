# coding: utf-8
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.shortcuts import redirect, get_object_or_404
from django.views.generic import ListView, DetailView

from erp_test.models import Rack, Server, Basket
from erp_client.views.common import (
    BaseDeleteView, BaseUpdateView, BaseCreateView)
from erp_client.forms import RackForm, RackFilterForm, RackServerForm, RackBasketForm


class RackModelMixin(object):
    model = Rack


class RackListView(RackModelMixin, ListView):
    template_name = 'erp_client/racks/list.html'
    filter_form_class = RackFilterForm

    def get_filter_form(self):
        if not hasattr(self, '_filter_form'):
            self._filter_form = self.filter_form_class(self.request.GET)
        return self._filter_form

    def get_queryset(self):
        qs = super(RackListView, self).get_queryset()
        filter_form = self.get_filter_form()
        if filter_form.is_valid():
            fullness = filter_form.cleaned_data['fullness']
            height = filter_form.cleaned_data['height']
            return qs.with_fullness(fullness=fullness, height=height)
        return qs

    def get_context_data(self, **kwargs):
        ctx = super(RackListView, self).get_context_data(**kwargs)
        ctx['filter_form'] = self.get_filter_form()
        return ctx


class RackDetailView(RackModelMixin, DetailView):
    template_name = 'erp_client/racks/detail.html'


class RackUpdateView(RackModelMixin, BaseUpdateView):
    form_class = RackForm


class RackCreateView(RackModelMixin, BaseCreateView):
    form_class = RackForm


class RackDeleteView(RackModelMixin, BaseDeleteView):
    pass


class RackActionsView(RackModelMixin, DetailView):

    supported_actions = ['mount_server', 'unmount_server',
        'mount_basket', 'unmount_basket', 'mount']

    def get_server(self, pk=None):
        pk = pk or self.request.REQUEST.get('server_id')
        return get_object_or_404(Server, pk=pk)

    def get_basket(self, pk=None):
        pk = pk or self.request.REQUEST.get('basket_id')
        return get_object_or_404(Basket, pk=self.kwargs['pk'])

    def get_action(self):
        action = self.request.REQUEST.get('action')
        if action in self.supported_actions:
            return action
        return None

    def _mount_what(self):
        """
            From GET request.

            Gives an user opportunity to choose what to mount: server or basket.
        """
        self.template_name = 'erp_client/racks/actions/mount_what.html'

    def _mount_basket(self):
        """
        from GET request
        """
        self.template_name = 'erp_client/racks/actions/mount_basket.html'

    def _process_mount_basket(self):
        """
        from POST request
        """
        rack = self.get_object()
        form = RackBasketForm(self.request.POST, rack=rack)
        if not form.is_valid():
            self._mount_basket()
            return self.render_to_response(self.get_context_data(form=form))

        basket = self.get_basket(form.cleaned_data['basket'])
        position = form.cleaned_data.get('position', None)
        if basket.rack:
            basket.rack.unmount(basket=basket)

        try:
            rack.mount(basket=basket, position=position)
        except Exception as exc:
            messages.error(self.request, str(exc))
        else:
            messages.success(self.request, u'Basket "{}" has been mounted to the rack {}.'.format(basket.get_name, rack.get_name()))

        return redirect(self.get_success_url())

    def _process_unmount_basket(self):
        rack = self.get_object()
        basket = self.get_basket()
        if not basket.rack:
            messages.error(self.request, u'Basket is not mounted.')
            return

        try:
            rack.unmount(basket=basket)
        except Exception as exc:
            messages.error(self.request, str(exc))
        else:
            messages.success(self.request, u'Basket "{}" has been unmounted.'.format(basket.get_name()))

    def _mount_server(self):
        """
        from GET request.
        """
        self.template_name = 'erp_client/racks/actions/mount_server.html'

    def _process_mount_server(self):
        """
        from POST request.
        """
        rack = self.get_object()
        form = RackServerForm(self.request.POST, rack=rack)
        if not form.is_valid():
            self._mount_server()
            return self.render_to_response(self.get_context_data(form=form))

        server = self.get_server(form.cleaned_data['server'])
        position = form.cleaned_data.get('position', None)
        if server.is_mounted():
            rack.unmount(server=server)

        try:
            rack.mount(server=server, position=position)
        except Exception as exc:
            messages.error(self.request, str(exc))
        else:
            messages.success(self.request, u'Server "{}" has been mounted to the rack {}.'.format(server.get_name(), rack.get_name()))

        return redirect(self.get_success_url())

    def _process_unmount_server(self):
        rack = self.get_object()
        server = self.get_server()
        if not server.is_mounted():
            messages.error(self.request, u'Server is not mounted.')
            return

        try:
            rack.unmount(server=server)
        except Exception as exc:
            messages.error(self.request, str(exc))
        else:
            messages.success(self.request, u'Server "{}" has been unmounted from the Rack "{}".'.format(server.get_name(), rack.get_name()))

    def get_context_data(self, **kwargs):
        ctx = super(RackActionsView, self).get_context_data(**kwargs)
        action = self.get_action()
        if 'form' not in ctx:
            rack = self.get_object()
            form_kwargs = {
                'rack': rack
            }
            if self.request.GET.get('position'):
                form_kwargs['initial'] = {
                    'position': self.request.GET['position'],
                }
            if action == 'mount_basket':
                ctx['form'] = RackBasketForm(**form_kwargs)
            elif action == 'mount_server':
                ctx['form'] = RackServerForm(**form_kwargs)

        if action == 'mount':
            ctx['position'] = self.request.GET.get('position')

        return ctx

    def get(self, request, *args, **kwargs):
        action = self.get_action()
        if action == 'mount_basket':
            self._mount_basket()
        elif action == 'mount_server':
            self._mount_server()
        elif action == 'mount':
            self._mount_what()
        return super(RackActionsView, self).get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        if 'cancel' in request.POST:
            return redirect(self.get_success_url())
        self.object = self.get_object()
        action = self.get_action()
        if action == 'unmount_basket':
            self._process_unmount_basket()
        elif action == 'mount_basket':
            return self._process_mount_basket()
        elif action == 'unmount_server':
            self._process_unmount_server()
        elif action == 'mount_server':
            return self._process_mount_server()
        return redirect(self.get_success_url())

    def get_success_url(self):
        return reverse('client:rack-detail', args=[self.kwargs['pk']])
