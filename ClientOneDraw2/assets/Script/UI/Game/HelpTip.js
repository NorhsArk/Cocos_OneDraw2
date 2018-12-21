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
        guideHand:{
            default:null,
            type:cc.Node,
        },
        point1:{
            default:null,
            type:cc.Node,
        },
        point2:{
            default:null,
            type:cc.Node,
        },
        point3:{
            default:null,
            type:cc.Node,
        },
        moveLine:{
            default:null,
            type:cc.Node,
        },
        repeat:{
            default:null,
            type:cc.Node,
        },
        repeatText:{
            default:null,
            type:cc.Label,
        },
        arrow:{
            default:null,
            type:cc.Node,
        },
        isFolow:true,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
        
    },

    init(type,color,lcolor){
        this.guideHand.position = this.point1.position;
        this.type = type;
        this.color = color;
        this.moveLine.color = lcolor;
        this.playAnim();
    },

    playAnim(){
        this.point1.color = this.color;
        this.point2.color = cc.color(255,255,255,255);
        this.point3.color = cc.color(255,255,255,255);
        this.point1.getChildByName("Shadow").color = this.color;
        if(this.type == 6){
            this.arrow.active = false;
            this.repeat.active = true;
            this.point2.active = true;
            this.repeatText.string = 2;
        }else{
            this.repeat.active = false;
            this.arrow.active = true;
            this.point2.active = false;
        }
        this.guideHand.runAction(cc.repeatForever(cc.sequence(
            cc.moveTo(1,this.point2.position),
            cc.callFunc(function(){
                this.point2.color = this.color;
                this.pointAnim(this.point2,5,1);
            }.bind(this),this),
            cc.moveTo(1,this.point3.position),
            cc.callFunc(function(){
                this.point3.color = this.color;
                this.pointAnim(this.point3,5,1);
                if(this.type == 6){
                    this.repeatText.string = 1;
                    this.isFolow = false;
                    this.guideHand.runAction(cc.sequence(
                        cc.delayTime(0.5),
                        cc.moveTo(1,this.point2.position),
                    ));
                }else{
                    this.pointAnim(this.point1,10,1.5);
                    this.pointAnim(this.point3,10,1.5);
                }
            }.bind(this),this),
            cc.delayTime(1.5),
            cc.callFunc(function(){
                this.repeatText.string = 0;
                if(this.type == 6){
                    this.pointAnim(this.point1,10,1.5);
                    this.pointAnim(this.point2,10,1.5);
                    this.pointAnim(this.point3,10,1.5);
                }
            }.bind(this),this),
            cc.delayTime(1.5),
            cc.callFunc(function(){
                this.isFolow = true;
                this.guideHand.position = this.point1.position;
                this.repeatText.string = 2;
                this.point2.color = cc.color(255,255,255,255);
                this.point2.getChildByName("Shadow").color = cc.color(255,255,255,255);
                this.point3.color = cc.color(255,255,255,255);
                this.point3.getChildByName("Shadow").color = cc.color(255,255,255,255);
            }.bind(this),this),
        )));
    },

    pointAnim(point,scal,during){
        point.stopAllActions();
        var shadow = point.getChildByName("Shadow");
        shadow.color = point.color;
        shadow.active = true;
        shadow.scale = 1;
        shadow.opacity = 255;
        shadow.runAction(cc.spawn(cc.scaleTo(during, scal),cc.fadeOut(during).easing(cc.easeIn(2)),));
    },


    CloseView(){
        this.node.active = false;
        this.guideHand.stopAllActions();
    },

    update (dt) {
        if(this.isFolow){
            this.moveLine.height = this.guideHand.x - this.point1.x;
            this.moveLine.position = this.guideHand.position;
        }
    },
});
