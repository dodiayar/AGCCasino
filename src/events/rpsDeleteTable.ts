import { Server, Socket } from 'socket.io'
import { checkLoggedIn } from '../utils/checkLoggedIn'
import { Tables } from '../table/tables'
import { RPS } from '../games/rps'

export function onRPSDeleteTable(io: Server, socket: Socket, data: any) {
	const json = JSON.parse(data)
	console.log(json)
	const table = Tables.findTable(json.tableName)

	checkLoggedIn(socket, json)
	;(table as RPS).deleteTable(json.username, io)
}
