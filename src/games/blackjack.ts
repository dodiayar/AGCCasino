import { Server } from 'http'
import { Table } from '../table/table'

export class Blackjack extends Table {
	public minBet = 0.5
	public maxBet = 5

	private _players = new Map<number, string>()

	constructor(name: string, minBet: number, maxBet: number) {
		super(name, 'blackjack', 3)
		this.minBet = minBet
		this.maxBet = maxBet
	}

	public sit(username: string, position: number, io: Server) {
		this._players
	}

	public toJSON(): Object {
		return {
			name: this.name,
			game: 'blackjack',
			minBet: this.minBet,
			maxBet: this.maxBet,
			playerCount: this._players.size,
			players: this._players,
			maxPlayers: this.maxPlayers,
		}
	}
}
