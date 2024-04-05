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
    return get_story.by_id(story_id)


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
    print("made a new chapter at order: " + str(new_order))
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
    print("made a new act at order: " + str(new_order))
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



# UPDATE

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

    cursor.execute("SELECT chapter_id FROM scene WHERE id=:scene_id", {
        'scene_id': scene_id
    })
    records = cursor.fetchall()
    chapter_id = records[0][0]

    cursor.execute("DELETE FROM scene WHERE id = :id",
        {
            'id': scene_id
        })
    # delete any beats belonging to this scene
    cursor.execute("DELETE FROM beat WHERE scene_id = :scene_id",
        {
            'scene_id': scene_id
        })
    connect.commit()
    connect.close()

    # next reorder all beats
    if reorder:
        reorder_scenes(chapter_id)

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
