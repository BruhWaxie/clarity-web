from django.db import models


class Article(models.Model):
    title = models.CharField(max_length=255)
    author_name = models.CharField(max_length=255)
    is_verified = models.BooleanField(default=False)

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Comment(models.Model):
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name="comments"
    )

    author_name = models.CharField(max_length=255)
    text = models.TextField()
    created_at = models.DateTimeField()

    def __str__(self):
        return f"{self.author_name} → {self.article.title}"
    