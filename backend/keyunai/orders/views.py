from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView # 💡 เพิ่มตัวนี้เข้ามา
from .models import Order, OrderItem
from products.models import Game
from .serializers import OrderSerializer

class UserOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    # บังคับว่าต้อง Login ก่อนถึงจะเรียก API นี้ได้
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # ดึงมาเฉพาะบิลสั่งซื้อของ User คนที่กำลังล็อกอินอยู่
        return Order.objects.filter(user=self.request.user).order_by('-created_at')
    
class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated] # ต้องล็อกอินถึงจะซื้อได้

    def post(self, request):
        items = request.data.get('items', [])
        
        if not items:
            return Response({"detail": "ตะกร้าสินค้าว่างเปล่า"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. สร้างบิลคำสั่งซื้อใหม่
        order = Order.objects.create(user=request.user, total_price=0, status='PENDING')
        total = 0

        # 2. วนลูปเอาเกมใส่เข้าไปในบิล
        for item in items:
            try:
                game = Game.objects.get(id=item['game_id'])
                qty = item['quantity']
                
                # 💡 ถ้าซื้อ 2 ชิ้น ต้องสร้าง OrderItem 2 แถว เพื่อเตรียมใส่คีย์ 2 โค้ด
                for _ in range(qty):
                    OrderItem.objects.create(
                        order=order, 
                        game=game, 
                        price=game.price
                    )
                    total += game.price
            except Game.DoesNotExist:
                return Response({"detail": f"ไม่พบเกม ID {item['game_id']}"}, status=status.HTTP_400_BAD_REQUEST)

        # 3. อัปเดตราคารวม
        order.total_price = total
        order.save()

        return Response({
            "detail": "สั่งซื้อสำเร็จ", 
            "order_id": order.id
        }, status=status.HTTP_201_CREATED)