/*
 --------------- TETRO ----------------------------------
 */
if (typeof window.TETRO !== 'undefined') var TETRO = {};

TETRO = (function () {

    var _self = this;

    // temp vars
    var TIMER = {
        time: null,
        step: 60,
        dt: 0
    };

    var spawnOffset = 0;

    /**
     * @type {{grid: Array, width: number, height: number}}
     */
    var Stack = {
        grid: [],
        width: 10,
        height: 20 + spawnOffset // spawn offset
    };

    /**
     * @type {{}}
     */
    var State = {
        
        row: 0,
        col: 0,
        
        pieceCounter: 0,

        ActivePiece: {
            id: 0,
            piece: {
                name: null,
                figure: null,
                color: null
            },
            cells: {},
            onFloor : false
        }
    };

    /**
     * Pieces type
     */
    var Pieces = {
        I: {
            name: 'I',
            figure: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            color: 'cyan'
        },
        O: {
            name: 'O',
            figure: [
                [0, 1, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ],
            color: 'yellow'
        },
        S: {
            name: 'S',
            figure: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            color: 'green'
        },
        Z: {
            name: 'Z',
            figure: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            color: 'red'
        },
        L: {
            name: 'L',
            figure: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: 'orange'
        },
        J: {
            name: 'J',
            figure: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: 'blue'
        },
        T: {
            name: 'T',
            figure: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: 'purple'
        }
    };

    /**
     * Init empty playfield
     * @returns {boolean}
     */
    function initStack() {
        Stack.grid = [];
        for (var r = 0; r < Stack.height; r++) {
            Stack.grid.unshift({});
            addLineToStack();
        }
        return true;
    }

    function addLineToStack() {
        for (var c = 0; c < Stack.width; c++) {
            Stack.grid[0][c] = 0;
        }
        return true;
    }

    /**
     * @param piece
     * @param row
     * @param col
     * @returns {{}}
     */
    function fillPiece(piece, row, col) {
        var cells = {};
        for (var r = 0; r < piece.length; r++) {
            // blocks
            for (var c = 0; c < piece[r].length; c++) {
                if (row + r >= 0) {
                    if (piece[r][c] === 1) {
                        Stack.grid[row + r][col + c] = 1;
                        if (typeof cells[row + r] === 'undefined') cells[row + r] = {};
                        cells[row + r][col + c] = 1;
                    } else {
                        if (typeof cells[row + r] === 'undefined') cells[row + r] = {};
                        cells[row + r][col + c] = 0;
                    }
                }
            }
        }
        return cells;
    }

    /**
     * @param cells
     */
    function clearPiece(cells) {
        for (var r in cells) {
            for (var c in cells[r]) {
                if (cells[r][c] === 1) {
                    Stack.grid[r][c] = 0;
                }
            }
        }
    }

    /**
     * @param piece
     * @param ccw
     * @returns {Array}
     */
    function rotatePiece(piece, ccw) {
        var col = piece[0].length;
        var row = piece.length;
        var rotate = [];

        if (ccw === true) {
            for (var c = col - 1, cc = 0; c >= 0; c--, cc++) {
                for (var r = 0; r < row; r++) {
                    if ((!rotate[cc])) {
                        rotate[cc] = [];
                    }
                    rotate[cc].push(piece[r][c]);
                }
            }
        }
        else {
            for (var r = row - 1; r >= 0; r--) {
                for (var c = 0; c < col; c++) {
                    if ((!rotate[c])) {
                        rotate[c] = [];
                    }
                    rotate[c].push(piece[r][c]);
                }
            }
        }
        return rotate;
    }

    /**
     * @param y
     * @param x
     * @param piece
     * @returns {boolean}
     */
    function collision(y, x, piece) {
        for (var r = 0; r < piece.length; r++) {
            for (var c = 0; c < piece[r].length; c++) {
                // first IF block not needed if erase piece before check
                if (typeof State.ActivePiece.cells[y + r] === 'undefined'
                    || typeof State.ActivePiece.cells[y + r][x + c] === 'undefined'
                    || State.ActivePiece.cells[y + r][x + c] === 0
                ) {
                    // cell is empty and not go out from bucket
                    if (piece[r][c] &&
                        (
                            x + c < 0
                            || x + c >= Stack.width
                            || y + r >= Stack.height
                            || y + r < 0
                            || Stack.grid[y + r][x + c]
                        )
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /*
     ----------------------------- HELPERS -------------------------------
     */

    /**
     * @param count
     * @param length
     * @returns {number}
     */
    function getCenter(count, length) {
        return Math.round(( (count) / 2 - Math.round(length / 2)));
    }

    /**
     * @param min
     * @param max
     * @returns {*}
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * @param obj
     * @returns {*}
     */
    function getRandomPiece(obj) {
        var rand = getRandomInt(1, Object.keys(obj).length);
        var count = 0;
        for (var prop in obj) {
            count++;
            if (count === rand) {
                return obj[prop];
            }
        }
    }

    /*
     ------------------------ CONTROLS -------------------------------
     */

    /**
     * move constants
     */
    Object.defineProperty(_self, 'DOWN', {
        value: 'DOWN',
        writable: false,
        configurable: false
    });

    Object.defineProperty(_self, 'LEFT', {
        value: 'LEFT',
        writable: false,
        configurable: false
    });

    Object.defineProperty(_self, 'RIGHT', {
        value: 'RIGHT',
        writable: false,
        configurable: false
    });

    Object.defineProperty(_self, 'ROTATE', {
        value: 'ROTATE',
        writable: false,
        configurable: false
    });

    Object.defineProperty(_self, 'ROTATECCW', {
        value: 'ROTATECCW',
        writable: false,
        configurable: false
    });

    /**
     * @param direction
     */
    _self.move = function (direction) {

        if (State.row < spawnOffset && direction !== _self.DOWN) return false;
        if (State.row < spawnOffset && direction === _self.DOWN) {
            State.row = spawnOffset-1;
        }

        var x = State.col;
        var y = State.row;
        var MovedFigure = State.ActivePiece.piece.figure;

        switch (direction) {
            case 'LEFT':
                x--;
                break;
            case 'RIGHT':
                x++;
                break;
            case 'DOWN':
                y++;
                break;
            case 'ROTATE':
                if (State.ActivePiece.piece.name !== 'X') {
                    MovedFigure = rotatePiece(State.ActivePiece.piece.figure, false);
                }
                break;
            case 'ROTATECCW':
                if (State.ActivePiece.piece.name !== 'X') {
                    MovedFigure = rotatePiece(State.ActivePiece.piece.figure, true);
                }
                break;
            default :
                return;
        }

        if (collision(y, x, MovedFigure)) {

            if (y > State.row) State.ActivePiece.onFloor = false;
            
            State.row = y;
            State.col = x;

            State.ActivePiece.piece.figure = MovedFigure;

            clearPiece(State.ActivePiece.cells);
            State.ActivePiece.cells = fillPiece(State.ActivePiece.piece.figure, State.row, State.col);
        }
        else if (y > State.row) {
            State.ActivePiece.onFloor = true;
            onIsDown();
        }

    };

    /*
     ------------------------- GAME INIT ------------------------------
     */
    _self.init = function (fps) {

        initStack();

        // new spawn piece
        createSpawnPiece();

        /*play*/
        TIMER.time = Date.now();

    };

    /*
     --------------------------- EVENTS ------------------------------
     */
    function onIsDown() {
        if (!State.ActivePiece.onFloor) {
            State.ActivePiece.onFloor = true;
        }
        removeFullLine();
        createSpawnPiece();
    }

    function removeFullLine() {
        var checkRowStart = State.row;
        var checkRowEnd = State.row - 1 + State.ActivePiece.piece.figure.length;

        for (var r = checkRowStart; r <= checkRowEnd && r < Stack.height; r++) {

            if (typeof Stack.grid[r] === 'undefined') return;

            var full = true;

            for(var c in Stack.grid[r]) {
                if (Stack.grid[r][c] == 0) {
                    full = false;
                }
            }

            if (full) {
                Stack.grid.splice(r, 1);
                Stack.grid.unshift({});
                addLineToStack();
            }
        }
    }

    var GAMEOVER = false;
    function createSpawnPiece() {
        if (GAMEOVER) return false;
        // new spawn piece
        State.ActivePiece.onFloor = false;
        State.ActivePiece.cells = {};

        State.ActivePiece.piece = getRandomPiece(Pieces);

        State.row = 0;
        State.col = getCenter(Stack.width - 1, State.ActivePiece.piece.figure[0].length);

        State.pieceCounter++;
        State.ActivePiece.id = State.pieceCounter;

        if (collision(State.row, State.col, State.ActivePiece.piece.figure)) {
            State.ActivePiece.cells = fillPiece(State.ActivePiece.piece.figure, State.row, State.col);
        }
        else {
            clearPiece(State.ActivePiece.cells);
            State.ActivePiece.piece.figure.shift();
            if (collision(State.row, State.col, State.ActivePiece.piece.figure)) {
                fillPiece(State.ActivePiece.piece.figure, State.row, State.col);
            }
            GAMEOVER = true;
            alert('Game Over');
        }
    }


    /*
     ----------------------- DRAW ------------------------------
     */

    /**
     * draw
     */
    _self.frame = function () {
        clearFrame();
        stateUpdate();
        drawFrame();
    };

    /**
     * change state
     */
    function stateUpdate() {
        if (TIMER.dt === 20) {
            _self.move(_self.DOWN);
            TIMER.dt = 0;
        }
        TIMER.dt++;
    }

    /**
     * clearFrame
     */
    function clearFrame() {
        document.getElementById('bucket').innerHTML = '';
    }

    /**
     * Draw
     */
    function drawFrame() {
        var table = document.createElement('table');

        for (var r = (Stack.height - 1); r >= 0; r--) {

            var row = document.createElement('tr');
            for (var c = 0; c < Stack.width; c++) {
                var td = document.createElement('td');

                if (Stack.grid[r][c] === 1) {
                    td.classList.add('block');
                }
                else if (typeof State.ActivePiece.cells[r] !== 'undefined'
                    && typeof State.ActivePiece.cells[r][c] !== 'undefined'
                    && State.ActivePiece.cells[r][c] !== 1
                    && Stack.grid[r][c] !== 1
                ) {
                    td.classList.add('o');
                }
                row.appendChild(td);
            }
            table.insertBefore(row, table.firstChild);

            var bucket = document.getElementById('bucket');
            bucket.insertBefore(table, bucket.firstChild);
        }
    }

    /*
     ----------------------- \ DRAW ------------------------------
     */

    return _self;

})();