from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import (
    Course, CourseModule, Lesson, LessonMaterial, CourseResource,
    Enrollment, LessonProgress, CourseProgress, AttendanceRecord,
    CourseReview, CourseWishlist, CourseNotification
)


class CourseModuleInline(admin.TabularInline):
    model = CourseModule
    extra = 0
    fields = ('title', 'order', 'created_at')
    readonly_fields = ('created_at',)
    show_change_link = True


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ('title', 'lesson_type', 'order', 'duration_minutes', 'is_preview', 'is_mandatory')
    show_change_link = True


class LessonMaterialInline(admin.TabularInline):
    model = LessonMaterial
    extra = 0
    fields = ('title', 'material_type', 'file', 'is_required', 'order')
    readonly_fields = ('file_size_formatted',)


class CourseResourceInline(admin.TabularInline):
    model = CourseResource
    extra = 0
    fields = ('title', 'resource_type', 'file', 'url', 'is_public', 'order')


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
    readonly_fields = ['enrollment_count', 'rating', 'created_at', 'updated_at', 'view_thumbnail', 'view_banner', 'view_demo_video']
    inlines = [CourseModuleInline, CourseResourceInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'short_description', 'learning_outcomes', 'prerequisites')
        }),
        ('Course Details', {
            'fields': ('category', 'level', 'duration_weeks', 'price')
        }),
        ('Media Files', {
            'fields': ('thumbnail', 'view_thumbnail', 'banner_image', 'view_banner', 'demo_video', 'view_demo_video'),
            'description': 'Upload course images and demo video. Files will be stored in DigitalOcean Spaces.'
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
    
    def view_thumbnail(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" width="100" height="60" style="object-fit: cover;" />', obj.thumbnail.url)
        return "No thumbnail"
    view_thumbnail.short_description = "Current Thumbnail"
    
    def view_banner(self, obj):
        if obj.banner_image:
            return format_html('<img src="{}" width="150" height="60" style="object-fit: cover;" />', obj.banner_image.url)
        return "No banner"
    view_banner.short_description = "Current Banner"
    
    def view_demo_video(self, obj):
        if obj.demo_video:
            return format_html('<a href="{}" target="_blank">📹 View Demo Video</a>', obj.demo_video.url)
        return "No demo video"
    view_demo_video.short_description = "Demo Video"


@admin.register(CourseModule)
class CourseModuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'lessons_count', 'created_at']
    list_filter = ['course', 'created_at']
    search_fields = ['title', 'course__title']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at', 'lessons_count']
    inlines = [LessonInline]
    
    def lessons_count(self, obj):
        return obj.lessons.count()
    lessons_count.short_description = "Number of Lessons"
    
    fieldsets = (
        ('Module Information', {
            'fields': ('title', 'slug', 'course', 'order')
        }),
        ('Statistics', {
            'fields': ('lessons_count',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'module', 'lesson_type', 'order', 'duration_formatted', 'is_preview', 'is_mandatory', 'has_video']
    list_filter = ['lesson_type', 'is_preview', 'is_mandatory', 'module__course', 'created_at']
    search_fields = ['title', 'content', 'module__title', 'module__course__title']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at', 'duration_formatted', 'has_video_content', 'view_video', 'materials_count']
    inlines = [LessonMaterialInline]
    
    fieldsets = (
        ('Lesson Information', {
            'fields': ('title', 'slug', 'module', 'lesson_type', 'order')
        }),
        ('Content', {
            'fields': ('content',),
            'description': 'Rich text content for the lesson'
        }),
        ('Video Upload', {
            'fields': ('video_file', 'view_video', 'duration_minutes', 'duration_formatted'),
            'description': 'Upload lesson video. Duration will be auto-detected. Files stored in DigitalOcean Spaces.'
        }),
        ('Settings', {
            'fields': ('is_preview', 'is_mandatory')
        }),
        ('Statistics', {
            'fields': ('has_video_content', 'materials_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_video(self, obj):
        return bool(obj.video_file)
    has_video.boolean = True
    has_video.short_description = "Has Video"
    
    def view_video(self, obj):
        if obj.video_file:
            return format_html(
                '<video width="200" height="120" controls>'
                '<source src="{}" type="video/mp4">'
                'Your browser does not support the video tag.'
                '</video><br>'
                '<a href="{}" target="_blank">📹 Open Video</a>',
                obj.video_file.url, obj.video_file.url
            )
        return "No video uploaded"
    view_video.short_description = "Video Preview"
    
    def materials_count(self, obj):
        return obj.materials.count()
    materials_count.short_description = "Materials Count"


@admin.register(LessonMaterial)
class LessonMaterialAdmin(admin.ModelAdmin):
    list_display = ['title', 'lesson', 'material_type', 'file_size_formatted', 'is_required', 'is_downloadable', 'download_count']
    list_filter = ['material_type', 'is_required', 'is_downloadable', 'lesson__module__course', 'created_at']
    search_fields = ['title', 'description', 'lesson__title']
    readonly_fields = ['file_size', 'file_size_formatted', 'download_count', 'created_at', 'updated_at', 'view_file']
    
    fieldsets = (
        ('Material Information', {
            'fields': ('title', 'description', 'lesson', 'material_type', 'order')
        }),
        ('File Upload', {
            'fields': ('file', 'view_file', 'file_size_formatted'),
            'description': 'Upload lesson materials. Files will be stored in DigitalOcean Spaces.'
        }),
        ('Settings', {
            'fields': ('is_required', 'is_downloadable')
        }),
        ('Statistics', {
            'fields': ('download_count',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def view_file(self, obj):
        if obj.file:
            file_type = obj.material_type
            if file_type in ['image']:
                return format_html('<img src="{}" width="100" height="60" style="object-fit: cover;" />', obj.file.url)
            else:
                return format_html('<a href="{}" target="_blank">📁 Download {}</a>', obj.file.url, obj.title)
        return "No file uploaded"
    view_file.short_description = "File Preview"


@admin.register(CourseResource)
class CourseResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'resource_type', 'is_public', 'order', 'has_file', 'has_url']
    list_filter = ['resource_type', 'is_public', 'course', 'created_at']
    search_fields = ['title', 'description', 'course__title']
    readonly_fields = ['created_at', 'updated_at', 'view_file']
    
    fieldsets = (
        ('Resource Information', {
            'fields': ('title', 'description', 'course', 'resource_type', 'order')
        }),
        ('Content', {
            'fields': ('file', 'view_file', 'url'),
            'description': 'Provide either a file upload OR a URL, not both.'
        }),
        ('Settings', {
            'fields': ('is_public',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_file(self, obj):
        return bool(obj.file)
    has_file.boolean = True
    has_file.short_description = "Has File"
    
    def has_url(self, obj):
        return bool(obj.url)
    has_url.boolean = True
    has_url.short_description = "Has URL"
    
    def view_file(self, obj):
        if obj.file:
            return format_html('<a href="{}" target="_blank">📁 View Resource</a>', obj.file.url)
        elif obj.url:
            return format_html('<a href="{}" target="_blank">🔗 External Link</a>', obj.url)
        return "No file or URL"
    view_file.short_description = "Resource Preview"


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['learner', 'course', 'payment_status', 'enrollment_date', 'can_access_content', 'progress_percentage']
    list_filter = ['payment_status', 'enrollment_date', 'course']
    search_fields = ['learner__email', 'learner__full_name', 'course__title']
    readonly_fields = ['enrollment_date', 'progress_percentage']
    
    def progress_percentage(self, obj):
        try:
            progress = obj.course_progress
            return f"{progress.progress_percentage}%"
        except:
            return "0%"
    progress_percentage.short_description = "Progress"


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ['lesson', 'enrollment', 'is_started', 'is_completed', 'completed_at']
    list_filter = ['is_started', 'is_completed', 'lesson__module__course', 'completed_at']
    search_fields = ['lesson__title', 'enrollment__learner__email']
    readonly_fields = ['started_at', 'completed_at', 'last_accessed', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Progress Information', {
            'fields': ('enrollment', 'lesson', 'is_started', 'is_completed')
        }),
        ('Timestamps', {
            'fields': ('started_at', 'completed_at', 'last_accessed', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CourseProgress)
class CourseProgressAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'overall_progress', 'lessons_completed', 'total_lessons', 'last_activity']
    list_filter = ['enrollment__course', 'last_activity']
    search_fields = ['enrollment__learner__email', 'enrollment__course__title']
    readonly_fields = ['overall_progress', 'lessons_completed', 'total_lessons', 'last_activity', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Progress Information', {
            'fields': ('enrollment', 'overall_progress', 'lessons_completed', 'total_lessons')
        }),
        ('Timestamps', {
            'fields': ('started_at', 'completed_at', 'last_activity', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ['learner', 'course', 'session_date', 'status', 'marked_by', 'marked_at']
    list_filter = ['status', 'session_date', 'course', 'marked_at']
    search_fields = ['learner__email', 'course__title', 'notes']
    readonly_fields = ['marked_at', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Attendance Information', {
            'fields': ('learner', 'course', 'session_date', 'status')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Marking Details', {
            'fields': ('marked_by', 'marked_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CourseReview)
class CourseReviewAdmin(admin.ModelAdmin):
    list_display = ['course', 'learner', 'rating', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_approved', 'created_at']
    search_fields = ['enrollment__course__title', 'enrollment__learner__email', 'content']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Review Information', {
            'fields': ('enrollment', 'rating', 'title', 'content')
        }),
        ('Settings', {
            'fields': ('is_approved', 'is_anonymous')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CourseWishlist)
class CourseWishlistAdmin(admin.ModelAdmin):
    list_display = ['learner', 'course', 'created_at']
    list_filter = ['created_at', 'course']
    search_fields = ['learner__email', 'course__title']
    readonly_fields = ['created_at']


@admin.register(CourseNotification)
class CourseNotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'course', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'is_email_sent', 'created_at', 'course']
    search_fields = ['title', 'message', 'course__title', 'user__email']
    readonly_fields = ['created_at', 'read_at']
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('user', 'course', 'title', 'message', 'notification_type')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at', 'is_email_sent')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


