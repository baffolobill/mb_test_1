# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0010_basket_unit_takes'),
    ]

    operations = [
        migrations.CreateModel(
            name='ServerTemplateHdd',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('hdd_qty', models.PositiveSmallIntegerField()),
                ('hdd_connection_type', models.ForeignKey(related_name='conn_type_opts', to='erp_test.PropertyOption')),
                ('hdd_form_factor', models.ForeignKey(related_name='form_factor_opts', to='erp_test.PropertyOption')),
                ('template', models.ForeignKey(to='erp_test.ServerTemplate')),
            ],
        ),
        migrations.RemoveField(
            model_name='unit',
            name='unit_takes',
        ),
    ]
