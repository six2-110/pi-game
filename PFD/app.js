const $canvas = $doc.getElementById('canvas');
const ctx = $canvas.getContext('2d');
const prime = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];
const Level = {
    prime_num: [3, 4, 6, 9, 16],
    title: ['EASY', 'NORMAL', 'HARD', 'EXPERT', 'INSANE'],
    row: [3, 2, 3, 3, 4],
    time: 60000
}
const Scene = {
    mode_select: 'mode_select',
    playing: 'playing',
    result: 'result'
}
const btn = {
    mode_select: [
        // modeBtn
        {x: 175, y: 200, w: 150, h: 40}, // EASY
        {x: 175, y: 260, w: 150, h: 40}, // NORMAL
        {x: 175, y: 320, w: 150, h: 40}, // HARD
        {x: 175, y: 380, w: 150, h: 40}, // EXPERT
        {x: 175, y: 440, w: 150, h: 40}, // INSANE
    ],
    playing: [
        {x: 320, y: 150, w: 80, h: 40}, // enter
        {x: 410, y: 150, w: 80, h: 40} // bs
    ],
    result: [
        {x: 175, y: 400, w: 150, h: 50}
    ],
    prime: {w: 100, h: 40}
}
const time_limit = 60000;
const darking_time = 3000;
let scene = Scene.mode_select;
let click = false;
let level = 0;
let number, start_time, score;
let input = [];

// 数字生成
function create_num() {
    var num = 1
    for (i=0; i<Math.ceil(Math.random() * 5); i++) {
        num *= prime[Math.floor(Math.random() * Level.prime_num[level])];
    }
    return num;
}

// 素数ボタン座標取得
function loc_prime(lv, i) {
    var x = 260 - Level.row[level]*60 + 120*(i % Level.row[level]);
    var y = 240 + Math.floor(i / Level.row[level]) * 60;
    return {x: x, y: y};
}

// 待つ
function delay(n) {
    return new Promise(function(resolve) {
        setTimeout(resolve, n);
    });
}

// モードボタン・タイトル描画
function draw_modeSelect() {
    // タイトル-枠
    ctx.strokeStyle = '#333';
    ctx.font = '55px Serif';
    ctx.lineWidth = 5;
    var txt = measureText(ctx, '素因数分解ゲーム')
    ctx.strokeText('素因数分解ゲーム', 250-txt.width/2, 100);

    // タイトル-中身
    ctx.fillStyle = '#ff99cf';
    ctx.lineWidth = 0;
    ctx.fillText('素因数分解ゲーム', 250-txt.width/2, 100)

    // モードボタン
    for (i=0; i<Level.title.length; i++) {
        var level = Level.title[i];
        // 角丸長方形
        ctx.beginPath();
        ctx.fillStyle = '#b8ff66';
        var x = btn.mode_select[i].x;
        var y = btn.mode_select[i].y;
        var w = btn.mode_select[i].w;
        var h = btn.mode_select[i].h;
        var r = 10;
        fillRoundRect(ctx, x, y, w, h, r);

        // ボタンのテキスト
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        var txt = measureText(ctx, level);
        ctx.fillText(level, x+(w-txt.width)/2, y+(h+txt.height)/2);
        ctx.closePath();
    }
}

// 数字描画
function draw_num() {
    ctx.beginPath();
    ctx.fillStyle = '#b8ff66';
    ctx.rect(50, 50, 400, 50);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '30px digital';
    var txt = measureText(ctx, number);
    ctx.fillText(number, 250-txt.width/2, 75+txt.height/2);
    ctx.closePath();
}

// 入力したものの描画
function draw_input() {
    ctx.beginPath();
    // 枠描画
    ctx.fillStyle = '#99ffc9';
    fillRoundRect(ctx, 10, 150, 300, 40, 10);

    // テキスト作成
    var foo = [];
    for (i=0; i<input.length; i++) {
        foo.push(prime[input[i]], ' x ')
    }
    foo.pop();

    // テキスト描画
    ctx.fillStyle = '#fff';
    ctx.font = '26px digital';
    var text = foo.join('');
    var txt = measureText(ctx, text);
    ctx.fillText(text, 160-txt.width/2, 170+txt.height/2);
    ctx.closePath();
}

// enterボタン描画
function draw_enter() {
    // 枠
    ctx.beginPath();
    ctx.fillStyle = '#99cfff';
    fillRoundRect(ctx, 320, 150, 80, 40, 10);
    ctx.closePath();

    // 形
    ctx.beginPath();
    ctx.fillStyle = '#333';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.moveTo(330, 175);
    ctx.lineTo(350, 165);

    ctx.lineTo(350, 173);
    ctx.lineTo(378, 173);
    ctx.lineTo(378, 160);
    ctx.lineTo(382, 160);
    ctx.lineTo(382, 177);
    ctx.lineTo(350, 177);

    ctx.lineTo(350, 185);
    ctx.lineTo(330, 175);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

// bsボタン描画
function draw_bs() {
    // 枠
    ctx.beginPath();
    ctx.fillStyle = '#c999ff';
    fillRoundRect(ctx, 410, 150, 80, 40, 10);
    ctx.closePath();

    // 形
    ctx.beginPath();
    ctx.fillStyle = '#333';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.moveTo(435, 170);
    ctx.lineTo(445, 160);
    ctx.lineTo(465, 160);
    ctx.lineTo(465, 180);
    ctx.lineTo(445, 180);
    ctx.lineTo(435, 170);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    // バツ
    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.moveTo(450, 165);
    ctx.lineTo(460, 175);
    ctx.moveTo(450, 175);
    ctx.lineTo(460, 165);
    ctx.stroke();
    ctx.closePath();
}

// 素数ボタン描画
function draw_prime() {
    for (i=0; i<Level.prime_num[level]; i++) {
        ctx.beginPath();
        var x = loc_prime(level, i).x;
        var y = loc_prime(level, i).y;

        ctx.fillStyle = '#ff99cf';
        fillRoundRect(ctx, x, y, btn.prime.w, btn.prime.h, 10);
        
        ctx.fillStyle = '#fff';
        ctx.font = '24px digital';
        var txt = measureText(ctx, prime[i]);
        ctx.fillText(prime[i], x+50-txt.width/2, y+20+txt.height/2);
        ctx.closePath();
    }
}

// 残り時間描画
function draw_time() {
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.font = '24px CL';
    var txt = measureText(ctx, 'time:');
    ctx.fillText('time:', 10, 10+txt.height);

    ctx.fillStyle = '#ffad66';
    ctx.strokeStyle = '#ffad66';
    ctx.rect(20+txt.width, 10, 200, txt.height);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    if (!(Date.now() - start_time >= time_limit)) {
        ctx.rect(20+txt.width, 10, 200*(1-(Date.now()-start_time)/time_limit), txt.height);
    }
    ctx.fill();
    ctx.closePath();

    if (start_time + time_limit < Date.now()) {
        scene = Scene.result;
    }
}

// スコア描画
function draw_score() {
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.font = '24px CL';
    txt = measureText(ctx, 'score: '+score);
    ctx.fillText('score: '+score, 490-txt.width, 10+txt.height);
    ctx.closePath();
}

// プレイ画面を暗く
function darken() {
    ctx.beginPath();
    if (start_time + time_limit + darking_time < Date.now()) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.rect(0, 0, $canvas.width, $canvas.height);
    } else {
        ctx.fillStyle = `rgba(0, 0, 0, ${(Date.now() - (start_time + time_limit)) / darking_time / 1.25})`;
        ctx.rect(0, 0, $canvas.width, $canvas.height);
    }
    ctx.fill();
    ctx.closePath();
}

// 結果発表
function draw_result() {
    ctx.beginPath();
    ctx.font = '40px Impact';
    ctx.fillStyle = '#fff';
    var txt = measureText(ctx, 'RESULT');
    ctx.fillText('RESULT', 250-txt.width/2, 50+txt.height)

    ctx.font = '30px CL';
    var txt = measureText(ctx, score+'pt');
    ctx.fillText(score+'pt', 250-txt.width/2, 150+txt.height);
    ctx.closePath();
}

// ホームへ戻るボタン描画
function draw_nextBtn() {
    ctx.beginPath();
    ctx.fillStyle = '#b8ff66';
    var x = btn.result[0].x;
    var y = btn.result[0].y;
    var w = btn.result[0].w;
    var h = btn.result[0].h;
    fillRoundRect(ctx, x, y, w, h, 10);
    
    ctx.fillStyle = '#fff';
    ctx.font = '30px Impact';
    var txt = measureText(ctx, 'NEXT');
    ctx.fillText('NEXT', 250-txt.width/2, y+(h+txt.height)/2);
    ctx.closePath();
}

// モードボタンクリック時
function modeBtn(num) {
    level = num;
    number = create_num();
    scene = Scene.playing;
    start_time = Date.now();
    score = 0;
}

// enterボタンクリック時
async function enterBtn() {
    if (input.length != 0) {
        var time = Date.now();
        var i = 0
        for (i=0; i<input.length; i++) {
            if (number % prime[input[i]] == 0) {
                number /= prime[input[i]];
            } else {
                start_time -= 1000;
                
                ctx.closePath();
                break;
            }

            await delay(300);
        }
        input = [];

        if (number == 1) {
            // 正解
            number = create_num();
            start_time += 200;
            score += 10;
        }
    }
}

// bsボタンクリック時
function bsBtn() {
    input.pop();
}

// 素数ボタンクリック時
function primeBtn(num) {
    input.push(num);
}

// ホームへ戻るボタンクリック時
function nextBtn() {
    level = 0;
    score = 0;
    input = [];
    scene = Scene.mode_select;
}

// クリックされているか判定
function if_click(mouseX, mouseY) {
    for (i=0; i<btn[scene].length+(scene==Scene.playing)*(Level.prime_num[level]); i++) {
        if (scene == Scene.playing && i >= btn.playing.length) { 
            var hoge = loc_prime(level, i-btn.playing.length);
            var range = {
                x: hoge.x,
                y: hoge.y,
                w: btn.prime.w,
                h: btn.prime.h
            };
        } else {
            var foo = btn[scene][i]
            var range = {
                x: foo.x,
                y: foo.y,
                w: foo.w,
                h: foo.h
            };
        }

        if (range.x < mouseX && mouseX < range.x + range.w) {
            if (range.y < mouseY && mouseY < range.y + range.h) {
                if (scene == Scene.mode_select) {
                    modeBtn(i);
                } else if (scene == Scene.playing) {
                    if (i == 0) {
                        enterBtn();
                    } else if (i == 1) {
                        bsBtn();
                    } else if (i >= btn.playing.length) {
                        primeBtn(i-btn.playing.length);
                    }
                } else if (scene == Scene.result) {
                    nextBtn();
                }
            }
        }
    }
}

// キー判定
$canvas.addEventListener('mouseup', (e) => {
    if (click) {
        var foo = e.target.getBoundingClientRect();
        var mouseX = e.clientX - foo.left;
        var mouseY = e.clientY - foo.top;
        if_click(mouseX, mouseY);
    }
    click = false;
})

$canvas.addEventListener('mousedown', () => {
    click = true;
})

// 描画
function draw() {
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    if (scene == Scene.mode_select) {
        // モードセレクト時
        draw_modeSelect();

    } else if (scene == Scene.playing || scene == Scene.result) {
        // ゲームプレイ時
        draw_num();
        draw_input();
        draw_enter();
        draw_bs();
        draw_prime();
        draw_time();
        draw_score();
    }

    if (scene == Scene.result) {
        // 結果発表時
        darken();
        draw_result();
        draw_nextBtn();
    }

    requestAnimationFrame(draw);
}

draw();
