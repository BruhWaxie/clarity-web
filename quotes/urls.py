from django.urls import path
from .views import quotes_page, GetNextQuote, LikeQuoteView

urlpatterns = [
    # HTML page
    path('', quotes_page, name='quotes_home'),
    path('api/next/', GetNextQuote.as_view(), name='api-next-quote'),
    path('api/like/<int:pk>/', LikeQuoteView.as_view(), name='api-like-quote'),
]
