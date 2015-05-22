# coding: utf-8
from django.core.urlresolvers import reverse
from django.views.generic.edit import DeleteView, CreateView, UpdateView
from django.utils.translation import ugettext as _

from crispy_forms.layout import Submit, HTML
from crispy_forms.bootstrap import FormActions


class CreateUpdateDeleteMixin(object):

    def get_context_data(self, **kwargs):
        context = super(CreateUpdateDeleteMixin, self).get_context_data(**kwargs)
        context['section_name'] = self.model._meta.verbose_name
        return context

    def get_model_name(self):
        return self.model._meta.model_name.lower()


class BaseDeleteView(CreateUpdateDeleteMixin, DeleteView):
    template_name = 'erp_client/common/confirm_delete.html'

    def get_context_data(self, **kwargs):
        context = super(BaseDeleteView, self).get_context_data(**kwargs)
        context['cancel_url'] = reverse('{}-detail'.format(self.get_model_name()),
                                        args=[self.object.pk])
        return context

    def get_success_url(self):
        return reverse('{}-list'.format(self.get_model_name()))


class BaseUpdateView(CreateUpdateDeleteMixin, UpdateView):
    template_name = 'erp_client/common/update.html'

    def get_success_url(self):
        return reverse('{}-detail'.format(self.get_model_name()),
                       args=[self.object.pk])


class BaseCreateView(CreateUpdateDeleteMixin, CreateView):
    template_name = 'erp_client/common/create.html'

    def get_success_url(self):
        return reverse('{}-detail'.format(self.get_model_name()),
                       args=[self.object.pk])

    def get_form(self, *args, **kwargs):
        form = super(BaseCreateView, self).get_form(*args, **kwargs)
        form.helper.layout[-1][-1] = HTML("<a class='btn' href='{{% url \"{}-list\" %}}'>Cancel</a>".format(self.get_model_name()))
        return form
