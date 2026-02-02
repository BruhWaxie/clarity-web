from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


# Create your models here.
class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'Користувач'),
        ('psychologist', 'Психолог'),
        ('moderator', 'Модератор'),
        ('admin', 'Адміністратор'),
    )
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='user')
    pfp = models.ImageField(upload_to='user_pfps', null=True, blank=True)
    birth_date = models.DateField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)


class Specialization(models.Model):
    name = models.CharField(max_length=200)
    def __str__(self):
        return self.name

class Language(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10)

    def __str__(self):
        return self.name


class Problem(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name

class TypeOfTherapy(models.Model):
    name = models.CharField(max_length=255)
    def __str__(self):
        return self.name

class Psychologist(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='psychologist')

    specialization = models.ForeignKey(Specialization, on_delete=models.DO_NOTHING, null=True, blank=True)
    years_of_exp = models.PositiveSmallIntegerField(null=True, blank=True)

    sessions = models.IntegerField(default=0)
    problems = models.ManyToManyField(Problem)
    languages = models.ManyToManyField('Language', blank=True)
    type_of_therapy = models.ManyToManyField(TypeOfTherapy, blank=True)
    place = models.TextField(null=True, blank=True)

    description = models.TextField(null=True, blank=True)
    def __str__(self):
        return self.user.first_name + ' ' + self.user.last_name



class Abilities(models.Model):
    user = models.ForeignKey(Psychologist, on_delete=models.CASCADE, related_name="abilities")

    ability = models.TextField()
    def __str__(self):
        return self.ability

class Education(models.Model):
    psychologist = models.ForeignKey(
        Psychologist,
        on_delete=models.CASCADE,
        related_name="educations"
    )

    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    field_of_study = models.CharField(max_length=255)

    start_year = models.PositiveSmallIntegerField()
    end_year = models.PositiveSmallIntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.institution} — {self.degree}"

class DiplomaImage(models.Model):
    education = models.ForeignKey(
        Education,
        on_delete=models.CASCADE,
        related_name="diplomas"
    )

    image = models.ImageField(upload_to="diplomas/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Diploma for education {self.id}"


class WorkSchedule(models.Model):
    psychologist = models.ForeignKey(
        Psychologist,
        on_delete=models.CASCADE,
        related_name="schedules"
    )

    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.psychologist} — {self.date}"
    
class TimeSlot(models.Model):
    schedule = models.ForeignKey(
        WorkSchedule,
        on_delete=models.CASCADE,
        related_name="time_slots"
    )

    time = models.TimeField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.time}"


class Review(models.Model):
    psychologist = models.ForeignKey(Psychologist, on_delete=models.CASCADE, related_name='reviews')
    author = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    problem = models.ForeignKey(Problem, on_delete=models.SET_NULL, null=True, blank=True)

    text = models.TextField()
    rating = models.PositiveSmallIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.psychologist} — {self.rating}★"
