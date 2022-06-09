import chalk from 'chalk'
import consola from 'consola'
import { Server, Socket } from 'socket.io'
import { Balance } from '../models/balance'
import { Bet } from '../models/bet'
import { Table } from '../table/table'

export class RPS extends Table {
	public rake: number = 0
	public bet: number
	public creator: string
	public player: string = ''
	public invitee: Array<string>
	public isPrivate: boolean
	public status: 'waiting' | 'playing'

	private _creatorDecision: 'rock' | 'paper' | 'scissors' | null = null
	private _playerDecision: 'rock' | 'paper' | 'scissors' | null = null
	private _creatorReady = false
	private _playerReady = false
	private _creatorBet: Bet
	private _playerBet: Bet

	public playerJoined(username: string, socket: Socket, io: Server) {
		setTimeout(() => {
			if (this.player !== '') {
				io.to(socket.id).emit('player2', this.player)
				io.to(socket.id).emit('readyOpen')
			}

			if (this._creatorReady) {
				io.to(socket.id).emit('ready', 'player1')
			}

			if (this._playerReady) {
				io.to(socket.id).emit('ready', 'player2')
			}

			if (this._creatorReady && this._playerReady) {
				io.to(socket.id).emit('decisionsActive')
			}

			if (this._creatorDecision != null) {
				io.to(socket.id).emit('player1MadeDecision')
				if (this.creator == username) {
					io.to(socket.id).emit('existingDecision', this._creatorDecision)
				}
			}

			if (this._playerDecision != null) {
				io.to(socket.id).emit('player2MadeDecision')
				if (this.player == username) {
					io.to(socket.id).emit('existingDecision', this._playerDecision)
				}
			}

			if (this._creatorDecision != null && this._playerDecision != null) {
				io.to(socket.id).emit('result', {
					winner:
						this.gameLogic() == 'won'
							? 'player1'
							: this.gameLogic() == 'lost'
							? 'player2'
							: 'tied',
					result: this._creatorBet.result,
					player1Decision: this._creatorDecision,
					player2Decision: this._playerDecision,
				})
			}
		}, 200)
	}

	public playerDisconnected(_username: string, _io: Server) {}

	public async ready(username: string, io: Server) {
		if (this.creator == username) {
			const balance = await Balance.findOne({ where: { username } })
			if (!balance) {
				io.to(this.name).emit('fatalPlayer1', 'Balance Not Found')
				return
			}
			if (balance.balance - this.bet < 0) {
				io.to(this.name).emit(
					'fatalPlayer1',
					'Not Enough Balance. Re-Deposit To Continue The Thrill!'
				)
				return
			}
			balance.balance -= this.bet
			balance.save()
			this._creatorReady = true
			this._creatorBet = new Bet()
			this._creatorBet.bet = this.bet
			this._creatorBet.game = this.game
			this._creatorBet.result = 0
			this._creatorBet.status = 'Waiting'
			this._creatorBet.username = username
			await this._creatorBet.save()
			io.to(this.name).emit('ready', 'player1')
			io.to(this.name).emit('betPlayer1', this._creatorBet.id)
		} else {
			const balance = await Balance.findOne({ where: { username } })
			if (!balance) {
				io.to(this.name).emit('fatalPlayer2', 'Balance Not Found')
				return
			}
			if (balance.balance - this.bet < 0) {
				io.to(this.name).emit(
					'fatalPlayer2',
					'Not Enough Balance. Re-Deposit To Continue The Thrill!'
				)
				return
			}
			balance.balance -= this.bet
			balance.save()
			this._playerReady = true
			this._playerBet = new Bet()
			this._playerBet.bet = this.bet
			this._playerBet.game = this.game
			this._playerBet.result = 0
			this._playerBet.status = 'Waiting'
			this._playerBet.username = username
			await this._playerBet.save()
			io.to(this.name).emit('ready', 'player2')
			io.to(this.name).emit('betPlayer2', this._playerBet.id)
		}

		if (this._creatorReady && this._playerReady) {
			consola.info(
				`Activating decisions on RPS table ${chalk.blueBright(this.name)}`
			)
			io.to(this.name).emit('decisionsActive')
			this.status = 'playing'
		}
	}

	public decision(username: string, decision: string, io: Server) {
		if (username == this.creator) {
			this._creatorDecision = decision as 'rock' | 'paper' | 'scissors'
			io.to(this.name).emit('player1MadeDecision')
		}
		if (username == this.player) {
			this._playerDecision = decision as 'rock' | 'paper' | 'scissors'
			io.to(this.name).emit('player2MadeDecision')
		}

		if (this._creatorDecision != null && this._playerDecision != null)
			this.conclude(this.gameLogic(), io)
	}

	public deleteTable(username: string, io: Server) {
		if (
			username == this.creator &&
			!this._creatorReady &&
			!this._playerReady
		) {
			io.to(this.name).emit('tableDeleted')
			consola.info(
				`Table ${chalk.blueBright(this.name)} has been ${chalk.redBright(
					'deleted'
				)}`
			)
		}
	}

	public async conclude(creatorBet: 'won' | 'lost' | 'tied', io: Server) {
		this._creatorBet.status = 'Finished'
		this._playerBet.status = 'Finished'
		switch (creatorBet) {
			case 'won':
				this._creatorBet.result =
					this._creatorBet.bet * 2 -
					(this._creatorBet.bet * this.rake) / 100
				this._playerBet.result = 0
				consola.success(
					`Player ${this.creator} ${chalk.green('won')} ${
						chalk.magenta(this._creatorBet.result) + '₺'
					} on table ${chalk.blueBright(this.name)}`
				)
				consola.success(
					`Player ${this.player} ${chalk.red('lost')} ${
						chalk.magenta(this._playerBet.result) + '₺'
					} on table ${chalk.blueBright(this.name)}`
				)
				io.to(this.name).emit('result', {
					winner: 'player1',
					result: this._creatorBet.result,
					player1Decision: this._creatorDecision,
					player2Decision: this._playerDecision,
				})
				break
			case 'lost':
				this._creatorBet.result = 0
				this._playerBet.result =
					this._playerBet.bet * 2 - (this._playerBet.bet * this.rake) / 100
				consola.success(
					`Player ${this.creator} ${chalk.red('lost')} ${
						chalk.magenta(this._creatorBet.result) + '₺'
					} on table ${chalk.blueBright(this.name)}`
				)
				consola.success(
					`Player ${this.player} ${chalk.green('won')} ${
						chalk.magenta(this._playerBet.result) + '₺'
					} on table ${chalk.blueBright(this.name)}`
				)
				io.to(this.name).emit('result', {
					winner: 'player2',
					result: this._playerBet.result,
					player1Decision: this._creatorDecision,
					player2Decision: this._playerDecision,
				})
				break
			case 'tied':
				this._creatorBet.result = this._creatorBet.bet
				this._playerBet.result = this._playerBet.bet
				consola.success(
					`Player ${this.creator} ${chalk.gray('tied')} ${
						chalk.magenta(this._creatorBet.result) + '₺'
					} on table ${chalk.blueBright(this.name)}`
				)
				consola.success(
					`Player ${this.player} ${chalk.gray('tied')} ${
						chalk.magenta(this._playerBet.result) + '₺'
					} on table ${chalk.blueBright(this.name)}`
				)
				io.to(this.name).emit('result', {
					winner: 'tie',
					result: 0,
					player1Decision: this._creatorDecision,
					player2Decision: this._playerDecision,
				})
		}
		const creator = await Balance.findOneOrFail({
			where: { username: this.creator },
		})
		const player = await Balance.findOneOrFail({
			where: { username: this.player },
		})
		creator.balance += this._creatorBet.result
		player.balance += this._playerBet.result

		creator.save()
		player.save()
		this._creatorBet.save()
		this._playerBet.save()

		setTimeout(() => {
			this._creatorReady = false
			this._playerReady = false
			this._creatorBet = new Bet()
			this._playerBet = new Bet()
			this._creatorDecision = null
			this._playerDecision = null
			this.status = 'waiting'
			io.to(this.name).emit('reset')
			io.to(this.name).emit('notready', 'player1')
			io.to(this.name).emit('notready', 'player2')
			consola.info(
				`Table ${chalk.blueBright(this.name)} has been ${chalk.yellowBright(
					'resetted'
				)}`
			)
		}, 3000)
	}

	private gameLogic(): 'won' | 'lost' | 'tied' {
		if (this._creatorDecision == this._playerDecision) return 'tied'
		switch (this._creatorDecision) {
			case 'rock':
				if (this._playerDecision == 'paper') return 'lost'
				else return 'won'
			case 'paper':
				if (this._playerDecision == 'rock') return 'won'
				else return 'lost'
			case 'scissors':
				if (this._playerDecision == 'rock') return 'lost'
				else return 'won'
		}
		return 'tied'
	}
}
