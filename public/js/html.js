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
        cardLabel.innerText = storyComponent.label
        cardDescription.innerHTML = helpers.htmlSpecialChars(storyComponent.description)

        gridCell.appendChild(callout)
        callout.appendChild(cardLabel)
        callout.appendChild(cardDescription)
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
}


export { elements }
