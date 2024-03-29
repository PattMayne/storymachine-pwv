import webview

from data import factory
from data import get_story


"""
TO DO:

    - Show ALL IDS and/or LABELS of STORIES
    - Load an actual story
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

# globally available "current" story
current_story_id = -1
# SHOULD we store the ENTIRE STORY here? No, since it's non-functional. Unless we want the capacity to reset it.


def get_base_story():
    story_id = factory.create_base_story()
    story = factory.get_story_by_id(story_id)
    return story


class Api():
    # These functions return a PROMISE which must be resolved with .then()
    def print_thing(self, value):
        print("the function is called")
        return "HELLO"
    
    def get_base_story(self):
        print("getting base story")
        base_story = get_base_story()
        base_story = get_story.ids()
        return base_story
    
    def get_story_by_id(self, story_id):
        story = factory.get_story_by_id(story_id)
        return story

    def open_story_window(self):
        global current_story_id
        current_story_id = 1
        story_window = webview.create_window('story', 'public/story.html', js_api=Api())

    def get_current_story(self):
        return factory.get_story_by_id(current_story_id)

def main_function(window):
    print("WINDOW OPEN")
    # make sure database exists
    factory.setup_db()


init_window = webview.create_window('storymachine', 'public/init.html', js_api=Api())
# story_window = webview.create_window('story', 'public/story.html', js_api=Api())

# init_window.confirm_close = True
webview.start(main_function, init_window, gui='gtk', debug=True)
# anything below this line will be executed after program is finished executing
print("WINDOW CLOSED")
pass
