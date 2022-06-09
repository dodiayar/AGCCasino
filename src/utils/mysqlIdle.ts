import { Users } from '../users/users'

export function idleInterval() {
	setInterval(() => {
		Users._conn.query('SELECT 1;')
	}, 5000)
}
