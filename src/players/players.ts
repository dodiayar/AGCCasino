export class Players {
	public static playerList: Array<string> = []

	public static isOnline(player: string): boolean {
		return this.playerList.filter((val) => val === player).length > 0
	}

	public static addPlayer(player: string) {
		this.playerList.push(player)
	}

	public static removePlayer(player: string) {
		this.playerList = this.playerList.filter((val) => val !== player)
	}
}
