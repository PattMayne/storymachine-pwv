import sqlite3
from sqlite3 import OperationalError
import json


# returns a dictionary of dictionaries of dictionaries...
def get_base_story():
	return {
        "loaded": True,
        "label": "Story Title",
		"description": "",
        "acts": [
            {
                "label": "act 1",
                "relative_order": 1,
                "chapters": [
                    {
                        "label": "chapter 1",
                        "relative_order": 1,
                        "scenes": [
                            {
                                "label": "scene 1",
                                "relative_order": 1,
                                "beats": [
                                    {
                                        "label": "beat 1",
                                        "relative_order": 1
                                    },
                                    {
                                        "label": "beat 2",
                                        "relative_order": 2
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "label": "act 2",
                "relative_order": 2,
                "chapters": [
                    {
                        "label": "chapter 1",
                        "relative_order": 1,
                        "scenes": [
                            {
                                "label": "scene 1",
                                "relative_order": 1,
                                "beats": [
                                    {
                                        "label": "beat 1",
                                        "relative_order": 1
                                    },
                                    {
                                        "label": "beat 2",
                                        "relative_order": 2
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "label": "act 3",
                "relative_order": 3,
                "chapters": [
                    {
                        "label": "chapter 1",
                        "relative_order": 1,
                        "scenes": [
                            {
                                "label": "scene 1",
                                "relative_order": 1,
                                "beats": [
                                    {
                                        "label": "beat 1",
                                        "relative_order": 1
                                    },
                                    {
                                        "label": "beat 2",
                                        "relative_order": 2
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }


# creates vanilla story template data in DB from the above dictionary
# returns id of new story data in DB
def create():
	empty_base_story = get_base_story()
	story_label = empty_base_story["label"]
	acts = []

	connect = sqlite3.connect('data/stories.db')
	cursor = connect.cursor()
	cursor.execute("INSERT INTO story(label, description, author_ids) VALUES (:label, :description, :author_ids)",
		{
			'label': story_label,
			'description': empty_base_story["description"],
			'author_ids': '[]'
		})

	connect.commit()
	story_id =  cursor.lastrowid	

	# This starts a chain of functions that each create story grid objects
	make_acts_from_dict(empty_base_story["acts"], story_id, connect, cursor)

	# Close the connection
	connect.close()
	return story_id


# fresh story chain 1
def make_acts_from_dict(acts, story_id, connect, cursor):
	for act in acts:
		sql_text = "INSERT INTO act(label, description, story_id, relative_order) VALUES(:label, :description, :story_id, :order1)"
		cursor.execute(sql_text, 
		{
			'label': act["label"],
			'description': '',
			'story_id': story_id,
			'order1': act["relative_order"]
		})
		
		connect.commit()
		act_id = cursor.lastrowid
		print("ACT ID: " + str(act_id))

		make_chapters_from_dict(act["chapters"], act_id, connect, cursor)


# fresh story chain 2
def make_chapters_from_dict(chapters, act_id, connect, cursor):
	for chapter in chapters:
		sql_text = "INSERT INTO chapter(label, description, act_id, relative_order) VALUES(:label, :description, :act_id, :relative_order)"
		cursor.execute(sql_text, 
		{
			'label': chapter["label"],
			'description': '',
			'act_id': act_id,
			'relative_order': chapter["relative_order"]
		})

		connect.commit()
		chapter_id = cursor.lastrowid
		print("CHAPTER ID: " + str(chapter_id))

		make_scenes_from_dict(chapter["scenes"], chapter_id, connect, cursor)


# fresh story chain 3
def make_scenes_from_dict(scenes, chapter_id, connect, cursor):
	for scene in scenes:
		sql_text = "INSERT INTO scene(label, description, chapter_id, relative_order) VALUES(:label, :description, :chapter_id, :relative_order)"
		cursor.execute(sql_text, 
		{
			'label': scene["label"],
			'description': '',
			'chapter_id': chapter_id,
			'relative_order': scene["relative_order"]
		})

		connect.commit()
		scene_id = cursor.lastrowid
		print("SCENE ID: " + str(scene_id))
		make_beats_from_dict(scene["beats"], scene_id, connect, cursor)


# fresh story chain 4
def make_beats_from_dict(beats, scene_id, connect, cursor):
	for beat in beats:
		sql_text = "INSERT INTO beat(label, description, scene_id, relative_order) VALUES(:label, :description, :scene_id, :relative_order)"
		cursor.execute(sql_text, 
		{
			'label': beat["label"],
			'description': '',
			'scene_id': scene_id,
			'relative_order': beat["relative_order"]
		})

		connect.commit()
		beat_id = cursor.lastrowid
		print("BEAT ID: " + str(beat_id))

