const gTrans = {
    'search': {
        en: 'Search',
        he: 'חיפוש'
    },
    'gallery': {
        en: 'Gallery',
        he: 'גלריה',
    },
    'memes': {
        en: 'Memes',
        he: 'ממים',
    },
    'share': {
        en: 'Share',
        he: 'שיתוף'
    },
    'download': {
        en: 'Download',
        he: 'הורדה',
    },
    'upload': {
        en: 'Upload',
        he: 'העלאה',
    },
    'cute': {
        en: 'cute',
        he: 'חמוד',
    },
    'trump': {
        en: 'trump',
        he: 'טראמפ',
    },
    'dog': {
        en: 'dog',
        he: 'כלב',
    },
    'funny': {
        en: 'funny',
        he: 'מצחיק',
    },
    'bed': {
        en: 'bed',
        he: 'מיטה',
    },
    'baby': {
        en: 'baby',
        he: 'תינוק',
    },
    'more': {
        en: 'more',
        he: 'עוד',
    },
    'saved-memes': {
        en: 'saved Memes',
        he: 'ממים שמורים',
    },

   
}

let gCurrLang = 'en'

function getTrans(transKey) {
    const transMap = gTrans[transKey]
    if (!transMap) return 'UNKNOWN'

    let trans = transMap[gCurrLang]
    if (!trans) trans = transMap.en
    return trans
}

function doTrans() {
    const els = document.querySelectorAll('[data-trans]')
    els.forEach(el => {
        const transKey = el.dataset.trans
        const trans = getTrans(transKey)
        el.innerText = trans
        if (el.placeholder) el.placeholder = trans
    })
}

function setLang(lang) {
    gCurrLang = lang
}
