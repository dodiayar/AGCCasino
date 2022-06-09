import mysql from 'mysql'

export function connect() {
	return mysql.createConnection({
		host: '127.0.0.1',
		user: 'root',
		password: '',
		database: 'agc_login',
	})
}
