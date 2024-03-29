import sqlite3
from sqlite3 import OperationalError
from data import base_story
import json

from data import get_story


def get_names():
	conn = sqlite3.connect('data/stories.db')
	cur = conn.cursor()
	cur.execute("SELECT * FROM author")
	records = cur.fetchall()

	conn.commit()
	conn.close()
	return records


# SETTERS

def setup_db():
	# Open and read the file as a single buffer
	fd = open('data/schema.sql', 'r')
	sqlFile = fd.read()
	fd.close()
	sqlCommands = sqlFile.split(';')

	# Create Database Or Connect To One
	conn = sqlite3.connect('data/stories.db')
	# Create A Cursor
	cur = conn.cursor()

	# Execute every command from the input file (to create the database)
	for command in sqlCommands:
		# This will skip and report errors
		try:
			cur.execute(command)
		except (OperationalError):
			print("Command skipped: ", command)

	# Commit our changes
	conn.commit()

	# Close our connection
	conn.close()

# creates new author object in the db
def create_new_author(first_name, last_name):
	conn = sqlite3.connect('data/stories.db')
	cur = conn.cursor()
	cur.execute("INSERT INTO author(first_name, last_name) VALUES (:first_name, :last_name)",
		{
			'first_name': first_name,
			'last_name': last_name,
		})

	conn.commit()
	author_id = cur.lastrowid
	conn.close()
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


def get_story_ids():
    return get_story.ids()
