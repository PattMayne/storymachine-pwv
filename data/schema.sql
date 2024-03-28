
CREATE TABLE IF NOT EXISTS author (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   first_name text NOT NULL,
   last_name text NOT NULL
);

-- story structures

CREATE TABLE IF NOT EXISTS story (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   label text NOT NULL,
   description text,
   author_ids text NOT NULL
);

CREATE TABLE IF NOT EXISTS act (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   label text NOT NULL,
   description text,
   story_id INTEGER NOT NULL,
   relative_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS chapter (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   label text NOT NULL,
   description text,
   act_id INTEGER NOT NULL,
   relative_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS scene (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   label text NOT NULL,
   description text,
   chapter_id INTEGER NOT NULL,
   relative_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS beat (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   label text NOT NULL,
   description text,
   scene_id INTEGER NOT NULL,
   relative_order INTEGER NOT NULL
);



-- sequence overlay (sequence of scenes)

CREATE TABLE IF NOT EXISTS sequence (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   label text NOT NULL,
   description text,
   -- scene_ids_obj will be an OBJECT containing a LIST of scene_ids
   scene_ids_obj text
);

-- a visual overlay to highlight certain key moments.
CREATE TABLE IF NOT EXISTS event (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   label text NOT NULL,
   description text,
   -- an event can be a party, or whatever, and cover multiple beats and value changes
   value_change_ids text
);

-- Value-related objects

/* 
    The Value holds a list of ValueChanges.
    It will also hold a list of objects of character_id and their relationship to the value (+/- [ 1, -1 ] and magnitude)
*/
CREATE TABLE IF NOT EXISTS value (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   label text NOT NULL,
   description text,
   character_relationships text NOT NULL, -- default JSON string like {relationships: [] } <-empty list of objects... 
   value_changes text NOT NULL
);

/* The value-connection to the temporal hierarchy. */
CREATE TABLE IF NOT EXISTS value_change (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   label text NOT NULL,
   description text,
   beat_id INTEGER, -- maybe the beats should hold lists of value_changes instead? Every beat must have MEANING.
   value_ids text, -- multiple values can "change" on the same bet.
   magnitutde INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS character (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text NOT NULL,
    description text
);

-- Maybe there should be no relationship object, unless we can make it temporal
-- Like it has an optional start and stop beat or value_change
-- Would that make the relationship a value?
-- YES... this object should not exist.
/*
   CREATE TABLE IF NOT EXISTS character_relationship (
   id INTEGER PRIMARY KEY,
   label text NOT NULL,
   characters text -- list of objects like: [ { char_id: 7, role: "brother"} ]
);
*/

/*
    character_relationship objects can be like:
    { char_id: 7, relationship: -1, magnitude: 37 }

    THIS is the difficult part.

    A value must hold a map of ValueChange ids to Beat ids.
    Yes... many relationships are contained within THIS object. Very important object.

    Values can have RELATIONSHIPS to one another... they effect each other.
    Should it be a hierarchy?
        SOLUTION:
    A VALUE can be a subsidiary of ANOTHER VALUE.
        -(don't just make an opposite value, because characters can have negative relationships tot he value instead)
    But two unrelated values can effect each other, if a certain VALUE CHANGE holds them BOTH.
    So a VALUE CHANGE is not just a 1:1 map of one VALUE object to one integer of change. It can have a LIST of changes.
    And some kind of prompt to explain the relation.

    -character (who have relationships to values or value-changes or value-strings)
    -value (the base object... )
    -value_change ()
    -value_thread 


    BRAINSTORMING:

    So if the value_thread contains all those relationships, what's the point of the value object itself?
    Can one value object have multiple threads?
    No.
    The value_thread object IS the value object.
    Which means it's really the other way around. The value object is the value_thread object.
    So we have no object called "value_thread."


    UNRELATED:

    Maybe an ENUM called PHASE:
    * climax
    * resolution
    * inciting incident
    * etc.


*/

