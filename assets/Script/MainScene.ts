const {ccclass, property} = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {

    @property(cc.Node)
    btn: cc.Node = null;

    onLoad() {
        // init logic
        this.btn.on(cc.Node.EventType.TOUCH_END, () => {
            cc.director.loadScene('gameScene');
        });
    }
}
