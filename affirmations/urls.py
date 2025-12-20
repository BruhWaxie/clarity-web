from django.urls import path
from . import views

urlpatterns = [
    path("", views.affirmations_page, name="page"),
    path("feed/", views.affirmations_feed, name="feed"),
]
