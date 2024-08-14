from django.shortcuts import render, redirect
from rest_framework import viewsets, filters
from .models import Car
from .serializers import CarSerializer
from django_filters import rest_framework as filters
from .filters import CarFilter
from rest_framework.permissions import IsAuthenticated
from .forms import *

def RegisterView(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            return redirect('login')
    else:
        form = RegisterForm()
    return render(request, 'register.html', {'form': form})

class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = CarFilter
    permission_classes = [IsAuthenticated]

