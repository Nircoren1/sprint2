const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

let gElCanvas;
let gCtx;
let gIsdown = false;
let gIsTextGrabbed = false;
let clickedTextF;
var gStartPos;

function renderMeme() {
    const meme = getGMeme();
    const img = new Image();
    const imgs = getGimgs();
    img.src = imgs[+meme.selectedImgId - 1].url;
    img.onload = () => {
        gElCanvas.height = (gElCanvas.width * img.naturalHeight) / img.naturalWidth;
        gCtx.beginPath()
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);

        meme.lines.forEach((line, idx) => {
            drawText(line.txt, line.size, line.color, line.x, line.y, line['stroke-color'], line.align);
            if (meme.selectedLineIdx === idx) {
                createBox(line);

            }
        })
        gCtx.closePath();
    }
}

function renderKeyWords() {
    let htmlStr = '';
    const keywordsObj = getKeywords();
    for (const word in keywordsObj) {
        htmlStr += `<span style="font-size:${keywordsObj[word]}px" value="${word}" onclick="onKeywordClick(this.getAttribute('value'))">${word} </span>`
    }
    document.querySelector('.keywords-by-popularity').innerHTML = htmlStr;
}

function drawText(text, size, fillColor, x = 10, y = 20, strokeColor = 'black', align) {
    gCtx.beginPath()
    gCtx.lineWidth = 1;
    gCtx.strokeStyle = strokeColor;
    gCtx.fillStyle = fillColor;
    gCtx.textAlign = 'center';
    let diff = 0;
    if (align === 'left') diff = -size;
    if (align === 'right') diff = +size;
    gCtx.font = `${size}px impacted`;
    gCtx.fillText(text, x + diff, y);
    gCtx.strokeText(text, x + diff, y);
    gCtx.closePath();
}

function onInputChange(txt) {
    setLineTxt(txt);
    renderMeme();
}

function onColorChange(color) {
    setColor(color);
    renderMeme();
}

function onStrokeColorChange(color) {
    setStrokeColor(color)
    renderMeme();

}

function onFontSizeChange(val) {
    setFontSize(+val);
    renderMeme();
}

function onSwitchLine() {
    setSwitchedLine()
    renderMeme()

}

function onFlexible() {
    setLines([])
    setSelectedLine(-1)
    setImg(getRandomIntInclusive(1, getGimgs().length))
    addLine({
        txt: randStr().trim(),
        size: getRandomIntInclusive(20, 60),
        align: 'center',
        color: getRandomColor(),
        'stroke-color': getRandomColor(),
        x: gElCanvas.width / 2
    })
    renderMeme();
}

function onSaveMeme() {
    saveMeme(gElCanvas.toDataURL('image/jpeg'));
    renderMeme()
}

function downloadImg(elLink) {
    const imgContent = gElCanvas.toDataURL('image/jpeg')// image/jpeg the default format
    elLink.href = imgContent
}

function onImgInput(ev) {
    loadImageFromInput(ev, renderImg)
}

function loadImageFromInput(ev, onImageReady) {
    const reader = new FileReader()
    reader.onload = function (event) {
        let img = new Image()
        img.src = event.target.result
        img.onload = onImageReady.bind(null, img)
    }
    reader.readAsDataURL(ev.target.files[0])
}

function renderSavedMemes() {
    let memesStr = '';
    getGsavedMemes().forEach(meme => {
        memesStr += `<img src =${meme.imgUrl} onclick="onEditSavedMeme('${encodeURIComponent(JSON.stringify(meme))}')">`
    })

    document.querySelector('.saved-memes').innerHTML = memesStr;
}

function onEditSavedMeme(meme) {
    meme = JSON.parse(decodeURIComponent(meme));
    setGmeme(meme);
    showMemeCreator();
    renderMeme();
}

function onAddEmoji(emoji) {
    addLine({
        txt: emoji,
        size: 60,
        align: 'center',
        color: 'blue',
        x: gElCanvas.width / 2
    })
    renderMeme()
}

function onKeywordClick(keyword) {
    gFilterText = keyword;
    renderGallery();
    updateKeywords(keyword);
    renderKeyWords();
}

function onSelectedLine(idx) {

}

function addLine(newLine = {
    txt: 'line 2',
    size: 40,
    align: 'center',
    color: 'white',
    'stroke-color': 'black',
    x: gElCanvas.width / 2
}) {
    const memeLines = getGMeme().lines.length;
    if (memeLines === 0) newLine.y = 50;
    else if (memeLines === 1) newLine.y = gElCanvas.height - 50;
    else newLine.y = gElCanvas.height / 2;
    pushLine(newLine);
}

function findCoords(line, type = 'rect') {
    let metrics = gCtx.measureText(line.txt);
    let width = metrics.width;
    let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    if (type === 'rect') {
        return { left: line.x - width / 2 - line.size, right: line.x + width / 2 + line.size, top: line.y - actualHeight - 0.5 * line.size, bottom: line.y + line.size }
    }
    else {
        return { left: line.x - width / 2, right: line.x + width / 2, top: line.y - actualHeight, bottom: line.y }
    }
}

function addListeners() {
    addMouseListeners();
    addTouchListeners();
}

function addMouseListeners() {
    gElCanvas.addEventListener('mousemove', onMove);
    gElCanvas.addEventListener('mousedown', onDown);
    gElCanvas.addEventListener('mouseup', onUp);
}

function addTouchListeners() {
    gElCanvas.addEventListener('touchmove', onMove);
    gElCanvas.addEventListener('touchstart', onDown);
    gElCanvas.addEventListener('touchend', onUp);
}

function getEvPos(ev) {
    let pos = {
        x: ev.offsetX,
        y: ev.offsetY
    }
    if (TOUCH_EVS.includes(ev.type)) {
        ev.preventDefault();

        ev = ev.changedTouches[0];
        //Calc the right pos according to the touch screen
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop
        }
    }
    return pos
}



function onDown(ev) {
    const meme = getGMeme();
    const pos = getEvPos(ev);
    clickedText = false;
    const idx = meme.lines.findIndex(line => {
        const boxCoords = findCoords(line);
        const textCoords = findCoords(line, 'text');
        if (pos.x > textCoords.left && pos.x < textCoords.right && pos.y > textCoords.top && pos.y < textCoords.bottom) {
            clickedText = {};
            clickedText.clickPos = pos;
            clickedText.textCoords = textCoords;
            return true;
        }
        return (pos.x > boxCoords.left && pos.x < boxCoords.right && pos.y > boxCoords.top && pos.y < boxCoords.bottom);
    })
    if (idx === -1) {
        setSelectedLine(-1);
        renderMeme();
        return;
    }
    gIsTextGrabbed = true;
    document.body.style.cursor = 'grabbing';
    gStartPos = { x: pos.x, y: pos.y };
    setSelectedLine(idx);
    renderMeme();
}

//changes
function createBox(line) {
    const coords = findCoords(line)
    let metrics = gCtx.measureText(line.txt);
    let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    gCtx.beginPath();
    gCtx.roundRect(coords.left, coords.top, metrics.width + 2 * line.size, actualHeight + line.size, [40]);
    gCtx.lineWidth = '2px';
    gCtx.strokeStyle = '#ffffff';
    gCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
    gCtx.stroke();
    gCtx.fill();
    drawText(line.txt, line.size, line.color, line.x, line.y, line.color, line.align);

    gCtx.closePath();
}

let gDragged = false
function onMove(ev) {
    setCursor(ev);
    const isDrag = gIsTextGrabbed;
    if (!isDrag) return;
    gDragged = true;
    const pos = getEvPos(ev);
    const dx = pos.x - gStartPos.x;
    const dy = pos.y - gStartPos.y;
    moveText(dx, dy)
    gStartPos = pos;
    renderMeme();
}

function onAddTextInline(ev) {
    var key = ev.key;
    if (key === 'ArrowLeft') {
        return clickedText.idx--;
    }
    else if (key === 'ArrowRight') {
        return clickedText.idx++;
    } else if (key.length > 1 && key !== 'Backspace') {
        return
    }
    updateText(key, clickedText.idx);
    clickedText.idx++;
    renderMeme();

}



function onUp() {
    document.removeEventListener('keydown', onAddTextInline, false);
    if (!gDragged && gIsTextGrabbed && clickedText) {
        charPosition();
        document.addEventListener('keydown', onAddTextInline, false);
    }

    gIsTextGrabbed = false;
    gDragged = false;
    document.body.style.cursor = 'auto';
}

function charPosition() {
    const textStart = clickedText.textCoords.left;
    let { clickPos } = clickedText;
    const meme = getGMeme();
    const text = meme.lines[meme.selectedLineIdx].txt;
    gCtx.beginPath();
    gCtx.lineWidth = 1;
    gCtx.font = `${meme.size}px Arial`;

    let i = 0;
    while (clickPos.x > textStart) {
        const charSize = gCtx.measureText(text[i]).width;
        i++;
        clickPos.x -= charSize;
    }
    gCtx.closePath();
    clickedText.idx = i;
    return i;
}

function onAddLine() {
    const text = document.querySelector('.txt-input').value;
    if (!text.trim()) return;
    addLine({
        txt: document.querySelector('.txt-input').value,
        size: 40,
        align: 'center',
        color: document.querySelector('.color-input').value,
        'stroke-color': document.querySelector('.color-input').value,
        x: gElCanvas.width / 2
    })
    renderMeme();
}

function onRemoveLine() {
    removeLine();
    renderMeme();
}

function onAlign(dir) {
    alignText(dir);
    renderMeme();
}

function setCursor(ev) {
    const meme = getGMeme();
    const pos = getEvPos(ev)
    const overLine = meme.lines.find(line => {
        const boxCoords = findCoords(line);
        const textCoords = findCoords(line, 'text')
        if (pos.x > textCoords.left && pos.x < textCoords.right && pos.y > textCoords.top && pos.y < textCoords.bottom) {
            document.querySelector('.canvas-container').style.cursor = 'text';
            return true;
        } else if (pos.x > boxCoords.left && pos.x < boxCoords.right && pos.y > boxCoords.top && pos.y < boxCoords.bottom) {
            document.querySelector('.canvas-container').style.cursor = 'grab';
            return true
        }
    })
    if (!overLine) {
        document.querySelector('.canvas-container').style.cursor = 'default';
    }
}

function openColorPicker() {
    document.querySelector('.color-input').click();
}


var input = document.querySelector("#file-input");
document.querySelector(".get-img-btn").addEventListener("click", function () {
    input.click();
});

input.addEventListener("change", preview);
function preview() {
    var fileObject = this.files[0];
    var fileReader = new FileReader();
    fileReader.readAsDataURL(fileObject);
    fileReader.onload = function () {
        var result = fileReader.result;
        const renderdimg = new Image();
        renderdimg.setAttribute("src", result);
        const idx = getGimgs().length + 1
        pushImg({ id: idx, url: result })
        setSelectedImg(idx)
        renderdimg.onload = () => {
            gCtx.beginPath()
            gCtx.drawImage(renderdimg, 0, 0, gElCanvas.width, gElCanvas.height)
        }
    }
}


function onMoveTextVertically(val){
    setTextHeight(val)
    renderMeme()
}