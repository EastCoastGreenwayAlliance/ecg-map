## Cleanup To Be Done

Some to-do items as part of the cleanup process.

- [ ] Address non-unique lines. See `NOTE-nonunique_pline_id.md`
    * See `ecglines_clean_unique` table.

- [ ] Address non-unique cue points. See `NOTE-nonunique_cuepoints.md`
    * See `ecgpoints_clean_unique` table.

- [ ] Remove the `case_1` field, which indicates opportunities for cleanup or adjustment. (not sure the origin of this field)

- [ ] Lines: Remove the `layer_id` field as it is not used here.

- [ ] Points: Remove the `one_way` field as it is not used.

- [ ] Lines: Remove `north_weight` and `south_weight` fields as they are not used here.

- [ ] Lines: Rename `pline_id` to simply `id`

- [ ] Points: Remove `point_type` as it has only one vlaue.
    * Maybe this would make sense if non-directions cue points existed?
