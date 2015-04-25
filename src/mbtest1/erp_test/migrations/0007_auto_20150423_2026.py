# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0006_auto_20150423_2018'),
    ]

    operations = [
        migrations.AddField(
            model_name='server',
            name='node',
            field=models.ForeignKey(related_name='servers', default=1, to='erp_test.Node'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='server',
            name='rack',
            field=models.ForeignKey(related_name='servers', default=1, to='erp_test.Rack'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='server',
            name='template',
            field=models.ForeignKey(related_name='servers', to='erp_test.ServerTemplate'),
        ),
    ]
