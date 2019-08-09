/*
 --------------- CONTROLS ----------------------------------
 */
if (typeof window.CONTROL !== 'undefined') var CONTROL = {};

CONTROL = (function () {

    document.onkeydown = controlDown;
    document.onkeyup = controlUp;

    function controlUp(e) {
        e = e || window.event;
    }

    function controlDown(e) {
        e = e || window.event;

        // Z
        if (e.keyCode === 90) {
            e.preventDefault();
            TETRO.move(TETRO.ROTATE);
        }
        // X
        else if (e.keyCode === 88) {
            e.preventDefault();
            TETRO.move(TETRO.ROTATECCW);
        }
        // down
        else if (e.keyCode === 40) {
            e.preventDefault();
            TETRO.move(TETRO.DOWN);
        }
        // left
        else if (e.keyCode === 37) {
            e.preventDefault();
            TETRO.move(TETRO.LEFT);
        }
        // right
        else if (e.keyCode === 39) {
            e.preventDefault();
            TETRO.move(TETRO.RIGHT);
        }
    }

})();