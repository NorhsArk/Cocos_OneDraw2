import { isContext } from "vm";

// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var colors = [cc.color(204, 71, 71, 255), cc.color(236, 214, 66, 255), cc.color(115, 216, 52, 255), cc.color(70, 183, 218, 255), cc.color(133, 63, 214, 255)];
var lColors = [cc.color(204, 71, 71, 255), cc.color(236, 214, 66, 255), cc.color(115, 216, 52, 255), cc.color(70, 183, 218, 255), cc.color(133, 63, 214, 255)];
var gray = cc.color(255, 255, 255, 255);
cc.Class({
    extends: cc.Component,

    properties: {
        clickPoint: null,
        guideHand: {
            default: null,
            type: cc.Node,
        },
        gameApplication: {
            default: null,
            visible: false,
        },
        btns: {
            default: null,
            type: cc.Node,
        },
        endView: {
            default: null,
            type: cc.Node,
        },
        levelText: {
            default: null,
            type: cc.Label,
        },
        tipText: {
            default: null,
            type: cc.Label,
        },
        curColorIdx: {
            default: 0,
            visible: false,
        },
        curMap: {
            default: null,
            visible: false,
        },
        winCount: {
            default: 0,
            visible: false,
        },
        bounsLight: {
            default: null,
            type: cc.Node,
        },
        bounsView: {
            default: null,
            type: cc.Node,
        },
        drawView: {
            default: null,
            type: cc.Node,
        },
        firstPoint: {
            default: null,
            visible: false,
        },
        curPoints: {
            default: null,
            visible: false,
        },
        curHelps: {
            default: null,
            visible: false,
        },
        curLines: {
            default: null,
            visible: false,
        },
        lineList: {
            default: [],
            visible: false,
        },
        backList: {
            default: [],
            visible: false,
        },
        curHelpIdx: {
            default: 0,
            visible: false,
        },
        curMusicIdx: {
            default: 0,
            visible: false,
        },
        isFirstTouch: {
            default: false,
            visible: false,
        },
        isTouching: {
            default: false,
            visible: false,
        },
        isPlaying: {
            default: false,
            visible: false,
        },
        adSprite: {
            default: null,
            type: cc.Sprite,
        },
        adSaver: {
            default: null,
            visible: false,
        },
        rankTip: {
            default: null,
            type: cc.Node,
        },
        //榜单界面
        friendBtn: {
            default: null,
            type: cc.Node,
        },
        friendList: {
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
        friendPlayer: {
            default: [],
            visible: false,
        },
        //储存用户UI列表
        friendUIPlayer: {
            default: [],
            visible: false,
        },
        prefab_player: {
            default: null,
            type: cc.Prefab,
        },
        point_prefab: {
            default: null,
            type: cc.Prefab,
        },
        line_prefab: {
            default: null,
            type: cc.Prefab,
        },
    },

    onLoad() {
        this.clickPoint = this.drawView.getChildByName("ClickPoint").getComponent("ClickPoint");
        window.tipText = this.tipText;
    },

    start() {
        //触摸移动事件处理
        this.clickPoint.node.on('moveClick', this.onClickStart, this);
        //触摸结束事件处理
        this.clickPoint.node.on('clickEnd', this.onClickEnd, this);
        //碰撞事件处理
        this.clickPoint.node.on('collision', this.onClickCollision, this);
    },

    //处理点击点的移动
    onClickStart(evt) {
        /* var data = evt.detail;
        var pos = data.pos; */
        this.isTouching = true;
        this.isFirstTouch = true;
    },

    //处理点击结束时间
    onClickEnd(evt) {
        /* var data = evt.detail;
        var pos = data.pos; */
        this.isTouching = false;
        this.isFirstTouch = true;
    },

    menuClick(event, type) {
        window.gameApplication.soundManager.playSound("btn_click");
        //回到选择关卡按钮
        if ("Back" == type) {
            window.gameApplication.gamingBackToLevel(window.bid, window.mid);
        }
        //提示按钮
        else if ("Tip" == type) {
            if (this.curHelpIdx > this.curPoints.length - 1) {
                return;
            }
            SDK().getItem("tips", function (tip) {
                if (tip > 0) {
                    tip = tip - 1;
                    SDK().setItem({ tips: tip }, null);
                    this.curHelpIdx = this.curHelpIdx + 5;
                    if (window.tipText != null) {
                        window.tipText.string = tip;
                    }
                    this.helpLink();
                } else {
                    window.gameApplication.showSharaView(2,function (isCompleted) {
                        if (isCompleted) {
                            SDK().getItem("tips", function (tip) {
                                tip = tip + 2;
                                SDK().setItem({ tips: tip }, null);
                                if (window.tipText != null) {
                                    window.tipText.string = tip;
                                }
                                window.gameApplication.soundManager.playSound("reward");
                                for (var i = 0; i < 2; i = i + 1) {
                                    this.scheduleOnce(function () {
                                        window.gameApplication.flyTipAnim();
                                    }.bind(this), i * 0.2)
                                }
                            }.bind(this));
                        }
                    }.bind(this))
                }
            }.bind(this));

        }
        //看视频获得奖励
        else if ("Video" == type) {
            window.gameApplication.onVideoBtnClick(function (isCompleted) {
                if (isCompleted) {
                    SDK().getItem("tips", function (tip) {
                        tip = tip + 2;
                        SDK().setItem({ tips: tip }, null);
                        if (window.tipText != null) {
                            window.tipText.string = tip;
                        }
                        window.gameApplication.soundManager.playSound("reward");
                        for (var i = 0; i < 2; i = i + 1) {
                            this.scheduleOnce(function () {
                                window.gameApplication.flyTipAnim();
                            }.bind(this), i * 0.2)
                        }
                    }.bind(this));
                }
            }.bind(this))
        }
        //结束界面 
        //下一关按钮
        else if ("Next" == type) {
            var tmp_path = "conf/level_detail/1/" + mid + "/" + (lid + 1);
            window.gameApplication.getConf(tmp_path, function (map) {
                if (null != map && map.length != 0) {
                    this.curMap = map;
                    lid = lid + 1;
                    this.resetMap();
                    window.gameApplication.openEndView(false);
                    window.gameApplication.getConf("conf/level_detail/1/" + mid + "/" + (lid + 1), null);
                } else {
                    window.gameApplication.gamingBackToMian(window.bid, window.mid);
                }
            }.bind(this));
        } else if ("Invite" == type) {
            window.gameApplication.onShareBtnClick(1,function (isCompleted) {
                if (isCompleted) {
                    SDK().getItem("tips", function (tip) {
                        tip = tip + 2;
                        SDK().setItem({ tips: tip }, null);
                        if (window.tipText != null) {
                            window.tipText.string = tip;
                        }
                        window.gameApplication.soundManager.playSound("reward");
                        for (var i = 0; i < 2; i = i + 1) {
                            this.scheduleOnce(function () {
                                window.gameApplication.flyTipAnim();
                            }.bind(this), i * 0.2)
                        }
                    }.bind(this));
                }
            }.bind(this))
        }
        /* //榜单界面
        else if ("FriendRank" == type) {
            SDK().shareBestScore3Times("all");
            this.GetFriendRank(this.friendPlayer);
            this.worldList.active = false;
            this.worldBtn.active = false;
            this.friendList.active = true;
            this.friendBtn.active = true;
        } */
        //关闭Bouns界面
        else if ("BounsOk" == type) {
            this.bounsView.active = false;
            this.bounsLight.stopAllActions();
            SDK().getItem("tips", function (tip) {
                tip = tip + 1;
                SDK().setItem({ tips: tip }, null);
                if (null != window.tipText) {
                    window.tipText.string = tip;
                }
                window.gameApplication.soundManager.playSound("reward");
                window.gameApplication.flyTipAnim();
            }.bind(this));
        }
    },

    onEnable() {
        this.LoadRank();
        this.drawView.opacity = 0;
        this.rankTip.active = false;
        this.isPlaying = false;
        var self = this;
        if (window.gameApplication != null) {
            //预加载上下两关
            var tmpId = window.lid;
            var arr = [];
            arr.push(tmpId);
            if (tmpId > 1) {
                arr.push(tmpId - 1);
            }
            arr.push(tmpId + 1);
            arr.forEach(function (tmp_lid) {
                var tmp_path = "conf/level_detail/1/" + mid + "/" + tmp_lid;
                window.gameApplication.getConf(tmp_path, function (map) {
                    if (tmp_lid == tmpId) {
                        //加载关卡
                        /*  if (map.isReversal == null || map.isReversal == false) {
                             self.reversal(map);
                             map.isReversal = true;
                         } */
                        self.curMap = map;
                        self.drawMap(map);
                    }
                });
            });
        }
        //获取提示数量
        SDK().getItem("tips", function (tip) {
            this.tipText.string = tip;
        }.bind(this));
        window.gameApplication.soundManager.playBg(2);
    },

    onDisable() {
        window.gameApplication.soundManager.playBg(1);
    },

    //清除图像
    clearMap() {
        var mapContent = this.drawView.getChildByName("Map");
        var lineContent = this.drawView.getChildByName("LinkLine");
        var helpContent = this.drawView.getChildByName("HelpLine");
        mapContent.removeAllChildren();
        lineContent.removeAllChildren();
        helpContent.removeAllChildren();
    },

    //方向判断
    checkDir(curInfo, lastInfo) {
        var linkDir = 0;
        if (curInfo.x == lastInfo.x) {
            //向上
            if (curInfo.y < lastInfo.y) {
                linkDir = 1;
            }
            //向下
            else {
                linkDir = 2;
            }

        } else if (curInfo.y == lastInfo.y) {
            //向左
            if (curInfo.x < lastInfo.x) {
                linkDir = 3;
            }
            //向右
            else {
                linkDir = 4;
            }

        }
        return linkDir;
    },

    //帮助逻辑
    helpLink() {
        let last;
        while (this.lineList.length > 0) {
            last = this.lineList.pop();
            this.curPoints[last.tag].isLink = false;
            this.linkDirDeal(this.curPoints[last.tag].linkColor, null, false);
            this.curPoints[last.tag].shadow.color = gray;
            this.curPoints[last.tag].next = null;
            this.pointAnim(last, null, null, null, true)
            this.winCount = this.winCount + 1;
        }
        var first = this.curHelpIdx - 4;
        for (var i = first; i <= this.curHelpIdx && i <= (this.curPoints.length - 1); i = i + 1) {
            if (i != 1) {
                this.helpAnim(i);
            }
        }
    },

    //帮助动画
    helpAnim(i) {
        this.scheduleOnce(function () {
            var dir = this.checkDir(this.curPoints[i].info, this.curPoints[i - 1].info);
            this.linkDirDeal(this.curPoints[i].helpLine, dir, true, true)
        }.bind(this), i * 0.05);
    },

    //连线处理
    linkDirDeal(linkColor, dir, isShow, opacity) {
        var dix = 42.5;
        var dixLength = 106;
        var length = 86;
        if (!isShow) {
            linkColor.anchorX = 0.5;
            linkColor.anchorY = 0.5;
            linkColor.width = length;
            linkColor.height = length;
            linkColor.position = linkColor.point.position;
            linkColor.color = gray;
            linkColor.setLocalZOrder(1);
            linkColor.opacity = 0;
            if (linkColor.line != null) {
                linkColor.line.width = 0;
                linkColor.line.x = 0;
                linkColor.line.y = 0;
            }
        } else {
            switch (dir) {
                case 1: {
                    linkColor.anchorY = 1;
                    linkColor.y = linkColor.y + dix;
                    linkColor.height = dixLength;
                    if (linkColor.line != null) {
                        linkColor.line.rotation = -90;
                        linkColor.line.y = -dix;
                    }
                } break;
                case 2: {
                    linkColor.anchorY = 0;
                    linkColor.y = linkColor.y - dix;
                    linkColor.height = dixLength;
                    if (linkColor.line != null) {
                        linkColor.line.rotation = 90;
                        linkColor.line.y = dix;
                    }
                } break;
                case 3: {
                    linkColor.anchorX = 0;
                    linkColor.x = linkColor.x - dix;
                    linkColor.width = dixLength;
                    if (linkColor.line != null) {
                        linkColor.line.rotation = -180;
                        linkColor.line.x = dix;
                    }
                } break;
                case 4: {
                    linkColor.anchorX = 1;
                    linkColor.x = linkColor.x + dix;
                    linkColor.width = dixLength;
                    if (linkColor.line != null) {
                        linkColor.line.rotation = 0;
                        linkColor.line.x = -dix;
                    }
                } break;
            };
            if (linkColor.line != null) {
                linkColor.line.anchorX = 1;
                linkColor.line.width = dixLength - 1;
            }
            linkColor.color = colors[this.curColorIdx];
            linkColor.setLocalZOrder(10);
            linkColor.opacity = 255;
            if (opacity) {
                linkColor.opacity = 125;
            }
        }
    },

    //处理点击点的碰撞
    onClickCollision(evt) {
        var data = evt.detail;
        var node = data.other.node;
        //如果是白格则直接不处理
        if (node.tag == 0) {
            return;
        }
        //如果点到第一个，则全部回退到第一格
        if (node.tag == 1) {
            //if (this.isFirstTouch) {
            let last;
            //没有到点击的方格则继续获取最后连接的方格
            while (this.lineList.length > 0) {
                last = this.lineList.pop();
                this.curPoints[last.tag].isLink = false;
                this.linkDirDeal(this.curPoints[last.tag].linkColor, linkDir, false);
                this.curPoints[last.tag].shadow.color = gray;
                this.curPoints[last.tag].next = null;
                this.pointAnim(last, null, null, null, true)
                this.winCount = this.winCount + 1;
            }
            //}
            return;
        }
        var isCanLink = false;
        var linkDir = 0;
        //如果连接过则回弹到该方格
        if (this.curPoints[node.tag].isLink) {
            let last = this.lineList.pop();
            //如果可以回退
            if (last != null) {
                //如果是最初点击
                //if (this.isFirstTouch || this.curPoints[node.tag].next == last.tag) {
                //没有到点击的方格则继续获取最后连接的方格
                while (last.tag != node.tag) {
                    this.curPoints[last.tag].isLink = false;
                    this.linkDirDeal(this.curPoints[last.tag].linkColor, linkDir, false);
                    this.curPoints[last.tag].shadow.color = gray;
                    this.curPoints[last.tag].next = null;
                    this.pointAnim(last, null, null, null, true)
                    this.winCount = this.winCount + 1;
                    last = this.lineList.pop();
                }
                this.lineList.push(last);
                this.pointAnim(node, 1.5, 1, true);
                //}
            }
        }

        //没有在连接列表里则判断是否能连接
        else {
            //获取最后连接的点
            var last = this.lineList.pop();
            var lastInfo;
            if (last != null) {
                //如果方格不为空则连接并播放方格动画
                this.pointAnim(last, null, null, null, true);
                this.lineList.push(last);
                lastInfo = this.curPoints[last.tag].info;
            } else {
                //如果为空，则第一个方格为最后连接的点
                last = this.curPoints[1].main;
                lastInfo = this.curPoints[1].info;
            }

            //获取最后方格的信息，并根据X和Y轴的信息进行判断能否连接
            var curInfo = this.curPoints[node.tag].info;
            if (curInfo.x == lastInfo.x) {
                if (Math.abs(curInfo.y - lastInfo.y) == 1) {
                    isCanLink = true;
                }
            } else if (curInfo.y == lastInfo.y) {
                if (Math.abs(curInfo.x - lastInfo.x) == 1) {
                    isCanLink = true;
                }
            }
            linkDir = this.checkDir(curInfo, lastInfo);
        }
        //如果可以连接
        if (isCanLink) {
            /* if (this.isTouching && this.isFirstTouch) {
                this.isFirstTouch = false;
            } */

            this.curMusicIdx = this.curMusicIdx + this.musicFix;
            if (this.curMusicIdx == 9) {
                this.curMusicIdx = 8;
                this.musicFix = -1;
            } else if (this.curMusicIdx == 0) {
                this.curMusicIdx = 1;
                this.musicFix = 1;
            }
            //window.gameApplication.soundManager.playSound("" + this.curMusicIdx);

            this.curPoints[last.tag].next = node.tag;
            this.lineList.push(node);
            this.linkDirDeal(this.curPoints[node.tag].linkColor, linkDir, true);
            this.curPoints[node.tag].isLink = true;
            this.curPoints[node.tag].shadow.color = colors[this.curColorIdx];
            this.pointAnim(node, 1.5, 1, true)
            this.winCount = this.winCount - 1;

            //提示按钮抖动重置
            this.tipText.node.parent.stopAllActions();
            this.tipText.node.parent.rotation = 0;
            this.unschedule(this.shake);
            this.scheduleOnce(this.shake, 15);
        }
        //胜利判断
        if (this.winCount == 0 && this.isPlaying) {
            this.isPlaying = false;
            //每十关的额外奖励
            if (lid % 10 == 0) {
                SDK().getItem(mid + "bouns" + lid, function (val) {
                    if (val != 1) {
                        var param = {};
                        param[mid + "bouns" + lid] = 1;
                        SDK().setItem(param);
                        this.bounsView.active = true;
                        this.bounsLight.runAction(cc.repeatForever(cc.sequence(cc.spawn(
                            cc.scaleTo(1, 1.3),
                            cc.fadeOut(1).easing(cc.easeOut(2))
                        ), cc.callFunc(function () {
                            this.bounsLight.scale = 1;
                            this.bounsLight.opacity = 255;
                            this.bounsLight.active = true;
                        }, this), )));
                    }
                }.bind(this))
            }
            SDK().getItem(mid + "_" + lid, function (score) {
                if (score <= 0) {
                    //保存自身所有星星
                    SDK().getItem("all", function (score) {
                        score += 1;
                        SDK().setItem({ all: score }, null);

                        //储存到世界榜单
                        SDK().setRankScore(2, score, "{}", null);
                    }.bind(this));

                    var bid = Math.floor( ( (mid - 1) / 5) );
                    //保存大关卡的星星
                    SDK().getItem("b_" + bid, function (score) {
                        score += 1;
                        var param = {};
                        param["b_" + bid] = score;
                        SDK().setItem(param, null);
                    }.bind(this));

            //保存mid关卡的星星
            SDK().getItem(mid + "", function (score) {
                score += 1;
                var param = {};
                param[mid + ""] = score;
                SDK().setItem(param, null);
            }.bind(this));

            //保存该关星星
            var param = {};
            param[mid + "_" + lid] = 1;
            SDK().setItem(param, null);
        }
    }.bind(this));
if (this.isHelping) {
    this.isHelping = false;
}
this.btns.active = false;
this.winAnim();
this.scheduleOnce(function () {
    SDK().getRecommendGames(1, function (isOK, res) {
        if (null != res.data.rows[0].pic5 && "" != res.data.rows[0].pic5) {
            this.LoadSprite(res.data.rows[0].pic5, this.adSprite, this.adSaver, cc.v2(this.adSprite.node.width, this.adSprite.node.height));
            this.adSprite.node.off(cc.Node.EventType.TOUCH_END);
            this.adSprite.node.on(cc.Node.EventType.TOUCH_END, function (event) {
                SDK().switchGameAsync(res.data.rows[0].game_id);
            }, this);
        }
    }.bind(this))
    window.gameApplication.openEndView(true);
    window.gameApplication.soundManager.playSound("winGame");
    window.gameApplication.playTimes++;
}.bind(this), 1);
        }
    },

//重新绘制地图
resetMap() {
    this.curHelpIdx = 0;
    this.curPoint = null;
    this.drawView.getChildByName("Map").removeAllChildren();
    this.drawView.getChildByName("LinkLine").removeAllChildren();
    this.drawView.getChildByName("HelpLine").removeAllChildren();
    this.drawMap(this.curMap);
},

//绘制地图
drawMap(map) {
    this.winCount = 0;
    this.clearMap();
    //提示按钮的间隔抖动控制
    this.tipText.node.parent.stopAllActions();
    this.tipText.node.parent.rotation = 0;
    this.unschedule(this.shake);
    this.scheduleOnce(this.shake, 15);

    //快捷方式的弹出
    if (this.playShort == null) {
        this.playShort = 1;
    } else {
        this.playShort = this.playShort + 1;
        if (this.playShort >= 2) {
            this.playShort = 0
            SDK().canCreateShortcutAsync(null);
        }
    }

    this.musicFix = 1;
    this.curMusicIdx = 0;
    this.curHelpIdx = 0;

    //按钮们的显示
    this.btns.active = true;
    //本关的方块
    this.curPoints = [];
    //本关的提示
    this.curHelps = [];
    //本关的描绘
    this.curLines = [];
    //储存连接起来的方块信息
    this.lineList = [];
    //随机本次关卡的方块颜色
    this.curColorIdx = Math.ceil(Math.random() * 5) - 1;
    var curColor = colors[this.curColorIdx];
    //获取本关的方块数组信息以及章节和关卡的信息
    var mapArray = map.map;
    this.levelText.string = (((map.mid - 1) % 5) + 1) + " - " + map.lid;
    //获取地图的描绘体并进行大小的缩放
    var mapContent = this.drawView.getChildByName("Map");
    var lineContent = this.drawView.getChildByName("LinkLine");
    var helpContent = this.drawView.getChildByName("HelpLine");
    mapContent.width = 106 * mapArray[0].length;
    mapContent.height = 106 * mapArray.length;
    lineContent.width = mapContent.width;
    lineContent.height = mapContent.height;
    helpContent.width = mapContent.width;
    helpContent.height = mapContent.height;
    this.drawView.opacity = 0;
    //循环方块数据进行方块的生成
    for (var i = 0; i < mapArray.length; i = i + 1) {
        for (var j = 0; j < mapArray[i].length; j = j + 1) {
            //生成一个方块并初始化信息
            var point = cc.instantiate(this.point_prefab);
            point.parent = mapContent;
            point.height = 96;
            point.width = 96;
            point.tag = mapArray[i][j];
            //初始化方块信息储存体
            this.curPoints[point.tag] = {};
            //获取方块的主体和阴影还有白线并保存
            var linkColor = cc.instantiate(this.line_prefab);
            linkColor.parent = lineContent;
            linkColor.point = point;
            var helpLine = cc.instantiate(this.line_prefab);
            helpLine.parent = helpContent;
            helpLine.point = point;
            var shadow = point.getChildByName("Shadow");
            var line = linkColor.getChildByName("Line");
            linkColor.line = line;
            //判断该方块的颜色和连线的颜色以及提示线的颜色设置
            if (mapArray[i][j] == 0) {
                point.opacity = 0;
                helpLine.opacity = 0;
                this.curPoints[point.tag].isLink = true;
            } else if (mapArray[i][j] == 1) {
                linkColor.color = curColor;
                helpLine.color = lColors[this.curColorIdx];
                this.curPoints[point.tag].isLink = true;
            } else {
                linkColor.color = gray;
                helpLine.color = gray;
                this.winCount++;
                this.curPoints[point.tag].isLink = false;
            }
            //连线的初始化
            if (mapArray[i][j] != 1) {
                linkColor.opacity = 0;
            }
            linkColor.height = 86;
            linkColor.width = 86;
            helpLine.opacity = 0;
            helpLine.height = 86;
            helpLine.width = 86;
            linkColor.setLocalZOrder(1);
            //阴影的初始化
            shadow.color = linkColor.color;
            shadow.opacity = 0;
            shadow.scale = 1;
            //添加方块的碰撞体并设置信息
            var box = point.addComponent(cc.CircleCollider);
            box.tag = 1;
            box.radius = 45;
            //将该方块的信息以tag为标保存下来
            this.curPoints[point.tag].info = cc.v2(j, i);
            this.curPoints[point.tag].main = point;
            this.curPoints[point.tag].linkColor = linkColor;
            this.curPoints[point.tag].helpLine = helpLine;
            this.curPoints[point.tag].shadow = shadow;
        }
    }
    this.posLinkLine();
    this.drawView.runAction(cc.fadeIn(1));
    if (window.mid == 1 && map.lid == 1) {
        this.guideHand.active = true;
        this.guideAnim();
    } else {
        this.guideHand.active = false;
    }
},

//引导动画
guideAnim() {
    this.guideHand.runAction(cc.repeatForever(
        cc.sequence(
            cc.callFunc(function () {
                this.guideHand.position = cc.v2(-110, 0);
            }.bind(this), this),
            cc.moveTo(1.5, cc.v2(110, 0)),
        )
    ));
},

//定位连接的线
posLinkLine() {
    this.scheduleOnce(function () {
        if (this.curPoints[1].main.x == 0 && this.curPoints[1].main.y == 0) {
            this.posLinkLine();
        } else {
            this.curPoints.forEach(element => {
                element.linkColor.position = element.main.position;
                element.helpLine.position = element.main.position;
            });
            this.isPlaying = true;
        }
    }.bind(this), 0.1)
},

//点的动画
pointAnim(point, scal, during, isRepeat, isStop) {
    point.stopAllActions();
    let shadow = point.getChildByName("Shadow");
    if (isStop) {
        shadow.stopAllActions();
        shadow.opacity = 0;
        shadow.scale = 1;
    } else {
        shadow.active = true;
        shadow.scale = 1;
        shadow.opacity = 255;
        if (isRepeat) {
            shadow.runAction(cc.repeatForever(cc.sequence(cc.spawn(
                cc.scaleTo(during, scal),
                cc.fadeOut(during).easing(cc.easeOut(2))
            ), cc.callFunc(function () {
                shadow.scale = 1;
                shadow.opacity = 255;
                shadow.active = true;
            }, this), )));
        } else {
            shadow.runAction(cc.spawn(
                cc.scaleTo(during, scal),
                cc.fadeOut(during).easing(cc.easeOut(2)),
            ));
        }
    }
},


//胜利动画
winAnim() {
    window.gameApplication.soundManager.playSound("gameWin");
    this.pointAnim(this.curPoints[1].main, 5, 2, false);
    let last;
    //没有到点击的方格则继续获取最后连接的方格
    while (this.lineList.length > 0) {
        last = this.lineList.pop();
        this.pointAnim(last, 5, 2, false);
    }
},

//提示按钮的晃动动画
shake() {
    this.tipText.node.parent.runAction(cc.repeatForever(cc.sequence(
        cc.rotateTo(0.1, 5).easing(cc.easeIn(2)),
        cc.rotateTo(0.2, -5).easing(cc.easeIn(2)),
        cc.rotateTo(0.2, 5).easing(cc.easeIn(2)),
        cc.rotateTo(0.1, 0).easing(cc.easeIn(2)),
        cc.delayTime(0.5)
    )));
},


//加载榜单
LoadRank() {
    SDK().getFriendsInfo(function (list) {
        this.GetFriendRank(list);
    }.bind(this));
},

//好友邀请列表
GetFriendRank(list) {
    this.friendPlayer = list;
    if (this.isFrist == null) {
        this.isFrist = false;
        //加载自己
        var playerBar = cc.instantiate(this.prefab_player);
        playerBar.color = cc.color(238, 238, 238, 255);
        var Head = playerBar.getChildByName("HeadMask").getChildByName("Head").getComponent(cc.Sprite);
        var Name = playerBar.getChildByName("Name").getComponent(cc.Label);
        var No = playerBar.getChildByName("No").getComponent(cc.Label);
        var Score = playerBar.getChildByName("Score");
        No.node.active = true;
        Score.active = false;
        Name.node.active = true;
        No.string = 1;
        SDK().getSelfInfo(function (MyPlayer) {
            Name.string = MyPlayer.name;
            Head.spriteFrame = MyPlayer.head;
        }.bind(this));
        playerBar.parent = this.friendContent;
        var playBtn = playerBar.getChildByName("Play");
        playBtn.off(cc.Node.EventType.TOUCH_END);
        playBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            // this.menuClick(null, "Next");
        }, this);
    }
    var isFalse = false;
    if (this.friendPlayer.length == null) {
        this.friendPlayer.length = 4;
        isFalse = true;
    }

    for (var i = 0; i < this.friendPlayer.length; i = i + 1) {
        var playerBar;
        var Head;
        var Name;
        var No;
        if (i >= this.friendUIPlayer.length) {
            playerBar = cc.instantiate(this.prefab_player);
            this.friendUIPlayer[i] = {};
            this.friendUIPlayer[i].playerBar = playerBar;

            Head = playerBar.getChildByName("HeadMask").getChildByName("Head").getComponent(cc.Sprite);
            this.friendUIPlayer[i].Head = Head;

            Name = playerBar.getChildByName("Name").getComponent(cc.Label);
            this.friendUIPlayer[i].Name = Name;

            No = playerBar.getChildByName("No").getComponent(cc.Label);
            this.friendUIPlayer[i].No = No;

            var Score = playerBar.getChildByName("Score");
            No.node.active = true;
            Score.active = false;
        } else {
            playerBar = this.friendUIPlayer[i].playerBar;
            Head = this.friendUIPlayer[i].Head;
            Name = this.friendUIPlayer[i].Name;
            No = this.friendUIPlayer[i].No;
        }
        if (i % 2 != 0) {
            playerBar.color = cc.color(238, 238, 238, 255);
        }
        if (isFalse) {
            Head.node.active = false;
            Name.node.active = false;
            No.node.active = false;
            var playBtn = playerBar.getChildByName("Play");
            playBtn.active = false;
        } else {
            No.string = (i + 2);
            var playBtn = playerBar.getChildByName("Play");
            Name.node.active = true;
            playerBar.name = this.friendPlayer[i].id;
            var self = this;
            let id = this.friendPlayer[i].id
            playBtn.off(cc.Node.EventType.TOUCH_END);
            playBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
                SDK().playWith(id, self.highestScore, function (isCompleted) {

                }.bind(this));
            }, this);
            Name.string = this.friendPlayer[i].name;
            //加载头像
            this.LoadSprite(this.friendPlayer[i].headUrl, Head, this.headSpriteList[this.friendPlayer[i].id]);
        }
        playerBar.parent = this.friendContent;
    }
    if (this.friendPlayer.length < this.friendUIPlayer.length) {
        for (var i = this.friendPlayer.length; i < this.friendUIPlayer.length; i = i + 1) {
            this.friendUIPlayer[i].playerBar.active = false;
        }
    }

},

//根据URL加载头像并到对应的sprite上
LoadSprite(url, sprite, saver, size) {
    if (saver == null) {
        cc.loader.load(url, function (err, texture) {
            saver = new cc.SpriteFrame(texture);
            sprite.spriteFrame = saver;
            if (size != null) {
                sprite.node.width = size.x;
                sprite.node.height = size.y;
            }
        });
    } else {
        sprite.spriteFrame = saver;
        if (size != null) {
            sprite.node.width = size.x;
            sprite.node.height = size.y;
        }
    }
},

update(dt) {
},
});
