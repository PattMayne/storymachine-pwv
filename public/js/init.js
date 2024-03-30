import * as html from 'html'

var latestStoriesList

// loading functions

const loadPanel = () => {
    latestStoriesList = document.getElementById("latestStoriesList")

    // Still need the timeout apparently.
    setTimeout(() => {
        pywebview.api.get_stories_list().then(storiesList => {
            latestStoriesList.innerHTML = storiesList.reduce(
                (htmlString, story) => htmlString + html.storyListItem(story), "")
        })
    }, 200)
}


// user input functions

function setTextFromPython(theText) {
    document.getElementById("theLink").innerHTML = theText
}


window.onload = () => window.addEventListener('pywebviewready', loadPanel())
window.setTextFromPython = setTextFromPython
