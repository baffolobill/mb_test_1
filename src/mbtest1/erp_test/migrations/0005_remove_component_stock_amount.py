# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0004_auto_20150423_1303'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='component',
            name='stock_amount',
        ),
    ]
