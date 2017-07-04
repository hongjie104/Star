const { ccclass, property } = cc._decorator;
import * as utils from './utils';

@ccclass
export default class GameScene extends cc.Component {

    @property([cc.Prefab])
    starPrefabArr: cc.Prefab = null;

    _starDataArr: number[][] = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

    _starArr: cc.Node[][] = [[], [], [], [], [], [], [], [], [], []];

    _createRandomStart(): number {
        return Math.floor(cc.random0To1() * 5);
    }

    _putIndexTo(indexArr: { row: number, col: number }[], row: number, col: number): void {
        for (let i = 0; i < indexArr.length; i++) {
            if (indexArr[i].row == row && indexArr[i].col == col) return;
        }
        indexArr.push({ row, col });
    }

    _findSameStarIndex(row: number, col: number, checkedRowAndCol?: { row: number, col: number }[], result?: { row: number, col: number }[]): { row: number, col: number }[] {
        if (!checkedRowAndCol) checkedRowAndCol = [];
        else {
            for (let i = 0; i < checkedRowAndCol.length; i++) {
                if (checkedRowAndCol[i].row == row && checkedRowAndCol[i].col == col) {
                    return [];
                }
            }
            checkedRowAndCol.push({ row, col });
        }
        const targetValue = this._starDataArr[row][col];
        if (!result) result = [];
        // 先往上面找
        if (row > 0) {
            if (this._starDataArr[row - 1][col] == targetValue) {
                this._putIndexTo(result, row - 1, col);
                this._findSameStarIndex(row - 1, col, checkedRowAndCol, result)
            }
        }
        // 再找右边
        if (col < 9) {
            if (this._starDataArr[row][col + 1] == targetValue) {
                this._putIndexTo(result, row, col + 1);
                this._findSameStarIndex(row, col + 1, checkedRowAndCol, result);
            }
        }
        // 再找下边
        if (row < 9) {
            if (this._starDataArr[row + 1][col] == targetValue) {
                this._putIndexTo(result, row + 1, col);
                this._findSameStarIndex(row + 1, col, checkedRowAndCol, result);
            }
        }
        // 再找左边
        if (col > 0) {
            if (this._starDataArr[row][col - 1] == targetValue) {
                this._putIndexTo(result, row, col - 1);
                this._findSameStarIndex(row, col - 1, checkedRowAndCol, result);
            }
        }
        return result;
    }

    onLoad() {
        // init logic
        utils.setVisibleSize(cc.director.getVisibleSize());

        let random = 0, star: cc.Node = null, actionDelay = 0;
        for (let col = 0; col < 10; col++) {
            actionDelay = 0.01 * col;
            for (let row = 9; row > -1; row--) {
                actionDelay += 0.02
                random = this._createRandomStart();
                this._starDataArr[row][col] = random;
                star = cc.instantiate(this.starPrefabArr[random]);
                // star.attr({ row, col });
                this._starArr[row][col] = star;
                this.node.addChild(star);
                let initPosition = utils.getStarPosition(row, col);
                initPosition.y += utils.getVisibleSize().height;
                star.setPosition(initPosition);
                star.runAction(cc.sequence(cc.delayTime(actionDelay), cc.moveBy(.2, 0, -utils.getVisibleSize().height)));
            }
        }
        this.node.on(cc.Node.EventType.TOUCH_END, (evt: cc.Event.EventTouch) => {
            const touchPosition = evt.getLocation();
            const row = 9 - Math.floor(touchPosition.y / 64);
            const col = Math.floor(touchPosition.x / 64);

            const result = this._findSameStarIndex(row, col);
            if (result.length > 0) {
                result.push({ row, col });
                const starDataArr = this._starDataArr;
                let rowAndCol: { row: number, col: number };
                for (let i = 0; i < result.length; i++) {
                    rowAndCol = result[i];
                    this._starArr[rowAndCol.row][rowAndCol.col].removeFromParent(true);
                    // this._starArr[rowAndCol.row][rowAndCol.col] = null;
                    starDataArr[rowAndCol.row][rowAndCol.col] = -1;
                }

                // 先整体往下，再往左
                const starMoveData: { fromRow: number, fromCol: number, toRow: number, toCol: number }[] = [];
                for (let r = 9; r > -1; r--) {
                    for (let c = 0; c < 10; c++) {
                        if (starDataArr[r][c] == -1) {
                            let rowTop = r - 1;
                            while (rowTop >= 0 && starDataArr[rowTop][c] == -1) {
                                rowTop -= 1;
                            }
                            if (rowTop >= 0) {
                                starDataArr[r][c] = starDataArr[rowTop][c];
                                starDataArr[rowTop][c] = -1;
                                starMoveData.push({
                                    fromRow: rowTop,
                                    fromCol: c,
                                    toRow: r,
                                    toCol: c
                                });
                            }
                        }
                    }
                }
                let isColEmpty = false;
                let b = false;
                for (let c = 8; c > -1; c--) {
                    isColEmpty = true;
                    for (let r = 0; r < 10; r++) {
                        if (starDataArr[r][c] != -1) {
                            isColEmpty = false;
                            break;
                        }
                    }
                    if (isColEmpty) {
                        for (let newCol = c + 1; newCol < 10; newCol++) {
                            for (let r = 0; r < 10; r++) {
                                starDataArr[r][newCol - 1] = starDataArr[r][newCol];
                                starDataArr[r][newCol] = -1;
                                // 不等于-1，才有移动的需求
                                if (starDataArr[r][newCol - 1] != -1) {
                                    b = false;
                                    for (let i = 0; i < starMoveData.length; i++) {
                                        if (starMoveData[i].fromRow == r && starMoveData[i].fromCol == newCol) {
                                            starMoveData[i].toRow = r;
                                            starMoveData[i].toCol = newCol - 1;
                                            b = true;
                                            break;
                                        }
                                    }
                                    if (!b) {
                                        starMoveData.push({
                                            fromRow: r,
                                            fromCol: newCol,
                                            toRow: r,
                                            toCol: newCol - 1
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                let position: cc.Vec2 = null;
                for (let i = 0; i < starMoveData.length; i++) {
                    let moveData = starMoveData[i];
                    cc.log(moveData);
                    position = utils.getStarPosition(moveData.toRow, moveData.toCol);
                    this._starArr[moveData.fromRow][moveData.fromCol].runAction(cc.sequence(
                        cc.moveTo(.2, position),
                        cc.callFunc(() => {
                            this._starArr[moveData.toRow][moveData.toCol] = this._starArr[moveData.fromRow][moveData.fromCol];
                            this._starArr[moveData.fromRow][moveData.fromCol] = null;
                        })
                    ));
                }

                cc.log(starDataArr);
            }
        });
    }
}
