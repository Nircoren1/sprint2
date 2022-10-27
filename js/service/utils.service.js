function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min //The maximum is inclusive and the minimum is inclusive 
}

function getRandomColor(){
    return '#' +  (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}

function randStr(wordCount = 3) {
    var words = ['hi', 'i', 'drink', 'eat', 'Why','how','coding','hard','when','you','feel','please'];
    var txt = ''
    while (wordCount > 0) {
        wordCount--;
        const randIdx = Math.floor(Math.random() * words.length)
        txt += words[randIdx] + ' '
    }
    return txt
}