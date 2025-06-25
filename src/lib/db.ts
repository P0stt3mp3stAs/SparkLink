import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // VERY IMPORTANT for AWS RDS with SSL enabled
  },
});

export default pool;
