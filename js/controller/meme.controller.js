const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

let gElCanvas;
let gCtx;
let gIsdown = false;
let gIsTextGrabbed = false;
let clickedTextF;
var gStartPos;

function addListeners() {
    addMouseListeners();
    addTouchListeners();
    // document.querySelector('.share-btn').addEventListener("change", uploadImg);
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
                drawBox(line);
            }
        })
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
    gCtx.rotate(45 * Math.PI / 180);
    gCtx.closePath()
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
    for (let i = 0; i < 1; i++) {
        addLine({
            txt: randStr().trim(),
            size: getRandomIntInclusive(20, 60),
            align: 'center',
            color: getRandomColor(),
            'stroke-color': getRandomColor(),
            x: gElCanvas.width / 2
        })
    }
    renderMeme();
}

function onSaveMeme() {
    saveMeme(gElCanvas.toDataURL('image/jpeg'));
    showSavedMemes()
    renderMeme()
}

function downloadImg(elLink) {
    const imgContent = gElCanvas.toDataURL('image/jpeg')
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
    const textStartX = line.x - width / 2;
    const textEnd = line.x + width / 2;
    let rad;
    if (type === 'text') {
        return { left: textStartX, right: textEnd, top: line.y - actualHeight, bottom: line.y }
    }
    else if (type === 'rect') {
        return { left: textStartX - line.size, right: textEnd + line.size, top: line.y - actualHeight - 0.5 * line.size, bottom: line.y + line.size }
    } else if (type === 'rotate') {
        rad = 10
        return { left: line.x - rad, right: line.x + rad, top: line.y + 0.5 * line.size - rad, bottom: line.y + 0.5 * line.size + rad }
    }
    else {
        rad = 20
        const arcCenterX = textEnd + line.size;
        const arcCenterY = line.y + 0.5 * line.size;
        return {
            left: arcCenterX - rad, right: textEnd + line.size + rad,
            top: arcCenterY - rad, bottom: arcCenterY + rad
        }
    }

}

function getEvPos(ev) {
    let pos = {
        x: ev.offsetX,
        y: ev.offsetY
    }
    if (TOUCH_EVS.includes(ev.type)) {
        ev.preventDefault();

        ev = ev.changedTouches[0];
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop
        }
    }
    return pos
}

let gResize = false
let gRotate
function onDown(ev) {
    const meme = getGMeme();
    const pos = getEvPos(ev);
    clickedText = false;
    const idx = meme.lines.findIndex(line => {
        const boxCoords = findCoords(line);
        const textCoords = findCoords(line, 'text');
        const resizeCoords = findCoords(line, 'resize');
        const rotateCoords = findCoords(line, 'rotate');
        if (pos.x > textCoords.left && pos.x < textCoords.right && pos.y > textCoords.top && pos.y < textCoords.bottom) {
            clickedText = {};
            clickedText.clickPos = pos;
            clickedText.textCoords = textCoords;
            return true;
        } else if (pos.x > resizeCoords.left && pos.x < resizeCoords.right && pos.y > resizeCoords.top && pos.y < resizeCoords.bottom) {
            return gResize = true;
            // gCtx.arc(line.x, line.y + 0.5 * line.size, rad, 0, 2 * Math.PI);
        } else if (pos.x > rotateCoords.left && pos.x < rotateCoords.right && pos.y > rotateCoords.top && pos.y < rotateCoords.bottom) {
            return rotate = true;
        }
        else {
            return (pos.x > boxCoords.left && pos.x < boxCoords.right && pos.y > boxCoords.top && pos.y < boxCoords.bottom);
        }
    })
    if (idx === -1) {
        setSelectedLine(-1);
        renderMeme();
        return;
    }
    gIsTextGrabbed = true
    document.body.style.cursor = 'grabbing';
    gStartPos = { x: pos.x, y: pos.y };
    setSelectedLine(idx);
    document.querySelector('.txt-input').value = meme.lines[idx].txt

    renderMeme();
}

function drawBox(line) {
    const coords = findCoords(line)
    let metrics = gCtx.measureText(line.txt);
    let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const width = metrics.width
    //draw box
    gCtx.beginPath();
    gCtx.rect(coords.left, coords.top, width + 2 * line.size, actualHeight + line.size);//[40]
    gCtx.lineWidth = '2px';
    gCtx.strokeStyle = '#ffffff';
    gCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    gCtx.stroke();
    gCtx.fill();

    // draw move symbol
    gCtx.beginPath();
    const textEnd = line.x + width / 2
    gCtx.arc(coords.left + width + 2 * line.size, coords.top + (actualHeight + line.size) / 2, line.size / 3, 0, 2 * Math.PI);
    gCtx.fillStyle = 'rgba(235, 238, 243,1)'
    gCtx.fill()

    //icon
    gCtx.beginPath()
    gCtx.lineWidth = 1;
    gCtx.fillStyle = 'rgba(34, 37, 44,0.76)';
    gCtx.font = `${line.size / 1.5}px impacted`;
    gCtx.fillText('✥', coords.left + width + 2 * line.size, line.size / 4.8 + coords.top + (actualHeight + line.size) / 2);
    drawText(line.txt, line.size, line.color, line.x, line.y, line['stroke-color'], line.align);

    // draw resize:
    // circle:
    gCtx.beginPath();
    const rad = 6
    gCtx.arc(textEnd + line.size, line.y + 0.5 * line.size, rad, 0, 2 * Math.PI);//[40]
    gCtx.fillStyle = 'rgba(235, 238, 243,1)'
    gCtx.fill()

    //draw rotate
    //circle:
    gCtx.beginPath();
    gCtx.arc(line.x, line.y + 0.5 * line.size, rad, 0, 2 * Math.PI);
    gCtx.fillStyle = 'rgba(235, 238, 243,1)'
    gCtx.fill()

    //icon
    gCtx.beginPath()
    gCtx.lineWidth = 1;
    gCtx.fillStyle = 'rgba(34, 37, 44,0.76)';
    gCtx.font = `${10}px impacted`;
    gCtx.fillText('↺', line.x, line.y + 0.5 * line.size + 0.4 * rad);
    drawText(line.txt, line.size, line.color, line.x, line.y, line['stroke-color'], line.align);
    // U+021BA

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

    if (gResize) {
        const distance = (((pos.x - gStartPos.x) ** 2 + (pos.y - gStartPos.y) ** 2) * 0.5) / 6;
        const isGrow = pos.x >= gStartPos.x && pos.y >= gStartPos.y ? distance : - distance;
        const textSize = getTextSize()
        if ((textSize <= 20 && isGrow < 0) || (textSize > 70 && isGrow > 0)) return;
        setTextSize(isGrow);
    } else if(gRotate){

    }
    else {
        moveText(dx, dy)

    }
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
    gResize = false
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
        const resizeCoords = findCoords(line, 'resize');
        const rotate = findCoords(line, 'rotate');
        if (pos.x > textCoords.left && pos.x < textCoords.right && pos.y > textCoords.top && pos.y < textCoords.bottom) {
            document.querySelector('.canvas-container').style.cursor = 'text';
            return true;
        } else if (pos.x > resizeCoords.left && pos.x < resizeCoords.right && pos.y > resizeCoords.top && pos.y < resizeCoords.bottom) {
            document.querySelector('.canvas-container').style.cursor = 'nw-resize';
            return true
        }
        else if (pos.x > boxCoords.left && pos.x < boxCoords.right && pos.y > boxCoords.top && pos.y < boxCoords.bottom) {
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

function uploadImg() {
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
            gCtx.drawImage(renderdimg, 0, 0, gElCanvas.width, gElCanvas.height);
            renderMeme()
        }
    }
}

function onMoveTextVertically(val) {
    setTextHeight(val)
    renderMeme()
}



const shareData = {
    title: 'MDN',
    text: 'Learn web development on MDN!',
    url: 'http://ca-upload.com/here/serveForShare.php?id=635b9c6de3f7f'
}

const btn = document.querySelector('button');
const resultPara = document.querySelector('.result');

// Share must be triggered by "user activation"
// btn.addEventListener('click', async () => {
//     const shareData = {
//         title: 'MDN',
//         text: 'Learn web development on MDN!',
//         url: 'http://ca-upload.com/here/serveForShare.php?id=635b9c6de3f7f'
//     }

//     try {
//         await navigator.share(shareData);
//         resultPara.textContent = 'MDN shared successfully';
//     } catch (err) {
//         resultPara.textContent = `Error: ${err}`;
//     }
// });