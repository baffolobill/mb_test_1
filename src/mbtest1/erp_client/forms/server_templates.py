# coding: utf-8
from django import forms
from django.forms.models import inlineformset_factory
from django.utils.translation import ugettext as _

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Div, Submit, HTML, Button, Row, Field
from crispy_forms.bootstrap import AppendedText, PrependedText, FormActions

from erp_test.models import ServerTemplate, ServerTemplateHdd


class ServerTemplateForm(forms.ModelForm):

    helper = FormHelper()
    helper.form_class = 'form-horizontal'
    helper.layout = Layout(
        Div(
            Div('name', css_class='col-xs-12'),
            css_class='row-fluid'
        ),
        Div(
            Div('unit_takes', css_class='col-xs-12'),
            css_class='row-fluid'
        ),
        Div(
            Div('cpu_socket', css_class='col-xs-6'),
            Div('cpu_qty', css_class='col-xs-6'),
            css_class='row-fluid'
        ),
        Div(
            Div('ram_standard', css_class='col-xs-6'),
            Div('ram_qty', css_class='col-xs-6'),
            css_class='row-fluid'
        )
    )
    helper.form_tag = False

    class Meta:
        model = ServerTemplate
        fields = ('name', 'cpu_socket', 'cpu_qty', 'ram_standard',
                  'ram_qty', 'unit_takes')

    def __init__(self, *args, **kwargs):
        super(ServerTemplateForm, self).__init__(*args, **kwargs)
        self.fields['cpu_socket'].choices = [
            (o.pk, o.name)
            for o in self.fields['cpu_socket'].queryset.all()
        ]
        self.fields['ram_standard'].choices = [
            (o.pk, o.name)
            for o in self.fields['ram_standard'].queryset.all()
        ]


class ServerTemplateHddForm(forms.ModelForm):

    class Meta:
        model = ServerTemplateHdd
        fields = ('id', 'hdd_form_factor', 'hdd_connection_type', 'hdd_qty')

    def __init__(self, *args, **kwargs):
        super(ServerTemplateHddForm, self).__init__(*args, **kwargs)
        self.fields['hdd_connection_type'].choices = [
            (o.pk, o.name)
            for o in self.fields['hdd_connection_type'].queryset.all()
        ]
        self.fields['hdd_form_factor'].choices = [
            (o.pk, o.name)
            for o in self.fields['hdd_form_factor'].queryset.all()
        ]

ServerTemplateHddFormSet = inlineformset_factory(ServerTemplate, ServerTemplateHdd, form=ServerTemplateHddForm, extra=0, min_num=1, can_delete=True)


class ServerTemplateHddFormSetHelper(FormHelper):
    def __init__(self, *args, **kwargs):
        super(ServerTemplateHddFormSetHelper, self).__init__(*args, **kwargs)
        self.form_method = 'post'
        self.layout = Layout(
            Div(
                Div('hdd_form_factor', css_class='col-xs-4'),
                Div('hdd_connection_type', css_class='col-xs-4'),
                Div('hdd_qty', css_class='col-xs-4'),
                css_class='row-fluid'
            ),
        )
        self.render_required_fields = True
        self.form_tag = False
