let gFilterText = '';

function renderGallery() {
    const images = getGimgs().filter(img => img.keywords.join('').includes(gFilterText.toLocaleLowerCase()))
    const gallery = document.querySelector('.gallery');
    let htmlStr = '';
    images.forEach(img => htmlStr += `<img src="${img.url}" onclick="onImgSelect(this.dataset.idx)" data-idx="${img.id}">`);
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
    document.querySelector('.saved-memes').classList.add('hide');
    document.querySelector('.memes-link').classList.remove('active');
    document.querySelector('.gallery-link').classList.remove('active');

}

function showGallery(el) {
    document.querySelector('.meme-creator').classList.add('hide');
    document.querySelector('.gallery-container').classList.remove('hide');
    document.querySelector('.saved-memes').classList.add('hide');
    document.querySelector('.memes-link').classList.remove('active');
    el.classList.add('active')

}

function showSavedMemes() {
    document.querySelector('.meme-creator').classList.add('hide');
    document.querySelector('.gallery-container').classList.add('hide');
    document.querySelector('.saved-memes').classList.remove('hide');
    document.querySelector('.gallery-link').classList.remove('active');
    document.querySelector('.memes-link').classList.add('active');
    renderSavedMemes();
}