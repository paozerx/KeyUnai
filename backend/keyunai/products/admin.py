from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Game

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('title', 'platform', 'price', 'is_active')
    search_fields = ('title',)