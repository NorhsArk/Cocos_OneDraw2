var rotationVal = [0, 180, 90, 270];
var lColors = [cc.color(204, 71, 71, 255), cc.color(236, 214, 66, 255), cc.color(115, 216, 52, 255), cc.color(70, 183, 218, 255), cc.color(133, 63, 214, 255)];
cc.Class({
    extends: cc.Component,

    properties: {
        gameApplication: {
            default: null,
            type: Object
        },
        titelIdx: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        titelContent: {
            default: null,
            type: cc.Node,
        },
        titlePointList: {
            default: [],
            type: [cc.Node],
            visible: false,
        },
        musicSprite: {
            default: null,
            type: cc.Sprite,
        },
        onFrame: {
            default: null,
            type: cc.SpriteFrame,
        },
        offFrame: {
            default: null,
            type: cc.SpriteFrame,
        },
        rankTip: {
            default: null,
            type: cc.Node,
        },
        //榜单界面
        worldBtn: {
            default: null,
            type: cc.Node,
        },
        friendBtn: {
            default: null,
            type: cc.Node,
        },
        worldList: {
            default: null,
            type: cc.Node,
        },
        friendList: {
            default: null,
            type: cc.Node,
        },
        worldContent: {
            default: null,
            type: cc.Node,
        },
        friendContent: {
            default: null,
            type: cc.Node,
        },
        //头像储存
        headSpriteList: {
            default: {},
            visible: false,
        },
        //储存用户信息列表
        worldPlayer: {
            default: [],
            visible: false,
        },
        friendPlayer: {
            default: [],
            visible: false,
        },
        //储存用户UI列表
        worldUIPlayer: {
            default: [],
            visible: false,
        },
        friendUIPlayer: {
            default: [],
            visible: false,
        },
        prefab_player: {
            default: null,
            type: cc.Prefab,
        },
    },

    //加载榜单
    LoadRank() {
        SDK().getFriendsInfo(function (list) {
            this.GetFriendRank(list);
        }.bind(this));
        SDK().getRank(2, 50, 0, function (list) {
            this.GetWorldRank(list);
        }.bind(this));
    },

    //好友邀请列表
    GetFriendRank(list) {
        this.friendPlayer = list;
        for (var i = 0; i < this.friendPlayer.length; i = i + 1) {
            var playerBar;
            var Head;
            var Name;
            var No;
            if (i >= this.friendUIPlayer.length) {
                playerBar = cc.instantiate(this.prefab_player);
                Head = playerBar.getChildByName("HeadMask").getChildByName("Head").getComponent(cc.Sprite);
                Name = playerBar.getChildByName("Name").getComponent(cc.Label);
                No = playerBar.getChildByName("No").getComponent(cc.Label);;
                var Score = playerBar.getChildByName("Score");
                Score.active = false;
                this.friendUIPlayer[i] = {};
                this.friendUIPlayer[i].playerBar = playerBar;
                this.friendUIPlayer[i].Head = Head;
                this.friendUIPlayer[i].Name = Name;
                this.friendUIPlayer[i].No = No;
            } else {
                playerBar = this.friendUIPlayer[i].playerBar;
                Head = this.friendUIPlayer[i].Head;
                Name = this.friendUIPlayer[i].Name;
                No = this.friendUIPlayer[i].No;
            }
            //背景色单双数显示
            if (i % 2 == 0) {
                playerBar.color = cc.color(248, 181, 81, 255);
            } else {
                playerBar.color = cc.color(254, 152, 0, 255);
            }
            No.string = i + 1;
            var playBtn = playerBar.getChildByName("Play");
            Name.node.active = true;
            playerBar.name = this.friendPlayer[i].id;
            var self = this;
            let id = this.friendPlayer[i].id
            playBtn.off(cc.Node.EventType.TOUCH_END);
            playBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
                SDK().playWith(id, self.highestScore, function (isCompleted) {
                    if (this.node.active) {
                        window.gameApplication.openMainView(true);
                    }
                }.bind(this));
            }, this);
            Name.string = this.friendPlayer[i].name;
            playerBar.parent = this.friendContent;
            //加载头像
            this.LoadSprite(this.friendPlayer[i].headUrl, Head, this.headSpriteList[this.friendPlayer[i].id]);
        }
        if (this.friendPlayer.length < this.friendUIPlayer.length) {
            for (var i = this.friendPlayer.length; i < this.friendUIPlayer.length; i = i + 1) {
                this.friendUIPlayer[i].playerBar.active = false;
            }
        }
    },

    //世界排行榜
    GetWorldRank(list) {
        this.worldPlayer = list;
        var isOnRank = false;
        for (var i = 0; i < this.worldPlayer.length; i = i + 1) {
            if (this.LoadRankData(i, this.worldPlayer[i])) {
                isOnRank = true;
            }
        }
        //如果自己不在榜单上就将自己加载最后
        var listLength = this.worldPlayer.length;
        if (!isOnRank) {
            listLength = listLength + 1;
            SDK().getRankScore(2, function (info) {
                this.LoadRankData(listLength - 1, info);
            }.bind(this))
        }
        //隐藏多余的榜单
        if (listLength < this.worldUIPlayer.length) {
            for (var i = this.worldPlayer.length; i < this.worldUIPlayer.length; i = i + 1) {
                this.worldUIPlayer[i].playerBar.active = false;
            }
        }
    },

    //将玩家信息加载到第I排
    LoadRankData(i, playerData) {
        var isOnRank = false;
        var playerBar;
        var mainBg;
        var No;
        var Score;
        var Head;
        if (i >= this.worldUIPlayer.length) {
            playerBar = cc.instantiate(this.prefab_player);
            mainBg = playerBar.getComponent(cc.Sprite);
            No = playerBar.getChildByName("No").getComponent(cc.Label);
            Score = playerBar.getChildByName("Score").getChildByName("Num").getComponent(cc.Label);
            Head = playerBar.getChildByName("HeadMask").getChildByName("Head").getComponent(cc.Sprite);
            var Name = playerBar.getChildByName("Name");
            Name.active = false;
            this.worldUIPlayer[i] = {};
            this.worldUIPlayer[i].playerBar = playerBar;
            this.worldUIPlayer[i].mainBg = mainBg;
            this.worldUIPlayer[i].No = No;
            this.worldUIPlayer[i].Score = Score;
            this.worldUIPlayer[i].Head = Head;
        } else {
            playerBar = this.worldUIPlayer[i].playerBar;
            mainBg = this.worldUIPlayer[i].mainBg;
            No = this.worldUIPlayer[i].No;
            Score = this.worldUIPlayer[i].Score;
            Head = this.worldUIPlayer[i].Head;
        }
        //背景色单双数显示
        if (i % 2 == 0) {
            playerBar.color = cc.color(248, 181, 81, 255);
        } else {
            playerBar.color = cc.color(254, 152, 0, 255);
        }
        No.node.active = true;
        Score.node.active = true;
        playerBar.name = playerData.id;
        playerBar.parent = this.worldContent;
        //是否为自己
        if (playerData.id == SDK().getSelfInfo().id) {
            isOnRank = true;
        }
        //隐藏play按钮
        var playBtn = playerBar.getChildByName("Play");
        playBtn.active = false;
        //加载名次
        No.string = playerData.no;
        //加载分数
        Score.string = playerData.score;
        //加载头像
        this.LoadSprite(playerData.headUrl, Head, this.headSpriteList[playerData.id]);
        return isOnRank;
    },

    //根据URL加载头像并到对应的sprite上
    LoadSprite(url, sprite, saver) {
        if (saver == null) {
            cc.loader.load(url, function (err, texture) {
                saver = new cc.SpriteFrame(texture);
                sprite.spriteFrame = saver;
            });
        } else {
            sprite.spriteFrame = saver;
        }

    },

    onLoad: function () {
        SDK().getItem("giftTime", function (time) {
            this.giftTime = time;
        }.bind(this));
        if (window.gameApplication.soundManager.isOpen) {
            this.musicSprite.spriteFrame = this.onFrame;
        } else {
            this.musicSprite.spriteFrame = this.offFrame;
        }
    },

    start() {
        this.titelAnim();
    },

    onEnable() {
        this.LoadRank();
        this.rankTip.active = true;
    },

    //整个标题动画
    titelAnim() {
        this.titelContent.rotation = rotationVal[this.titelIdx];
        var curColor = lColors[Math.ceil(Math.random() * 5) - 1];
        for (var i = 0; i < 9; i = i + 1) {
            if (this.titlePointList[i] == null) {
                this.titlePointList[i] = cc.find("Point" + i, this.titelContent);
                this.titlePointList[i].line = cc.find("LinkColor", this.titlePointList[i]);
            }
            this.pointAnim(i, curColor);
        }
        this.scheduleOnce(function () {
            for (var i = 0; i < 9; i = i + 1) {
                var lineColor = this.titlePointList[i].line;
                lineColor.runAction(cc.scaleTo(0.1, 0));
            }
        }.bind(this), 2)

        this.titelIdx = this.titelIdx + 1;
        this.titelIdx = this.titelIdx % 4;
        this.scheduleOnce(function () {
            this.titelAnim();
        }.bind(this), 3)
    },

    //点动画
    pointAnim(i, curColor) {
        this.scheduleOnce(function () {
            var lineColor = this.titlePointList[i].line;
            lineColor.color = curColor;
            if (i == 0) {
                lineColor.scale = 0;
                lineColor.active = true
                lineColor.runAction(cc.scaleTo(0.1, 1));
            } else {
                lineColor.scale = 1;
                lineColor.active = true
            }
        }.bind(this), i * 0.1);
    },

    onBtnClicked(event, type) {
        console.log("onBtnClicked--->",type);
        if ("Play" == type) {
            window.gameApplication.openMainView(true);
        } else if ("Music" == type) {
            if (window.gameApplication.soundManager.isOpen) {
                window.gameApplication.soundManager.setIsOpen(false);
                this.musicSprite.spriteFrame = this.offFrame;
            } else {
                window.gameApplication.soundManager.setIsOpen(true);
                this.musicSprite.spriteFrame = this.onFrame;
            }
        }
        else if ("Rank" == type) {
            window.gameApplication.openRankView(true);
            var tip = event.target.getChildByName("!Text");
            if (tip != null) {
                tip.active = false;
            }

        }
        else if ("CloseRank" == type) {
            window.gameApplication.openRankView(false);
        } else if ("Share" == type) {
            window.gameApplication.onShareBtnClick(2,
                function (isCompleted) {
                    if (isCompleted) {
                        SDK().getItem("tips", function (tip) {
                            tip = tip + 2;
                            SDK().setItem({ tips: tip }, null);
                            window.gameApplication.soundManager.playSound("reward");
                            for (var i = 0; i < 2; i = i + 1) {
                                this.scheduleOnce(function () {
                                    window.gameApplication.flyTipAnim();
                                }.bind(this), i * 0.2)
                            }
                        }.bind(this));
                    }
                }.bind(this)
            );
        }
        //榜单界面
        else if ("WorldRank" == type) {
            this.GetWorldRank(this.worldPlayer);
            this.worldList.active = true;
            this.worldBtn.active = true;
            this.friendList.active = false;
            this.friendBtn.active = false;
        } else if ("FriendRank" == type) {
            this.GetFriendRank(this.friendPlayer);
            this.worldList.active = false;
            this.worldBtn.active = false;
            this.friendList.active = true;
            this.friendBtn.active = true;
        }
        window.gameApplication.soundManager.playSound("btn_click");
    },
});
