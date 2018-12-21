var Utils = require("./utils/SDKUtils");
var SDK_AD = require("./script/sdk_ad");
var GAME_CHECK_URL = "https://haiwai.31home.com:8003/games.detail";
var GAME_RECOMMEND_URL = "https://haiwai.31home.com:8003/games.recommend";
var GAME_STAT_URL = "https://haiwai.31home.com:8003/games.stat";

var ELoadState = {
    AD_LOADING: "AD_LOADING",
    AD_LOAD_SUCCESS: "AD_LOAD_SUCCESS",
    AD_LOAD_FAIL: "AD_LOAD_FAIL",
    AD_COMPLETE: "AD_COMPLETE"
};

//SDK广告node的路径
var sdkADName = "Canvas/sdk_ad";
//视频广告ID
var video_ad_ids = '595624540811806_595626367478290';
//插屏广告ID
var interstitial_ad_ids = '595624540811806_595626024144991';
//游戏ID
var game_id = "595624540811806";

//广告配置为默认配置，进入游戏后会加载服务器配置，如果服务器读取失败，使用默认配置。
//每玩N局播一次插屏广告，如果<=1，代表每次播放
var interstitialCount = 2;
//是否播放视频广告
var videoOn = 1;
//是否播放插屏广告
var interstitialOn = 1;
//是否播放互推插屏广告
var interstitialOp = 0;
//好友榜单名（目前暂时不用）
var rankName_friends = "FRIEND";
//世界榜单名
var rankName_world = "WORLD";
var locale = "";

var MyPlayer = {}

var FB_SDK = function () {
    this.cb = null;
    this.videoAd = null;
    this.videoAdState = null;
    this.InterstitialAd = null;
    this.InterstitialAdState = null;
    this.playTimes = 0;

    this.sdk_ad = null;
};

/**
 * =========================================================
    * 初始化
 * =========================================================
**/

/**
    初始化
    1）执行初始化服务器配置
    2）加载视频广告、插屏广告
    3）设置语言
*/
FB_SDK.prototype.init = function () {

    this.initOP();
    if (typeof FBInstant === 'undefined') {
        const i18n = require('LanguageData');
        //i18n.init('zh');
        i18n.init('en');
        return;

    }
    // console.log("playerID",FBInstant.player.getID());
    this.playTimes = 0;

    //预加载视频广告和插屏广告
    this.loadVideoAd();
    this.loadInterstitialAd();

    MyPlayer.name = FBInstant.player.getName();
    cc.loader.load(FBInstant.player.getPhoto(), function (err, texture) {
        MyPlayer.head = new cc.SpriteFrame(texture);
    });
    MyPlayer.id = FBInstant.player.getID();

    this.locale = this.getLocale(); // 'en_US'
    //根据语言配置
    if (locale == 'zh_CN') {
        const i18n = require('LanguageData');
        i18n.init('zh');
    } else {
        const i18n = require('LanguageData');
        i18n.init('en');
    }
};

/**
 * 初始化服务器对游戏的配置
**/
FB_SDK.prototype.initOP = function () {

    //从服务器加载初始化数据
    // cc.log("[gameCheck]" + GAME_CHECK_URL);
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status == 200)) {
            var response = JSON.parse(xhr.responseText);
            console.log("response", response);
            var code = response.code;
            if (code != 500) {
                // cb(true,response);

                var data = response.data;

                var interstitial_op = data.interstitial_op;     //每10局显示几次互推
                var interstitial_count = data.interstitial_count;  //每多少局显示一次插屏广告
                var video_on = data.video_on;    //是否显示视频广告
                var interstitial_on = data.interstitial_on;   //是否显示插屏广告
                self.setUp(video_on, interstitial_on, interstitial_count, interstitial_op);
            }
        }
    };

    xhr.open("GET", GAME_CHECK_URL + "?game_id=" + SDK().getGameId(), true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send();
};


/**
 * 根据后台配置，设置属性
**/
FB_SDK.prototype.setUp = function (video_on, interstitial_on, interstitial_count, interstitial_op) {
    // console.log("setUp__interstitialCount",interstitial_count)
    // console.log("interstitialCount",interstitialCount)
    interstitialCount = interstitial_count;
    videoOn = video_on;
    interstitialOn = interstitial_on;
    interstitialOp = interstitial_op;

    // console.log("interstitialCount:",interstitialCount);
    if (interstitialOn >= 1 && interstitialOp >= 1) {
        var sdkADNode = cc.find(sdkADName);
        if (sdkADNode != null) {
            this.sdk_ad = sdkADNode.getComponent(SDK_AD);
        }

        //加载互推广告
        this.reLoadOpAd();
    }
};


/**
 * 重新加载互推插屏广告
**/
FB_SDK.prototype.reLoadOpAd = function () {

    if (this.sdk_ad != null && interstitialOn >= 1 && interstitialOp >= 1) {
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status == 200)) {
                var response = JSON.parse(xhr.responseText);
                // console.log("______________response",response);
                var code = response.code;
                if (code != 500) {
                    // cb(true,response);
                    var data = response.data.rows[0];
                    if (data != null) {
                        var pic = data.pic3;
                        var gid = data.game_id;
                        self.sdk_ad.setAd(pic, gid);
                    }
                }
            }
        };

        xhr.open("GET", GAME_RECOMMEND_URL + "?game_id=" + game_id + "&amount=1", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send();

        // console.log(GAME_RECOMMEND_URL + "?game_id="+game_id +"&amount=1")
    }
};

/**
 * 重新加载互推插屏广告
**/
FB_SDK.prototype.getRecommendGames = function (amount, cb) {

    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status == 200)) {
            var response = JSON.parse(xhr.responseText);
            // console.log("______________response",response);
            var code = response.code;
            if (code != 500) {
                if (cb != null) {
                    cb(true, response);
                }
            } else {
                if (cb != null) {
                    cb(false, {});
                }

            }
        }
    };

    xhr.open("GET", GAME_RECOMMEND_URL + "?game_id=" + game_id + "&amount=" + amount, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send();

    console.log(GAME_RECOMMEND_URL + "?game_id=" + game_id + "&amount=" + amount)
};


/**
 * =========================================================
    * 保存、读取数据
 * =========================================================
**/

/**
 * 获得用户属性（一般来说可以获得设置的分数，以及用户的其他属性）
**/
FB_SDK.prototype.getItem = function (key, cb) {
    if (typeof FBInstant === 'undefined') {
        var score = JSON.parse(cc.sys.localStorage.getItem(key));
        if (typeof score === 'undefined' || score == null) {
            score = 0;
        }
        cb(score, key);
    } else {
        var score = 0;
        FBInstant.player
            .getDataAsync(['' + key])
            .then(function (data) {
                //console.log('data is loaded',key,data[key]);
                if (typeof data[key] === 'undefined') {
                    score = 0;
                    //console.log(key+"+null")
                } else {
                    score = data[key];
                }
                cb(score, key);
            });
    }
};



/**
 * 设置属性，如记录分数、记录各类和用户相关的属性
 * param要传递一个对象进来，如{score:100}
**/
FB_SDK.prototype.setItem = function (param, cb) {
    if (typeof FBInstant === 'undefined') {
        for (var p in param) {//遍历json对象的每个key/value对,p为key
            // cc.log("setScore:"+ p + "_" + param[p]);
            cc.sys.localStorage.setItem(p, param[p]);
        }
        // 
        if (cb != null) {
            cb();
        }
    } else {
        FBInstant.player
            .setDataAsync(param)
            .then(function () {
                if (cb != null) {
                    cb();
                }
                // console.log('------------data is set',param);
            });
    }
};

/**
 * =========================================================
    * 基础接口
 * =========================================================
**/

/**
 * 获得用户的国家地区语言
**/
FB_SDK.prototype.getLocale = function () {
    if (typeof FBInstant === 'undefined') return;

    return FBInstant.getLocale();
};

/**
 * 获得游戏ID
**/
FB_SDK.prototype.getGameId = function () {
    return game_id;
};

/**
 * 获得玩家昵称
**/
FB_SDK.prototype.getName = function () {
    if (typeof FBInstant === 'undefined') return "undefined";
    return FBInstant.player.getName();
};

/**
 * 创建桌面快捷方式
**/
FB_SDK.prototype.canCreateShortcutAsync = function (cb) {
    if (typeof FBInstant === 'undefined') return;

    FBInstant.canCreateShortcutAsync()
        .then(function (canCreateShortcut) {
            if (canCreateShortcut) {
                FBInstant.createShortcutAsync()
                    .then(function () {
                        // Shortcut created
                        if (cb != null) {
                            cb(true);
                        }
                    })
                    .catch(function () {
                        // Shortcut not created
                        if (cb != null) {
                            cb(false);
                        }
                    });
            } else {
                if (cb != null) {
                    cb(false);
                }
            }
        });
};

/**
 * 切换到别的游戏（互推游戏）
**/
FB_SDK.prototype.switchGameAsync = function (game_id) {
    if (typeof FBInstant === 'undefined') return false;
    FBInstant.switchGameAsync(game_id).catch(function (e) {
        // Handle game change failure
    });
};

/**
 * =========================================================
    * 支付相关
 * =========================================================
**/

/**
 * 获取游戏商品目录
 * （列表是后台添加的列表）
**/
FB_SDK.prototype.getCatalogAsync = function (cb) {
    if (typeof FBInstant === 'undefined') {
        if (cb != null) {
            cb([]);
        }
        return;
    }

    FBInstant.payments.getCatalogAsync().then(function (catalog) {
        console.log(catalog); // [{productID: '12345', ...}, ...]
        cb(catalog);
    });
};

/**
 * 支付
 * 支付成功后，返回支付订单。然后调用consumePurchaseAsync使用，使用后发放道具。
**/
FB_SDK.prototype.purchaseAsync = function (productID, developerPayload, cb) {

    if (typeof FBInstant === 'undefined') {
        if (cb != null) {
            cb(false, null);
        }
        return;
    }

    FBInstant.payments.purchaseAsync({
        productID: productID,
        developerPayload: developerPayload,
    }).then(function (purchase) {
        console.log(true, purchase);
        cb(purchase);
        // {productID: '12345', purchaseToken: '54321', developerPayload: 'foobar', ...}
    }).catch(function (e) {
        cb(false, null);
    });
};

/**
 * 获取未消费的支付列表
 * (可能出现的原因是，支付成功后，断网或没有拿到订单)
 * 即：每次进入游戏后，应该请求一下是否有已支付未消费的订单。
**/
FB_SDK.prototype.getPurchasesAsync = function (cb) {

    if (typeof FBInstant === 'undefined') {
        if (cb != null) {
            cb(false, null);
        }
        return;
    }

    FBInstant.payments.getPurchasesAsync().then(function (purchases) {
        cb(purchases);
        // [{productID: '12345', ...}, ...]
    }).catch(function (e) {
        cb([]);
    });
};


/**
 * 消费已支付的订单（一定要在发物品、道具之前调用这个接口，返回成功后才能发放物品）
 * purchaseToken 为支付成功的purchaseToken
**/
FB_SDK.prototype.consumePurchaseAsync = function (purchaseToken, cb) {

    if (typeof FBInstant === 'undefined') {
        if (cb != null) {
            cb(false, null);
        }
        return;
    }

    FBInstant.payments.consumePurchaseAsync(purchaseToken).then(function () {
        // Purchase successfully consumed!
        // Game should now provision the product to the player
        cb(true);
    }).catch(function (e) {
        cb(false);
    });
};



/**
 * =========================================================
    * 分享
 * =========================================================
**/


/**
 * 分享分数
**/
FB_SDK.prototype.share = function (score, cb,type=2) {
    if (typeof FBInstant === 'undefined') {
        if (cb != null) {
            cb(true);
        }
        return;
    }
    var self = this;

    FBInstant.context
        .chooseAsync()
        .then(function () {
            console.log("FBInstant.context:",FBInstant.context.getPlayersAsync());
            self.doShare(type,score);
            if (cb != null) {
                cb(true);
            }
        }
        ).catch(function (e) {
            // console.log("catch",e);
            if (e.code != null && e.code == "SAME_CONTEXT") {
                //相同的用户或group，不能再次发消息
                if (cb != null) {
                    cb(false);
                }
            }
        });
};

/**
 * 执行分享动作
 * 并读取resources/texture2d/game_icon.png 作为分享图片
**/
FB_SDK.prototype.doShare = function (ptype,score) {
    var self = this;
    //英文
    var en_text1 = "I just use 3 second to pass. Do you admire me?";
    var en_text2 = "I am very strong in the usual, but still need your help now. Click here please."
    //中文
    var cn_text1 = "3秒过关，就问你服不服！";
    var cn_text2 = "平时再坚强，现在也需要你的帮助。。。求帮点击下。"
    //MX, ES: 西班牙语
    var es_text1 = "Solo uso 3 segundos para pasar. ¿Me admiras?";
    var es_text2 = "Soy muy fuerte en lo habitual, pero aún necesito tu ayuda ahora. Haga clic aquí por favor."
    //BR, PT: 葡萄牙语
    var pt_text1 = "Eu só uso 3 segundos para passar. Você me admira?";
    var pt_text2 = "Eu sou muito forte no habitual, mas ainda preciso de sua ajuda agora. Clique aqui por favor."
    //VN: 越南语
    var vn_text1 = "Tôi chỉ cần sử dụng 3 giây để vượt qua. Bạn có ngưỡng mộ tôi không?";
    var vn_text2 = "Tôi rất mạnh mẽ trong bình thường, nhưng vẫn cần sự giúp đỡ của bạn ngay bây giờ. Vui lòng bấm vào đây."
    var share_text = "";
    switch(this.locale)
    {
        case 'zh_CN':
            share_text = ptype == 1 ? cn_text1 : cn_text2;
        break;
        case 'es_MX':
            share_text = ptype == 1 ? es_text1 : es_text2;
        break;
        case 'pt_BR':
            share_text = ptype == 1 ? pt_text1 : pt_text2;
        break;
        case 'vi_VN':
            share_text = ptype == 1 ? vn_text1 : vn_text2;
        break;
        default:
            share_text = ptype == 1 ? en_text1 : en_text2;
        break;
    }
    console.log("share:",this.locale,"-->",share_text,"-->",ptype);

    var framePath = ptype == 1 ? "texture2d/game_icon" : "texture2d/game_icon1"; 
    // console.log("framePath:",framePath)
    cc.loader.loadRes(framePath, cc.Texture2D, function (err, texture) {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 420;

        let image = texture.getHtmlElementObj();
        ctx.drawImage(image, 0, 0);

        var base64Picture = canvas.toDataURL('image/png');

        FBInstant.updateAsync({
            action: 'CUSTOM',
            cta: 'Play Game',
            template: 'join_fight',
            image: base64Picture,
            text: share_text,
            data: { myReplayData: '...' },
            strategy: 'IMMEDIATE',
            notification: 'NO_PUSH',
        }).then(function () {
            //当消息发送后
            // console.log("____当消息发送后")
        });
    });
};

/**
 * 每三分钟提示分享，并分享最高分数
 * 并读取resources/texture2d/game_icon.png 作为分享图片
**/
FB_SDK.prototype.shareBestScore3Times = function (key) {
    SDK().getItem("share_times", function (t) {
        //如果没有设置过倒计时，那么设置为3分钟
        var now = Math.floor(Date.now() / 1000);
        // console.log("t:",t)
        // console.log("t-now:",t-now)
        if (t == null || t <= 0 || t - now < 0) {
            var param = {};
            param['share_times'] = now + 180;
            SDK().setItem(param, function () {
                SDK().shareBestScore(key);
            });
        }
    });
};

/**
 * 分享最高分数
 * 并读取resources/texture2d/game_icon.png 作为分享图片
**/
FB_SDK.prototype.shareBestScore = function (key, cb) {
    if (key == null || key == "") {
        key = "all";
    }
    this.getItem(key, function (score) {
        SDK().share(score, function (isCompleted) {
            if (cb) {
                cb(isCompleted)
            }
        },1);
    }.bind(this));
};


/**
 * =========================================================
    * 广告相关
 * =========================================================
**/

/**
 * 游戏次数+1
**/
FB_SDK.prototype.plusPlayTimes = function () {

    this.playTimes++;
    if ((this.playTimes > 1 && this.playTimes % this.getInterstitialCount() == 0 && this.playTimes >= this.getInterstitialCount()) || (this.getInterstitialCount() <= 1 && this.playTimes > 1)) {
        var delayTime = 200 + Math.random() * 1000;
        setTimeout(function () {
            this.showInterstitialAd(function (isCompleted) {
                console.log("播放Done");
            }, false);
        }.bind(this), delayTime);

        this.canCreateShortcutAsync();
    }

    if (this.playTimes == 5) {
        this.shareBestScore("all", null);
    }
};


/**
 * 是否打开视频广告
**/
FB_SDK.prototype.openVideoAd = function () {
    return videoOn >= 1;
};

/**
 * 是否打开插屏广告
**/
FB_SDK.prototype.openinterstitialAd = function () {
    return interstitialOn >= 1;
};

/**
 * 每玩多少局播放一次插屏广告
**/
FB_SDK.prototype.getInterstitialCount = function () {
    return interstitialCount;
};

//是否显示互推广告（互相推荐自己的游戏）
FB_SDK.prototype.isPlayOpAD = function () {
    var test = cc.random0To1() * 10;
    if (test <= interstitialOp) {
        return true;
    } else {
        return false;
    }
};

/**
 * 加载插屏广告
**/
FB_SDK.prototype.loadInterstitialAd = function () {
    if (typeof FBInstant === 'undefined') return;
    if (!this.openinterstitialAd()) {
        return;
    }

    // console.log("loadInterstitialAd")
    FBInstant.getInterstitialAdAsync(
        interstitial_ad_ids,
    ).then(function (interstitial) {
        // console.log("FBInstant.getInterstitialAdAsync:",interstitial);
        this.InterstitialAd = interstitial;
        this.InterstitialAdState = ELoadState.AD_LOADING;
        return this.InterstitialAd.loadAsync();
    }.bind(this)).catch(function (e) {
        // console.log("load.showInterstitialAd catch");
        // console.log(JSON.stringify(e));
    }.bind(this))
        .then(function () {
            // console.log("FBInstant.getInterstitialAdAsync done:");
            this.InterstitialAdState = ELoadState.AD_LOAD_SUCCESS;
        }.bind(this));
};

/**
 * 播放插屏广告
**/
FB_SDK.prototype.showInterstitialAd = function (cb, noOp) {


    // console.log("FB_SDK.prototype.showInterstitialAd",this.InterstitialAd);
    // console.log("this.sdk_ad",this.sdk_ad);
    // console.log("interstitialOn",interstitialOn);

    if (interstitialOn < 1) {
        return;
    }

    if ((this.sdk_ad != null && interstitialOp >= 1 && Utils.GetRandomNum(1, 10) <= interstitialOp && !noOp) || (this.InterstitialAd == null && this.sdk_ad != null && !noOp)) {
        // if(this.sdk_ad != null){
        console.log("sdk_ad:", this.sdk_ad)
        this.sdk_ad.show();

        this.stat(1, this.sdk_ad.game_id);
        if (cb) {
            cb(true);
        }

        // console.log("this.sdk_ad.show()");
    } else if (this.InterstitialAd != null) {
        if (typeof FBInstant === 'undefined') {
            if (cb) {
                cb(false);
            }
            return;
        };

        // console.log("show Interstitial ad start");
        this.InterstitialAd.showAsync().then(function () {
            // console.log("this.showInterstitialAd.showAsync");
            this.InterstitialAdState = ELoadState.AD_COMPLETE;
            // this.game.paused = false;
            // window.sounds.toggleMusic(false);
            if (cb) {
                cb(true);
            }

            // console.log("show showInterstitialAd success");
            this.loadInterstitialAd();
        }.bind(this))
            .catch(function (e) {
                // console.log("this.showInterstitialAd catch");
                this.InterstitialAdState = ELoadState.AD_COMPLETE;
                // this.game.paused = false;
                // window.sounds.toggleMusic(false);
                // console.log(JSON.stringify(e));
                if (cb) {
                    cb(false);
                }
            }.bind(this));
    } else {
        // console.log("show showInterstitialAd ad Stop");
        if (cb) {
            cb(false);
        }
        this.loadInterstitialAd();
    }
};

/**
 * 加载视频广告
**/
FB_SDK.prototype.loadVideoAd = function () {
    if (typeof FBInstant === 'undefined') return;

    if (!this.openVideoAd()) {
        return;
    }
    // console.log("FB_SDK.prototype.loadVideoAd");
    FBInstant.getRewardedVideoAsync(
        video_ad_ids,
    ).then(function (rewardedVideo) {
        this.videoAd = rewardedVideo;
        this.videoAdState = ELoadState.AD_LOADING;
        return this.videoAd.loadAsync();
    }.bind(this)).then(function () {
        this.videoAdState = ELoadState.AD_LOAD_SUCCESS;
    }.bind(this));
};

/**
 * 是否有视频广告可以播放
**/
FB_SDK.prototype.hasVideoAd = function () {
    if (typeof FBInstant === 'undefined') {
        return false;
    };

    return this.videoAd != null;
};

/**
 * 播放视频广告
**/
FB_SDK.prototype.showVideoAd = function (cb) {
    if (typeof FBInstant === 'undefined') {
        if (cb) {
            cb(false);
        }
        return;
    };

    // console.log("FB_SDK.prototype.showVideoAd",this.videoAd);

    if (this.videoAd != null) {
        // console.log("show video ad start");
        this.videoAd.showAsync().then(function () {
            // console.log("this.videoAd.showAsync");
            this.videoAdState = ELoadState.AD_COMPLETE;
            // this.game.paused = false;
            // window.sounds.toggleMusic(false);
            if (cb) {
                cb(true);
            }

            // console.log("show video ad success");
            this.loadVideoAd();
        }.bind(this))
            .catch(function (e) {
                // console.log("this.videoAd catch");
                this.videoAdState = ELoadState.AD_COMPLETE;
                // this.game.paused = false;
                // window.sounds.toggleMusic(false);
                // console.log(JSON.stringify(e));
                if (cb) {
                    cb(false);
                }
                this.loadVideoAd();
            }.bind(this));
    } else {
        // console.log("show video ad Stop");
        if (cb) {
            cb(false);
        }
        this.loadVideoAd();
    }
};


/**
 * =========================================================
    * 统计相关
 * =========================================================
**/

/**
 * 统计显示、点击次数（统计自己的互推广告）
**/
FB_SDK.prototype.stat = function (type, gid) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status == 200)) {
            var response = JSON.parse(xhr.responseText);
            // console.log("______________response",response);
        }
    };

    xhr.open("GET", GAME_STAT_URL + "?game_id=" + gid + "&type=" + type, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send();
};




/**
 * =========================================================
    * 榜单
 * =========================================================
**/

/**
 * 和好友一起玩
 * id 好友ID
 * score 自己的最高分
 * cb callback
**/
FB_SDK.prototype.playWith = function (id, score, cb) {
    if (typeof FBInstant === 'undefined') {
        if (cb != null) {
            cb(true);
        }
        return;
    }
    var self = this;
    FBInstant.context
        .createAsync(id)
        .then(function () {
            //console.log("FBInstant.context.getID():", FBInstant.context);
            self.doShare(1,score);
            if (cb != null) {
                cb(true);
            } else {
                cb(false);
            }
        }).catch(cb(false));
};


/**
 * 获取好友的信息(有哪些好友玩过)
 * cb callback
**/
FB_SDK.prototype.getFriendsInfo = function (cb) {
    if (typeof FBInstant === 'undefined') {
        console.log("getFriendsInfo fail");
        if (cb != null) {
            cb({});
        }
    } else {
        var playerList = [];
        /* FBInstant.getLeaderboardAsync('my_leaderboard')
            .then(function (leaderboard) {
                return leaderboard.getConnectedPlayerEntriesAsync(5, 3);
            })
            .then(function (entries) {
                console.log(entries.length); // 5
                console.log(entries[0].getRank()); // 4
                console.log(entries[0].getScore()); // 34
                console.log(entries[1].getRank()); // 5
                console.log(entries[1].getScore()); // 31
            }); */
        FBInstant.player.getConnectedPlayersAsync()
            .then(function (players) {
                for (var i = 0; i < players.length; i = i + 1) {
                    playerList[i] = {};
                    playerList[i].id = players[i].getID();
                    playerList[i].name = players[i].getName();
                    playerList[i].headUrl = players[i].getPhoto();
                }
                if (cb != null) {
                    cb(playerList);
                }
            }
            );
    }

}

/**
 * 获取自身信息
 * cb callback
**/
FB_SDK.prototype.getSelfInfo = function (cb) {
    if (typeof FBInstant === 'undefined') {
        console.log("set rank fail");
        if (cb !== null) {
            cb({});
        }
    } else {
        if (cb != null) {
            cb(MyPlayer);
        }
        return MyPlayer;
    }
}

/**
 * 保存榜单分数
**/
FB_SDK.prototype.setRankScore = function (type, score, extra, cb) {
    if (typeof FBInstant === 'undefined') {
        console.log("set rank fail");
    } else {
        var rankName;
        var contextID = FBInstant.context.getID();
        if (contextID != null) {
            contextID = "." + contextID;
        }
        if (type == 1) {
            rankName = rankName_friends;
            if (contextID == null) {
                console.log(FBInstant.context.getType());
                contextID = "";
                return;
            }
        } else if (type == 2) {
            rankName = rankName_world;
            contextID = "";
        } else {
            if (null != cb) {
                cb("wrong type")
            }
            console.log("wrong type");
            return;
        }
        FBInstant
            .getLeaderboardAsync(rankName + contextID)
            .then(leaderboard => {
                console.log(leaderboard.getName());
                return leaderboard.setScoreAsync(score, extra);
            })
            .then(() => console.log('Score saved'))
            .catch(error => console.error(error));

    }
};

/**
 * 获取自身的排行榜
**/
FB_SDK.prototype.getRankScore = function (type, cb) {
    if (typeof FBInstant === 'undefined') {
        console.log("get self rank fail");
    } else {
        var rankName;
        var contextID = FBInstant.context.getID();
        if (contextID != null) {
            contextID = "." + contextID;
        }
        if (type == 1) {
            rankName = rankName_friends;
            if (contextID == null) {
                console.log(FBInstant.context.getType());
                contextID = "";
                return;
            }
        } else if (type == 2) {
            rankName = rankName_world;
            contextID = "";
        } else {
            if (null != cb) {
                cb("wrong type")
            }
            console.log("wrong type");
            return;
        }
        FBInstant
            .getLeaderboardAsync(rankName + contextID)
            .then(leaderboard => leaderboard.getPlayerEntryAsync())
            .then(entry => {
                if (entry != null) {
                    var info = {};
                    info.id = entry.getPlayer().getID();
                    info.no = entry.getRank();
                    info.name = entry.getPlayer().getName();
                    info.score = entry.getScore();
                    info.headUrl = entry.getPlayer().getPhoto();
                    cb(info);
                }
            }).catch(error => console.error(error));
    }
};

/**
 * 获取榜单百分比
**/
FB_SDK.prototype.getPercent = function (cb) {
    if (typeof FBInstant === 'undefined') {
        console.log("get rank fail");
        if (cb != null) {
            cb();
        }
    } else {
        FBInstant.getLeaderboardAsync('World')
            .then(function (leaderboard) {
                return leaderboard.getEntryCountAsync();
            })
            .then(function (count) {
                if (cb != null) {
                    cb(count);
                }
            });
    }
}

/**
 * 获取榜单
**/
FB_SDK.prototype.getRank = function (type, num, offset, cb) {
    if (typeof FBInstant === 'undefined') {
        console.log("get rank fail");
    } else {
        var rankName;
        var contextID = FBInstant.context.getID();
        if (contextID != null) {
            contextID = "." + contextID;
        }
        if (type == 1) {
            rankName = rankName_friends;
            if (contextID == null) {
                console.log(FBInstant.context.getType());
                contextID = "";
                if (cb != null) {
                    cb([]);
                }
                return;
            }
        } else if (type == 2) {
            rankName = rankName_world;
            contextID = "";
        } else {
            if (null != cb) {
                cb("wrong type")
            }
            console.log("wrong type");
            return;
        }
        var playerList = [];
        FBInstant
            .getLeaderboardAsync(rankName + contextID)
            .then(leaderboard => leaderboard.getEntriesAsync(num, offset))//第一个是获取数量，第二个是起始点
            .then(entries => {
                for (var i = 0; i < entries.length; i++) {
                    if (entries[i] == null) {
                        continue;
                    }
                    playerList[i] = {};
                    playerList[i].id = entries[i].getPlayer().getID();
                    playerList[i].no = entries[i].getRank();
                    playerList[i].name = entries[i].getPlayer().getName();
                    playerList[i].score = entries[i].getScore();
                    playerList[i].headUrl = entries[i].getPlayer().getPhoto();
                }
                if (cb != null) {
                    cb(playerList);
                }
            }).catch(error => console.error(error));
    }
};


/**
 * 
**/
FB_SDK.prototype.postRankToMessage = function (type, cb) {
    if (typeof FBInstant === 'undefined') {
        console.log("post rank fail");
    } else {
        var rankName;
        var contextID = FBInstant.context.getID();
        if (contextID != null) {
            contextID = "." + contextID;
        }
        if (type == 1) {
            rankName = rankName_friends;
            if (contextID == null) {
                console.log(FBInstant.context.getType());
                contextID = "";
                return;
            }
        } else if (type == 2) {
            rankName = rankName_world;
            contextID = "";
        } else {
            if (null != cb) {
                cb("wrong type")
            }
            console.log("wrong type");
            return;
        }
        FBInstant.updateAsync({
            action: 'LEADERBOARD',
            name: rankName + contextID
        })
            .then(() => console.log('Update Posted'))
            .catch(error => console.error(error));
    }
}

/**
 * =========================================================
    * END
 * =========================================================
**/

module.exports = (function () {
    var instance;
    return function () {
        if (!instance) {
            instance = new FB_SDK();
        }
        return instance;
    }
})();


