from django.views.generic import ListView, DetailView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from .models import Week, MoodEntry
from django.shortcuts import render


class WeekListView(LoginRequiredMixin, ListView):
    model = Week
    template_name = "main/logged-homepage.html"
    context_object_name = "weeks"
    ordering = ["-week_start_date"]

class WeekDetailView(LoginRequiredMixin, DetailView):
    model = Week
    template_name = "main/logged-homepage.html"
    context_object_name = "week"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context["moods"] = self.object.moods.filter(user=self.request.user).order_by("date")

        return context

class MoodEntryCreateView(LoginRequiredMixin, CreateView):
    model = MoodEntry
    fields = ["week", "date", "mood_percent"]
    template_name = "mood/moodentry_form.html"
    success_url = reverse_lazy("week_list")

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)

def homepage_view(request):
    last_week = MoodEntry.objects.filter(user=request.user).order_by('-date')
    return render(request, 'main/logged-homepage.html', context= {

    })