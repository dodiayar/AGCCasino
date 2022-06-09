import { Socket } from 'socket.io'
import chalk from 'chalk'
import consola from 'consola'
import { Players } from '../players/players'
import { Balance } from '../models/balance'

export async function onLogin(socket: Socket, username: any) {
	socket.data.username = username
	consola.info(
		`User ${socket.data.username} has ${chalk.green(
			'logged in'
		)} from ${chalk.blueBright(socket.conn.remoteAddress)}`
	)
	Players.addPlayer(username)

	const balance = await Balance.findOne({ where: { username } })
	if (!balance) {
		const newBalance = new Balance()
		newBalance.balance = 0
		newBalance.username = username
		await newBalance.save()
	}
}
