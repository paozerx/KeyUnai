from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions
from .models import Order
from .serializers import OrderSerializer

class UserOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    # บังคับว่าต้อง Login ก่อนถึงจะเรียก API นี้ได้
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # ดึงมาเฉพาะบิลสั่งซื้อของ User คนที่กำลังล็อกอินอยู่
        return Order.objects.filter(user=self.request.user).order_by('-created_at')