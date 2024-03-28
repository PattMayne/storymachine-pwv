import webview

from data import factory
from data import get_story

"""
TO DO:
- display story data on screen
- create classes / models
	- objects should store the ID for saving later
	- function for saving/updating objects
		- the function should actually just call a Factory function... so maybe skip the class function/method?
- factory should return classes (not just IDs and not dicts)
- user preferences table
- multiple screens
	- act, beat, chapter, scene, story (with whole tree)
	- watch this video: https://kivycoder.com/multiple-windows-with-screenmanager-python-kivy-gui-tutorial-31/
- Classes/models
- Replace schema with models.py
- panel to create characters
- panel to create values
- panel to create new author
- panel to create new story
- file for text to be used as instructions and labels

"""





def main_function(window):
    print("WINDOW OPEN")
    # make sure database exists
    factory.setup_db()

main_window = webview.create_window('Woah dude!', html='<h1>Woah dude!<h1>')
webview.start(main_function, main_window)
# anything below this line will be executed after program is finished executing
print("WINDOW CLOSED")
pass
