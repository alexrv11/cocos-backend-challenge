-- Dev/Local seed data — DO NOT run in production

-- Seed users (password: password123)
INSERT INTO users (email, password, accountnumber) VALUES
  ('user1@cocos.com', '$2b$10$UcD1Km7sBU65o8r3yCJcLu6vUhJSKPAUqUNYpwiBH4a.IxV2zxBre', 'ACC-001'),
  ('user2@cocos.com', '$2b$10$UcD1Km7sBU65o8r3yCJcLu6vUhJSKPAUqUNYpwiBH4a.IxV2zxBre', 'ACC-002')
ON CONFLICT (email) DO NOTHING;

-- Instruments (reference data)
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

-- Market data (2 days of sample prices)
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

-- Initial cash balances
INSERT INTO orders (instrumentid, userid, size, price, type, side, status, datetime) VALUES
  (9, 1, 1000000, 1, 'MARKET', 'CASH_IN', 'FILLED', '2023-07-10 10:00:00'),
  (9, 2, 500000, 1, 'MARKET', 'CASH_IN', 'FILLED', '2023-07-10 10:00:00');
