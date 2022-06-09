import { Router } from 'express'
import { Balance } from '../models/balance'
import { Players } from '../players/players'

const router = Router()

router.get('/playerCount', (_, res) => {
	res.send({
		count: Players.playerList.length,
	})
})

router.get('/balance/:username', async (req, res) => {
	const { username } = req.params

	const balance = await Balance.findOne({ where: { username } })
	if (!balance) return res.status(404).send({ error: "User doesn't exist" })

	return res.send({ username, balance: balance.balance })
})

router.get('/isOnline/:username', async (req, res) => {
	const { username } = req.params

	const user = await Balance.findOne({ where: { username } })
	if (!user) return res.status(404).send()

	return res.send({
		online: Players.isOnline(username),
		message: Players.isOnline(username)
			? 'User is currently online'
			: 'User is offline',
	})
})

export default router
