# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0008_auto_20150423_2118'),
    ]

    operations = [
        migrations.AlterField(
            model_name='server',
            name='basket',
            field=models.ForeignKey(related_name='servers', blank=True, to='erp_test.Basket', null=True),
        ),
    ]
