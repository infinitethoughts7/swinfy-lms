# backend/users/admin.py

from django.contrib import admin
from django.contrib import messages
from django.contrib.auth.admin import UserAdmin
from django.db import transaction
from django.utils import timezone
from .models import User, KPProfile, LearnerProfile, KPInstructorProfile, KnowledgePartnerApplication


@admin.register(KPProfile)
class KPProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'location', 'is_active', 'created_at']
    list_filter = ['type', 'is_active', 'created_at']
    search_fields = ['name', 'location', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Organization Information', {
            'fields': ('user', 'name', 'type', 'description', 'location', 'website')
        }),
        ('Admin Contact', {
            'fields': ('kp_admin_name', 'kp_admin_email', 'kp_admin_phone')
        }),
        ('Branding', {
            'fields': ('logo', 'linkedin_url')
        }),
        ('Status', {
            'fields': ('is_active', 'is_verified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['email', 'full_name', 'role', 'knowledge_partner', 'kp_approval_status', 'is_verified', 'is_approved', 'is_staff', 'created_at']
    list_filter = ['role', 'kp_approval_status', 'is_verified', 'is_approved', 'is_staff', 'is_superuser', 'is_active', 'created_at']
    search_fields = ['email', 'full_name', 'first_name', 'last_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'last_login', 'date_joined']
    
    # Custom field label method
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'full_name':
            kwargs['label'] = 'KP Full Name'
        return super().formfield_for_dbfield(db_field, request, **kwargs)
    
    fieldsets = (
        ('Authentication', {
            'fields': ('email', 'password')
        }),
        ('Personal Info', {
            'fields': ('full_name', 'first_name', 'last_name')
        }),
        ('Role & Status', {
            'fields': ('role', 'is_verified', 'is_approved')
        }),
        ('Knowledge Partner Association', {
            'fields': ('knowledge_partner', 'kp_approval_status')
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
            'fields': ('full_name', 'role')
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
    list_display = ['user', 'phone_number', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__full_name', 'user__email', 'interests']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('bio', 'profile_picture', 'phone_number')
        }),
        ('Learning Preferences', {
            'fields': ('learning_goals', 'interests')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(KPInstructorProfile)
class KPInstructorProfileAdmin(admin.ModelAdmin):
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
            'fields': ('is_available',)
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
        Approve Knowledge Partner Applications and Create KP Admin User + KPProfile
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

                    # Check if email already exists
                    if User.objects.filter(email=application.knowledge_partner_email).exists():
                        raise Exception(f'User with email {application.knowledge_partner_email} already exists')
                    
                    # Check if Knowledge Partner name already exists
                    if KPProfile.objects.filter(name=application.knowledge_partner_name).exists():
                        raise Exception(f'Knowledge Partner with name "{application.knowledge_partner_name}" already exists')

                    # Step 1: Create KP Admin User Account
                    kp_admin_user = User.objects.create_user(
                        email=application.knowledge_partner_email,
                        password='olla@07',  # Fixed password as requested
                        full_name=f"{application.knowledge_partner_name} Admin",
                        role='knowledge_partner',
                        is_verified=True,
                        is_approved=True,
                    )

                    # Step 2: Create KPProfile linked to the user
                    KPProfile.objects.create(
                        user=kp_admin_user,
                        name=application.knowledge_partner_name,
                        type=application.knowledge_partner_type,
                        description=application.partner_message or f'{application.knowledge_partner_name} - Knowledge Partner',
                        location='',  # Can be updated later by KP Admin
                        website=application.website_url or '',
                        kp_admin_name=f"{application.knowledge_partner_name} Admin",
                        kp_admin_email=application.knowledge_partner_email,
                        kp_admin_phone='',  # Can be updated later
                        is_active=True,
                        is_verified=False,  # Will be verified by super admin later
                    )

                    # Step 3: Update Application Status
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
                f"KP Admin accounts created with email/password credentials. "
                f"Default password: 'olla@07'",
                level=messages.SUCCESS
            )
        if skipped:
            self.message_user(
                request, 
                f"Skipped {skipped} non-pending application(s).", 
                level=messages.WARNING
            )

    approve_and_create_kp_admin.short_description = "✅ Approve & Create KP + Admin User"

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