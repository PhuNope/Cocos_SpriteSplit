import { __private, _decorator, ccenum, Component, IAssembler, Mat4, Node, Renderable2D, RichText, SpriteFrame, Vec2 } from 'cc';
import * as SplitHelper from './Helper';
import { AssemblerSplit } from './AssemblerSplit';
const { ccclass, property, executeInEditMode } = _decorator;

enum TextureType {
    Cut,
    Stretch
}
ccenum(TextureType);

let _vec2_temp = new Vec2();
let _mat4_temp = new Mat4();

// namespace Utils_Split {

@ccclass('SplitRender')
@executeInEditMode
export class SplitRender extends Renderable2D {

    static Type = TextureType;

    @property({ type: SpriteFrame, serializable: true })
    protected _spriteFrame: SpriteFrame | null = null;

    @property({ type: [Vec2], serializable: true })
    _polygon: Vec2[] = [];

    @property({ type: [Vec2], serializable: true })
    public get polygon(): Vec2[] {
        return this._polygon;
    }
    public set polygon(points: Vec2[]) {
        this._polygon = points;
        this.markForUpdateRenderData();
    }

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

        this.markForUpdateRenderData();
        //TODO apply sprite Size
    }

    @property({ type: TextureType, serializable: true })
    _type: TextureType = 0;
    @property({ type: TextureType, serializable: true })
    get type() {
        return this._type;
    }
    set type(val: TextureType) {
        this._type = val;
        this.markForUpdateRenderData();
    }

    @property
    editing: boolean = false;

    protected _assembler: IAssembler = null;

    constructor() {
        super();
    }

    onLoad(): void {

    }

    protected start(): void {
        console.log(this.node.uuid);

    }

    _hitTest(cameraPoint: Vec2): boolean {
        let node: Node = this.node;
        let testPoint: Vec2 = _vec2_temp;

        node.updateWorldTransform();
        // If scale is 0, it can't be hit.
        if (!Mat4.invert(_mat4_temp, node.worldMatrix)) {
            return false;
        }

        Vec2.transformMat4(testPoint, cameraPoint, _mat4_temp);
        return SplitHelper.IsInPolygon(testPoint, this.polygon);
    }

    private _applySpriteSize() {
        if (this._spriteFrame) {
            const size = this._spriteFrame.originalSize;
            this.node._uiProps.uiTransformComp.setContentSize(size);
        }

        this._activateMaterial();
    }

    private _activateMaterial() {
        const spriteFrame = this._spriteFrame;
        const material = this.getRenderMaterial(0);
        if (spriteFrame && material) {
            this.markForUpdateRenderData();
        }

        if (this.renderData) {
            this.renderData.material = material;
        }
    }

    protected _render(render: __private._cocos_2d_renderer_i_batcher__IBatcher): void {
        render.commitComp(this, this.renderData, this._spriteFrame, this._assembler, null);
    }

    protected _canRender(): boolean {
        if (!super._canRender()) {
            return false;
        }

        const spriteFrame = this._spriteFrame;
        if (!spriteFrame || !spriteFrame.texture) {
            return false;
        }

        return true;
    }

    protected _flushAssembler(): void {
        if (this._assembler == null) {
            this.destroyRenderData();
            this._assembler = new AssemblerSplit();
        }

        if (!this._renderData) {
            if (this._assembler && this._assembler.createData) {
                this._renderData = this._assembler.createData(this);
                this.renderData!.material = this.getRenderMaterial(0);
                this.markForUpdateRenderData();
                this._updateColor();
            }
        }
    }

    protected updateMaterial(): void {
        if (this._customMaterial) {
            this.setMaterial(this._customMaterial, 0);
            return;
        }

        const mat = this._updateBuiltinMaterial();
        this.setMaterial(mat, 0);
        this._updateBlendFunc();
    }
}
// }
