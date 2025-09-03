from django.urls import path
from . import views
from .views import (
    request_password_reset,
    reset_password,
    CustomerDetail,
    UserOrderList,
    OrderDetail,
    add_to_cart,
    view_cart,
    place_order,
    get_products,
    register_customer,
    login_customer,
    logout,
    get_single_product,
    CartItemDetail,
    contact_form,
    CustomerList,
    ProductListCreate,
    ProductDetail,
    AllOrderList,
)

urlpatterns = [
    path('', views.hello_user, name='hello_user'),
    path('getProducts/', get_products, name='get_products'),
    path('register/', register_customer, name='register_customer'),
    path('login/', login_customer, name='login_customer'),
    path('customer/', CustomerDetail.as_view(), name='customer_detail'),
    path('logout/', logout, name='logout'),
    path('request-password-reset/', request_password_reset, name='request_password_reset'),
    path('reset-password/<uidb64>/<token>/', reset_password, name='reset_password'),
    path('add-to-cart/', add_to_cart, name='add_to_cart'),
    path('view-cart/', view_cart, name='view_cart'),
    path('place-order/', place_order, name='place_order'),
    path('user-orders/', UserOrderList.as_view(), name='user_orders'),
    path('order/<int:pk>/', OrderDetail.as_view(), name='order_detail'),
    path('product/<int:pk>/', get_single_product, name='get_single_product'),
    path('cart-item/<int:pk>/', CartItemDetail.as_view(), name='cart_item_detail'),
    path('contact/', contact_form, name='contact_form'),

    # Admin Dashboard URLs
    path('customers/', CustomerList.as_view(), name='customer_list'),
    path('all-orders/', AllOrderList.as_view(), name='all_orders'),
    path('products/', ProductListCreate.as_view(), name='product_list_create'),
    path('products/<int:pk>/', ProductDetail.as_view(), name='product_detail'),
]