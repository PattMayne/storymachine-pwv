import * as html from 'html'

// loading functions

const loadPanel = () => {
    const storiesListContainer = document.getElementById("storiesListContainer")
    const storyList = html.elements.storyList()
    storiesListContainer.appendChild(storyList)
    pywebview.api.get_stories_list().then(storiesList => storiesList.map(story => storyList.appendChild(html.elements.storyListItem(story))))
}

const createBaseStory = () => pywebview.api.get_base_story().then(baseStory => window.location = "story.html?story_id=" + baseStory.id)

// user input functions

window.addEventListener('pywebviewready', loadPanel())
window.createBaseStory = createBaseStory
