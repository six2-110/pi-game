const $canvas = document.getElementById('canvas');
const ctx = $canvas.getContext('2d');
const ball_size = [10, 12, 14.4, 17.28, 20.736, 24.8832, 29.85984, 35.831808, 42.9981696, 51.59780352, 61.917364224, 74.300837069];
const ball_M = [1, 1, 1, 1, 1, 1];
const ball_color = ['#dc143c', '#ff6347', '#58427c', '#e6a800', '#ffa500', '#ff0800', '#ffcc66', '#ffcba4', '#fef263', '#e0de94', '#339933'];
const g = 9.8; // 重力加速度
let walls = [];
let balls = [];
let delta = 0;
let frame = 0;

// x成分とy成分を持つ2次元ベクトル
class Vector2 {
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }
    set(x, y) { // xとyをセットする
        this.x = x;
        this.y = y;
        return this;
    }
    clone() { // ベクトルの複製
        return new Vector2(this.x, this.y);
    }
    add(v) { // ベクトルの加法
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    sub(v) { // ベクトルの減法
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    times(num) { // ベクトルの実数倍
        this.x *= num;
        this.y *= num;
        return this;
    }
    get magnitude() { // ベクトルの大きさを取得
        const {x, y} = this;
        return Math.sqrt(x**2 + y**2);
    }
    static add(v1, v2) { // staticな足し算
        return v1.clone().add(v2);
    }
    static sub(v1, v2) { // staticな引き算
        return v1.clone().sub(v2);
    }
    static times(v1, num) { // staticな実数倍
        return v1.clone().times(num);
    }
    static dot(v1, v2) { // ベクトルの内積
        return (v1.x * v2.x + v1.y * v2.y);
    }
    static cross(v1, v2) { // ベクトルの外積
        return (v1.x * v2.y - v1.y * v2.x);
    }
    static distance(v1, v2) { // 2点間の距離
        return Vector2.sub(v1, v2).magnitude;
    }
    // よく使うベクトルたち
    static get zero() {
        return new Vector2(0,0);
    }
    static get one() {
        return new Vector2(1, 1);
    }
    static get right() {
        return new Vector2(1, 0);
    }
    static get left() {
        return new Vector2(-1, 0);
    }
    static get up() {
        return new Vector2(0, 1);
    }
    static get down() {
        return new Vector2(0, -1);
    }
}

// ボールの挙動
class Ball {
    constructor(size, x, y) {
        this.r = ball_size[size]; // 円の半径
        this.M = ball_M[size]; // 質量
        this.color = ball_color[size]; // 色
        this.pos = new Vector2(x, y); // 重心位置
        this.v = Vector2.zero; // 速度
        this.theta = 0; // 回転速度
        this.omega = 0; // 角速度
        this.I = 0.5 * this.M * this.r * this.r; // 慣性モーメント
    }
    // 重心を中心とした相対座標から力積を加える
    addImpulseLocal(impulse, addLocalPos) {
        this.v.add(Vector2.times(impulse, 1/this.M)); // Δv=P/M (P=(力積))
        this.omega += Vector2.cross(addLocalPos, impulse) / this.I; // Δω=(r×P)/I (外積)(r=(重心からの位置ベクトル))
    }
    // 絶対座標から力積を加える
    addImpuse(impulse, addPos) {
        this.addImpulseLocal(impulse, Vector2.sub(addPos, this.pos));
    }
    update(delta) {
        // console.log(this.pos, this.v, delta, Vector2.times(this.v, delta))
        this.pos.add(Vector2.times(this.v, delta)); // 位置の変更
        this.theta += this.omega * delta; // 回転速度の変更
        this.v.y += g * 60 * delta;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI*2); // 円の描画
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

// 初期化
function init() {
    delta = 0;
}

// ロードされたら
window.onload = () => {
    loop(); // ゲームループ開始

    balls.push(new Ball(0, 50, 50))
    balls.push(new Ball(1, 80, 50))
    balls.push(new Ball(2, 120, 50))
    balls.push(new Ball(3, 158, 50))
    balls.push(new Ball(4, 250, 50))
    balls.push(new Ball(5, 300, 50))
    balls.push(new Ball(6, 350, 50))
    balls.push(new Ball(7, 50, 150))
    balls.push(new Ball(8, 150, 150))
    balls.push(new Ball(9, 280, 150))
    balls.push(new Ball(10, 200, 250))

}

// 2点から直線の式を導出する
function Equation_of_a_line_by_two_points(line_start, line_end) { // ガウスの掃き出し法を用いて 3元1次方程式を解く
    // 4次元ベクトルの減算・実数倍の定義
    function sub(a, b) {var res = {}; Object.keys(a).forEach(k => res[k] = a[k] - b[k]); return res;} // 減算
    function tim(a, n) {var res = {}; Object.keys(a).forEach(k => res[k] = a[k] * n); return res;} // 実数倍

    var result = {a: 0, b: 0, c: 1}; // line: ax+by+c=0
    var formula = [{a: line_start.x, b: line_start.y, c: 1, d: 0},  // 代入 x1a+y1b+c=0 ― Ⅰ
        {a: line_end.x, b: line_end.y, c: 1, d: 0}] // x2a+y2b+c=0 (dは右辺の数値) ― Ⅱ
    formula.push({a: 1, b: 1, c: 1, d: 1}) // a+b+c=1 という情報を追加(a,b,cを一意に定めるため) ― Ⅲ

    formula[0] = tim(formula[0], 1/formula[0].a); // Ⅰのaの係数を1にする
    formula[1] = sub(formula[1], tim(formula[0], formula[1].a)) // Ⅱのaの係数を0にする
    formula[2] = sub(formula[2], tim(formula[0], formula[2].a)) // Ⅲのaの係数を0にする

    formula[1] = tim(formula[1], 1/formula[1].b); // Ⅱのbの係数を1にする
    formula[0] = sub(formula[0], tim(formula[1], formula[0].b)) // Ⅰのbの係数を0にする
    formula[2] = sub(formula[2], tim(formula[1], formula[2].b)) // Ⅲのbの係数を0にする

    formula[2] = tim(formula[2], 1/formula[2].c); // Ⅲのcの係数を1にする
    formula[0] = sub(formula[0], tim(formula[2], formula[0].c)) // Ⅰのcの係数を0にする
    formula[1] = sub(formula[1], tim(formula[2], formula[1].c)) // Ⅱのcの係数を0にする

    result.a = formula[0].d;
    result.b = formula[1].d;
    result.c = formula[2].d;
    return result;
}

// 点と直線の距離
function dis_of_point_and_line (point, line_start, line_end) {
    var line = Equation_of_a_line_by_two_points(line_start, line_end); // line: ax+by+c=0
    var assign = line.a * point.x + line.b * point.y + line.c; // ax0+by0+c
    var abs = sqrt(line.a ** 2 + line.b ** 2); // sqrt(a^2+b^2)
    return Math.abs(assign) / abs;
}

// ボールの描画
function draw_balls() {
    balls.forEach(ball => {
        ball.update(delta); // 位置情報の更新
        ball.draw();
    });
}

// 壁の描画
function draw_walls() {
    walls = [[new Vector2(50, 700), new Vector2(400, 700)]]; // 壁の配置

    walls.forEach(wall => {
        ctx.beginPath();
        ctx.strokeStyle = '#000'; // 壁の色
        ctx.lineWidth = 5; // 壁の太さ

        ctx.moveTo(wall[0].x, wall[0].y); // 始点
        ctx.lineTo(wall[1].x, wall[1].y) // 終点
        ctx.stroke() // 描画
        ctx.closePath();
    })
}

// ループ
function loop() {
    delta = 0.016;
    ctx.clearRect(0, 0, $canvas.width, $canvas.height); // canvasのリセット
    draw_balls(); // ボールの描画
    draw_walls(); // 壁の描画
}

setInterval(loop, 16)