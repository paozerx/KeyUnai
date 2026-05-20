from django.contrib import admin

from .models import Game


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('title', 'platform', 'price', 'is_active')
    list_filter = ('platform', 'is_active')
    search_fields = ('title', 'description', 'detail_info')
    fieldsets = (
        (
            'ข้อมูลร้าน (หน้าแรก / การ์ด)',
            {
                'fields': ('title', 'platform', 'price', 'cover_image_url', 'is_active', 'description'),
            },
        ),
        (
            'หน้ารายละเอียดเกม (ลูกค้ากดเข้าเกม)',
            {
                'fields': ('detail_info', 'key_usage_guide'),
                'description': 'เนื้อหาส่วนนี้แสดงในหน้าเกมเมื่อลูกค้ากดจากการ์ด — ใช้ขึ้นบรรทัดใหม่ได้',
            },
        ),
    )
