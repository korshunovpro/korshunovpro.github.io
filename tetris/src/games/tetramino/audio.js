GAMES.tetramino.audio = function() {

    let _self = this;
    let muted = false;


    this.soundOnOff = function (){
        if(!muted) {
            Howler.mute();
        } else {
            Howler.unmute();
        }
        muted = !muted;

        let elems = document.querySelectorAll('.audio span');
        for (let el of elems) {
            if (muted) {
                el.innerText = "ВКЛ. ЗВУК";
            } else {
                el.innerText = "ВЫКЛ. ЗВУК";
            }
        }

        return muted;
    };

    this.blockRotate  = new Howl({
        urls: ['./sounds/rotate.wav'],
        volume: 0.1,
    });

    this.slowHit = new Howl({
        urls: ['./sounds/down.wav'],
        volume: 0.2,
    });

    this.forceHit = new Howl({
        urls: ['./sounds/down.wav'],
        volume: 0.2,
    });

    this.pause = new Howl({
        urls: ['./sounds/pause.wav'],
        volume: 0.5,
    });

    this.lineRemove = new Howl({
        urls: ['./sounds/line-drop.wav'],
        volume: 0.2
    });

    this.moving = new Howl({
        urls: ['./sounds/move.wav'],
        volume: 0.1,
    });

    this.gameover = new Howl({
        urls: ['./sounds/gameover.wav'],
    });

    this.music = new Howl({
        urls: ['./sounds/music.ogg'],
        volume: 0.15,
        onend: function() {
            _self.music.play();
        }
    });

};
