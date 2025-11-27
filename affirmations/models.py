from django.db import models

# Create your models here.
class Affirmation(models.Model):
    text = models.TextField()
    media = models.ImageField()

    def __str__(self):
        return f'Affiramation: {self.text}'