import sqlite3
from sqlite3 import OperationalError
import json


# returns a dictionary of dictionaries of dictionaries...
def get_base_story():
	return {
        "label": "Story Title",
		"description": "Here's a description, ya filthy animals!",
        "acts": [
            {
                "label": "act 1",
                "chapters": [
                    {
                        "label": "a chapter for act 1",
                        "scenes": [
                            {
                                "label": "a scene for act 1",
                                "beats": [
                                    {
                                        "label": "act 1, chapter 1, beat 1"
                                    },
                                    {
                                        "label": "act 1, chapter 1, beat 2"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "label": "act 2",
                "chapters": [
                    {
                        "label": "a chapter for act 2",
                        "scenes": [
                            {
                                "label": "a scene for act 2",
                                "beats": [
                                    {
                                        "label": "act 2, chapter 1, beat 1"
                                    },
                                    {
                                        "label": "act 2, chapter 1, beat 2"
                                    }
                                ]
                            }
                        ]
                    }, {
                        "label": "a SECOND chapter for act 2",
                        "scenes": [
                            {
                                "label": "a scene chapter 2 for act 2",
                                "beats": [
                                    {
                                        "label": "act 2, chapter 2, beat 1"
                                    },
                                    {
                                        "label": "act 2, chapter 2, beat 2"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "label": "act 3",
                "chapters": [
                    {
                        "label": "a chapter for act 3",
                        "scenes": [
                            {
                                "label": "a scene for act 3",
                                "beats": [
                                    {
                                        "label": "act 3, chapter 1, beat 1"
                                    },
                                    {
                                        "label": "act 3, chapter 1, beat 2"
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
def create(mainApp):
	empty_base_story = get_base_story()

	story_label = empty_base_story["label"]
	acts = []

	conn = sqlite3.connect('data/stories.db')
	cur = conn.cursor()
	cur.execute("INSERT INTO story(label, description, author_ids) VALUES (:label, :description, :author_ids)",
		{
			'label': story_label,
			'description': empty_base_story["description"],
			'author_ids': '[]'
		})

	conn.commit()
	story_id =  cur.lastrowid	

	# This starts a chain of functions that each create story grid objects
	make_acts_from_dict(empty_base_story["acts"], story_id, conn, cur)

	# Close the connection
	conn.close()
	return story_id


# fresh story chain 1
def make_acts_from_dict(acts, story_id, conn, cur):
	for act in acts:
		sql_text = "INSERT INTO act(label, description, story_id, relative_order) VALUES(:label, :description, :story_id, :relative_order)"
		cur.execute(sql_text, 
		{
			'label': act["label"],
			'description': 'Describe an act? Preposterous!',
			'story_id': story_id,
			'relative_order': 0
		})
		
		conn.commit()
		act_id = cur.lastrowid
		print("ACT ID: " + str(act_id))

		make_chapters_from_dict(act["chapters"], act_id, conn, cur)


# fresh story chain 2
def make_chapters_from_dict(chapters, act_id, conn, cur):
	for chapter in chapters:
		sql_text = "INSERT INTO chapter(label, description, act_id, relative_order) VALUES(:label, :description, :act_id, :relative_order)"
		cur.execute(sql_text, 
		{
			'label': chapter["label"],
			'description': 'Describez un chapterino? Preposterous!',
			'act_id': act_id,
			'relative_order': 0
		})

		conn.commit()
		chapter_id = cur.lastrowid
		print("CHAPTER ID: " + str(chapter_id))

		make_scenes_from_dict(chapter["scenes"], chapter_id, conn, cur)



# fresh story chain 3
def make_scenes_from_dict(scenes, chapter_id, conn, cur):
	for scene in scenes:
		sql_text = "INSERT INTO scene(label, description, chapter_id, relative_order) VALUES(:label, :description, :chapter_id, :relative_order)"
		cur.execute(sql_text, 
		{
			'label': scene["label"],
			'description': 'Wellcome t o the scnee!S',
			'chapter_id': chapter_id,
			'relative_order': 0
		})

		conn.commit()
		scene_id = cur.lastrowid
		print("SCENE ID: " + str(scene_id))
		make_beats_from_dict(scene["beats"], scene_id, conn, cur)


# fresh story chain 4
def make_beats_from_dict(beats, scene_id, conn, cur):
	for beat in beats:
		sql_text = "INSERT INTO beat(label, description, scene_id, relative_order) VALUES(:label, :description, :scene_id, :relative_order)"
		cur.execute(sql_text, 
		{
			'label': beat["label"],
			'description': 'Wellcome t o the scnee!S',
			'scene_id': scene_id,
			'relative_order': 0
		})

		conn.commit()
		beat_id = cur.lastrowid
		print("BEAT ID: " + str(beat_id))

