const db = require('./db');

async function migrate() {
    try {
        console.log('Checking for queue_position column...');

        // Check if column exists
        const checkResult = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' AND column_name = 'queue_position'
    `);

        if (checkResult.rows.length === 0) {
            console.log('Adding queue_position column...');
            await db.query(`
        ALTER TABLE appointments 
        ADD COLUMN queue_position INTEGER
      `);
            console.log('Column added successfully.');
        } else {
            console.log('Column queue_position already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
