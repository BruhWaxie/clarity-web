from django.shortcuts import render
from .models import Affirmation

def affirmations_feed(request):
    offset = int(request.GET.get("offset", 0))
    limit = 3

    affirmations = Affirmation.objects.all()[offset:offset + limit]

    return render(
        request,
        "affirmations/_affirmation_list.html",
        {"affirmations": affirmations}
    )

def affirmations_page(request):
    affirmations = Affirmation.objects.all()[:3]
    return render(request, "affirmations/affirmations.html", {
        "affirmations": affirmations
    })
