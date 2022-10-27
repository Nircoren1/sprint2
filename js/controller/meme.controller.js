let gElCanvas;
let gCtx;
let gIsdown = false;
let gIsTextGrabbed = false
var gStartPos

function renderMeme() {
    const meme = getGMeme()
    const img = new Image()
    img.src = `../../assets/meme-imgs-square/${meme.selectedImgId}.jpg`
    img.onload = () => {
        gElCanvas.height = (gElCanvas.width * img.naturalHeight) / img.naturalWidth;
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
        meme.lines.forEach(line => drawText(line.txt, line.size, line.color, line.x, line.y, line['stroke-color']))
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

function drawText(text, size, fillColor, x = 10, y = 20, strokeColor = 'black') {
    gCtx.lineWidth = 1;
    gCtx.strokeStyle = strokeColor;
    gCtx.fillStyle = fillColor;
    gCtx.textAlign = 'center';

    gCtx.font = `${size}px Arial`;
    gCtx.fillText(text, x, y); // Draws (fills) a given text at the given (x, y) position.
    gCtx.strokeText(text, x, y); // Draws (strokes) a given text at the given (x, y) position.


}

// function drawImg() {
//     const img = new Image() // Create a new html img element
//     img.src = '../../assets/meme-imgs-square/1.jpg' // Send a network req to get that image, define the img src
//     // When the image ready draw it on the canvas
//     img.onload = () => {
//         gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
//         drawText('hi!', 10, 50)

//     }
// }

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
    setSelectedLine()
}

function onFlexible() {
    //bonus: calculate text size so it doesnt eclipse canvas width
    setLines([])
    setImg(getRandomIntInclusive(1, getGalleryLength()))
    // maybe change to loop
    addLine({
        txt: randStr().trim(),
        size: getRandomIntInclusive(10, 40),
        align: 'left',
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
    saveMeme(gElCanvas.toDataURL('image/jpeg'))
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
        memesStr += `<img src =${meme.imgUrl}>`
    })

    document.querySelector('.saved-memes').innerHTML += memesStr
}

function onAddEmoji(emoji) {
    addLine({
        txt: emoji,
        size: 20,
        align: 'left',
        color: 'blue',
        x: gElCanvas.width / 2,
        y: gElCanvas.height / 2
    })
    renderMeme()
}

// function handleImageUpload() {
//     var image = document.getElementById("upload").files[0];
//     var reader = new FileReader();
//     reader.onload = function (e) {
//         const img = new Image()
//         img.src = e.target.result
//         console.log(img);
//         gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
//         document.getElementById("display-image").src = e.target.result;
//     }

//     reader.readAsDataURL(image);

// }
function onKeywordClick(keyword) {
    gFilterText = keyword
    renderGallery()
    updateKeywords(keyword)
    renderKeyWords()
}



function onSelectedLine(idx) {

}

// function onCanvasClick(ev) {
//     const offsetX = ev.offsetX;
//     const offsetY = ev.offsetY;
// }


function addLine(newLine = {
    txt: 'line 2',
    size: 20,
    align: 'left',
    color: 'blue',
    x: gElCanvas.width / 2
}) {
    const memeLines = getGMeme().lines.length
    console.log(memeLines);
    if (memeLines === 0) newLine.y = 50
    else if (memeLines === 1) newLine.y = gElCanvas.height - 50
    else newLine.y = gElCanvas.height / 2

    // add proportions in order to point on click

    pushLine(newLine)
}

function findCoords(line) {
    let metrics = gCtx.measureText(line.txt);
    let width = metrics.width
    // let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    return { left: line.x - width / 2, right: line.x + width / 2, top: line.y - actualHeight, bottom: line.y }
}


function addMouseListeners() {
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mouseup', onUp)
}

//   function addTouchListeners() {
//     gElCanvas.addEventListener('touchmove', onMove)
//     gElCanvas.addEventListener('touchstart', onDown)
//     gElCanvas.addEventListener('touchend', onUp)
//   }

function onMove() {
    // if()
}

function onDown(ev) {
    let isGrabbed = false
    const meme = getGMeme();
    meme.lines.forEach((line, idx) => {
        const coords = findCoords(line)
        if (!(ev.offsetX > coords.left && ev.offsetX < coords.right && ev.offsetY > coords.top && ev.offsetY < coords.bottom)) return
        gIsTextGrabbed = true
        document.body.style.cursor = 'grabbing'
        gStartPos = { x: ev.offsetX, y: ev.offsetY }
        setGrabbedText(idx)
        isGrabbed = true
        createBox(coords, line)
        console.log(line.txt);

    })
    if (!isGrabbed) setGrabbedText(-1)
}

function createBox(coords, line) {
    let metrics = gCtx.measureText(line.txt);
    let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    gCtx.beginPath();
    gCtx.rect(coords.left - line.size, coords.top - 0.5 * line.size, metrics.width + 2 * line.size, actualHeight + line.size);
    gCtx.stroke();
}

function onUp() {
    gIsTextGrabbed = false
    //repeted code
    const meme = getGMeme();
    const currLine = meme.lines[getSelectedLine()]
    createBox(findCoords(currLine), currLine)
    document.body.style.cursor = 'auto'
}


// function onDown(ev) {
//     console.log('Im from onDown')
//     //Get the ev pos from mouse or touch
//     const pos = getEvPos(ev)
//     if (!isCircleClicked(pos)) return
//     setCircleDrag(true)
//     //Save the pos we start from 
//     gStartPos = pos

//   }

function onMove(ev) {
    const isDrag = gIsTextGrabbed
    if (!isDrag) return
    const pos = getEvPos(ev)
    const dx = pos.x - gStartPos.x
    const dy = pos.y - gStartPos.y
    moveText(dx, dy)
    const meme = getGMeme();
    const currLine = meme.lines[getSelectedLine()]
    createBox(findCoords(currLine), currLine)
    //Save the last pos , we remember where we`ve been and move accordingly
    gStartPos = pos
    //The canvas is render again after every move
    renderMeme()
}

function getEvPos(ev) {

    //Gets the offset pos , the default pos
    let pos = {
        x: ev.offsetX,
        y: ev.offsetY
    }
    // Check if its a touch ev
    // if (TOUCH_EVS.includes(ev.type)) {
    //   //soo we will not trigger the mouse ev
    //   ev.preventDefault()
    //   //Gets the first touch point
    //   ev = ev.changedTouches[0]
    //   //Calc the right pos according to the touch screen
    //   pos = {
    //     x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
    //     y: ev.pageY - ev.target.offsetTop - ev.target.clientTop
    //   }
    // }
    return pos
}


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

    addLine({
        txt: document.querySelector('.txt-input').value,
        size: 20,
        align: 'left',
        color: document.querySelector('.color-input').value,
        'stroke-color': document.querySelector('.color-input').value,
        x: gElCanvas.width / 2
    })
    renderMeme()
}