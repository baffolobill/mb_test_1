# coding: utf-8
from django import forms
from django.utils.translation import ugettext as _

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Div, Submit, HTML, Button, Row, Field
from crispy_forms.bootstrap import AppendedText, PrependedText, FormActions

from erp_test.models import Component, PropertyOption
from erp_test.defaults import ComponentState


class ComponentFilterForm(forms.Form):
    def _kind_choices():
        return PropertyOption.objects\
            .values_list('id', 'name')\
            .filter(property__name='component.kind')

    kind = forms.ChoiceField(
        choices=[('', 'All')]+list(_kind_choices()),
        required=False)
    state = forms.ChoiceField(
        choices=[(ComponentState._ALL, 'All')]+list(ComponentState.CHOICES),
        required=False)


class ComponentForm(forms.ModelForm):

    helper = FormHelper()
    helper.form_class = 'form-horizontal'
    helper.layout = Layout(
        Div(
            Div('name'),
            css_class='row-fluid'
        ),
        Div(
            Div('manufacturer'),
            css_class='row-fluid'
        ),
        Div(
            Div('model_name'),
            css_class='row-fluid'
        ),
        Div(
            Div('serial_number'),
            css_class='row-fluid'
        ),
        Div(
            Div('kind'),
            css_class='row-fluid'
        ),
        FormActions(
            Submit('save_changes', _('Save changes'), css_class="btn-primary"),
            Submit('cancel', 'Cancel'),
        )
    )

    def __init__(self, *args, **kwargs):
        super(ComponentForm, self).__init__(*args, **kwargs)
        self.fields['kind'].choices = [
            (o.pk, o.name)
            for o in self.fields['kind'].queryset.all()
        ]

    class Meta:
        model = Component
        fields = ('name', 'manufacturer', 'model_name', 'serial_number', 'kind')
