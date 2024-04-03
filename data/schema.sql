
CREATE TABLE IF NOT EXISTS author (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   first_name text NOT NULL,
   last_name text NOT NULL
);

-- story structures

CREATE TABLE IF NOT EXISTS story (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   label text NOT NULL,
   controlling_idea text,
   genres text,
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
