var gKeywordSearchCountMap = { 'funny': 12, 'cat': 16, 'baby': 2 }
var gImgs = [
    { id: 1, url: '../../assets/meme-imgs-square/1.jpg', keywords: ['trump', 'funny'] },
    { id: 2, url: '../../assets/meme-imgs-square/2.jpg', keywords: ['cute', 'dog'] },
    { id: 3, url: '../../assets/meme-imgs-square/3.jpg', keywords: ['bed', 'baby', 'dog'] },
    { id: 4, url: '../../assets/meme-imgs-square/4.jpg', keywords: ['funny', 'cat'] },
    { id: 5, url: '../../assets/meme-imgs-square/5.jpg', keywords: ['funny', 'cat'] },
    { id: 6, url: '../../assets/meme-imgs-square/6.jpg', keywords: ['funny', 'cat'] },
    { id: 7, url: '../../assets/meme-imgs-square/7.jpg', keywords: ['funny', 'cat'] },
    { id: 8, url: '../../assets/meme-imgs-square/8.jpg', keywords: ['funny', 'cat'] },
    { id: 9, url: '../../assets/meme-imgs-square/9.jpg', keywords: ['funny', 'cat'] },
    { id: 10, url: '../../assets/meme-imgs-square/10.jpg', keywords: ['funny', 'cat'] },
    { id: 11, url: '../../assets/meme-imgs-square/11.jpg', keywords: ['funny', 'cat'] },
    { id: 12, url: '../../assets/meme-imgs-square/12.jpg', keywords: ['funny', 'cat'] },
    { id: 13, url: '../../assets/meme-imgs-square/13.jpg', keywords: ['funny', 'cat'] },
    { id: 14, url: '../../assets/meme-imgs-square/14.jpg', keywords: ['funny', 'cat'] },
    { id: 15, url: '../../assets/meme-imgs-square/15.jpg', keywords: ['funny', 'cat'] },

];
var gKeywords = loadFromStorage('keywords') ? loadFromStorage('keywords') : {
    trump: 20,
    funny: 20,
    cute: 50,
    dog: 40,
    bed: 20,
    baby: 20,
}
var gMeme = {
    selectedImgId: 5,
    selectedLineIdx: -1,
    lines: [
        {
            txt: '😜',
            size: 20,
            align: 'left',
            color: 'blue',
            'stroke-color': 'black',
            coords: [0, 0, 0, 0]
        },
        {
            txt: 'line Dp',
            size: 20,
            align: 'left',
            color: 'blue',
            'stroke-color': 'black'
        }
    ]
}

var gSavedMemes = loadFromStorage('savedMemes') ? loadFromStorage('savedMemes') : []
let galleryLength = 18;


function getGMeme() {
    return gMeme;
}

function getGalleryLength() {
    return galleryLength;
}

function getGsavedMemes() {
    return gSavedMemes;
}

function getGimgs() {
    return gImgs;
}

function getKeywords() {
    return gKeywords
}

// function getGimgs(){
//     return gImgs
// }

function setLineTxt(txt) {
    //change 0 to current targeted line.
    //put value of input in input when selecting txt.
    if(gMeme.selectedLineIdx === -1) return
    gMeme.lines[gMeme.selectedLineIdx].txt = txt
}

//need to test it.
function pushLine(attributes){
    gMeme.lines.push(attributes)
}

function setLines(val) {
    gMeme.lines = val
}

function setImg(idx) {
    gMeme.selectedImgId = idx;
}


function setColor(color) {
    gMeme.lines[gMeme.selectedLineIdx].color = color
}

function setFontSize(val) {
    gMeme.lines[gMeme.selectedLineIdx].size = gMeme.lines[gMeme.selectedLineIdx].size + val
}

function setSelectedLine() {
    const lines = gMeme.lines
    let idx = gMeme.selectedLineIdx + 1
    if (idx >= lines.length) idx = 0
    gMeme.selectedLineIdx = idx
}


function saveMeme(url) {
    gMeme.imgUrl = url
    gSavedMemes.push(gMeme)
    saveToStorage('savedMemes', gSavedMemes)
}

function updateKeywords(keyword) {
    gKeywords[keyword] = gKeywords[keyword] + 5
    saveToStorage('keywords', gKeywords)
}


function moveText(dx, dy) {
    gMeme.lines[gMeme.selectedLineIdx].x += dx
    gMeme.lines[gMeme.selectedLineIdx].y += dy
  
  }

  function setGrabbedText(idx){
    gMeme.selectedLineIdx = idx
  }

function getSelectedLine(){
    return gMeme.selectedLineIdx
}