# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


def trigger_save_signal(apps, schema_editor):
    Server = apps.get_model('erp_test', 'Server')
    for server in Server.objects.all():
        node = server.node
        node.servers_count = node.servers.count()
        node.save()

        template = server.template
        template.servers_uses = template.servers.count()
        template.save()


class Migration(migrations.Migration):

    dependencies = [
        ('erp_test', '0019_auto_20150522_1014'),
    ]

    operations = [
        migrations.RunPython(trigger_save_signal),
    ]
