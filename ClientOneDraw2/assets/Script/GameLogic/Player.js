cc.Class({
    extends: cc.Component,

    properties: {
        age: {
            default: 0,
            type: cc.Integer,
        },
        avatar: {
            default: "",
        },
        group_id: {
            default: 0,
            type: cc.Integer
        },
        is_rebot: {
            default: 0,
            type: cc.Integer
        },
        pname: {
            default: "",
        },
        score: {
            default: 0,
            type: cc.Integer,
        },
        sex: {
            default: 0,
            type: cc.Integer,
        },
        user_id: {
            default: 0,
            type: cc.Integer,
        },
    },

    setUserInfo:function (userInfo) {
        this.age = userInfo.age;
        this.avatar = userInfo.avatar;
        this.group_id = userInfo.group_id;
        this.is_rebot = userInfo.is_rebot;
        this.pname = this.substrName(userInfo.name,6);
        this.score = userInfo.score;
        this.sex = userInfo.sex;
        this.user_id = userInfo.user_id;
    },

    substrName (str, n) {
      if (str.replace(/[\u4e00-\u9fa5]/g, "**").length <= n) {
        return str;
      }else {
        var len = 0;
        var tmpStr = "";
        for (var i = 0; i < str.length; i++) {//遍历字符串
          if (/[\u4e00-\u9fa5]/.test(str[i])) {//中文 长度为两字节
            len += 2;
          }
          else {
            len += 1;
          }
          if (len > n) {
            break;
          }
          else {
            tmpStr += str[i];
          }
        }
        return tmpStr + " ...";
      }
      
    }

    // update (dt) {},
});
