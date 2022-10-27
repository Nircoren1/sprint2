let gFilterText = ''

function renderGallery() {
    const images = getGimgs().filter(img => img.keywords.join().includes(gFilterText.toLocaleLowerCase()))
    const gallery = document.querySelector('.gallery');
    console.log(images);
    let htmlStr = ''
    images.forEach(img => htmlStr += `<img src="${img.url}" onclick="onImgSelect(this.dataset.idx)" data-idx="${img.id}">`);


    gallery.innerHTML = htmlStr
}

function onImgSelect(idx) {
    setImg(idx);
    renderMeme()
}

function onFilterGallery(value){
    gFilterText = value
    renderGallery()
}
