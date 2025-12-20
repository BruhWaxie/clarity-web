from django.urls import path
from . import views
from .views import WeeksListView

urlpatterns = [
    # Визнач тут свої URL-шляхи
    path('homepage/', views.homepage_view, name='homepage'),
    path('mood/', WeeksListView.as_view(), name='mood'),
    path('add-mood/', views.add_mood_view, name='add-mood'),
]
