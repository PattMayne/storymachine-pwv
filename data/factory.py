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


def create_new_beat(scene_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT COUNT(*) from beat WHERE scene_id=:scene_id", {
        'scene_id': scene_id
    })
    beat_count = cursor.fetchone()[0]
    cursor.execute("INSERT INTO beat(label, scene_id, relative_order, description) VALUES (:label, :scene_id, :relative_order, :description)",
        {
            'label': "beat",
            'scene_id': scene_id,
            'relative_order': beat_count + 1,
            'description': "",
        })

    connect.commit()
    beat_id = cursor.lastrowid
    connect.close()
    return beat_id


def create_new_scene(chapter_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT COUNT(*) from scene WHERE chapter_id=:chapter_id", {
        'chapter_id': chapter_id
    })
    scene_count = cursor.fetchone()[0]
    cursor.execute("INSERT INTO scene(label, chapter_id, relative_order, description) VALUES (:label, :chapter_id, :relative_order, :description)",
        {
            'label': "scene",
            'chapter_id': chapter_id,
            'relative_order': scene_count + 1,
            'description': "",
        })

    connect.commit()
    scene_id = cursor.lastrowid
    connect.close()
    return scene_id


def create_new_chapter(act_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT COUNT(*) from chapter WHERE act_id=:act_id", {
        'act_id': act_id
    })
    chapter_count = cursor.fetchone()[0]
    cursor.execute("INSERT INTO chapter(label, act_id, relative_order, description) VALUES (:label, :act_id, :relative_order, :description)",
        {
            'label': "chapter",
            'act_id': act_id,
            'relative_order': chapter_count + 1,
            'description': "",
        })

    connect.commit()
    chapter_id = cursor.lastrowid
    connect.close()
    return chapter_id


def create_new_act(story_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()
    cursor.execute("SELECT COUNT(*) from act WHERE story_id=:story_id", {
        'story_id': story_id
    })
    act_count = cursor.fetchone()[0]
    cursor.execute("INSERT INTO act(label, story_id, relative_order, description) VALUES (:label, :story_id, :relative_order, :description)",
        {
            'label': "act",
            'story_id': story_id,
            'relative_order': act_count + 1,
            'description': "",
        })

    connect.commit()
    act_id = cursor.lastrowid
    connect.close()
    return act_id


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

