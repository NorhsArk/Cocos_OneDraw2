cc.Class({
    extends: cc.Component,

    properties: {
        loop:true,
        isplay:true,
        sprite:{
            default:null,
            type:cc.Sprite,
        },
        sprites:{
            default:[],
            type:[cc.SpriteFrame],
        },
        fps: {
            default: 5,
            type : cc.Integer,
        },
        index: {
            default: 0,
            type : cc.Integer,
            visible:false,
        },
        delta: {
            default: 0,
            type : cc.Integer,
            visible:false,
        },
        rotationForever:false,

    },

    onLoad () {
        if(this.rotationForever){
            this.rotation();
        }
    },

    rotation(){
        var seq = cc.repeatForever(
                 cc.rotateBy(0.3, 90));
        this.rotationSeq = this.node.runAction(seq);    
    },

    play()
    {
        // this.node.stopAllActions();

        this.scheduleOnce(function(){
            if(this.rotationSeq != null){
                this.node.stopAction(this.rotationSeq);
            }
        },0.1);

        this.index = 0;
        this.delta = 0;
        this.isplay = true;
        this.node.opacity = 255;
        this.sprite.node.active = true;

    },

    update (dt) {
        if(this.isplay){
            this.delta += dt;
            if(this.fps > 0 && this.sprites.length > 0){
                var rate = 1/this.fps;
                if(rate < this.delta){
                    this.delta = rate > 0 ? this.delta - rate : 0;
                    this.sprite.spriteFrame = this.sprites[this.index];
                    this.index = this.index+1 >= this.sprites.length ? 0 : this.index+1;
                    if(this.index <= 0 && this.loop == false)
                    {
                        this.rotation();
                        this.isplay = false;
                        this.sprite.spriteFrame = this.sprites[0];
                        this.node.opacity = 0;
                        // this.sprite.node.active = false;
                    }
                }
            }
        }
    },
});
