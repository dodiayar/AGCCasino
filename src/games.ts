export const games = ['blackjack', 'rps', 'baccarat'] as const

export type IGames = typeof games[number]
