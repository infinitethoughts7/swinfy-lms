# backend/users/admin.py

from django.contrib import admin
from django.contrib import messages
from django.contrib.auth.admin import UserAdmin
from django.db import transaction
from django.utils import timezone
from .models import User, KnowledgePartner, LearnerProfile, KPIProfile, KPAProfile, KnowledgePartnerApplication


@admin.register(KnowledgePartner)
class KnowledgePartnerAdmin(admin.ModelAdmin):
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
    list_display = ['email', 'full_name', 'role', 'knowledge_partner_name', 'is_verified', 'is_approved', 'is_staff', 'created_at']
    list_filter = ['role', 'is_verified', 'is_approved', 'is_staff', 'is_superuser', 'is_active', 'created_at']
    search_fields = ['email', 'full_name', 'first_name', 'last_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'last_login', 'date_joined']
    
    def knowledge_partner_name(self, obj):
        return obj.knowledge_partner.name if obj.knowledge_partner else '-'
    knowledge_partner_name.short_description = 'Knowledge Partner'
    
    fieldsets = (
        ('Authentication', {
            'fields': ('email', 'password')
        }),
        ('Personal Info', {
            'fields': ('full_name', 'first_name', 'last_name')
        }),
        ('Role & Knowledge Partner', {
            'fields': ('role', 'knowledge_partner', 'is_verified', 'is_approved')
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
            'fields': ('full_name', 'role', 'knowledge_partner')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser'),
            'classes': ('collapse',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(super().get_readonly_fields(request, obj))
        readonly_fields.append('username')
        return readonly_fields


@admin.register(LearnerProfile)
class LearnerProfileAdmin(admin.ModelAdmin):
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


@admin.register(KPIProfile)
class KnowledgePartnerInstructorProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'years_of_experience', 'hourly_rate', 'is_available', 'created_at']
    list_filter = ['highest_education', 'is_available', 'created_at']
    search_fields = ['user__full_name', 'user__email', 'title', 'specializations', 'technologies']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('bio', 'profile_picture', 'phone_number')
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
            'fields': ('linkedin_url',)
        }),
        ('Status', {
            'fields': ('is_available', 'availability_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(KPAProfile)
class KnowledgePartnerAdminProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'job_title', 'office_location', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__full_name', 'user__email', 'job_title', 'office_location']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('bio', 'profile_picture', 'phone_number')
        }),
        ('Professional Information', {
            'fields': ('job_title',)
        }),
        ('Contact Information', {
            'fields': ('office_location', 'professional_email')
        }),
        ('Social Links', {
            'fields': ('linkedin_url',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(KnowledgePartnerApplication)
class KnowledgePartnerApplicationAdmin(admin.ModelAdmin):
    list_display = [
        'knowledge_partner_name',
        'knowledge_partner_type_display',
        'status_badge',
        'reviewed_by_display',
        'created_at',
    ]
    list_filter = ['status', 'knowledge_partner_type', 'created_at']
    search_fields = ['knowledge_partner_name', 'knowledge_partner_email', 'contact_number']
    readonly_fields = ['created_at', 'updated_at', 'reviewed_at', 'reviewed_by']
    actions = ['approve_and_create_kp_admin', 'reject_selected_applications']

    fieldsets = (
        ('Knowledge Partner Details', {
            'fields': (
                'knowledge_partner_name',
                'knowledge_partner_type',
                'knowledge_partner_email',
                'contact_number',
                'website_url',
            )
        }),
        ('Application Details', {
            'fields': (
                'courses_interested_in',
                'experience_years',
                'expected_tutors',
                'partner_message',
            )
        }),
        ('Status', {
            'fields': (
                'status',
                'reviewed_by',
                'reviewed_at',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def knowledge_partner_type_display(self, obj):
        return obj.get_knowledge_partner_type_display()
    knowledge_partner_type_display.short_description = 'Type'

    def status_badge(self, obj):
        colors = {
            'pending': '#f59e0b',  # amber
            'approved': '#10b981',  # green
            'rejected': '#ef4444',  # red
        }
        color = colors.get(obj.status, '#6b7280')  # gray default
        from django.utils.safestring import mark_safe
        return mark_safe(f'<span style="color: {color}; font-weight: bold;">● {obj.get_status_display()}</span>')
    status_badge.short_description = 'Status'

    def reviewed_by_display(self, obj):
        if obj.reviewed_by:
            return f'{obj.reviewed_by.full_name}'
        return '-'
    reviewed_by_display.short_description = 'Reviewed By'

    def approve_and_create_kp_admin(self, request, queryset):
        """
        Approve Knowledge Partner Applications and Create KP Admin User
        Creates only: KP Admin User with password 'olla@07'
        """
        approved_count = 0
        skipped = 0
        errors = 0

        for application in queryset:
            if application.status != 'pending':
                skipped += 1
                continue
                
            try:
                with transaction.atomic():
                    # Security check: Only superusers can approve
                    if not request.user.is_superuser:
                        raise Exception('Only Super Admins can approve Knowledge Partner applications')

                    # Create KP Admin User Account
                    kp_admin_user = User.objects.create_user(
                        email=application.knowledge_partner_email,
                        password='olla@07',  # Fixed password as requested
                        full_name=f"{application.knowledge_partner_name} - KP Admin",
                        role='knowledge_partner_admin',
                        is_verified=True,
                        is_approved=True,
                    )

                    # Update Application Status
                    application.status = 'approved'
                    application.reviewed_by = request.user
                    application.reviewed_at = timezone.now()
                    application.save()
                    
                    approved_count += 1

            except Exception as exc:
                errors += 1
                self.message_user(
                    request,
                    f"Failed to approve {application.knowledge_partner_name}: {str(exc)}",
                    level=messages.ERROR,
                )

        # Display results
        if approved_count:
            self.message_user(
                request, 
                f"Successfully approved {approved_count} Knowledge Partner application(s). "
                f"KP Admin accounts created with password 'olla@07'.",
                level=messages.SUCCESS
            )
        if skipped:
            self.message_user(
                request, 
                f"Skipped {skipped} non-pending application(s).", 
                level=messages.WARNING
            )

    approve_and_create_kp_admin.short_description = "✅ Approve & Create KP Admin User"

    def reject_selected_applications(self, request, queryset):
        """
        Reject Knowledge Partner Applications
        """
        rejected_count = 0
        skipped = 0
        
        for application in queryset:
            if application.status != 'pending':
                skipped += 1
                continue
                
            try:
                if not request.user.is_superuser:
                    raise Exception('Only Super Admins can reject applications')

                application.status = 'rejected'
                application.reviewed_by = request.user
                application.reviewed_at = timezone.now()
                application.save()
                
                rejected_count += 1

            except Exception as exc:
                self.message_user(
                    request,
                    f"Failed to reject {application.knowledge_partner_name}: {str(exc)}",
                    level=messages.ERROR,
                )

        if rejected_count:
            self.message_user(
                request, 
                f"Rejected {rejected_count} Knowledge Partner application(s).", 
                level=messages.SUCCESS
            )
        if skipped:
            self.message_user(
                request, 
                f"Skipped {skipped} non-pending application(s).", 
                level=messages.WARNING
            )

    reject_selected_applications.short_description = "❌ Reject Selected Applications"

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'reviewed_by':
            kwargs["queryset"] = User.objects.filter(is_superuser=True)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }