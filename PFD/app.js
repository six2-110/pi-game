const prime = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53]
const level_title = ['EASY','NORMAL','HARD','EXPERT','INSANE']
const level = [3,4,6,9,13]
const Scene = {
    home: 'home',
    play: 'play',
    result: 'result'
}
const scene_list = ['home','play','result'];
const display = ['none', 'block'];
let scene = Scene.home;
let input = []
let display_circle = false;
let number, mode, circle_start_time;

setInterval(function() {
    if (scene == Scene.home) {
        if (mode != undefined) {
            $('#start').classList.add('active')
        }
    }
    // そのモードのやつだけ表示させる
    for (i=0; i<scene_list.length; i++) {
        a = scene_list[i]
        $('#' + a).style.display = display[(scene == Scene[a])? 1 : 0]
    }
    // #input に入力したものを表示
    $('#input').innerText = '';
    for (i=0; i<input.length; i++) {
        if (i != 0) {
            $('#input').innerText += '×';
        }
        $('#input').innerText += prime[input[i]];
    }
	 if (input.length == 0) {
	     $('#input').innerText = 1;
	 }
	 
    // #number に数字を表示
    $('#number').innerText = number;
	 
	 // #circle を表示
	 if (display_circle) {
	     if (Date.now() < circle_start_time + 1000) {
		      $('#circle').style.display = 'block';
		  } else {
		      display_circle = false;
		  }
	 } else {
	     $('#circle').style.display = 'none';
	 }
},16)

// モード選択のボタンを配置
function modeBtn_set() {
    text_box = $('#mode')
    for (i=0; i<level_title.length; i++) {
        create('a');
        new_elm.className = 'mode_btn';
        new_elm.id = 'mode_btn' + i;
        new_elm.innerText = level_title[i];
        new_elm.onclick = func_modeBtn;
        apC()
    }
    text_box = $('#start_p')
    create('a');
    new_elm.id = 'start';
    new_elm.innerText = 'START';
    new_elm.onclick = func_startBtn;
    apC();
}

// 素数のボタンを配置
function prime_set() {
    $('#level').innerText = level_title[mode]
    text_box = $('#prime');
    for (i=0; i<level[mode]; i++) {
        create('a');
        new_elm.className = 'prime';
        new_elm.id = 'prime'+i;
        new_elm.onclick = func_primeBtn;
        new_elm.innerText = prime[i];
        apC();
    }
}

// モード選択のボタンが押されたときの処理
function func_modeBtn(e) {
    if (mode != undefined) {
        $('#mode_btn'+mode).classList.remove('active')
    }
    mode = e.target.id.split('').pop();
    $('#mode_btn'+mode).classList.add('active');
}

// スタートボタンが押されたときの処理
function func_startBtn() {
    if (mode != undefined) {
        prime_set();
        scene = Scene.play;
		  number = create_number(mode);
    }
}

// 素数のボタンが押されたときの処理
function func_primeBtn() {
    if (input.length < 11) {
        target = Number(event.target.id.replace('prime',''));
        input.push(target);
    }
}

// enter のボタンが押されたときの処理
function func_enterBtn() {
    enter_start = Date.now();
    i = 0;
	 clear = true;
    while (i < input.length) {
	     //if ((Date.now() - enter_start) > (300 * i)) {
		      if (number % prime[input[i]] == 0) {
				    number = number / prime[input[i]];
				} else {
				    i = input.length;
					 clear = false;
				}
				i++
				
		      if ((number == 1) && (i != (input.length))) {
	             clear = false;
					 i = input.length;
	         }
		  //}
		  $('#number').innerText = number;
	 }
	 
	 if (number != 1) {
	     clear = false;
	 }
	 
	 input = [];
    if (clear) {
	     number = create_number(mode);
		  display_circle = true;
		  circle_start_time = Date.now();
	 }
}

// number 生成
function create_number(num_level) {
    var number_result = 1;
    for (i=0; i<level[num_level]; i++) {
	     for (i2=0; i2<(Math.floor(3 * Math.random())); i2++) {
		      number_result *= prime[i];
		  }
	 }
	 if (number_result == 1) {
	     create_number(num_level);
	 } else {
	     return number_result;
	 }
}

// backspace が押されたときの処理
function func_backBtn() {
    input.pop()
}

$('#enter').addEventListener('click',func_enterBtn);
$('#backspace_parent').addEventListener('click',func_backBtn);

function test() {mode = 1;func_startBtn();}

window.onload = function() {
    modeBtn_set();
}
