
const htmlSpecialChars = text => {
    const textNode = document.createTextNode(text)
    const div = document.createElement("DIV")
    div.appendChild(textNode)
    return div.innerHTML
}

export { htmlSpecialChars }
