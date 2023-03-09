// 変数宣言
const $canvas = $doc.getElementById('canvas');
const ctx  = $canvas.getContext('2d');
const clickBtn = {
    x: 350,
    y: 175,
    w: 100,
    h: 50,
    r: 10
}
let optionBtn = [];
let click = false;
let click_num = 0;
let point = 0;
let acc = 1; // 加速度
let note = {
    start_time: 0,
    type: 0,
    achieve: 0
}
let btn_point = [1000,1000,1500,10000];
let click_perS = 0;

window.onload = function() {
    // オプションボタンの座標と範囲指定
    for (i=0; i<4; i++) {
        optionBtn.push({
            x: 316 * (i%2) + 192,
            y: 70 * (Math.floor(i/2)) + 385,
            w: 248,
            h: 50
        })
    }

    draw();
}

// ボタンがクリックされているか
$canvas.addEventListener('mouseup', function(e) {
    if (click) {
        var btn = e.target.getBoundingClientRect();
        var mouseX = e.clientX - btn.left;
        var mouseY = e.clientY - btn.top;
        for (i=0; i<5; i++) {
            // 範囲指定
            if (i==0) {
                var x = clickBtn.x;
                var y = clickBtn.y;
                var w = clickBtn.w;
                var h = clickBtn.h;
            } else {
                var x = optionBtn[i-1].x;
                var y = optionBtn[i-1].y;
                var w = optionBtn[i-1].w;
                var h = optionBtn[i-1].h;
            }

            // 範囲内でクリックしているか
            if (x-w/2 < mouseX && mouseX < x+w/2) {
                if (y-h/2 < mouseY && mouseY < y+h/2) {
                    // 関数を実行
                    if (i == 0) {
                        func_click();
                    } else if (i == 1) {
                        btn0();
                    } else if (i == 2) {
                        btn1();
                    } else if (i == 3) {
                        btn2();
                    } else if (i == 4) {
                        btn3();
                    }
                }
            }
        }
        click = false;
    }
})

// クリックされているのかを判定
$canvas.addEventListener('mousedown', function() {
    click = true;
})

// clickボタン描画
function draw_clickBtn() {
    // 描画(角丸長方形)
    var x = clickBtn.x - clickBtn.w / 2;
    var y = clickBtn.y - clickBtn.h / 2;
    var w = clickBtn.w;
    var h = clickBtn.h;
    var r = clickBtn.r;
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.arc(x+w-r, y+r, r, Math.PI*(3/2), 0);
    ctx.lineTo(x+w, y+h-r);
    ctx.arc(x+w-r, y+h-r, r, 0, Math.PI*(1/2));
    ctx.lineTo(x+r, y+h);
    ctx.arc(x+r, y+h-r, r, Math.PI*(1/2), Math.PI);
    ctx.lineTo(x, y+r);
    ctx.arc(x+r, y+r, r, Math.PI, Math.PI*(3/2))
    ctx.fill();
    ctx.closePath();

    // 文字描画
    ctx.beginPath();
    ctx.font = '30px serif';
    ctx.fillStyle = '#EDEFF1';
    var text = ctx.measureText('click');
    ctx.fillText('click', x+(w-text.width)/2, y+(h+16)/2)
    ctx.closePath();
}

// オプションボタン描画
function draw_btn(num, letter) {
    // 描画(長方形)
    var x = optionBtn[num].x;
    var y = optionBtn[num].y;
    var w = optionBtn[num].w;
    var h = optionBtn[num].h;
    ctx.rect(x-w/2, y-h/2, w, h);
    ctx.fillStyle = '#000';
    ctx.fill()
    
    // 文字描画
    ctx.beginPath();
    ctx.font = '16px Arial';
    ctx.fillStyle = '#EDEFF1';
    var text = ctx.measureText(letter);
    ctx.fillText(letter, x-text.width/2, y)
    ctx.closePath();
}

// クリック数・ポイント・注意書き描画
function draw_number() {
    ctx.fillStyle = '#EDEFF1';
    ctx.font = '22pt serif';
    ctx.fillText('click: ' + click_num, 25, 50); // クリック数
    ctx.fillText('point: ' + point, 25, 100) // ポイント

    // 注意書き
    if (Date.now() < note.start_time + 3000) {
        if (note.type == 0) {
            ctx.fillStyle = '#EC4079';
            ctx.fillText('not enough points!', 25, 250);
        } else {
            ctx.fillStyle = '#FFCA29';
            ctx.fillText((10 ** note.achieve) + 'points archived!', 25, 250)
        }
    }
}

// ポイント足らない宣言
function not_enough_points() {
    note = {
        start_time: Date.now(),
        type: 0,
        achieve: note.achieve
    }
}

// クリックボタン
function func_click() {
    click_num++;
    point += acc;
}

// 加速度上昇
function btn0() {
    if (point < btn_point[0]) {
        not_enough_points();
    } else {
        point -= btn_point[0];
        btn_point[0] += 100;
        acc++;
    }
}

// 1クリック/s
function btn1() {
    if (point < btn_point[1]) {
        not_enough_points();
    } else {
        point -= btn_point[1];
        btn_point[1] += 100;
        click_perS++;
    }
}

// 2クリック/s
function btn2() {
    if (point < btn_point[2]) {
        not_enough_points();
    } else {
        point -= btn_point[2]
        btn_point[2] += 100;
        click_perS += 2;
    }
}

// 加速度二倍
function btn3() {
    if (point < btn_point[3]) {
        not_enough_points();
    } else {
        point -= btn_point[3];
        btn_point[3] *= 2;
        acc *= 2;
    }
}

// ポイントが10の累乗点になったか判定
function if_archive() {
    if (point >= 10 ** (note.achieve + 1)) {
        note = {
            start_time: Date.now(),
            type: 1,
            achieve: note.achieve + 1
        }
        acc++;
    }
}

// 1秒間隔でクリック
setInterval(function() {
    for (i=0; i<click_perS; i++) {
        func_click();
    }
},1000)

// canvasに描画
function draw() {
    ctx.clearRect(0, 0, $canvas.width, $canvas.height) // canvasをリセット
    draw_clickBtn();
    draw_btn(0, `加速度↑ ${btn_point[0]}p`);
    draw_btn(1, `毎秒1クリック ${btn_point[1]}p`);
    draw_btn(2, `毎秒2クリック ${btn_point[2]}p`);
    draw_btn(3, `加速度2倍 ${btn_point[3]}p`);
    draw_number();
    if_archive();

    requestAnimationFrame(draw);
}
