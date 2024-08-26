// IMPORTS
import * as consts from 'consts'

const valueObjects = consts.valueObjects
const levels = consts.levels

// aspect is either creating a new story or editing an existing one
const aspects = {
    EDIT: 'edit',
    NEW: 'new'
}

var level = null

var labelElement
var descriptionElement
var pageTitleElement

var valueObjectType = null
var valueObjectId = null
var aspect = null
var storyId = null
var actId = null

// overlays
var loadingOverlay, loadingText, loadingInterval
var loadingTimer = 0

// document elements

var value_cell, value_change_cell, character_cell, location_cell, relations_cell
var valueDescription, valueLabel, valueNotes
var charFirstName, charLastName, charDescription, charNotes
var locationName, locationDescription, locationNotes

const setAspect = () => {
    loadDOM()
    showLoading()

    // discover the purpose of this visit
    const urlParams = new URLSearchParams(window.location.search)
    aspect = !!urlParams.get('edit') ? aspects.EDIT : aspects.NEW
    storyId = urlParams.get('story_id') || 0
    actId = urlParams.get('act_id') || 0

    valueObjectType = urlParams.get('value_object_type') || 0
    valueObjectId = urlParams.get('value_object_id') || 0


    labelElement = document.getElementById("label")
    descriptionElement = document.getElementById("description")
    pageTitleElement = document.getElementById("pageTitle")
    pageTitleElement.innerHTML = "Edit " + valueObjectType

    locationName = document.getElementById("locationName")
    locationDescription = document.getElementById("locationDescription")
    locationNotes = document.getElementById("locationNotes")

    valueDescription = document.getElementById("valueDescription")
    valueLabel = document.getElementById("valueLabel")
    charDescription = document.getElementById("charDescription")
    valueNotes = document.getElementById("valueNotes")

    charFirstName = document.getElementById("charFirstName")
    charLastName = document.getElementById("charLastName")
    charDescription = document.getElementById("charDescription")
    charNotes = document.getElementById("charNotes")

    value_cell = document.getElementById("value_cell")
    value_change_cell = document.getElementById("value_change_cell")
    character_cell = document.getElementById("character_cell")
    location_cell = document.getElementById("location_cell")
    relations_cell = document.getElementById("relations_cell")

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

        } else {
            console.log("we are NOT editing")
            console.log("valueObjectType: " + valueObjectType)

            valueObjectType == valueObjects.VALUE ? newValue() :
                valueObjectType == valueObjects.VALUE_CHANGE ? newValueChange() :
                    valueObjectType == valueObjects.CHARACTER ? newCharacter() :
                        valueObjectType == valueObjects.LOCATION ? newLocation() : null

        }
        hideLoading()
    }, 300)
}

const newValue = () => {
    value_cell.style.display = ''
}

const newCharacter = () => {
    character_cell.style.display = ''
}

const newLocation = () => {
    location_cell.style.display = ''
}


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
        relations_cell.style.display = ''
        let selectBox = document.getElementById("charactersToRelate")
        console.log("CHARACTERS: " + characters)
        characters.map(character => {
            console.log("CHARACTER: " + character)
            let newOption = document.createElement("option")
            newOption.value = character["id"]
            newOption.innerText = character["first_name"]
            selectBox.appendChild(newOption)
        })

    })
})


const editCharacter = () => pywebview.api.get_character_by_id(valueObjectId).then(character => {
    character_cell.style.display = ''
    console.log(character)

    charDescription.value = character["description"]
    charFirstName.value = character["first_name"]
    charLastName.value = character["last_name"]
    charNotes.value = character["notes"]
})

const editLocation = () => pywebview.api.get_location_by_id(valueObjectId).then(location => {
    location_cell.style.display = ''
    console.log(location)

    locationDescription.value = location["description"]
    locationName.value = location["name"]
    locationNotes.value = location["notes"]
})

const submit = () => aspect == aspects.EDIT ? updateValueObject() : createValueObject()

const createValueObject = () => {
    if (valueObjectType == valueObjects.VALUE) {
        const description = valueDescription.value
        const label = valueLabel.value
        const notes = valueNotes.value

        pywebview.api.create_value(storyId, label, description, notes).then(newValueId => {
            // Change the aspect to EDIT, set the ID
            valueObjectId = newValueId
            aspect = aspects.EDIT

            // give popup notice of success (or failure)
            // change the text of the button to "update"
        })
    } else if (valueObjectType == valueObjects.CHARACTER) {
        const firstName = charFirstName.value
        const lastName = charLastName.value
        const description = charDescription.value
        const notes = charNotes.value

        pywebview.api.create_character(storyId, firstName, lastName, description, notes).then(newCharId => {
            // Change the aspect to EDIT, set the ID
            valueObjectId = newCharId
            aspect = aspects.EDIT

            // give popup notice of success (or failure)
            // change the text of the button to "update"
        })
    } else if (valueObjectType == valueObjects.LOCATION) {
        console.log("creating a location")
        const name = locationName.value
        const description = locationDescription.value
        const notes = locationNotes.value

        pywebview.api.create_location(storyId, name, description, notes).then(newLocationId => {
            // Change the aspect to EDIT, set the ID
            valueObjectId = newLocationId
            aspect = aspects.EDIT

            // give popup notice of success (or failure)
            // change the text of the button to "update"
        })
    }

}

// find out which component we're using, and update that component.
const updateValueObject = () => {
    if (valueObjectType == valueObjects.VALUE) {
        const description = valueDescription.value
        const label = valueLabel.value
        const notes = valueNotes.value

        pywebview.api.update_value(valueObjectId, label, description, notes).then(success => {
            if (success) {
                console.log("SAVED")
            } else {
                console.log("NOT SAVED")
            }
            // Do something with the success
            // give popup notice of success (or failure)
        })
    } else if (valueObjectType == valueObjects.CHARACTER) {
        const firstName = charFirstName.value
        const lastName = charLastName.value
        const description = charDescription.value
        const notes = charNotes.value

        pywebview.api.update_character(valueObjectId, firstName, lastName, description, notes).then(success => {
            if (success) {
                console.log("SAVED")
            } else {
                console.log("NOT SAVED")
            }
            // Do something with the success
            // give popup notice of success (or failure)
        })
    } else if (valueObjectType == valueObjects.LOCATION) {
        console.log("creating a location")
        const name = locationName.value
        const description = locationDescription.value
        const notes = locationNotes.value

        pywebview.api.update_location(valueObjectId, name, description, notes).then(success => {
            if (success) {
                console.log("SAVED")
            } else {
                console.log("NOT SAVED")
            }
            // Do something with the success
            // give popup notice of success (or failure)
        })
    }
}

const loadDOM = () => {
    // overlay elements
    loadingOverlay = document.getElementById("loadingOverlay")
    loadingText = document.getElementById("loadingText")
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
    relations_cell.style.display = "none"
}

window.addEventListener('load', () => setAspect())
window.submit = submit
