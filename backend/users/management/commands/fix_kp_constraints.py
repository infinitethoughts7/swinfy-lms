from django.core.management.base import BaseCommand
from django.db import connection, transaction


class Command(BaseCommand):
    help = 'Fix foreign key constraint violations for KPInstructorProfile knowledge_partner references'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be fixed without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        with connection.cursor() as cursor:
            if dry_run:
                self.stdout.write("DRY RUN MODE - No changes will be made")
                self._analyze_constraints(cursor)
            else:
                self._fix_constraints(cursor)

    def _analyze_constraints(self, cursor):
        """Analyze the current state without making changes"""
        self.stdout.write("Analyzing foreign key constraints...")
        
        # Check for invalid references
        cursor.execute("""
            SELECT i.id, i.knowledge_partner_id, kp.id as kp_exists
            FROM users_kpinstructorprofile i
            LEFT JOIN users_kpprofile kp ON i.knowledge_partner_id = kp.id
            WHERE kp.id IS NULL
        """)
        
        invalid_refs = cursor.fetchall()
        
        if invalid_refs:
            self.stdout.write(
                self.style.WARNING(f"Found {len(invalid_refs)} invalid references:")
            )
            for ref in invalid_refs:
                self.stdout.write(f"  Instructor {ref[0]}: knowledge_partner_id {ref[1]}")
        else:
            self.stdout.write(
                self.style.SUCCESS("No invalid references found")
            )
        
        # Check KP profiles
        cursor.execute("SELECT COUNT(*) FROM users_kpprofile")
        kp_count = cursor.fetchone()[0]
        self.stdout.write(f"Total KP profiles: {kp_count}")

    def _fix_constraints(self, cursor):
        """Fix the foreign key constraint violations"""
        self.stdout.write("Fixing foreign key constraints...")
        
        with transaction.atomic():
            # Step 1: Temporarily disable the foreign key constraint
            cursor.execute("SET CONSTRAINTS users_kpinstructorpr_knowledge_partner_id_29832a33_fk_users_kpp DEFERRED")
            
            # Step 2: Get all valid KP IDs
            cursor.execute("SELECT id FROM users_kpprofile")
            valid_kp_ids = {row[0] for row in cursor.fetchall()}
            
            # Step 3: Create a default KP if none exists
            if not valid_kp_ids:
                cursor.execute("""
                    INSERT INTO users_kpprofile 
                    (id, name, type, description, location, kp_admin_name, kp_admin_email, 
                     is_active, is_verified, created_at, updated_at)
                    VALUES 
                    (gen_random_uuid(), 'Default Knowledge Partner', 'other', 
                     'Default organization for orphaned instructors', 'Unknown', 
                     'System Admin', 'admin@system.com', true, false, NOW(), NOW())
                """)
                
                # Get the newly created KP ID
                cursor.execute("SELECT id FROM users_kpprofile WHERE name = 'Default Knowledge Partner'")
                default_kp_id = cursor.fetchone()[0]
                self.stdout.write(f"Created default KP with ID: {default_kp_id}")
            else:
                # Use the first available KP
                default_kp_id = list(valid_kp_ids)[0]
                self.stdout.write(f"Using existing KP with ID: {default_kp_id}")
            
            # Step 4: Find all instructors with invalid knowledge_partner references
            cursor.execute("""
                SELECT id, knowledge_partner_id 
                FROM users_kpinstructorprofile 
                WHERE knowledge_partner_id IS NULL 
                   OR knowledge_partner_id NOT IN %s
            """, [tuple(valid_kp_ids)])
            
            invalid_instructors = cursor.fetchall()
            
            if invalid_instructors:
                self.stdout.write(f"Found {len(invalid_instructors)} instructor profiles with invalid references")
                
                # Step 5: Update all invalid instructors to use the default KP
                instructor_ids = [instructor[0] for instructor in invalid_instructors]
                cursor.execute("""
                    UPDATE users_kpinstructorprofile 
                    SET knowledge_partner_id = %s 
                    WHERE id = ANY(%s)
                """, [default_kp_id, instructor_ids])
                
                self.stdout.write(
                    self.style.SUCCESS(f"Fixed {len(invalid_instructors)} instructor profiles")
                )
            else:
                self.stdout.write("No invalid instructor profiles found")
            
            # Step 6: Re-enable the foreign key constraint
            cursor.execute("SET CONSTRAINTS users_kpinstructorpr_knowledge_partner_id_29832a33_fk_users_kpp IMMEDIATE")
            
            self.stdout.write(
                self.style.SUCCESS("Foreign key constraints fixed successfully!")
            )
