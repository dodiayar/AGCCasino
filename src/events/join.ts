import chalk from 'chalk'
import consola from 'consola'
import { Server, Socket } from 'socket.io'
import { RPS } from '../games/rps'
import { Tables } from '../table/tables'
import { checkLoggedIn } from '../utils/checkLoggedIn'

export function onJoin(io: Server, socket: Socket, data: any) {
	const json = JSON.parse(data)
	const table = Tables.findTable(json.tableName)

	checkLoggedIn(socket, json)
	if (!table) {
		consola.warn(
			`User ${
				json.username
			} attempted to join non-existent table ${chalk.blueBright(
				json.tableName
			)}`
		)
	}
	socket.join(json.tableName)
	socket.data = json
	consola.info(
		`User ${json.username} ${chalk.blue('joined')} table ${chalk.blueBright(
			json.tableName
		)}`
	)

	if (table.game == 'rps') {
		;(<RPS>table).playerJoined(json.username, socket, io)
	}
}
