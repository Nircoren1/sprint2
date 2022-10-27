//not sure if i need this 
function onInit() {
    gElCanvas = document.querySelector('canvas');
    gCtx = gElCanvas.getContext('2d');
    // drawRect(1, 2)
    renderMeme();
    renderGallery();
    renderSavedMemes()
    renderKeyWords()
    addMouseListeners()
}

