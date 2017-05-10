--------------------------------------------------------------------------------
-- SQL queries used to prepare data for the ECG mapping application
-- Assumes PostgreSQL / PostGIS hosted by CARTO
--------------------------------------------------------------------------------

-- Data files: unzipped original KMZ files, uploaded to CARTO
--  ecglines_raw
--  ecgpoints_raw
--  route_options (note: lines 44-46 in the original CSV contain unescaped quotes
--      in the name field. modify field to remove quotes before upload)

-- Modify the data imported as strings to numbers in route-options
-- I just changed fields in the UI: is_north, north_weight, and south_weight

-- north_weight and south_weight look like the cleanest definition of route direction
-- so I'm ignoring is_north

-- First, join route_options to ecgline_raw
SELECT a.cartodb_id, a.the_geom, a.the_geom_webmercator, a.name as line_type, 
    a.id as pline_id, a.layer_id, b.name as title, b.north_weight, b.south_weight, 
    (b.north_weight - b.south_weight) as direction
FROM ecglines_raw a
JOIN route_options b ON a.id = b.pline_id

-- In the interface, create a new table ecglines_clean from query

SELECT count(*), direction FROM ecglines_clean GROUP BY direction
-- Returns 2859 shared, 569 south, 585 north

-- Join route_options to ecgpoints_raw twice, once for each pline_id
SELECT *,
	CASE 
        WHEN direction1 = -1 AND direction2 = -1 AND south_cue = '' THEN 'Likely'
	    WHEN (direction1 = -1 OR direction2 = -1) AND south_cue = '' THEN 'Possibly'
        ELSE 'Fine'
    END
FROM (
  SELECT a.cartodb_id, a.the_geom, a.the_geom_webmercator, a.name as point_type, 
      a.id, a.pline_id, a.pline_id2, a.north_cue, a.south_cue, a.one_way,
      (b.north_weight - b.south_weight) as direction1,
      (c.north_weight - c.south_weight) as direction2
  FROM ecgpoints_raw a
  JOIN route_options b ON a.pline_id = b.pline_id
  JOIN route_options c ON a.pline_id2 = c.pline_id
  ) points_join

-- In the interface, create a new table ecgpoints_clean from query

SELECT count(*), case_1 FROM ecgpoints_clean GROUP BY case_1
-- Returns 3396 fine, 577 possibly, 269 likely south_cue errors
-- There are 2497 points with both north and south cues
-- There are 1731 points with only north_cues, and 11 with only south_cues
-- If we switch 846 north_cues to south_cues,
-- there would be 885 points with north_cues, and 857 with south_cues
-- which is way more balanced, and so...

UPDATE ecgpoints_clean
SET south_cue = north_cue,
    north_cue = ''
WHERE case_1 = 'Likely' OR case_1 = 'Possibly'
-- south_cues and north_cues should be all set now

-- On to the turn types
-- Create two new columns in the interface called n_turn_type and s_turn_type
-- Update these with the normal turn cues
-- This gets a lot of cases, but it's easy to extend as needed
UPDATE ecgpoints_clean
SET n_turn_type =
    ( 
        CASE
            WHEN lower(north_cue) LIKE '%turn left%'
                 OR lower(north_cue) LIKE '%hairpin left%'
               THEN 'Turn left'
            WHEN lower(north_cue) LIKE '%turn right%'
                 OR lower(north_cue) LIKE '%hairpin right%'
               THEN 'Turn right'
            WHEN lower(north_cue) LIKE '%bear left%'
                OR lower(north_cue) LIKE '%stay left%'
                THEN 'Bear left'
            WHEN lower(north_cue) LIKE '%bear right%'
                OR lower(north_cue) LIKE '%stay right%'
                THEN 'Bear right'
            WHEN lower(north_cue) LIKE '%straight%'
                THEN 'Continue straight'
            ELSE ''
        END
    ),
    s_turn_type =
    ( 
        CASE
            WHEN lower(south_cue) LIKE '%turn left%'
                 OR lower(south_cue) LIKE '%hairpin left%'
               THEN 'Turn left'
            WHEN lower(south_cue) LIKE '%turn right%'
                 OR lower(south_cue) LIKE '%hairpin right%'
               THEN 'Turn right'
            WHEN lower(south_cue) LIKE '%bear left%'
                OR lower(south_cue) LIKE '%stay left%'
                THEN 'Bear left'
            WHEN lower(south_cue) LIKE '%bear right%'
                OR lower(south_cue) LIKE '%stay right%'
                THEN 'Bear right'
            WHEN lower(south_cue) LIKE '%straight%'
                THEN 'Continue straight'
            ELSE ''
        END
    )

-- Finally, a bit of cleanup
-- Converting the 1, 0, -1 values for direction into N, B, and S
-- (for north, bidirectional, and south)

-- first change direction field to a string
UPDATE ecglines_clean
SET direction =
    (
        CASE
            WHEN direction = '1' THEN 'N'
            WHEN direction = '0' THEN 'B'
            WHEN direction = '-1' THEN 'S'
      	END
    )

-- first change direction fields to a string
UPDATE ecgpoints_clean
SET direction1 =
    (
        CASE
            WHEN direction1 = '1' THEN 'N'
            WHEN direction1 = '0' THEN 'B'
            WHEN direction1 = '-1' THEN 'S'
      	END
    ),
    direction2 =
    (
        CASE
            WHEN direction2 = '1' THEN 'N'
            WHEN direction2 = '0' THEN 'B'
            WHEN direction2 = '-1' THEN 'S'
      	END
    )

-- results may be viewed at
-- https://jbranigan.carto.com/builder/0739a750-359f-11e7-b40d-0ee66e2c9693/embed