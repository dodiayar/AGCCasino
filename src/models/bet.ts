import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Bet extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date

	@Column()
	username: string

	@Column({ type: 'float' })
	bet: number

	@Column()
	game: string

	@Column()
	status: string

	@Column({ type: 'float' })
	result: number
}
