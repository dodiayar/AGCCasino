import { Server, Socket } from 'socket.io'
import { checkLoggedIn } from '../../utils/checkLoggedIn'
import { Tables } from '../../table/tables'
import { Baccarat } from '../../games/baccarat'

export function onBaccaratBet(io: Server, socket: Socket, data: any) {
	const json = JSON.parse(data)
	const table = Tables.findTable(json.tableName)

	checkLoggedIn(socket, json)
	;(<Baccarat>table).bet(json.username, json.bet, json.amount, io, socket)
}
