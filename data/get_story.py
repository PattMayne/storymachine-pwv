import sqlite3
from sqlite3 import OperationalError
from data import base_story
import json

# Get all story ids

def ids():
    story_ids = []
    conn = sqlite3.connect('data/stories.db')
    cur = conn.cursor()

    # Get the story info from the database
    cur.execute("SELECT id FROM story")
    records = cur.fetchall()

    for record in records:
        story_ids.append(record[0])
    
    return story_ids

# Get story dict by id

def by_id(story_id):
    conn = sqlite3.connect('data/stories.db')
    cur = conn.cursor()

    # Get the story info from the database
    cur.execute("SELECT * FROM story WHERE id=:story_id", {
        'story_id': story_id
    })
    records = cur.fetchall()

    print("Story ID: " + str(story_id))

    story = {
        'label': records[0][1],
        'description': records[0][2],
        'authors': records[0][3],
        'acts': []
    }

    # next get the acts
    cur.execute("SELECT * FROM act WHERE story_id=:story_id", {
        'story_id': story_id
    })
    records = cur.fetchall()

    for act_record in records:
        act_id = act_record[0]
        story["acts"].append({
            'id': act_id,
            'label': act_record[1],
            'description': act_record[2],
            'chapters': []
        })

        # Within the loop, get the chapters for THIS act
        cur.execute("SELECT * FROM chapter WHERE act_id=:act_id", {
            'act_id': act_id
        })

        chapter_records = cur.fetchall()
        act = story["acts"][len(story["acts"])-1]

        for chapter in chapter_records:
            chapter_id = chapter[0]
            act["chapters"].append({
                'id': chapter_id,
                'label': chapter[1],
                'description': chapter[2],
                'scenes': []
            })

    conn.commit()
    conn.close()
    return story