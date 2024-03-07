import { _decorator, ccenum, Component, Node, Renderable2D, SpriteFrame } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

enum TextureType {
    Cut,
    Stretch
}
ccenum(TextureType);

@ccclass('SplitRender')
@executeInEditMode
export class SplitRender extends Renderable2D {

    static Type = TextureType;

    @property({ type: SpriteFrame, serializable: true })
    protected _spriteFrame: SpriteFrame | null = null;

    @property({ type: SpriteFrame, serializable: true })
    get spriteFrame() {
        return this._spriteFrame;
    }

    set spriteFrame(value: SpriteFrame) {
        if (!value || this._spriteFrame === value) {
            return;
        }

        this._spriteFrame = value;

        let l = -value.width / 2;
        let b = -value.height / 2;
        let t = value.height / 2;
        let r = value.width / 2;
    }
}


