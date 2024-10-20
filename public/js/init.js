import * as html from 'html'

var confirmationOverlay
var storyIdToDelete = 0

// loading functions

const loadPanel = () => {
    confirmationOverlay = document.getElementById("confirmationOverlay")
    confirmationOverlay.style.display = "none"
    setTimeout(() => {
        const storiesListContainer = document.getElementById("storiesListContainer")
        const archiveListContainer = document.getElementById("archiveListContainer")
        const storyList = html.elements.storyList()
        const archiveList = html.elements.archiveList()
        storiesListContainer.appendChild(storyList)
        archiveListContainer.appendChild(archiveList)
        pywebview.api.get_stories_list().then(storiesList =>
            storiesList.map(story => {
                const list = story.archived == 0 ? storyList : archiveList
                list.appendChild(html.elements.storyListItem(story, !!story.archived))
            })
        )
    }, 250)
}

const loadStory = storyId =>
    pywebview.api.unarchive_story(storyId).then(() => window.location = "cards.html?story_id=" + storyId)


const createBaseStory = () =>
    pywebview.api.get_base_story().then(baseStory => window.location = "cards.html?story_id=" + baseStory.id)

const requestDelete = storyId => {
    storyIdToDelete = storyId
    confirmationOverlay.style.display = ""
}

const deleteStory = () => {
    // first seek confirmation
    // then delete "storyIdToDelete" and give notification
    // then refresh page
    pywebview.api.delete_story(storyIdToDelete).then(() => {
        storyIdToDelete = 0
        confirmationOverlay.style.display = "none"
    })
}

const cancelRequest = () => {
    confirmationOverlay.style.display = "none"
    storyIdToDelete = 0
}

// user input functions

window.addEventListener('pywebviewready', loadPanel())
window.createBaseStory = createBaseStory
window.loadStory = loadStory
window.requestDelete = requestDelete
window.deleteStory = deleteStory
window.cancelRequest = cancelRequest
