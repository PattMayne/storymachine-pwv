import sqlite3
from sqlite3 import OperationalError
from data import base_story
import json

# Get all story ids

def ids_and_labels():
    story_ids_and_labels = []
    conn = sqlite3.connect('data/stories.db')
    cur = conn.cursor()

    # Get the story info from the database
    cur.execute("SELECT id, label FROM story")
    records = cur.fetchall()

    for record in records:
        story_ids_and_labels.append({"id": record[0], "label": record[1]})
    
    return story_ids_and_labels


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

        for chapter_record in chapter_records:
            chapter_id = chapter_record[0]
            act["chapters"].append({
                'id': chapter_id,
                'label': chapter_record[1],
                'description': chapter_record[2],
                'scenes': []
            })

            # Within the loop, get the scenes for THIS chapter
            cur.execute("SELECT * FROM scene WHERE chapter_id=:chapter_id", {
                'chapter_id': chapter_id
            })

            scene_records = cur.fetchall()
            chapter = act["chapters"][len(act["chapters"])-1]

            for scene_record in scene_records:
                scene_id = scene_record[0]
                chapter["scenes"].append({
                    'id': scene_id,
                    'label': scene_record[1],
                    'description': scene_record[2],
                    'beats': []
                })

                # Within the loop, get the beats for THIS scene
                cur.execute("SELECT * FROM beat WHERE scene_id=:scene_id", {
                    'scene_id': scene_id
                })

                beat_records = cur.fetchall()
                scene = chapter["scenes"][len(chapter["scenes"])-1]

                for beat_record in beat_records:
                    beat_id = beat_record[0]
                    scene["beats"].append({
                        'id': beat_id,
                        'label': beat_record[1],
                        'description': beat_record[2]
                    })


    conn.commit()
    conn.close()
    return story