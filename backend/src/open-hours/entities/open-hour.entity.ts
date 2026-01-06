import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('open_hours')
export class OpenHour {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  @Column({ type: 'boolean', default: true })
  isOpen: boolean;

  @Column({ type: 'time', nullable: true })
  openTime: string; // Format: HH:MM

  @Column({ type: 'time', nullable: true })
  closeTime: string; // Format: HH:MM

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
