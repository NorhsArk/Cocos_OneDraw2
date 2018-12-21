// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        giftView: {
            default: null,
            type: cc.Node,
        },
        giftBtn: {
            default: null,
            type: cc.Node,
        },
        giftMask: {
            default: null,
            type: cc.Node,
        },
        giftTip: {
            default: null,
            type: cc.Node,
        },
        giftTimeText: {
            default: null,
            type: cc.Label,
        },
        giftTip1: {
            default: null,
            type: cc.Node,
        },
        giftTimeText1: {
            default: null,
            type: cc.Label,
        },
        giftTime: {
            default: 0,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.timeGiftScript = this;
        SDK().getItem("giftTime", function (time) {
            this.giftTime = time;
        }.bind(this));
    },

    openBtn() {
        window.gameApplication.soundManager.playSound("btn_click");
        if (this.giftTip1.active) {
            this.showTimeGiftView();
        }
    },

    start() {
        this.checkTime(true);
    },

    showTimeGiftView() {
        window.gameApplication.openGiftView(true);
        var bg = this.giftView.getChildByName("Bg");
        var receive = bg.getChildByName("ReceiveView");
        receive.active = true;
        var lightBg = receive.getChildByName("LightBg");
        var receiveBtn = receive.getChildByName("Receive");
        var doubleBtn = receive.getChildByName("Double");
        receive.runAction(
            cc.spawn(cc.fadeIn(0.5),
                cc.scaleTo(1.2, 1).easing(cc.easeBackInOut())
            )
        );
        //接收按钮
        receiveBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            window.gameApplication.soundManager.playSound("btn_click");
            this.resetTime();
            SDK().getItem("tips", function (tip) {
                tip = tip + 1;
                SDK().setItem({ tips: tip }, null);
                if (null != window.tipText) {
                    window.tipText.string = tip;
                }
                window.gameApplication.soundManager.playSound("tip");
                window.gameApplication.flyTipAnim();
            }.bind(this));
            lightBg.runAction(cc.repeatForever(cc.sequence(cc.spawn(
                cc.scaleTo(1, 1.3),
                cc.fadeOut(1).easing(cc.easeOut(2))
            ), cc.callFunc(function () {
                lightBg.scale = 1;
                lightBg.opacity = 255;
                lightBg.active = true;
            }, this), )));
            receive.active = true;
            receive.opacity = 0;
            receive.scale = 0;
            window.gameApplication.openGiftView(false);
        }, this);

        //双倍按钮
        doubleBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            window.gameApplication.soundManager.playSound("btn_click");
            window.gameApplication.onVideoBtnClick(function (isCompleted) {
                if (isCompleted) {
                    this.resetTime();
                    SDK().getItem("tips", function (tip) {
                        tip = tip + 1;
                        SDK().setItem({ tips: tip }, null);
                        if (null != window.tipText) {
                            window.tipText.string = tip;
                        }
                    }.bind(this));
                    this.giftView.active = false;
                    window.gameApplication.soundManager.playSound("tip");
                    for (var i = 0; i < 2; i = i + 1) {
                        this.scheduleOnce(function () {
                            window.gameApplication.flyTipAnim();
                        }.bind(this), i * 0.2)
                    }
                }
            }.bind(this));
        }, this);
    },

    resetTime() {
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        this.giftTime = timestamp;
        SDK().setItem({ giftTime: this.giftTime }, null);
    },

    checkTime(isStart) {
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        if (timestamp - this.giftTime > 1800) {
            if ((!this.giftTip.active && this.giftMask.active) || isStart) {
                this.giftTip.active = true;
                this.giftMask.active = false;
                this.giftTimeText.node.active = false;
                this.giftTip1.active = true;
                this.giftTimeText1.node.active = false;
                //window.gameApplication.scaleUpAndDowm(this.giftBtn, true, this.giftTip);
            }
        } else {
            if ((this.giftTip.active && !this.giftMask.active) || isStart) {
                this.giftTip.active = false;
                this.giftTip.stopAllActions();
                this.giftMask.active = true;
                this.giftTimeText.node.active = true;
                this.giftTip1.active = false;
                this.giftTip1.stopAllActions();
                this.giftTimeText1.node.active = true;
                this.giftBtn.stopAllActions();
                this.giftBtn.scale = 1;
            }
            var temp = timestamp - this.giftTime;
            temp = 1800 - temp;
            var min = temp / 60 < 10 ? "0" + Math.floor(temp / 60) : "" + Math.floor(temp / 60);
            var sec = temp % 60 < 10 ? "0" + Math.floor(temp % 60) : "" + Math.floor(temp % 60);
            if (temp <= 0) {
                min = "00";
                sec = "00"
            }
            this.giftTimeText.string = min + ":" + sec;
            this.giftTimeText1.string = min + ":" + sec;
        }
    },

    update(dt) {
        this.checkTime(false);
    },
});
