const $input = $doc.getElementsByTagName('input')[0];
const $btn = $doc.getElementsByTagName('button');
const $guesses = $doc.getElementById('guesses');
const $result = $doc.getElementById('result');
let auto = {
    array: [50,25,12,6,3,2,1],
    No: 0,
    less: true
};
let guesses, number, guessesCount;

window.onload = function() {
    init();
}

function submit() {
    if ($btn[1].style.display == 'none') {
    if ($input.value == '') {
        alert('Please input number!');
    } else {
        guessesCount++;
        guesses = Number($input.value);
        $guesses.style.display = 'block';
        if ($guesses.innerText == 'Preview guesses:' && guessesCount < 7) {
            $guesses.innerText += ' ' + guesses} else {
            $guesses.innerText += ', ' + guesses}
            if (guesses == number) {
	            //クリア！
                $result.innerText = 'Congratulations! You got it right!';
                $result.style.background = '#0f0';
                $result.style.display = 'block';
                $btn[1].style.display = '';
            } else {
                if (guessesCount >= 7) {
	                //終わり！
                    $result.innerText = 'Game Over! Correct Number was ' + number + ' !';
                    $result.style.background = '#000';
                    $result.style.color = '#fff';
                    $result.style.display = 'block';
                    $btn[1].style.display = '';
                } else {
                    if (guesses > number) {
	                    //大きい！
                        $result.innerText = 'Wrong! Last guess is too high!';
                        $result.style.background = '#f00';
                        $result.style.display = 'block';
                    } else {
                        if (guesses < number) {
	                        //小さい！
                            $result.innerText = 'Wrong! Last guess is too low!';
                            $result.style.background = '#f00';
                            $result.style.display = 'block';
                        }
                    }
                }
            }
        $input.value = '';
        }
    }
}

function init() {
    $input.value = '';
    guessesCount = 0;
    number = Math.floor(Math.random() * 99) + 1;
    $btn[1].style.display = 'none';
    $guesses.style.display = 'none';
    $guesses.innerText = 'Preview guesses:'
    $result.style.display = 'none';
    $result.style.color = '#000';
}

function automatic() {
    for (i=0; i<auto.array.length; i++) {
        if (i == 0) {
            auto.No = 50;
        } else {
            if (auto.less) {
                auto.No -= auto.array[i];
            } else {
                auto.No += auto.array[i];
            }
        }
        $input.value = auto.No;
        submit();
        if ($result.innerText == 'Wrong! Last guess is too high!') {
            auto.less = true;
        } else {
            auto.less = false;
        }
    }
    $input.value = number;
}