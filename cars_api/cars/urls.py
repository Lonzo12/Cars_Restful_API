from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from django.contrib.auth import views as auth_views

router = DefaultRouter()
router.register(r'cars', CarViewSet, basename='car')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView, name='register'),
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
]