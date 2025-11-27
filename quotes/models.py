from django.db import models

# Create your models here.
class Quote(models.Model):
    text = models.TextField()
    author = models.CharField(max_length=255)
    media = models.ImageField()

    def __str__(self):
        return f'Quote: {self.text}'