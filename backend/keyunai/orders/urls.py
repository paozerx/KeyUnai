from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserOrderListView.as_view(), name='user-orders'),
    path('create/', views.CreateOrderView.as_view(), name='create-order'),
    path('payment-settings/', views.PaymentSettingsView.as_view(), name='payment-settings'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/upload-slip/', views.UploadSlipView.as_view(), name='upload-slip'),
    path('<int:pk>/items/<int:item_id>/reveal-key/', views.RevealKeyView.as_view(), name='reveal-key'),
]
