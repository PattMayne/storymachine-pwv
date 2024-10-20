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
    - Replace "delete" with "archive"
        - then enable "delete" within the archives
        - Archives will be tricky since "archiving" a parent object must archive its children.

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
        return factory.get_beat_by_id(beat_id)

    def get_current_story(self):
        return factory.get_story_by_id(current_story_id)
    
    def get_stories_list(self):
        return factory.get_story_ids_and_labels()
    
    def get_characters(self):
        return factory.get_characters()
    
    def get_locations(self):
        return factory.get_locations()
    
    def get_values(self):
        return factory.get_values()

    def get_character_values(self):
        return factory.get_character_values()

    def get_value_by_id(self, value_id):
        return factory.get_value_by_id(value_id)

    def get_character_by_id(self, character_id):
        return factory.get_character_by_id(character_id)
    
    def get_location_by_id(self, location_id):
        return factory.get_location_by_id(location_id)

    def get_value_changes_by_beat_id(self, beat_id):
        return factory.get_value_changes_by_beat_id(beat_id)

    def get_value_changes_by_value_id(self, value_id):
        return factory.get_value_changes_by_value_id(value_id)

    def get_value_changes(self, id):
        return factory.get_value_changes(id)

    def get_value_change_by_id(self, id):
        return factory.get_value_change_by_id(id)

    # create stuff

    def create_beat(self, scene_id):
        return factory.create_new_beat(scene_id)
    
    def create_scene(self, chapter_id):
        return factory.create_new_scene(chapter_id)
    
    def create_chapter(self, act_id):
        return factory.create_new_chapter(act_id)
    
    def create_act(self, story_id):
        return factory.create_new_act(story_id)
    
    def create_value(self, story_id, label, description, notes):
        return factory.create_value(story_id, label, description, notes)
    
    def create_character(self, story_id, first_name, last_name, description, notes):
        return factory.create_character(story_id, first_name, last_name, description, notes)
    
    def create_location(self, story_id, name, description, notes):
        return factory.create_location(story_id, name, description, notes)

    def create_character_value(self, character_id, value_id, aligned):
        return factory.create_character_value(character_id, value_id, aligned)
    
    def create_value_change(self, story_id, beat_id, value_id, magnitude, label, description, notes):
        print("We are in python now")
        # print("story_id: " + str(story_id) + "beat_id: " + str(beat_id) + "value_id: " + str(value_id) + "magnitude: " + str(magnitude) + "label: " + str(label) + "description: " + str(description) + "notes: " + str(notes))
        return factory.create_value_change(story_id, beat_id, value_id, magnitude, label, description, notes)

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
    
    def update_value(self, id, label, description, notes):
        return factory.update_value(id, label, description, notes)

    def update_value_change(self, value_id, value_change_id, label, description, notes, magnitude):
        # print("UPDATING A VALUE CHANGE NOW")
        return factory.update_value_change(value_id, value_change_id, label, description, notes, magnitude)

    def update_character(self, id, first_name, last_name, description, notes):
        return factory.update_character(id, first_name, last_name, description, notes)

    def update_location(self, id, name, description, notes):
        return factory.update_location(id, name, description, notes)

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
        item_2_updated = factory.update_beat_order(id_2, order_1)
        item_1_updated = factory.update_beat_order(id_1, order_2)
        return item_2_updated & item_1_updated
    

    def switch_character_value_alignment(self, character_value_id):
        current_alignment = factory.get_character_value_by_id(character_value_id)["aligned"]
        factory.update_character_value(character_value_id, not current_alignment)
        return True


    def open_story_window(self):
        global current_story_id
        current_story_id = 1
        story_window = webview.create_window('cards', 'public/cards.html', js_api=Api(), width=1200, height=800)

    # delete stuff

    def delete_beat(self, beat_id):
        factory.delete_beat(beat_id, True)

    def delete_scene(self, scene_id):
        factory.delete_scene(scene_id, True)
    
    def delete_chapter(self, chapter_id):
        factory.delete_chapter(chapter_id, True)
    
    def delete_act(self, act_id):
        factory.delete_act(act_id, True)
    
    def delete_character_value(self, character_value_id):
        return factory.delete_character_value(character_value_id)

    def delete_location(self, location_id):
        return factory.delete_location(location_id)

    def delete_character(self, character_id):
        return factory.delete_character(character_id)

    def delete_value(self, value_id):
        return factory.delete_value(value_id)

    def archive_story(self, story_id):
        return factory.archive_story(story_id)

    def unarchive_story(self, story_id):
        return factory.unarchive_story(story_id)
    
    def delete_story(self, story_id):
        return factory.delete_story(story_id)


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
# story_window = webview.create_window('cards', 'public/cards.html', js_api=Api())

# init_window.confirm_close = True
webview.start(main_function, init_window, gui='gtk', debug=True)
# anything below this line will be executed after program is finished executing
print("WINDOW CLOSED")
pass
