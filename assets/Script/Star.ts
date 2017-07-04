const { ccclass, property } = cc._decorator;

@ccclass
export default class Star extends cc.Component {

    // @property(cc.Label)
    // label: cc.Label;

    // @property(cc.Integer)
    // row: number = 0;

    // @property(cc.Integer)
    // col: number = 0;

    onLoad() {
        // init logic
        this.node.setContentSize(64, 64);
    }
}
