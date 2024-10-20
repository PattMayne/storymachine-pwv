import * as helpers from 'helpers'
import * as consts from 'consts'

// Construct & return name of function to load component
const loadFunctionName = (level, componentId) => "loadComponent(\"" + level + "\", " + String(componentId) + ")"

const elements = {
    // CARDS.HTML

    gridX: () => {
        const div = document.createElement("div")
        div.setAttribute("class", "grid-x grid-padding-x")
        return div
    },

    // Story components (acts, chapters, scenes, beats) are listed on these cards.
    card: (storyComponent, level, isLast, skipNav) => {
        // create the HTML elements
        const gridCell = document.createElement("div")
        const callout = document.createElement("div")
        const cardLabel = document.createElement("h5")
        const cardDescription = document.createElement("p")
        const cardLabelContainer = document.createElement("div")
        const orderPar = document.createElement("h5")

        gridCell.setAttribute("class", "large-3 medium-4 small-6 cell")
        callout.setAttribute("class", "callout")
        cardLabel.setAttribute("class", "cardLabel")
        cardLabel.setAttribute("onclick", loadFunctionName(level, storyComponent.id))

        cardLabelContainer.setAttribute("class", "cardLabelContainer")
        cardLabelContainer.appendChild(cardLabel)

        // create this now so we can use it after the 'if' block.
        const bottomMenu = document.createElement("div")

        if (!skipNav) {
            // create the "change order" buttons
            const newComponentButtonLeft = document.createElement("a")
            const deleteButtonMiddle = document.createElement("a")
            const switchButtonRight = document.createElement("a")

            newComponentButtonLeft.setAttribute("class", "newComponentButtonLeft componentCardNav")
            newComponentButtonLeft.innerHTML = "<< new " + level
            newComponentButtonLeft.setAttribute("onclick", "newComponentLeft('" + level + "', " + storyComponent.order + ")")
            // For accessibility, make it tabbable and make "Enter" key function as click.
            newComponentButtonLeft.setAttribute("tabIndex", 0)
            newComponentButtonLeft.addEventListener("keypress", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    newComponentButtonLeft.click();
                }
            })

            deleteButtonMiddle.setAttribute("class", "deleteButtonMiddle componentCardNav")
            deleteButtonMiddle.setAttribute("onclick", "deleteComponentRequest('" + level + "', " + storyComponent.id + ")")
            deleteButtonMiddle.innerHTML = "[delete]"

            // For accessibility, make it tabbable and make "Enter" key function as click.
            deleteButtonMiddle.setAttribute("tabIndex", 0)
            deleteButtonMiddle.addEventListener("keypress", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    deleteButtonMiddle.click();
                }
            })

            switchButtonRight.setAttribute("id", "switchButtonRight_" + level + "_order-" + storyComponent.order)
            switchButtonRight.innerHTML = "move >>"

            // Don't put the "move right" button on the last card.
            if (!isLast) {
                switchButtonRight.setAttribute("class", "switchButtonRight componentCardNav")
                switchButtonRight.setAttribute("onclick", "shiftComponentRight('" + level + "', " + storyComponent.id + ")")
                // For accessibility, make it tabbable and make "Enter" key function as click.
                switchButtonRight.setAttribute("tabIndex", 0)
                switchButtonRight.addEventListener("keypress", function (event) {
                    if (event.key === "Enter" && !isLast) {
                        event.preventDefault();
                        switchButtonRight.click();
                    }
                })
            } else {
                switchButtonRight.setAttribute("class", "nullButtonRight")
            }

            bottomMenu.setAttribute("class", "cardBottomMenu")
            bottomMenu.appendChild(newComponentButtonLeft)
            bottomMenu.appendChild(deleteButtonMiddle)
            bottomMenu.appendChild(switchButtonRight)
        }

        orderPar.setAttribute("class", "orderPar")
        orderPar.innerText = storyComponent.order

        cardLabel.innerText = storyComponent.label
        cardDescription.innerText = helpers.htmlSpecialChars(storyComponent.description)

        callout.appendChild(orderPar)
        callout.appendChild(cardLabelContainer)
        callout.appendChild(cardDescription)
        !skipNav && callout.appendChild(bottomMenu)
        gridCell.appendChild(callout)
        return gridCell
    },

    valueChangeCard: (valueChange, storyId, componentChainLinkAddendum) => {
        const gridCell = document.createElement("div")
        const callout = document.createElement("div")
        const link = document.createElement("a")
        gridCell.setAttribute("class", "large-3 medium-4 small-6 cell")
        callout.setAttribute("class", "callout")
        link.setAttribute(
            "href",
            "edit_value_object.html?edit=true&value_object_type=value_change&value_object_id=" +
            valueChange["id"] + "&story_id=" + storyId + componentChainLinkAddendum)
        link.innerText = valueChange["label"]
        callout.appendChild(link)
        gridCell.appendChild(callout)
        // console.log("ADDENDUM: " + componentChainLinkAddendum)
        return gridCell
    },

    newComponentButton: level => {
        // create the HTML elements
        const gridCell = document.createElement("div")
        const callout = document.createElement("div")
        const cardLabel = document.createElement("a")

        const newComponentFunctionName = "newComponent('" + level + "')"
        gridCell.setAttribute("class", "large-3 medium-4 small-6 cell")
        callout.setAttribute("class", "callout")

        cardLabel.innerText = "Create new " + level
        cardLabel.setAttribute("tabindex", 0)
        cardLabel.setAttribute("class", "newElementButton")
        cardLabel.setAttribute("onclick", newComponentFunctionName)
        cardLabel.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                cardLabel.click();
            }
        })

        gridCell.appendChild(callout)
        callout.appendChild(cardLabel)
        return gridCell
    },

    newValueChangeButton: (beatId) => {
        // create the HTML elements
        const gridCell = document.createElement("div")
        const callout = document.createElement("div")
        const cardLabel = document.createElement("a")

        const newValueChangeFunctionName = "newValueChange('" + beatId + "')"
        gridCell.setAttribute("class", "large-4 medium-4 small-6 cell")
        callout.setAttribute("class", "callout")
        cardLabel.innerText = "Create new Value Change"
        cardLabel.setAttribute("onclick", newValueChangeFunctionName)
        cardLabel.setAttribute("class", "newElementButton")

        gridCell.appendChild(callout)
        callout.appendChild(cardLabel)
        return gridCell
    },

    valueButton: (storyId, valueId, label, componentChainLinkAddendum) => {
        const button = document.createElement("a")
        button.setAttribute("class", "button small listButton")
        button.innerText = label
        button.setAttribute(
            "href",
            "edit_value_object.html?edit=true&value_object_type=value&value_object_id=" +
            valueId + "&story_id=" + storyId + componentChainLinkAddendum)

        return button
    },

    showAllComponentsButton: (level) => {
        const onclickFunctionName = "showAllComponents(\"" + level + "\")"
        const button = document.createElement("a")
        button.setAttribute("class", "button small whiteButton")
        button.setAttribute("onclick", onclickFunctionName)
        button.innerText = level.toUpperCase() + "S"
        return button
    },

    locationButton: (storyId, locationId, name, componentChainLinkAddendum) => {
        const button = document.createElement("a")
        button.setAttribute("class", "button small listButton")
        button.innerText = name
        button.setAttribute(
            "href",
            "edit_value_object.html?edit=true&value_object_type=location&value_object_id=" +
            locationId + "&story_id=" + storyId + componentChainLinkAddendum)
        return button
    },

    characterButton: (storyId, characterId, name, componentChainLinkAddendum) => {
        const button = document.createElement("a")
        button.setAttribute("class", "button small listButton")
        button.innerText = name
        button.setAttribute(
            "href",
            "edit_value_object.html?edit=true&value_object_type=character&value_object_id=" +
            characterId + "&story_id=" + storyId + componentChainLinkAddendum)
        return button
    },

    characterValueItemCharacter: (character) => {
        let charName = character["first_name"]
        charName += !!character["last_name"] ? " " + character["last_name"] : ""

        const container = document.createElement("div")
        container.setAttribute("class", "characterValuesListItem")

        const nameDiv = document.createElement("div")
        nameDiv.setAttribute("class", "characterValuesListItemName")

        const nameText = document.createElement("h6")
        nameText.innerText = charName
        nameDiv.appendChild(nameText)

        const alignedDiv = document.createElement("div")
        alignedDiv.setAttribute("class", "characterValuesListItemAligned")
        alignedDiv.setAttribute("onclick", "invertAlignment(" + character["character_value"]["id"] + ")")
        alignedDiv.innerText = !!character["character_value"]["aligned"] ? "aligned" : "against"

        const deleteDiv = document.createElement("div")
        deleteDiv.setAttribute("class", "characterValuesListItemDelete")
        deleteDiv.setAttribute("onclick", "deleteCharacterValue(" + character["character_value"]["id"] + ")")
        deleteDiv.innerText = "DELETE"

        container.appendChild(nameDiv)
        container.appendChild(alignedDiv)
        container.appendChild(deleteDiv)

        // console.log("doing a container")

        return container
    },

    characterValueItemValue: (value) => {
        const container = document.createElement("div")
        container.setAttribute("class", "characterValuesListItem")

        const labelDiv = document.createElement("div")
        labelDiv.setAttribute("class", "characterValuesListItemName")

        const labelText = document.createElement("h6")
        labelText.innerText = value["label"]
        labelDiv.appendChild(labelText)

        const alignedDiv = document.createElement("div")
        alignedDiv.setAttribute("class", "characterValuesListItemAligned")
        alignedDiv.setAttribute("onclick", "invertAlignment(" + value["character_value"]["id"] + ")")
        alignedDiv.innerText = !!value["character_value"]["aligned"] ? "aligned" : "against"

        const deleteDiv = document.createElement("div")
        deleteDiv.setAttribute("class", "characterValuesListItemDelete")
        deleteDiv.setAttribute("onclick", "deleteCharacterValue(" + value["character_value"]["id"] + ")")
        deleteDiv.innerText = "DELETE"

        container.appendChild(labelDiv)
        container.appendChild(alignedDiv)
        container.appendChild(deleteDiv)

        // console.log("doing a container")

        return container
    },

    interLevelLabel: (storyComponent, level) => {
        const cell = document.createElement("div")
        const label = document.createElement("h3")
        cell.setAttribute("class", "large-12 cell")
        label.innerText = storyComponent.label

        if (!!level) {
            label.setAttribute("onclick", "loadComponent(\"" + level + "\", " + storyComponent.id + ")")
            label.setAttribute("class", "interLevelLabel")
        }

        cell.appendChild(label)
        return cell
    },

    // INIT.HTML 
    storyList: () => {
        const ul = document.createElement("ul")
        ul.setAttribute("id", "storiesList")
        return ul
    },

    archiveList: () => {
        const ul = document.createElement("ul")
        ul.setAttribute("id", "archiveList")
        return ul
    },

    storyListItem: (story, isArchived = false) => {
        const li = document.createElement("li")
        const anchor = document.createElement("a")
        anchor.setAttribute("class", "storiesListItem, button")
        //anchor.setAttribute("href", "cards.html?story_id=" + story.id)
        anchor.setAttribute("onclick", "loadStory(" + story.id + ")")
        li.appendChild(anchor)
        if (!!isArchived) {
            const deleteButton = document.createElement("a")
            deleteButton.setAttribute("class", "button small deleteButton")
            deleteButton.setAttribute("onclick", "requestDelete(" + story.id + ")")
            deleteButton.innerText = "DELETE"
            li.appendChild(deleteButton)
        }
        anchor.innerText = story.label
        return li
    }
}


export { elements }
