const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(client => {
    console.log("Conexion exitosa a PostgreSQL (Supabase)");
    client.release();
  })
  .catch(err => {
    console.error("Error de conexion a Supabase:", err.message);
  });

module.exports = {
  query: (text, params) => pool.query(text, params),
};