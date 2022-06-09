import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Balance extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	username: string

	@Column({ type: 'float' })
	balance: number
}
