import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('instruments')
export class Instrument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  ticker: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  type: string;
}
