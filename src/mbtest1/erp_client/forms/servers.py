# coding: utf-8
from django import forms
from django.utils.translation import ugettext as _

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Div, Submit, HTML, Button, Row, Field
from crispy_forms.bootstrap import AppendedText, PrependedText, FormActions

from erp_test.models import Server


class ServerForm(forms.ModelForm):

    helper = FormHelper()
    helper.form_class = 'form-horizontal'
    helper.layout = Layout(
        Div(
            Div('name'),
            css_class='row-fluid'
        ),
        Div(
            Div('template'),
            css_class='row-fluid'
        ),

        FormActions(
            Submit('save_changes', _('Save changes'), css_class="btn-primary"),
            Submit('cancel', 'Cancel'),
        )
    )

    class Meta:
        model = Server
        fields = ('name', 'template')
