require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function createUser() {
  const [,, username, password] = process.argv;

  if (!username || !password) {
    console.error('Usage: node src/create-user.js <username> <password>');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username.toLowerCase().trim(), hash]
    );
    console.log('User created:', result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      console.error(`Username "${username}" already exists.`);
    } else {
      console.error('Error creating user:', err.message);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createUser();
