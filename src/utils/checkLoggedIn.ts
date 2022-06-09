import chalk from 'chalk'
import consola from 'consola'
import { Socket } from 'socket.io'
import { Players } from '../players/players'

export function checkLoggedIn(socket: Socket, json: any) {
	if (!Players.isOnline(json.username)) {
		consola.warn(
			`User ${json.username} attempted to join table ${chalk.blueBright(
				json.tableName
			)} without being logged in`
		)
		socket.emit('notLoggedIn')
		socket.disconnect()
		return
	}
}
