import { Server, Socket } from 'socket.io'
import { checkLoggedIn } from '../../utils/checkLoggedIn'
import { Tables } from '../../table/tables'
import { RPS } from '../../games/rps'

export function onRPSDeleteTable(io: Server, socket: Socket, data: any) {
	const json = JSON.parse(data)
	const table = Tables.findTable(json.table) as RPS

	checkLoggedIn(socket, json)
	table.deleteTable(json.username, io)
	Tables.removeTable(table.name)
}
