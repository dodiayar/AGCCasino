import { Server, Socket } from 'socket.io'
import { checkLoggedIn } from '../../utils/checkLoggedIn'
import { Tables } from '../../table/tables'
import { RPS } from '../../games/rps'
import chalk from 'chalk'
import consola from 'consola'

export function onRPSReady(io: Server, socket: Socket, data: any) {
	const json = JSON.parse(data)
	const table = Tables.findTable(json.tableName)

	checkLoggedIn(socket, json)
	;(<RPS>table).ready(json.username, io)

	consola.info(
		`Player ${json.username} ${chalk.greenBright(
			'is ready'
		)} on RPS table ${chalk.blueBright(table.name)}`
	)
}
