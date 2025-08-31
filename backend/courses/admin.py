from django.contrib import admin
from .models import Category, Course, Lesson, Enrollment, CourseProgress, Review, Assignment, Submission


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'instructor', 'category', 'price', 'is_published', 'is_featured', 'created_at']
    list_filter = ['is_published', 'is_featured', 'category', 'created_at']
    search_fields = ['title', 'description', 'instructor__email']
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ['is_published', 'is_featured']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'duration', 'is_published', 'is_free']
    list_filter = ['is_published', 'is_free', 'course']
    search_fields = ['title', 'course__title']
    list_editable = ['order', 'is_published', 'is_free']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'enrolled_at', 'is_active', 'last_accessed']
    list_filter = ['is_active', 'enrolled_at', 'course']
    search_fields = ['student__email', 'course__title']


@admin.register(CourseProgress)
class CourseProgressAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'current_lesson', 'progress_percentage', 'time_spent', 'last_activity']
    list_filter = ['progress_percentage', 'last_activity']
    search_fields = ['enrollment__student__email', 'enrollment__course__title']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['student__email', 'course__title', 'comment']


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'due_date', 'max_score', 'created_at']
    list_filter = ['due_date', 'created_at']
    search_fields = ['title', 'course__title']


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['student', 'assignment', 'submitted_at', 'score']
    list_filter = ['submitted_at', 'score']
    search_fields = ['student__email', 'assignment__title']
