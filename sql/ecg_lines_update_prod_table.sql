-- After development version of ecg_route_lines is updated, update the production version "ecg_route_lines_prod"
-- by updating attribute information for existing records, deleting old records, and inserting new records


-- Update existing records
UPDATE ecg_route_lines_prod b
SET the_geom = a.the_geom,
ecg_review = a.ecg_review,
direction = a.direction,
title = a.title,
line_type = a.line_type,
meters = a.meters,
datetime_modified = current_timestamp
FROM ecg_route_lines a
WHERE a.pline_id = b.pline_id


-- Delete old records that no longer exist
DELETE FROM ecg_route_lines_prod a
WHERE a.pline_id NOT IN (
  SELECT distinct pline_id FROM ecg_route_lines
  )


-- Insert new rows
INSERT INTO ecg_route_lines_prod (the_geom, pline_id, ecg_review, direction, title, line_type, meters, datetime_modified)
SELECT the_geom, pline_id, ecg_review, direction, title, line_type, meters, current_timestamp
FROM ecg_route_lines a
WHERE a.pline_id NOT IN (
  SELECT distinct pline_id FROM ecg_route_lines_prod
  )