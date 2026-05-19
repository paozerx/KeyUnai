from django import forms
from django.contrib import admin
from django.contrib import messages
from django.db.models import Q
from django.urls import reverse
from django.utils.html import format_html

from inventory.models import GameKey
from .models import Order, OrderItem, PaymentSettings
from .services import approve_order, reject_order


class OrderItemInlineForm(forms.ModelForm):
    class Meta:
        model = OrderItem
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'game_key' not in self.fields:
            return
        inst = self.instance
        if inst is not None and getattr(inst, 'game_id', None):
            self.fields['game_key'].queryset = GameKey.objects.filter(
                Q(game_id=inst.game_id) & (Q(is_sold=False) | Q(pk=inst.game_key_id))
            ).order_by('added_at')
        else:
            self.fields['game_key'].queryset = GameKey.objects.none()

    def clean_game_key(self):
        key = self.cleaned_data.get('game_key')
        if not key:
            return key
        inst = self.instance
        if inst.game_id and key.game_id != inst.game_id:
            raise forms.ValidationError('คีย์ต้องเป็นของเกมเดียวกับรายการนี้')
        if key.is_sold and inst.game_key_id != key.pk:
            raise forms.ValidationError('คีย์นี้ถูกใช้แล้ว — เลือกคีย์ว่างอื่น')
        return key


@admin.register(PaymentSettings)
class PaymentSettingsAdmin(admin.ModelAdmin):
    list_display = ('bank_name', 'account_name', 'account_number', 'is_active', 'updated_at')
    list_editable = ('is_active',)

    def has_add_permission(self, request):
        if PaymentSettings.objects.exists():
            return False
        return super().has_add_permission(request)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    form = OrderItemInlineForm
    extra = 0
    can_delete = False
    autocomplete_fields = ('game_key',)
    fields = ('game', 'price', 'game_key', 'key_revealed')
    readonly_fields = ('game', 'price', 'key_revealed')

    def get_readonly_fields(self, request, obj=None):
        # คำสั่งซื้อเสร็จแล้วไม่ให้แก้คีย์จาก inline (กันพลาด)
        ro = ('game', 'price', 'key_revealed')
        if obj and obj.status == 'COMPLETED':
            return ro + ('game_key',)
        return ro


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user', 'total_price', 'status', 'slip_preview',
        'slip_uploaded_at', 'created_at',
    )
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'id')
    readonly_fields = (
        'key_inventory_help',
        'user',
        'total_price',
        'created_at',
        'slip_uploaded_at',
        'slip_image',
    )
    inlines = [OrderItemInline]
    actions = ['approve_orders', 'complete_send_keys', 'reject_orders']

    fieldsets = (
        (
            'เพิ่มคีย์เกมให้ลูกค้า (คลังคีย์)',
            {
                'fields': ('key_inventory_help',),
                'description': (
                    'คีย์ต้องมีในคลังก่อน จึงจะเลือกผูกกับรายการในคำสั่งซื้อด้านล่างได้'
                ),
            },
        ),
        (
            None,
            {
                'fields': ('user', 'total_price', 'status', 'admin_note', 'created_at'),
                'description': (
                    'ส่งคีย์ให้ลูกค้า: (1) เลือกคีย์ในแต่ละรายการด้านล่าง แล้วกดบันทึก จากนั้นใช้ action '
                    '"ยืนยันส่งคีย์ให้ลูกค้า" หรือ (2) ใช้ "อนุมัติและดึงคีย์จากสต็อก" ให้ระบบจัดสรรคีย์ว่างให้อัตโนมัติ'
                ),
            },
        ),
        ('สลิปชำระเงิน', {
            'fields': ('payment_slip', 'slip_image', 'slip_uploaded_at'),
        }),
    )

    @admin.display(description='ลิงก์เพิ่มคีย์ / คลัง')
    def key_inventory_help(self, obj):
        add_url = reverse('admin:inventory_gamekey_add')
        list_url = reverse('admin:inventory_gamekey_changelist')
        return format_html(
            '<div style="padding:12px;background:#f0f7ff;border:1px solid #b6d4fe;border-radius:8px;max-width:720px;">'
            '<p style="margin:0 0 10px 0;"><strong>ขั้นตอนเพิ่มคีย์ให้ลูกค้า</strong></p>'
            '<ol style="margin:0 0 12px 18px;line-height:1.65;">'
            '<li><a href="{}" style="font-weight:600;">+ เพิ่มคีย์เกมในคลัง</a> (เลือกเกม ใส่รหัสคีย์)</li>'
            '<li>กลับมาที่หน้านี้ — ในแต่ละรายการสินค้าด้านล่าง เลือกคีย์จากคลัง แล้วกด <strong>บันทึก</strong></li>'
            '<li>ไปที่รายการคำสั่งซื้อ — เลือกออร์เดอร์นี้ — ใช้ action '
            '<strong>ยืนยันส่งคีย์ให้ลูกค้า</strong> (หรือ <strong>อนุมัติและดึงคีย์จากสต็อก</strong> ถ้ายังไม่ได้เลือกคีย์เอง)</li>'
            '</ol>'
            '<a href="{}">ดูคีย์ในคลังทั้งหมด</a>'
            '</div>',
            add_url,
            list_url,
        )

    def slip_preview(self, obj):
        if obj.payment_slip:
            return format_html(
                '<a href="{}" target="_blank">ดูสลิป</a>',
                obj.payment_slip.url,
            )
        return '-'
    slip_preview.short_description = 'สลิป'

    def slip_image(self, obj):
        if obj.payment_slip:
            return format_html(
                '<img src="{}" style="max-height:300px;border-radius:8px;" />',
                obj.payment_slip.url,
            )
        return 'ยังไม่มีสลิป'
    slip_image.short_description = 'ตัวอย่างสลิป'

    @admin.action(description='อนุมัติและดึงคีย์จากสต็อกให้อัตโนมัติ (รายการที่ยังไม่มีคีย์)')
    def approve_orders(self, request, queryset):
        success_count = 0
        for order in queryset:
            ok, msg = approve_order(order)
            if ok:
                success_count += 1
            else:
                self.message_user(
                    request,
                    f'Order #{order.id}: {msg}',
                    level=messages.ERROR,
                )
        if success_count:
            self.message_user(
                request,
                f'อนุมัติและจัดสรรคีย์สำเร็จ {success_count} รายการ',
                level=messages.SUCCESS,
            )

    @admin.action(description='ยืนยันส่งคีย์ให้ลูกค้า (ทุกรายการต้องมีคีย์แล้ว — ใช้หลังเลือกคีย์ในรายการ)')
    def complete_send_keys(self, request, queryset):
        success_count = 0
        for order in queryset:
            if order.status in ('COMPLETED', 'REJECTED', 'CANCELED'):
                self.message_user(
                    request,
                    f'คำสั่งซื้อ #{order.id}: ข้าม (สถานะ {order.get_status_display()})',
                    level=messages.WARNING,
                )
                continue
            if not order.items.exists():
                self.message_user(
                    request,
                    f'คำสั่งซื้อ #{order.id}: ไม่มีรายการสินค้า',
                    level=messages.ERROR,
                )
                continue
            if order.items.filter(game_key__isnull=True).exists():
                self.message_user(
                    request,
                    f'คำสั่งซื้อ #{order.id}: ยังมีรายการที่ไม่ได้เลือกคีย์',
                    level=messages.ERROR,
                )
                continue
            order.status = 'COMPLETED'
            order.save(update_fields=['status'])
            success_count += 1
        if success_count:
            self.message_user(
                request,
                f'ยืนยันส่งคีย์แล้ว {success_count} คำสั่งซื้อ — ลูกค้าสามารถกดเปิดคีย์ได้',
                level=messages.SUCCESS,
            )

    @admin.action(description='ปฏิเสธคำสั่งซื้อ')
    def reject_orders(self, request, queryset):
        for order in queryset:
            reject_order(order, note='ปฏิเสธโดยแอดมิน')
        self.message_user(request, f'ปฏิเสธ {queryset.count()} รายการ', level=messages.WARNING)
