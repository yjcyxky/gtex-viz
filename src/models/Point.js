"use strict";
export default class Point {
    /**
     * Point can be instantiated with no property defined initially.
     * @param {Object?} coord {x:Any?, y:Any?, z:Any?}
     * @param {Number?} v 
     * @param {Number?} r 
     */
    constructor(coord={x:undefined, y:undefined, z:undefined}, v=undefined, r=undefined){
        this.setCoord(coord);
        this.setValue(v);
        this.setR(r);
    }

    // computed properties and aliases
    get displayValue(){
        return this.v.toPrecision(3);
    }

    get value(){
        return this.v;
    }

    // setters
    setCoord(coord={x:undefined, y:undefined, z:undefined}){
        this.x = coord.x;
        this.y = coord.y;
        this.z = coord.z;
    }

    setValue(v){
        this.v = v;
    }

    setR(r){
        this.r = r;
    }
}