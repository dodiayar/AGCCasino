import { Connection } from 'mysql'
import { idleInterval } from '../utils/mysqlIdle'
import { Players } from '../players/players'
import { connect } from './conn'

export class Users {
	public static _conn: Connection
	private static _init: boolean = false

	private static init() {
		Users._conn = connect()
		idleInterval()

		Users._init = true
	}

	public static getUsers(): Promise<any> {
		if (!Users._init) Users.init()
		return new Promise((resolve, reject) => {
			Users._conn.query(
				{
					sql: 'SELECT `id`, `username`, `email`, `full_name` FROM user',
				},
				(err, res) => {
					if (err) {
						return reject(err)
					}
					return resolve(res)
				}
			)
		})
	}

	public static getUser(username: string): Promise<any> {
		if (!Users._init) Users.init()
		return new Promise((resolve, reject) => {
			Users._conn.query(
				{
					sql: 'SELECT `id`, `username`, `email`, `full_name` FROM user WHERE username = ?',
				},
				[username],
				(err, res) => {
					if (err) {
						return reject(err)
					}
					return resolve(res)
				}
			)
		})
	}

	public static login(username: string, password: string): Promise<boolean> {
		if (!Users._init) Users.init()
		return new Promise((resolve, reject) => {
			Users._conn.query(
				{
					sql: 'SELECT `username` FROM user WHERE username = ? AND password = ?',
				},
				[username, password],
				(err, res) => {
					if (err) {
						return reject(err)
					}
					if (res.length > 0) {
						if (Players.isOnline(username)) {
							return reject('User already online')
						} else {
							return resolve(true)
						}
					} else {
						reject('Username or password is wrong')
					}
				}
			)
		})
	}
}
