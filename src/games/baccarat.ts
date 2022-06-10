import { Server, Socket } from 'socket.io'
import { Card, Deck } from '../utils/deck'
import { Table } from '../table/table'
import consola from 'consola'
import { Balance } from '../models/balance'
import { Bet } from '../models/bet'
import chalk from 'chalk'

export class Baccarat extends Table {
	public minBet: number = 0.5
	public maxBet: number = 5

	private _counter = 0
	private _io: Server
	private _currentDealerText: string
	private _bets = new Map<'dealer' | 'player' | 'tie', Array<Bet>>()
	private _betAmounts = new Map<'dealer' | 'player', number>()

	constructor(name: string, io: Server) {
		super(name, 'baccarat', 0)
		this._io = io
		this.waiting()

		this._bets.set('dealer', [])
		this._bets.set('player', [])
		this._bets.set('tie', [])
	}

	private waiting() {
		this._betAmounts.set('dealer', 0)
		this._betAmounts.set('player', 0)
		for (let bet of ['dealer', 'player', 'tie'] as const) {
			this._bets.set(bet, [])
		}
		this._io.to(this.name).emit('reset')
		this._counter = 10
		const interval = setInterval(() => {
			this._currentDealerText = 'Place Your Bets (' + this._counter + ')'
			this._io.to(this.name).emit('dealerText', this._currentDealerText)
			this._io.to(this.name).emit('betsAvailable')
			this._counter--
			if (this._counter == 0) {
				clearInterval(interval)
				setTimeout(() => {
					this.dealCards()
				}, 1000)
			}
		}, 1000)
	}

	private dealCards() {
		let dealer = 0
		let dealerCards: Array<Card | undefined> = []
		let player = 0
		let playerCards: Array<Card | undefined> = []

		this._currentDealerText = 'Dealing..'
		this._io.to(this.name).emit('dealerText', this._currentDealerText)
		this._io.to(this.name).emit('noMoreBets', this._currentDealerText)
		setTimeout(() => {
			const deck = new Deck()
			deck.shuffle()
			dealerCards.push(deck.drawOne())
			dealer += Deck.value('baccarat', dealerCards[0])
			playerCards.push(deck.drawOne())
			player += Deck.value('baccarat', playerCards[0])
			dealerCards.push(deck.drawOne())
			dealer += Deck.value('baccarat', dealerCards[1])
			playerCards.push(deck.drawOne())
			player += Deck.value('baccarat', playerCards[1])

			let dealerDraw = false

			// Natural (Dealer or Player drew an 8 or 9) - neither side draws, game over.
			if (dealer % 10 > 7 || player % 10 > 7) {
				// Player has 6 or 7 - stands
			} else if (player % 10 > 5) {
				// Player stood so dealer draws with [0-5] and stands with 6 or 7
				if (dealer % 10 <= 5) {
					dealerDraw = true
				}
				// Player has 0 - 5, draws 3rd card
			} else {
				playerCards.push(deck.drawOne())
				let player3rdCardValue = Deck.value('baccarat', playerCards[2])
				player += player3rdCardValue

				switch (player3rdCardValue) {
					case 2:
					case 3:
						// Player has 2, 3 - dealer draws 0-4, stands 5-7
						if (dealer % 10 < 5) dealerDraw = true
						break
					case 4:
					case 5:
						// Player has 4, 5 - dealer draws 0-5, stands 6-7
						if (dealer % 10 < 6) dealerDraw = true
						break
					case 6:
					case 7:
						// Player has 6, 7 - dealer draws 0-6, stands 7
						if (dealer % 10 < 7) dealerDraw = true
						break
					case 8:
						// Player has 8 - dealer draws 0-2, stands 3-7
						if (dealer % 10 < 3) dealerDraw = true
						break
					case 9:
					case 0:
					case 1:
						// Player has 9, T/K/Q/J, A - dealer draws 0-3, stands 4-7
						if (dealer % 10 < 4) dealerDraw = true
						break
				}
			}
			if (dealerDraw) {
				dealerCards.push(deck.drawOne())
				dealer += Deck.value('baccarat', dealerCards[2])
			}

			this._counter = 0
			const interval = setInterval(() => {
				switch (this._counter) {
					case 0:
						this._io.to(this.name).emit('playerCard', {
							card: playerCards[0],
							score: Deck.value('baccarat', playerCards[0]),
						})
						break
					case 1:
						this._io.to(this.name).emit('dealerCard', {
							card: dealerCards[0],
							score: Deck.value('baccarat', dealerCards[0]),
						})
						break
					case 2:
						this._io.to(this.name).emit('playerCard', {
							card: playerCards[1],
							score:
								(Deck.value('baccarat', playerCards[0]) +
									Deck.value('baccarat', playerCards[1])) %
								10,
						})
						break
					case 3:
						this._io.to(this.name).emit('dealerCard', {
							card: dealerCards[1],
							score:
								(Deck.value('baccarat', dealerCards[0]) +
									Deck.value('baccarat', dealerCards[1])) %
								10,
						})
						break
					case 4:
						if (playerCards.length == 3)
							this._io.to(this.name).emit('playerCard', {
								card: playerCards[2],
								score: player % 10,
							})
						break
					case 5:
						if (dealerCards.length == 3)
							this._io.to(this.name).emit('dealerCard', {
								card: dealerCards[2],
								score: dealer % 10,
							})
						break
					default:
						this.conclude(dealer, player)
						clearInterval(interval)
						return
				}
				this._counter++
			}, 500)
		}, 1000)
	}

	private async conclude(dealer: number, player: number) {
		const trueDealer = dealer % 10
		const truePlayer = player % 10

		let winnerBet: 'dealer' | 'player' | 'tie'

		if (trueDealer > truePlayer) winnerBet = 'dealer'
		else if (trueDealer < truePlayer) winnerBet = 'player'
		else winnerBet = 'tie'
		this._io.to(this.name).emit('result', winnerBet)

		for (let bet of ['dealer', 'tie', 'player'] as const) {
			if (winnerBet == 'tie' && bet != 'tie') {
				const array = this._bets.get(bet)
				if (array === undefined) continue
				for (let singleBet of array) {
					singleBet.result = singleBet.bet
					singleBet.status = 'Finished'
					singleBet.save()
					const balance = await Balance.findOneOrFail({
						where: { username: singleBet.username },
					})
					balance.balance += singleBet.result
					balance.save()
				}
			} else if (bet == winnerBet) {
				const array = this._bets.get(bet)
				if (array === undefined) continue
				for (let singleBet of array) {
					if (bet == 'dealer')
						singleBet.result =
							trueDealer == 6 ? 1.5 * singleBet.bet : 2 * singleBet.bet
					else if (bet == 'tie') singleBet.result = singleBet.bet * 9
					else singleBet.result = singleBet.bet * 2
					singleBet.status = 'Finished'
					singleBet.save()
					const balance = await Balance.findOneOrFail({
						where: { username: singleBet.username },
					})
					balance.balance += singleBet.result
					balance.save()
				}
			} else {
				const array = this._bets.get(bet)
				if (array === undefined) continue
				for (let singleBet of array) {
					singleBet.result = 0
					singleBet.status = 'Finished'
					singleBet.save()
				}
			}
		}

		setTimeout(() => {
			this.waiting()
		}, 5000)
	}

	public async bet(
		username: string,
		bet: 'dealer' | 'player' | 'tie',
		amount: number,
		io: Server,
		socket: Socket
	) {
		const balance = await Balance.findOne({ where: { username } })
		if (!balance) {
			io.to(socket.id).emit('fatal', 'Balance Not Found')
			return
		}

		if (balance.balance - amount < 0) {
			io.to(socket.id).emit(
				'fatal',
				'Not Enough Balance. Re-Deposit To Continue The Thrill!'
			)
			return
		}

		if (amount < this.minBet || amount > this.maxBet) {
			io.to(socket.id).emit('fatal', 'Invalid Bet')
			return
		}

		balance.balance -= amount
		balance.save()

		let myBet = new Bet()
		myBet.status = 'Waiting'
		myBet.result = 0
		myBet.game = this.game
		myBet.username = username
		myBet.bet = amount
		await myBet.save()

		consola.info(
			`Player ${username} ${chalk.greenBright('betted')} ${chalk.greenBright(
				amount + '₺'
			)} on baccarat table ${chalk.blueBright(this.name)} to ${bet}`
		)

		io.to(socket.id).emit('myBet', {
			bet,
			amount,
		})

		let array = this._bets.get(bet)
		if (array === undefined) array = []
		array.push(myBet)

		this._bets.set(bet, array)
		if (bet != 'tie') {
			let betAmount = this._betAmounts.get(bet)
			if (betAmount === undefined) betAmount = 0
			betAmount += amount
			this._betAmounts.set(bet, betAmount)
			io.to(this.name).emit(
				'total' + bet.charAt(0).toUpperCase() + bet.slice(1) + 'Bet',
				betAmount
			)
		}
	}

	public toJSON(): Object {
		return {
			name: this.name,
			game: this.game,
			minBet: this.minBet,
			maxBet: this.maxBet,
		}
	}
}
