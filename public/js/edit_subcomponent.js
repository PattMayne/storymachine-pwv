// IMPORTS
import * as consts from 'consts'

// aspect is either creating a new story or editing an existing one
const levels = consts.levels
const aspects = {
    EDIT: 'edit',
    NEW: 'new'
}

var labelElement
var descriptionElement
var pageTitleElement

var subcomponent = null
var aspect = null
var level = null
var storyId, actId, chapterId, sceneId, beatId

// overlays
var loadingOverlay, loadingText, loadingInterval
var loadingTimer = 0

const setAspect = () => {
    loadDOM()
    showLoading()
    setTimeout(() => {
        // discover the purpose of this visit
        const urlParams = new URLSearchParams(window.location.search)
        aspect = urlParams.get('edit') ? aspects.EDIT : aspects.NEW
        storyId = urlParams.get('story_id') || 0
        actId = urlParams.get('act_id') || 0
        chapterId = urlParams.get('chapter_id') || 0
        sceneId = urlParams.get('scene_id') || 0
        beatId = urlParams.get('beat_id')
        level = urlParams.get('level')

        labelElement = document.getElementById("label")
        descriptionElement = document.getElementById("description")
        pageTitleElement = document.getElementById("pageTitle")
        pageTitleElement.innerHTML = "Edit " + level

        // if EDIT, get the subcomponent and populate from that object
        // else, populate fields with boilerplate stuff for the NEW subcomponent
        if (aspect == aspects.EDIT) {
            // check the level (cubcomponent type) and set the component
            level == levels.BEAT ? getBeat() :
                level == levels.SCENE ? getScene() :
                    level == levels.CHAPTER ? getChapter() :
                        level == levels.ACT ? getAct() : null
        } else {
            console.log("we are NOT editing")
        }
        hideLoading()
    }, 300)
}

// Once you get the subcomponent (any subcomponent!) set it.
const setSubcomponent = (incomingObject) => {
    subcomponent = incomingObject
    labelElement.value = subcomponent.label
    descriptionElement.innerText = subcomponent.description
}

const getAct = async () => pywebview.api.get_act_by_id(actId).then(incomingObject => setSubcomponent(incomingObject))
const getChapter = () => pywebview.api.get_chapter_by_id(chapterId).then(incomingObject => setSubcomponent(incomingObject))
const getScene = () => pywebview.api.get_scene_by_id(sceneId).then(incomingObject => setSubcomponent(incomingObject))
const getBeat = () => pywebview.api.get_beat_by_id(beatId).then(incomingObject => setSubcomponent(incomingObject))

const submit = () => aspect == aspects.EDIT ? updateComponent() : createComponent()

const createComponent = () => {
    // MAYBE REMOVE... maybe we only ever edit these subcomponents
    const label = labelElement.value
    const description = descriptionElement.value
    pywebview.api.create_empty_story(label, description).then(newStoryId => window.location = "story.html?story_id=" + newStoryId)
}

// find out which component we're using, and update that component.
const updateComponent = () => {
    const label = labelElement.value
    const description = descriptionElement.value

    if (level == levels.ACT) {
        pywebview.api.update_act(actId, label, description).then(success => {
            if (success) {
                window.location =
                    "story.html?story_id=" + storyId +
                    "&act_id=" + actId +
                    "&level=" + level
            } else {
                console.log('failed to update act')
                alert("ERROR")
            }
        })
    } else if (level == levels.CHAPTER) {
        pywebview.api.update_chapter(chapterId, label, description).then(success => {
            if (success) {
                window.location =
                    "story.html?story_id=" + storyId +
                    "&act_id=" + actId +
                    "&chapter_id=" +
                    chapterId +
                    "&level=" + level
            } else {
                console.log('failed to update chapter')
                alert("ERROR")
            }
        })
    } else if (level == levels.SCENE) {
        pywebview.api.update_scene(sceneId, label, description).then(success => {
            if (success) {
                window.location =
                    "story.html?story_id=" + storyId +
                    "&act_id=" + actId +
                    "&chapter_id=" + chapterId +
                    "&scene_id=" + sceneId +
                    "&level=" + level
            } else {
                console.log('failed to update scene')
                alert("ERROR")
            }
        })
    } else if (level == levels.BEAT) {
        pywebview.api.update_beat(beatId, label, description).then(success => {
            if (success) {
                window.location =
                    "story.html?story_id=" + storyId +
                    "&act_id=" + actId +
                    "&chapter_id=" + chapterId +
                    "&scene_id=" + sceneId +
                    "&beat_id=" + beatId +
                    "&level=" + level
            } else {
                console.log('failed to update beat')
                alert("ERROR")
            }
        })
    }

}

const loadDOM = () => {
    // overlay elements
    loadingOverlay = document.getElementById("loadingOverlay")
    loadingText = document.getElementById("loadingText")
}

const showLoading = () => {
    loadingOverlay.style.display = "inline-block"
    loadingInterval = setInterval(() => {
        if (loadingTimer > 5) {
            loadingTimer = 0
        }
        let loadingString = "Loading."
        for (let i = 0; i < loadingTimer; i++) {
            loadingString += "."
        }
        loadingText.innerHTML = loadingString
        loadingTimer++
    }, 340)
}

const hideLoading = () => {
    clearInterval(loadingInterval)
    loadingOverlay.style.display = "none"
}

window.addEventListener('load', () => setAspect())
window.submit = submit
