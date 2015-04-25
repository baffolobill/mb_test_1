# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0003_auto_20150423_1303'),
    ]

    operations = [
        migrations.RenameField(
            model_name='server',
            old_name='components_1',
            new_name='components',
        ),
    ]
