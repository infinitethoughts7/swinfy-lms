from django.contrib import admin
from .models import Course, CourseModule, Lesson, Enrollment, CourseReview


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'organization', 'instructor', 'category', 
        'level', 'status', 'total_enrollments', 'rating', 'created_at'
    ]
    list_filter = [
        'status', 'category', 'level', 'organization__type', 
        'is_featured', 'created_at'
    ]
    search_fields = ['title', 'description', 'instructor__full_name', 'organization__name']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['total_enrollments', 'rating', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'objectives', 'prerequisites')
        }),
        ('Course Details', {
            'fields': ('category', 'level', 'duration_weeks', 'price', 'thumbnail', 'icon')
        }),
        ('Organization & Instructor', {
            'fields': ('organization', 'instructor')
        }),
        ('Status & Features', {
            'fields': ('status', 'is_featured')
        }),
        ('Statistics', {
            'fields': ('total_enrollments', 'rating'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CourseModule)
class CourseModuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'created_at']
    list_filter = ['course__category', 'created_at']
    search_fields = ['title', 'course__title']
    ordering = ['course', 'order']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'module', 'lesson_type', 'order', 
        'is_preview', 'created_at'
    ]
    list_filter = ['lesson_type', 'is_preview', 'created_at']
    search_fields = ['title', 'module__title', 'module__course__title']
    ordering = ['module', 'order']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'course', 'status', 'progress_percentage', 
        'amount_paid', 'enrolled_at'
    ]
    list_filter = [
        'status', 'course__category', 'enrolled_at', 
        'course__organization'
    ]
    search_fields = [
        'student__full_name', 'student__email', 
        'course__title', 'course__organization__name'
    ]
    readonly_fields = ['enrolled_at', 'last_accessed']
    
    fieldsets = (
        ('Enrollment Details', {
            'fields': ('student', 'course', 'status')
        }),
        ('Progress', {
            'fields': ('progress_percentage', 'completed_lessons')
        }),
        ('Payment', {
            'fields': ('amount_paid', 'payment_method')
        }),
        ('Timestamps', {
            'fields': ('enrolled_at', 'completed_at', 'last_accessed'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CourseReview)
class CourseReviewAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'course', 'rating', 'created_at'
    ]
    list_filter = ['rating', 'created_at']
    search_fields = [
        'enrollment__student__full_name', 
        'enrollment__course__title'
    ]
    readonly_fields = ['created_at', 'updated_at']
    
    def student(self, obj):
        return obj.enrollment.student.full_name
    
    def course(self, obj):
        return obj.enrollment.course.title
