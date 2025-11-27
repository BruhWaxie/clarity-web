from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
# Create your models here.

class Week(models.Model):
    week_start_date = models.DateField()

    def __str__(self):
        return f"Week starting {self.week_start_date}"


class MoodEntry(models.Model):
    week = models.ForeignKey(Week, on_delete=models.CASCADE, related_name='moods')
    date = models.DateField()
    mood_percent = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100)
        ]
    )

    def __str__(self):
        return f"{self.date} — {self.mood_percent}%"
