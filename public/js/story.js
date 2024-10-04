// IMPORTS
import * as consts from 'consts'
import * as html from 'html'

// VARS
const levels = consts.levels
var level = levels.STORY

var storyIdLink, levelLabel, cardsContainer, story, actInfoBox, actIdLink, chapterInfoBox, chapterIdLink, sceneInfoBox, sceneIdLink, beatInfoBox, beatIdLink
var editStoryLink, editActLink, editChapterLink, editSceneLink, editBeatLink, storyDescription, actDescription, chapterDescription, sceneDescription, beatDescription, descriptionButton
var confirmatioOverlay, confirmText, confirmButtonYes, loadingOverlay, loadingText, loadingInterval
var newValueButton, newLocationButton, newCharacterButton
var otherObjsBtnsCell
var loadingTimer = 1
var currentAct = null
var currentChapter = null
var currentScene = null
var currentBeat = null

var pyviewLoaded = false

/**
 * Story always loads a component. Beat, Scene, Chapter, Act, Story.
 * Loaded component is the current component.
 */


// FUNCTIONS

// parent of the current component
const getParentComponent = () => level == levels.BEAT ? currentScene :
    level == levels.SCENE ? currentChapter :
        level == levels.CHAPTER ? currentAct :
            level == levels.ACT ? story : {}


// current component is the component that is loaded on the page now.
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


const newComponentLeft = (thisLevel, order) => {

    console.log("new " + thisLevel + " incoming")

    switch (thisLevel) {
        case levels.ACT:
            pywebview.api.create_act_at_order(story.id, order)
                .then(success => loadStory(level))
            break;
        case levels.CHAPTER:
            pywebview.api.create_chapter_at_order(currentAct.id, order)
                .then(success => loadStory(level))
            break;
        case levels.SCENE:
            pywebview.api.create_scene_at_order(currentChapter.id, order)
                .then(success => loadStory(level))
            break;
        case levels.BEAT:
            pywebview.api.create_beat_at_order(currentScene.id, order)
                .then(success => loadStory(level))
            break;
    }
}


const deleteComponentRequest = (levelToDelete, idToDelete) => {
    confirmatioOverlay.style.display = "inline-block"
    const deleteComponentOnclickString = "deleteComponent('" + levelToDelete + "', " + idToDelete + ")"
    confirmButtonYes.setAttribute("onclick", deleteComponentOnclickString)
}

const cancelRequest = () => {
    confirmatioOverlay.style.display = "none"
    confirmButtonYes.removeAttribute("onclick")
}


const deleteComponent = (levelToDelete, idToDelete) => {
    // hide the overlay which contained the confirmation buttons
    confirmatioOverlay.style.display = "none"
    console.log("deleting " + levelToDelete + "#" + idToDelete)

    // show dialog asking if you're sure

    switch (levelToDelete) {
        case levels.ACT:
            pywebview.api.delete_act(idToDelete)
                .then(success => loadStory(levels.STORY))
            break;
        case levels.CHAPTER:
            pywebview.api.delete_chapter(idToDelete)
                .then(success => loadStory(levels.ACT))
            break;
        case levels.SCENE:
            pywebview.api.delete_scene(idToDelete)
                .then(success => loadStory(levels.CHAPTER))
            break;
        case levels.BEAT:
            pywebview.api.delete_beat(idToDelete)
                .then(success => loadStory(levels.SCENE))
            break;
    }
}

const shiftComponentRight = (thisLevel, id) => {
    // NOTE: maybe some of this stuff (data) should ALL be saved globally on every load? No need to KEEP checking to get them...
    const fellowComponents =
        level == levels.SCENE ? currentScene.beats :
            level == levels.CHAPTER ? currentChapter.scenes :
                level == levels.ACT ? currentAct.chapters :
                    level == levels.STORY ? story.acts : ""

    const clickedComponent = fellowComponents.filter(component => component.id == id)[0]
    const componentToTheRight = fellowComponents.filter(component => component.order == clickedComponent.order + 1)[0]

    if (level == levels.STORY) {
        switchActOrders(clickedComponent, componentToTheRight)
    } else if (level == levels.ACT) {
        switchChapterOrders(clickedComponent, componentToTheRight)
    } else if (level == levels.CHAPTER) {
        switchSceneOrders(clickedComponent, componentToTheRight)
    } else if (level == levels.SCENE) {
        switchBeatOrders(clickedComponent, componentToTheRight)
    }
}

const switchActOrders = (clickedComponent, componentToTheRight) => {
    pywebview.api.switch_act_order(
        clickedComponent.order,
        componentToTheRight.order,
        clickedComponent.id,
        componentToTheRight.id
    ).then(success => loadStory(level))
}

const switchChapterOrders = (clickedComponent, componentToTheRight) => {
    pywebview.api.switch_chapter_order(
        clickedComponent.order,
        componentToTheRight.order,
        clickedComponent.id,
        componentToTheRight.id
    ).then(success => loadStory(level))
}

const switchSceneOrders = (clickedComponent, componentToTheRight) => {
    pywebview.api.switch_scene_order(
        clickedComponent.order,
        componentToTheRight.order,
        clickedComponent.id,
        componentToTheRight.id
    ).then(success => loadStory(level))
}

const switchBeatOrders = (clickedComponent, componentToTheRight) => {
    pywebview.api.switch_beat_order(
        clickedComponent.order,
        componentToTheRight.order,
        clickedComponent.id,
        componentToTheRight.id
    ).then(success => loadStory(level))
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
        case levels.STORY:
            story.acts.map(act => cardsContainer.appendChild(
                html.elements.card(
                    act,
                    consts.getChildLevel(level),
                    levels
                )))
            cardsContainer.appendChild(html.elements.newComponentButton(consts.getChildLevel(level)))
            storyDescription.innerHTML = story.description
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
    setNewValueButtonLinks()
}

const loadChapter = chapterId => {
    changeLevel(levels.CHAPTER)
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
    setNewValueButtonLinks()
}

const loadScene = sceneId => {
    changeLevel(levels.SCENE)
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
    setNewValueButtonLinks()
}

// Beats do not have child components, but we will list value changes instead
const loadBeat = beatId => {
    changeLevel(levels.BEAT)
    // get the BEAT object from the SCENE object // build HTML string // display everything.
    currentBeat = currentScene.beats.filter(beat => beat.id == beatId)[0]
    beatIdLink.innerHTML = currentBeat.label
    editBeatLink.setAttribute("href", editComponentLink())
    beatDescription.innerHTML = currentBeat.description

    // get value_changes, list them as cards
    // edit them on this screen? no, that would be crazy

    pywebview.api.get_value_changes_by_beat_id(beatId).then(valueChanges => {
        valueChanges.map(valueChange => {
            const callout = document.createElement("div")
            callout.setAttribute("class", "callout")
            callout.innerText = valueChange["label"]
            cardsContainer.appendChild(html.elements.valueChangeCard(valueChange, story.id))
        })
        cardsContainer.appendChild(html.elements.newValueChangeButton(beatId))
        setNewValueButtonLinks()
    })
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

const newValueChange = beatId => {
    location.href = "edit_value_object.html?value_object_type=" + consts.valueObjects.VALUE_CHANGE + "&story_id=" + story.id + "&beat_id=" + beatId
}

// Build the HTML for a div full of buttons. Each button is a link to edit a value object.
const loadExistingValues = storyId => {
    // set the button links later, when the script has loaded the real current level

    const valuesListBox = document.getElementById("valuesListBox")
    const locationsListBox = document.getElementById("locationsListBox")
    const charactersListBox = document.getElementById("charactersListBox")

    // remove existing links (html elements) and add them again
    while (valuesListBox.hasChildNodes()) {
        valuesListBox.removeChild(valuesListBox.firstChild);
    }

    while (locationsListBox.hasChildNodes()) {
        locationsListBox.removeChild(locationsListBox.firstChild);
    }

    while (charactersListBox.hasChildNodes()) {
        charactersListBox.removeChild(charactersListBox.firstChild);
    }


    // Loop through VALUEs and append "edit" link to DIV
    story.values.map(value => {
        valuesListBox.appendChild(html.elements.valueButton(storyId, value["id"], value["label"]))
    })

    // Loop through LOCATIONs and append "edit" link to DIV
    story.locations.map(location => {
        locationsListBox.appendChild(html.elements.locationButton(storyId, location["id"], location["name"]))
    })

    // Loop through CHARACTERs and append "edit" link to DIV
    story.characters.map(character => {
        const concat_name = character["first_name"] + " " + character["last_name"]
        charactersListBox.appendChild(html.elements.characterButton(storyId, character["id"], concat_name))
    })
}


const loadDOM = storyId => {
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
    descriptionButton = document.getElementById("descriptionButton")

    storyIdLink.setAttribute("href", "story.html?story_id=" + storyId)
    // overlay elements
    confirmatioOverlay = document.getElementById("confirmatioOverlay")
    confirmText = document.getElementById("confirmText")
    confirmButtonYes = document.getElementById("confirmButtonYes")
    loadingOverlay = document.getElementById("loadingOverlay")
    loadingText = document.getElementById("loadingText")

    // Value objects
    newValueButton = document.getElementById("new_value_button")
    newLocationButton = document.getElementById("new_location_button")
    newCharacterButton = document.getElementById("new_character_button")

    // Buttons to show  all [component type] for [current component]
    otherObjsBtnsCell = document.getElementById("otherObjsBtnsCell")

    storyDescription.style.visibility = "visible"
}

/**
 * Initially load the whole story, even if you're really trying to load a subcompnent.
 * params: loadLevel (which level of component (act, chapter, etc) are we loading to)
 */
const loadStory = loadLevel => {
    const urlParams = new URLSearchParams(window.location.search)
    /**
     * check if we've been sent EXTERNALLY (from another page) to load a particular component/level
     * or if we've indicated a particular level in the function args (internal call from this page)
     * 
     * args get top priority b/c they're specific to this call (internal to the script)
     * otherwise get it from querystring from page load, which should be overridden by more specific args.
     * default to STORY
     */
    loadLevel = loadLevel || urlParams.get('level') || levels.STORY

    // get id from already loaded story, or the querystring
    // story_id should ALWAYS be in the params (other info optional)
    const storyId = urlParams.get('story_id')
    loadDOM(storyId)

    // pywebview doesn't load immediately, so do a timeout:
    loadLevel == levels.STORY && showLoading()

    setTimeout(() => {
        pywebview.api.get_story_by_id(storyId).then(incomingStory => {
            // treat the level as STORY for now, to load the STORY level
            changeLevel(levels.STORY)
            story = incomingStory
            storyIdLink.innerHTML = !!story?.label ? story.label : "NOT LOADED"
            levelLabel.innerHTML = consts.getChildLevel(level).toUpperCase() + "S"

            console.log("STORY: " + JSON.stringify(story))

            loadExistingValues(storyId)
            let loadId = storyId

            if (loadLevel != levels.STORY) {

                const actIdParam = urlParams.get('act_id')
                const chapterIdParam = urlParams.get('chapter_id')
                const sceneIdParam = urlParams.get('scene_id')
                const beatIdParam = urlParams.get('beat_id')

                // load parent data until we reach current level
                if (!!actIdParam) {
                    currentAct = getActById(actIdParam)
                    loadAct(actIdParam)
                    loadId = actIdParam
                }

                if (!!chapterIdParam) {
                    currentChapter = getChapterById(chapterIdParam)
                    loadChapter(chapterIdParam)
                    loadId = chapterIdParam
                }

                if (!!sceneIdParam) {
                    currentScene = getSceneById(sceneIdParam)
                    loadScene(sceneIdParam)
                    loadId = sceneIdParam
                }

                if (!!beatIdParam) {
                    currentBeat = getBeatById(beatIdParam)
                    loadBeat(beatIdParam)
                    loadId = beatIdParam
                }
            }

            // regardless of how loadLevel was set, load that level.
            loadToCurrentLevel(loadLevel)
            showAllComponentsForLevelBtns(loadLevel, loadId)
            hideLoading()
        })
        // choose loading time
    }, pyviewLoaded ? 10 : 500)
    pyviewLoaded = true
}

/**
 * To create new Value Objects we must load the form (html page) but also
 * provide a link to return to this page in its current state.
 * Info about building the link will be contained in query strings.
 */
const setNewValueButtonLinks = () => {
    const currentComponentId = getCurrentComponent().id

    let loadStringAddendum = ""

    if (level == levels.ACT || level == levels.CHAPTER || level == levels.SCENE || level == levels.BEAT) {
        loadStringAddendum += "&return_act_id=" + currentAct.id
    }

    if (level == levels.CHAPTER || level == levels.SCENE || level == levels.BEAT) {
        loadStringAddendum += "&return_chapter_id=" + currentChapter.id
    }

    if (level == levels.SCENE || level == levels.BEAT) {
        loadStringAddendum += "&return_scene_id=" + currentScene.id
    }

    if (level == levels.BEAT) {
        loadStringAddendum += "&return_beat_id=" + currentBeat.id
    }

    // Set the NEW ITEM links for all value object types
    newValueButton.setAttribute("href",
        "edit_value_object.html?value_object_type=value&story_id=" +
        story.id + "&return_level=" + level + "&return_id=" +
        currentComponentId + loadStringAddendum)
    newLocationButton.setAttribute("href",
        "edit_value_object.html?value_object_type=location&story_id=" +
        story.id + "&return_level=" + level + "&return_id=" +
        currentComponentId + loadStringAddendum)
    newCharacterButton.setAttribute("href",
        "edit_value_object.html?value_object_type=character&story_id=" +
        story.id + "&return_level=" + level + "&return_id=" +
        currentComponentId + loadStringAddendum)
}

const getActById = actId => story.acts.filter(act => act.id == actId)[0]
const getChapterById = chapterId => currentAct.chapters.filter(chapter => chapter.id == chapterId)[0]
const getSceneById = sceneId => currentChapter.scenes.filter(scene => scene.id == sceneId)[0]
const getBeatById = beatId => currentScene.beats.filter(beat => beat.id == beatId)[0]

const editStory = () => window.location = "edit_story.html?edit=true&story_id=" + story.id

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
    !!loadingInterval && clearInterval(loadingInterval)
    loadingOverlay.style.display = "none"
}


const toggleDescription = () => {
    if (storyDescription.style.display == "none") {
        descriptionButton.innerHTML = "[&minus;]"
        storyDescription.style.display = ""
    } else {
        descriptionButton.innerHTML = "[&plus;]"
        storyDescription.style.display = "none"
    }
}


// DEBUG FUNCTIONS

const printAllCurrent = () => {
    console.log("level: " + level)
    console.log("curr beat: " + JSON.stringify(currentBeat) || 'NONE')
    console.log("curr scene: " + JSON.stringify(currentScene) || 'NONE')
    console.log("curr chapter: " + JSON.stringify(currentChapter) || 'NONE')
    console.log("curr act: " + JSON.stringify(currentAct) || 'NONE')
    console.log("curr story: " + JSON.stringify(story) || 'NONE')
}

window.addEventListener('pywebviewready', loadStory())

// Only for loading AFTER page load, from user input
const loadComponent = (loadLevel, loadId) => {
    loadId = parseInt(loadId)
    loadLevel == levels.ACT && loadAct(loadId) ||
        loadLevel == levels.CHAPTER && loadChapter(loadId) ||
        loadLevel == levels.SCENE && loadScene(loadId) ||
        loadLevel == levels.BEAT && loadBeat(loadId) || ""

    // now load the "show all x for y" buttons
    showAllComponentsForLevelBtns(loadLevel, loadId)
}

const showAllComponentsForLevelBtns = (loadLevel, loadId) => {

    while (otherObjsBtnsCell.hasChildNodes()) {
        otherObjsBtnsCell.removeChild(otherObjsBtnsCell.firstChild);
    }

    // Show label
    if (loadLevel != levels.BEAT) {
        const showAllLabel = document.createElement("h4")
        showAllLabel.innerText = "Show All: "
        otherObjsBtnsCell.appendChild(showAllLabel)
    }

    // IF BEAT DO NOTHING

    // IF SCENE show all beats

    // IF CHAPTER show all beats & scenes

    // IF ACT show all beats & scenes & chapters

    // IF STORY show all beats & scenes & chapters & acts

    // DUMB BUTTONS CREATED
    // NOW I MUST give them FUNCTIONS to actually load the cards.
    // And also PARENT object ids to load THEIR place in the stack.

    // MOVE BUTTON CREATION TO html.js

    if (loadLevel == levels.SCENE) {
        const beatButton = document.createElement("a")
        beatButton.setAttribute("class", "button small white_button")
        beatButton.innerText = "BEATS"

        otherObjsBtnsCell.appendChild(beatButton)
    } else if (loadLevel == levels.CHAPTER) {

        const beatButton = document.createElement("a")
        beatButton.setAttribute("class", "button small white_button")
        beatButton.innerText = "BEATS"

        const sceneButton = document.createElement("a")
        sceneButton.setAttribute("class", "button small white_button")
        sceneButton.innerText = "SCENES"

        otherObjsBtnsCell.appendChild(beatButton)
        otherObjsBtnsCell.appendChild(sceneButton)
    } else if (loadLevel == levels.ACT) {

        const beatButton = document.createElement("a")
        beatButton.setAttribute("class", "button small white_button")
        beatButton.innerText = "BEATS"

        const sceneButton = document.createElement("a")
        sceneButton.setAttribute("class", "button small white_button")
        sceneButton.innerText = "SCENES"

        const chapterButton = document.createElement("a")
        chapterButton.setAttribute("class", "button small white_button")
        chapterButton.innerText = "CHAPTERS"

        otherObjsBtnsCell.appendChild(beatButton)
        otherObjsBtnsCell.appendChild(sceneButton)
        otherObjsBtnsCell.appendChild(chapterButton)
    } else if (loadLevel == levels.STORY) {

        const beatButton = document.createElement("a")
        beatButton.setAttribute("class", "button small white_button")
        beatButton.innerText = "BEATS"

        const sceneButton = document.createElement("a")
        sceneButton.setAttribute("class", "button small white_button")
        sceneButton.innerText = "SCENES"

        const chapterButton = document.createElement("a")
        chapterButton.setAttribute("class", "button small white_button")
        chapterButton.innerText = "CHAPTERS"

        const actButton = document.createElement("a")
        actButton.setAttribute("class", "button small white_button")
        actButton.innerText = "ACTS"

        otherObjsBtnsCell.appendChild(beatButton)
        otherObjsBtnsCell.appendChild(sceneButton)
        otherObjsBtnsCell.appendChild(chapterButton)
        otherObjsBtnsCell.appendChild(actButton)
    }
}

// Make certain functions available to the WINDOW so that they can be called from JS
window.loadComponent = loadComponent
window.levels = levels
window.newComponent = newComponent
window.editStory = editStory
window.newComponentLeft = newComponentLeft
window.shiftComponentRight = shiftComponentRight
window.deleteComponentRequest = deleteComponentRequest
window.cancelRequest = cancelRequest
window.deleteComponent = deleteComponent
window.toggleDescription = toggleDescription
window.newValueChange = newValueChange
