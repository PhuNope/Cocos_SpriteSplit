import * as SplitHelper from "./Helper";
import { _decorator, Component, IAssembler, Mat4, Node, RenderData, Vec2 } from 'cc';
import { SplitRender } from "./SplitRender";
const { property } = _decorator;

// export namespace Utils.Split {
export class AssemblerSplit implements IAssembler {

    createData(com: SplitRender): RenderData {
        let vertexCount = 4;
        let indexCount = 6;

        const renderData: RenderData = com.requestRenderData();
        renderData.dataLength = vertexCount;
        renderData.resize(vertexCount, indexCount);

        return renderData;
    }

    resetData(com: SplitRender) {
        let points: Vec2[] = com.polygon;
        if (!points || points.length < 3) return;

        let vertexCount: number = points.length;
        let indexCount: number = vertexCount + (vertexCount - 3) * 2;

        com.renderData.clear();
        com.renderData.dataLength = vertexCount;
        com.renderData.resize(vertexCount, indexCount);

        let material = com.renderData.material;
        com.renderData.material = material;
    }

    updateRenderData(com: SplitRender) {
        const renderData: RenderData = com.renderData;
        if (renderData.vertDirty) {
            this.resetData(com);
            this.updateVertexData(com);
            this.updateUvs(com);
            this.updateColor(com);
            renderData.updateRenderData(com, com.spriteFrame);
        }
    }

    updateWorldVerts(com: SplitRender, verts: Float32Array) {
        let floatsPerVert = 9;

        let matrix: Mat4 = com.node.worldMatrix;
        let a = matrix.m00;
        let b = matrix.m01;
        let c = matrix.m04;
        let d = matrix.m05;
        let tx = matrix.m12;
        let ty = matrix.m13;

        let justTranslate = a === 1 && b === 0 && c === 0 && d === 1;
        if (justTranslate) {
            let polygon = com.polygon;
            for (let i = 0; i < polygon.length; i++) {
                verts[i * floatsPerVert] = polygon[i].x + tx;
                verts[i * floatsPerVert + 1] = polygon[i].y + ty;
            }
        } else {
            let polygon = com.polygon;
            for (let i = 0; i < polygon.length; i++) {
                verts[i * floatsPerVert] = a * polygon[i].x + c * polygon[i].y + tx;
                verts[i * floatsPerVert + 1] = b * polygon[i].x + d * polygon[i].y + ty;
            }
        }

        // @ts-ignore
        com.node._uiProps.uiTransformDirty = false;
    }

    fillBuffers(com: SplitRender, renderer: any) {
        const chunk = com.renderData.chunk;
        // indices generated
        let indicesArr = SplitHelper.SplitPolygon(com.polygon);
        this.updateWorldVerts(com, chunk.vb);

        // quick version
        const bid = chunk.bufferId;
        const vid = chunk.vertexOffset;
        const meshBuffer = chunk.vertexAccessor.getMeshBuffer(bid);
        const ib = chunk.vertexAccessor.getIndexBuffer(bid);
        let indexOffset = meshBuffer.indexOffset;

        // fill indices
        for (let i = 0, l = indicesArr.length; i < l; i++) {
            ib[indexOffset++] = vid + indicesArr[i];
        }
        meshBuffer.indexOffset += indicesArr.length;
    }

    updateVertexData(com: SplitRender) {
        const renderData = com.renderData;
        if (!renderData) {
            return;
        }
        const dataList = renderData.data;

        let polygon = com.polygon;
        for (let i = 0; i < polygon.length; i++) {
            dataList[i].x = polygon[i].x;
            dataList[i].y = polygon[i].y;
        }

        const chunk = com.renderData.chunk;
        const vid = chunk.vertexOffset;
        const ib = chunk.ib as any;

        let indicesArr = SplitHelper.SplitPolygon(com.polygon);
        for (let i = 0, l = indicesArr.length; i < l; i++) {
            ib[i] = vid + indicesArr[i];
        }
    }

    updateUvs(com: SplitRender) {
        let uvOffset = 3, floatsPerVert = 9;
        const vData = com.renderData.chunk.vb;

        let uvs = [];
        if (com.spriteFrame.texture) {
            uvs = SplitHelper.ComputeUV(com.polygon, com.spriteFrame.texture.width, com.spriteFrame.texture.height);
        }

        let polygon = com.polygon;
        for (let i = 0; i < polygon.length; i++) {
            vData[uvOffset] = uvs[i].x;
            vData[uvOffset + 1] = uvs[i].y;
            uvOffset += floatsPerVert;
        }
    }

    updateColor(com: SplitRender) {
        const renderData = com.renderData!;

        let colorOffset = 5, floatsPerVert = renderData.floatStride;
        let vData = renderData.chunk.vb;

        const color = com.color;
        const colorR = color.r / 255;
        const colorG = color.g / 255;
        const colorB = color.b / 255;
        const colorA = color.a / 255;

        let polygon = com.polygon;
        for (let i = 0; i < polygon.length; i++) {
            vData![colorOffset] = colorR;
            vData![colorOffset + 1] = colorG;
            vData![colorOffset + 2] = colorB;
            vData![colorOffset + 3] = colorA;
            colorOffset += floatsPerVert;
        }
    }
}
// }

