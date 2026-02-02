from django.db import models
from django.conf import settings

# Create your models here.
class Quote(models.Model):
    text = models.TextField()
    author = models.CharField(max_length=255)
    media = models.ImageField(upload_to='quotes/')
    
    # Users who liked this quote
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_quotes', blank=True)

    def __str__(self):
        return f'Quote: {self.text}'