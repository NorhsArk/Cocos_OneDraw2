cc.Class({
    extends: cc.Component,

    properties: {
        audioSource: {
            type: cc.AudioSource,
            default: null
        },
        btn_click: {
            url: cc.AudioClip,
            default: null
        },
        reward:{
            url: cc.AudioClip,
            default: null
        },
        gamewin: {
            url: cc.AudioClip,
            default: null
        },
        m1: {
            url: cc.AudioClip,
            default: null
        },
        m2: {
            url: cc.AudioClip,
            default: null
        },
        m3: {
            url: cc.AudioClip,
            default: null
        },
        m4: {
            url: cc.AudioClip,
            default: null
        },
        m5: {
            url: cc.AudioClip,
            default: null
        },
        m6: {
            url: cc.AudioClip,
            default: null
        },
        m7: {
            url: cc.AudioClip,
            default: null
        },
        m8: {
            url: cc.AudioClip,
            default: null
        },
        uplock: {
            url: cc.AudioClip,
            default: null
        },
        tip: {
            url: cc.AudioClip,
            default: null
        },
        bg1: {
            url: cc.AudioClip,
            default: null
        },
        bg2: {
            url: cc.AudioClip,
            default: null
        },
        isOpen: true,
        isVoiceOpen: true,
    },

    // LIFE-CYCLE CALLBACKS: 

    playSound: function (soundtype) {
        if (this.isOpen) {
            switch (soundtype) {
                case "btn_click":
                    cc.audioEngine.play(this.btn_click, false, 1);
                    break;
                case "reward":
                    cc.audioEngine.play(this.reward, false, 1);
                    break;
                case "winGame":
                    cc.audioEngine.play(this.gamewin, false, 1);
                    break;
                case "uplock":
                    cc.audioEngine.play(this.uplock, false, 1);
                    break;
                case "1":
                    cc.audioEngine.play(this.m1, false, 1);
                    break;
                case "2":
                    cc.audioEngine.play(this.m2, false, 1);
                    break;
                case "3":
                    cc.audioEngine.play(this.m3, false, 1);
                    break;
                case "4":
                    cc.audioEngine.play(this.m4, false, 1);
                    break;
                case "5":
                    cc.audioEngine.play(this.m5, false, 1);
                    break;
                case "6":
                    cc.audioEngine.play(this.m6, false, 1);
                    break;
                case "7":
                    cc.audioEngine.play(this.m7, false, 1);
                    break;
                case "8":
                    cc.audioEngine.play(this.m8, false, 1);
                    break;
                case "tip":
                    cc.audioEngine.play(this.tip, false, 0.3);
                    break;
                case "bg1":
                    cc.audioEngine.play(this.bg1, false, 0.3);
                    break;
                case "bg2":
                    cc.audioEngine.play(this.bg2, false, 0.3);
                    break;
            }
        }
    },

    playBg: function (type) {
        if (this.isOpen) {
            if(type == 1){
                this.audioSource.clip = this.bg1;
            }else{
                this.audioSource.clip = this.bg2;
            }
            this.audioSource.play();
            this.audioSource.loop = true;
        }
    },

    setVoiceIsOpen: function (isOpen) {
        this.isVoiceOpen = isOpen;
        if (isOpen) {
            try {
                if (str != null) {
                    HiboGameJs.enableMic(0)
                }
            } catch (e) {

            }
        } else {
            try {
                if (str != null) {
                    HiboGameJs.enableMic(1)
                }
            } catch (e) {

            }
        }

    },

    setIsOpen: function (isOpen) {
        this.isOpen = isOpen;
        if (this.isOpen) {
            this.playBg();
            try {
                if (str != null) {
                    HiboGameJs.mute(0)
                }
            } catch (e) {

            }

        } else {
            this.audioSource.pause();
            try {
                if (str != null) {
                    HiboGameJs.mute(1)
                }
            } catch (e) {

            }
        }
    },
});
