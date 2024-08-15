from django.shortcuts import render, redirect
from rest_framework import viewsets, filters
from .models import Car
from .serializers import CarSerializer
from django_filters import rest_framework as filters
from .filters import CarFilter
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.decorators import action
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from rest_framework_simplejwt.tokens import RefreshToken
from .forms import *

@api_view(['POST'])
def register(request):
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password1 = data.get('password1')
    password2 = data.get('password2')

    if not username or not email or not password1 or not password2:
        return Response({"error": "Заполните все поля"}, status=status.HTTP_400_BAD_REQUEST)

    if password1 != password2:
        return Response({"error": "Пароли не совпадают"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(password1)
    except ValidationError as e:
        return Response({"error": list(e)}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username уже используется"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email уже зарегистрирован"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password1)
    user.save()

    return Response({"message": "Регистрация успешна"}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login_view(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')

    print(f'Attempting login with username: {username} and password: {password}')

    user = authenticate(request, username=username, password=password)

    if user is not None:
        auth_login(request, user)  # Используем auth_login, чтобы избежать конфликта имен
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Неверное имя пользователя или пароль"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh_token')
        token = RefreshToken(refresh_token)
        token.blacklist()  # Пометить токен как черный список
        auth_logout(request)
        return Response({"message": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = CarFilter

    def get_permissions(self):
        if self.action in ['create']:  # Если действие - создание, требуем аутентификацию
            self.permission_classes = [IsAuthenticated]
        else:  # Для всех остальных действий, разрешаем доступ всем
            self.permission_classes = [AllowAny]
        return super().get_permissions()

    # Если хотите добавить отдельное действие для просмотра деталей автомобиля
    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        car = self.get_object()
        serializer = CarSerializer(car)
        return Response(serializer.data)

