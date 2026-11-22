-- Production seed — reference data only (no fake users or orders)

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
