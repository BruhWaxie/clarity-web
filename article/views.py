from django.views.generic import DetailView, ListView
from .models import Article

class ArticleDetailView(DetailView):
    model = Article
    template_name = "article/article.html"
    context_object_name = "article"

class ArticleListView(ListView):
    model = Article
    template_name = "article/article_list.html"
    context_object_name = "articles"
    ordering = "-created_at"  # новіші першими

    def get_queryset(self):
        queryset = super().get_queryset()
        q = self.request.GET.get('q')
        author = self.request.GET.get('author')

        if q:
            queryset = queryset.filter(title__icontains=q) | queryset.filter(content__icontains=q)
        
        if author:
            queryset = queryset.filter(author_name__first_name__icontains=author) | queryset.filter(author_name__last_name__icontains=author) | queryset.filter(author_name__username__icontains=author)
            
        return queryset.distinct()
