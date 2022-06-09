import { Server, Socket } from 'socket.io'
import { onJoin } from './join'
import consola from 'consola'
import chalk from 'chalk'
import { onLogin } from './login'
import { Players } from '../players/players'
import { onRPSSit } from './rpsSit'
import { onRPSReady } from './rpsReady'
import { onRPSDecision } from './rpsDecision'
import { onRPSDeleteTable } from './rpsDeleteTable'

export function onDisconect(socket: Socket, reason: string) {
	if (socket.data.tableName) {
		consola.info(
			`User ${socket.data.username} has ${chalk.yellowBright(
				'left'
			)} table ${chalk.blueBright(
				socket.data.tableName
			)}. Reason: ${chalk.magentaBright(reason)}`
		)
	} else {
		consola.info(
			`User ${socket.data.username} has ${chalk.red(
				'disconnected'
			)}. Reason: ${chalk.magentaBright(reason)}`
		)
		Players.removePlayer(socket.data.username)
	}
}

export function onConnect(io: Server, socket: Socket) {
	socket.on('join', (data) => onJoin(io, socket, data))
	socket.on('login', (data) => onLogin(socket, data))
	socket.on('rpsSit', (data) => onRPSSit(io, socket, data))
	socket.on('rpsReady', (data) => onRPSReady(io, socket, data))
	socket.on('rpsDecision', (data) => onRPSDecision(io, socket, data))
	socket.on('rpsDeleteTable', (data) => onRPSDeleteTable(io, socket, data))

	socket.on('disconnect', (reason) => onDisconect(socket, reason))
}
