from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .api_views import ReviewViewSet

# Створюємо роутер для API
router = DefaultRouter()
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('logout/', views.CustomLogoutView.as_view(), name='logout'),
    path('profile-info/', views.profile_view, name='profile_info'),
    path('profile/<str:username>/', views.profile_view, name='user_profile'),
    path('api/', include(router.urls)),
    path('add-review/', views.add_review_view, name='add-review'),
    
]