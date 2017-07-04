
let _visibleSize: cc.Size;

export function setVisibleSize(size: cc.Size): void {
    this._visibleSize = size;
}

export function getVisibleSize(): cc.Size {
    return this._visibleSize;
}

export function getStarPosition(row: number, col: number): cc.Vec2 {
    // 一个star的宽度和高度都是64
    const w = 64;
    const h = 64;
    const zeroX = (w - this._visibleSize.width) >> 1;
    const zeroY = (h - this._visibleSize.height) >> 1;
    let x = zeroX + col * w;
    let y = zeroY + (9 - row) * 64;
    return new cc.Vec2(x, y);
}