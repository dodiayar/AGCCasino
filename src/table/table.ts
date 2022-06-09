import { IGames } from '../games'

export class Table {
	public name: string
	public game: IGames
	public maxPlayers: number
	public playerCount: number
	public players: string[]

	public constructor(_name: string, _game: IGames, _maxPlayers: number) {
		this.name = _name
		this.game = _game
		this.maxPlayers = _maxPlayers
		this.playerCount = 0
		this.players = []
	}

	public addPlayer(player: string) {
		this.players.push(player)
		this.playerCount++
	}

	public removePlayer(player: string) {
		this.players = this.players.filter((el) => player !== el)
		this.playerCount--
	}
}
