import * as helpers from 'helpers'

const act = act => '<div class="large-4 medium-4 small-6 cell">' +
    '<div class="callout">' +
    '<h5 class="cardLabel" onclick="loadAct(' + act.id + ')">' + act.label + '</h5>' +
    '<h6 class="cardSectionLabel">DESCRIPTION:</h6>' +
    '<p>' + helpers.htmlSpecialChars(act.description) + '</p>' +
    '</div></div>'


const chapter = chapter => '<div class="large-4 medium-4 small-6 cell">' +
    '<div class="callout">' +
    '<h5 class="cardLabel" onclick="loadChapter(' + chapter.id + ')">' + chapter.label + '</h5>' +
    '<h6 class="cardSectionLabel">DESCRIPTION:</h6>' +
    '<p>' + helpers.htmlSpecialChars(chapter.description) + '</p>' +
    '</div></div>'


const scene = scene => '<div class="large-4 medium-4 small-6 cell">' +
    '<div class="callout">' +
    '<h5 class="cardLabel" onclick="loadScene(' + scene.id + ')">' + scene.label + '</h5>' +
    '<h6 class="cardSectionLabel">DESCRIPTION:</h6>' +
    '<p>' + helpers.htmlSpecialChars(scene.description) + '</p>' +
    '</div></div>'


const beat = beat => '<div class="large-4 medium-4 small-6 cell">' +
    '<div class="callout">' +
    '<h5 class="cardLabel">' + beat.label + '</h5>' +
    '<h6 class="cardSectionLabel">DESCRIPTION:</h6>' +
    '<p>' + helpers.htmlSpecialChars(beat.description) + '</p>' +
    '</div></div>'


const storyListItem = story => '<li><a href="story.html?story_id=' + story.id + '">' + story.label + '</a></li>'


export { act, chapter, scene, beat, storyListItem }
