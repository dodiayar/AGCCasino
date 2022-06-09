import { Router } from 'express'
import { presence, validate } from 'property-validator'
import { RPS } from '../games/rps'
import { games } from '../games'
import { Table } from '../table/table'
import { Tables } from '../table/tables'
import { Players } from '../players/players'
import consola from 'consola'
import chalk from 'chalk'

const router = Router()

router.get('/tables', (_, res) => {
	let tables: Map<string, Table[]> = new Map()
	for (let game of games) {
		tables.set(
			game,
			Tables.getTables().filter((el) => el.game === game)
		)
	}
	res.send(Object.fromEntries(tables))
})

router.get('/table/:name', (req, res) => {
	const name = req.params.name

	const table = Tables.getTables().filter((el) => el.name === name)

	if (table.length === 0) res.status(400).send({ error: 'Table not found' })

	return res.send(table[0])
})

router.post('/table/create', (req, res) => {
	const validation = validate(req.body, [
		presence('name'),
		presence('isPrivate'),
		presence('bet'),
		presence('username'),
	])

	if (!validation.valid)
		return res.status(400).send({ error: validation.messages })
	if (!Players.isOnline(req.body.username))
		return res
			.status(400)
			.send({ error: 'Authorization Error - Please Restart Client' })

	let table: RPS = new RPS(req.body.name, 'rps', 2)
	table.invitee = []
	table.bet = req.body.bet
	table.isPrivate = req.body.isPrivate
	table.creator = req.body.username
	table.status = 'waiting'

	Tables.addTable(table)

	table.addPlayer(req.body.username)

	consola.info(
		`RPS table ${chalk.blueBright(table.name)} is created by ${table.creator}`
	)

	return res.send(table)
})

export default router
