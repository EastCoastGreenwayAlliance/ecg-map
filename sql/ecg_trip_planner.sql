--------------------------------------------------------------------------------
-- SQL queries used by the ECG Map Trip Planner
-- Assumes PostgreSQL / PostGIS hosted by CARTO
--------------------------------------------------------------------------------

-- Order cue points by nearest neighbor using a cartodb_id to identify a starting cue point
-- and filtering out subset of cue points by bbox
-- TO DO: bbox isn't precise enough to correctly choose an exact starting & ending cue point
-- this example is for heading north from Savannah to Charleston
SELECT *
FROM ecgpoints_clean a
WHERE the_geom && ST_MakeEnvelope(-81.287842,31.938178,-79.790955,32.953368)
AND a.north_cue != ''
ORDER BY a.the_geom <-> (
  SELECT b.the_geom
  FROM ecgpoints_clean b
  WHERE b.cartodb_id = 5464
);

--- In order to query a portion of the ECG Route, the data needs to be aggregated
-- merge the entire ecg route into a single line
SELECT ST_MakeLine(
  ST_LineMerge(the_geom)
) as the_geom
FROM east_coast_greenway_test;

-- get the fraction (Float value) position along a line given some point
SELECT
ST_Line_Locate_Point(
  ST_LineMerge(the_geom),
  ST_SetSRID(ST_Point(-78.675842,35.797766),4326)
)
FROM east_coast_greenway_test
WHERE id = 827791;

--- same but querying a portion of the route first by bbox
SELECT
ST_Line_Locate_Point(
  ST_MakeLine(ST_LineMerge(the_geom)),
  ST_SetSRID(ST_Point(-77.451553,37.720220),4326)
)
FROM east_coast_greenway_test
WHERE the_geom && ST_MakeEnvelope(-77.541504,37.531510,-77.382202,38.384728, 4326);

-- select portion of the route by bounding box
SELECT * FROM east_coast_greenway_test
WHERE the_geom && ST_MakeEnvelope(-77.541504,37.531510,-77.382202,38.384728, 4326);

-- select a portion of the ECG by bbox, then dissolve it
SELECT
ST_UNION(the_geom_webmercator) as the_geom_webmercator
FROM east_coast_greenway_test
WHERE the_geom
&& ST_MakeEnvelope(-77.541504,37.531510,-77.382202,38.384728, 4326);

-- Using ST_LineMerge returns many individual linestrings
SELECT
ST_LineMerge(the_geom_webmercator) as the_geom_webmercator
FROM east_coast_greenway_test
WHERE the_geom
&& ST_MakeEnvelope(-77.541504,37.531510,-77.382202,38.384728, 4326);

---- following returns NULL but removing ST_MakeLine returns a Multi-Linestring
WITH dissolved AS (
  SELECT ST_UNION(the_geom_webmercator) as the_geom_webmercator
  FROM east_coast_greenway_test
  WHERE the_geom
  && ST_MakeEnvelope(-77.541504,37.531510,-77.382202,38.384728, 4326)
)
SELECT ST_MakeLine(ST_LineMerge(d.the_geom_webmercator)) as the_geom_webmercator
FROM dissolved d;

--- TEST: count line strings vs. Multi-Linestrings
--- (ogr tends to encode linestrings as Multi-Linestrings when importing data to PostGIS)
SELECT COUNT(
  CASE WHEN ST_NumGeometries(the_geom) > 1 THEN 1 END
) AS multi,
COUNT(the_geom) AS total
FROM east_coast_greenway_test;

--- in the case "multi" from above query is 0, then okay to set the_geom to linestring
ALTER TABLE east_coast_greenway_test
ALTER COLUMN the_geom TYPE geometry(LineString, 4326)
USING ST_GeometryN(the_geom, 1);

--- attempting to order by start / end point
--- would need to recursively test for last ending point being close to next starting point
--- using lag or some similar fn / statement
WITH merged as (
SELECT
id,
ST_LineMerge(the_geom) as the_geom,
ST_StartPoint(the_geom) as s,
ST_EndPoint(the_geom) as e
FROM east_coast_greenway_test
WHERE the_geom
&& ST_MakeEnvelope(-77.541504,37.531510,-77.382202,38.384728, 4326)
order by s, e
)
SELECT
ST_Transform(m.the_geom, 3857) as the_geom_webmercator
FROM merged m;
