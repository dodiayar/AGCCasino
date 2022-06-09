import { Router } from 'express'
import 'dotenv/config'

const router = Router()
1
router.get('/ver', (_, res) => {
	res.send(process.env.VER)
})

export default router
