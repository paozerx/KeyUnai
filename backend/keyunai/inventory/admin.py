from django.contrib import admin

from .models import GameKey


@admin.register(GameKey)
class GameKeyAdmin(admin.ModelAdmin):
    list_display = ('game', 'key_code', 'is_sold', 'added_at')
    list_filter = ('is_sold', 'game__platform')
    search_fields = ('key_code', 'game__title')
    autocomplete_fields = ('game',)
    ordering = ('-added_at',)
    readonly_fields = ('added_at',)
    fieldsets = (
        ('เพิ่มคีย์ให้ลูกค้าใช้ในคำสั่งซื้อ', {
            'fields': ('game', 'key_code', 'is_sold'),
            'description': (
                'เลือกเกม ใส่รหัสคีย์ แล้วบันทึก — จากนั้นไปที่คำสั่งซื้อ (Orders) '
                'เพื่อผูกคีย์กับรายการ หรือใช้ action อนุมัติดึงคีย์จากคลังอัตโนมัติ'
            ),
        }),
        ('เมตา', {
            'fields': ('added_at',),
            'classes': ('collapse',),
        }),
    )
