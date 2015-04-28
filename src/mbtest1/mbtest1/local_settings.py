# coding: utf-8
import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'mbtest1',
        'USER': 'mbtest1',
        'PASSWORD': 'password',
        'HOST': os.environ.get('POSTGRESQL_HOST', 'localhost'),
        'PORT': '',
    }
}

DEBUG = True
TEMPLATE_DEBUG = DEBUG

STATIC_ROOT = os.path.abspath(os.path.join("/webapps/mb-test-1", "static"))
MEDIA_ROOT = os.path.abspath(os.path.join("/webapps/mb-test-1", "media"))

SECRET_KEY = 'uu@12k8y6m_+_%xgyf()(7hhyfcl$%@=6l6av10*$40rp5dn*d'
