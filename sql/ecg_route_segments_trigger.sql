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
DROP SEQUENCE IF EXISTS ecg_route_segment_id_seq CASCADE;
CREATE SEQUENCE ecg_route_segment_id_seq
  START WITH 1124700
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER TABLE ecg_route_lines ALTER COLUMN pline_id SET DEFAULT NEXTVAL('ecg_route_segment_id_seq');
CREATE UNIQUE INDEX ON ecg_route_lines(pline_id);

-- delete the trigger if it already exists as we're replacing it
DROP TRIGGER IF EXISTS ecg_route_segment ON ecg_route_lines;

CREATE OR REPLACE FUNCTION ecg_route_segment()
  RETURNS TRIGGER AS
$ecg_route_segment$
BEGIN
  NEW.datetime_modified := current_timestamp;
  NEW.meters := round(ST_Length(NEW.the_geom::geography));
  NEW.miles := round (CAST(NEW.meters AS NUMERIC)* 0.00062137,1);
  NEW.feet := round (CAST(NEW.meters AS NUMERIC) / 0.3048);
  RETURN NEW;
END;
$ecg_route_segment$
LANGUAGE plpgsql;

-- add the trigger to the db
CREATE TRIGGER ecg_route_segment
BEFORE INSERT OR UPDATE
ON ecg_route_lines
FOR EACH ROW
EXECUTE PROCEDURE ecg_route_segment();