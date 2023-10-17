const $doc = document;
const $ = (id) => {
    return $doc.getElementById(id)
}
let card_num = 0;
let img_li = [];
let change_ok = true;
let num_img = 15

function wait(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    });
}

function count_elm(elm) {
    var res = 0;
    for (i=0; i<img_li.length; i++) {
        if (img_li[i] == elm) {
            res++;
        }
    }
    return res;
}

function set_img_li() {
    num_img = Number($('how_many_kind_chars').value)
    img_li = [];
    num_same_elm = 3;
    card_num = 0;
    for (i=0; i<num_img*num_same_elm; i++) {
        var foo = Math.ceil(Math.random() * num_img);
        if (count_elm(foo) < num_same_elm) {
            img_li.push(foo)
        }
    }
}

async function change_btn() {
    if (change_ok && img_li.length != 0) {
        change_ok = false;
        $('char').src = 'img/black.png';
        await wait(1000);

        $('char').src = `img/${img_li[0]}.png`;
        img_li.shift();
        card_num++;
        change_ok = true;
    }
}

function card_num_reset() {
    card_num = 0;
    $('char').src = 'img/black.png';
}

function card_reset() {
    set_img_li();
    $('char').src = 'img/black.png';
}

function player_plus_btn() {
    // tr挿入
    var parent = $('score-box');
    var new_tr = document.createElement('tr');
    new_tr.className = 'score_tr';
    parent.appendChild(new_tr);

    // td２つ挿入
    var $trs = document.getElementsByClassName('score_tr');
    parent = $trs[$trs.length - 1];
    for (i=0; i<2; i++) {
        var new_td = document.createElement('td');
        new_td.className = 'td' + i;
        parent.appendChild(new_td);
    }
    
    // tdにinputタグ挿入
    for (i=0; i<2; i++) {
        var tds = document.getElementsByClassName('td' + i);
        parent = tds[tds.length - 1];
        new_elm = document.createElement('input');
        if (i == 0) {
            new_elm.className = 'name_input';
        } else {
            new_elm.className = 'score_input';
            new_elm.type = 'number';
            new_elm.value = 0;
        }
        parent.appendChild(new_elm)
    }
}

$('change').addEventListener('click', change_btn)
$('card_reset').addEventListener('click', function() {
    if (window.confirm('are you sure?')) {
        card_reset()
    }
})
$('card_num_reset').addEventListener('click', card_num_reset)
$('player_plus').addEventListener('click', player_plus_btn)

window.onload = () => {
    card_reset();
}

setInterval(function() {
    $('card_num').innerText = '枚数: ' + card_num;
    $('li_len').innerText = '残り: ' + img_li.length;
    $('range_num').innerText = $('how_many_kind_chars').value
}, 16)
