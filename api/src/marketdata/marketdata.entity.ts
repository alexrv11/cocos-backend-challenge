import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Instrument } from '../instruments/instrument.entity.js';

@Entity('marketdata')
export class MarketData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'instrumentid' })
  instrumentId: number;

  @Column({ type: 'numeric', nullable: true })
  high: number;

  @Column({ type: 'numeric', nullable: true })
  low: number;

  @Column({ type: 'numeric', nullable: true })
  open: number;

  @Column({ type: 'numeric' })
  close: number;

  @Column({ name: 'previousclose', type: 'numeric', nullable: true })
  previousClose: number;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => Instrument)
  @JoinColumn({ name: 'instrumentid' })
  instrument: Instrument;
}
