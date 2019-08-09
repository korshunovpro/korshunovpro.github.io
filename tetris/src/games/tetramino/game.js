/**
 * @todo: моргающее убирание линий
 * @todo: генерация положений фигур при инициализации(как раз будет решена задача с разными системами вращения)
 * @todo: анимация при ударении об дно (моргание или вспышка фигуры)
 * @todo: events для функций отрисовки
 * @todo: игрок-компьютер в соседнем окне
 * @todo: анимация номера уровня при смене уровня
 * @todo: анимация нового Рекорда
 */
GAMES.tetramino.game = (function ()
{
    let _self = this;

    let buckets = {};

    _self.Sound = null;

    _self.music = 0;

    /*
     * Установки
     */
    let opt = {
        //
        bucketWrapperId: 'bucketWrapper',
        bucketNextWrapperId: 'bucketWrapperNext',
        bucketClassName: 'bucket',
        //
        col: 10,
        row: 20,
        //
        score: {
            figure: [0, 0, 4, 8, 6],
            line: 40
        },
        levelUp:1000,
        levelTime:2,
        highScoreVar: 'tetraminoHighScore',
        //
        speed: 1000,
        frameTimeRatio: 50,
        // game setup
        wallkicks: true
    };

    /**
     * Переменные во время игры
     */
    let Game = {
        fill: {},
        interval: {
            main: null,
            timer: null,
            pause: false
        },
        figures: [],
        count: {
            element: 0,
            line: 0,
            score: 0,
            timer: 0,
            level: 1
        },
        frame: {
            speed: opt.speed,
            row: 1,
            col: 1,
            offsetRow: 0,
            offsetCol: 0,
            figure: {
                code: '',
                type: [],
                cells: {},
                style:'default',
            },
            figureNext: {
                code: '',
                type: [],
                cells: {},
                style:'default'
            }
        },
        pause: false,
        next: true,
        gameOver: false,
        countdown:3
    };

    /**
     * Список фигур
     * @type {[*]}
     */
    let figuresList = {
        I: {
            type: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
            color: 'cyan'
        },
        O: {
            type: [[1, 1], [1, 1]],
            color: 'yellow'
        },
        S: {
            type: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
            color: 'green'
        },
        Z: {
            type: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
            color: 'red'
        },
        L: {
            type: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
            color: 'orange'
        },
        J: {
            type: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
            color: 'blue'
        },
        T: {
            type: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
            color: 'purple'
        }
    };

    /*
     ------------DRAWS function------------
     */

    /**
     * Рисует таблицу-стакан
     * @param bucketWrapperId
     * @param row
     * @param col
     * @returns {boolean}
     */
    _self.drawBucket = function (bucketWrapperId, row, col) {
        if (bucketWrapperId) {
            Game.fill[bucketWrapperId] = [];
            buckets[bucketWrapperId] = document.createElement('table');
            buckets[bucketWrapperId].className = opt.bucketClassName;
            for (let i = 1; i <= row; i++) {
                lineAdd(bucketWrapperId, buckets[bucketWrapperId], col, i);
            }
            document.getElementById(bucketWrapperId).appendChild(buckets[bucketWrapperId]);
            return true;
        }
        return false;
    };

    /**
     * Добавляет линию в таблицу, перед первым элементом
     * @param bucketWrapperId
     * @param table
     * @param col
     */
    function lineAdd(bucketWrapperId, table, col) {
        let row = document.createElement('tr');
        Game.fill[bucketWrapperId].unshift({});
        for (let i = 1; i <= col; i++) {
            let td = document.createElement('td');
            row.appendChild(td);
            Game.fill[bucketWrapperId][0][i] = 0;
        }
        table.insertBefore(row, table.firstChild);
    }

    /**
     * Удаляет линию
     * @param table
     * @param index
     */
    function lineRemove(table, index) {
        table.removeChild(table.childNodes[index]);
    }

    /**
     * Удаляет и добавляет линию
     * @param bucketWrapperId
     * @param index
     */
    function lineDestroy(bucketWrapperId, index) {
        lineRemove(buckets[bucketWrapperId], index-1);
        Game.fill[bucketWrapperId].splice(index-1, 1);
        lineAdd(bucketWrapperId, buckets[bucketWrapperId], opt.col);
    }

    /**
     * Пустые строки сверху и столбцы слева при первой отрисовке фигуры
     * что бы фигура рисовалась прижатой к потолку
     * @param figure
     */
    function drawInitOffset(figure) {

        let setOffsetRow = false;
        let offsetCol = 0;

        let offset = {
            offsetRow: 0,
            offsetCol: 0
        };

        // rows
        for (let r = 0; r < figure.length; r++) {
            // row offset
            if (figure[r].indexOf(1) >= 0 && !setOffsetRow && Game.frame.offsetRow < 1) {
                setOffsetRow = true;
                offset.offsetRow = r;
            }

            // cols
            for (let c = 0; c < figure[r].length; c++) {
                // col offset
                if (figure[r][c] == 1 && offsetCol > c) {
                    offsetCol = c;
                }
            }
        }

        if (Game.frame.offsetCol < 1) {
            offset.offsetCol = offsetCol;
        }
        return offset;
    }

    /**
     * Проверка что клетки для отрисовки не заняты и не выходят за рамки стакана
     *
     * @param bucketWrapperId
     * @param figure
     * @param row
     * @param col
     * @param rotate
     * @param currentFigureCells
     *
     * @returns {boolean}
     */
    function canDrawElement(bucketWrapperId, figure, row, col, currentFigureCells, rotate, more) {

        rotate = (rotate || false);
        more = (more || 0);

        // rows
        for (let r = 0; r < figure.length; r++) {

            // row top/bottom
            if ( /*//(figure[r].indexOf(1) > -1 && (row + r) - Game.frame.offsetRow <= 0) || // проваливается за потолок при повороте */
                 (figure[r].indexOf(1) > -1 && (row + r) - Game.frame.offsetRow > opt.row)
            ) {
                return false;
            }

            // cols
            for (let c = 0; c < figure[r].length; c++) {

                // left/right wall
                if ((figure[r][c] === 1 && (col + c) - Game.frame.offsetCol <= 0)
                    || ((figure[r][c] === 1 && (col + c) - Game.frame.offsetCol > opt.col)
                        || (figure[r][c] === 1 && (col + c) - Game.frame.offsetCol <= 0)
                    )
                ) {

                    if (opt.wallkicks === true && (more < 1 || (Game.frame.figure.code == 'I' && more <= 1 )) ) {

                        /*wall kick left*/
                        if (rotate && (col + c) - Game.frame.offsetCol <=0 ) {
                            if (canDrawElement(bucketWrapperId, figure, row, (col+1), currentFigureCells, rotate, ++more)) {
                                Game.frame.col++;
                                return true;
                            }
                        }
                        /*wall kick right*/
                        if (rotate && (col + c) - Game.frame.offsetCol > opt.col ) {
                            if (canDrawElement(bucketWrapperId, figure, row, (col-1), currentFigureCells, rotate, ++more)) {
                                Game.frame.col--;
                                return true;
                            }
                        }
                    }
                    return false;
                }

                // left/right figure
                if (((row + r) - Game.frame.offsetRow - 1) >= 0 && figure[r][c] === 1 && Game.fill[bucketWrapperId][(row + r) - Game.frame.offsetRow - 1][(col + c) - Game.frame.offsetCol] === 1
                    && (
                        typeof currentFigureCells[(row + r) - Game.frame.offsetRow] === 'undefined'
                        || (typeof currentFigureCells[(row + r) - Game.frame.offsetRow] !== 'undefined'
                            && typeof currentFigureCells[(row + r) - Game.frame.offsetRow][(col + c) - Game.frame.offsetCol] === 'undefined'
                        )
                    )
                ) {
                    if (opt.wallkicks === true && (more < 1 || (Game.frame.figure.code == 'I' && more <= 1 )) ) {

                        /*wall kick left*/
                        if (rotate && (col + c) - Game.frame.offsetCol <= col) {
                            if (canDrawElement(bucketWrapperId, figure, row, (col+1), currentFigureCells, rotate, ++more)) {
                                Game.frame.col++;
                                return true;
                            }
                        }

                        /*wall kick right*/
                        if (rotate && (col + c) - Game.frame.offsetCol > col) {
                            if (canDrawElement(bucketWrapperId, figure, row, (col-1), currentFigureCells, rotate, ++more)) {
                                Game.frame.col--;
                                return true;
                            }
                        }
                    }

                    return false;
                }
            }
        }

        return true;
    }

    function drawGhost(bucketWrapperId, figure, row, col, offsetRow, offsetCol, currentFigureCells) {
        let down = false;
        while (!down) {
            if (!canDrawElement(bucketWrapperId, figure, row, col, currentFigureCells)) {
                row--;
                down = true;
                for (let r = 0; r < figure.length; r++) {
                    // blocks
                    for (let c = 0; c < figure[r].length; c++) {
                        if (figure[r][c] === 1 && (row + r) - offsetRow > 0 ) {
                            drawGhostBlock(bucketWrapperId, (row + r) - offsetRow, (col + c) - offsetCol);
                        }
                    }
                }
            }
            row++;
        }
    }

    function drawGhostBlock(bucketWrapperId, y, x) {
        document.querySelector('#' + bucketWrapperId + ' tr:nth-child(' + y + ')' + ' td:nth-child(' + x + ')').classList.add('ghost');
    }

    function eraseGhost(bucketWrapperId) {
        let elems = document.querySelectorAll('#' + bucketWrapperId + ' td.ghost');
        for (let i = 0; i < elems.length; i++) {
            elems[i].classList.remove('ghost');
        }
    }

    /**
     * Рисует элемент в основном стакане
     * @param bucketWrapperId
     * @param figure
     * @param row
     * @param col
     * @param offsetRow
     * @param offsetCol
     * @param style
     * @returns {*}
     */
    function drawElement(bucketWrapperId, figure, row, col, offsetRow, offsetCol, style) {
        let cells = {};
        for (let r = 0; r < figure.length; r++) {
            // blocks
            for (let c = 0; c < figure[r].length; c++) {
                if (figure[r][c] === 1 && (row + r) - offsetRow > 0 ) {
                    draw(bucketWrapperId, (row + r) - offsetRow, (col + c) - offsetCol, style);

                    Game.fill[bucketWrapperId][(row + r) - offsetRow - 1][(col + c) - offsetCol] = 1;

                    if (!cells[(row + r) - offsetRow]) cells[(row + r) - offsetRow] = {};
                    cells[(row + r) - offsetRow][(col + c) - offsetCol] = 1
                }
            }
        }
        return cells;
    }

    _self.drawLetter = function(bucketWrapperId, figure, row, col, offsetRow, offsetCol, style) {
        drawElement(bucketWrapperId, figure, row, col, offsetRow, offsetCol, style);
    };

    /**
     *
     * @param bucketWrapperId
     * @param y
     * @param x
     * @param style
     */
    function draw(bucketWrapperId, y, x, style) {
        let b = document.createElement('div');
        b.classList.add('block', style);
        document.querySelector('#' + bucketWrapperId + ' tr:nth-child(' + y + ')' + ' td:nth-child(' + x + ')').appendChild(b);
    }

    /**
     * Удаление блоков фигуры из ячейки
     * @param bucketWrapperId
     * @param cells
     */
    function eraseElement(bucketWrapperId, cells) {
        for (let r in cells) {
            for (let c in cells[r]) {
                document.querySelector('#' + bucketWrapperId + ' tr:nth-child(' + r + ')' + ' td:nth-child(' + c + ')').innerHTML = "";
                Game.fill[bucketWrapperId][r-1][c] = 0;
            }
        }
    }

    /**
     * Удаление блоков фигуры из ячейки
     * @param bucketWrapperId

     */
    function clear(bucketWrapperId) {
        for (let r in Game.fill[bucketWrapperId]) {
            for (let c in Game.fill[bucketWrapperId][r]) {
                document.querySelector('#' + bucketWrapperId + ' tr:nth-child(' + (parseInt(r) + 1) + ')' + ' td:nth-child(' + c + ')').innerHTML = "";
                Game.fill[bucketWrapperId][r][c] = 0;
            }
        }
    }

    /**
     * Поворачивает фигуру
     * @param figure
     * @returns {*}
     */
    function rotateFigure(figure) {
        let col = figure[0].length;
        let row = figure.length;
        let rotateFigure = [];

        for (let l = 0; l < 1; l++) {
            rotateFigure = [];
            for (let r = row - 1; r >= 0; r--) {
                for (let c = 0; c < col; c++) {
                    if ((!rotateFigure[c])) {
                        rotateFigure[c] = [];
                    }
                    rotateFigure[c].push(figure[r][c]);
                }
            }
        }
        return rotateFigure;
    }

    /*
     ----------- MOVE -----------
     */
    /**
     * Переворот фигуры
     */
    function rotate() {
        if (!Game.next && !Game.pause) {
            let newRotate = rotateFigure(Game.frame.figure.type);
            if (res = canDrawElement(opt.bucketWrapperId, newRotate, Game.frame.row, Game.frame.col, Game.frame.figure.cells, true) && Game.frame.figure.type.length != 2) {

                _self.Sound.blockRotate.play();
                eraseElement(opt.bucketWrapperId, Game.frame.figure.cells);
                Game.frame.figure.type = newRotate;
                Game.frame.figure.cells = drawElement(opt.bucketWrapperId, Game.frame.figure.type, Game.frame.row, Game.frame.col, Game.frame.offsetRow, Game.frame.offsetCol, Game.frame.figure.style);

                eraseGhost(opt.bucketWrapperId);
                drawGhost(opt.bucketWrapperId, Game.frame.figure.type, Game.frame.row, Game.frame.col, Game.frame.offsetRow, Game.frame.offsetCol,  Game.frame.figure.cells);

            }
        }
    }

    /**
     * Перемещение влево
     */
    function left() {
        if (!Game.next && !Game.pause) {
            Game.frame.col--;
            if (canDrawElement(opt.bucketWrapperId, Game.frame.figure.type, Game.frame.row, Game.frame.col, Game.frame.figure.cells)) {
                _self.Sound.moving.play();
                eraseElement(opt.bucketWrapperId, Game.frame.figure.cells);
                Game.frame.figure.cells = drawElement(opt.bucketWrapperId, Game.frame.figure.type, Game.frame.row, Game.frame.col, Game.frame.offsetRow, Game.frame.offsetCol, Game.frame.figure.style);

                eraseGhost(opt.bucketWrapperId);
                drawGhost(opt.bucketWrapperId, Game.frame.figure.type, Game.frame.row, Game.frame.col, Game.frame.offsetRow, Game.frame.offsetCol,  Game.frame.figure.cells);

            } else {
                Game.frame.col++;
            }
        }
    }

    /**
     * Перемещение вправо
     */
    function right() {
        if (!Game.next && !Game.pause) {
            Game.frame.col++;
            if (canDrawElement(opt.bucketWrapperId, Game.frame.figure.type, Game.frame.row, Game.frame.col, Game.frame.figure.cells)) {
                _self.Sound.moving.play();
                eraseElement(opt.bucketWrapperId, Game.frame.figure.cells);
                Game.frame.figure.cells = drawElement(opt.bucketWrapperId, Game.frame.figure.type, Game.frame.row, Game.frame.col, Game.frame.offsetRow, Game.frame.offsetCol, Game.frame.figure.style);

                eraseGhost(opt.bucketWrapperId);
                drawGhost(opt.bucketWrapperId, Game.frame.figure.type, Game.frame.row, Game.frame.col, Game.frame.offsetRow, Game.frame.offsetCol,  Game.frame.figure.cells);


            } else {
                Game.frame.col--;
            }
        }
    }

    /**
     * Перемещение вниз
     */
    function down() {
        if (!Game.next && !Game.pause) {
            Game.frame.row++;
            if (canDrawElement(opt.bucketWrapperId, Game.frame.figure.type, Game.frame.row, Game.frame.col, Game.frame.figure.cells)) {

                eraseElement(opt.bucketWrapperId, Game.frame.figure.cells);
                Game.frame.figure.cells = drawElement(opt.bucketWrapperId, Game.frame.figure.type, Game.frame.row, Game.frame.col, Game.frame.offsetRow, Game.frame.offsetCol, Game.frame.figure.style);

                eraseGhost(opt.bucketWrapperId);
                drawGhost(opt.bucketWrapperId, Game.frame.figure.type, Game.frame.row, Game.frame.col, Game.frame.offsetRow, Game.frame.offsetCol,  Game.frame.figure.cells);

                return true;
            } else {
                Game.frame.row--;
                return false;
            }
        }
    }

    /*
     ----------- / MOVE -----------
     */

    /**
     * "Центральная" линия/колонка
     * @param count
     * @param length
     * @returns {number}
     */
    function getCenter(count, length) {
        return Math.round((count / 2 - Math.round(length / 2)) + 1);
    }

    /**
     * Рандом
     * @param min
     * @param max
     * @returns {*}
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Случайная фигура в случайной ротации
     * @returns {*}
     */
    function getRandomFigure() {
        let keys = Object.keys(Game.figures);
        return [keys[getRandomInt(0, (keys.length - 1))], Game.figures[keys[getRandomInt(0, (keys.length - 1))]]];
    }

    /**
     * Проверка что все ячейки заполнены
     * @param obj
     * @param value
     * @returns {*}
     */
    function checkValueInObject(obj, value) {
        for( let key in obj ) {
            if( obj.hasOwnProperty( key ) ) {
                if( obj[key] === value ) {
                    return key;
                }
            }
        }
        return false;
    }

    /**
     * @returns {number}
     */
    function timestamp() {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    }

    /*
     ------------/ DRAWS function------------
     */

    /**
     * Старт новой игры
     * @param mode
     */
    _self.newGame = function (mode) {

        if (Game.pause) {
            _self.pause();
        }

        gameReset();

        if (!music) {
            _self.Sound.music.play(music);
        }

        // очистка поля
        clear(opt.bucketWrapperId);
        clear(opt.bucketNextWrapperId);
        eraseGhost(opt.bucketWrapperId);

        // figures
        Game.figures = figuresList;

        // set trigger
        Game.next = true;

        document.querySelector('body').classList.remove('start', 'modal-open');
        document.querySelector('#gameOver #newRecord').style.display = 'none';
        document.querySelector('#bucketWrapper table').style.opacity = 1;
        document.querySelector('#gameOver').classList.remove('show');

        Game.countdown = 3;
        run();
        Game.gameOver = false;
        Game.pause = false;

    };

    Game.fps = 60;
    Game.dt = 0;
    Game.dtTime = 0;
    Game.dtCounter = 0;
    Game.now = 0;
    Game.last = timestamp();
    Game.timeRatio = opt.frameTimeRatio;
    Game.step = 1/Game.fps;

    let run = function() {

        showTime();
        function frame() {

            let stepRatio = (Game.timeRatio * Game.step);

            Game.now = timestamp();
            Game.dt = Game.dt + Math.min(1, (Game.now - Game.last) / 1000);

            while(Game.dt > stepRatio && !Game.gameOver) {
                Game.dt = Game.dt - stepRatio;
                move();
            }

            Game.dtTime = Game.dtTime + Math.min(1, (Game.now - Game.last) / 1000);
            while(Game.dtTime > (60 * Game.step)  && !Game.gameOver) {
                Game.dtTime = Game.dtTime - (60 * Game.step);

                if (!Game.pause && Game.countdown < 0) {
                    showTime();
                } else if (!Game.pause && Game.countdown >= 0) {
                    showCountdown();
                }
            }

            showScore();
            showLine();
            showHighScore();

            if (!Game.gameOver && Game.countdown < 0) {
                nextFigure(Game.dt/Game.timeRatio);
            }

            Game.last = Game.now;
            requestAnimationFrame(frame, document.getElementById('gameWrapper'));
        }

        requestAnimationFrame(frame);
    };


    function showCountdown() {
        console.log('xxxx')
        let c = document.querySelector('#countdown');
        if (Game.countdown <= 0) {
            c.innerText = '';
            c.style.display = 'none;'
        } else if (Game.countdown > 0) {
            c.innerText = Game.countdown;
        }
        Game.countdown--;
    }

    /**
     * Start Game, основной цикл, начало новой фигуры
     */
    function nextFigure() {

        if (Game.next && !Game.pause && !Game.gameOver) {

            let figure;

            // установка уровня
            Game.count.level = 1 + Math.floor(Game.count.score/opt.levelUp);
            Game.timeRatio = opt.frameTimeRatio - Game.count.level/10; // @todo: от уровня

            showLevel();

            // установка текущей и следующей фигуры
            if (Game.frame.figureNext.type.length > 0) {
                Game.frame.figure.type = Game.frame.figureNext.type;
                Game.frame.figure.code = Game.frame.figureNext.code;
                Game.frame.figure.cells = {};
                Game.frame.figure.style = Game.frame.figureNext.style;
            } else {
                // случайная фигура
                figure = getRandomFigure();
                Game.frame.figure.type = figure[1].type;
                Game.frame.figure.code = figure[0];
                Game.frame.figure.cells = {};
                Game.frame.figure.style = figure[1].color;
            }
            // случайная следующая фигура
            figure = getRandomFigure();
            Game.frame.figureNext.type = figure[1].type;
            Game.frame.figureNext.code = figure[0];
            Game.frame.figureNext.cells = {};
            Game.frame.figureNext.style = figure[1].color;

            clear(opt.bucketNextWrapperId);
            drawElement(opt.bucketNextWrapperId, Game.frame.figureNext.type, getCenter(4, Game.frame.figureNext.type.length), getCenter(5, Game.frame.figureNext.type[0].length), 0, 0, Game.frame.figureNext.style);


            // / случайная следующая фигура

            Game.frame.row = 0;
            Game.frame.col = getCenter(opt.col, Game.frame.figure.type[0].length);


            let offsets = drawInitOffset(Game.frame.figure.type);
            Game.frame.offsetRow = offsets.offsetRow;
            Game.frame.offsetCol = offsets.offsetCol;

            // отрисовка новой фигуры сверху
            if (canDrawElement(opt.bucketWrapperId, Game.frame.figure.type, Game.frame.row, Game.frame.col, Game.frame.figure.cells)) {
                eraseElement(opt.bucketWrapperId, Game.frame.figure.cells);
                Game.frame.figure.cells = drawElement(opt.bucketWrapperId, Game.frame.figure.type, Game.frame.row, Game.frame.col, Game.frame.offsetRow, Game.frame.offsetCol, Game.frame.figure.style);

                eraseGhost(opt.bucketWrapperId);
                drawGhost(opt.bucketWrapperId, Game.frame.figure.type, Game.frame.row, Game.frame.col, Game.frame.offsetRow, Game.frame.offsetCol, Game.frame.figure.cells);

            } else {
                gameOver();
            }

            Game.next = false;
        }
    }

    /**
     * Кадр
     */
    function move() {

        if (Game.frame.figure.type.length > 0 && !Game.next && !Game.gameOver) {
            //
            if(Game.pause) {}
            else if(down()) {  }
            else {

                Game.next = true;

                // следующая фигура
                // if (Game.frame.figure.type.length && Game.frame.row < 1) {
                //
                // }

                if (Game.timeRatio < 1) {
                    _self.Sound.forceHit.play();
                } else {
                    _self.Sound.slowHit.play();
                }

                // очки
                Game.count.score += opt.score.figure[Game.frame.figure.type.length];
                showScore();

                // стирание заполненных линий
                let count = 0;
                for (let i = ((Game.frame.row - Game.frame.offsetRow) + Game.frame.figure.type.length) - 1; i >= Game.frame.row - Game.frame.offsetRow ; i--) {
                    if (typeof Game.fill[opt.bucketWrapperId][i-1] !== 'undefined' && !checkValueInObject(Game.fill[opt.bucketWrapperId][i-1], 0) ) {
                        lineDestroy(opt.bucketWrapperId, i);
                        i++;
                        count++;
                    }
                }

                if (count) {
                    _self.Sound.lineRemove.play();
                }

                Game.count.line += count;
                Game.count.score += ((Game.count.level * opt.score.line) * count);
                showLine();
                showScore();

                return false
            }
        }
    }

    /**
     * Сброс игры
     */
    function gameReset() {

        Game.figures = [];

        // reset counter
        Game.count.element = 0;
        Game.count.line = 0;
        Game.count.timer = -1;
        Game.count.score = 0;
        Game.count.level = 1;

        // reset frame data
        Game.frame.row = 1;
        Game.frame.col = 1;
        Game.frame.figure.type = [];
        Game.frame.figure.cells = {};
        Game.frame.figureNext.type = [];
        Game.frame.figureNext.cells = {};
        Game.frame.speed = opt.speed;
        Game.frame.offsetRow = 0;
        Game.frame.offsetCol = 0;

        document.querySelector('#countdown').style.display = 'block';

        Game.pause = false;
        Game.next = true;
    }

    /**
     * gameOver
     */
    function gameOver() {
        Game.pause = true;
        let newHiScore = false;
        if (( localStorage.getItem(opt.highScoreVar) || 0) < Game.count.score ) {
            newHiScore = true;
            localStorage.setItem(opt.highScoreVar, Game.count.score);
        }
        showGameOver(newHiScore,  Game.count.score);
    }

    _self.pause = function () {

        if (Game.gameOver) return;
        Game.pause = !Game.pause;
        _self.Sound.pause.play();
        if (!Game.pause) {
            _self.Sound.music.play();
            clearInterval(Game.interval.pause);
            document.querySelector('.pause').classList.remove('blink');
            document.querySelector('#bucketWrapper').classList.remove('blink');
        } else {
            _self.Sound.music.pause();
            document.querySelector('.pause').classList.add('blink');
            document.querySelector('#bucketWrapper').classList.add('blink');
            Game.interval.pause = setInterval(function(){
                document.querySelector('.pause').classList.toggle('blink');
                document.querySelector('#bucketWrapper').classList.toggle('blink');
            }, 300);
        }
    };

    /**
     * Init
     */
    _self.init = function (settings) {

        _self.Sound = new GAMES.tetramino.audio();

        let btn = document.querySelectorAll('.btn');
        for (let bt of btn) {
            bt.onmouseenter = function() { // курсор зашёл на элемент-родитель [mozilla.org]
                _self.Sound.moving.play();
            }
        }

        music = null;

        document.onkeydown = controlDown;
        document.onkeyup = controlUp;
        document.onmousedown = disableclick;

        for (let op in settings) {
            if (opt.hasOwnProperty(op)) {
                opt[op] = settings[op];
            }
        }

        _self.drawBucket(opt.bucketWrapperId, opt.row, opt.col);
        _self.drawBucket(opt.bucketNextWrapperId, 4, 5);

        let modalControls = document.querySelectorAll('.modal .controls .btn, .modal .close');
        for(let i=0; i< modalControls.length; i++) {
            let bt = modalControls[i];
            bt.onclick = function() {
                document.querySelector('body').classList.remove('modal-open');
                if (!(bt.classList.contains('close')) ) {
                    bt.parentNode.parentNode.classList.remove('show');
                } else {
                    bt.parentNode.classList.remove('show');
                }

                if (bt.classList.contains('new')) {
                    _self.newGame('classic');
                    return false;
                }

                if (bt.classList.contains('goToStart')) {
                    let b = document.querySelector('body');
                    _self.pause();
                    gameReset();
                    b.classList.add('start');
                    _self.Sound.music.stop(music);
                    _self.Sound.music.play();
                }
            };
        }
    };

    /*
     ------------------SHOWS---------------
     */
    function showScore() {
        document.querySelector('#score .value').innerText = (('000000' + Game.count.score).slice(-6)).toString();
    }

    function showLevel() {
        document.querySelector('#level .value').innerText = ('00' + Game.count.level).slice(-3);
    }

    function showHighScore() {
        document.querySelector('#scoreHigh .value').innerText = ('000000' + (localStorage.getItem(opt.highScoreVar) || 0)).slice(-6);
    }

    function showLine() {
        document.querySelector('#line .value').innerText = ('000' + Game.count.line).slice(-4);
    }

    function showTime() {
        Game.count.timer++;
        let h = (Game.count.timer >= 3600) ? Math.floor(Game.count.timer / 3600) : 0;
        let m = (Game.count.timer >= 60) ? (Math.floor((Game.count.timer - h * 3600) / 60)) : 0;
        let s = Math.floor(Game.count.timer - (h * 3600 + m * 60));
        document.querySelector('#time .value').innerText = ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
    }

    function showGameOver(newHiScore) {
        _self.Sound.music.stop();
        _self.Sound.gameover.play();
        document.querySelector('#gameOver #gameScore .value').innerText =  (Game.count.score || 0);
        if (newHiScore) {
            document.querySelector('#gameOver #newRecord .value').innerText = localStorage.getItem(opt.highScoreVar);
            document.querySelector('#gameOver #newRecord').style.display = 'block';
        }
        document.querySelector('body').classList.add('modal-open');
        document.querySelector('#gameOver').classList.add('show');
    }

    _self.showModal = function(id) {
        let mod = document.querySelector('#' + id);
        if (mod) {
            if (!Game.gameOver) {
                if (!Game.pause) {
                    _self.pause();
                }
            }
            mod.classList.add('show');
            document.querySelector('body').classList.add('modal-open');
        }
    };

    /*
     ------------------CONTROL events---------------
     */
    // key DOWN
    function controlDown(e) {
        e = e || window.event;
        if (e.keyCode == '40') {// down arrow
            e.preventDefault();
            down();
        }
        else if (e.keyCode == '38') {// up arrow
            e.preventDefault();
            rotate();
        }
        else if (e.keyCode == '37') {// left
            e.preventDefault();
            left();
        }
        else if (e.keyCode == '39') {// right
            e.preventDefault();
            right();
        }
        else if ((e.keyCode === 0 || e.keyCode === 32) && !Game.pause) {// space
            dropDown(e);
        }
        else if (e.keyCode == '80') {// right
            e.preventDefault();
            _self.pause();
        }
        else if (e.keyCode === 90 ) {// n
            function hold() {

            }
        }
    }

    // key UP
    function controlUp(e) {}

    /*
     ------------------CONTROL actions---------------
     */
    /**
     * "Сброс" фигуры вниз
     */
    function dropDown(e) {
        e.preventDefault();
        Game.timeRatio = 0.3;
    }


    function disableclick(event) {
        if(event.button==2) {
            //return false;
        }
    }

    return _self;

})();