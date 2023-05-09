const site = [
    {
        name: '素因数分解ゲーム',
        tag: [0,3,5],
        link: 'pFac/index.html',
		img: 'pFac.png',
		date: '2023.3.23',
        txt: '素因数分解ゲーム　wallprime参考'
    },
    {
        name: 'click-game2',
        tag: [0,5],
        link: 'click-game2/index.html',
		img: 'click-game2.jpeg',
		date: '2023.3.8',
        txt: 'ただただクリックしていくだけのゲーム'
    },{
        name: 'number-guessing-game',
        tag: [0,3,4,5],
        link: 'number-guessing-game/index.html',
		img: 'number-guessing-game.webp',
		date: '2022.07.02',
        txt: '0<n≦100を満たす自然数nを6回のチャンスで当てるゲーム'
    },{
        name: 'click-game',
        tag: [0,5],
        link: 'click-game/index.html',
		img: 'click-game.jpeg',
		date: '2022.07.01',
        txt: 'クリックしていくだけのゲーム'
    }
]

const tag = [
    'ゲーム',
    'ツール',
    '記事',
    '頭脳系',
    'パズル',
    '暇つぶし',
    'タイピング'
];

const header_menu = [
    {
        txt: 'フィードバック',
        link: 'feedback'
    }
]

const $doc = document;

const loc = {
    href: location.href,
    hash: location.hash.replace('#',''),
    search: Number(location.search.replace('?','')),
}

function $(dom) {
    if (dom.startsWith('.')) {
        return document.getElementsByClassName(dom.replace('.',''));
    } else {if (dom.startsWith('#')) {
        return document.getElementById(dom.replace('#',''));
    } else {
        return document.getElementsByTagName(dom);
    }}
}

var new_elm, text_box;
    function create(tag) {
        new_elm = $doc.createElement(tag);
    }

    function apC() {
        text_box.appendChild(new_elm);
    }

    function inB() {
        text_box.insertBefore(new_elm,text_box.firstChild);
    }


// header
text_box = $('body')[0];
create('header');
inB();

// a:index.html
text_box = $('header')[0];
create('a')
new_elm.id = 'header_a';
new_elm.href = '/index.html';
apC();

// img:favicon.png
text_box = $('#header_a');
create('img');
new_elm.src = '/favicon.png';
new_elm.alt = 'title';
new_elm.height = '100';
new_elm.align = 'left';
apC();

// h1#site_title
text_box = $('header')[0];
create('h1');
new_elm.id = 'site_title';
new_elm.innerText = 'pi-game';
apC();

// ul#header_menu_group
create('ul');
new_elm.id = 'header_menu_group';
apC();

text_box = $('#header_menu_group');
for (i=0; i<header_menu.length; i++) {
    // li.header_menu_item
    create('li');
    new_elm.className = 'header_menu_item';
    apC();

    // a
    text_box = $('.header_menu_item')[$('.header_menu_item').length - 1]
    create('a');
    new_elm.href = '/' + header_menu[i].link + '.html';
    new_elm.innerText = header_menu[i].txt;
    apC();
}

//link:page.css
text_box = $('head')[0];
create('link');
new_elm.rel = 'stylesheet';
new_elm.href = '/page.css';
apC();

// favicon
create('link');
new_elm.rel = 'shortcut icon';
new_elm.href = '/favicon.png';
apC();

// title
$('title')[0].innerText += ' |pi-game';

// 角丸長方形
function roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.arc(x+w-r, y+r, r, Math.PI*(3/2), 0);
    ctx.lineTo(x+w, y+h-r);
    ctx.arc(x+w-r, y+h-r, r, 0, Math.PI*(1/2));
    ctx.lineTo(x+r, y+h);
    ctx.arc(x+r, y+h-r, r, Math.PI*(1/2), Math.PI);
    ctx.lineTo(x, y+r);
    ctx.arc(x+r, y+r, r, Math.PI, Math.PI*(3/2));
}

function fillRoundRect(ctx, x, y, w, h, r) {
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
}

function strokeRoundRect(ctx, x, y, w, h, r) {
    roundRect(ctx, x, y, w, h, r);
    ctx.stroke();
}

// テキストの幅と高さ
function measureText(ctx, txt) {
    var foo = ctx.measureText(txt);
    return {
        width: foo.width,
        height: foo.actualBoundingBoxAscent + foo.actualBoundingBoxDescent
    }
}
