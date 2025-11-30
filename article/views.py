from django.views.generic import DetailView, ListView
from .models import Article

class ArticleDetailView(DetailView):
    model = Article
    template_name = "article/article.html"
    context_object_name = "article"

class ArticleListView(ListView):
    model = Article
    template_name = "articles/article_list.html"
    context_object_name = "articles"
    ordering = "-created_at"  # новіші першими