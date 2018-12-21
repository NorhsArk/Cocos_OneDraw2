
cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        var seq = cc.repeatForever(
             cc.rotateBy(0.3, 90));
        this.node.runAction(seq);
    },
});
