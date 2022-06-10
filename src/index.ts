import bodyParser from 'body-parser'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { onConnect } from './events/socket'
import tablesRouter from './routers/tablesRouter'
import usersRouter from './routers/usersRouter'
import playersRouter from './routers/playersRouter'
import metaRouter from './routers/metaRouter'
import { Tables } from './table/tables'
import { createConnection } from 'typeorm'
import consola from 'consola'
import { Baccarat } from './games/baccarat'

const app = express()

app.use(bodyParser.json())

createConnection()

app.use(tablesRouter)
app.use(usersRouter)
app.use(playersRouter)
app.use(metaRouter)

const server = createServer(app)

const io = new Server(server)

io.on('connection', (socket) => onConnect(io, socket))

server.listen(956, () => consola.success('Server listening on port 956'))

Tables.setTables([])

let baccaratTables = new Array<Baccarat>()
baccaratTables.push(new Baccarat('Baccarat FAST Low Limit', io))
baccaratTables[0].minBet = 0.5
baccaratTables[0].maxBet = 5

baccaratTables.push(new Baccarat('Baccarat FAST Medium Stakes', io))
baccaratTables[1].minBet = 2
baccaratTables[1].maxBet = 20

baccaratTables.push(new Baccarat('Baccarat FAST VIP', io))
baccaratTables[2].minBet = 10
baccaratTables[2].maxBet = 100

for (let table of baccaratTables) {
	Tables.addTable(table)
}
