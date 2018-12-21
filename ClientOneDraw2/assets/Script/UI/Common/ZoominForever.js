
cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        var seq = cc.repeatForever(
             cc.sequence(
                 cc.scaleTo(0.88,1.1, 1.1),
                 cc.scaleTo(0.88,0.9, 0.9)
             ));
        this.node.runAction(seq);
    },
}); 
