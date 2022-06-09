import bodyParser from 'body-parser'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { onConnect } from './events/socket'
import tablesRouter from './routers/tablesRouter'
import usersRouter from './routers/usersRouter'
import playersRouter from './routers/playersRouter'
import metaRouter from './routers/metaRouter'
import { Table } from './table/table'
import { Tables } from './table/tables'
import { createConnection } from 'typeorm'
import consola from 'consola'

const app = express()

app.use(bodyParser.json())

Tables.setTables([
	new Table('Table 1', 'blackjack', 3),
	new Table('Salon Privé', 'blackjack', 1),
])

createConnection()

app.use(tablesRouter)
app.use(usersRouter)
app.use(playersRouter)
app.use(metaRouter)

const server = createServer(app)

const io = new Server(server)

io.on('connection', (socket) => onConnect(io, socket))

server.listen(956, () => consola.success('Server listening on port 956'))
