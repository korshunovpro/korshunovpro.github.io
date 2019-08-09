// выбор игры
game = 'tetramino';

let tetrisTitle = [
    [
        [1,1,1],
        [0,1,0],
        [0,1,0],
        [0,1,0],
        [0,1,0]
    ],
    [
        [1,1,1],
        [1,0,0],
        [1,1,0],
        [1,0,0],
        [1,1,1]
    ],
    [
        [1,1,1],
        [0,1,0],
        [0,1,0],
        [0,1,0],
        [0,1,0],
    ],
    [
        [1,1,0],
        [1,0,1],
        [1,1,0],
        [1,0,1],
        [1,0,1],
    ],
    [
        [0,1,0],
        [0,1,0],
        [0,1,0],
        [0,1,0],
        [0,1,0],
    ],
    [
        [1,1,1],
        [1,0,0],
        [0,1,0],
        [0,0,1],
        [1,1,1],
    ],
];

// show splash screen
AZSplashScreen.show(function(){

    document.querySelector('body').classList.toggle('start');

    GAMES[game].game.drawBucket('h1', 5, 21);

    GAMES[game].game.drawLetter('h1', tetrisTitle[0], 1, 1, 0, 0, 'red');
    GAMES[game].game.drawLetter('h1', tetrisTitle[1], 1, 5, 0, 0, 'cyan');
    GAMES[game].game.drawLetter('h1', tetrisTitle[2], 1, 9, 0, 0, 'purple');
    GAMES[game].game.drawLetter('h1', tetrisTitle[3], 1, 13, 0, 0, 'green');
    GAMES[game].game.drawLetter('h1', tetrisTitle[4], 1, 16, 0, 0, 'blue');
    GAMES[game].game.drawLetter('h1', tetrisTitle[5], 1, 19, 0, 0, 'yellow');


    GAMES[game].game.drawBucket('h2', 5, 21);

    GAMES[game].game.drawLetter('h2', tetrisTitle[0], 1, 1, 0, 0, 'red');
    GAMES[game].game.drawLetter('h2', tetrisTitle[1], 1, 5, 0, 0, 'cyan');
    GAMES[game].game.drawLetter('h2', tetrisTitle[2], 1, 9, 0, 0, 'purple');
    GAMES[game].game.drawLetter('h2', tetrisTitle[3], 1, 13, 0, 0, 'green');
    GAMES[game].game.drawLetter('h2', tetrisTitle[4], 1, 16, 0, 0, 'blue');
    GAMES[game].game.drawLetter('h2', tetrisTitle[5], 1, 19, 0, 0, 'yellow');

    GAMES[game].game.init({row: 20, col:10});

    if (GAMES[game].game.music) {
        GAMES[game].game.Sound.music.stop(music);
    }

    GAMES[game].game.music = GAMES[game].game.Sound.music.play();
});

// GAMES[game].game.init({row: 20, col:10});
//
// if (GAMES[game].game.music) {
//     GAMES[game].game.Sound.music.stop(music);
// }
//
// GAMES[game].game.music = GAMES[game].game.Sound.music.play();

