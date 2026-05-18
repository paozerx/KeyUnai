from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import GameKey

@admin.register(GameKey)
class GameKeyAdmin(admin.ModelAdmin):
    list_display = ('game', 'key_code', 'is_sold', 'added_at')
    list_filter = ('is_sold', 'game__platform')