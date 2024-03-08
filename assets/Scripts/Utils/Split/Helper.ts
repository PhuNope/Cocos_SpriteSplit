import { _decorator, Component, math, Node, v2, Vec2, Vec3 } from 'cc';

// namespace Utils_Split {

/**
 * @en ab cross ac
 * @en Tích chéo ab và ac
 * @param a : Vec2 | Vec3
 * @param b : Vec2 | Vec3
 * @param c : Vec2 | Vec3
 * @returns Number of Z axis
 */
function ab_cross_ac(a: Vec2 | Vec3, b: Vec2 | Vec3, c: Vec2 | Vec3): number {
    let ABx = b.x - a.x;
    let ABy = b.y - a.y;
    let ACx = c.x - a.x;
    let ACy = c.y - a.y;

    return cross(ABx, ABy, ACx, ACy);
};

/**
 * @en dot product
 * @param x1 
 * @param y1 
 * @param x2 
 * @param y2 
 * @returns Number
 */
function dot(x1: number, y1: number, x2: number, y2: number): number {
    return x1 * x2 + y1 * y2;
}

/**
 * @en cross product of two vectors
 * @formula Cx = Ay * Bz - Az * By
 * 
 * Cy = Az * Bx - Ax * Bz
 * 
 * Cz = Ax * By - Ay * Bx
 * @param x1 
 * @param y1 
 * @param x2 
 * @param y2 
 * @returns number of Z axis
 */
function cross(x1: number, y1: number, x2: number, y2: number): number {
    return x1 * y2 - x2 * y1;
}

/**
 * @en Check if a is close to b
 * @param a 
 * @param b 
 * @returns 1 if a greater than b, -1 if not, 0 if equal
 */
function dbclmp(a: number, b: number): number {
    if (Math.abs(a - b) <= 0.00001) return 0;

    if (a > b) return 1;

    return -1;
}

/**
 * @en Check if a point is on the line
 * @param a 
 * @param p1 
 * @param p2 
 * @returns 0 if on the line
 */
function point_on_line(a: Vec2 | Vec3, p1: Vec2 | Vec3, p2: Vec2 | Vec3) {
    let A_P1_x = p1.x - a.x;
    let A_P1_y = p1.y - a.y;

    let A_P2_x = p2.x - a.x;
    let A_P2_y = p2.y - a.y;

    let dot_AP1_AP2 = dot(A_P1_x, A_P1_y, A_P2_x, A_P2_y);

    return dbclmp(dot_AP1_AP2, 0);
}

/**
 * @en check a point is in the triangle
 * @param pointD 
 * @param triA 
 * @param triB 
 * @param triC 
 * @returns true if in the point in triangle
 */
export function IsInTriangle(pointD: Vec2, triA: Vec2, triB: Vec2, triC: Vec2): boolean {
    let AB: Vec2 = new Vec2();
    Vec2.subtract(AB, triB, triA);

    let AC: Vec2 = new Vec2();
    Vec2.subtract(AC, triC, triA);

    let BC: Vec2 = new Vec2();
    Vec2.subtract(BC, triC, triB);

    let AD: Vec2 = new Vec2();
    Vec2.subtract(AD, pointD, triA);

    let BD: Vec2 = new Vec2();
    Vec2.subtract(BD, pointD, triB);

    let AB_cross_AC = AB.cross(AC);
    let AB_cross_AD = AB.cross(AD);
    let AC_cross_AD = AC.cross(AD);
    let BC_crossAB = BC.cross(AB);
    let BC_cross_BD = BC.cross(BD);

    return (AB_cross_AC >= 0 !== AB_cross_AD < 0) && (AB_cross_AC >= 0 !== AC_cross_AD >= 0) && (BC_crossAB > 0 !== BC_cross_BD >= 0);
}

/**
 * @en Check if a point is in the polygon
 * @param checkPoint 
 * @param polygonPoints 
 * @returns true if in the point in polygon
 */
export function IsInPolygon(checkPoint: Vec2, polygonPoints: Vec2[]): boolean {
    let counter = 0;
    let i: number;
    let xInters: number;
    let p1: Vec2, p2: Vec2;
    let pointCount = polygonPoints.length;

    p1 = polygonPoints[0];
    for (i = 1; i <= pointCount; i++) {
        p2 = polygonPoints[i % pointCount]; // p2 index: Ex 5-4-3...

        if (checkPoint.x > Math.min(p1.x, p2.x) &&
            checkPoint.x <= Math.max(p1.x, p2.x)) {
            // checkPoint x in range between p1.x and p2.x

            if (checkPoint.y <= Math.max(p1.y, p2.y)) {
                // checkPoint y is under max in p1.y and p2.y

                if (p1.x != p2.x) {
                    xInters = (checkPoint.x - p1.x) * (p2.y - p1.y) / (p2.x - p1.x) + p1.y;
                    if (p1.y == p2.y || checkPoint.y <= xInters) {
                        counter++;
                    }
                }
            }
        }

        p1 = p2;
    }

    if (counter % 2 == 1) {
        return true;
    }

    return false;
}

/**
 * Computes the UV coordinates for a set of points based on the given width and height.
 *
 * @param {Vec2[]} points - an array of 2D points
 * @param {number} width - the width of the coordinate system
 * @param {number} height - the height of the coordinate system
 * @return {Vec2[]} an array of UV coordinates corresponding to the input points
 */
export function ComputeUV(points: Vec2[], width: number, height: number): Vec2[] {
    let uvs: Vec2[] = [];
    for (const p of points) {
        // uv top left coords
        let x = math.clamp(0, 1, (p.x + width / 2) / width);
        let y = math.clamp(0, 1, 1 - (p.y + height / 2) / height);
        uvs.push(v2(x, y));
    }
    return uvs;
}

export function SplitPolygon(points: Vec2[]): number[] {
    if (points.length <= 3) return [0, 1, 2];

    let pointMap: { [key: string]: number; } = {};
    for (let i = 0; i < points.length; i++) {
        let p = points[i];
        pointMap[`${p.x}-${p.y}`] = i;
    }

    const getIdx = (p: Vec2): number => {
        return pointMap[`${p.x}-${p.y}`];
    };
    points = points.concat([]);
    let idxs: number[] = [];

    let index = 0;
    while (points.length > 3) {
        let p1 = points[(index) % points.length]
            , p2 = points[(index + 1) % points.length]
            , p3 = points[(index + 2) % points.length];

        let splitPoint: number = (index + 1) % points.length;

        let v1: Vec2 = new Vec2();
        Vec2.subtract(v1, p2, p1);
        let v2: Vec2 = new Vec2();
        Vec2.subtract(v2, p3, p2);

        if (v1.cross(v2) < 0) {      // It's a concave corner, looking for the next one
            index = (index + 1) % points.length;
            continue;
        }
        let hasPoint = false;
        for (const p of points) {
            if (p != p1 && p != p2 && p != p3 && IsInTriangle(p, p1, p2, p3)) {
                hasPoint = true;
                break;
            }
        }
        if (hasPoint) {      // Current triangle contains other points, find next point
            index = (index + 1) % points.length;
            continue;
        }
        // Found the ear and cut it off
        idxs.push(getIdx(p1), getIdx(p2), getIdx(p3));
        points.splice(splitPoint, 1);
    }
    for (const p of points) {
        idxs.push(getIdx(p));
    }
    return idxs;
}
// }
