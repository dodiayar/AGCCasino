import { Server, Socket } from 'socket.io'
import { checkLoggedIn } from '../utils/checkLoggedIn'
import { Tables } from '../table/tables'
import { RPS } from '../games/rps'
import chalk from 'chalk'
import consola from 'consola'

export function onRPSSit(io: Server, socket: Socket, data: any) {
	const json = JSON.parse(data)
	const table = Tables.findTable(json.tableName)

	checkLoggedIn(socket, json)

	if (table.playerCount == 2) return

	if (table.players.filter((val) => val == json.username).length != 0) return

	table.addPlayer(json.username)
	if (table.playerCount == 2) {
		;(<RPS>table).player = json.username
		io.to(table.name).emit('readyOpen')
		io.to(table.name).emit('player2', json.username)
	}

	consola.info(
		`Player ${json.username} ${chalk.cyan(
			'sat'
		)} on RPS table ${chalk.blueBright(
			table.name
		)}. Player count: ${chalk.magenta(table.playerCount)}`
	)
}
