import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('blocked_dates')
export class BlockedDate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', unique: true })
  date: string;

  @Column()
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
