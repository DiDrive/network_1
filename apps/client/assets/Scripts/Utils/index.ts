import { SpriteFrame } from "cc";

const INDEX_REG = /\((\d+)\)/;

const getNumberWithinString = (str: string) => parseInt(str.match(INDEX_REG)?.[1] || "0");

export const sortSpriteFrame = (spriteFrame: Array<SpriteFrame>) =>
  spriteFrame.sort((a, b) => getNumberWithinString(a.name) - getNumberWithinString(b.name));


export const getAngle = (rad:number) => {   //弧度转角度
    return rad * 180 / Math.PI
}

export const deepClone = (obj:any) => { // 深拷贝
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    const res = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            res[key] = deepClone(obj[key]);
        }
    }
    return res;
}