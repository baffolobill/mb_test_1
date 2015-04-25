# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0002_component_state'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='servercomponents',
            unique_together=set([]),
        ),
        migrations.RemoveField(
            model_name='servercomponents',
            name='component',
        ),
        migrations.RemoveField(
            model_name='servercomponents',
            name='server',
        ),
        migrations.RemoveField(
            model_name='server',
            name='components',
        ),
        migrations.AddField(
            model_name='server',
            name='components_1',
            field=models.ManyToManyField(to='erp_test.Component'),
        ),
        migrations.DeleteModel(
            name='ServerComponents',
        ),
    ]
