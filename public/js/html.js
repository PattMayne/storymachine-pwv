import * as helpers from 'helpers'

const elements = {
    // STORY.HTML

    gridX: () => {
        const div = document.createElement("div")
        div.setAttribute("class", "grid-x grid-padding-x")
        return div
    },

    card: (storyComponent, level, levels) => {
        // create the HTML elements
        const gridCell = document.createElement("div")
        const callout = document.createElement("div")
        const cardLabel = document.createElement("h5")
        const cardDescription = document.createElement("p")

        // Get name of loading function (card has link to its story component)
        const loadFunctionName = level == levels.ACT ? "loadAct(" :
            level == levels.CHAPTER ? "loadChapter(" :
                level == levels.SCENE ? "loadScene(" :
                    level == levels.BEAT ? "loadBeat(" : ""

        gridCell.setAttribute("class", "large-4 medium-4 small-6 cell")
        callout.setAttribute("class", "callout")
        cardLabel.setAttribute("class", "cardLabel")
        cardLabel.setAttribute("onclick", loadFunctionName + storyComponent.id + ")")

        // create the "change order" buttons
        const bottomMenu = document.createElement("div")
        const newComponentButtonLeft = document.createElement("div")
        const deleteButtonMiddle = document.createElement("div")
        const switchButtonRight = document.createElement("div")

        newComponentButtonLeft.setAttribute("class", "newComponentButtonLeft")
        newComponentButtonLeft.innerHTML = "<< new " + level
        newComponentButtonLeft.setAttribute("onclick", "newComponentLeft('" + level + "', " + storyComponent.order + ")")

        deleteButtonMiddle.setAttribute("class", "deleteButtonMiddle")
        deleteButtonMiddle.setAttribute("onclick", "deleteComponentRequest('" + level + "', " + storyComponent.id + ")")
        deleteButtonMiddle.innerHTML = "[delete]"

        switchButtonRight.setAttribute("class", "switchButtonRight")
        switchButtonRight.setAttribute("id", "switchButtonRight_" + level + "_order-" + storyComponent.order)
        switchButtonRight.innerHTML = "move >>"
        switchButtonRight.setAttribute("onclick", "shiftComponentRight('" + level + "', " + storyComponent.id + ")")

        bottomMenu.setAttribute("class", "cardBottomMenu")
        bottomMenu.appendChild(newComponentButtonLeft)
        bottomMenu.appendChild(deleteButtonMiddle)
        bottomMenu.appendChild(switchButtonRight)

        cardLabel.innerText = storyComponent.label
        cardDescription.innerText = helpers.htmlSpecialChars(storyComponent.description) + " order: " + storyComponent.order

        callout.appendChild(cardLabel)
        callout.appendChild(cardDescription)
        callout.appendChild(bottomMenu)
        gridCell.appendChild(callout)
        return gridCell
    },

    newComponentButton: (level) => {
        // create the HTML elements
        const gridCell = document.createElement("div")
        const callout = document.createElement("div")
        const cardLabel = document.createElement("h5")

        const newComponentFunctionName = "newComponent('" + level + "')"
        gridCell.setAttribute("class", "large-4 medium-4 small-6 cell")
        callout.setAttribute("class", "callout")
        cardLabel.innerText = "Create new " + level
        cardLabel.setAttribute("onclick", newComponentFunctionName)

        gridCell.appendChild(callout)
        callout.appendChild(cardLabel)
        return gridCell
    },

    // INIT.HTML 
    storyList: () => {
        const ul = document.createElement("ul")
        ul.setAttribute("id", "storiesList")
        return ul
    },
    storyListItem: story => {
        const li = document.createElement("li")
        const anchor = document.createElement("a")
        anchor.setAttribute("href", "story.html?story_id=" + story.id)
        li.appendChild(anchor)
        anchor.innerText = story.label
        return li
    },
    overlay: dialog => {
        const overlay = document.createElement("div")
        overlay.setAttribute("class", "grid-container overlay")
        !!dialog && overlay.appendChild(dialog)
        // add an X in the corner to cancel in case no dialog is sent.
        return dialog
    }
}


export { elements }
