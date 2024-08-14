from django.db import models

#model cars
class Car(models.Model):
     FUEL_CHOICES = [
         ('petrol', 'Бензин'),
         ('disel', 'Дизель'),
         ('hybrid', 'Гибрид'),
         ('electro', 'Электричество'),
     ]

     TRANSMISSION_CHOICES = [
         ('mechanical', 'Механическая'),
         ('robot', 'Робот'),
         ('automatic', 'Автоматическая'),
         ('variator', 'Вариатор'),
     ]

     brand = models.CharField(max_length=100, verbose_name='Марка машины')
     model = models.CharField(max_length=100, verbose_name='Модель машины')
     year = models.IntegerField(verbose_name='Год выпуска')
     fuel_type = models.CharField(max_length=100, choices=FUEL_CHOICES, verbose_name='Тип топлива')
     transmission_type = models.CharField(max_length=100, choices=TRANSMISSION_CHOICES, verbose_name='Тип коробки передач')
     mileage = models.IntegerField(verbose_name='Пробег')
     price = models.IntegerField(verbose_name='Цена')

     def __str__(self):
         return f'{self.brand} {self.model} ({self.year})'
