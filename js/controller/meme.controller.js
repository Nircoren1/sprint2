const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

let gElCanvas;
let gCtx;
let gIsdown = false;
let gIsTextGrabbed = false
var gStartPos

function renderMeme() {
    const meme = getGMeme();
    const img = new Image();
    const imgs = getGimgs();
    img.src = imgs[+meme.selectedImgId-1].url;
    img.onload = () => {
        gElCanvas.height = (gElCanvas.width * img.naturalHeight) / img.naturalWidth;
        gCtx.beginPath()
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)

        meme.lines.forEach((line, idx) => {
            drawText(line.txt, line.size, line.color, line.x, line.y, line['stroke-color'], line.align)
            if (meme.selectedLineIdx === idx) {
                createBox(line)

            }
        })
        gCtx.closePath()
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
    gCtx.font = `${size}px Arial`;
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

function onFontSizeChange(val) {
    setFontSize(+val);
    renderMeme();
}

function onSwitchLine() {
    setSwitchedLine()
    renderMeme()

}

function onFlexible() {
    //bonus: calculate text size so it doesnt eclipse canvas width
    setLines([])
    setSelectedLine(-1)
    setImg(getRandomIntInclusive(1, getGimgs().length))
    // maybe change to loop
    addLine({
        txt: randStr().trim(),
        size: getRandomIntInclusive(20, 60),
        align: 'center',
        color: getRandomColor(),
        'stroke-color': getRandomColor(),
        x: gElCanvas.width / 2
    })
    // fix tommorow.
    // if (Math.random() > 0.5) {
    //     addLine({
    //         txt: randStr().trim(),
    //         size: getRandomIntInclusive(10, 40),
    //         align: 'left',
    //         color: getRandomColor(),
    //         'stroke-color': getRandomColor(),
    //         x: gElCanvas.width / 2
    //     })
    // }
    //stroke color
    renderMeme();
}

function onSaveMeme() {
    saveMeme(gElCanvas.toDataURL('image/jpeg'));
    renderMeme()
}


function resizeCanvas() {
    const elContainer = document.querySelector('.canvas-container')
    gElCanvas.width = elContainer.offsetWidth
    gElCanvas.height = elContainer.offsetHeight
}


function downloadImg(elLink) {
    const imgContent = gElCanvas.toDataURL('image/jpeg')// image/jpeg the default format
    elLink.href = imgContent
}
// The next 2 functions handle IMAGE UPLOADING to img tag from file system: 
function onImgInput(ev) {
    loadImageFromInput(ev, renderImg)
}

// CallBack func will run on success load of the img
function loadImageFromInput(ev, onImageReady) {
    const reader = new FileReader()
    // After we read the file
    reader.onload = function (event) {
        let img = new Image() // Create a new html img element
        img.src = event.target.result // Set the img src to the img file we read
        // Run the callBack func, To render the img on the canvas
        img.onload = onImageReady.bind(null, img)
        // Can also do it this way:
        // img.onload = () => onImageReady(img)
    }
    reader.readAsDataURL(ev.target.files[0]) // Read the file we picked
}

function renderSavedMemes() {
    let memesStr = ''
    getGsavedMemes().forEach(meme => {
        memesStr += `<img src =${meme.imgUrl} onclick="onEditSavedMeme('${encodeURIComponent(JSON.stringify(meme))}')">`
    })

    document.querySelector('.saved-memes').innerHTML = memesStr
}

function onEditSavedMeme(meme) {
    meme = JSON.parse(decodeURIComponent(meme))
    setGmeme(meme)
    showMemeCreator()
    renderMeme()
}


function onAddEmoji(emoji) {
    addLine({
        txt: emoji,
        size: 60,
        align: 'center',
        color: 'blue',
        x: gElCanvas.width / 2
        // y: gElCanvas.height / 2
    })
    renderMeme()
}

function onKeywordClick(keyword) {
    gFilterText = keyword
    renderGallery()
    updateKeywords(keyword)
    renderKeyWords()
}



function onSelectedLine(idx) {

}

function addLine(newLine = {
    txt: 'line 2',
    size: 20,
    align: 'center',
    color: 'blue',
    x: gElCanvas.width / 2
}) {
    const memeLines = getGMeme().lines.length
    if (memeLines === 0) newLine.y = 50
    else if (memeLines === 1) newLine.y = gElCanvas.height - 50
    else newLine.y = gElCanvas.height / 2

    // add proportions in order to point on click

    pushLine(newLine)
}

function findCoords(line, type = 'rect') {
    let metrics = gCtx.measureText(line.txt);
    let width = metrics.width
    // let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    // gCtx.rect(coords.left - line.size, coords.top - 0.5 * line.size, metrics.width + 2 * line.size, actualHeight + line.size);
    if (type === 'rect') {
        return { left: line.x - width / 2 - line.size, right: line.x + width / 2 + line.size, top: line.y - actualHeight - 0.5 * line.size, bottom: line.y + line.size }
    }
    else {
        return { left: line.x - width / 2, right: line.x + width / 2, top: line.y - actualHeight, bottom: line.y }
    }
}

function addListeners() {
    addMouseListeners()
    addTouchListeners()
}

function addMouseListeners() {
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mouseup', onUp)
}

function addTouchListeners() {
    gElCanvas.addEventListener('touchmove', onMove)
    gElCanvas.addEventListener('touchstart', onDown)
    gElCanvas.addEventListener('touchend', onUp)
}

function getEvPos(ev) {
    let pos = {
        x: ev.offsetX,
        y: ev.offsetY
    }
    if (TOUCH_EVS.includes(ev.type)) {
        ev.preventDefault()

        ev = ev.changedTouches[0]
        //Calc the right pos according to the touch screen
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop
        }
    }
    return pos
}

let clickedText

function onDown(ev) {
    const meme = getGMeme();
    const pos = getEvPos(ev)
    clickedText = false
    const idx = meme.lines.findIndex(line => {
        const boxCoords = findCoords(line)
        const textCoords = findCoords(line, 'text')
        if (pos.x > textCoords.left && pos.x < textCoords.right && pos.y > textCoords.top && pos.y < textCoords.bottom) {
            clickedText = {}
            clickedText.clickPos = pos
            clickedText.textCoords = textCoords
            return true
        }
        return (pos.x > boxCoords.left && pos.x < boxCoords.right && pos.y > boxCoords.top && pos.y < boxCoords.bottom)
    })
    if (idx === -1) {
        setSelectedLine(-1)
        renderMeme()
        return
    }
    gIsTextGrabbed = true
    document.body.style.cursor = 'grabbing'
    gStartPos = { x: pos.x, y: pos.y }
    setSelectedLine(idx)
    renderMeme()


    // if (!isGrabbed) setSelectedLine(-1)
}

//changes
function createBox(line) {
    const coords = findCoords(line)
    let metrics = gCtx.measureText(line.txt);
    let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    gCtx.beginPath();
    gCtx.roundRect(coords.left, coords.top, metrics.width + 2 * line.size, actualHeight + line.size, [40]);
    gCtx.setLineDash([5, 3])
    gCtx.strokeStyle = 'black'
    gCtx.fillStyle = 'grey'
    gCtx.stroke();
    gCtx.fill();
    drawText(line.txt, line.size, line.color, line.x, line.y, line.color, line.align)

    // console.log(line.align);
    gCtx.closePath()
}

let gDragged = false
function onMove(ev) {
    setCursor(ev)
    const isDrag = gIsTextGrabbed
    if (!isDrag) return
    gDragged = true
    const pos = getEvPos(ev)
    const dx = pos.x - gStartPos.x
    const dy = pos.y - gStartPos.y
    moveText(dx, dy)
    // const meme = getGMeme();
    // const currLine = meme.lines[getSelectedLine()]
    // 
    //Save the last pos , we remember where we`ve been and move accordingly
    gStartPos = pos
    //The canvas is render again after every move
    renderMeme()
}

function onAddTextInline(ev) {
    ev.stopPropagation()
    var key = ev.key;
    if (key === 'ArrowLeft') {
        return clickedText.idx--
    }
    else if (key === 'ArrowRight') {
        return clickedText.idx++
    } else if (key.length > 1 && key !== 'Backspace') {
        return
    }
    updateText(key, clickedText.idx)
    clickedText.idx++;
    renderMeme()

}



function onUp() {
    document.removeEventListener('keydown', onAddTextInline, false);
    if (!gDragged && gIsTextGrabbed && clickedText) {
        charPosition()
        console.log('idx up', clickedText.idx);
        document.addEventListener('keydown', onAddTextInline, false);
    }

    gIsTextGrabbed = false
    gDragged = false
    document.body.style.cursor = 'auto'
}

function charPosition() {
    const textStart = clickedText.textCoords.left
    let { clickPos } = clickedText
    const meme = getGMeme()
    const text = meme.lines[meme.selectedLineIdx].txt
    gCtx.beginPath()
    gCtx.lineWidth = 1;
    gCtx.font = `${meme.size}px Arial`;

    let i = 0;
    while (clickPos.x > textStart) {
        const charSize = gCtx.measureText(text[i]).width;
        i++
        clickPos.x -= charSize
        if (i > 40) console.log('stackoverloasd');
    }
    gCtx.closePath()
    clickedText.idx = i
    return i
}





// element.addEventListener("mousedown", handleMouseDown, true);

//   function onUp() {
//     console.log('Im from onUp')
//     setCircleDrag(false)
//     document.body.style.cursor = 'grab'
//   }


// function getEvPos(ev) {

//     //Gets the offset pos , the default pos
//     let pos = {
//       x: ev.offsetX,
//       y: ev.offsetY
//     }
//     // Check if its a touch ev
//     if (TOUCH_EVS.includes(ev.type)) {
//       //soo we will not trigger the mouse ev
//       ev.preventDefault()
//       //Gets the first touch point
//       ev = ev.changedTouches[0]
//       //Calc the right pos according to the touch screen
//       pos = {
//         x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
//         y: ev.pageY - ev.target.offsetTop - ev.target.clientTop
//       }
//     }
//     return pos
//   }

function onAddLine() {
    const text = document.querySelector('.txt-input').value;
    if(!text.trim()) return;
    addLine({
        txt: document.querySelector('.txt-input').value,
        size: 20,
        align: 'center',
        color: document.querySelector('.color-input').value,
        'stroke-color': document.querySelector('.color-input').value,
        x: gElCanvas.width / 2
    })
    renderMeme()
}

function onRemoveLine() {
    removeLine();
    renderMeme();
}

function onAlign(dir) {
    alignText(dir)
    renderMeme()
}

function setCursor(ev) {
    const meme = getGMeme();
    const pos = getEvPos(ev)
    const overLine = meme.lines.find(line => {
        const boxCoords = findCoords(line)
        const textCoords = findCoords(line, 'text')
        if (pos.x > textCoords.left && pos.x < textCoords.right && pos.y > textCoords.top && pos.y < textCoords.bottom) {
            document.querySelector('.canvas-container').style.cursor = 'text'
            console.log('text');
            return true
        } else if (pos.x > boxCoords.left && pos.x < boxCoords.right && pos.y > boxCoords.top && pos.y < boxCoords.bottom) {
            document.querySelector('.canvas-container').style.cursor = 'grab'
            return true
        }
    })
    if (!overLine) {
        document.querySelector('.canvas-container').style.cursor = 'default'
    }
    console.log(overLine);
}

function openColorPicker() {
    document.querySelector('.color-input').click()
}