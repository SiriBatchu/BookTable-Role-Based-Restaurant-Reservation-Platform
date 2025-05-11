from django.contrib import admin
from .models import Restaurant, RestaurantHours, RestaurantPhoto

# Register your models here.
admin.site.register(Restaurant)
admin.site.register(RestaurantHours)
admin.site.register(RestaurantPhoto)
