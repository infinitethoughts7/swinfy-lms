# Generated data migration to fix role names

from django.db import migrations


def fix_knowledge_partner_admin_roles(apps, schema_editor):
    """Update any knowledge_partner_admin roles to knowledge_partner."""
    User = apps.get_model('users', 'User')
    
    # Update users with knowledge_partner_admin role to knowledge_partner
    users_updated = User.objects.filter(role='knowledge_partner_admin').update(role='knowledge_partner')
    
    if users_updated:
        print(f"Fixed {users_updated} user(s) with knowledge_partner_admin role to knowledge_partner")
    else:
        print("No users found with knowledge_partner_admin role")


def reverse_fix_knowledge_partner_admin_roles(apps, schema_editor):
    """Reverse the role fix (not recommended)."""
    User = apps.get_model('users', 'User')
    
    # Note: This reverse operation is not recommended as it could break the system
    # Only provided for migration reversibility
    users_updated = User.objects.filter(role='knowledge_partner').update(role='knowledge_partner_admin')
    
    if users_updated:
        print(f"Reversed {users_updated} user(s) from knowledge_partner to knowledge_partner_admin")


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0021_fix_production_kp_references'),
    ]

    operations = [
        migrations.RunPython(
            fix_knowledge_partner_admin_roles,
            reverse_fix_knowledge_partner_admin_roles,
        ),
    ]
