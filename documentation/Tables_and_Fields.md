## DB Tables and Fields

### Overview

* `ecglines_clean_unique` -- Line segments forming the trail.
* `ecgpoints_clean_unique` -- Cue points such as landmarks and turning directions.

The cue points are joined to line segments via the `pline_id` and `pline_id2` fields. The `pline_id` connects a cue point to the *northern* end of a line segment, and `pline_id2` describes the *southern* end of a segment.

The routing system makes strong use of whether the route is heading north or south. The cues read differently, and only the north-bound or south-bound subset of line segments are to be considered.

### Line Segment Fields

* `pline_id` -- The line's unique ID. Used to join to the cue points.
* `line_type` -- Domain-text description of the type of path: road, trail, etc.
* `title` -- A name for this line segment.
* `direction` -- Whether this path is to be considered for northbound routes (N), southbound routes (S), or both (B).
* `north_weight` -- A 1 indicating that this path is traversable when making a north-bound route, or 0 indicating that it is not.
    * **Not used** The `direction` field has incorporated this functionality, per "data_prep.sql"
    * Tagged for deletion, see cleanup doc under sql/
* `south_weight` -- A 1 indicating that this path is traversable when making a south-bound route, or 0 indicating that it is not.
    * **Not used** The `direction` field has incorporated this functionality, per "data_prep.sql"
    * Tagged for deletion, see cleanup doc under sql/
* `layer_id` -- **Not used** Legacy field from an old hosting service which had multiple projects.
    * Tagged for deletion, see cleanup doc under sql/


### Cue Point Fields

* `id` -- The cue point's unique ID.
* `case_1` -- A field tagging some points for extra attention and checkup, for quality control.
    * Not sure the nature of this followup.
    * Tagged for deletion, see cleanup doc under sql/
* `pline_id` -- The ID# of the line to which this should be joined. This cue point will represent the northern end of the line.
* `pline_id2` -- The ID# of the line to which this should be joined. This cue point will represent the southern end of the line.
* `direction1` -- *When joined to a line as `pline_id`* whether this cue point is to be included in northbound routes (N), southbound routes (S), or both (B).
* `direction2` -- *When joined to a line as `pline_id2`* whether this cue point is to be included in northbound routes (N), southbound routes (S), or both (B).
* `n_turn_type` -- When making a north-bound route, this briefly describes the turn to be made, e.g. "Turn right"
    * Normalized domain text, used for categorizing the type/degree of a cue point e.g. potential iconography.
* `s_turn_type` -- When making a south-bound route, this briefly describes the turn to be made, e.g. "Turn right"
    * Normalized domain text, used for categorizing the type/degree of a cue point e.g. potential iconography.
* `north_cue` -- When making a north-bound route, this verbosely describes the turn to be made, e.g. "Turn right onto 123rd Street"
* `south_cue` -- When making a south-bound route, this verbosely describes the turn to be made, e.g. "Turn right onto 123rd Street"
* `one_way` -- Whether this is a one-way path or street.
    * **Not used** The `direction` field has incorporated this functionality, per "data_prep.sql"
    * Tagged for deletion, see cleanup doc under sql/    
* `point_type` -- Domain-text description, of the type of cue point.
    * Only one value exists: "ECG turn direction"
    * Tagged for deletion, see cleanup doc under sql/
