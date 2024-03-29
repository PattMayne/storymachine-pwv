$(document).foundation()

var theStory = { loaded: false }

const theClick = () => pywebview.api.get_base_story().then(value => {
    stringValue = JSON.stringify(value)
    document.getElementById("theLink").innerHTML = stringValue
})


function setTextFromPython(theText) {
    document.getElementById("theLink").innerHTML = theText
}

