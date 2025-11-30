from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from article.views import ArticleDetailView

urlpatterns = [
    path('article/<int:pk>', ArticleDetailView.as_view(), name='article'),
]