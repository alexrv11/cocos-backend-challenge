import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Instrument } from '../instruments/instrument.entity.js';
import { User } from '../users/user.entity.js';
import { OrderSide } from '../common/enums/order-side.enum.js';
import { OrderType } from '../common/enums/order-type.enum.js';
import { OrderStatus } from '../common/enums/order-status.enum.js';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'instrumentid' })
  instrumentId: number;

  @Column({ name: 'userid' })
  userId: number;

  @Column({ type: 'integer' })
  size: number;

  @Column({ type: 'numeric' })
  price: number;

  @Column({ type: 'varchar' })
  type: OrderType;

  @Column({ type: 'varchar' })
  side: OrderSide;

  @Column({ type: 'varchar' })
  status: OrderStatus;

  @Column({ type: 'timestamp' })
  datetime: Date;

  @ManyToOne(() => Instrument)
  @JoinColumn({ name: 'instrumentid' })
  instrument: Instrument;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userid' })
  user: User;
}
