from django.urls import path
from .views import WeekListView

urlpatterns = [
    # Визнач тут свої URL-шляхи
    path('homepage', WeekListView.as_view(), name='mood-week'),
]
