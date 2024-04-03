// IMPORTS
import * as consts from 'consts'
import * as html from 'html'

// VARS
const levels = consts.levels
var level = levels.STORY

var storyIdLink, levelLabel, cardsContainer, story, actInfoBox, actIdLink, chapterInfoBox, chapterIdLink, sceneInfoBox, sceneIdLink, beatInfoBox, beatIdLink
var editStoryLink, editActLink, editChapterLink, editSceneLink, editBeatLink, storyDescription, actDescription, chapterDescription, sceneDescription, beatDescription
var currentAct = null
var currentChapter = null
var currentScene = null
var currentBeat = null

// FUNCTIONS

const getParentComponent = () => level == levels.BEAT ? currentScene :
    level == levels.SCENE ? currentChapter :
        level == levels.CHAPTER ? currentAct :
            level == levels.ACT ? story : {}


const getCurrentComponent = () => level == levels.BEAT ? currentBeat :
    level == levels.SCENE ? currentScene :
        level == levels.CHAPTER ? currentChapter :
            level == levels.ACT ? currentAct :
                level == levels.STORY ? story : null

// Keep info box closed unless it or its child element is open
const showInfoBoxes = () => {
    beatInfoBox.style.display = level == levels.BEAT ? "inline-block" : "none"
    sceneInfoBox.style.display = level == levels.SCENE || level == levels.BEAT ? "inline-block" : "none"
    chapterInfoBox.style.display = level == levels.CHAPTER || level == levels.SCENE || level == levels.BEAT ? "inline-block" : "none"
    actInfoBox.style.display = level == levels.ACT || level == levels.CHAPTER || level == levels.SCENE || level == levels.BEAT ? "inline-block" : "none"
}

// set HTML attributes based on level change alone (not dependent on contents of lists such as chapters.scenes)
const changeLevel = (newLevel) => {
    level = newLevel
    levelLabel.innerHTML = consts.getChildLevel(level).toUpperCase() + "S"
    cardsContainer.innerHTML = ""
    showInfoBoxes()
}

// Should only be used BY the "loadStory" function
const loadToCurrentLevel = loadLevel => {
    switch (loadLevel) {
        case levels.BEAT:
            currentAct = story.acts.filter(act => act.id == currentAct.id)[0]
            currentChapter = currentAct.chapters.filter(chapter => chapter.id == currentChapter.id)[0]
            currentScene = currentChapter.scenes.filter(scene => scene.id == currentScene.id)[0]
            currentBeat = currentScene.beats.filter(beat => beat.id == currentBeat.id)[0]
            loadBeat(currentBeat.id)
            break;
        case levels.SCENE:
            currentAct = story.acts.filter(act => act.id == currentAct.id)[0]
            currentChapter = currentAct.chapters.filter(chapter => chapter.id == currentChapter.id)[0]
            currentScene = currentChapter.scenes.filter(scene => scene.id == currentScene.id)[0]
            loadScene(currentScene.id)
            break;
        case levels.CHAPTER:
            currentAct = story.acts.filter(act => act.id == currentAct.id)[0]
            currentChapter = currentAct.chapters.filter(chapter => chapter.id == currentChapter.id)[0]
            loadChapter(currentChapter.id)
            break;
        case levels.ACT:
            currentAct = story.acts.filter(act => act.id == currentAct.id)[0]
            loadAct(currentAct.id)
            break;
    }
}


const newComponent = newComponentLevel => {
    const currentComponentId = getCurrentComponent().id
    // trigger the python script
    switch (newComponentLevel) {
        case levels.BEAT:
            pywebview.api.create_beat(currentComponentId).then(beatId => loadStory(level))
            break;
        case levels.SCENE:
            pywebview.api.create_scene(currentComponentId).then(sceneId => loadStory(level))
            break;
        case levels.CHAPTER:
            pywebview.api.create_chapter(currentComponentId).then(chapterId => loadStory(level))
            break;
        case levels.ACT:
            pywebview.api.create_act(currentComponentId).then(actId => loadStory(level))
            break;
        default:
            console.log("didn't match any case.")
    }
}

// Functions to load components. Loads data about the individual component, and also loads a list of its child components.

const loadAct = actId => {
    changeLevel(levels.ACT)
    console.log("loading " + level)
    // get the ACT object from the STORY object // make cards // display everything.
    currentAct = story.acts.filter(act => act.id == actId)[0]
    actIdLink.innerHTML = currentAct.label
    actIdLink.addEventListener("click", () => loadAct(currentAct.id))
    editActLink.setAttribute("href", editComponentLink())
    actDescription.innerHTML = currentAct.description
    // make the cards (HTML elements) and add them to the page
    currentAct.chapters.map(chapter => cardsContainer.appendChild(html.elements.card(
        chapter,
        consts.getChildLevel(level),
        levels))
    )
    cardsContainer.appendChild(html.elements.newComponentButton(consts.getChildLevel(level)))
}

const loadChapter = chapterId => {
    changeLevel(levels.CHAPTER)
    console.log("loading " + level)
    // get the CHAPTER object from the ACT object // make cards // display everything.
    currentChapter = currentAct.chapters.filter(chapter => chapter.id == chapterId)[0]
    chapterIdLink.innerHTML = currentChapter.label
    chapterIdLink.addEventListener("click", () => loadChapter(currentChapter.id))
    editChapterLink.setAttribute("href", editComponentLink())
    chapterDescription.innerHTML = currentChapter.description
    // make the cards (HTML elements) and add them to the page
    currentChapter.scenes.map(scene => cardsContainer.appendChild(html.elements.card(
        scene,
        consts.getChildLevel(level),
        levels))
    )
    cardsContainer.appendChild(html.elements.newComponentButton(consts.getChildLevel(level)))
}

const loadScene = sceneId => {
    changeLevel(levels.SCENE)
    console.log("loading " + level)
    // get the SCENE object from the CHAPTER object // build HTML string // display everything.
    currentScene = currentChapter.scenes.filter(scene => scene.id == sceneId)[0]
    sceneIdLink.innerHTML = currentScene.label
    sceneIdLink.addEventListener("click", () => loadScene(currentScene.id))
    editSceneLink.setAttribute("href", editComponentLink())
    sceneDescription.innerHTML = currentScene.description

    currentScene.beats.map(beat => cardsContainer.appendChild(html.elements.card(
        beat,
        consts.getChildLevel(level),
        levels)))
    cardsContainer.appendChild(html.elements.newComponentButton(consts.getChildLevel(level)))
}

// Beats do not have child components, but we will list value changes instead
const loadBeat = beatId => {
    changeLevel(levels.BEAT)
    console.log("loading " + level)

    // get the SCENE object from the CHAPTER object // build HTML string // display everything.
    currentBeat = currentScene.beats.filter(beat => beat.id == beatId)[0]
    beatIdLink.innerHTML = currentBeat.label
    editBeatLink.setAttribute("href", editComponentLink())
    beatDescription.innerHTML = currentBeat.description
    cardsContainer.innerHTML = "SHOW VALUE CHANGE CARDS HERE"
}

// build a link to the "edit_component.html" page
// with querystring data to specify what must be edited, and where to return.
const editComponentLink = () => {
    let linkString = "edit_subcomponent.html?edit=true&story_id=" + story.id

    // add act
    if (level == levels.ACT || level == levels.CHAPTER || level == levels.SCENE || level == levels.BEAT) {
        linkString += "&act_id=" + currentAct.id
    }

    // add chapter
    if (level == levels.CHAPTER || level == levels.SCENE || level == levels.BEAT) {
        linkString += "&chapter_id=" + currentChapter.id
    }

    // add scene
    if (level == levels.SCENE || level == levels.BEAT) {
        linkString += "&scene_id=" + currentScene.id
    }

    // add beat
    if (level == levels.BEAT) {
        linkString += "&beat_id=" + currentBeat.id
    }

    // add level
    linkString += "&level=" + level
    return linkString
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
    // edit stuff links
    editStoryLink = document.getElementById("editStoryLink")
    editActLink = document.getElementById("editActLink")
    editChapterLink = document.getElementById("editChapterLink")
    editSceneLink = document.getElementById("editSceneLink")
    editBeatLink = document.getElementById("editBeatLink")
    // descriptions
    storyDescription = document.getElementById("storyDescription")
    actDescription = document.getElementById("actDescription")
    chapterDescription = document.getElementById("chapterDescription")
    sceneDescription = document.getElementById("sceneDescription")
    beatDescription = document.getElementById("beatDescription")
}

// Initially load the whole story, even if you're really trying to load another level of component.
const loadStory = (loadLevel = levels.STORY) => {
    console.log("STORY LOADED")
    loadDOM()
    const urlParams = new URLSearchParams(window.location.search)
    // get id from already loaded story, or the querystring
    const storyId = urlParams.get('story_id')

    pywebview.api.get_story_by_id(storyId).then(incomingStory => {
        changeLevel(levels.STORY)
        storyIdLink.innerHTML = storyId
        storyIdLink.addEventListener("click", () => loadStory())

        story = incomingStory
        // Load story objects from one level (currently only ACTs)
        storyIdLink.innerHTML = !!story?.label ? story.label : "NO NAME"
        levelLabel.innerHTML = consts.getChildLevel(level).toUpperCase() + "S"

        // check if we've been sent EXTERNALLY to load a particular component/level
        const loadLevelParam = urlParams.get('level') || false

        if (!!loadLevelParam) {
            loadLevel = loadLevelParam

            const actIdParam = urlParams.get('act_id')
            const chapterIdParam = urlParams.get('chapter_id')
            const sceneIdParam = urlParams.get('scene_id')
            const beatIdParam = urlParams.get('beat_id')

            // load parent data until we reach current level

            if (!!actIdParam) {
                currentAct = getActById(actIdParam)
                loadAct(actIdParam)
            }

            if (!!chapterIdParam) {
                currentChapter = getChapterById(chapterIdParam)
                loadChapter(chapterIdParam)
            }

            if (!!sceneIdParam) {
                currentScene = getSceneById(sceneIdParam)
                loadScene(sceneIdParam)
            }

            if (!!beatIdParam) {
                currentBeat = getBeatById(beatIdParam)
                loadBeat(beatIdParam)
            }
        }

        // regardless of how loadLevel was set, load that level.
        if (loadLevel == levels.STORY) {
            console.log("level is story?")
            // Get the Document Elements for "act" cards
            story.acts.map(act => cardsContainer.appendChild(
                html.elements.card(
                    act,
                    consts.getChildLevel(level),
                    levels
                )))
            cardsContainer.appendChild(html.elements.newComponentButton(consts.getChildLevel(level)))
            storyDescription.innerHTML = story.description
        } else {
            console.log("we will load to certain level?")
            loadToCurrentLevel(loadLevel)
        }
    })
}

const getActById = actId => story.acts.filter(act => act.id == actId)[0]
const getChapterById = chapterId => currentAct.chapters.filter(chapter => chapter.id == chapterId)[0]
const getSceneById = sceneId => currentChapter.scenes.filter(scene => scene.id == sceneId)[0]
const getBeatById = beatId => currentScene.beats.filter(beat => beat.id == beatId)[0]

const editStory = () => window.location = "edit_story.html?edit=true&story_id=" + story.id

// DEBUG FUNCTIONS

const printAllCurrent = () => {
    console.log("curr beat: " + JSON.stringify(currentBeat) || 'NONE')
    console.log("curr scene: " + JSON.stringify(currentScene) || 'NONE')
    console.log("curr chapter: " + JSON.stringify(currentChapter) || 'NONE')
    console.log("curr act: " + JSON.stringify(currentAct) || 'NONE')
    console.log("curr story: " + JSON.stringify(story) || 'NONE')
}


window.addEventListener('pywebviewready', loadStory())

// Make certain functions available to the WINDOW so that they can be called from rendered JS
window.loadBeat = loadBeat
window.loadScene = loadScene
window.loadAct = loadAct
window.loadChapter = loadChapter
window.levels = levels
window.newComponent = newComponent
window.editStory = editStory
