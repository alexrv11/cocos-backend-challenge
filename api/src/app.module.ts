import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { User } from './users/user.entity.js';
import { Instrument } from './instruments/instrument.entity.js';
import { Order } from './orders/order.entity.js';
import { MarketData } from './marketdata/marketdata.entity.js';
import { InstrumentsModule } from './instruments/instruments.module.js';
import { OrdersModule } from './orders/orders.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InstrumentsModule,
    OrdersModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        entities: [User, Instrument, Order, MarketData],
        synchronize: false,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
