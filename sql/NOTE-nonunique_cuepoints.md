## Non-unique point ends: pline_id + pline_id2

The `pline_id` and `pline_id2` points indicate the lines which are relevant to this cue point. Only one cue point should exist per combination of pline_id+pline_id2, this indicating *the* cue where these two lines meet.

### Detect Duplicates

```
SELECT
pline_id || ' ' || pline_id2 AS points,
COUNT(*) AS howmany
FROM ecgpoints_clean
GROUP BY points
ORDER BY howmany DESC
```

Four results found

```
count, pline_id, pline_id2
2 776693 776694
2 681760 681742
2 774592 774593
2 774568 771459
```

### Confirm duplication

```
SELECT
	ST_ASTEXT(the_geom),
	case_1, direction1, direction2,
	n_turn_type, north_cue, south_cue
FROM ecgpoints_clean
WHERE
(pline_id=776693 AND pline_id2=776694)
OR
(pline_id=681760  AND pline_id2=681742)
OR
(pline_id=774592  AND pline_id2=774593)
OR
(pline_id=774568  AND pline_id2=771459)
ORDER BY pline_id, pline_id2
```

The differences are very slight: a "bear left" instead of "turn left", and geometry variations of under 1 meter.

These are likely duplicates due to computer error and/or re-digitizing the same point a second time.
