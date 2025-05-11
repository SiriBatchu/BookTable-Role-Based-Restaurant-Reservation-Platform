from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from restaurants.models import Restaurant

class Command(BaseCommand):
    help = 'Seed mock restaurant data'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        manager = User.objects.filter(role='manager').first()  # Or create one if needed

        Restaurant.objects.create(
            name="Mock Italian Bistro",
            cuisine_type="Italian",
            cost_rating=3,
            approved=True,
            address="123 Main St",
            city="San Francisco",
            state="CA",
            zip="94101",
            times_booked_today=5,
            manager_id=manager,
        )
        Restaurant.objects.create(
            name="Sushi Place",
            cuisine_type="Japanese",
            cost_rating=4,
            approved=True,
            address="456 Sushi Ave",
            city="San Francisco",
            state="CA",
            zip="94102",
            times_booked_today=8,
        )
        Restaurant.objects.create(
            name="Taco Fiesta",
            cuisine_type="Mexican",
            cost_rating=2,
            approved=True,
            address="789 Fiesta Rd",
            city="San Francisco",
            state="CA",
            zip="94103",
            times_booked_today=3,
        )
        self.stdout.write(self.style.SUCCESS('Mock restaurants created!')) 