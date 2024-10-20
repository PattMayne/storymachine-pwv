// IMPORTS
import * as consts from 'consts'
import * as html from 'html'

// VARS
const levels = consts.levels
var level = levels.STORY

var storyIdLink, levelLabel, cardsContainer, story, actInfoBox, actIdLink, chapterInfoBox, chapterIdLink, sceneInfoBox, sceneIdLink, beatInfoBox, beatIdLink
var editStoryLink, editActLink, editChapterLink, editSceneLink, editBeatLink, storyDescription, actDescription, chapterDescription, sceneDescription, beatDescription, descriptionButton
var confirmationOverlay, confirmText, confirmButtonYes, loadingOverlay, loadingText, loadingInterval
var newValueButton, newLocationButton, newCharacterButton
var otherObjsBtnsCell
var loadingTimer = 1
var currentAct = null
var currentChapter = null
var currentScene = null
var currentBeat = null
var archiveRequested = false

var pyviewLoaded = false

/**
 * Story always loads a component. Beat, Scene, Chapter, Act, Story.
 * Loaded component is the current component.
 */


// FUNCTIONS

// parent of the current component
const getCurrentParentComponent = () => level == levels.BEAT ? currentScene :
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


const requestArchive = () => {
    // open confirmation notification
    archiveRequested = true
    confirmationOverlay.style.display = "inline-block"
    confirmButtonYes.setAttribute("onclick", "archiveStory()")
}

const archiveStory = () => {
    pywebview.api.archive_story(story.id)
        .then(success =>
            window.location = "init.html")
}


const deleteComponentRequest = (levelToDelete, idToDelete) => {
    confirmationOverlay.style.display = "inline-block"
    const deleteComponentOnclickString = "deleteComponent('" + levelToDelete + "', " + idToDelete + ")"
    confirmButtonYes.setAttribute("onclick", deleteComponentOnclickString)
}

const cancelRequest = () => {
    confirmationOverlay.style.display = "none"
    confirmButtonYes.removeAttribute("onclick")
    archiveRequested = false
}


const deleteComponent = (levelToDelete, idToDelete) => {
    // hide the overlay which contained the confirmation buttons
    confirmationOverlay.style.display = "none"
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

const getParentComponent = (childLevel, childId) => {

    if (childLevel == levels.BEAT) {
        for (let i = 0; i < story.acts.length; i++) {
            for (let k = 0; k < story.acts[i].chapters.length; k++) {
                for (let m = 0; m < story.acts[i].chapters[k].scenes.length; m++) {
                    for (let p = 0; p < story.acts[i].chapters[k].scenes[m].beats.length; p++) {
                        if (childId == story.acts[i].chapters[k].scenes[m].beats[p].id) {
                            return story.acts[i].chapters[k].scenes[m]
                        }
                    }
                }
            }
        }
    } else if (childLevel == levels.SCENE) {
        for (let i = 0; i < story.acts.length; i++) {
            for (let k = 0; k < story.acts[i].chapters.length; k++) {
                for (let m = 0; m < story.acts[i].chapters[k].scenes.length; m++) {
                    if (childId == story.acts[i].chapters[k].scenes[m].id) {
                        return story.acts[i].chapters[k]
                    }
                }
            }
        }
    } else if (childLevel == levels.CHAPTER) {
        for (let i = 0; i < story.acts.length; i++) {
            for (let k = 0; k < story.acts[i].chapters.length; k++) {
                if (childId == story.acts[i].chapters[k].id) {
                    return story.acts[i]
                }
            }
        }
    } else if (childLevel == levels.ACT) {
        return story
    }
}

const shiftComponentRight = (thisLevel, id) => {
    // NOTE: maybe some of this stuff (data) should ALL be saved globally on every load? No need to KEEP checking to get them...
    // const fellowComponents =
    //     level == levels.SCENE ? currentScene.beats :
    //         level == levels.CHAPTER ? currentChapter.scenes :
    //             level == levels.ACT ? currentAct.chapters :
    //                 level == levels.STORY ? story.acts : ""

    // const fellowComponents =
    //     thisLevel == levels.BEAT ? currentScene.beats :
    //         thisLevel == levels.SCENE ? currentChapter.scenes :
    //             thisLevel == levels.CHAPTER ? currentAct.chapters :
    //                 thisLevel == levels.ACT ? story.acts : []


    const parentComponent = getParentComponent(thisLevel, id)
    console.log("Parent Component: " + parentComponent.label)
    const fellowComponents =
        thisLevel == levels.BEAT ? parentComponent.beats :
            thisLevel == levels.SCENE ? parentComponent.scenes :
                thisLevel == levels.CHAPTER ? parentComponent.chapters :
                    thisLevel == levels.ACT ? story.acts : []


    // I THINK the ERROR is from ORDER not being set on some???

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

// Sets/loads current story components into their variables.
// Should only be used BY the "loadStory" function
const setValuesToCurrentLevel = loadLevel => {
    switch (loadLevel) {
        case levels.BEAT:
            currentAct = story.acts.filter(act => act.id == currentAct.id)[0]
            currentChapter = currentAct.chapters.filter(chapter => chapter.id == currentChapter.id)[0]
            currentScene = currentChapter.scenes.filter(scene => scene.id == currentScene.id)[0]
            console.log("currentChapter: " + currentChapter)
            currentBeat = currentScene.beats.filter(beat => beat.id == currentBeat.id)[0]
            loadBeat(currentBeat.id)
            break;
        case levels.SCENE:
            currentAct = story.acts.filter(act => act.id == currentAct.id)[0]
            currentChapter = currentAct.chapters.filter(chapter => chapter.id == currentChapter.id)[0]
            console.log("currentChapter: " + currentChapter)
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
            let actsLength = story.acts.length
            story.acts.map((act, index) => cardsContainer.appendChild(
                html.elements.card(
                    act,
                    consts.getChildLevel(level),
                    !!(index == actsLength - 1)
                )))
            cardsContainer.appendChild(html.elements.newComponentButton(consts.getChildLevel(level)))
            storyDescription.innerHTML = story.description
            break;
    }
}

// Create a new component of the given type
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
            console.error("didn't match any component level")
    }
}

// Functions to load components. Loads data about the individual component, and also loads a list of its child components.

const loadAct = actId => {
    changeLevel(levels.ACT)
    // get the ACT object from the STORY object // make cards // display everything.
    currentAct = getComponent(levels.ACT, actId)
    actIdLink.innerHTML = currentAct.label
    actIdLink.addEventListener("click", () => loadComponent(levels.ACT, currentAct.id))
    editActLink.setAttribute("href", editComponentLink())
    actDescription.innerHTML = currentAct.description
    // make the cards (HTML elements) and add them to the page
    const listLength = currentAct.chapters.length
    currentAct.chapters.map((chapter, index) => {
        cardsContainer.appendChild(html.elements.card(
            chapter,
            consts.getChildLevel(level),
            !!(index == listLength - 1)))
    })
    cardsContainer.appendChild(html.elements.newComponentButton(consts.getChildLevel(level)))
    setNewValueButtonLinks()
}

const loadChapter = chapterId => {
    changeLevel(levels.CHAPTER)
    // get the CHAPTER object // load the parent components // make cards // display everything.
    currentChapter = getComponent(levels.CHAPTER, chapterId)
    currentAct = getParentComponent(levels.CHAPTER, currentChapter.id)
    chapterIdLink.innerHTML = currentChapter.label
    chapterIdLink.addEventListener("click", () => loadComponent(levels.CHAPTER, currentChapter.id))
    editChapterLink.setAttribute("href", editComponentLink())
    chapterDescription.innerHTML = currentChapter.description
    // make the cards (HTML elements) and add them to the page
    const listLength = currentChapter.scenes.length
    currentChapter.scenes.map((scene, index) => cardsContainer.appendChild(html.elements.card(
        scene,
        consts.getChildLevel(level),
        !!(index == listLength - 1)))
    )
    cardsContainer.appendChild(html.elements.newComponentButton(consts.getChildLevel(level)))
    setNewValueButtonLinks()
}

const loadScene = sceneId => {
    changeLevel(levels.SCENE)
    // get the SCENE object // load the parent components // build HTML string // display everything.
    currentScene = getComponent(levels.SCENE, sceneId)
    currentChapter = getParentComponent(levels.SCENE, sceneId)
    currentAct = getParentComponent(levels.CHAPTER, currentChapter.id)
    sceneIdLink.innerHTML = currentScene.label
    sceneIdLink.addEventListener("click", () => loadComponent(levels.SCENE, currentScene.id))
    editSceneLink.setAttribute("href", editComponentLink())
    sceneDescription.innerHTML = currentScene.description

    const listLength = currentScene.beats.length
    currentScene.beats.map((beat, index) => cardsContainer.appendChild(html.elements.card(
        beat,
        consts.getChildLevel(level),
        !!(index == listLength - 1))))
    cardsContainer.appendChild(html.elements.newComponentButton(consts.getChildLevel(level)))
    setNewValueButtonLinks()
}

// Beats do not have child components, but we will list value changes instead
const loadBeat = beatId => {
    changeLevel(levels.BEAT)
    setCurrentComponents(beatId, levels.BEAT)
    // get the BEAT object // load parent components // build HTML string // display everything.
    currentBeat = getComponent(levels.BEAT, beatId)
    currentScene = getParentComponent(levels.BEAT, beatId)
    currentChapter = getParentComponent(levels.SCENE, currentScene.id)
    currentAct = getParentComponent(levels.CHAPTER, currentChapter.id)
    beatIdLink.innerHTML = currentBeat.label
    editBeatLink.setAttribute("href", editComponentLink())
    beatDescription.innerHTML = currentBeat.description

    // get value_changes, list them as cards
    // edit them on this screen? no, that would be crazy

    pywebview.api.get_value_changes_by_beat_id(beatId).then(valueChanges => {
        cardsContainer.innerHTML = ""
        valueChanges.map(valueChange => {
            const callout = document.createElement("div")
            callout.setAttribute("class", "callout")
            callout.innerText = valueChange["label"]
            cardsContainer.appendChild(html.elements.valueChangeCard(
                valueChange,
                story.id,
                getComponentChainLinkAddendum(true)))
        })
        cardsContainer.appendChild(html.elements.newValueChangeButton(beatId))
        setNewValueButtonLinks()
    })
}

/**
 * When loading a new component, we must make its parent components available in their variables.
 * @param {int} newComponentId 
 * @param {consts.levels String} componentLevel 
 */
const setCurrentComponents = (newComponentId, componentLevel) => {

    if (componentLevel == levels.BEAT) {
        story.acts.map(act => act.chapters.map(chapter => chapter.scenes.map(scene => scene.beats.map(beat => {
            if (beat.id == newComponentId) {
                currentBeat = beat
                currentScene = scene
                currentChapter = chapter
                currentAct = act
            }
        }))))
    } else if (componentLevel == levels.SCENE) {
        story.acts.map(act => act.chapters.map(chapter => chapter.scenes.map(scene => {
            if (scene.id == newComponentId) {
                currentBeat = null
                currentScene = scene
                currentChapter = chapter
                currentAct = act
            }
        })))
    } else if (componentLevel == levels.CHAPTER) {
        story.acts.map(act => act.chapters.map(chapter => {
            if (chapter.id == newComponentId) {
                currentBeat = null
                currentScene = null
                currentChapter = chapter
                currentAct = act
            }
        }))
    } else if (componentLevel == levels.ACT) {
        story.acts.map(act => {
            if (act.id == newComponentId) {
                currentBeat = null
                currentScene = null
                currentChapter = null
                currentAct = act
            }
        })
    }
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

// Move to the "create value change" screen (and provide data for a link to return)
const newValueChange = beatId => location.href = "edit_value_object.html?value_object_type=" +
    consts.valueObjects.VALUE_CHANGE + "&story_id=" + story.id + "&beat_id=" + beatId +
    getComponentChainLinkAddendum(true)

// Build the HTML for a div full of buttons. Each button is a link to edit a value object.
const loadExistingValues = storyId => {
    // set the button links later, when the script has loaded the real current level

    const valuesListBox = document.getElementById("valuesListBox")
    const locationsListBox = document.getElementById("locationsListBox")
    const charactersListBox = document.getElementById("charactersListBox")

    // remove existing links (html elements) and add them again
    while (valuesListBox.hasChildNodes()) {
        valuesListBox.removeChild(valuesListBox.firstChild)
    }

    while (locationsListBox.hasChildNodes()) {
        locationsListBox.removeChild(locationsListBox.firstChild)
    }

    while (charactersListBox.hasChildNodes()) {
        charactersListBox.removeChild(charactersListBox.firstChild)
    }


    // Loop through VALUEs and append "edit" link to DIV
    story.values.map(value => {
        valuesListBox.appendChild(html.elements.valueButton(
            storyId,
            value["id"],
            value["label"],
            getComponentChainLinkAddendum(true)))
    })

    // Loop through LOCATIONs and append "edit" link to DIV
    story.locations.map(location => {
        locationsListBox.appendChild(html.elements.locationButton(
            storyId,
            location["id"],
            location["name"],
            getComponentChainLinkAddendum(true)))
    })

    // Loop through CHARACTERs and append "edit" link to DIV
    story.characters.map(character => {
        const concat_name = character["first_name"] + " " + character["last_name"]
        charactersListBox.appendChild(html.elements.characterButton(
            storyId, character["id"],
            concat_name,
            getComponentChainLinkAddendum(true)))
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

    storyIdLink.setAttribute("href", "cards.html?story_id=" + storyId)
    // overlay elements
    confirmationOverlay = document.getElementById("confirmationOverlay")
    confirmationOverlay.style.display = "none"
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

            //console.log("STORY: " + JSON.stringify(story))

            loadExistingValues(storyId)
            let loadId = storyId

            if (loadLevel != levels.STORY) {

                // load parent data until we reach current level
                loadId = loadParentComponents(
                    urlParams.get('beat_id'),
                    urlParams.get('scene_id'),
                    urlParams.get('chapter_id'),
                    urlParams.get('act_id'))
            }

            // regardless of how loadLevel was set, load that level.
            setValuesToCurrentLevel(loadLevel)
            loadExistingValues(story.id)
            hideLoading()
            showAllComponentsForLevelBtns(loadLevel)
            setNewValueButtonLinks()
        })
        // choose loading time
    }, pyviewLoaded ? 10 : 500)
    pyviewLoaded = true
}

/**
 * load parent data until we reach current level
 * return id of component to load
 */
const loadParentComponents = (beatId, sceneId, chapterId, actId) => {

    let loadId = 0

    if (!!actId) {
        currentAct = getActById(actId)
        loadAct(actId)
        loadId = actId
    }

    if (!!chapterId) {
        currentChapter = getChapterById(chapterId)
        loadChapter(chapterId)
        loadId = chapterId
    }

    if (!!sceneId) {
        currentScene = getSceneById(sceneId)
        loadScene(sceneId)
        loadId = sceneId
    }

    if (!!beatId) {
        currentBeat = getBeatById(beatId)
        loadBeat(beatId)
        loadId = beatId
    }

    return loadId
}

/**
 * To create new Value Objects we must load the form (html page) but also
 * provide a link to return to this page in its current state.
 * Info about building the link will be contained in query strings.
 */
const setNewValueButtonLinks = () => {
    const currentComponentId = getCurrentComponent().id

    let loadStringAddendum = getComponentChainLinkAddendum(true)

    // Set the NEW ITEM links for all value object types
    newValueButton.setAttribute("href",
        "edit_value_object.html?value_object_type=value&story_id=" +
        story.id + loadStringAddendum)
    newLocationButton.setAttribute("href",
        "edit_value_object.html?value_object_type=location&story_id=" +
        story.id + loadStringAddendum)
    newCharacterButton.setAttribute("href",
        "edit_value_object.html?value_object_type=character&story_id=" +
        story.id + loadStringAddendum)
}

const getComponentChainLinkAddendum = includePrefix => {
    let loadStringAddendum = !!includePrefix ? getComponentChainLinkPrefix() : ""

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

    // console.log(loadStringAddendum)

    return loadStringAddendum
}

const getComponentChainLinkPrefix = () =>
    "&return_level=" + level + "&return_id=" + getCurrentComponent().id


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
    showAllComponentsForLevelBtns(loadLevel)
    setValuesToCurrentLevel(loadLevel)
    loadExistingValues(story.id)
}

/**
 * For any level (above scene), user should be able to view ALL objects from ANY level below.
 * ex. on story or act you should be able to see a list of all beat objects, without
 * having to drill down to each scene.
 * This function creates those buttons, for either level.
 * @param {String} loadLevel 
 */
const showAllComponentsForLevelBtns = (loadLevel) => {

    // First clear any existing buttons
    while (otherObjsBtnsCell.hasChildNodes()) {
        otherObjsBtnsCell.removeChild(otherObjsBtnsCell.firstChild);
    }

    // Show label of component we're showing
    if (loadLevel != levels.BEAT) {
        const showAllLabel = document.createElement("h6")
        showAllLabel.innerText = "Show All: "
        otherObjsBtnsCell.appendChild(showAllLabel)
    }

    // Add the actual buttons to the container
    if (loadLevel == levels.CHAPTER) {
        otherObjsBtnsCell.appendChild(html.elements.showAllComponentsButton(levels.BEAT))
        otherObjsBtnsCell.appendChild(html.elements.showAllComponentsButton(levels.SCENE))
    } else if (loadLevel == levels.ACT) {
        otherObjsBtnsCell.appendChild(html.elements.showAllComponentsButton(levels.BEAT))
        otherObjsBtnsCell.appendChild(html.elements.showAllComponentsButton(levels.SCENE))
        otherObjsBtnsCell.appendChild(html.elements.showAllComponentsButton(levels.CHAPTER))
    } else if (loadLevel == levels.STORY) {
        otherObjsBtnsCell.appendChild(html.elements.showAllComponentsButton(levels.BEAT))
        otherObjsBtnsCell.appendChild(html.elements.showAllComponentsButton(levels.SCENE))
        otherObjsBtnsCell.appendChild(html.elements.showAllComponentsButton(levels.CHAPTER))
        otherObjsBtnsCell.appendChild(html.elements.showAllComponentsButton(levels.ACT))
    }
}

// Show all records of specified component level, for the current loaded component
const showAllComponents = (levelToShow) => {
    const callingLevel = level
    const callingId = getCurrentComponent().id
    let callingComponent = null


    // refresh story
    pywebview.api.get_story_by_id(story.id).then(incomingStory => {
        // This is a LONG function... break it up!

        story = incomingStory

        // clear the container
        cardsContainer.innerHTML = ""
        levelLabel.innerHTML = levelToShow.toUpperCase() + "S"

        // get the callingComponent from the fresh story

        if (callingLevel == levels.STORY) {
            callingComponent = incomingStory

            if (levelToShow == levels.BEAT) {
                // cycle through acts & chapters & scenes, print labels, cycle through beats and print them
                story.acts.map(act => {
                    cardsContainer.appendChild(html.elements.interLevelLabel(act, levels.ACT))
                    act.chapters.map(chapter => {
                        cardsContainer.appendChild(html.elements.interLevelLabel(chapter, levels.CHAPTER))
                        chapter.scenes.map(scene => {
                            cardsContainer.appendChild(html.elements.interLevelLabel(scene, levels.SCENE))
                            const listLength = scene.beats.length
                            scene.beats.map((beat, index) => cardsContainer.appendChild(html.elements.card(
                                beat,
                                levels.BEAT,
                                !!(index == listLength - 1),
                                true)))
                        })
                    })
                })

            } else if (levelToShow == levels.SCENE) {
                // cycle through chapters, then scenes and print them
                story.acts.map(act => {
                    cardsContainer.appendChild(html.elements.interLevelLabel(act, levels.ACT))
                    act.chapters.map(chapter => {
                        cardsContainer.appendChild(html.elements.interLevelLabel(chapter, levels.CHAPTER))
                        const listLength = chapter.scenes.length
                        chapter.scenes.map((scene, index) => cardsContainer.appendChild(html.elements.card(
                            scene,
                            levels.SCENE,
                            !!(index == listLength - 1),
                            true)))
                    })
                })

            } else if (levelToShow == levels.CHAPTER) {
                story.acts.map(act => {
                    cardsContainer.appendChild(html.elements.interLevelLabel(act, levels.ACT))
                    const listLength = act.chapters.length
                    act.chapters.map((chapter, index) => cardsContainer.appendChild(html.elements.card(
                        chapter,
                        levels.CHAPTER,
                        !!(index == listLength - 1),
                        true)))
                })
            } else if (levelToShow == levels.ACT) {
                loadStory(levels.STORY)
            }


        } else if (callingLevel == levels.ACT) {

            for (let i = 0; i < story.acts.length; i++) {
                const act = story.acts[i]
                if (act.id == callingId) {
                    callingComponent = act

                    // display the requested component cards
                    // store the id from parent components as we cycle through

                    if (levelToShow == levels.BEAT) {
                        // cycle through chapters & scenes, print labels, cycle through beats and print them
                        act.chapters.map(chapter => {
                            cardsContainer.appendChild(html.elements.interLevelLabel(chapter, levels.CHAPTER))
                            chapter.scenes.map(scene => {
                                cardsContainer.appendChild(html.elements.interLevelLabel(scene, levels.SCENE))
                                const listLength = scene.beats.length
                                scene.beats.map((beat, index) => cardsContainer.appendChild(html.elements.card(
                                    beat,
                                    levels.BEAT,
                                    !!(index == listLength - 1),
                                    true)))
                            })
                        })
                    } else if (levelToShow == levels.SCENE) {
                        // cycle through chapters, then scenes and print them
                        act.chapters.map(chapter => {
                            cardsContainer.appendChild(html.elements.interLevelLabel(chapter, levels.CHAPTER))
                            const listLength = chapter.scenes.length
                            chapter.scenes.map((scene, index) => cardsContainer.appendChild(html.elements.card(
                                scene,
                                levels.SCENE,
                                !!(index == listLength - 1),
                                true)))
                        })
                    } else if (levelToShow == levels.CHAPTER) {
                        loadAct(callingId)
                    }

                    break
                }
            }

        } else if (callingLevel == levels.CHAPTER) {

            for (let i = 0; i < incomingStory.acts.length; i++) {
                for (let k = 0; k < incomingStory.acts[i].chapters.length; k++) {
                    const chapter = incomingStory.acts[i].chapters[k]
                    if (chapter.id == callingId) {
                        callingComponent = chapter

                        // NOW do the ACTUAL WORK of printing the requested component cards
                        // from WITHIN the callingComponent

                        if (levelToShow == levels.BEAT) {
                            chapter.scenes.map(scene => {
                                cardsContainer.appendChild(html.elements.interLevelLabel(scene, levels.SCENE))
                                const listLength = scene.beats.length
                                scene.beats.map((beat, index) => cardsContainer.appendChild(html.elements.card(
                                    beat,
                                    levels.BEAT,
                                    !!(index == listLength - 1),
                                    true)))
                            })
                        } else if (levelToShow == levels.SCENE) {
                            loadChapter(callingId)
                        }

                        break
                    }
                }
            }
        }

        // get calling component (current component) from story
        // for each child component,  print label, then check THEIR child components, until we reach levelToShow, and show
    })
}

const getAllComponentsOfLevel = levelToGet => {
    const allActs = story.acts
    if (levelToGet == levels.ACT) {
        return allActs
    }

    const allChapters = []
    allActs.map(act => act.chapters.map(chapter => allChapters.push(chapter)))
    if (levelToGet == levels.CHAPTER) {
        return allChapters
    }

    const allScenes = []
    allChapters.map(chapter => chapter.scenes.map(scene => allScenes.push(scene)))
    if (levelToGet == levels.SCENE) {
        return allScenes
    }

    const allBeats = []
    allScenes.map(scene => scene.beats.map(beat => allBeats.push(beat)))
    if (levelToGet == levels.BEAT) {
        return allBeats
    }

    return []
}

const getComponent = (levelToGet, id) => {
    if (levelToGet == levels.ACT) {
        for (let i = 0; i < story.acts.length; i++) {
            if (story.acts[i].id == id) {
                return story.acts[i]
            }
        }
        return null
    }
    const allPossibleParents = getAllComponentsOfLevel(consts.getParentLevel(levelToGet))
    const childComponentsString = levelToGet + "s"
    for (let i = 0; i < allPossibleParents.length; i++) {
        const possibleParent = allPossibleParents[i]
        for (let k = 0; k < possibleParent[childComponentsString].length; k++) {
            if (possibleParent[childComponentsString][k].id == id) {
                return possibleParent[childComponentsString][k]
            }
        }
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
window.showAllComponents = showAllComponents
window.getAllComponentsOfLevel = getAllComponentsOfLevel
window.getComponent = getComponent
window.requestArchive = requestArchive
window.archiveStory = archiveStory
