from django.contrib import admin
from .models import *


class PropertyOptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'position')


class ServerTemplateHddInline(admin.TabularInline):
    model = ServerTemplateHdd


class ServerTemplateAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'cpu_socket', 'cpu_qty',
        'ram_standard', 'ram_qty')
    inlines = [ServerTemplateHddInline,]


class GroupPropertiesInline(admin.TabularInline):
    model = Property.groups.through


class PropertyGroupAdmin(admin.ModelAdmin):
    inlines = [GroupPropertiesInline,]


class PropertyOptionsInline(admin.TabularInline):
    model = PropertyOption


class PropertyAdmin(admin.ModelAdmin):
    inlines = [PropertyOptionsInline,]


# Register your models here.
admin.site.register(Node)
admin.site.register(Floor)
admin.site.register(Room)
admin.site.register(Row)
admin.site.register(Rack)
admin.site.register(Unit)
admin.site.register(Component)
admin.site.register(PropertyGroup, PropertyGroupAdmin)
admin.site.register(Property, PropertyAdmin)
#admin.site.register(GroupsPropertiesRelation)
#admin.site.register(ComponentsPropertiesRelation)
#admin.site.register(PropertyOption, PropertyOptionAdmin)
admin.site.register(ComponentPropertyValue)
admin.site.register(ServerTemplate, ServerTemplateAdmin)
admin.site.register(ServerTemplateHdd)
admin.site.register(Server)
admin.site.register(Basket)
