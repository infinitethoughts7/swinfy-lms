from django.contrib import admin
from django.contrib import messages
from django.contrib.auth.admin import UserAdmin
from django.db import transaction
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
        """Make username readonly since we use email for login."""
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
class InstructorProfileAdmin(admin.ModelAdmin):
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


@admin.register(KPAProfile)
class AdminProfileAdmin(admin.ModelAdmin):
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


@admin.register(KnowledgePartnerApplication)
class KnowledgePartnerApplicationAdmin(admin.ModelAdmin):
    list_display = [
        'knowledge_partner_name',
        'knowledge_partner_type',
        'status',
        'created_knowledge_partner',
        'created_admin_user',
        'reviewed_by',
        'created_at',
    ]
    list_filter = ['status', 'knowledge_partner_type', 'created_at']
    search_fields = ['knowledge_partner_name', 'knowledge_partner_email', 'contact_number']
    readonly_fields = ['created_at', 'updated_at', 'reviewed_at']

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
        ('Review', {
            'fields': (
                'status',
                'admin_notes',
                'reviewed_by',
                'reviewed_at',
            )
        }),
        ('Created Entities', {
            'fields': (
                'created_knowledge_partner',
                'created_admin_user',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['approve_applications', 'reject_applications']

    def approve_applications(self, request, queryset):
        """Admin action: approve selected pending applications and create KP + Admin user."""
        approved_count = 0
        skipped = 0
        errors = 0

        for application in queryset:
            if application.status != 'pending':
                skipped += 1
                continue
            try:
                with transaction.atomic():
                    application.approve_and_create_kp(admin_user=request.user)
                    approved_count += 1
            except Exception as exc:  # noqa: BLE001
                errors += 1
                self.message_user(
                    request,
                    f"Failed to approve application {application.organization_name}: {exc}",
                    level=messages.ERROR,
                )

        if approved_count:
            self.message_user(request, f"Approved {approved_count} application(s).", level=messages.SUCCESS)
        if skipped:
            self.message_user(request, f"Skipped {skipped} non-pending application(s).", level=messages.WARNING)
        if errors and not approved_count:
            self.message_user(request, "No applications approved due to errors.", level=messages.ERROR)

    approve_applications.short_description = "Approve selected applications"

    def reject_applications(self, request, queryset):
        """Admin action: reject selected pending applications with a default reason."""
        rejected = 0
        skipped = 0
        for application in queryset:
            if application.status != 'pending':
                skipped += 1
                continue
            try:
                application.reject_application(
                    admin_user=request.user,
                    rejection_reason='Rejected by admin via Django admin action.',
                )
                rejected += 1
            except Exception as exc:  # noqa: BLE001
                self.message_user(
                    request,
                    f"Failed to reject application {application.organization_name}: {exc}",
                    level=messages.ERROR,
                )

        if rejected:
            self.message_user(request, f"Rejected {rejected} application(s).", level=messages.SUCCESS)
        if skipped:
            self.message_user(request, f"Skipped {skipped} non-pending application(s).", level=messages.WARNING)

    reject_applications.short_description = "Reject selected applications"
