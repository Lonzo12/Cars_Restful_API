from django_filters import rest_framework as filters
from .models import Car

class CarFilter(filters.FilterSet):
    mileage_min = filters.NumberFilter(field_name="mileage", lookup_expr='gte')
    mileage_max = filters.NumberFilter(field_name="mileage", lookup_expr='lte')
    price_min = filters.NumberFilter(field_name="price", lookup_expr='gte')
    price_max = filters.NumberFilter(field_name="price", lookup_expr='lte')

    class Meta:
        model = Car
        fields = ['brand', 'model', 'year', 'fuel_type', 'transmission_type']
