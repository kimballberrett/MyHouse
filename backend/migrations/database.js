require("dotenv").config();
const { Pool } = require("pg");

const DEFAULT_DATABASE_URL = "postgresql://localhost:5432/myhouse";
const connectionString = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;

const pool = new Pool({ connectionString });

module.exports = pool;
