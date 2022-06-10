import { Server, Socket } from 'socket.io'
import { checkLoggedIn } from '../../utils/checkLoggedIn'
import { Tables } from '../../table/tables'
import { RPS } from '../../games/rps'

export function onRPSDecision(io: Server, socket: Socket, data: any) {
	const json = JSON.parse(data)
	const table = Tables.findTable(json.tableName) as RPS

	checkLoggedIn(socket, json)
	table.decision(json.username, json.decision, io)
}
