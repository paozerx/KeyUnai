from django.urls import path
from . import views

urlpatterns = [
    # api/orders/
    path('', views.UserOrderListView.as_view(), name='user-orders'),
    path('create/', views.CreateOrderView.as_view(), name='create-order'),
]