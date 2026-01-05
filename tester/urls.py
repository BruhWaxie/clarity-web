from django.urls import path
from . import views

app_name = 'quiz'

urlpatterns = [
    # Наприклад: /test/gad7/
    path('test/<slug:quiz_slug>/', views.quiz_detail, name='detail'),
]