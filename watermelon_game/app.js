// 参考:https://qiita.com/comefrombottom/items/244cdf905e9275b5ee5f
const $canvas = document.getElementById('canvas');
const ctx = $canvas.getContext('2d');
const ball_size = [10, 12, 14.4, 17.28, 20.736, 24.8832, 29.85984, 35.831808, 42.9981696, 51.59780352, 61.917364224, 74.300837069];
const ball_M = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const ball_color = ['#dc143c', '#ff6347', '#58427c', '#e6a800', '#ffa500', '#ff0800', '#ffcc66', '#ffcba4', '#fef263', '#e0de94', '#339933'];
const g = 7; // 重力加速度
let walls = [];
let balls = [];
let dt = 0; // Δt(時間の差)
let lastUpdate = Date.now();
let execution_speed = 1; // 実行速度 テスト用

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
    get polar_form() { // ベクトルを極形式で表す
        var magnitude = Math.sqrt(this.x**2 + this.y**2)
        return {r: magnitude, ang: Math.acos(this.x / magnitude)};
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
    static normalized(v1) { // 正規化(単位ベクトルにする)
        return Vector2.times(v1, 1/v1.magnitude);
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
        this.r = ball_size[size]; // 円の半径r
        this.M = ball_M[size]; // 質量M
        this.color = ball_color[size]; // 色
        this.pos = new Vector2(x, y); // 重心位置(x,y)
        this.v = Vector2.zero; // 速度v
        this.theta = 0; // 回転速度θ
        this.omega = 0; // 角速度ω
        this.I = 0.5 * this.M * this.r * this.r; // 慣性モーメントI
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
    update(dt) {
        this.pos.add(Vector2.times(this.v, dt)); // 位置の変更
        this.theta += this.omega * dt; // 回転速度の変更
        this.v.y += g * 60 * dt; // 重力
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI*2); // 円の描画
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
    }
}

// 初期化
function init() {
    dt = 0;
    // 壁の配置
    walls = [];
    walls.push([new Vector2(50, 700), new Vector2(400, 700)])
    walls.push([new Vector2(50, 100), new Vector2(50, 700)])
    walls.push([new Vector2(400, 100), new Vector2(400, 700)])
    // ボールの配置
    balls = [];
    balls.push(new Ball(0, 70, 50))
    balls.push(new Ball(1, 100, 50))
    balls.push(new Ball(2, 120, 50))
    balls.push(new Ball(3, 158, 50))
    balls.push(new Ball(4, 250, 50))
    balls.push(new Ball(5, 300, 50))
    balls.push(new Ball(6, 390, 50))
    balls.push(new Ball(7, 60, 150))
    balls.push(new Ball(8, 150, 150))
    balls.push(new Ball(9, 280, 150))
    balls.push(new Ball(10, 200, 250))
}

// ロードされたら
window.onload = () => {
    init(); // 初期化
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
    var normal_vec = new Vector2(line.a, line.b); // 法線ベクトルn(a,b)
    var t = (Vector2.dot(normal_vec, point) + line.c) / (normal_vec.magnitude ** 2) // t=(n・p+c)/(|n|^2)
    var tn = Vector2.times(normal_vec, t); // tn
    return tn;
}

// ボールの描画
function draw_balls() {
    balls.forEach(ball => {
        ball.update(dt); // 位置情報の更新
        ball.draw();
    });
}

// 壁の描画
function draw_walls() {

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

// ボールと壁との衝突
function hit_with_wall() {
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];

        for (let j = 0; j < walls.length; j++) {
            const wall = walls[j];
            var subV = dis_of_point_and_line(ball.pos, wall[0], wall[1]) // 円の中心から壁までのベクトル(最短距離)
            if (subV.magnitude == 0) continue;
            var overlap = ball.r - subV.magnitude; // 重なり合っている長さ
            if (overlap < 0) continue; // overlapが正なら衝突

            var nv = Vector2.normalized(subV); // 衝突面の法線ベクトル
            balls[i].pos.add(Vector2.times(nv, overlap)); // 重なり解消
            var dotV = -1*Vector2.dot(ball.v, nv); // 速度の衝突方向成分(衝突に向かう向きを正とする)
            if (dotV < 0) continue; // 衝突方向に向かっていかないのなら無視

            // 衝突+摩擦
            var polar_form = nv.polar_form; // nvの極形式
            var tan = new Vector2(Math.cos(polar_form.ang - Math.PI/2), Math.sin(polar_form.ang - Math.PI/2)); // 衝突面に平行な単位ベクトル
            var fDir = Vector2.times(tan, -1 * Math.sign(Vector2.dot(ball.v, tan) - ball.r * ball.omega)); // 摩擦の方向ベクトル
            // F=μN F:摩擦力, μ:動摩擦係数, N:垂直抗力
            // 垂直抗力の力積: dotV*ball.M
            var mu = 1; // 動摩擦係数
            balls[i].addImpulseLocal(Vector2.times(Vector2.add(nv, Vector2.times(fDir, mu)), Math.min(dotV, 50.0) * ball.M), Vector2.times(nv, -1*ball.r)) // 摩擦+垂直抗力
            // balls[i].addImpulseLocal(Vector2.times(nv, dotV*ball.M), Vector2.times(nv, -1*ball.r)); // 垂直抗力
        }
        
    }
}

// ボールとボールとの衝突
function hit_with_ball() {
    for (let i = 0; i < balls.length; i++) {
        const bl1 = balls[i];
        for (let j = 0; j < balls.length; j++) {
            const bl2 = balls[j];
            var subV = Vector2.sub(bl1.pos, bl2.pos); // 2つのボールの中心の差
            if (subV.magnitude == 0) continue;

            var overlap = (bl1.r + bl2.r - subV.magnitude); // 重なり合っている長さ
            if (overlap < 0) continue; // overlapが正なら衝突
            var nv = Vector2.normalized(subV); // 衝突面の法線ベクトル
            var solveV = Vector2.times(nv, overlap/2);
            balls[i].pos.add(solveV);
            balls[j].pos.sub(solveV);
            var dotV = Vector2.dot(Vector2.sub(bl2.v, bl1.v), nv); //速度の衝突方向成分(衝突に向かう向きを正とする)
            if (dotV < 0) continue; // 衝突方向に向いていかないのなら無視

            var polar_form = nv.polar_form; // nvの極形式
            var tan = new Vector2(Math.cos(polar_form.ang - Math.PI/2), Math.sin(polar_form.ang - Math.PI/2)); // 衝突面に平行な単位ベクトル
            var fDir = Vector2.times(tan, -1*Math.sign(Vector2.dot(Vector2.sub(bl1.v, bl2.v), tan) - bl1.r*bl1.omega - bl1.r*bl2.omega)); // 摩擦の方向ベクトル
            var impluse = Vector2.times(Vector2.add(nv, Vector2.times(fDir, 0.5)), Math.min(dotV, 50.0) * bl1.M*bl2.M / (bl1.M + bl2.M)); // 力積
            balls[i].addImpulseLocal(impluse, Vector2.times(nv, -1*bl1.r));
            balls[j].addImpulseLocal(Vector2.times(impluse, -1), Vector2.times(nv, bl2.r)); // 反作用
        }
        // console.log('速度', i, bl1.v)
    }
}

// ループ
function loop() {
    // Δt(1ループにかかった時間を計算)
    var now = Date.now();
    dt = (now - lastUpdate) / 1000 * execution_speed;
    lastUpdate = now;
    // console.log(dt)

    ctx.clearRect(0, 0, $canvas.width, $canvas.height); // canvasのリセット
    hit_with_wall(); // ボールと壁との衝突
    hit_with_ball(); // ボールとボールとの衝突
    draw_balls(); // ボールの描画
    draw_walls(); // 壁の描画
}

setInterval(loop, 0)
