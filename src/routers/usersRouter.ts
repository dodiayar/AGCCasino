import { Router } from 'express'
import { Users } from '../users/users'

const router = Router()

router.get('/users', async (_, res) => {
	try {
		res.send(await Users.getUsers())
	} catch (err) {
		console.error(err)
	}
})

router.get('/user/:username', async (req, res) => {
	const username = req.params.username
	try {
		res.send(await Users.getUser(username))
	} catch (err) {
		console.error(err)
	}
})

router.post('/login', async (req, res) => {
	const { username, password } = req.body
	try {
		;(await Users.login(username, password))
			? res.send({ success: 'Logged in' })
			: res.status(400).send({ error: 'Username or password is incorrect' })
	} catch (error) {
		res.status(400).send({ error })
	}
})

export default router
