// IMPORTS
import * as consts from 'consts'

// aspect is either creating a new story or editing an existing one
const aspects = {
    EDIT: 'edit',
    NEW: 'new'
}
var labelElement
var descriptionElement
var pageTitle

var story = null
var aspect = null
var notificationWrapper, notificationCallout, notificationParagraph
var goAfterNotify = null

const setAspect = () => {
    // discover the purpose of this visit
    const urlParams = new URLSearchParams(window.location.search)
    aspect = urlParams.get('edit') ? aspects.EDIT : aspects.NEW

    labelElement = document.getElementById("label")
    descriptionElement = document.getElementById("description")
    pageTitle = document.getElementById("pageTitle")
    notificationWrapper = document.getElementById("notif-wrap-1")
    notificationCallout = document.getElementById("notif-call-1")
    notificationParagraph = document.getElementById("notif-text-1")

    notificationWrapper.style.display = "none"
    notificationCallout.style.display = "none"

    // if EDIT, get the story and populate from that object
    // else, populate fields with boilerplate stuff
    if (aspect == aspects.EDIT) {
        pageTitle.innerText = "EDIT STORY"
        const storyId = urlParams.get('story_id') || 0

        setTimeout(() => {
            // webview... get story
            pywebview.api.get_story_by_id(storyId).then(incomingStory => {
                story = incomingStory
                // Load story data into fields
                labelElement.value = story.label
                descriptionElement.innerText = story.description
            })
        }, 500)


    } else {
        pageTitle.innerText = "NEW STORY"
        console.log("we are NOT editing")
    }
}

// open(set)/close popup notificaiton

const openNotification = notificationText => {
    console.log("Opened notification?")
    notificationWrapper.style.display = ""
    notificationCallout.style.display = ""
    notificationParagraph.innerText = notificationText
}

const closeNotification = () => {
    notificationWrapper.style.display = "none"
    notificationCallout.style.display = "none"

    if (!!goAfterNotify) {
        window.location = goAfterNotify
    }
}

const submit = () => {
    if (!!labelElement.value) {
        aspect == aspects.EDIT ? updateStory() : createStory()
    } else {
        // ERROR
        openNotification("Please enter a name/label")
    }
}

const returnURL = () => aspect == aspects.EDIT ? "cards.html?story_id=" + story.id : "init.html"

const goBack = () => location.href = returnURL()

const createStory = () => {
    const label = labelElement.value
    const description = descriptionElement.value
    pywebview.api.create_empty_story(label, description).then(newStoryId => {
        goAfterNotify = "cards.html?story_id=" + newStoryId
        openNotification("Story created")
    })
}

const updateStory = () => {
    const label = labelElement.value
    const description = descriptionElement.value
    pywebview.api.update_story(story.id, label, description).then(success => {
        if (success) {
            goAfterNotify = "cards.html?story_id=" + story.id
            openNotification("Story saved")
        } else {
            console.log('failed to update story')
            alert("ERROR")
        }
    })
}

window.addEventListener('pywebviewready', setAspect())
window.submit = submit
window.goBack = goBack
window.closeNotification = closeNotification
