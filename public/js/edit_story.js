// IMPORTS
import * as consts from 'consts'

// aspect is either creating a new story or editing an existing one
const aspects = {
    EDIT: 'edit',
    NEW: 'new'
}
var labelElement
var descriptionElement

var story = null
var aspect = null

const setAspect = () => {
    // discover the purpose of this visit
    const urlParams = new URLSearchParams(window.location.search)
    aspect = urlParams.get('edit') ? aspects.EDIT : aspects.NEW

    labelElement = document.getElementById("label")
    descriptionElement = document.getElementById("description")

    // if EDIT, get the story and populate from that object
    // else, populate fields with boilerplate stuff
    if (aspect == aspects.EDIT) {
        console.log("we are editing")
        const storyId = urlParams.get('story_id') || 0

        // webview... get story
        pywebview.api.get_story_by_id(storyId).then(incomingStory => {
            story = incomingStory
            // Load story data into fields
            labelElement.value = story.label
            descriptionElement.innerText = story.description
        })

    } else {
        console.log("we are NOT editing")
    }
}

const submit = () => aspect == aspects.EDIT ? updateStory() : createStory()

const createStory = () => {
    const label = labelElement.value
    const description = descriptionElement.value
    pywebview.api.create_empty_story(label, description).then(newStoryId => window.location = "story.html?story_id=" + newStoryId)
}

const updateStory = () => {
    const label = labelElement.value
    const description = descriptionElement.value
    pywebview.api.update_story(story.id, label, description).then(success => {
        if (success) {
            window.location = "story.html?story_id=" + story.id
        } else {
            console.log('failed to update story')
            alert("ERROR")
        }
    })
}

window.addEventListener('pywebviewready', setAspect())
window.submit = submit
