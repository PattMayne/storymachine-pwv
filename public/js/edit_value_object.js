// IMPORTS
import * as consts from 'consts'
import * as html from 'html'

const valueObjects = consts.valueObjects
const levels = consts.levels
var storyId
var beatId
// aspect is either creating a new story or editing an existing one
const aspects = {
    EDIT: 'edit',
    NEW: 'new'
}

const RELOAD = "reload"
var goBackAfterNotify = false
var postNotifyURL = ""

var level = null

var labelElement
var descriptionElement
var pageTitleElement

var returnLevel, returnId, returnBeatId, returnActId, returnSceneId, returnChapterId

var valueObjectType = null
var valueObjectId = null
var aspect = null

// overlays
var loadingOverlay, loadingText, loadingInterval
var loadingTimer = 0

// document elements

var value_cell, value_change_cell, character_cell, location_cell, char_relations_cell
var valueDescription, valueLabel, valueNotes
var charFirstName, charLastName, charDescription, charNotes
var locationName, locationDescription, locationNotes
var valueChangeDescription, valueChangeLabel, valueChangeNotes, valueChangeMag
var submitCharacterBtn, submitValueChangeBtn, submitLocationBtn
var notificationWrapper, notificationCallout, notificationParagraph
var valueChangesGrid
var deleteValueButton, deleteValueChangeButton, deleteCharacterButton, deleteLocationButton



const setValueChangeButtonText = () => submitValueChangeBtn.value = aspect == aspects.EDIT ? "Update" : "Create"

// create the string for the URL of the location/page to return to upon clicking the "back" button
// Info must have been sent in on page load
const returnURL = () => {
    let returnString = "cards.html?story_id=" + storyId

    if (!!returnId && !!returnLevel) {
        returnString += "&level=" + returnLevel +
            "&" + returnLevel + "_id=" + returnId

        // so cards.html can load all the intervening levels
        !!returnActId && (returnString += "&act_id=" + returnActId)
        !!returnChapterId && (returnString += "&chapter_id=" + returnChapterId)
        !!returnSceneId && (returnString += "&scene_id=" + returnSceneId)
        !!returnBeatId && (returnString += "&beat_id=" + returnBeatId)
    }
    return returnString
}


const goBack = () => location.href = returnURL()


// EDIT and CREATE are the two aspects of this page.
const setAspect = () => {
    loadDOM()
    showLoading()

    // discover the purpose of this visit
    const urlParams = new URLSearchParams(window.location.search)
    changeAspect(!!urlParams.get('edit') ? aspects.EDIT : aspects.NEW)
    storyId = urlParams.get('story_id') || 0
    beatId = urlParams.get('beat_id') || urlParams.get('return_beat_id') || 0

    returnLevel = urlParams.get('return_level') || 0
    returnId = urlParams.get('return_id') || 0
    returnActId = urlParams.get('return_act_id') || 0
    returnChapterId = urlParams.get('return_chapter_id') || 0
    returnSceneId = urlParams.get('return_scene_id') || 0
    returnBeatId = urlParams.get('return_beat_id') || 0

    valueObjectType = urlParams.get('value_object_type') || 0
    valueObjectId = urlParams.get('value_object_id') || 0

    labelElement = document.getElementById("label")
    descriptionElement = document.getElementById("description")
    pageTitleElement = document.getElementById("pageTitle")
    pageTitleElement.innerHTML = (aspect == aspects.EDIT ? "EDIT " : "NEW ") + capitalizeAndStripUnderscores(valueObjectType)

    locationName = document.getElementById("locationName")
    locationDescription = document.getElementById("locationDescription")
    locationNotes = document.getElementById("locationNotes")

    valueDescription = document.getElementById("valueDescription")
    valueLabel = document.getElementById("valueLabel")
    valueNotes = document.getElementById("valueNotes")

    valueChangeDescription = document.getElementById("valueChangeDescription")
    valueChangeLabel = document.getElementById("valueChangeLabel")
    valueChangeNotes = document.getElementById("valueChangeNotes")
    valueChangeMag = document.getElementById("valueChangeMag")

    charFirstName = document.getElementById("charFirstName")
    charLastName = document.getElementById("charLastName")
    charDescription = document.getElementById("charDescription")
    charNotes = document.getElementById("charNotes")

    value_cell = document.getElementById("value_cell")
    value_change_cell = document.getElementById("value_change_cell")
    character_cell = document.getElementById("character_cell")
    location_cell = document.getElementById("location_cell")
    char_relations_cell = document.getElementById("char_relations_cell")

    submitCharacterBtn = document.getElementById("submitCharacterBtn")
    submitValueChangeBtn = document.getElementById("submitValueChangeBtn")
    submitLocationBtn = document.getElementById("submitLocationBtn")

    valueChangesGrid = document.getElementById("value_changes_grid")

    notificationWrapper = document.getElementById("notif-wrap-1")
    notificationCallout = document.getElementById("notif-call-1")
    notificationParagraph = document.getElementById("notif-text-1")

    hideAllCells()

    setTimeout(() => {
        // if purpose of visit EDIT, get the valueObjectType and populate from that object
        // else, populate fields with boilerplate stuff for the NEW subcomponent
        if (aspect == aspects.EDIT) {
            // get the value object and populate the fields.
            //const value = get_value_by_id

            console.log(valueObjectType)

            valueObjectType == valueObjects.VALUE ? editValue() :
                valueObjectType == valueObjects.VALUE_CHANGE ? editValueChange() :
                    valueObjectType == valueObjects.CHARACTER ? editCharacter() :
                        valueObjectType == valueObjects.LOCATION ? editLocation() : null

            deleteValueButton.style.display = ""
            deleteValueChangeButton.style.display = ""
            deleteCharacterButton.style.display = ""
            deleteLocationButton.style.display = ""
        } else {
            console.log("we are NOT editing")
            console.log("valueObjectType: " + valueObjectType)

            valueObjectType == valueObjects.VALUE ? newValue() :
                valueObjectType == valueObjects.VALUE_CHANGE ? newValueChange() :
                    valueObjectType == valueObjects.CHARACTER ? newCharacter() :
                        valueObjectType == valueObjects.LOCATION ? newLocation() : null

            deleteValueButton.style.display = "none"
            deleteValueChangeButton.style.display = "none"
            deleteCharacterButton.style.display = "none"
            deleteLocationButton.style.display = "none"

        }
        hideLoading()
    }, 400)
}

// unhide the cell
const newValue = () => {
    value_cell.style.display = ''
}

// unhide the cell
const newCharacter = () => {
    character_cell.style.display = ''
}

// unhide the cell
const newLocation = () => {
    location_cell.style.display = ''
}

// Load "new value change" controls
const newValueChange = () => {
    // We need ALL the values to choose which one to change
    pywebview.api.get_values().then(values => {
        let selectBox = document.getElementById("valueToChange")

        // add each value to the select box
        values.map(value => {
            let newOption = document.createElement("option")
            newOption.value = value["id"]
            newOption.innerText = value["label"]
            selectBox.appendChild(newOption)
            // TO DO: Check to see if this beat already changed this value
        })

        // do this last, when everything is loaded
        setValueChangeButtonText()
        value_change_cell.style.display = ''
    })
}


// load value for editing
const editValueChange = () => pywebview.api.get_value_change_by_id(valueObjectId).then(valueChange => {

    valueChangeDescription.value = valueChange["description"]
    valueChangeLabel.value = valueChange["label"]
    valueChangeNotes.value = valueChange["notes"]
    valueChangeMag.value = parseInt(valueChange["magnitude"])

    // reset value list for post-creation edit
    let selectBox = document.getElementById("valueToChange")

    if (!selectBox.hasChildNodes() || true) {
        // We need ALL the values to choose which one to change
        pywebview.api.get_values().then(values => {

            // add each value to the select box
            values.map(value => {
                let newOption = document.createElement("option")
                newOption.value = value["id"]
                newOption.innerText = value["label"]
                selectBox.appendChild(newOption)
                // TO DO: Check to see if this beat already changed this value
            })

            value_change_cell.style.display = ''
            selectBox.value = valueChange["value_id"]
        })
    }

    setValueChangeButtonText()
})


const editValue = () => pywebview.api.get_value_by_id(valueObjectId).then(value => {
    // TO DO:
    //  THE VALUE should ALREADY COME WITH a list of character relations (just the IDs of the characters)
    // Then I won't have to do a NEW call to get the relations objects. They'll be included in the value object.
    // Maybe characters should also carry references (ids) to their related values too?
    // In each case they should be tuples, also storing alignment (true/false)
    value_cell.style.display = ''
    valueDescription.value = value["description"]
    valueLabel.value = value["label"]
    valueNotes.value = value["notes"]

    // We need ALL the characters for the "character relationships" panel.
    pywebview.api.get_characters().then(characters => {
        char_relations_cell.style.display = ''
        let selectBox = document.getElementById("charactersToRelate")
        let relatedCharsBox = document.getElementById("relatedCharactersBox")

        // separate characters WITH relationship from characters with NONE.

        let relatedCharacters = []
        let nonRelatedCharacters = []

        // use character.map() instead
        for (let i = 0; i < characters.length; i++) {
            let isRelated = false
            value["character_values"].map(characterValue => {
                if (characters[i]["id"] == characterValue["character_id"]) {
                    characters[i]["character_value"] = characterValue
                    isRelated = true
                }
            })

            !!isRelated ? relatedCharacters.push(characters[i]) : nonRelatedCharacters.push(characters[i])
        }

        // Putting non-related characters in the dropdown.
        nonRelatedCharacters.map(character => {
            let newOption = document.createElement("option")
            newOption.value = character["id"]
            newOption.innerText = character["first_name"]
            selectBox.appendChild(newOption)
        })

        // Listing related characters in a chart.
        relatedCharacters.map(character => {
            relatedCharsBox.appendChild(html.elements.characterValueItemCharacter(character))
        })

        // Populate the "value changes" container
        pywebview.api.get_value_changes_by_value_id(valueObjectId).then(valueChanges => {
            valueChanges.map(valueChange => {
                const valueChangeCell = document.createElement("div")
                const valueChangeCallout = document.createElement("div")
                const valueChangeTitle = document.createElement("h6")
                const valueChangeMagnitude = document.createElement("p")

                valueChangeTitle.innerText = valueChange.label
                valueChangeMagnitude.innerText = "Magnitude: " + valueChange.magnitude

                valueChangeCell.setAttribute("class", "large-3 medium-3 small-2 cell")
                valueChangeCallout.setAttribute("class", "callout")

                valueChangeCallout.appendChild(valueChangeTitle)
                valueChangeCallout.appendChild(valueChangeMagnitude)

                valueChangeCell.appendChild(valueChangeCallout)
                valueChangesGrid.appendChild(valueChangeCell)
            })
        })
    })
})

// load character for editing
const editCharacter = () => pywebview.api.get_character_by_id(valueObjectId).then(character => {
    character_cell.style.display = ''

    charDescription.value = character["description"]
    charFirstName.value = character["first_name"]
    charLastName.value = character["last_name"]
    charNotes.value = character["notes"]

    openValueRelationsCell(character)
})

const openValueRelationsCell = character => {
    // We need ALL the values for the "character relationships" panel.
    pywebview.api.get_values().then(values => {
        value_relations_cell.style.display = ''
        let selectBox = document.getElementById("valuesToRelate")
        let relatedValuesBox = document.getElementById("relatedValuesBox")

        // separate values WITH relationship from values with NONE.

        let relatedValues = []
        let nonRelatedValues = []

        for (let i = 0; i < values.length; i++) {
            let isRelated = false
            character["character_values"].map(characterValue => {
                if (values[i]["id"] == characterValue["value_id"]) {
                    values[i]["character_value"] = characterValue
                    isRelated = true
                }
            })

            !!isRelated ? relatedValues.push(values[i]) : nonRelatedValues.push(values[i])
        }

        // Putting non-related values in the dropdown.
        nonRelatedValues.map(value => {
            let newOption = document.createElement("option")
            newOption.value = value["id"]
            newOption.innerText = value["label"]
            selectBox.appendChild(newOption)
        })

        // Listing related values in a chart.
        relatedValues.map(value => {
            relatedValuesBox.appendChild(html.elements.characterValueItemValue(value))
        })
    })
}


// load location for editing
const editLocation = () => pywebview.api.get_location_by_id(valueObjectId).then(location => {
    location_cell.style.display = ''
    locationDescription.value = location["description"]
    locationName.value = location["name"]
    locationNotes.value = location["notes"]
})

// same function for updating as for creating a new value object
const submit = () => aspect == aspects.EDIT ? updateValueObject() : createValueObject()

const deleteCharacterValue = characterValueId => pywebview.api.delete_character_value(characterValueId).then(count => {
    console.log("Deleted " + count)
    !!count && location.reload()
})

const invertAlignment = characterValueId => pywebview.api.switch_character_value_alignment(characterValueId).then(() => {
    location.reload()
})

// Find out which value object type we're using, and create one
const createValueObject = () => {
    // VALUE object
    if (valueObjectType == valueObjects.VALUE) {
        const description = valueDescription.value
        const label = valueLabel.value
        const notes = valueNotes.value

        if (!label) {
            valueLabel.focus()
            openNotification("Please enter a name or label")
            return
        }

        pywebview.api.create_value(storyId, label, description, notes).then(newValueId => {
            if (!!newValueId) {
                // Change the aspect to EDIT, set the ID
                valueObjectId = newValueId
                changeAspect(aspects.EDIT)
                postNotifyURL = "edit_value_object.html?value_object_type=" + valueObjectType
                    + "&value_object_id=" + newValueId
                    + "&edit=true" + "&story_id=" + storyId
                openNotification("Value Created")
                if (!!pageTitleElement) {
                    pageTitleElement.innerHTML = "EDIT " + capitalizeAndStripUnderscores(valueObjectType)
                }
            } else {
                // TODO: Give notice of failure
            }
        })
    } else if (valueObjectType == valueObjects.CHARACTER) {
        // CHARACTER object
        const firstName = charFirstName.value
        const lastName = charLastName.value
        const description = charDescription.value
        const notes = charNotes.value

        if (!firstName) {
            charFirstName.focus()
            openNotification("Please enter first name")
            return
        }

        pywebview.api.create_character(storyId, firstName, lastName, description, notes).then(newCharId => {
            if (!!newCharId) {
                // Change the aspect to EDIT, set the ID
                valueObjectId = newCharId
                changeAspect(aspects.EDIT)
                postNotifyURL = "edit_value_object.html?value_object_type=" + valueObjectType
                    + "&value_object_id=" + newCharId
                    + "&edit=true" + "&story_id=" + storyId

                openNotification("Character created")
                if (!!pageTitleElement) {
                    pageTitleElement.innerHTML = "EDIT " + capitalizeAndStripUnderscores(valueObjectType)
                }
            } else {
                openNotification("ERROR: Character NOT created")
            }
        })
    } else if (valueObjectType == valueObjects.LOCATION) {
        // LOCATION object
        const name = locationName.value
        const description = locationDescription.value
        const notes = locationNotes.value

        if (!name) {
            locationName.focus()
            openNotification("Please enter location name")
            return
        }

        pywebview.api.create_location(storyId, name, description, notes).then(newLocationId => {
            if (!!newLocationId && newLocationId > 0) {
                // Change the aspect to EDIT, set the ID
                valueObjectId = newLocationId
                changeAspect(aspects.EDIT)
                openNotification("Location created.")
                if (!!pageTitleElement) {
                    pageTitleElement.innerHTML = "EDIT " + capitalizeAndStripUnderscores(valueObjectType)
                }
            } else {
                openNotification("ERROR: Location NOT created.")
            }
        })
    } else if (valueObjectType == valueObjects.VALUE_CHANGE) {
        // VALUE CHANGE object
        // Gather data from user input and URL parameters
        const urlParams = new URLSearchParams(window.location.search)

        let valueChangeId = 0
        storyId = urlParams.get('story_id') || 0
        beatId = urlParams.get('beat_id') || urlParams.get('return_beat_id') || 0
        const valueId = document.getElementById("valueToChange").value
        const magnitude = valueChangeMag.value
        const label = valueChangeLabel.value
        const description = valueChangeDescription.value
        const notes = valueChangeNotes.value

        if (!valueId || !parseInt(magnitude) || !label) {
            console.log("valueId: " + valueId + ", mag: " + magnitude + ", label: " + label)
            openNotification("Please enter a value to change, a non-zero numerical magnitude of change, AND a label.")
            return
        } else if (!beatId) {
            openNotification("ERROR: missing ID for the BEAT for this value change.")
            return
        } else if (!storyId) {
            openNotification("ERROR: missing ID for the STORY for this value change.")
            return
        }

        // Send the data to python API to create value change object
        pywebview.api.create_value_change(
            storyId, beatId, valueId, magnitude,
            label, description, notes
        ).then(incomingValueChangeId => {
            if (!!incomingValueChangeId && incomingValueChangeId > 0) {
                valueObjectId = incomingValueChangeId
                valueChangeId = incomingValueChangeId
                goBackAfterNotify = true
                openNotification("Value Change " + incomingValueChangeId + " created.")
                changeAspect(aspects.EDIT)
                if (!!pageTitleElement) {
                    pageTitleElement.innerHTML = "EDIT " + capitalizeAndStripUnderscores(valueObjectType)
                }
            } else {
                openNotification("ERROR: Value Change NOT created.")
            }
        })
    }
}


const changeAspect = newAspect => {
    // set the aspect
    aspect = newAspect === aspects.EDIT ?
        aspects.EDIT : newAspect === aspects.NEW ?
            aspects.NEW : aspect

    // set button text for all submit buttons
    const buttons = document.getElementsByClassName("submit")
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].value = aspect == aspects.EDIT ? "Update" : aspect == aspects.NEW ? "Create" : "ERROR"
    }

    const buttonDisplay = newAspect == aspects.EDIT ? "" : "none"

    deleteValueButton.style.display = buttonDisplay
    deleteValueChangeButton.style.display = buttonDisplay
    deleteCharacterButton.style.display = buttonDisplay
    deleteLocationButton.style.display = buttonDisplay
}

// find out which value object type we're using, and update that object.
const updateValueObject = () => {
    if (valueObjectType == valueObjects.VALUE) {
        const description = valueDescription.value
        const label = valueLabel.value
        const notes = valueNotes.value

        if (!label) {
            openNotification("Please enter label")
            return
        }

        pywebview.api.update_value(valueObjectId, label, description, notes).then(success => {
            changeAspect(aspects.EDIT)
            const msg = !!success ? "Value updated." : "ERROR: Value NOT UPDATED."
            openNotification(msg)
        })
    } else if (valueObjectType == valueObjects.CHARACTER) {
        const firstName = charFirstName.value
        const lastName = charLastName.value
        const description = charDescription.value
        const notes = charNotes.value

        if (!firstName) {
            openNotification("Please enter first name")
            return
        }

        pywebview.api.update_character(valueObjectId, firstName, lastName, description, notes).then(success => {
            changeAspect(aspects.EDIT)
            const msg = !!success ? "Character updated." : "ERROR: Character NOT UPDATED."
            openNotification(msg)
        })
    } else if (valueObjectType == valueObjects.LOCATION) {
        console.log("creating a location")
        const name = locationName.value
        const description = locationDescription.value
        const notes = locationNotes.value

        if (!name) {
            openNotification("Please enter name")
            return
        }

        pywebview.api.update_location(valueObjectId, name, description, notes).then(success => {
            changeAspect(aspects.EDIT)
            const msg = !!success ? "Location updated." : "ERROR: Location NOT UPDATED."
            openNotification(msg)
        })
    } else if (valueObjectType == valueObjects.VALUE_CHANGE) {
        let valueChangeId = valueObjectId
        const valueId = document.getElementById("valueToChange").value
        const magnitude = valueChangeMag.value
        const label = valueChangeLabel.value
        const description = valueChangeDescription.value
        const notes = valueChangeNotes.value

        if (!valueId || !magnitude || !label) {
            openNotification("Please enter a value to change, a non-zero magnitude of change, AND a label.")
            return
        } else if (!beatId) {
            openNotification("ERROR: missing ID for the BEAT for this value change.")
            return
        } else if (!storyId) {
            openNotification("ERROR: missing ID for the STORY for this value change.")
            return
        }

        pywebview.api.update_value_change(valueId, valueObjectId, label, description, notes, magnitude).then(success => {
            changeAspect(aspects.EDIT)
            const msg = !!success ? "Value Change updated." : "ERROR: Value Change NOT UPDATED."
            goBackAfterNotify = true
            openNotification(msg)
        })
    }
}


// add a character_value to the database
const addCharacterRelation = () => {
    let characterIdToAdd = charactersToRelate.value
    let aligned = document.getElementById("aligned").checked
    // pywebview add character_value
    pywebview.api.create_character_value(characterIdToAdd, valueObjectId, aligned).then(success => {
        if (success) {
            postNotifyURL = RELOAD
            openNotification("Character Relation Added")
        } else {
            openNotification('ERROR: Relation NOT SAVED')
        }
    })
}

// add a character_value to the database
const addValueRelation = () => {
    let valueIdToAdd = valuesToRelate.value
    let aligned = document.getElementById("aligned_v").checked
    // pywebview add character_value
    pywebview.api.create_character_value(valueObjectId, valueIdToAdd, aligned).then(success => {
        if (success) {
            postNotifyURL = RELOAD
            openNotification("Value Relation Added")
        } else {
            openNotification('ERROR: Relation NOT SAVED')
        }
    })
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

    if (!!postNotifyURL) {
        if (postNotifyURL === RELOAD) {
            location.reload()
        } else {
            location.href = postNotifyURL
        }
    } else if (goBackAfterNotify) {
        goBack()
    }
}

// Delete value objects

const deleteLocation = () => {
    if (valueObjectType == valueObjects.LOCATION) {
        pywebview.api.delete_location(valueObjectId).then(rowsDeleted => {
            if (rowsDeleted > 0) {
                postNotifyURL = returnURL()
                openNotification("Location deleted")
            }
        })
    }
}


const deleteValue = () => {
    if (valueObjectType == valueObjects.VALUE) {
        pywebview.api.delete_value(valueObjectId).then(rowsDeleted => {
            if (rowsDeleted > 0) {
                postNotifyURL = returnURL()
                openNotification("Value deleted")
            }
        })
    }
}

const deleteValueChange = () => {
    if (valueObjectType == valueObjects.VALUE_CHANGE) {
        pywebview.api.delete_value_change(valueObjectId).then(rowsDeleted => {
            if (rowsDeleted > 0) {
                postNotifyURL = returnURL()
                openNotification("Value Change deleted")
            }
        })
    }
}

const deleteCharacter = () => {
    if (valueObjectType == valueObjects.CHARACTER) {
        pywebview.api.delete_character(valueObjectId).then(rowsDeleted => {
            if (rowsDeleted > 0) {
                postNotifyURL = returnURL()
                openNotification("Character deleted")
            }
        })
    }
}


// Loading screen

const loadDOM = () => {
    // overlay elements
    loadingOverlay = document.getElementById("loadingOverlay")
    loadingText = document.getElementById("loadingText")

    // delete buttons
    deleteValueButton = document.getElementById("deleteValueButton")
    deleteValueChangeButton = document.getElementById("deleteValueChangeButton")
    deleteCharacterButton = document.getElementById("deleteCharacterButton")
    deleteLocationButton = document.getElementById("deleteLocationButton")
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


const hideAllCells = () => {
    value_cell.style.display = "none"
    value_change_cell.style.display = "none"
    character_cell.style.display = "none"
    location_cell.style.display = "none"
    char_relations_cell.style.display = "none"
    value_relations_cell.style.display = "none"
    notificationWrapper.style.display = "none"
    notificationCallout.style.display = "none"
    deleteValueButton.style.display = "none"
    deleteValueChangeButton.style.display = "none"
    deleteCharacterButton.style.display = "none"
    deleteLocationButton.style.display = "none"
}

const capitalizeAndStripUnderscores = (incomingText) => String(incomingText).replace("_", " ").toUpperCase()

window.addEventListener('load', () => setAspect())
window.submit = submit
window.addCharacterRelation = addCharacterRelation
window.deleteCharacterValue = deleteCharacterValue
window.invertAlignment = invertAlignment
window.addValueRelation = addValueRelation
window.newValueChange = newValueChange
window.editValueChange = editValueChange
window.openNotification = openNotification
window.closeNotification = closeNotification
window.goBack = goBack
window.deleteLocation = deleteLocation
window.deleteValue = deleteValue
window.deleteValueChange = deleteValueChange
window.deleteCharacter = deleteCharacter