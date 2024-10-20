
-- story structures

CREATE TABLE IF NOT EXISTS story (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label text NOT NULL,
    controlling_idea text,
    genres text,
    description text,
    authors text,
    notes text,
    archived INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS act (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label text NOT NULL,
    description text,
    story_id INTEGER NOT NULL,
    relative_order INTEGER NOT NULL,
    notes text
);

CREATE TABLE IF NOT EXISTS chapter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label text NOT NULL,
    description text,
    act_id INTEGER NOT NULL,
    relative_order INTEGER NOT NULL,
    notes text
);

CREATE TABLE IF NOT EXISTS scene (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label text NOT NULL,
    description text,
    chapter_id INTEGER NOT NULL,
    relative_order INTEGER NOT NULL,
    notes text
);

CREATE TABLE IF NOT EXISTS beat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label text NOT NULL,
    description text,
    scene_id INTEGER NOT NULL,
    relative_order INTEGER NOT NULL,
    notes text
);


-- NO SEQUENCES. Instead "sequences" will be automatically defined by series of scenes where a value is changed.


-- Value-related objects

/* 
    The Value holds a list of ValueChanges.
    It will also hold a list of objects of character_id and their relationship to the value (+/- [ 1, -1 ] and magnitude)
*/
CREATE TABLE IF NOT EXISTS value (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER NOT NULL,
    label text NOT NULL,
    description text,
    notes text
);

/* The value-connection to the temporal hierarchy: connects beat and value 
    We don't need to store magnitude in the value object because we can always calculate it from the value_changes,
    to retrieve status at any beat.
*/
CREATE TABLE IF NOT EXISTS value_change (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER NOT NULL,
    label text NOT NULL,
    description text,
    beat_id INTEGER, -- One beat and one value per value_change
    value_id INTEGER,
    magnitude INTEGER NOT NULL,
    notes text
);

CREATE TABLE IF NOT EXISTS character (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER NOT NULL,
    first_name text NOT NULL,
    last_name text,
    description text,
    notes text
);

CREATE TABLE IF NOT EXISTS location (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER NOT NULL,
    name text NOT NULL,
    description text,
    notes text
);


CREATE TABLE IF NOT EXISTS character_value (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aligned INTEGER DEFAULT 1,
    character_id INTEGER NOT NULL,
    value_id INTEGER NOT NULL,
    FOREIGN KEY(character_id) REFERENCES character(id),
    FOREIGN KEY(value_id) REFERENCES value(id)
);
