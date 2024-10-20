import sqlite3
from sqlite3 import OperationalError
from data import base_story
import json

from data import get_story


def get_names():
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM author")
    records = cursor.fetchall()

    connect.commit()
    connect.close()
    return records


# SETTERS

def setup_db():
    # Open and read the file as a single buffer
    fd = open('data/schema.sql', 'r')
    sqlFile = fd.read()
    fd.close()
    sqlCommands = sqlFile.split(';')

    # Create Database Or Connect To One
    connect = sqlite3.connect('data/stories.db')
    # Create A Cursor
    cursor = connect.cursor()

    # Execute every command from the input file (to create the database)
    for command in sqlCommands:
        # This will skip and report errors
        try:
            cursor.execute(command)
        except (OperationalError):
            print("Command skipped: ", command)

    connect.commit()
    connect.close()


# creates new author object in the db
def create_new_author(first_name, last_name):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("INSERT INTO author(first_name, last_name) VALUES (:first_name, :last_name)",
        {
            'first_name': first_name,
            'last_name': last_name,
        })

    connect.commit()
    author_id = cursor.lastrowid
    connect.close()
    return author_id


# creates vanilla story object template
# returns story_id
def create_base_story():
    story_id = base_story.create()
    story_obj = get_story_by_id(story_id)
    return story_id


# Get story dict by id
def get_story_by_id(story_id):
    #return get_story.by_id(story_id)
    # TESTING FOR NOW (orders break for unknown reason)
    return check_all_orders(get_story.by_id(story_id))


def get_story_ids_and_labels():
    return get_story.ids_and_labels()


# Get individual components

def get_act_by_id(act_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM act WHERE id=:act_id", {
        'act_id': act_id
    })
    records = cursor.fetchall()
    act = {
        'id': records[0][0],
        'label': records[0][1],
        'description': records[0][2]
    }
    connect.close()
    return act
   


def get_chapter_by_id(chapter_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM chapter WHERE id=:chapter_id", {
        'chapter_id': chapter_id
    })
    records = cursor.fetchall()
    chapter = {
        'id': records[0][0],
        'label': records[0][1],
        'description': records[0][2]
    }
    connect.close()
    return chapter


def get_scene_by_id(scene_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM scene WHERE id=:scene_id", {
        'scene_id': scene_id
    })
    records = cursor.fetchall()
    scene = {
        'id': records[0][0],
        'label': records[0][1],
        'description': records[0][2]
    }
    connect.close()
    return scene


def get_beat_by_id(beat_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM beat WHERE id=:beat_id", {
        'beat_id': beat_id
    })
    records = cursor.fetchall()
    beat = {
        'id': records[0][0],
        'label': records[0][1],
        'description': records[0][2]
    }
    connect.close()
    return beat



# Create individual components


def create_new_beat(scene_id, order=0):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT COUNT(*) from beat WHERE scene_id=:scene_id", {
        'scene_id': scene_id
    })
    beat_count = cursor.fetchone()[0]
    order = beat_count + 1 if order == 0 else order
    cursor.execute("INSERT INTO beat(label, scene_id, relative_order, description) VALUES (:label, :scene_id, :relative_order, :description)",
        {
            'label': "beat",
            'scene_id': scene_id,
            'relative_order': order,
            'description': "",
        })

    connect.commit()
    beat_id = cursor.lastrowid

    # now add the ID to the beat's label (so each beat label is probably unique)
    new_label = "beat." + str(beat_id)
    cursor.execute("UPDATE beat SET label=:label WHERE id=:id",
        {
            'label': new_label,
            'id': beat_id
        })
    connect.commit()

    connect.close()
    return beat_id


def create_new_scene(chapter_id, order=0):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT COUNT(*) from scene WHERE chapter_id=:chapter_id", {
        'chapter_id': chapter_id
    })
    scene_count = cursor.fetchone()[0]
    order = scene_count + 1 if order == 0 else order
    cursor.execute("INSERT INTO scene(label, chapter_id, relative_order, description) VALUES (:label, :chapter_id, :relative_order, :description)",
        {
            'label': "scene",
            'chapter_id': chapter_id,
            'relative_order': order,
            'description': "",
        })

    connect.commit()
    scene_id = cursor.lastrowid

    # now add the ID to the scene's label (so each label is probably unique)
    new_label = "scene." + str(scene_id)
    cursor.execute("UPDATE scene SET label=:label WHERE id=:id",
        {
            'label': new_label,
            'id': scene_id
        })
    connect.commit()

    connect.close()
    return scene_id


def create_new_chapter(act_id, order=0):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT COUNT(*) from chapter WHERE act_id=:act_id", {
        'act_id': act_id
    })
    chapter_count = cursor.fetchone()[0]
    order = chapter_count + 1 if order == 0 else order
    cursor.execute("INSERT INTO chapter(label, act_id, relative_order, description) VALUES (:label, :act_id, :relative_order, :description)",
        {
            'label': "chapter",
            'act_id': act_id,
            'relative_order': order,
            'description': "",
        })

    connect.commit()
    chapter_id = cursor.lastrowid

    # now add the ID to the scene's label (so each label is probably unique)
    new_label = "chapter." + str(chapter_id)
    cursor.execute("UPDATE chapter SET label=:label WHERE id=:id",
        {
            'label': new_label,
            'id': chapter_id
        })
    connect.commit()

    connect.close()
    return chapter_id


def create_new_act(story_id, order=0):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT COUNT(*) from act WHERE story_id=:story_id", {
        'story_id': story_id
    })

    act_count = cursor.fetchone()[0]
    order = act_count + 1 if order == 0 else order
    cursor.execute("INSERT INTO act(label, story_id, relative_order, description) VALUES (:label, :story_id, :relative_order, :description)",
        {
            'label': "act",
            'story_id': story_id,
            'relative_order': order,
            'description': "",
        })

    connect.commit()
    act_id = cursor.lastrowid

    # now add the ID to the scene's label (so each label is probably unique)
    new_label = "act." + str(act_id)
    cursor.execute("UPDATE act SET label=:label WHERE id=:id",
        {
            'label': new_label,
            'id': act_id
        })
    connect.commit()

    connect.close()
    return act_id


def create_new_beat_at_order(scene_id, new_order):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # get all scenes for chapter:
    cursor.execute("SELECT id, relative_order FROM beat WHERE scene_id=:scene_id ORDER BY relative_order DESC", {
        'scene_id': scene_id
    })
    records = cursor.fetchall()

    # shift all scenes orders until AFTER we reach new_order
    for beat_record in records:
        beat_id = beat_record[0]
        beat_order = beat_record[1]
        if(beat_order > 0 and beat_order >= new_order):
            update_beat_order(beat_id, beat_order + 1)
            connect.commit()
    connect.close()
    # create new scene with the specified order
    new_beat_id = create_new_beat(scene_id, new_order)
    return new_beat_id


def create_new_scene_at_order(chapter_id, new_order):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # get all scenes for chapter:
    cursor.execute("SELECT id, relative_order FROM scene WHERE chapter_id=:chapter_id ORDER BY relative_order DESC", {
        'chapter_id': chapter_id
    })
    records = cursor.fetchall()

    # shift all scenes orders until AFTER we reach new_order
    for scene_record in records:
        scene_id = scene_record[0]
        scene_order = scene_record[1]
        if(scene_order > 0 and scene_order >= new_order):
            update_scene_order(scene_id, scene_order + 1)
            connect.commit()
    connect.close()
    # create new scene with the specified order
    new_scene_id = create_new_scene(chapter_id, new_order)
    return new_scene_id


def create_new_chapter_at_order(act_id, new_order):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # get all acts for story:
    print("trying to make new order")
    cursor.execute("SELECT id, relative_order FROM chapter WHERE act_id=:act_id ORDER BY relative_order DESC", {
        'act_id': act_id
    })
    records = cursor.fetchall()

    # shift all chapter orders until AFTER we reach new_order
    for chapter_record in records:
        chapter_id = chapter_record[0]
        chapter_order = chapter_record[1]
        # print("chapter: " + str(chapter_id) + " order: " + str(chapter_order))
        if(chapter_order > 0 and chapter_order >= new_order):
            # print("gonna make " + str(chapter_order) + " become " + str(chapter_order + 1))
            update_chapter_order(chapter_id, chapter_order + 1)
            connect.commit()
    connect.close()
    # create new chapter with the specified order
    new_chapter_id = create_new_chapter(act_id, new_order)
    #print("made a new chapter at order: " + str(new_order))
    return new_chapter_id


def create_new_act_at_order(story_id, new_order):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # get all acts for story:
    print("trying to make new order")
    cursor.execute("SELECT id, relative_order FROM act WHERE story_id=:story_id ORDER BY relative_order DESC", {
        'story_id': story_id
    })
    records = cursor.fetchall()

    # shift all act orders until AFTER we reach new_order
    for act_record in records:
        act_id = act_record[0]
        act_order = act_record[1]
        # print("act: " + str(act_id) + " order: " + str(act_order))
        if(act_order > 0 and act_order >= new_order):
            # print("gonna make " + str(act_order) + " become " + str(act_order + 1))
            update_act_order(act_id, act_order + 1)
            connect.commit()
    # close so we can use a function that also uses DB
    connect.close()
    # create new act with the specified order
    new_act_id = create_new_act(story_id, new_order)
    # print("made a new act at order: " + str(new_order))
    return new_act_id


def create_empty_story(label, description):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("INSERT INTO story(label, description, author_ids) VALUES (:label, :description, :author_ids)",
        {
            'label': label,
            'description': description,
            'author_ids': '[]'
        })

    connect.commit()
    story_id =  cursor.lastrowid	
    connect.close()
    return story_id



# UPDATE COMPONENTS

def update_story(story_id, label, description):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE story SET label=:label, description=:description WHERE id=:id",
        {
            'label': label,
            'description': description,
            'id': story_id
        })

    connect.commit()
    connect.close()
    return True


def update_act(act_id, label, description):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE act SET label=:label, description=:description WHERE id=:id",
        {
            'label': label,
            'description': description,
            'id': act_id
        })

    connect.commit()
    connect.close()
    return True


def update_chapter(chapter_id, label, description):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE chapter SET label=:label, description=:description WHERE id=:id",
        {
            'label': label,
            'description': description,
            'id': chapter_id
        })

    connect.commit()
    connect.close()
    return True


def update_scene(scene_id, label, description):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE scene SET label=:label, description=:description WHERE id=:id",
        {
            'label': label,
            'description': description,
            'id': scene_id
        })

    connect.commit()
    connect.close()
    return True


def update_beat(beat_id, label, description):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE beat SET label=:label, description=:description WHERE id=:id",
        {
            'label': label,
            'description': description,
            'id': beat_id
        })

    connect.commit()
    connect.close()
    return True


# just update order


def update_story(story_id, label, description):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE story SET label=:label, description=:description WHERE id=:id",
        {
            'label': label,
            'description': description,
            'id': story_id
        })

    connect.commit()
    connect.close()
    return True


def update_act_order(act_id, new_order):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE act SET relative_order=:relative_order WHERE id=:id",
        {
            'relative_order': new_order,
            'id': act_id
        })

    connect.commit()
    connect.close()
    print("updated act to order: " + str(new_order))
    return True


def update_chapter_order(chapter_id, new_order):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE chapter SET relative_order=:relative_order WHERE id=:id",
        {
            'relative_order': new_order,
            'id': chapter_id
        })

    connect.commit()
    connect.close()
    return True


def update_scene_order(scene_id, new_order):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE scene SET relative_order=:relative_order WHERE id=:id",
        {
            'relative_order': new_order,
            'id': scene_id
        })

    connect.commit()
    connect.close()
    return True


def update_beat_order(beat_id, new_order):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE beat SET relative_order=:relative_order WHERE id=:id",
        {
            'relative_order': new_order,
            'id': beat_id
        })

    connect.commit()
    connect.close()
    return True


# delete stuff

def delete_beat(beat_id, reorder = True):
    # this will have to also delete any VALUE CHANGE objects
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # get the beat to get the scene ID to get ALL the beats for the scene
    cursor.execute("SELECT scene_id FROM beat WHERE id=:beat_id", {
        'beat_id': beat_id
    })
    records = cursor.fetchall()
    scene_id = records[0][0]

    cursor.execute("DELETE FROM beat WHERE id = :id",
        {
            'id': beat_id
        })
    # delete any value_change objects belonging to this beat.
    cursor.execute("DELETE FROM value_change WHERE beat_id = :beat_id",
        {
            'beat_id': beat_id
        })
    connect.commit()
    connect.close()

    # next reorder all beats
    if reorder:
        reorder_beats(scene_id)

    return True


def delete_scene(scene_id, reorder = True):
    # this will have to also delete any BEAT objects
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # get id of parent (so we can get their siblings)
    cursor.execute("SELECT chapter_id FROM scene WHERE id=:scene_id", {
        'scene_id': scene_id
    })
    records = cursor.fetchall()
    chapter_id = records[0][0]

    cursor.execute("DELETE FROM scene WHERE id = :id",
        {
            'id': scene_id
        })
    # delete any beats belonging to this scene (get the beats, loop through, call the delete function)
    cursor.execute("SELECT id FROM beat WHERE scene_id = :scene_id",
        {
            'scene_id': scene_id
        })
    records = cursor.fetchall()

    connect.commit()
    connect.close()

    for record in records:
        delete_beat(record[0], False)

    # next reorder all beats
    if reorder:
        reorder_scenes(chapter_id)

    return True


def delete_chapter(chapter_id, reorder = True):
    # this will have to also delete any BEAT objects
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # get id of parent (so we can get their siblings)
    cursor.execute("SELECT act_id FROM chapter WHERE id=:chapter_id", {
        'chapter_id': chapter_id
    })
    records = cursor.fetchall()
    act_id = records[0][0]

    cursor.execute("DELETE FROM chapter WHERE id = :id",
        {
            'id': chapter_id
        })
    
    # delete any scenes belonging to this chapter (get the scenes, loop through, call the delete function)
    cursor.execute("SELECT id FROM scene WHERE chapter_id = :chapter_id",
        {
            'chapter_id': chapter_id
        })
    records = cursor.fetchall()

    connect.commit()
    connect.close()

    for record in records:
        delete_scene(record[0], False)

    # next reorder all chapters
    if reorder:
        reorder_chapters(act_id)

    return True


def delete_act(act_id, reorder = True):
    # this will have to also delete any BEAT objects
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # get id of parent (so we can get their siblings)
    cursor.execute("SELECT story_id FROM act WHERE id=:act_id", {
        'act_id': act_id
    })
    records = cursor.fetchall()
    story_id = records[0][0]

    cursor.execute("DELETE FROM act WHERE id = :id",
        {
            'id': act_id
        })
    
    # delete any chapters belonging to this act (get the chapters, loop through, call the delete function)
    cursor.execute("SELECT id FROM chapter WHERE act_id = :act_id",
        {
            'act_id': act_id
        })
    records = cursor.fetchall()

    connect.commit()
    connect.close()

    for record in records:
        delete_chapter(record[0], False)

    # next reorder all chapters
    if reorder:
        reorder_acts(story_id)

    return True


# reorder relative_order


def reorder_beats(scene_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

# get all the beats
    cursor.execute("SELECT id FROM beat WHERE scene_id=:scene_id ORDER BY relative_order ASC", {
        'scene_id': scene_id
    })

    records = cursor.fetchall()
    connect.close()

    for i in range(0, len(records)):
        update_beat_order(records[i][0], i + 1)


def reorder_scenes(chapter_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # get all the scenes
    cursor.execute("SELECT id FROM scene WHERE chapter_id=:chapter_id ORDER BY relative_order ASC", {
        'chapter_id': chapter_id
    })

    records = cursor.fetchall()
    connect.close()

    for i in range(0, len(records)):
        update_scene_order(records[i][0], i + 1)


def reorder_chapters(act_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # get all the scenes
    cursor.execute("SELECT id FROM chapter WHERE act_id=:act_id ORDER BY relative_order ASC", {
        'act_id': act_id
    })

    records = cursor.fetchall()
    connect.close()

    for i in range(0, len(records)):
        update_chapter_order(records[i][0], i + 1)


def reorder_acts(story_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # get all the scenes
    cursor.execute("SELECT id FROM act WHERE story_id=:story_id ORDER BY relative_order ASC", {
        'story_id': story_id
    })

    records = cursor.fetchall()
    connect.close()

    for i in range(0, len(records)):
        update_act_order(records[i][0], i + 1)



#   VALUE OBJECTS

# CREATE value objects

# creates new character object in the db
def create_character(story_id, first_name, last_name, description, notes):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("INSERT INTO character(story_id, first_name, last_name, description, notes) VALUES (:story_id, :first_name, :last_name, :description, :notes)",
        {
            'story_id': story_id,
            'first_name': first_name,
            'last_name': last_name,
            'description': description,
            'notes': notes
        })

    connect.commit()
    char_id = cursor.lastrowid
    connect.close()
    return char_id


# creates new location object in the db
def create_location(story_id, name, description, notes):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    # print("creating a location")
    cursor.execute("INSERT INTO location(story_id, name, description, notes) VALUES (:story_id, :name, :description, :notes)",
        {
            'story_id': story_id,
            'name': name,
            'description': description,
            'notes': notes
        })

    connect.commit()
    location_id = cursor.lastrowid
    connect.close()
    return location_id


# creates new value object in the db
def create_value(story_id, label, description, notes):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("INSERT INTO value(story_id, label, description, notes) VALUES (:story_id, :label, :description, :notes)",
        {
            'story_id': story_id,
            'label': label,
            'description': description,
            'notes': notes
        })

    connect.commit()
    value_id = cursor.lastrowid
    connect.close()
    return value_id


# creates a new value change object in the db
def create_value_change(story_id, beat_id, value_id, magnitude, label, description, notes):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("INSERT INTO value_change(story_id, beat_id, value_id, magnitude, label, description, notes) VALUES (:story_id, :beat_id, :value_id, :magnitude, :label, :description, :notes)",
        {
            'story_id': story_id,
            'beat_id': beat_id,
            'value_id': value_id,
            'magnitude': magnitude,
            'label': label,
            'description': description,
            'notes': notes
        })

    connect.commit()
    value_change_id = cursor.lastrowid
    connect.close()
    return value_change_id


def create_character_value(character_id, value_id, aligned):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("INSERT INTO character_value(aligned, character_id, value_id) VALUES (:aligned, :character_id, :value_id)",
        {
            'aligned': aligned,
            'character_id': character_id,
            'value_id': value_id
        })

    connect.commit()
    character_value_id = cursor.lastrowid
    connect.close()
    return character_value_id


# UPDATE value objects

def update_value(value_id, label, description, notes):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE value SET label=:label, description=:description, notes=:notes WHERE id=:id",
        {
            'label': label,
            'description': description,
            'notes': notes,
            'id': value_id
        })

    connect.commit()
    connect.close()
    return True


def update_value_change(value_id, value_change_id, label, description, notes, magnitude):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE value_change SET label=:label, description=:description, notes=:notes, magnitude=:magnitude, value_id=:value_id WHERE id=:id",
        {
            'label': label,
            'description': description,
            'notes': notes,
            'value_id': value_id,
            'magnitude': magnitude,
            'id': value_change_id
        })

    connect.commit()
    connect.close()
    return True


def update_character(char_id, first_name, last_name, description, notes):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE character SET first_name=:first_name, last_name=:last_name, description=:description, notes=:notes WHERE id=:id",
        {
            'first_name': first_name,
            'last_name': last_name,
            'description': description,
            'notes': notes,
            'id': char_id
        })

    connect.commit()
    connect.close()
    return True


def update_location(location_id, name, description, notes):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE location SET name=:name, description=:description, notes=:notes WHERE id=:id",
        {
            'name': name,
            'description': description,
            'notes': notes,
            'id': location_id
        })

    connect.commit()
    connect.close()
    return True


def update_character_value(character_value_id, aligned):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE character_value SET aligned=:aligned WHERE id=:character_value_id",
        {
            'character_value_id': character_value_id,
            'aligned': aligned

        })

    connect.commit()
    connect.close()
    return True

'''

{
        'value_id': value_id
    })

    '''
# GET value objects

def get_values(story_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM value where story_id=:story_id", {
        'story_id': story_id
    })

    records = cursor.fetchall()
    values = []

    for record in records:
        values.append({
            "id": record[0],
            "label": record[2],
            "description": record[3],
            "notes": record[4]
        })

    connect.commit()
    connect.close()
    return values


def get_characters(story_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM character where story_id=:story_id", {
        'story_id': story_id
    })
    records = cursor.fetchall()
    characters = []

    for record in records:
        characters.append({
            "id": record[0],
            "first_name": record[2],
            "last_name": record[3],
            "description": record[4],
            "notes": record[5]
        })

    connect.commit()
    connect.close()
    return characters


def get_locations(story_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM location where story_id=:story_id", {
        'story_id': story_id
    })
    records = cursor.fetchall()

    connect.commit()
    connect.close()
    return records


def get_value_changes(story_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM value_change where story_id=:story_id", {
        'story_id': story_id
    })
    records = cursor.fetchall()

    connect.commit()
    connect.close()
    return records


def get_character_values():
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM character_value")
    records = cursor.fetchall()
    character_values = []

    for record in records:
        characters.append({
            "id": record[0],
            "aligned": record[1],
            "character_id": record[2],
            "value_id": record[3]
        })

    connect.commit()
    connect.close()
    return character_values


# Get individual value objects

def get_value_by_id(value_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM value WHERE id=:value_id", {
        'value_id': value_id
    })
    records = cursor.fetchall()

    value_id = records[0][0]

    # Get the character_value objects for this value from the database
    cursor.execute("SELECT id, aligned, character_id, value_id FROM character_value WHERE value_id=:value_id", {
        'value_id': value_id
    })
    character_values = []

    character_value_records = cursor.fetchall()

    for character_value_record in character_value_records:
        character_values.append({
            'id': character_value_record[0],
            'aligned': character_value_record[1],
            'character_id': character_value_record[2],
            'value_id': character_value_record[3]
        })

    value = {
        'id': value_id,
        'label': records[0][2],
        'description': records[0][3],
        'notes': records[0][4],
        'character_values': character_values
    }
    # print(character_values)
    connect.close()
    return value


def get_location_by_id(location_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM location WHERE id=:location_id", {
        'location_id': location_id
    })
    records = cursor.fetchall()
    location = {
        'id': records[0][0],
        'name': records[0][2],
        'description': records[0][3],
        'notes': records[0][4]
    }
    connect.close()
    return location


def get_character_by_id(character_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM character WHERE id=:character_id", {
        'character_id': character_id
    })
    records = cursor.fetchall()

    character_id = records[0][0]
    character_values = []

    # Get the character_value objects for this character from the database
    cursor.execute("SELECT id, aligned, character_id, value_id FROM character_value WHERE character_id=:character_id", {
        'character_id': character_id
    })

    character_value_records = cursor.fetchall()

    for character_value_record in character_value_records:
        character_values.append({
            'id': character_value_record[0],
            'aligned': character_value_record[1],
            'character_id': character_value_record[2],
            'value_id': character_value_record[3]
        })
    
    character = {
        'id': character_id,
        'first_name': records[0][2],
        'last_name': records[0][3],
        'description': records[0][4],
        'notes': records[0][5],
        'character_values': character_values
    }
    connect.close()
    return character


def get_character_value_by_id(character_value_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM character_value WHERE id=:character_value_id", {
        'character_value_id': character_value_id
    })
    records = cursor.fetchall()
    character_value = {
        'id': records[0][0],
        'aligned': records[0][1],
        'character_id': records[0][2],
        'value_id': records[0][3]
    }
    connect.close()
    return character_value


def get_value_changes_by_beat_id(beat_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM value_change WHERE beat_id=:beat_id", {
        'beat_id': beat_id
    })

    records = cursor.fetchall()
    value_changes = []

    for record in records:
        value_changes.append({
            'id': record[0],
            'label': record[2],
            'description': record[3],
            'beat_id': record[4],
            'value_id': record[5],
            'magnitude': record[6],
            'notes': record[7]
        })
    connect.close()
    return value_changes


def get_value_changes_by_value_id(value_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM value_change WHERE value_id=:value_id", {
        'value_id': value_id
    })

    records = cursor.fetchall()
    value_changes = []

    for record in records:
        value_changes.append({
            'id': record[0],
            'label': record[2],
            'description': record[3],
            'beat_id': record[4],
            'value_id': record[5],
            'magnitude': record[6],
            'notes': record[7]
        })
    connect.close()
    return value_changes


def get_value_change_by_id(id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT * FROM value_change WHERE id=:id", {
        'id': id
    })
    records = cursor.fetchall()
    value_change = {
        'id': records[0][0],
        'label': records[0][2],
        'description': records[0][3],
        'beat_id': records[0][4],
        'value_id': records[0][5],
        'magnitude': records[0][6],
        'notes': records[0][7]
    }
    connect.close()
    return value_change


# DELETE value objects


# returns number of rows deleted
def delete_character_value(character_value_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    cursor.execute("DELETE FROM character_value WHERE id = :character_value_id",
        {
            'character_value_id': character_value_id
        })

    rowcount = cursor.rowcount
    connect.commit()
    connect.close()
    #print("Deleted " + str(rowcount))
    return rowcount


# returns number of rows deleted
def delete_location(location_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    cursor.execute("DELETE FROM location WHERE id = :location_id",
        {
            'location_id': location_id
        })

    rowcount = cursor.rowcount
    connect.commit()
    connect.close()
    # print("Deleted " + str(rowcount) + "location(s)")
    return rowcount


# returns the number of characters deleted
def delete_character(character_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # first delete all character-value relations

    cursor.execute("DELETE FROM character_value WHERE character_id = :character_id",
        {
            'character_id': character_id
        })
    
    connect.commit()

    # now delete the character
    cursor.execute("DELETE FROM character WHERE id = :character_id",
        {
            'character_id': character_id
        })

    rowcount = cursor.rowcount
    connect.commit()
    connect.close()
    #print("Deleted " + str(rowcount) + "character(s)")
    return rowcount   


# returns the number of values deleted
def delete_value(value_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # first delete all character-value relations

    cursor.execute("DELETE FROM character_value WHERE value_id = :value_id",
        {
            'value_id': value_id
        })
    
    connect.commit()

    # now delete the character
    cursor.execute("DELETE FROM value WHERE id = :value_id",
        {
            'value_id': value_id
        })

    rowcount = cursor.rowcount
    connect.commit()
    connect.close()

    #print("Deleted " + str(rowcount) + "value(s)")

    return rowcount  


def archive_story(story_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE story SET archived=1 WHERE id=:id",
        {
            'id': story_id
        })

    connect.commit()
    connect.close()
    return True


def unarchive_story(story_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("UPDATE story SET archived=0 WHERE id=:id",
        {
            'id': story_id
        })

    connect.commit()
    connect.close()
    return True


def delete_story(story_id):
    story = get_story_by_id(story_id)

    # delete subcomponents
    for act in story["acts"]:
        for chapter in act["chapters"]:
            for scene in chapter["scenes"]:
                for beat in scene["beats"]:
                    delete_beat(beat["id"])
                delete_scene(scene["id"])
            delete_chapter(chapter["id"])
        delete_act(act["id"])

    
    # access database AFTER the subcomponents loop, because they call functions which use the DB
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    for value in story["values"]:
        cursor.execute("DELETE FROM character_value WHERE value_id = :value_id",
            {
                'value_id': value["id"]
            })

    for character in story["characters"]:
        cursor.execute("DELETE FROM character_value WHERE character_id = :character_id",
            {
                'character_id': character["id"]
            })

    cursor.execute("DELETE FROM value_change WHERE story_id = :story_id",
        {
            'story_id': story_id
        })

    cursor.execute("DELETE FROM value WHERE story_id = :story_id",
        {
            'story_id': story_id
        })

    cursor.execute("DELETE FROM character WHERE story_id = :story_id",
        {
            'story_id': story_id
        })

    cursor.execute("DELETE FROM location WHERE story_id = :story_id",
        {
            'story_id': story_id
        })
    
    cursor.execute("DELETE FROM story WHERE id = :story_id",
        {
            'story_id': story_id
        })
    
    connect.commit()
    connect.close()


    print("Deleting " + story["label"])

    return True


# TESTING FUNCTIONS


def check_all_orders(story):
    # check the story for order issues
    print("ACT ORDERS")
    story['acts'] = check_components_order(story['acts'])  

    for act in story['acts']:        
        # check the order of the chapters
        print("CHAPTER ORDERS")
        act['chapters'] = check_components_order(act['chapters'])

        for chapter in act['chapters']:
            # check the order of the scenes
            print("SCENES ORDERS")
            chapter['scenes'] = check_components_order(chapter['scenes'])

            for scene in chapter['scenes']:
                # check the order of the beats
                print("BEATS ORDERS")
                scene['beats'] = check_components_order(scene['beats'])
    return story



# Make sure the order goes sequentially from 1 to the final item.
# This shouldn't need to be used in production. This is a tool for me now.
def check_components_order(components):
    order_broken = False
    for index, component in enumerate(components, start=1):
        # print(index)
        if component['order'] != index:
            print(str(index) + " is NOT " + str(component['order']))
            order_broken = True
            # NOW we have to FIX them
            component['order'] = index
            # NOW we have to SAVE the broken one
            update_component_order(component, index)
        else:
            print(str(index) + " IS " + str(component['order']))
    print("Order is BROKEN" if order_broken else "Order is OK")
    return components


def update_component_order(component, new_order):
    # THIS is a BAD way to check... they should be objects instead of dicts.
    print("fixing error")
    if 'chapters' in component:
        update_act_order(component['id'], new_order)
    elif 'scenes' in component:
        update_chapter_order(component['id'], new_order)
    elif 'beats' in component:
        update_scene_order(component['id'], new_order)
    elif 'scene_id' in component:
        print("NOW WE HAVE TO FIX A BEAT")
        update_beat_order(component['id'], new_order)
    else:
        print(component)
        

