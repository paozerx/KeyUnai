from django.db import transaction

from inventory.models import GameKey
from .models import Order, OrderItem


def assign_keys_to_order(order: Order) -> str:
    """
    จัดสรรคีย์จากสต็อก (GameKey ที่แอดมินเพิ่มในระบบ) ให้แต่ละรายการ
    ต้องเรียกภายใน transaction.atomic — ถ้าไม่สำเร็จจะ raise ValueError
    """
    items = list(order.items.select_related('game', 'game_key').select_for_update().all())
    if not items:
        raise ValueError('ไม่พบรายการในคำสั่งซื้อ')

    pending = [item for item in items if not item.game_key_id]
    reserved: list[tuple[OrderItem, GameKey]] = []

    for item in pending:
        available_key = (
            GameKey.objects.select_for_update()
            .filter(game=item.game, is_sold=False)
            .order_by('added_at')
            .first()
        )
        if not available_key:
            raise ValueError(f'ไม่มีคีย์คงเหลือสำหรับ "{item.game.title}"')
        reserved.append((item, available_key))

    for item, available_key in reserved:
        available_key.is_sold = True
        available_key.save(update_fields=['is_sold'])
        item.game_key = available_key
        item.save(update_fields=['game_key'])

    return 'จัดสรรคีย์สำเร็จ'


@transaction.atomic
def approve_order(order: Order) -> tuple[bool, str]:
    if order.status not in ('PENDING', 'AWAITING_APPROVAL'):
        return False, 'สถานะคำสั่งซื้อไม่สามารถอนุมัติได้'

    try:
        message = assign_keys_to_order(order)
    except ValueError as e:
        return False, str(e)

    order.status = 'COMPLETED'
    order.save(update_fields=['status'])
    return True, message


@transaction.atomic
def reject_order(order: Order, note: str = '') -> tuple[bool, str]:
    if order.status in ('COMPLETED', 'CANCELED'):
        return False, 'ไม่สามารถปฏิเสธคำสั่งซื้อนี้ได้'

    for item in order.items.select_for_update().filter(game_key__isnull=False):
        key = item.game_key
        key.is_sold = False
        key.save(update_fields=['is_sold'])
        item.game_key = None
        item.key_revealed = False
        item.save(update_fields=['game_key', 'key_revealed'])

    order.status = 'REJECTED'
    if note:
        order.admin_note = note
    order.save(update_fields=['status', 'admin_note'])
    return True, 'ปฏิเสธคำสั่งซื้อแล้ว'
