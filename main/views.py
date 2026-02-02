from django.views.generic import ListView, DetailView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from .models import Week, MoodEntry
from django.shortcuts import render, redirect
from collections import defaultdict
from datetime import date, timedelta
from django.contrib.auth.decorators import login_required
import random
from affirmations.models import Affirmation
from quotes.models import Quote
from article.models import Article
from tester.models import Quiz

def homepage_view(request):
    
    today = date.today()
    monday = today - timedelta(days=today.weekday())

    entries = MoodEntry.objects.filter(
        user=request.user,
        date__gte=monday,
        date__lte=monday + timedelta(days=6)
    )

    # 0 — понеділок, 6 — неділя
    week_moods = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
    }

    for entry in entries:
        weekday = entry.date.weekday()
        week_moods[weekday] = entry.mood_percent
        
    # Logic for daily content (Affirmation, Article, Test)
    # Use today's ordinal as seed to ensure consistency for the whole day
    today_ordinal = today.toordinal()
    
    # Affirmations
    all_affirmations = Affirmation.objects.all()
    daily_affirmation = None
    if all_affirmations.exists():
        daily_affirmation = all_affirmations[today_ordinal % all_affirmations.count()]
        
    # Articles
    all_articles = Article.objects.all()
    daily_article = None
    if all_articles.exists():
        daily_article = all_articles[today_ordinal % all_articles.count()]
        
    # Tests (Quizzes)
    all_quizzes = Quiz.objects.all()
    daily_test = None
    if all_quizzes.exists():
        daily_test = all_quizzes[today_ordinal % all_quizzes.count()]
    
    # Quotes
    all_quotes = Quote.objects.all()
    daily_quote = None
    if all_quotes.exists():
        daily_quote = all_quotes[today_ordinal % all_quotes.count()]

    return render(
        request,
        'main/logged-homepage.html',
        {
            'week_moods': week_moods,
            'daily_affirmation': daily_affirmation,
            'daily_quote': daily_quote,
            'daily_article': daily_article,
            'daily_test': daily_test,
        }
    )

class WeeksListView(LoginRequiredMixin, ListView):
    """
    object_list = список дат-понеділків (week_start_date)
    """
    template_name = "main/mood-tracker.html"
    context_object_name = "weeks"   # це буде список понеділків на поточній сторінці
    paginate_by = 6                # скільки тижнів на сторінку

    def get_queryset(self):
        # Беремо всі дати записів користувача
        dates = (
            MoodEntry.objects
            .filter(user=self.request.user)
            .values_list("date", flat=True)
        )

        # Перетворюємо кожну дату на "понеділок того тижня"
        mondays = set()
        for d in dates:
            monday = d - timedelta(days=d.weekday())  # weekday: 0=пн ... 6=нд
            mondays.add(monday)

        # Сортуємо від нового до старого
        return sorted(mondays, reverse=True)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # На поточній сторінці ListView покладе тижні в context['weeks']
        page_mondays = context["weeks"]

        weeks_data = []
        if not page_mondays:
            context["weeks_data"] = weeks_data
            return context

        # Щоб не робити 1 запит на тиждень — тягнемо всі записи в діапазоні сторінки одним запитом
        min_monday = min(page_mondays)
        max_monday = max(page_mondays)
        range_start = min_monday
        range_end = max_monday + timedelta(days=6)

        entries = (
            MoodEntry.objects
            .filter(
                user=self.request.user,
                date__gte=range_start,
                date__lte=range_end
            )
            .only("date", "mood_percent")
        )

        # Групуємо записи по понеділках
        bucket = defaultdict(list)
        for e in entries:
            monday = e.date - timedelta(days=e.date.weekday())
            bucket[monday].append(e)

        # Формуємо week_moods як у твоєму прикладі
        for monday in page_mondays:
            week_moods = {i: 0 for i in range(7)}  # 0=пн..6=нд

            for e in bucket.get(monday, []):
                week_moods[e.date.weekday()] = e.mood_percent

            weeks_data.append({
                "week_start": monday,
                "week_end": monday + timedelta(days=6),
                "week_moods": week_moods,
            })

        context["weeks_data"] = weeks_data
        return context

@login_required
def add_mood_view(request):
    today = date.today()

    if request.method == "POST":
        mood_percent = int(request.POST.get("mood"))

        MoodEntry.objects.update_or_create(
            user=request.user,
            date=today,
            defaults={
                "mood_percent": mood_percent
            }
        )

        return redirect("homepage")  # або інша сторінка

    return render(
        request,
        "main/add-mood.html",
        {
            "today": today
        }
    )
