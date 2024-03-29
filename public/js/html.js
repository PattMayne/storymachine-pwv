import * as helpers from 'helpers'

const act = act => '<div class="large-4 medium-4 small-6 cell">' +
    '<div class="callout">' +
    '<h5 class="cardLabel">' + act.label + '</h5>' +
    '<h6 class="cardSectionLabel">DESCRIPTION:</h6>' +
    '<p>' + helpers.htmlSpecialChars(act.description) + '</p>' +
    '</div></div>'


export { act }
