const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

let gElCanvas;
let gCtx;
let gIsdown = false;
let gIsLineGrabbed = false;
let gDragged = false;
let gClickedText;
let gSavedMemeIdx = null;
let gRotated = null;
var gStartPos;

function onInit() {
    gElCanvas = document.querySelector('canvas');
    gCtx = gElCanvas.getContext('2d');
    renderGallery()
    renderSavedMemes()
    renderKeyWords()
    addListeners()
    loadFonts()
}

function loadFonts() {
    const font1 = new FontFace("valera-round", "url(style/fonts/VarelaRound-Regular.ttf)");
    const font2 = new FontFace("impacted", "url(style/fonts/Impacted.ttf)");
    const font3 = new FontFace("poppins", "url(style/fonts/Poppins-Regular.ttf)");
    document.fonts.add(font1);
    font1.load();
    document.fonts.add(font2);
    font2.load();
    document.fonts.add(font3);
    font3.load();
    document.fonts.ready.then(() => {
        renderMeme()
    });
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
    gElCanvas.addEventListener('touchmove', onMove, { passive: true });
    gElCanvas.addEventListener('touchstart', onDown, { passive: true });
    gElCanvas.addEventListener('touchend', onUp, { passive: true });
}

const image_input = document.querySelector(".image-input");

image_input.addEventListener("change", function () {
    const reader = new FileReader();
    reader.readAsDataURL(this.files[0]);
    reader.addEventListener("load", () => {
        const result = reader.result;
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
    });
});

function renderMeme(savedMeme = false) {
    const meme = getGMeme();
    const img = new Image();
    const imgs = getGimgs();
    img.src = imgs[+meme.selectedImgId - 1].url;
    img.onload = () => {
        gElCanvas.height = (gElCanvas.width * img.naturalHeight) / img.naturalWidth;
        gCtx.beginPath();
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
     
        meme.lines.forEach((line, idx) => {
            if (meme.selectedLineIdx !== idx) deg = 0
            if (meme.selectedLineIdx === idx && !savedMeme) {
                drawBox(line);
            }
            drawText(line.txt, line.size, line.color, line.x, line.y, line['stroke-color'], line.align, line.deg, line.font);

        })
        if (savedMeme) {
            saveMeme(gElCanvas.toDataURL('image/jpeg'), gSavedMemeIdx);
            showSavedMemes();
            gSavedMemeIdx = null;
        }

    }
}

function renderKeyWords() {
    let keyWordsByPopStr = '';
    let keyWordsOptionsStr = '';
    const keywordsObj = getKeywords();
    for (const word in keywordsObj) {
        keyWordsOptionsStr += `<option data-trans="${word}" value="${getTrans(word)}"></option>`
        keyWordsByPopStr += `<span style="font-size:${keywordsObj[word]}px;margin-right:5px" value="${word}" data-trans="${word}" onclick="onKeywordClick(this.getAttribute('value'))">${getTrans(word)} </span>`
    }
    document.querySelector('.keywords-by-popularity').innerHTML = keyWordsByPopStr;
    document.querySelector('#keywords').innerHTML = keyWordsOptionsStr;
}

function toggleNavbar() {
    document.querySelector('body').classList.toggle('open-menu');
}

function drawText(text, size, fillColor, x = 10, y = 20, strokeColor = 'black', align, deg, font) {
    gCtx.beginPath()
    gCtx.lineWidth = 1;
    gCtx.strokeStyle = strokeColor;
    gCtx.fillStyle = fillColor;
    gCtx.textAlign = 'center';

    let diff = 0;
    if (align === 'left') diff = -size;
    if (align === 'right') diff = +size;
    gCtx.font = `${size}px ${font}`;

    //rotation
    gCtx.textBaseline = "middle";
    gCtx.textAlign = 'center';
    gCtx.translate(x + diff, y);
    gCtx.rotate(deg);

    gCtx.fillText(text, 0, 0);
    gCtx.strokeText(text, 0, 0);

    gCtx.setTransform(1, 0, 0, 1, 0, 0);
}

function onInputChange(txt) {
    const meme = getGMeme()
    // const line = meme.selectedLineIdx
    if (meme.selectedLineIdx < 0) {
        addLine(newLine = {
            txt: txt,
            size: 40,
            align: 'center',
            color: 'white',
            'stroke-color': 'black',
            deg: 0,
            font: 'impacted',
            x: gElCanvas.width / 2
        })
    }
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
    document.querySelector('.meme-creator').classList.remove('hide');
    document.querySelector('.gallery-container').classList.add('hide');
    document.querySelector('.saved-memes-container').classList.add('hide');
    document.querySelector('.memes-link').classList.remove('active');
    document.querySelector('.gallery-link').classList.remove('active');
    setLines([]);
    setSelectedLine(-1);
    addFlexibleLines()
    setSelectedImg(getRandomIntInclusive(1,20))
    renderMeme()
}

function addFlexibleLines() {
    const randomStr = randStr().trim()
    const maxSize = gElCanvas.width / randomStr.length
    for (let i = 0; i < 2; i++) {
        addLine({
            txt: randStr().trim(),
            size: getRandomIntInclusive(20, maxSize),
            align: 'center',
            color: getRandomColor(),
            'stroke-color': getRandomColor(),
            deg: 0,
            font: 'impacted',
            x: gElCanvas.width / 2
        })
    }
}

function onSaveMeme() {
    setSelectedLine(-1);
    renderMeme(true);
}

function downloadImg(elLink) {
    setSelectedLine(-1);
    renderMeme();
    const imgContent = gElCanvas.toDataURL('image/jpeg');
    elLink.href = imgContent;
}

function onImgInput(ev) {
    loadImageFromInput(ev, renderImg);
}

function loadImageFromInput(ev, onImageReady) {
    const reader = new FileReader()
    reader.onload = function (event) {
        let img = new Image();
        img.src = event.target.result;
        img.onload = onImageReady.bind(null, img);
    }
    reader.readAsDataURL(ev.target.files[0]);
}

function renderSavedMemes() {
    let memesStr = '';
    getGsavedMemes().forEach((meme, idx) => {
        memesStr += `<img src =${meme.imgUrl} onclick="onEditSavedMeme('${encodeURIComponent(JSON.stringify(meme))}',${idx})">`
    })
    document.querySelector('.saved-memes').innerHTML = memesStr;
}

function onEditSavedMeme(meme, idx) {
    gSavedMemeIdx = idx;
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
        font: 'impacted',
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

function onSetLang(lang) {
    setLang(lang)
    setDirection(lang)
    doTrans()
    setDirection(lang)
    renderKeyWords()
}

function setDirection(lang) {
    if (lang === 'he') document.body.classList.add('rtl')
    else document.body.classList.remove('rtl')
}

function addLine(newLine = {
    txt: 'line 2',
    size: 40,
    align: 'center',
    color: 'white',
    'stroke-color': 'black',
    deg: 0,
    font: 'impacted',
    x: gElCanvas.width / 2
}) {
    newLine.font = 'impacted';
    const memeLines = getGMeme().lines.length;
    if (memeLines === 0) newLine.y = 50;
    else if (memeLines === 1) newLine.y = gElCanvas.height - 50;
    else newLine.y = gElCanvas.height / 2;
    pushLine(newLine);
}

function findCoords(line, type = 'rect') {
    gCtx.beginPath();
    gCtx.lineWidth = 1;
    gCtx.font = `${line.size}px impacted`;
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
        return { left: textStartX - line.size, right: textEnd + line.size, top: line.y - (actualHeight + line.size) / 2, bottom: line.y + (actualHeight + line.size) / 2 }
    } else if (type === 'rotate') {
        rad = 10;
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

        ev = ev.changedTouches[0];
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop
        }
    }
    return pos;
}

let gResize = false
function onDown(ev) {
    const meme = getGMeme();
    const pos = getEvPos(ev);
    gClickedText = false;
    document.querySelector('.txt-input').value = ''
    const idx = meme.lines.findIndex(line => {
        isPointInRect(line, pos.x, pos.y);

        const boxCoords = findCoords(line);
        const textCoords = findCoords(line, 'text');
        const resizeCoords = findCoords(line, 'resize');
        if (pos.x > textCoords.left && pos.x < textCoords.right && pos.y > textCoords.top && pos.y < textCoords.bottom) {
            gClickedText = {};
            gClickedText.clickPos = pos;
            gClickedText.textCoords = textCoords;
            return true;
        } else if (pos.x > resizeCoords.left && pos.x < resizeCoords.right && pos.y > resizeCoords.top && pos.y < resizeCoords.bottom) {
            return gResize = true;
        } else if (isPointInRect(line, pos.x, pos.y)) {
            return true
        } else if (isPointInRotate(line, pos.x, pos.y)) {
            return gRotated = true;
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
    gIsLineGrabbed = true
    gStartPos = { x: pos.x, y: pos.y };
    setSelectedLine(idx);
    document.querySelector('.txt-input').value = meme.lines[idx].txt
    renderMeme();
}


function isPointInRect(line, x, y) {
    gCtx.beginPath();
    gCtx.lineWidth = 1;
    gCtx.font = `${line.size}px impacted`
    let metrics = gCtx.measureText(line.txt);
    let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const width = metrics.width
    gCtx.translate(line.x, line.y);
    gCtx.rect(-(width + 2 * line.size) / 2, -(actualHeight + line.size) / 2, width + 2 * line.size, actualHeight + line.size);//[40]
    gCtx.lineWidth = 2;
    return gCtx.isPointInPath(x, y);
}

function isPointInRotate(line, x, y) {
    gCtx.setTransform(1, 0, 0, 1, 0, 0);
    gCtx.beginPath();
    gCtx.lineWidth = 1;
    const rad = 6;
    gCtx.font = `${line.size}px impacted`;
    gCtx.arc(line.x, line.y + 1.5 * line.size, rad, 0, 2 * Math.PI);
    return gCtx.isPointInPath(x, y);
}

function drawBox(line) {

    gCtx.beginPath();
    gCtx.lineWidth = 1;
    gCtx.font = `${line.size}px impacted`;
    let metrics = gCtx.measureText(line.txt);
    let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const width = metrics.width;

    gCtx.translate(line.x, line.y);
    gCtx.beginPath()
    gCtx.rotate(line.deg);
    gCtx.rect(-(width + 2 * line.size) / 2, -(actualHeight + line.size) / 2, width + 2 * line.size, actualHeight + line.size);//[40]
    gCtx.lineWidth = 2;
    gCtx.strokeStyle = '#ffffff';
    gCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    gCtx.stroke();
    gCtx.fill();

    const rad = 6;
    // // circle:
    gCtx.setTransform(1, 0, 0, 1, 0, 0);

    gCtx.beginPath();
    gCtx.translate(line.x, line.y);
    gCtx.arc(+(width + 2 * line.size) / 2, +(actualHeight + line.size) / 2, rad, 0, 2 * Math.PI);//[40]
    gCtx.fillStyle = 'rgba(235, 238, 243,1)';
    gCtx.stroke();
    gCtx.fill();

    // //circle:
    gCtx.setTransform(1, 0, 0, 1, 0, 0);
    gCtx.beginPath();
    gCtx.arc(line.x, line.y + 1.5 * line.size, rad, 0, 2 * Math.PI);
    gCtx.fillStyle = 'rgba(235, 238, 243,1)'
    gCtx.fill()

    gCtx.setTransform(1, 0, 0, 1, 0, 0);
}

function onMove(ev) {
    // console.log(ev.offsetX);
    ev.stopPropagation();
    setCursor(ev);
    const isDrag = gIsLineGrabbed;
    const pos = getEvPos(ev);
    if (!isDrag) {
        return
    }
    gDragged = true;
    const dx = pos.x - gStartPos.x;
    const dy = pos.y - gStartPos.y;
    if (dx > 20 || dy > 20 || pos.x < 5 || pos.x >= gElCanvas.width - 5 || pos.x < 5 || pos.x >= gElCanvas.width) return onUp()
    if (gResize) {
        if (pos.x === 0) return gIsLineGrabbed = false
        const distance = (((pos.x - gStartPos.x) ** 2 + (pos.y - gStartPos.y) ** 2) * 0.5) / 6;
        const isGrow = dx >= 0 && dy >= 0 ? distance : - distance;
        const textSize = getTextSize() + isGrow
        if ((textSize <= 20 && isGrow < 0) || (textSize > 70 && isGrow > 0) || textSize <= 0) return;
        setTextSize(isGrow);
    } else if (gRotated) {
        const deg = (((pos.x - gStartPos.x) ** 2 + (pos.y - gStartPos.y) ** 2) * 0.5) / 6;
        const isRight = dx >= 0 && dy >= 0 ? deg : - deg;
        setDeg(+isRight)
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
        return gClickedText.idx--;
    }
    else if (key === 'ArrowRight') {
        return gClickedText.idx++;
    } else if (key.length > 1 && key !== 'Backspace') {
        return
    }
    updateText(key, gClickedText.idx);
    gClickedText.idx++;
    const meme = getGMeme()
    const idx = meme.selectedLineIdx
    document.querySelector('.txt-input').value = meme.lines[idx].txt

    renderMeme();
}

function onUp(ev) {
    document.removeEventListener('keydown', onAddTextInline, false);
    if (!gDragged && gIsLineGrabbed && gClickedText) {
        charPosition();
        document.addEventListener('keydown', onAddTextInline, false);
    }

    gIsLineGrabbed = false;
    gDragged = false;
    gResize = false;
    gRotated = false;
    console.log('up');
    setCursor(ev)
}

function charPosition() {
    const textStart = gClickedText.textCoords.left;
    let { clickPos } = gClickedText;
    const meme = getGMeme();
    const text = meme.lines[meme.selectedLineIdx].txt;
    gCtx.beginPath();
    gCtx.lineWidth = 1;
    gCtx.font = `${meme.lines[meme.selectedLineIdx].size}px impacted`;

    let i = 0;
    while (clickPos.x > textStart) {
        const charSize = gCtx.measureText(text[i]).width;
        i++;
        clickPos.x -= charSize;
    }
    gClickedText.idx = i;
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
    const elCanvas = document.querySelector('.canvas-container')


    const overLine = meme.lines.find(line => {
        const boxCoords = findCoords(line);
        const textCoords = findCoords(line, 'text')
        const resizeCoords = findCoords(line, 'resize');
        if (pos.x > textCoords.left && pos.x < textCoords.right && pos.y > textCoords.top && pos.y < textCoords.bottom) {
            elCanvas.style.cursor = 'text';
            return true;
        } else if (pos.x > resizeCoords.left && pos.x < resizeCoords.right && pos.y > resizeCoords.top && pos.y < resizeCoords.bottom) {
            elCanvas.style.cursor = 'nw-resize';
            return true;
        }
        else if (pos.x > boxCoords.left && pos.x < boxCoords.right && pos.y > boxCoords.top && pos.y < boxCoords.bottom) {
            if (gDragged) {
                elCanvas.style.cursor = 'grabbing';
            } else {
                elCanvas.style.cursor = 'grab';
            }
            return true;
        } else if (isPointInRotate(line, pos.x, pos.y)) {
            elCanvas.style.cursor = 'resize'
        }
    })
    if (!overLine) {
        document.querySelector('.canvas-container').style.cursor = 'default';
    }
}

function openColorPicker() {
    document.querySelector('.color-input').click();
}

function onUploadImg() {
    image_input.click()
}

function onMoveTextVertically(val) {
    setTextHeight(val)
    renderMeme()
}

const shareData = {
    title: 'meme',
    text: 'look at my meme!',
    url: 'http://ca-upload.com/here/serveForShare.php?id=635b9c6de3f7f'
}

function onExpandKeywords() {
    document.querySelector('.keywords-by-popularity').classList.toggle('expand-keywords')
}

function onSelectFont(value) {
    setFont(value)
    renderMeme();
}
