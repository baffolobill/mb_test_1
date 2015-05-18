# coding: utf-8
from django.core.urlresolvers import reverse
from django.shortcuts import redirect
from django.views.generic import ListView, DetailView
from django.views.generic.edit import CreateView

from erp_test.models import ServerTemplate
from erp_client.views.common import (
    BaseDeleteView, BaseUpdateView, CreateUpdateDeleteMixin)
from erp_client.forms import (
    ServerTemplateForm, ServerTemplateHddFormSet,
    ServerTemplateHddFormSetHelper)


class FormSetMixin(object):
    object = None

    def get(self, request, *args, **kwargs):
        if getattr(self, 'is_update_view', False):
            self.object = self.get_object()
        form_class = self.get_form_class()
        form = self.get_form(form_class)
        formset_class = self.get_formset_class()
        formset = self.get_formset(formset_class)
        return self.render_to_response(self.get_context_data(form=form, formset=formset))

    def post(self, request, *args, **kwargs):
        if getattr(self, 'is_update_view', False):
            self.object = self.get_object()
        form_class = self.get_form_class()
        form = self.get_form(form_class)
        formset_class = self.get_formset_class()
        formset = self.get_formset(formset_class)
        if form.is_valid() and formset.is_valid():
            return self.form_valid(form, formset)
        else:
            return self.form_invalid(form, formset)

    def get_formset_class(self):
        return self.formset_class

    def get_formset(self, formset_class):
        return formset_class(**self.get_formset_kwargs())

    def get_formset_kwargs(self):
        kwargs = {
            'instance': self.object
        }
        if self.request.method in ('POST', 'PUT'):
            kwargs.update({
                'data': self.request.POST,
                'files': self.request.FILES,
            })
        return kwargs

    def form_valid(self, form, formset):
        self.object = form.save()
        formset.instance = self.object
        formset.save()
        if hasattr(self, 'get_success_message'):
            self.get_success_message(form)
        return redirect(self.get_success_url())

    def form_invalid(self, form, formset):
        return self.render_to_response(self.get_context_data(form=form, formset=formset))


class ServerTemplateModelMixin(object):
    model = ServerTemplate


class ServerTemplateListView(ServerTemplateModelMixin, ListView):
    template_name = 'erp_client/server_templates/list.html'


class ServerTemplateDetailView(ServerTemplateModelMixin, DetailView):
    template_name = 'erp_client/server_templates/detail.html'


class ServerTemplateUpdateView(ServerTemplateModelMixin, FormSetMixin, BaseUpdateView):
    template_name = 'erp_client/server_templates/create_and_update.html'
    form_class = ServerTemplateForm
    is_update_view = True
    model = ServerTemplate
    form_class = ServerTemplateForm
    formset_class = ServerTemplateHddFormSet

    def get_context_data(self, **kwargs):
        context = super(ServerTemplateUpdateView, self).get_context_data(**kwargs)
        context['formset_helper'] = ServerTemplateHddFormSetHelper()
        return context


class ServerTemplateCreateView(ServerTemplateModelMixin, FormSetMixin, CreateUpdateDeleteMixin, CreateView):
    template_name = 'erp_client/server_templates/create_and_update.html'
    model = ServerTemplate
    form_class = ServerTemplateForm
    formset_class = ServerTemplateHddFormSet

    def get_success_url(self):
        return reverse('client:{}-detail'.format(self.get_model_name()),
                       args=[self.object.pk])

    def get_context_data(self, **kwargs):
        context = super(ServerTemplateCreateView, self).get_context_data(**kwargs)
        context['formset_helper'] = ServerTemplateHddFormSetHelper()
        return context


class ServerTemplateDeleteView(ServerTemplateModelMixin, BaseDeleteView):
    pass
