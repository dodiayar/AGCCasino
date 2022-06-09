import mysql from 'mysql'
import 'dotenv/config'

export function connect() {
	return mysql.createConnection({
		host: process.env.USERDB_HOST,
		user: process.env.USERDB_USER,
		password: process.env.USERDB_PASS,
		database: process.env.USERDB_DBNAME,
	})
}
