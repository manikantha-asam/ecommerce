from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Customer, Orders, OrderItem, Cart, CartItem
from .serializers import ProductSerializer, CustomerSerializer, OrderSerializer, CartItemSerializer, OrderItemSerializer, ContactFormSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from rest_framework import generics
import logging
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.core.mail import send_mail, BadHeaderError
from rest_framework.views import APIView
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
from django.conf import settings
from .models import CartItem
from rest_framework import filters # Import filters
from django_filters.rest_framework import DjangoFilterBackend # Import DjangoFilterBackend

# Configure logging
logger = logging.getLogger(__name__)

# Get the custom user model
User = get_user_model()


@api_view(['GET'])
def hello_user(request):
    return Response("Hello Developer")

@api_view(['GET'])
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_single_product(request, pk):
    try:
        product = Product.objects.get(id=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def register_customer(request):
    serializer = CustomerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_customer(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    print(user)
    if user is not None:
        # Update last login time
        Customer.objects.filter(username=username).update(last_login=timezone.now())

        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)
    else:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout(request):
    try:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response({"detail": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CustomerDetail(generics.RetrieveUpdateAPIView):
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Customer.objects.get(username=self.request.user.username)

@api_view(['POST'])
def request_password_reset(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"http://localhost:3000/reset-password/{uid}/{token}/"

        # Send email
        subject = "Password Reset Request"
        html_message = render_to_string('password_reset_email.html', {
            'user': user,
            'reset_url': reset_url,
        })
        plain_message = "Dear " + user.username + ", You requested a password reset. Click the link to reset your password: " + reset_url
        
        try:
            send_mail(
                subject,
                plain_message,
                settings.EMAIL_HOST_USER, 
                [email], 
                fail_silently=False, 
                html_message=html_message
            )
        except BadHeaderError:
            return Response({"detail": "Invalid header found."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return Response({"detail": "Failed to send email."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"detail": "Password reset email sent"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"detail": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def reset_password(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        token_generator = PasswordResetTokenGenerator()

        if not token_generator.check_token(user, token):
            return Response({"detail": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

        new_password = request.data.get('password')
        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password has been reset"}, status=status.HTTP_200_OK)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        return Response({"detail": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)

    if not product_id:
        return Response({"detail": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({"detail": "Product does not exist"}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    cart, created = Cart.objects.get_or_create(user=user)

    cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        cart_item.quantity += int(quantity)
        cart_item.save()
    else:
        cart_item.quantity = int(quantity)
        cart_item.save()

    return Response({"detail": "Product added to cart successfully"}, status=status.HTTP_201_CREATED)

class CartItemDetail(APIView):
    """
    Retrieve, update or delete a cart item instance.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return CartItem.objects.get(pk=pk, cart__user=user)
        except CartItem.DoesNotExist:
            raise Http404

    def put(self, request, pk, format=None):
        cart_item = self.get_object(pk, request.user)
        serializer = CartItemSerializer(cart_item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        cart_item = self.get_object(pk, request.user)
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_cart(request):
    user = request.user
    try:
        cart = Cart.objects.get(user=user)
        cart_items = CartItem.objects.filter(cart=cart)
        serializer = CartItemSerializer(cart_items, many=True)
        return Response(serializer.data)
    except Cart.DoesNotExist:
        return Response({"detail": "Cart does not exist"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    user = request.user
    try:
        cart = Cart.objects.get(user=user)
        cart_items = CartItem.objects.filter(cart=cart)

        if not cart_items.exists():
            return Response({"detail": "Your cart is empty. Cannot place an order."}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = sum(item.product.price * item.quantity for item in cart_items)

        order = Orders.objects.create(user=user, total_amount=total_amount)

        # Create the order items data BEFORE deleting cart items
        order_items_data = [
            {'product_name': item.product.name, 'price': item.product.price, 'quantity': item.quantity, 'total_price': item.product.price * item.quantity}
            for item in cart_items
        ]

        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )

        cart_items.delete()
        
        subject = "Order Confirmation"
        html_message = render_to_string('order_confirmation_email.html', {
            'user': user,
            'order': order,
            'order_items': order_items_data
        })
        plain_message = f"Thank you for your purchase, {user.username}! Your order has been placed successfully. Order ID: {order.id} Total Amount: ₹{order.total_amount}"

        try:
            send_mail(
                subject,
                plain_message,
                settings.EMAIL_HOST_USER,  
                [user.email],
                fail_silently=False,
                html_message=html_message
            )
        except BadHeaderError:
            return Response({"detail": "Invalid header found."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to send order confirmation email: {e}")

        return Response({"detail": "Order placed successfully"}, status=status.HTTP_201_CREATED)
    except Cart.DoesNotExist:
        return Response({"detail": "Your cart does not exist."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def contact_form(request):
    """
    Handles contact form submissions and sends an email.
    """
    serializer = ContactFormSerializer(data=request.data)
    if serializer.is_valid():
        name = serializer.validated_data['name']
        email = serializer.validated_data['email']
        message = serializer.validated_data['message']

        subject = f"New Contact Form Submission from {name}"
        email_body = f"Name: {name}\nEmail: {email}\nMessage: {message}"

        try:
            send_mail(
                subject,
                email_body,
                settings.EMAIL_HOST_USER,
                [settings.EMAIL_HOST_USER],
                fail_silently=False,
            )
            return Response({"detail": "Message sent successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to send contact form email: {e}")
            return Response({"detail": "Failed to send message."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserOrderList(APIView):
    """
    Retrieve a list of orders associated with the authenticated user.
    """
    permission_classes = [IsAuthenticated]
    def get(self, request):
        orders = Orders.objects.filter(user=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
class AllOrderList(generics.ListAPIView):
    """
    Retrieve a list of all orders for admin users, with filtering and searching.
    """
    queryset = Orders.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter] # Add filtering and search backends
    filterset_fields = ['shipping_status', 'created_at'] # Add fields for filtering
    search_fields = ['user__username', 'id'] # Add fields for searching


class OrderDetail(APIView):
    """
    Retrieve, update or delete an order instance.
    """
    permission_classes = [IsAuthenticated]
    def get_object(self, pk):
        try:
            order = Orders.objects.get(pk=pk)
            # Ensure only the owner can view their order, or an admin
            if order.user != self.request.user and not self.request.user.is_staff:
                raise Http404
            return order
        except Orders.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        order = self.get_object(pk)
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        order = self.get_object(pk)
        serializer = OrderSerializer(order, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        order = self.get_object(pk)
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# New Views for Admin Product and Customer Management
class CustomerList(generics.ListAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter] # Add search backend
    search_fields = ['username', 'customer_name', 'email', 'phone_number'] # Add fields for searching

class ProductListCreate(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter] # Add search backend
    search_fields = ['name', 'description', 'category'] # Add fields for searching

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]