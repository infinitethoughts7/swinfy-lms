from django.contrib import admin
from .models import Course


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'training_partner', 'tutor', 'category', 
        'level', 'approval_status', 'enrollment_count', 'rating', 'created_at'
    ]
    list_filter = [
        'approval_status', 'category', 'level', 'training_partner__type', 
        'is_featured', 'created_at'
    ]
    search_fields = ['title', 'description', 'tutor__full_name', 'training_partner__name']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['enrollment_count', 'rating', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'short_description', 'learning_outcomes', 'prerequisites')
        }),
        ('Course Details', {
            'fields': ('category', 'level', 'duration_weeks', 'price', 'thumbnail', 'banner_image')
        }),
        ('Training Partner & Instructor', {
            'fields': ('training_partner', 'tutor')
        }),
        ('Status & Features', {
            'fields': ('approval_status', 'is_published', 'is_featured', 'is_draft')
        }),
        ('Statistics', {
            'fields': ('enrollment_count', 'rating', 'total_reviews', 'view_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )


