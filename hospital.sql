select * from users;
select * from doctors;
delete from patients where blood_group='O';
delete from users where email='tinashehando@gmail.com';
-- List all doctors with their current emails
SELECT u.id, u.name, u.email, d.specialization 
FROM users u
JOIN doctors d ON u.id = d.id
WHERE u.role = 'doctor';

-- Then update the one you want
UPDATE users 
SET email = 'tinashehando@gmail.com' 
WHERE id = 'doc-2';  -- Change to the doctor ID you want