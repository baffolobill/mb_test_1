# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0009_auto_20150423_2120'),
    ]

    operations = [
        migrations.AddField(
            model_name='basket',
            name='unit_takes',
            field=models.PositiveSmallIntegerField(default=1, verbose_name='height in units'),
        ),
    ]
