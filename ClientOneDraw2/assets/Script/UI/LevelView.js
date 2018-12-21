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
        scrollView:{
            default:null,
            type:cc.ScrollView,
        },
        item: {
            default: null,
            type: cc.Node,
        },
        title: {
            default: null,
            type: cc.Label,
        },
        starts: {
            default: null,
            type: cc.Node,
        },
        content: {
            default: null,
            type: cc.Node,
        },
        itemList: {
            default: [],
            type: [cc.Node],
            visible: false,
        },
        levels: {
            default: {},
        },
        bid: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        mid: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        lastLid: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        gameApplication: {
            default: null,
            type: Object,
            visible: false,
        },
        ui_viewAtlas: {
            default: null,
            type: cc.SpriteAtlas,
        },
    },

    onLoad: function () {
        this.gameApplication = cc.find("GameApplication").getComponent("GameApplication");
    },

    start() {

    },

    onEnable(){
        this.scrollView.scrollToTop(0.1);
    },

    init(bid, mid, mission) {
        this.hideAllItem();
        this.title.string = "Level "+( ( (mid-1) % 5) + 1);
        if ((this.levels == null || Object.keys(this.levels).length <= 0) || this.bid != bid || this.mid != mid) {
            this.bid = bid;
            this.mid = mid;
            this.levels = mission;
            this.initContents();
        } else {
            this.bid = bid;
            this.mid = mid;
            this.initContents();
        }

        var self = this;
        var tmp_path = "conf/level_detail/" + mid + "/" + 1;
        window.gameApplication.getConf(tmp_path, null);

        SDK().getItem(mid, function (score) {
            self.starts.getComponent(cc.Label).string = score.toString()+"/100";
        }.bind(this));
    },

    initContents() {
        var self = this;
        this.lastLid = 0;

        this.bid = self.levels.bid;
        this.mid = self.levels.mid;
        self.initLevels(self.levels);
    },

    initLevels(level) {
        this.content.active = false;
        var total_level = level['stars'];

        for (var i = 1; i <= total_level; i = i + 1) {
            if (null == this.itemList[i - 1]) {
                var cannonNode = cc.instantiate(this.item);
                cannonNode.parent = this.content;
                cannonNode.active = true;
                cannonNode.tag = i;
                this.itemList[i - 1] = cannonNode;
            }
            var itemNode = this.itemList[i - 1];
            //重置
            this.setItem(itemNode, 0, false, i);
            this.checkUnLock(itemNode, i);

        }
        var tmp_path = "conf/level_detail/" + this.mid + "/" + window.lastLid;
        window.gameApplication.getConf(tmp_path, null);
    },

    //判断是否解锁
    checkUnLock(itemNode, lid) {
        var self = this;
        SDK().getItem(self.mid + "_" + lid, function (score) {

            var isOpen = false;
            if (lid <= self.lastLid + 1 || score > 0 || lid == 1) {
                isOpen = true;
                self.setItem(itemNode, score, isOpen, lid);
            } else if (openAllLevel) {
                self.setItem(itemNode, score, true, lid);
            }

            if (score > 0) {
                self.lastLid = lid;
                window.lastLid = lid;
            }
            if (self.levels['stars'] == lid) {
                self.content.active = true;
            }
        });
    },

    setItem(node, score, isOpen, lid) {
        //解锁的背景
        var unlockBg = cc.find("unlock", node);
        unlockBg.active = isOpen;
        unlockBg.width = 93;
        unlockBg.height = 93;
        //锁住的背景
        var lockBg = cc.find("lock", node);
        lockBg.color = cc.color(98, 98, 98, 255);
        lockBg.active = !isOpen;
        lockBg.width = 93;
        lockBg.height = 93;
        var lockSprite = cc.find("lock/text", node);
        lockSprite.active = true;
        //关卡数显示
        var unlockText = cc.find("unlock/text", node).getComponent(cc.Label);
        unlockText.string = lid;
        unlockText.fontSize = 50;
        unlockText.node.position = cc.v2(0, 12);
        unlockText.node.active;
        //星星显示
        var unlockStar = cc.find("unlock/star", node);
        unlockStar.active = true;
        //判断是否显示礼包
        var isGift = lid % 10 == 0;
        var gift = cc.find("Gift", node);
        if (isGift) {
            gift.active = true;
            unlockStar.active = false;
            unlockText.node.active = false;
            lockSprite.active = false;
        } else {
            gift.active = false;
        }

        //是否过关处理
        if (score <= 0) {
            //没过关星星变白，背景变灰
            unlockStar.color = cc.color(150, 150, 150, 255);
            unlockBg.color = cc.color(255, 255, 255, 255);
            unlockText.node.color = cc.color(150, 150, 150, 255);
        } else {
            //过关星星变黄，背景变化指定颜色，礼包的图标隐藏
            unlockStar.color = cc.color(255, 204, 0, 255);
            unlockText.node.color = cc.color(255, 255, 255, 255);
            var fixMid = Math.floor((this.mid - 1) / 5)
            var fixMid1 = Math.floor((this.mid - fixMid * 5) - 1)
            unlockBg.color = itemColor[fixMid][fixMid1];
            gift.active = false;
            unlockStar.active = true;
            unlockText.node.active = true;
        }

        node.active = true;
    },

    onLevelItemClicked(event) {
        this.gameApplication.soundManager.playSound("btn_click");
        var target = event.target;
        var targetBtn = target.getComponent(cc.Button);
        targetBtn.interactable = false;

        var tag = parseInt(target.tag);
        //判断是否可以玩
        if (tag < 1 || tag > this.lastLid + 1) {
            //不能玩
            targetBtn.interactable = true;
        } else {
            window.bid = this.bid;
            window.mid = this.mid;
            window.lid = tag;
            window.gameApplication.openGameView(true);
            targetBtn.interactable = true;
        }
    },

    hideAllItem() {
        this.content.active = false;
    },

    onBackBtnClicked() {
        this.hideAllItem();
        this.gameApplication.openMainView(true);
        this.gameApplication.soundManager.playSound("btn_click");
    },
    // update (dt) {},
});
