from django.db import models

class Quiz(models.Model):
    # id тесту для URL (наприклад, "gad7")
    slug = models.SlugField(unique=True, max_length=50, verbose_name="URL ID (slug)")
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    how_it_works = models.TextField()
    
    # Estimated Time
    time_min = models.PositiveIntegerField(default=2)
    time_max = models.PositiveIntegerField(default=4)
    
    # SVGs (зберігаємо як текст HTML)
    svg_sad = models.TextField(verbose_name="SVG Sad", blank=True)
    svg_neutral = models.TextField(verbose_name="SVG Neutral", blank=True)
    svg_happy = models.TextField(verbose_name="SVG Happy", blank=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.CharField(max_length=500)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.quiz.title} - {self.text[:30]}"

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text = models.CharField(max_length=200)
    points = models.PositiveIntegerField(default=0)
    
    # Порядок важливий для відображення
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

class Result(models.Model):
    """
    Відповідає блоку "results" у JSON.
    """
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='results')
    
    # Діапазони балів (min-max)
    min_score = models.IntegerField()
    max_score = models.IntegerField()
    
    title = models.CharField(max_length=100) # Наприклад: Minimal Anxiety
    description = models.TextField()
    
    # Вибір смайлика, який підтягнеться з налаштувань Quiz
    SMILEY_CHOICES = [
        ('happy', 'Happy'),
        ('neutral', 'Neutral'),
        ('sad', 'Sad'),
    ]
    smiley_type = models.CharField(max_length=20, choices=SMILEY_CHOICES)

    # ВАЖЛИВО: Це поле зв'язує базу з вашим JS/CSS.
    # Ваш JS очікує класи: min-result, low-result, high-result, max-result.
    # Ви маєте вручну в адмінці вписати сюди потрібний клас.
    css_class = models.CharField(
        max_length=50, 
        help_text="JS class mapping: min-result, low-result, high-result, or max-result"
    )

    class Meta:
        ordering = ['min_score']

    def __str__(self):
        return f"{self.title} ({self.min_score}-{self.max_score})"