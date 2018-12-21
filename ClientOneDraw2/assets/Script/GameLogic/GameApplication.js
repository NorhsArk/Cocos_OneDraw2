var Player = require("../GameLogic/Player");
var SoundManager = require("../GameLogic/SoundManager");
var ViewManager = require("../GameLogic/ViewManager");
var MainView = require("../UI/MainView");
var LevelView = require("../UI/LevelView");

cc.Class({
    extends: cc.Component,

    properties: {
        viewManager: {
            default: null,
            type: ViewManager,
        },
        soundManager: {
            default: null,
            type: SoundManager,
        },
        missions: {
            default: []
        },
        missionsCB: {
            default: []
        },
        conf: {
            default: {},
        },
        confCB: {
            default: []
        },
        VideoView: {
            default: null,
            type: cc.Node,
            visible: false,
        },
        VideoView_prefab: {
            default: null,
            type: cc.Prefab,
        },
        SharaView: {
            default: null,
            type: cc.Node,
            visible: false,
        },
        SharaView_prefab: {
            default: null,
            type: cc.Prefab,
        },
        fbView: {
            default: null,
            type: cc.Node,
            visible: false,
        },
        fbView_prefab: {
            default: null,
            type: cc.Prefab,
        },
        object_prefab: {
            default: null,
            type: cc.Prefab,
        },
        viewAtlas: {
            default: null,
            type: cc.SpriteAtlas,
        },
        curLang: {
            get: function () {
                return window.i18n.curLang;
            }
        },
        _playTimes: {
            default: 0,
            type: cc.Integer,
        },
        playTimes: {
            get: function () {
                return this._playTimes;
            },
            set: function (val) {
                this._playTimes = val;
                //播放插屏广告条件判断
                if ((this._playTimes > 1 && this._playTimes % SDK().getInterstitialCount() == 0 && this._playTimes >= SDK().getInterstitialCount()) || (SDK().getInterstitialCount() <= 1 && this._playTimes > 1)) {
                    console.log("播放插屏广告");
                    var delayTime = 0.2 + Math.random();
                    this.scheduleOnce(function () {
                        SDK().showInterstitialAd(function (isCompleted) {
                            console.log("播放Done");
                        }, false);
                    }, delayTime);

                    SDK().canCreateShortcutAsync();
                }

                /* if (this._playTimes == 5) {
                    SDK().shareBestScore("all", null);
                } */
            },
        },
    },

    start() {
        const i18n = require('LanguageData');
        i18n.init('cn');

        SDK().init();
    },

    getConf(path, cb) {

        if (this.conf[path] != null) {
            if (cb) {
                // cc.log("从cache读取："+path)
                cb(this.conf[path]);
            }
        } else {
            // cc.log("从硬盘读取："+path)
            cc.loader.loadRes(path, function (err, results) {
                this.conf[path] = results;
                if (cb != null) {
                    cb(results)
                }
            }.bind(this));
        }
    },


    onLoad() {
        window.gameApplication = this;
        this.soundManager.playBg(1);
        cc.game.addPersistRootNode(this.node);
        // this.audioSource.play();
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = false;
        manager.enabledDrawBoundingBox = false;

        //Load Json
        cc.loader.loadRes("conf/missions", function (err, results) {
            this.missions = results;
            this.invokeMissionCB();
        }.bind(this));

        this.openBeginView(true);

        //window.bid = 1;
        // window.mid = 1;
        // window.lid = 8;
        // cc.director.loadScene("game");   
    },

    onDestroy() {
        cc.director.getCollisionManager().enabled = false;
    },

    getMissions(cb) {

        if (this.missions != null && this.missions.length > 0) {
            cb(this.missions);
        } else {
            this.missionsCB.push(cb);
        }
    },

    invokeMissionCB() {
        var self = this;
        if (this.missionsCB.length > 0) {
            this.missionsCB.forEach(function (cb) {
                if (cb != null) {
                    cb(self.missions);
                }
            });
        }
    },

    /* setNodeActive(nodePath, active) {
        cc.find("Canvas/" + nodePath).active = active;
    }, */

    setNodeActive(nodePath, active, independent, delayTime = 0) {
        var view = cc.find("Canvas/" + nodePath);
        if (view != null) {
            this.viewManager.showView(view, 0.5, active, independent, delayTime);
            var Script = view.getComponent(nodePath);
            if (Script != null) {
                if (Script.initView != null) {
                    Script.initView();
                }
            } else {
                console.log(nodePath + " have not Script!");
            }
        } else {
            console.log(nodePath + " is no exist!");
        }
    },

    //开始界面
    openBeginView: function (isOpen) {
        this.setNodeActive("BeginView", isOpen, true);
    },

    //大关选择界面
    openMainView: function (isOpen) {
        this.setNodeActive("MainView", isOpen, true);
    },

    //小关选择界面
    openLevelView: function (bid, mid, mission, isOpen) {
        this.setNodeActive("LevelView", isOpen, true);
        cc.find("Canvas/LevelView").getComponent("LevelView").init(bid, mid, mission);
    },

    //打开游戏界面
    openGameView: function (isOpen) {
        this.setNodeActive("GameView", isOpen, true);
    },

    //打开结束界面
    openEndView: function (isOpen) {
        this.setNodeActive("EndView", isOpen, false);
    },

    //打开限时礼包界面
    openGiftView: function (isOpen) {
        this.setNodeActive("GiftView", isOpen, false);
    },

    //打开榜单界面
    openRankView: function (isOpen) {
        this.setNodeActive("RankView", isOpen, false);
    },

    //game场景回到level场景
    gamingBackToLevel(bid, mid) {
        this.openLevelView(bid, mid, this.missions[mid - 1], true);
    },

    //game场景回到main场景
    gamingBackToMian(bid, mid) {
        this.openMainView(true);
    },

    //显示是否观看视频的提示框
    showVideoView(cb) {
        if (this.VideoView == null) {
            var view = cc.instantiate(this.VideoView_prefab);
            var Canvas = cc.find("Canvas");
            view.parent = Canvas;
            view.width = window.width;
            view.height = window.height;
            this.VideoView = view;
        }
        this.VideoView.active = true;
        let sureBtn = this.VideoView.getChildByName("Bg").getChildByName("Sure");
        sureBtn.off(cc.Node.EventType.TOUCH_END);
        sureBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.onVideoBtnClick(cb);
            this.VideoView.active = false;
        }, this);

        var laterBtn = this.VideoView.getChildByName("Bg").getChildByName("Later");
        laterBtn.off(cc.Node.EventType.TOUCH_END);
        laterBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.VideoView.active = false;
        }, this);
    },

    //显示是否观看视频的提示框
    showSharaView(ptype=1,cb) {
        console.log("+++++showSharaView++++++");
        if (this.SharaView == null) {
            var view = cc.instantiate(this.SharaView_prefab);
            var Canvas = cc.find("Canvas");
            view.parent = Canvas;
            view.width = window.width;
            view.height = window.height;
            this.SharaView = view;
        }
        this.SharaView.active = true;
        let sureBtn = this.SharaView.getChildByName("Bg").getChildByName("Sure");
        let light = this.SharaView.getChildByName("Bg").getChildByName("LightBg");
        light.runAction(cc.repeatForever(cc.sequence(cc.spawn(
            cc.scaleTo(1, 1.3),
            cc.fadeOut(1).easing(cc.easeOut(2))
        ), cc.callFunc(function () {
            light.scale = 1;
            light.opacity = 255;
            light.active = true;
        }, this), )));
        sureBtn.off(cc.Node.EventType.TOUCH_END);
        sureBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.onShareBtnClick(2,cb);
            this.SharaView.active = false;
        }, this);

        var laterBtn = this.SharaView.getChildByName("Bg").getChildByName("Later");
        laterBtn.off(cc.Node.EventType.TOUCH_END);
        laterBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.SharaView.active = false;
        }, this);
    },

    //视频广告按钮
    onVideoBtnClick(cb) {
        SDK().showVideoAd(
            function (isCompleted) {
                if (null == isCompleted) {
                    console.log("没有观看成功")
                    this.fbFail(1);
                } else if (isCompleted) {
                    cb(true);
                } else {
                    console.log("没有观看成功")
                    this.fbFail(1);
                }
            }.bind(this)
        );
    },

    //插屏广告按钮
    onGiftBtnClick(cb) {
        SDK().showInterstitialAd(
            function (isCompleted) {
                if (null == isCompleted) {
                    console.log("没有观看成功")
                    this.fbFail(1);
                } else if (isCompleted) {
                    cb(true);
                } else {
                    console.log("没有观看成功")
                    this.fbFail(1);
                }
            }.bind(this)
            , true);
    },

    //FB失败界面
    fbFail(type) {
        var view = cc.instantiate(this.fbView_prefab);
        var Canvas = cc.find("Canvas");
        view.parent = Canvas;
        view.width = window.width;
        view.height = window.height;
        var btn = view.getChildByName("Okay");
        btn.off(cc.Node.EventType.TOUCH_END);
        btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.fbView.active = false;
            btn.parent.destroy();
        }, this);
        this.fbView = view;
        if (type == 1) {
            this.fbView.getChildByName("Bg").getChildByName("VideoText").active = true;
            this.fbView.getChildByName("Bg").getChildByName("ShareText").active = false;
        } else {
            this.fbView.getChildByName("Bg").getChildByName("VideoText").active = false;
            this.fbView.getChildByName("Bg").getChildByName("ShareText").active = true;
        }
        this.fbView.active = true;

    },

    //分享按钮
    onShareBtnClick(ptype,cb) {
        console.log("<------onShareBtnClick------->",ptype)
        SDK().getItem("all", function (score) {
            SDK().share(score, function (isCompleted) {
                if (isCompleted) {//分享激励
                    console.log("share:" + score);
                    cb(true)
                } else {
                    this.fbFail(2);
                }
                this.soundManager.audioSource.play();
                this.soundManager.audioSource.loop = true;
            }.bind(this),ptype);
        }.bind(this))
    },

    //放大缩小跳动
    scaleUpAndDowm(node, isShining, light) {
        node.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(0.3, 1.1).easing(cc.easeIn(2)),
            cc.scaleTo(0.6, 0.9).easing(cc.easeIn(2)),
            cc.scaleTo(0.6, 1.1).easing(cc.easeIn(2)),
            cc.scaleTo(0.6, 0.9).easing(cc.easeIn(2)),
        )));
        if (isShining) {
            light.runAction(cc.repeatForever(cc.sequence(
                cc.fadeIn(0.3).easing(cc.easeIn(2)),
                cc.fadeOut(0.6).easing(cc.easeIn(2)),
                cc.fadeIn(0.6).easing(cc.easeIn(2)),
                cc.fadeOut(0.6).easing(cc.easeIn(2)),
            )))
        }
    },

    //获得提示的动画
    flyTipAnim() {
        let reward = cc.instantiate(this.object_prefab);
        reward.color = cc.color(240,170,66,255);
        reward.getComponent(cc.Sprite).spriteFrame = this.viewAtlas.getSpriteFrame("bigTips");
        reward.parent = cc.find("Canvas");
        reward.position = cc.v2(0, 0);
        reward.runAction(cc.sequence(
            cc.moveBy(1, cc.v2(0, 400)).easing(cc.easeIn(2)),
            cc.callFunc(function () {
                reward.destroy();
            }),
        ));
    },

    onQuitBtnClick: function () {
        // console.log("用户中途退出");
    },

    // update (dt) {},
});
