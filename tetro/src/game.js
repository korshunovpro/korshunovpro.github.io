/*
 --------------- GAME ----------------------------------
 */
if (typeof window.GAME !== 'undefined') var GAME = {};

/**
 * reference: http://codeincomplete.com/posts/javascript-game-foundations-the-game-loop/
 */
GAME = (function () {
    var now,
        fps  = 60,
        dt   = 0,
        last = Date.now(),
        step = 1/fps;

    // init game
    TETRO.init(fps);

    // main loop
    function frame() {
        now = Date.now();
        dt = dt + Math.min(1, (now - last) / 1000);
        while(dt > step) {
            dt = dt - step;
            // loop
            TETRO.frame();
        }
        last = now;
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    // \ main loop

    return this;
})();