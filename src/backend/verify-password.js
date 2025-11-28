const bcrypt = require('bcryptjs');
const db = require('./db');

async function verifyPassword() {
    try {
        // First, check total users
        const countResult = await db.query('SELECT COUNT(*) FROM users');
        console.log('Total users in database:', countResult.rows[0].count);

        // Get all users
        const allUsers = await db.query('SELECT id, email, role FROM users');
        console.log('\nAll users:');
        allUsers.rows.forEach(u => console.log(`  - ${u.email} (${u.role})`));

        // Get the admin user from database
        const result = await db.query(
            'SELECT id, email, password FROM users WHERE email = $1',
            ['admin@hospital.com']
        );

        if (result.rows.length === 0) {
            console.log('\n❌ Admin user not found in database');

            // Generate correct hash
            const correctHash = await bcrypt.hash('admin123', 10);
            console.log('\nCorrect hash for "admin123":', correctHash);
            console.log('\nTo fix, run this SQL:');
            console.log(`INSERT INTO users (id, email, password, role, name, phone, email_verified) VALUES ('admin-1', 'admin@hospital.com', '${correctHash}', 'admin', 'System Admin', '555-0000', true) ON CONFLICT (email) DO UPDATE SET password = '${correctHash}';`);

            process.exit(0);
        }

        const user = result.rows[0];
        console.log('\n✓ User found:', user.email);
        console.log('Stored password hash length:', user.password.length);
        console.log('Stored password hash:', user.password);

        // Test password
        const testPassword = 'admin123';
        console.log('\nTesting password:', testPassword);

        const match = await bcrypt.compare(testPassword, user.password);
        console.log('Password match:', match ? '✓ YES' : '❌ NO');

        if (!match) {
            // Generate new hash
            const newHash = await bcrypt.hash(testPassword, 10);
            console.log('\nNewly generated hash:', newHash);

            // Test new hash
            const newMatch = await bcrypt.compare(testPassword, newHash);
            console.log('New hash works:', newMatch ? '✓ YES' : '❌ NO');

            console.log('\nTo fix the password, run:');
            console.log(`UPDATE users SET password = '${newHash}' WHERE email = 'admin@hospital.com';`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verifyPassword();
