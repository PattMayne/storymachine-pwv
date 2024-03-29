// IMPORTS
import * as consts from 'consts'
import * as html from 'html'

// VARS
const levels = consts.levels
var level = levels.STORY

// FUNCTIONS

const showAct = acdId => {
    level = levels.ACT
}

const loadStory = () => {
    level = levels.STORY
    const urlParams = new URLSearchParams(window.location.search)
    const storyId = urlParams.get('story_id') || -1
    document.getElementById("storyIdSpan").innerHTML = storyId

    pywebview.api.get_story_by_id(storyId).then(story => {
        // Load story objects from one level (currently only ACTs)
        document.getElementById("storyIdSpan").innerHTML = !!story?.label ? story.label : "NO NAME"

        // Get the HTML of the ACTS objects to display, and render that HTML
        const storyObjectsHTML = story.acts.reduce((htmlString, act) => htmlString += html.act(act), "")
        document.getElementById("levelLabel").innerHTML = level.toUpperCase() + "S"
        document.getElementById("storyObjectsBox").innerHTML = storyObjectsHTML
    })
}


document.onload = loadStory()

/**
 * NOTE:
 * Clicking on a link on the HTML, which calls a function here, can immediately update the "Story Objects" section.
 * So I can change between Acts / Chapters / Scenes / Beats without calling the Python API.
 */


// const loadStory = () => pywebview.api.get_current_story().then(story => {
//     document.getElementById("storyIdSpan").innerHTML = "OTHER function called"
//     stringValue = JSON.stringify(story)
//     document.getElementById("storyIdSpan").innerHTML = stringValue
// })
