-- Fix Production Foreign Key Constraint Violation
-- Run this script directly in your production database

BEGIN;

-- Step 1: Temporarily disable the foreign key constraint
SET CONSTRAINTS users_kpinstructorpr_knowledge_partner_id_29832a33_fk_users_kpp DEFERRED;

-- Step 2: Get all valid KP IDs and create a default if none exists
DO $$
DECLARE
    default_kp_id UUID;
    valid_kp_count INTEGER;
BEGIN
    -- Count existing KP profiles
    SELECT COUNT(*) INTO valid_kp_count FROM users_kpprofile;
    
    IF valid_kp_count = 0 THEN
        -- Create a default KP if none exists
        INSERT INTO users_kpprofile 
        (id, name, type, description, location, kp_admin_name, kp_admin_email, 
         is_active, is_verified, created_at, updated_at)
        VALUES 
        (gen_random_uuid(), 'Default Knowledge Partner', 'other', 
         'Default organization for orphaned instructors', 'Unknown', 
         'System Admin', 'admin@system.com', true, false, NOW(), NOW());
        
        -- Get the newly created KP ID
        SELECT id INTO default_kp_id FROM users_kpprofile WHERE name = 'Default Knowledge Partner';
        RAISE NOTICE 'Created default KP with ID: %', default_kp_id;
    ELSE
        -- Use the first available KP
        SELECT id INTO default_kp_id FROM users_kpprofile ORDER BY created_at ASC LIMIT 1;
        RAISE NOTICE 'Using existing KP with ID: %', default_kp_id;
    END IF;
    
    -- Step 3: Update all instructors with invalid knowledge_partner references
    UPDATE users_kpinstructorprofile 
    SET knowledge_partner_id = default_kp_id 
    WHERE knowledge_partner_id IS NULL 
       OR knowledge_partner_id NOT IN (SELECT id FROM users_kpprofile);
    
    -- Log the results
    GET DIAGNOSTICS valid_kp_count = ROW_COUNT;
    RAISE NOTICE 'Fixed % instructor profiles', valid_kp_count;
END $$;

-- Step 4: Re-enable the foreign key constraint
SET CONSTRAINTS users_kpinstructorpr_knowledge_partner_id_29832a33_fk_users_kpp IMMEDIATE;

COMMIT;

-- Verify the fix
SELECT 
    'Instructors with valid KP references' as status,
    COUNT(*) as count
FROM users_kpinstructorprofile i
JOIN users_kpprofile kp ON i.knowledge_partner_id = kp.id

UNION ALL

SELECT 
    'Instructors with invalid KP references' as status,
    COUNT(*) as count
FROM users_kpinstructorprofile i
LEFT JOIN users_kpprofile kp ON i.knowledge_partner_id = kp.id
WHERE kp.id IS NULL;
