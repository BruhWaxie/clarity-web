from django.urls import path
from .views import affirmations_page, GetNextAffirmation, LikeAffirmationView

urlpatterns = [
    # Це URL, який ви вводите в браузері (повертає HTML)
    path('', affirmations_page, name='affirmations_home'),
    path('api/next/', GetNextAffirmation.as_view(), name='api-next-slide'),
    path('api/like/<int:pk>/', LikeAffirmationView.as_view(), name='api-like'),
]