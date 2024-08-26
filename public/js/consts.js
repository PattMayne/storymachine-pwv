const levels = {
    STORY: 'story',
    ACT: 'act',
    CHAPTER: 'chapter',
    SCENE: 'scene',
    BEAT: 'beat'
}

const valueObjects = {
    VALUE: 'value',
    VALUE_CHANGE: 'value_change',
    CHARACTER: 'character',
    LOCATION: 'location'
}

const getChildLevel = currentLevel =>
    currentLevel == levels.STORY ? levels.ACT :
        currentLevel == levels.ACT ? levels.CHAPTER :
            currentLevel == levels.CHAPTER ? levels.SCENE :
                currentLevel == levels.SCENE ? levels.BEAT :
                    'VALUE CHANGES'

const getParentLevel = currentLevel =>
    currentLevel == levels.BEAT ? levels.SCENE :
        currentLevel == levels.SCENE ? levels.CHAPTER :
            currentLevel == levels.CHAPTER ? levels.ACT :
                currentLevel == levels.ACT ? levels.STORY :
                    'NO PARENT FOR THIS INPUT'


const colors = {
    CINEREOUS: "#7e6c6c",
    YELLOW: "#f0f600",
    TURQUOISE: "#42d9c8",
    MIDNIGHT_GREEN: "#023436",
    PUMPKIN: "#fa8334"
}

export { levels, getChildLevel, getParentLevel, valueObjects }
