const levels = {
    STORY: 'story',
    ACT: 'act',
    CHAPTER: 'chapter',
    SCENE: 'scene',
    BEAT: 'beat'
}

const getChildLevel = currentLevel =>
    currentLevel == levels.STORY ? levels.ACT :
        currentLevel == levels.ACT ? levels.CHAPTER :
            currentLevel == levels.CHAPTER ? levels.SCENE :
                currentLevel == levels.SCENE ? levels.BEAT :
                    'NO CHILD ELEMENTS FOR "BEAT"'


const colors = {
    CINEREOUS: "#7e6c6c",
    YELLOW: "#f0f600",
    TURQUOISE: "#42d9c8",
    MIDNIGHT_GREEN: "#023436",
    PUMPKIN: "#fa8334"
}

export { levels, getChildLevel }
