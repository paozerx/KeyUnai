from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0 # ไม่โชว์ช่องว่างๆ เผื่อไว้

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_price', 'status', 'created_at')
    list_filter = ('status',)
    inlines = [OrderItemInline] # ให้โชว์รายการเกมซ้อนอยู่ข้างในหน้า Order เลย