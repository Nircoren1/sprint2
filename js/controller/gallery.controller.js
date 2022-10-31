let gFilterText = '';

function renderGallery() {
    const images = getGimgs().filter(img => img.keywords.join('').includes(gFilterText.toLocaleLowerCase()))
    const gallery = document.querySelector('.gallery');
    gallery.style.overflowY = images.length <= 5 ? 'hidden' : 'scroll'
    let htmlStr = '';
    images.forEach(img => htmlStr += `<img src="${img.url}" onclick="onImgSelect(${img.id})" data-idx="${img.id}">`);
    gallery.innerHTML = htmlStr;
}

function onImgSelect(idx) {
    setImg(idx);
    showMemeCreator();
    renderMeme();
}

function onFilterGallery(value) {
    gFilterText = value;
    updateKeywords(value);
    renderGallery();
    renderKeyWords();
}

function showMemeCreator() {
    document.querySelector('.meme-creator').classList.remove('hide');
    document.querySelector('.gallery-container').classList.add('hide');
    document.querySelector('.saved-memes-container').classList.add('hide');
    document.querySelector('.memes-link').classList.remove('active');
    document.querySelector('.gallery-link').classList.remove('active');
    if (getGMeme().lines.length === 0) {
        addFlexibleLines()
        renderMeme()
    }

}

function showGallery(el) {
    document.querySelector('.meme-creator').classList.add('hide');
    document.querySelector('.gallery-container').classList.remove('hide');
    document.querySelector('.saved-memes-container').classList.add('hide');
    document.querySelector('.memes-link').classList.remove('active');
    el.classList.add('active')

}

function showSavedMemes() {
    document.querySelector('.meme-creator').classList.add('hide');
    document.querySelector('.gallery-container').classList.add('hide');
    document.querySelector('.saved-memes-container').classList.remove('hide');
    document.querySelector('.gallery-link').classList.remove('active');
    document.querySelector('.memes-link').classList.add('active');
    renderSavedMemes();
}