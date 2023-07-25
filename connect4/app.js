// ----変数定義----
const $canvas = document.getElementById('canvas');
const ctx = $canvas.getContext('2d');
const Fall = { // コインが落ちる時の情報
    firstSpeed: 0, // 初速度
    acceleration: 1, // 加速度
    // coe_restitution: 0.1 // 反発係数
}
const Scene = { // ゲーム全体のシーン
    home: 'home',
    play: 'play',
    result: 'result'
}
const C_Scene = { // コインのシーン
    think: 'think',
    fall: 'fall',
    stop: 'stop'
}
const BOX_Size = { // boxの大きさ
    width: 7,
    height: 6
}
const ElmState = { // boxの要素の状態
    none: 'none',
    red: 'red',
    yel: 'yellow'
}
const Btn = { // ボタンの情報
    round: {
        // 円形ボタン
        right: { // 右矢印ボタン
            x: 465,
            y: 505,
            r: 25,
            img: 'right_btn.png',
            key: 'ArrowRight',
            scene: Scene.play,
            func: handleRightEvent
        },
        go: { // GOボタン
            x: 405,
            y: 505,
            r: 25,
            img: 'go_btn.png',
            key: 'Enter',
            scene: Scene.play,
            func: handleGoEvent
        },
        left: { // 左矢印ボタン
            x: 345,
            y: 505,
            r: 25,
            img: 'left_btn.png',
            key: 'ArrowLeft',
            scene: Scene.play,
            func: handleLeftEvent
        }
    },
    rect: {
        // 矩形ボタン
        start: {
            x: 150,
            y: 200,
            w: 200,
            h: 100,
            img: 'start_btn.png',
            key: 'Enter',
            scene: Scene.home,
            func: handleStartEvent
        },
        retry: {
            x: 150,
            y: 200,
            w: 200,
            h: 100,
            img: 'retry_btn.png',
            key: 'Enter',
            scene: Scene.result,
            func: handleRetryEvent
        }
    }
}
let clear = {
    is_done: false,
    done_coin: [],
    color: '',
}
let time = {
    start: 0,
    clear: 0
}
let scene, selected_row, elState, frame, coin_li, img_alpha;

// -----初期化-----
function init() {
    // 変数の初期化
    scene = Scene.home; // シーン
    selected_row = 3; // 選択されている行
    elState = []; // boxの要素
    frame = 0; // フレーム数
    coin_li = []; // coinのリスト
    img_alpha = 1; // sceneがplayになった直後の画像の透明度
    clear.is_done = false;
    clear.done_coin = [];
    time.start = 0;
    time.clear = 0;
    // boxの要素を初期化
    for (i=0; i<BOX_Size.width; i++) {
        elState.push([]);
        for (j=0; j<BOX_Size.height; j++) {
            elState[elState.length - 1].push(ElmState.none);
        }
    }
}

// 画像描画
function drawImg(Img, x, y, alpha = 1) {
    var img = new Image();
    img.src = './img/' + Img;
    ctx.beginPath();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, x, y);
    ctx.closePath();
}

// -----ボタンの処理-----
// スタートボタン
function handleStartEvent() {
    scene = Scene.play;
    img_alpha = 0;
    coin_li.push(new Coin(ElmState.red));
    time.start = Date.now();
    frame = 0; // フレーム数をゼロに
}

// コインを右に移動させる処理
function handleRightEvent() {
    selected_row += 1;
    if (selected_row == 7) {
        selected_row = 0;
    }
}
// コインを左に移動させる処理
function handleLeftEvent() {
    selected_row += -1;
    if (selected_row == -1) {
        selected_row = 6;
    }
}
// コインを今選択されている列で決定させる処理
function handleGoEvent() {
    if (img_alpha >= 1) { // 画像の透明度が1以上になったら
        coin_li[coin_li.length-1].go();
    }
}

// ゲームを再度プレイさせる処理
function handleRetryEvent() {
    init();
    handleStartEvent();
}

// -----イベント追加-----
// キーが押されたときの処理
document.addEventListener('keydown', function(e) {
    Object.keys(Btn).forEach(bar => {
        var hoge = Btn[bar]
        Object.keys(hoge).forEach(elm => {
            var btn = hoge[elm];

            if (e.key == btn.key && scene == btn.scene) {
                btn.func();
            }
        });
    });
});

// ボタンが押されたときの処理
$canvas.addEventListener('click', function(e) {
    Object.keys(Btn).forEach(bar => {
        var hoge = Btn[bar]
        Object.keys(hoge).forEach(elm => {
            var btn = hoge[elm];
            var rect = e.target.getBoundingClientRect();
            var pos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            }

            if (bar == 'round') {
                // 円形ボタン
                if ((btn.x - pos.x) ** 2 + (btn.y - pos.y) ** 2 <= btn.r ** 2) {
                    btn.func();
                }
            } else if (bar == 'rect') {
                // 矩形ボタン
                if (btn.x < pos.x && pos.x < btn.x + btn.w) {
                    if (btn.y < pos.y && pos.y < btn.y + btn.h) {
                        btn.func();
                    }
                }
            }
        });
    });
})

// -----コインの挙動-----
class Coin {
    // 初期化
    constructor(color) {
        this.color = color;
        this.column = 0;
        this.row = selected_row;
        this.scene = C_Scene.think;
        this.fall_goal = 0;
        this.speed = Fall.firstSpeed;
        this.x = 0
        this.y = 0
        // this.bound = false; // (this.sceneが'fall'のとき)コインが跳ね返って上へ上がっているか(false=>下へ落ちている)
    }
    // GOボタンが押されたときの処理
    go() {
        if (elState[this.row][0] == 'none' && this.scene == C_Scene.think) {
            this.scene = C_Scene.fall;
            var fall_col = elState[this.row].findIndex((elm) => elm != 'none') - 1; // 落ちる行数
            if (fall_col == -2) {
                fall_col = 5;
            }

            this.column = fall_col;
            this.fall_goal = 105 + 60 * fall_col;
            this.y = 21;
            this.speed = Fall.firstSpeed;

            frame = 0; // フレーム数をゼロに
        }
    }
    // クリア判定
    is_cleared() {
        var same_color_coin_num = { // 同じ色のコインの数
            vertical: 0, // 縦
            horizontal: 0, // 横
            right_oblique: 0, // 右斜め(右肩上がり)
            left_oblique: 0 // 左斜め(右肩下がり)
        }
        var cleared = [];
        // 縦・横・斜めに並んでいる同じ色のコインの数を数える
        Object.keys(same_color_coin_num).forEach(elm => {
            var li = [];
            for (i=0; i<2; i++) {
                var k = 0
                var j = (i == 0) ? -1 : 1;

                var while_row = () => {
                    return this.row+((elm == 'vertical') ? 0 : j)
                }
                var while_column = () => {
                    return this.column+((elm == 'horizontal') ? 0 : ((elm == 'left_oblique') ? j : (-1)*j))
                }
                while (0 <= while_row() && while_row() < 7 && elState[while_row()][while_column()] == this.color) {
                    li.push({
                        row: while_row(),
                        column: while_column()
                    })
                    if (i == 0) {
                        j--;
                    } else {
                        j++;
                    }
                    k++;
                }
                same_color_coin_num[elm] += k
            }
            same_color_coin_num[elm]++;
            li.push({
                row: this.row,
                column: this.column
            })
            if (li.length >= 4) {
                for (i=0; i<li.length; i++) {
                    cleared.push(li[i]);
                }
            }
        });
        return {
            is_done: (cleared.length == 0) ? false : true,
            done_coin: cleared,
        };
    }
    // コインの描画
    draw() {
        if (this.scene == C_Scene.fall) {
            // 落ちているとき
            var acce = Fall.acceleration; // 加速度
            
            this.speed += acce; // speedに加速度を追加
            this.y += 21 + this.speed; // y座標を計算

            if (this.y+this.speed+acce >= this.fall_goal) { // もし落ちるのが終了したら
                this.scene = C_Scene.stop; // sceneをstopにする
                elState[this.row][this.column] = this.color; // boxの要素に自身を追加する
                
                var foo = this.is_cleared(); // クリアしたか判定
                console.log(foo)
                if (foo.is_done) {
                    // クリアしたら
                    clear.is_done = true;
                    clear.done_coin = foo.done_coin; // クリアしたコインたちをclear.done_coinに格納
                    clear.color = this.color;
                    time.clear = Date.now();
                } else {
                    // クリアしてなかったら
                    coin_li.push(new Coin(this.color == ElmState.red ? ElmState.yel : ElmState.red)) // 新たなコインを作成
                }
            }

        } else if (this.scene == C_Scene.stop) {
            // 止まっているとき
            this.y = 105 + 60 * this.column;

        } else {
            // コインの位置を選択中のとき
            this.y = 21;
            this.row = selected_row;
        }

        var cImg = this.color == ElmState.red ? './coin_r.png' : './coin_y.png';
        this.x = 45+60*this.row
        drawImg(cImg, this.x, this.y, img_alpha);
    }
}

// -----描画-----
function draw() {
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    if (scene == Scene.home) {
        // ホーム画面のとき
        var txt = 'connnect4';
        ctx.font = '50pt Arial';
        ctx.fillStyle = '#e60000';
        ctx.strokeStyle = '#e6e600';
        ctx.lineWidth = 3;
        var txtSize = measureText(ctx, txt);
        ctx.fillText(txt, 250-txtSize.width/2, 100);
        ctx.strokeText(txt, 250-txtSize.width/2, 100);

    } else {
        // プレイ中のとき
        coin_li.forEach(coin => {
            coin.draw(); // コイン描画
        });

        drawImg('box.png', 35, 80, img_alpha); // box描画

        // クリアされたら
        if (clear.is_done) {
            clear.done_coin.forEach(elm => {
                var x = 45 + 60 * elm.row + 25;
                var y = 105 + 60 * elm.column + 25;
                
                ctx.beginPath();
                ctx.strokeStyle = (clear.color == ElmState.red) ? '#ff0000' : '#ffff00';
                ctx.lineWidth = 3;
                ctx.arc(x, y, 25 + 5*Math.abs(Math.sin((Date.now()-time.clear)/1000*2*Math.PI)), 0, 2*Math.PI)
                ctx.stroke();
                ctx.closePath();
            });

            if (Date.now() - time.clear > 3000) {
                // クリアされて3秒経ったら
                scene = Scene.result;

                // 結果表示
                ctx.beginPath();
                ctx.globalAlpha = 0.9;
                ctx.fillStyle = '#333'
                ctx.rect(25, 50, 450, 450);
                ctx.fill()
                ctx.globalAlpha = 1;

                var txt = ((clear.color == ElmState.red) ? 'Red' : 'Yellow') + ' Win!';
                ctx.font = '50pt Arial';
                ctx.fillStyle = (clear.color == ElmState.red) ? '#ff0000' : '#ffff00';
                var txtSize = measureText(ctx, txt);
                ctx.fillText(txt, 250-txtSize.width/2, 150);
                ctx.closePath();
            }
        }
    }
    // ボタン描画
    Object.keys(Btn).forEach(foo => {
        var bar = Btn[foo]
        Object.keys(bar).forEach(hoge => {
            var btn = bar[hoge];
            if (btn.scene == scene) {
                // 透明度
                if (scene == Scene.play && img_alpha < 1) {
                    img_alpha = (Date.now() - time.start) / 1000
                }

                if (foo == 'round') {
                    drawImg(btn.img, btn.x-btn.r, btn.y-btn.r, img_alpha); // 円形のボタン
                } else if (foo == 'rect') {
                    drawImg(btn.img, btn.x, btn.y, img_alpha) // 矩形のボタン
                }
            }
        })
    });

    frame++;
    requestAnimationFrame(draw); // drawをまた実行する
}

// 最初に行われる処理
window.onload = function() {
    init(); // 初期化
    draw(); // 描画
}
