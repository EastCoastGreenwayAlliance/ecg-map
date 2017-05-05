--------------------------------------------------------------------------------
-- This is the PostgreSQL database trigger for the East Coast Greenway route
-- Assumes PostgreSQL / PostGIS hosted by CARTO
--------------------------------------------------------------------------------
-- When a new route segment is created, we need to:
  -- create an id for it. This should increment the max value of "id" by one.
  -- calculate the length of the new segment and update the "length_met" column
  -- populate the "created" column with the current date & time
-- overwrite "id" if user accidentally filled it in
-- trigger should handle both adding of a new line segment and splitting of
-- current line segment into two segments
--------------------------------------------------------------------------------

-- The following is NOT part of the trigger, but solves auto-updating the "id" field
-- tell Postgres we want "id" to auto-increment using a sequence
-- the 1008367 is the max value of the id field + 1
DROP SEQUENCE IF EXISTS route_segment_id_seq CASCADE;
CREATE SEQUENCE route_segment_id_seq
  START WITH 1008367
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER TABLE ecg_route_qgis_test ALTER COLUMN id SET DEFAULT NEXTVAL('route_segment_id_seq');
CREATE UNIQUE INDEX ON ecg_route_qgis_test(id);

-- delete the trigger if it already exists as we're replacing it
DROP TRIGGER IF EXISTS ecg_new_route_segment ON ecg_route_qgis_test;

-- create / replace the trigger's function
CREATE OR REPLACE FUNCTION update_new_route_segment()
  RETURNS TRIGGER AS
$BODY$
BEGIN
  NEW.created = CURRENT_DATE;
  NEW.length_met = ST_Length(NEW.the_geom::geography);
  RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

-- add the trigger to the db
CREATE TRIGGER ecg_new_route_segment
BEFORE INSERT
ON ecg_route_qgis_test
FOR EACH ROW
EXECUTE PROCEDURE update_new_route_segment();
