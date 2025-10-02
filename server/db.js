const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",        
  password: "12345",        
  database: "fitness_tracker" 
});


module.exports = db;
