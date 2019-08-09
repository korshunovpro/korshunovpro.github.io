AZSplashScreen = (function () {

    let _self = this;
    let splash = document.getElementById('splash');
    let splashText = document.createElement('div');
    let text = 'classic games';

    /**
     * Show splash
     * @param callback
     */
    _self.show = function (callback) {

        if (splash) {
            splashText.id = 'splashText';
            splashText.style.display = 'table-cell';
            splashText.style.width = '100%';
            splashText.style.height = '100%';
            splashText.style.verticalAlign = 'middle';

            splash.appendChild(splashText);

            let chars = text.split('');

            let time = 0;
            let len = chars.length;
            for (let i = 0; i < len; i++) {
                setTimeout(function () {
                    splashText.appendChild(document.createTextNode(chars[i]));
                    if (i === len-1) {
                        setTimeout(function () {
                            fadeOut(splashText, function () {
                                setTimeout(function () {
                                    splash.style.display = 'none';
                                    document.querySelector('body').classList.toggle('splash');
                                    if (typeof callback === 'function') {
                                        callback();
                                    }
                                }, 500);
                            });
                        }, 500);
                    }
                }, time);
                time += 80;
            }
        }
    };

    /**
     * Fade function
     * @param el
     * @param callback
     */
    function fadeOut(el, callback) {
        let time = 0;
        for (let i = 1; i >= 0; i -= 0.1) {
            setTimeout(function () {
                i = Math.round(i * 10) / 10;
                el.style.opacity = i;
                if (i === 0 && typeof callback === 'function') {
                    callback();
                }

            }, time);
            time += 80;
        }
    }

    return _self;
})();