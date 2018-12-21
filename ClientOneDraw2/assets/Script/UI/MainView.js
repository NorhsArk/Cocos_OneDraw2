var itemColor = [
    [
        cc.color(240, 190, 199, 255),
        cc.color(235, 162, 179, 255),
        cc.color(219, 109, 138, 255),
        cc.color(228, 119, 116, 255),
        cc.color(186, 103, 99, 255),
    ],
    [
        cc.color(209, 206, 150, 255),
        cc.color(124, 225, 213, 255),
        cc.color(103, 222, 182, 255),
        cc.color(71, 197, 193, 255),
        cc.color(92, 112, 147, 255),
    ],
    [
        cc.color(172, 214, 242, 255),
        cc.color(131, 186, 222, 255),
        cc.color(137, 171, 215, 255),
        cc.color(80, 121, 173, 255),
        cc.color(53, 60, 86, 255),
    ],
    [
        cc.color(249, 183, 125, 255),
        cc.color(228, 178, 117, 255),
        cc.color(244, 155, 75, 255),
        cc.color(226, 136, 40, 255),
        cc.color(201, 124, 52, 255),
    ]
];
cc.Class({
    extends: cc.Component,

    properties: {
        AdsView: {
            default: null,
            type: cc.Node,
        },
        noAdsView: {
            default: null,
            type: cc.Node,
        },
        shareBtn: {
            default: null,
            type: cc.Node,
        },
        shareNum: {
            default: null,
            type: cc.Label,
        },
        title: {
            default: null,
            type: cc.Label,
        },
        starts: {
            default: null,
            type: cc.Node,
        },
        arrows: {
            default: [],
            type: [cc.Node],
        },
        missionTipText: {
            default: null,
            type: cc.Node,
        },
        MissionContent: {
            default: [],
            type: [cc.Node],
        },
        missionSelect: {
            default: null,
            type: cc.PageView,
        },
        curIdx: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        missionItem: {
            default: null,
            type: cc.Node,
        },
        missions: {
            default: null,
            visible: false,
        },
        gameApplication: {
            default: null,
            type: Object,
            visible: false,
        },
        watchADTip: {
            default: null,
            type: cc.Node,
            visible: false,
        },
        unlock_bid: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        unlock_mid: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        unlock_ad: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        watched_ad: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        ui_viewAtlas: {
            default: null,
            type: cc.SpriteAtlas,
        },
        missionNodes: {
            default: {}
        }
    },

    onLoad: function () {
        this.arrows[0].active = false;
        this.curIdx = 0;
        window.bid = 1;
        this.gameApplication = cc.find("GameApplication").getComponent("GameApplication");
        this.MissionContent[0].width = cc.winSize.width;
        this.MissionContent[1].width = cc.winSize.width;
        this.MissionContent[2].width = cc.winSize.width;
        this.MissionContent[3].width = cc.winSize.width;
    },

    onEnable() {
        this.init();
    },

    //加载分页数据
    initPage() {
        var id = this.missionSelect.getCurrentPageIndex();
        this.curIdx = id;
        if (id == 0) {
            this.arrows[0].active = false;
            this.arrows[1].active = true;
        } else if (id == 3) {
            this.arrows[0].active = true;
            this.arrows[1].active = false;
        } else {
            this.arrows[0].active = true;
            this.arrows[1].active = true;
        }
        this.missionTipText.getComponent("LocalizedLabel").dataID = "label_text.unlockCondition" + (id - 1);
        this.initContents(this.curIdx);
    },

    init() {
        if (this.missions == null || Object.keys(this.missions).length <= 0) {
            this.gameApplication.getMissions(function (results) {
                this.missions = results;
                this.initContents(this.curIdx);
            }.bind(this));
        } else {
            this.initContents(this.curIdx);
        }
    },

    initContents(idx) {
        //this.hideAllItem();
        var levelName = "";
        switch (idx) {
            case 0: {
                levelName = "Beginner";
            } break;
            case 1: {
                levelName = "Export";
            } break;
            case 2: {
                levelName = "Professional";
            } break;
            case 3: {
                levelName = "Master";
            } break;
        };
        this.title.string = levelName;
        SDK().getItem("b_" + idx, function (score) {
            this.starts.getComponent(cc.Label).string = score.toString() + "/500";
            var type;
            if (score >= this.missions[(idx * 5) + 1].unlock_star) {
                type = true;
                this.noAdsView.active = false;
            }else{
                type = false;
            }
            //分享3次解锁的处理
            SDK().getItem("share_" + idx, function (times) {
                if (times >= 3) {
                    type = true;
                    this.noAdsView.active = false;
                } else {
                    if(!type){
                        this.noAdsView.active = true;
                    }
                    this.shareNum.string = times + " / 3";
                    this.shareBtn.off(cc.Node.EventType.TOUCH_END);
                    this.shareBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
                        this.scheduleOnce(function () {
                            window.gameApplication.onShareBtnClick(2,function (isCompleted) {
                                if (isCompleted) {
                                    var param = {};
                                    param["share_" + idx] = parseInt(times + 1);
                                    SDK().setItem(param,function(){
                                        this.initContents(idx);
                                    }.bind(this));
                                }
                            }.bind(this));
                        }.bind(this), 0.5)
                    }, this);
                }
                for (var i = idx * 5; i < (idx * 5) + 5; i++) {
                    this.initMissionItem(this.missions[i], i, type);
                }
            }.bind(this))
        }.bind(this));
    },

    initMissionItem(mission, idx, type) {
        var stars = mission['stars'];
        var bid = mission['bid'];
        var mid = mission['mid'];
        var unlock_ad = mission['unlock_ad'];
        var unlock_star = mission['unlock_star'];
        var cannonNode;
        if (this.missionNodes[mid] != null) {
            cannonNode = this.missionNodes[mid];
        } else {
            cannonNode = cc.instantiate(this.missionItem);
        }
        cannonNode.parent = this.MissionContent[this.curIdx];
        cannonNode.active = false;
        cannonNode.tag = idx;
        cannonNode.isUnlock = type;

        var bgPath = (idx % 5) + 1;

        var starObj = cannonNode.getChildByName("star");
        var lockObj = cannonNode.getChildByName("lock");

        cannonNode.getChildByName("title").getComponent(cc.Label).string = mission["title_" + this.gameApplication.curLang];


        var fixMid = Math.floor((mid - 1) / 5)
        var fixMid1 = Math.floor((mid - fixMid * 5) - 1)
        cannonNode.getChildByName("bg").color = itemColor[fixMid][fixMid1];

        this.missionNodes[mid] = cannonNode;

        SDK().getItem("" + mid, function (score) {
            cc.find("unlock/count", cannonNode).getComponent(cc.Label).string = score + "/" + stars;
            cc.find("lock/count", cannonNode).getComponent(cc.Label).string = score + "/" + stars;
            cannonNode.active = true;
            if (type) {
                cc.find("unlock", cannonNode).active = type;
                cc.find("lock", cannonNode).active = !type;
            } else {
                cc.find("unlock", cannonNode).active = type;
                cc.find("lock", cannonNode).active = !type;
            }
        })
    },

    //元素点击事件
    onMissionItemClicked(event) {
        var self = this;
        var target = event.target;
        var targetBtn = target.getComponent(cc.Button);

        targetBtn.interactable = false;
        var tag = parseInt(target.tag);
        var isUnlock = target.isUnlock;
        var mission = this.missions[tag];

        if (mission == null) {
            return;
        }

        var bid = mission['bid'];
        var mid = mission['mid'];
        var unlock_ad = mission['unlock_ad'];

        if (isUnlock) {
            //不需要解鎖，直接進遊戲
            self.showLevelPanel(bid, mid);
            targetBtn.interactable = true;
        } else {
            targetBtn.interactable = true;
        }
    },

    //判断是否解锁
    isUnlock(idx, cb) {
        let mission = this.missions[idx];
        let bid = mission['bid'];
        let mid = mission['mid'];
        let unlock_ad = mission['unlock_ad'];
        let unlock_star = mission['unlock_star'];

        if (unlock_star <= 0) {
            cb(true)
            return;
        }
        //先检查星星是否足够
        SDK().getItem("all", function (score) {
            if (score >= unlock_star) {
                cb(true)
                return;
            } else {
                SDK().getItem("unlock_" + bid + "_" + mid, function (test) {
                    if (test >= unlock_ad) {
                        cb(true)
                        return;
                    } else {
                        cb(false);
                    }
                });
            }
        });
    },

    //隐藏当前页的子元素
    hideAllItem() {
        if (this.MissionContent[this.curIdx].childrenCount > 0) {
            this.MissionContent[this.curIdx].children.forEach(function (n) {
                n.active = false;
                n.destroy();
            });
        }
    },

    //打开小关卡界面
    showLevelPanel(bid, mid) {
        window.gameApplication.openLevelView(bid, mid, this.missions[mid - 1], true);
        window.gameApplication.soundManager.playSound("btn_click");
    },

    //返回按钮事件
    onBackBtnClicked() {
        window.gameApplication.openBeginView(true);
        window.gameApplication.soundManager.playSound("btn_click");
    },


    showAdsView() {
        this.AdsView.active = true;
        var Bg = this.AdsView.getChildByName("Bg");
        var Titel = Bg.getChildByName("Titel").getComponent(cc.RichText);
        Titel.string = "<b><color=#9C9999>Need " + this.unlock_star + " stars,\nUnlock now by watching the AD?</c></b>"
        var ADbtn = this.AdsView.getChildByName("AD");
        ADbtn.off(cc.Node.EventType.TOUCH_END);
        ADbtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.onWatchVideoBtnClicked();
        }, this);
        var Later = this.AdsView.getChildByName("Later");
        Later.off(cc.Node.EventType.TOUCH_END);
        Later.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.AdsView.active = false;
        }, this);
    },

    onWatchVideoBtnClicked() {
        var self = this;
        window.gameApplication.onVideoBtnClick(function (isCompleted) {
            if (isCompleted) {
                this.AdsView.active = false;
                //进入关卡
                var bid = self.unlock_bid;
                var mid = self.unlock_mid;
                var unlock_ad = self.unlock_ad;
                self.watched_ad++;
                //更新node
                var cannonNode = this.missionNodes[bid + "_" + mid];
                if (self.watched_ad >= unlock_ad) {
                    self.showLevelPanel(bid, mid);
                    cc.find("unlock", cannonNode).active = true;
                    cc.find("lock", cannonNode).active = false;
                } else {
                    cc.find("unlock", cannonNode).active = false;
                    cc.find("lock", cannonNode).active = true;
                }
                //记录这一关看广告次数
                var param = {};
                param["unlock_" + bid + "_" + mid] = self.watched_ad;
                SDK().setItem(param, null);
            }
        }.bind(this));
    },

    // update (dt) {},
});
