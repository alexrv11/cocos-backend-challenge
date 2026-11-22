CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR NOT NULL,
  accountnumber VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS instruments (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS marketdata (
  id SERIAL PRIMARY KEY,
  instrumentid INTEGER NOT NULL REFERENCES instruments(id),
  high NUMERIC,
  low NUMERIC,
  open NUMERIC,
  close NUMERIC NOT NULL,
  previousclose NUMERIC,
  date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  instrumentid INTEGER NOT NULL REFERENCES instruments(id),
  userid INTEGER NOT NULL REFERENCES users(id),
  size INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  type VARCHAR NOT NULL,
  side VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  idempotency_key VARCHAR UNIQUE,
  datetime TIMESTAMP NOT NULL
);

-- Seed users
INSERT INTO users (email, accountnumber) VALUES
  ('user1@cocos.com', 'ACC-001'),
  ('user2@cocos.com', 'ACC-002');

-- Seed instruments
INSERT INTO instruments (ticker, name, type) VALUES
  ('PAMP', 'Pampa Energía S.A.', 'ACCIONES'),
  ('YPFD', 'YPF S.A.', 'ACCIONES'),
  ('GGAL', 'Grupo Financiero Galicia', 'ACCIONES'),
  ('ALUA', 'Aluar Aluminio Argentino', 'ACCIONES'),
  ('CEPU', 'Central Puerto S.A.', 'ACCIONES'),
  ('HARG', 'Holcim Argentina S.A.', 'CEDEARS'),
  ('GOLD', 'Barrick Gold Corp.', 'CEDEARS'),
  ('MELI', 'MercadoLibre Inc.', 'CEDEARS'),
  ('ARS', 'MONEDA', 'MONEDA');

-- Seed marketdata (2 days)
INSERT INTO marketdata (instrumentid, high, low, open, close, previousclose, date) VALUES
  (1, 1050, 920, 950, 1000, 950, '2023-07-13'),
  (1, 1100, 980, 1000, 1050, 1000, '2023-07-14'),
  (2, 5500, 5100, 5200, 5400, 5200, '2023-07-13'),
  (2, 5600, 5300, 5400, 5500, 5400, '2023-07-14'),
  (3, 320, 290, 300, 310, 300, '2023-07-13'),
  (3, 330, 300, 310, 320, 310, '2023-07-14'),
  (4, 70, 62, 65, 68, 65, '2023-07-13'),
  (4, 72, 66, 68, 70, 68, '2023-07-14'),
  (5, 180, 160, 165, 175, 165, '2023-07-13'),
  (5, 185, 170, 175, 180, 175, '2023-07-14'),
  (6, 2200, 2050, 2100, 2150, 2100, '2023-07-13'),
  (6, 2300, 2100, 2150, 2250, 2150, '2023-07-14'),
  (7, 4800, 4500, 4600, 4700, 4600, '2023-07-13'),
  (7, 4900, 4600, 4700, 4800, 4700, '2023-07-14'),
  (8, 15500, 14800, 15000, 15200, 15000, '2023-07-13'),
  (8, 15800, 15100, 15200, 15500, 15200, '2023-07-14');

-- Seed initial CASH_IN orders for users
INSERT INTO orders (instrumentid, userid, size, price, type, side, status, datetime) VALUES
  (9, 1, 1000000, 1, 'MARKET', 'CASH_IN', 'FILLED', '2023-07-10 10:00:00'),
  (9, 2, 500000, 1, 'MARKET', 'CASH_IN', 'FILLED', '2023-07-10 10:00:00');
