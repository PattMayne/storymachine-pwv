import webview

from data import factory
from data import get_story


"""
TO DO:

    - create new elements (factory)
    - edit element page
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
    
    # get stuff

    def get_base_story(self):
        print("getting base story")
        base_story = get_base_story()
        #base_story = get_story.ids()
        return base_story
    
    def get_story_by_id(self, story_id):
        return factory.get_story_by_id(story_id)

    def get_act_by_id(self, act_id):
        return factory.get_act_by_id(act_id)

    def get_chapter_by_id(self, chapter_id):
        return factory.get_chapter_by_id(chapter_id)
    
    def get_scene_by_id(self, scene_id):
        return factory.get_scene_by_id(scene_id)
    
    def get_beat_by_id(self, beat_id):
        print("beat id: " + str(beat_id))
        return factory.get_beat_by_id(beat_id)

    def get_current_story(self):
        return factory.get_story_by_id(current_story_id)
    
    def get_stories_list(self):
        return factory.get_story_ids_and_labels()
    
    # create stuff

    def create_beat(self, scene_id):
        return factory.create_new_beat(scene_id)
    
    def create_scene(self, chapter_id):
        return factory.create_new_scene(chapter_id)
    
    def create_chapter(self, act_id):
        return factory.create_new_chapter(act_id)
    
    def create_act(self, story_id):
        return factory.create_new_act(story_id)
    
    # create stuff at certain order

    def create_beat_at_order(self, scene_id, new_order):
        return factory.create_new_beat_at_order(scene_id, new_order)
    
    def create_scene_at_order(self, chapter_id, new_order):
        return factory.create_new_scene_at_order(chapter_id, new_order)
    
    def create_chapter_at_order(self, act_id, new_order):
        return factory.create_new_chapter_at_order(act_id, new_order)
    
    def create_act_at_order(self, story_id, new_order):
        return factory.create_new_act_at_order(story_id, new_order)


    def create_empty_story(self, label, description):
        return factory.create_empty_story(label, description)

    # update stuff

    def update_story(self, id, label, description):
        return factory.update_story(id, label, description)    

    def update_act(self, id, label, description):
        return factory.update_act(id, label, description)
    
    def update_chapter(self, id, label, description):
        return factory.update_chapter(id, label, description)
    
    def update_scene(self, id, label, description):
        return factory.update_scene(id, label, description)
    
    def update_beat(self, id, label, description):
        return factory.update_beat(id, label, description)
    
    def switch_act_order(self, order_1, order_2, id_1, id_2):
        item_2_updated = factory.update_act_order(id_2, order_1)
        item_1_updated = factory.update_act_order(id_1, order_2)
        return item_2_updated & item_1_updated
    
    def switch_chapter_order(self, order_1, order_2, id_1, id_2):
        item_2_updated = factory.update_chapter_order(id_2, order_1)
        item_1_updated = factory.update_chapter_order(id_1, order_2)
        return item_2_updated & item_1_updated
    
    def switch_scene_order(self, order_1, order_2, id_1, id_2):
        item_2_updated = factory.update_scene_order(id_2, order_1)
        item_1_updated = factory.update_scene_order(id_1, order_2)
        return item_2_updated & item_1_updated

    def switch_beat_order(self, order_1, order_2, id_1, id_2):
        print("beating switching")
        item_2_updated = factory.update_beat_order(id_2, order_1)
        item_1_updated = factory.update_beat_order(id_1, order_2)
        return item_2_updated & item_1_updated
    
    def open_story_window(self):
        global current_story_id
        current_story_id = 1
        story_window = webview.create_window('story', 'public/story.html', js_api=Api(), width=1200, height=800)

    # delete stuff

    def delete_beat(self, beat_id):
        print("deleting beat " + str(beat_id))
        factory.delete_beat(beat_id, True)

    def delete_scene(self, scene_id):
        print("deleting scene " + str(scene_id))
        factory.delete_scene(scene_id, True)


def main_function(window):
    print("WINDOW OPEN")
    # make sure database exists
    factory.setup_db()

global screen

for i, thisScreen in enumerate(webview.screens):
    global screen
    #webview.create_window('', html=f'placed on the monitor {i+1}', screen=screen)
    screen = thisScreen

init_window = webview.create_window('storymachine', 'public/init.html', js_api=Api(), width=1600, height=1200)
# story_window = webview.create_window('story', 'public/story.html', js_api=Api())

# init_window.confirm_close = True
webview.start(main_function, init_window, gui='gtk', debug=True)
# anything below this line will be executed after program is finished executing
print("WINDOW CLOSED")
pass
