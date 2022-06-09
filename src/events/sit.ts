import { Socket } from 'socket.io'
import { Tables } from '../table/tables'
import { checkLoggedIn } from '../utils/checkLoggedIn'

export function sit(socket: Socket, data: any) {
	const json = JSON.parse(data)
	checkLoggedIn(socket, json)

	Tables.findTable(data.tableName).addPlayer(json.username)
}
