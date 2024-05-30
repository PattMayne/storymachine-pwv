import sqlite3
from sqlite3 import OperationalError
from data import base_story
import json

# Get all story ids

def ids_and_labels():
    story_ids_and_labels = []
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # Get the story info from the database
    cursor.execute("SELECT id, label FROM story")
    records = cursor.fetchall()

    for record in records:
        story_ids_and_labels.append({"id": record[0], "label": record[1]})
    
    return story_ids_and_labels


# Get story dict by id

def by_id(story_id):
    connect = sqlite3.connect('data/stories.db')
    cursor = connect.cursor()

    # Get the story info from the database
    cursor.execute("SELECT * FROM story WHERE id=:story_id", {
        'story_id': story_id
    })
    records = cursor.fetchall()

    print("Story ID: " + str(story_id))

    story = {
        'id': records[0][0],
        'label': records[0][1],
        'description': records[0][4],
        'authors': records[0][5],
        'acts': []
    }

    # next get the acts
    cursor.execute("SELECT * FROM act WHERE story_id=:story_id ORDER BY relative_order ASC", {
        'story_id': story_id
    })
    records = cursor.fetchall()

    for act_record in records:
        act_id = act_record[0]
        story["acts"].append({
            'id': act_id,
            'label': act_record[1],
            'description': act_record[2],
            'chapters': [],
            'order': act_record[4]
        })

        # Within the loop, get the chapters for THIS act
        cursor.execute("SELECT * FROM chapter WHERE act_id=:act_id ORDER BY relative_order ASC", {
            'act_id': act_id
        })

        chapter_records = cursor.fetchall()
        act = story["acts"][len(story["acts"])-1]

        for chapter_record in chapter_records:
            chapter_id = chapter_record[0]
            act["chapters"].append({
                'id': chapter_id,
                'label': chapter_record[1],
                'description': chapter_record[2],
                'scenes': [],
                'order': chapter_record[4]
            })

            # Within the loop, get the scenes for THIS chapter
            cursor.execute("SELECT * FROM scene WHERE chapter_id=:chapter_id ORDER BY relative_order ASC", {
                'chapter_id': chapter_id
            })

            scene_records = cursor.fetchall()
            chapter = act["chapters"][len(act["chapters"])-1]

            for scene_record in scene_records:
                scene_id = scene_record[0]
                chapter["scenes"].append({
                    'id': scene_id,
                    'label': scene_record[1],
                    'description': scene_record[2],
                    'beats': [],
                    'order': scene_record[4]
                })

                # Within the loop, get the beats for THIS scene
                cursor.execute("SELECT * FROM beat WHERE scene_id=:scene_id ORDER BY relative_order ASC", {
                    'scene_id': scene_id
                })

                beat_records = cursor.fetchall()
                scene = chapter["scenes"][len(chapter["scenes"])-1]

                for beat_record in beat_records:
                    beat_id = beat_record[0]
                    scene["beats"].append({
                        'id': beat_id,
                        'label': beat_record[1],
                        'description': beat_record[2],
                        'order': beat_record[4]
                    })


    connect.commit()
    connect.close()
    return story