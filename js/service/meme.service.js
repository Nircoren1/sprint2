var gKeywordSearchCountMap = { 'funny': 12, 'cat': 16, 'baby': 2 }
var gImgs = [
    { id: 1, url: 'assets/meme-imgs-square/1.jpg', keywords: ['trump', 'funny'] },
    { id: 2, url: 'assets/meme-imgs-square/2.jpg', keywords: ['cute', 'dog'] },
    { id: 3, url: 'assets/meme-imgs-square/3.jpg', keywords: ['bed', 'baby', 'dog'] },
    { id: 4, url: 'assets/meme-imgs-square/4.jpg', keywords: ['funny', 'cat'] },
    { id: 5, url: 'assets/meme-imgs-square/5.jpg', keywords: ['funny', 'cat'] },
    { id: 6, url: 'assets/meme-imgs-square/6.jpg', keywords: ['funny', 'cat'] },
    { id: 7, url: 'assets/meme-imgs-square/7.jpg', keywords: ['funny', 'cat'] },
    { id: 8, url: 'assets/meme-imgs-square/8.jpg', keywords: ['funny', 'cat'] },
    { id: 9, url: 'assets/meme-imgs-square/9.jpg', keywords: ['funny', 'cat'] },
    { id: 10, url: 'assets/meme-imgs-square/10.jpg', keywords: ['funny', 'cat', 'obama'] },
    { id: 11, url: 'assets/meme-imgs-square/11.jpg', keywords: ['funny', 'cat'] },
    { id: 12, url: 'assets/meme-imgs-square/12.jpg', keywords: ['funny', 'cat'] },
    { id: 13, url: 'assets/meme-imgs-square/13.jpg', keywords: ['funny', 'cat'] },
    { id: 14, url: 'assets/meme-imgs-square/14.jpg', keywords: ['funny', 'cat'] },
    { id: 15, url: 'assets/meme-imgs-diverse-shape/2.jpg', keywords: ['funny', 'cat'] },
    { id: 16, url: 'assets/meme-imgs-diverse-shape/Oprah-You-Get-A.jpg', keywords: ['funny', 'cat'] },
    { id: 17, url: 'assets/meme-imgs-diverse-shape/X-Everywhere.jpg', keywords: ['funny', 'cat'] },
    { id: 18, url: 'assets/meme-imgs-diverse-shape/patrick.jpg', keywords: ['funny', 'cat'] },
    { id: 19, url: 'assets/meme-imgs-diverse-shape/img6.jpg', keywords: ['funny', 'cat'] },
    { id: 20, url: 'assets/meme-imgs-diverse-shape/img4.jpg', keywords: ['trump', 'cat'] },
    { id: 21, url: 'assets/meme-imgs-diverse-shape/img2.jpg', keywords: ['funny', 'cat'] },
    { id: 22, url: 'assets/meme-imgs-diverse-shape/2.jpg', keywords: ['funny', 'cat'] },
    { id: 23, url: 'assets/meme-imgs-diverse-shape/2.jpg', keywords: ['funny', 'cat'] },
    { id: 24, url: 'assets/meme-imgs-diverse-shape/2.jpg', keywords: ['funny', 'cat'] },


];
var gKeywords = loadFromStorage('keywords') ? loadFromStorage('keywords') : {
    trump: 20,
    funny: 20,
    cute: 43,
    dog: 30,
    bed: 20,
    baby: 20,
}
var gMeme = {
    selectedImgId: 5,
    selectedLineIdx: -1,
    lines: [
    ]
}

var gSavedMemes = loadFromStorage('savedMemes') ? loadFromStorage('savedMemes') : [];


function getGMeme() {
    return gMeme;
}

function setGmeme(meme) {
    gMeme = meme
}

function setSelectedImg(id){
    gMeme.selectedImgId = id
}

function setTextHeight(val){
    gMeme.lines[gMeme.selectedLineIdx].y += +val
}

function getGsavedMemes() {
    return gSavedMemes;
}

function getGimgs() {
    return gImgs;
}

function getKeywords() {
    return gKeywords;
}

function setLineTxt(txt) {
    if (gMeme.selectedLineIdx === -1) return
    gMeme.lines[gMeme.selectedLineIdx].txt = txt;
}

function pushLine(attributes) {
    gMeme.lines.push(attributes);
}

function pushImg(img){
    gImgs.push(img);
}

function setLines(val) {
    gMeme.lines = val;
}

function setImg(idx) {
    gMeme.selectedImgId = idx;
}

function setColor(color) {
    gMeme.lines[gMeme.selectedLineIdx].color = color;
}

function setStrokeColor(color) {
    gMeme.lines[gMeme.selectedLineIdx]['stroke-color'] = color;
}

function setFontSize(val) {
    gMeme.lines[gMeme.selectedLineIdx].size = gMeme.lines[gMeme.selectedLineIdx].size + val;
}

function setSwitchedLine() {
    const lines = gMeme.lines
    let idx = gMeme.selectedLineIdx + 1;
    if (idx >= lines.length) idx = 0;
    gMeme.selectedLineIdx = idx;
}


function saveMeme(url) {
    gMeme.imgUrl = url;
    gSavedMemes.push(gMeme);
    saveToStorage('savedMemes', gSavedMemes);
}

function updateKeywords(keyword) {
    keyword = keyword.toLowerCase();
    if (gKeywords[keyword] >= 60) return;
    if (gKeywords[keyword]) gKeywords[keyword] += 2;
    saveToStorage('keywords', gKeywords);
}


function moveText(dx, dy) {
    gMeme.lines[gMeme.selectedLineIdx].x += dx;
    gMeme.lines[gMeme.selectedLineIdx].y += dy;

}

function setSelectedLine(idx) {
    gMeme.selectedLineIdx = idx;
}

function getSelectedLine() {
    return gMeme.selectedLineIdx;
}

function removeLine() {
    gMeme.lines.splice([gMeme.selectedLineIdx], 1);
    gMeme.selectedLineIdx--
}

function alignText(dir) {
    gMeme.lines[gMeme.selectedLineIdx].align = dir;
}

function updateText(key, idx) {
    const lineText = gMeme.lines[gMeme.selectedLineIdx].txt;
    if (key === 'Backspace') return gMeme.lines[gMeme.selectedLineIdx].txt = lineText.slice(0, -1);

    gMeme.lines[gMeme.selectedLineIdx].txt = lineText.slice(0, idx) + key + lineText.slice(idx);

}