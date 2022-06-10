import { IGames } from 'src/games'

const suitArray = ['H', 'C', 'D', 'S'] as const
const rankArray = [
	,
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'10',
	'J',
	'Q',
	'K',
	'A',
] as const

export type Card = `${typeof rankArray[number]}${typeof suitArray[number]}`

export class Deck {
	public cards: Array<Card>

	constructor() {
		this.cards = []
		suitArray.map((suitVal) => {
			rankArray.map((rankVal) => {
				this.cards.push(`${rankVal}${suitVal}`)
			})
		})
	}

	public shuffle() {
		let currentIndex = this.cards.length,
			randomIndex

		while (currentIndex != 0) {
			randomIndex = Math.floor(Math.random() * currentIndex)
			currentIndex--
			;[this.cards[currentIndex], this.cards[randomIndex]] = [
				this.cards[randomIndex],
				this.cards[currentIndex],
			]
		}

		return this.cards
	}

	public drawOne(): Card | undefined {
		return this.cards.shift()
	}

	public static value(game: IGames, card: Card | undefined): number {
		if (card == undefined) return 0
		switch (game) {
			case 'baccarat':
				switch (card[0]) {
					case 'A':
						return 1
					case '2':
						return 2
					case '3':
						return 3
					case '4':
						return 4
					case '5':
						return 5
					case '6':
						return 6
					case '7':
						return 7
					case '8':
						return 8
					case '9':
						return 9
					case '10':
					case 'J':
					case 'Q':
					case 'K':
						return 0
					default:
						return 0
				}
		}
		return 0
	}
}
