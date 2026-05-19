from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from products.models import Game
from .models import Order, OrderItem, PaymentSettings
from .serializers import OrderSerializer, PaymentSettingsSerializer


class PaymentSettingsView(APIView):
    """ข้อมูลบัญชี/QR สำหรับชำระเงิน (ไม่ต้อง login)"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        settings = PaymentSettings.objects.filter(is_active=True).first()
        if not settings:
            return Response({
                'bank_name': 'ธนาคารกสิกรไทย',
                'account_name': 'KeyUnai',
                'account_number': '000-0-00000-0',
                'qr_code_url': None,
            })
        serializer = PaymentSettingsSerializer(settings, context={'request': request})
        return Response(serializer.data)


class UserOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            'items__game', 'items__game_key'
        )

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}


class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        items = request.data.get('items', [])

        if not items:
            return Response({"detail": "ตะกร้าสินค้าว่างเปล่า"}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(user=request.user, total_price=0, status='PENDING')
        total = 0

        for item in items:
            try:
                game = Game.objects.get(id=item['game_id'], is_active=True)
                qty = int(item.get('quantity', 1))
                if qty < 1:
                    continue
                for _ in range(qty):
                    OrderItem.objects.create(order=order, game=game, price=game.price)
                    total += game.price
            except Game.DoesNotExist:
                return Response(
                    {"detail": f"ไม่พบเกม ID {item['game_id']}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if total <= 0:
            return Response({"detail": "ไม่มีรายการสินค้าในคำสั่งซื้อ"}, status=status.HTTP_400_BAD_REQUEST)

        order.total_price = total
        order.save(update_fields=['total_price'])

        return Response({
            "detail": "สร้างคำสั่งซื้อสำเร็จ",
            "order_id": order.id,
        }, status=status.HTTP_201_CREATED)


class UploadSlipView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({"detail": "ไม่พบคำสั่งซื้อ"}, status=status.HTTP_404_NOT_FOUND)

        if order.status not in ('PENDING', 'AWAITING_APPROVAL'):
            return Response(
                {"detail": "คำสั่งซื้อนี้ไม่สามารถอัปโหลดสลิปได้"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.payment_slip:
            return Response(
                {"detail": "อัปโหลดสลิปแล้ว"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        slip = request.FILES.get('payment_slip')
        if not slip:
            return Response({"detail": "กรุณาแนบไฟล์สลิป"}, status=status.HTTP_400_BAD_REQUEST)

        order.payment_slip = slip
        order.slip_uploaded_at = timezone.now()
        order.status = 'AWAITING_APPROVAL'
        order.save()

        serializer = OrderSerializer(order, context={'request': request})
        return Response({
            "detail": "อัปโหลดสลิปสำเร็จ รอแอดมินตรวจสอบ",
            "order": serializer.data,
        })


class RevealKeyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, item_id):
        try:
            item = OrderItem.objects.select_related('order', 'game_key').get(
                pk=item_id,
                order_id=pk,
                order__user=request.user,
            )
        except OrderItem.DoesNotExist:
            return Response({"detail": "ไม่พบรายการ"}, status=status.HTTP_404_NOT_FOUND)

        if item.order.status != 'COMPLETED':
            return Response(
                {"detail": "คำสั่งซื้อยังไม่ได้รับการอนุมัติ"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not item.game_key_id:
            return Response(
                {"detail": "ยังไม่มีคีย์สำหรับรายการนี้"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if item.key_revealed:
            return Response({"detail": "เปิดคีย์แล้ว"}, status=status.HTTP_400_BAD_REQUEST)

        item.key_revealed = True
        item.save(update_fields=['key_revealed'])

        return Response({
            "detail": "เปิดคีย์สำเร็จ",
            "key_code": item.game_key.key_code,
        })
