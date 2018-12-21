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
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        isCollisioning: {
            default: false,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.director.getCollisionManager().enabled = true;
        //cc.director.getCollisionManager().enabledDebugDraw = true;


        this.node.parent.on(cc.Node.EventType.TOUCH_START, function (event) {
            this.onMouseDown(event);
        }, this);

        this.node.parent.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            this.onMouseMove(event);
        }, this);

        this.node.parent.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.onMouseUp(event);
        }, this);

        this.node.parent.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            this.onMouseUp(event);
        }, this);

        this.node.active = false;
    },

    /**
        * 当屏幕点击
        */
    onMouseDown(event) {
        this.isTouching = true;
        this.clickTime = 0;
        this.touchPos = this.node.parent.convertToNodeSpaceAR(event.getLocation());
        this.node.position = this.touchPos;
        this.node.active = true;
        this.node.emit('moveClick', { pos: this.touchPos });
    },

    onMouseMove(event) {
        if (this.isTouching) {
            this.touchPos = this.node.parent.convertToNodeSpaceAR(event.getLocation());
            this.node.position = this.touchPos;
            //this.node.emit('moveClick', { pos: this.touchPos });
        }
    },

    onMouseUp(event) {
        this.isTouching = false;
        //点击
        if (this.clickTime < 0.5) {
        }
        this.node.active = false;
        this.node.emit('clickEnd', {});
    },

    //碰撞开始事件
    onCollisionEnter: function (other, self) {
        if (!this.isCollisioning) {
            this.isCollisioning = true;
        }
        this.node.emit('collision', { other: other });
    },

    //持续碰撞事件
    onCollisionStay: function (other, self) {
    },

    //碰撞结束事件
    onCollisionExit: function (other, self) {
        this.isCollisioning = false;
    },

    start() {

    },

    // update (dt) {},
});
