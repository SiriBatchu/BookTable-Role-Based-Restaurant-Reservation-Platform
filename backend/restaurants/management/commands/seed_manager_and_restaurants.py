from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from restaurants.models import Restaurant, RestaurantPhoto, RestaurantHours
from datetime import time, datetime, timedelta
from bookings.models import BookingSlot
import random

class Command(BaseCommand):
    help = 'Seed a manager user and mock restaurant data'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        # Create a manager user if not exists
        manager, created = User.objects.get_or_create(
            email='manager@example.com',
            defaults={
                'username': 'manager1',
                'role': 'manager',
                'is_staff': True,
                'is_superuser': False,
            }
        )
        if created:
            manager.set_password('testpassword123')
            manager.save()
            self.stdout.write(self.style.SUCCESS('Manager user created: manager@example.com / testpassword123'))
        else:
            self.stdout.write(self.style.WARNING('Manager user already exists.'))

        # List of demo restaurant image URLs
        demo_images = [
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
            "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
            "https://images.unsplash.com/photo-1432139555190-58524dae6a55",
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
            "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0",
            "https://images.unsplash.com/photo-1502741338009-cac2772e18bc",
            "https://images.unsplash.com/photo-1551183053-bf91a1d81141",
            "https://images.unsplash.com/photo-1541544181051-94c1e6e8b8df",
        ]
        # Create mock restaurants assigned to this manager
        r1 = Restaurant.objects.create(
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
        RestaurantPhoto.objects.create(
            restaurant_id=r1,
            photo_url=random.choice(demo_images),
            caption="Demo restaurant image"
        )
        r2 = Restaurant.objects.create(
            name="Sushi Place",
            cuisine_type="Japanese",
            cost_rating=4,
            approved=True,
            address="456 Sushi Ave",
            city="San Francisco",
            state="CA",
            zip="94102",
            times_booked_today=8,
            manager_id=manager,
        )
        RestaurantPhoto.objects.create(
            restaurant_id=r2,
            photo_url=random.choice(demo_images),
            caption="Demo restaurant image"
        )
        r3 = Restaurant.objects.create(
            name="Taco Fiesta",
            cuisine_type="Mexican",
            cost_rating=2,
            approved=True,
            address="789 Fiesta Rd",
            city="San Francisco",
            state="CA",
            zip="94103",
            times_booked_today=3,
            manager_id=manager,
        )
        RestaurantPhoto.objects.create(
            restaurant_id=r3,
            photo_url=random.choice(demo_images),
            caption="Demo restaurant image"
        )
        # Add mock restaurants in dropdown cities
        r4 = Restaurant.objects.create(
            name="Golden Gate Grill",
            cuisine_type="American",
            cost_rating=3,
            approved=True,
            address="123 Market St",
            city="San Francisco",
            state="CA",
            zip="94103",
            latitude=37.7749,
            longitude=-122.4194,
            times_booked_today=8,
            manager_id=manager,
            description="A classic American grill in the heart of San Francisco.",
            contact_info="(415) 555-1234"
        )
        RestaurantPhoto.objects.create(
            restaurant_id=r4,
            photo_url=random.choice(demo_images),
            caption="Demo restaurant image"
        )
        r5 = Restaurant.objects.create(
            name="Empire Eats",
            cuisine_type="Italian",
            cost_rating=4,
            approved=True,
            address="456 Broadway",
            city="New York",
            state="NY",
            zip="10012",
            latitude=40.7128,
            longitude=-74.0060,
            times_booked_today=12,
            manager_id=manager,
            description="Authentic Italian cuisine in downtown Manhattan.",
            contact_info="(212) 555-5678"
        )
        RestaurantPhoto.objects.create(
            restaurant_id=r5,
            photo_url=random.choice(demo_images),
            caption="Demo restaurant image"
        )
        self.stdout.write(self.style.SUCCESS('Mock restaurants created and assigned to manager!'))

        # Add 10 more mock restaurants in various dropdown cities
        more_restaurants = [
            {
                "name": "Bay Breeze Cafe",
                "cuisine_type": "Seafood",
                "cost_rating": 3,
                "address": "200 Embarcadero",
                "city": "San Francisco",
                "state": "CA",
                "zip": "94105",
                "latitude": 37.7929,
                "longitude": -122.3969,
                "description": "Fresh seafood with a view of the bay.",
                "contact_info": "(415) 555-2000"
            },
            {
                "name": "Central Park Deli",
                "cuisine_type": "Deli",
                "cost_rating": 2,
                "address": "789 5th Ave",
                "city": "New York",
                "state": "NY",
                "zip": "10022",
                "latitude": 40.7648,
                "longitude": -73.9730,
                "description": "Classic deli sandwiches near Central Park.",
                "contact_info": "(212) 555-7890"
            },
            {
                "name": "Sunset Sushi",
                "cuisine_type": "Japanese",
                "cost_rating": 4,
                "address": "123 Sunset Blvd",
                "city": "Los Angeles",
                "state": "CA",
                "zip": "90028",
                "latitude": 34.0983,
                "longitude": -118.3267,
                "description": "Trendy sushi bar in Hollywood.",
                "contact_info": "(323) 555-1234"
            },
            {
                "name": "Windy City Pizza",
                "cuisine_type": "Pizza",
                "cost_rating": 3,
                "address": "456 Michigan Ave",
                "city": "Chicago",
                "state": "IL",
                "zip": "60611",
                "latitude": 41.8916,
                "longitude": -87.6244,
                "description": "Deep dish pizza in downtown Chicago.",
                "contact_info": "(312) 555-4567"
            },
            {
                "name": "Emerald City Eats",
                "cuisine_type": "Vegetarian",
                "cost_rating": 2,
                "address": "789 Pine St",
                "city": "Seattle",
                "state": "WA",
                "zip": "98101",
                "latitude": 47.6114,
                "longitude": -122.3337,
                "description": "Vegetarian delights in Seattle.",
                "contact_info": "(206) 555-7890"
            },
            {
                "name": "Austin BBQ House",
                "cuisine_type": "BBQ",
                "cost_rating": 3,
                "address": "321 Congress Ave",
                "city": "Austin",
                "state": "TX",
                "zip": "78701",
                "latitude": 30.2672,
                "longitude": -97.7431,
                "description": "Authentic Texas BBQ downtown.",
                "contact_info": "(512) 555-3210"
            },
            {
                "name": "Boston Chowder Co.",
                "cuisine_type": "Seafood",
                "cost_rating": 4,
                "address": "100 Atlantic Ave",
                "city": "Boston",
                "state": "MA",
                "zip": "02110",
                "latitude": 42.3611,
                "longitude": -71.0568,
                "description": "Famous for New England clam chowder.",
                "contact_info": "(617) 555-1000"
            },
            {
                "name": "Denver Steakhouse",
                "cuisine_type": "Steakhouse",
                "cost_rating": 4,
                "address": "200 16th St Mall",
                "city": "Denver",
                "state": "CO",
                "zip": "80202",
                "latitude": 39.7475,
                "longitude": -104.9928,
                "description": "Premium steaks in downtown Denver.",
                "contact_info": "(303) 555-2000"
            },
            {
                "name": "Portland Brunch Spot",
                "cuisine_type": "Brunch",
                "cost_rating": 2,
                "address": "300 Burnside St",
                "city": "Portland",
                "state": "OR",
                "zip": "97209",
                "latitude": 45.5231,
                "longitude": -122.6765,
                "description": "Best brunch in Portland.",
                "contact_info": "(503) 555-3000"
            },
            {
                "name": "Miami Spice",
                "cuisine_type": "Latin",
                "cost_rating": 3,
                "address": "400 Ocean Dr",
                "city": "Miami",
                "state": "FL",
                "zip": "33139",
                "latitude": 25.7777,
                "longitude": -80.1310,
                "description": "Latin flavors by the beach.",
                "contact_info": "(305) 555-4000"
            },
        ]
        for rest in more_restaurants:
            r = Restaurant.objects.create(
                name=rest["name"],
                cuisine_type=rest["cuisine_type"],
                cost_rating=rest["cost_rating"],
                approved=True,
                address=rest["address"],
                city=rest["city"],
                state=rest["state"],
                zip=rest["zip"],
                latitude=rest["latitude"],
                longitude=rest["longitude"],
                times_booked_today=0,
                manager_id=manager,
                description=rest["description"],
                contact_info=rest["contact_info"]
            )
            RestaurantPhoto.objects.create(
                restaurant_id=r,
                photo_url=random.choice(demo_images),
                caption="Demo restaurant image"
            )
        self.stdout.write(self.style.SUCCESS('Additional mock restaurants created and assigned to manager!'))

        # After all restaurants are created, set hours for every day
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        for restaurant in Restaurant.objects.all():
            for day in days:
                RestaurantHours.objects.get_or_create(
                    restaurant_id=restaurant,
                    day_of_week=day,
                    defaults={
                        "open_time": time(9, 0),
                        "close_time": time(21, 0),
                    }
                )

        # After setting RestaurantHours, create BookingSlots for every slot
        today = datetime.now().date()
        for restaurant in Restaurant.objects.all():
            for day_offset in range(0, 30):  # Next 30 days
                slot_date = today + timedelta(days=day_offset)
                for hour in range(9, 21):  # 9:00 to 20:30
                    for minute in [0, 30]:
                        slot_time = time(hour, minute)
                        slot_datetime = datetime.combine(slot_date, slot_time)
                        for table_size in range(2, 9):  # Table sizes 2 to 8
                            BookingSlot.objects.get_or_create(
                                restaurant_id=restaurant,
                                slot_datetime=slot_datetime,
                                table_size=table_size,
                                defaults={"total_tables": 10}
                            )
        self.stdout.write(self.style.SUCCESS('Booking slots created for all restaurants!')) 