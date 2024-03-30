// IMPORTS
import * as consts from 'consts'
import * as html from 'html'

// VARS
const levels = consts.levels
var level = levels.STORY

var storyIdLink, levelLabel, cardsContainer, story, actInfoBox, actIdLink, chapterInfoBox, chapterIdLink, sceneInfoBox, sceneIdLink, beatInfoBox, beatIdLink
var currentAct = null
var currentChapter = null
var currentScene = null
var currentBeat = null


// FUNCTIONS

// Keep info box closed unless it or its child element is open
const showInfoBoxes = () => {
    beatInfoBox.style.display = level == levels.BEAT ? "inline-block" : "none"
    sceneInfoBox.style.display = level == levels.SCENE || level == levels.BEAT ? "inline-block" : "none"
    chapterInfoBox.style.display = level == levels.CHAPTER || level == levels.SCENE || level == levels.BEAT ? "inline-block" : "none"
    actInfoBox.style.display = level == levels.ACT || level == levels.CHAPTER || level == levels.SCENE || level == levels.BEAT ? "inline-block" : "none"
}


// LOADING FUNCTIONS

const loadAct = actId => {
    level = levels.ACT
    // get the ACT object from the STORY object // build HTML string // display everything.
    currentAct = story.acts.filter(act => act.id == actId)[0]
    const chaptersCardsHTML = currentAct.chapters.reduce((htmlString, chapter) => htmlString + html.chapter(chapter), "")
    showInfoBoxes()
    actIdLink.innerHTML = currentAct.label
    levelLabel.innerHTML = consts.getChildLevel(level).toUpperCase() + "S"
    cardsContainer.innerHTML = chaptersCardsHTML
}

const loadChapter = chapterId => {
    console.log('CHAPTER LOADED')

    level = levels.CHAPTER
    // get the CHAPTER object from the ACT object // build HTML string // display everything.
    currentChapter = currentAct.chapters.filter(chapter => chapter.id == chapterId)[0]
    console.log("Scenes length: " + currentChapter.scenes.length)
    const scenesCardsHTML = currentChapter.scenes.reduce((htmlString, scene) => htmlString + html.scene(scene), "")
    showInfoBoxes()
    chapterIdLink.innerHTML = currentChapter.label
    levelLabel.innerHTML = consts.getChildLevel(level).toUpperCase() + "S"
    cardsContainer.innerHTML = scenesCardsHTML
    console.log("chapterCardHTML: " + scenesCardsHTML)
}

const loadScene = sceneId => {
    console.log("SCENE LOADED")

    level = levels.SCENE
    // get the SCENE object from the CHAPTER object // build HTML string // display everything.
    currentScene = currentChapter.scenes.filter(scene => scene.id == sceneId)[0]
    console.log("beats length: " + currentScene.beats.length)
    const beatsCardsHTML = currentScene.beats.reduce((htmlString, beat) => htmlString + html.beat(beat), "")
    showInfoBoxes()
    sceneIdLink.innerHTML = currentScene.label
    levelLabel.innerHTML = consts.getChildLevel(level).toUpperCase() + "S"
    cardsContainer.innerHTML = beatsCardsHTML
    console.log("chapterCardHTML: " + beatsCardsHTML)
}

const loadDOM = () => {
    storyIdLink = document.getElementById("storyIdLink")
    levelLabel = document.getElementById("levelLabel")
    cardsContainer = document.getElementById("cardsContainer")
    actInfoBox = document.getElementById("actInfoBox")
    actIdLink = document.getElementById("actIdLink")
    chapterInfoBox = document.getElementById("chapterInfoBox")
    chapterIdLink = document.getElementById("chapterIdLink")
    sceneInfoBox = document.getElementById("sceneInfoBox")
    sceneIdLink = document.getElementById("sceneIdLink")
    beatInfoBox = document.getElementById("beatInfoBox")
    beatIdLink = document.getElementById("beatIdLink")
}

// Initially load the whole story, even if you're really trying to load another level of component.
const loadStory = () => {
    loadDOM()
    level = levels.STORY
    const urlParams = new URLSearchParams(window.location.search)
    const storyId = urlParams.get('story_id') || -1
    storyIdLink.innerHTML = storyId

    pywebview.api.get_story_by_id(storyId).then(incomingStory => {
        story = incomingStory
        // Load story objects from one level (currently only ACTs)
        storyIdLink.innerHTML = !!story?.label ? story.label : "NO NAME"

        // Get the HTML of the ACTS objects to display, and render that HTML
        const actCardsHTML = story.acts.reduce((htmlString, act) => htmlString += html.act(act), "")
        levelLabel.innerHTML = consts.getChildLevel(level).toUpperCase() + "S"
        cardsContainer.innerHTML = actCardsHTML
        console.log(JSON.stringify(story))
    })
}

window.onload = () => window.addEventListener('pywebviewready', loadStory())

/**
 * NOTE:
 * Clicking on a link on the HTML, which calls a function here, can immediately update the "Story Objects" section.
 * So I can change between Acts / Chapters / Scenes / Beats without calling the Python API.
 */

// Make certain functions available to the WINDOW so that they can be called from rendered JS

window.loadScene = loadScene
window.loadAct = loadAct
window.loadChapter = loadChapter
window.levels = levels
