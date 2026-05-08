-- =====================================================
-- Migration: latitude/longitude/inauguration_year nos stadiums
-- =====================================================
-- Adiciona inauguration_year (já temos lat/lng como decimais NULL no schema)
-- e popula os 17 estádios com dados oficiais.
-- Idempotente — re-aplicacao não causa erro.
-- =====================================================

SET NOCOUNT ON;

-- 1) Coluna inauguration_year (se ainda não existe)
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
   WHERE object_id = OBJECT_ID('dbo.stadiums') AND name = 'inauguration_year'
)
BEGIN
  ALTER TABLE dbo.stadiums ADD inauguration_year INT NULL;
END
GO

-- 2) Backfill por nome (case-sensitive seguro porque stadiums.name é UNIQUE
--    quando consideramos os nomes oficiais; legacy tem '(legacy)' no nome).
DECLARE @data TABLE (
  name NVARCHAR(255),
  lat  DECIMAL(9, 6),
  lng  DECIMAL(9, 6),
  yr   INT
);

INSERT INTO @data (name, lat, lng, yr) VALUES
  (N'MetLife Stadium',         40.812778, -74.074167, 2010),
  (N'AT&T Stadium',             32.747500, -97.094444, 2009),
  (N'SoFi Stadium',             33.953333,-118.339167, 2020),
  (N'Mercedes-Benz Stadium',    33.755556, -84.400833, 2017),
  (N'Gillette Stadium',         42.090833, -71.264444, 2002),
  (N'Hard Rock Stadium',        25.957917, -80.238889, 1987),
  (N'Lincoln Financial Field',  39.901111, -75.167500, 2003),
  (N'Lumen Field',              47.595278,-122.331389, 2002),
  (N'NRG Stadium',              29.684722, -95.410833, 2002),
  (N'Arrowhead Stadium',        39.048889, -94.484167, 1972),
  (N'Levi''s Stadium',          37.403056,-121.969167, 2014),
  (N'BMO Field',                43.633333, -79.418611, 2007),
  (N'BC Place',                 49.276667,-123.111944, 1983),
  (N'Estadio Azteca',           19.302778, -99.150556, 1966),
  (N'Estadio BBVA',             25.668889,-100.244722, 2015),
  (N'Estadio Akron',            20.681667,-103.462778, 2010),
  (N'Rose Bowl (legacy)',       34.161111,-118.167778, 1922);

UPDATE s
   SET s.latitude         = d.lat,
       s.longitude        = d.lng,
       s.inauguration_year = d.yr
  FROM dbo.stadiums s
  JOIN @data d ON d.name = s.name;

-- 3) Validacao
SELECT
  COUNT(*)                                                         AS total,
  SUM(CASE WHEN latitude IS NOT NULL THEN 1 ELSE 0 END)            AS com_lat,
  SUM(CASE WHEN longitude IS NOT NULL THEN 1 ELSE 0 END)           AS com_lng,
  SUM(CASE WHEN inauguration_year IS NOT NULL THEN 1 ELSE 0 END)   AS com_ano
FROM dbo.stadiums;

PRINT 'Esperado: total=17, com_lat=17, com_lng=17, com_ano=17';
