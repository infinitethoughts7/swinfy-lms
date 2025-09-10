from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Organization, StudentProfile, TutorProfile, AdminProfile


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'location', 'is_active', 'created_at']
    list_filter = ['type', 'is_active', 'created_at']
    search_fields = ['name', 'location', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'type', 'location', 'website')
        }),
        ('Details', {
            'fields': ('description', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['email', 'full_name', 'role', 'organization', 'is_verified', 'is_approved', 'is_staff', 'created_at']
    list_filter = ['role', 'is_verified', 'is_approved', 'is_staff', 'is_superuser', 'is_active', 'created_at']
    search_fields = ['email', 'full_name', 'first_name', 'last_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'last_login', 'date_joined']
    
    fieldsets = (
        ('Authentication', {
            'fields': ('email', 'password')
        }),
        ('Personal Info', {
            'fields': ('full_name', 'first_name', 'last_name')
        }),
        ('Role & Organization', {
            'fields': ('role', 'organization', 'is_verified', 'is_approved')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        ('Authentication', {
            'fields': ('email', 'password1', 'password2')
        }),
        ('Personal Info', {
            'fields': ('full_name', 'role', 'organization')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser'),
            'classes': ('collapse',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Make username readonly since we use email for login."""
        readonly_fields = list(super().get_readonly_fields(request, obj))
        readonly_fields.append('username')
        return readonly_fields


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'education_level', 'field_of_study', 'created_at']
    list_filter = ['education_level', 'created_at']
    search_fields = ['user__full_name', 'user__email', 'field_of_study']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('bio', 'profile_picture', 'date_of_birth', 'phone_number')
        }),
        ('Educational Background', {
            'fields': ('education_level', 'field_of_study', 'current_institution')
        }),
        ('Learning Preferences', {
            'fields': ('learning_goals',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TutorProfile)
class TutorProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'years_of_experience', 'hourly_rate', 'is_available', 'created_at']
    list_filter = ['highest_education', 'is_available', 'created_at']
    search_fields = ['user__full_name', 'user__email', 'title', 'specializations', 'technologies']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('bio', 'profile_picture', 'date_of_birth', 'phone_number')
        }),
        ('Professional Information', {
            'fields': ('title', 'years_of_experience', 'hourly_rate')
        }),
        ('Qualifications', {
            'fields': ('highest_education', 'certifications')
        }),
        ('Expertise', {
            'fields': ('specializations', 'technologies', 'languages_spoken')
        }),
        ('Social Links', {
            'fields': ('linkedin_url', 'github_url', 'portfolio_url', 'personal_website')
        }),
        ('Status', {
            'fields': ('is_available', 'availability_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'job_title', 'department', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__full_name', 'user__email', 'job_title', 'department']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('bio', 'profile_picture', 'phone_number')
        }),
        ('Professional Information', {
            'fields': ('job_title', 'department')
        }),
        ('Contact Information', {
            'fields': ('office_location', 'office_phone', 'emergency_contact')
        }),
        ('Social Links', {
            'fields': ('linkedin_url', 'professional_email')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
