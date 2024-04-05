 import pg from "pg";
 const pool = new pg.Pool({
    host: 'database',
    port: 5432,
    user: 'postgres',
    password: 'admin',
    database: 'movies'
 });

export default pool