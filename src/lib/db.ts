import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DATABASE_HOST, // Leer desde .env
  user: process.env.DATABASE_USER, // Leer desde .env
  password: process.env.DATABASE_PASSWORD, // Leer desde .env
  database: process.env.DATABASE_NAME, // Leer desde .env
  port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306, // Leer desde .env, con valor por defecto
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
