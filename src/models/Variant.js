"use strict";
import Point from "./Point";
export default class Variant extends Point {
    /**
     * 
     * @param {String} varId GTEx variant ID
     * @param {String?} chr 
     * @param {Number} pos 
     */
    constructor(varId, chr=undefined, pos=undefined){
        super();
        this.varId = varId;
        this.chr = chr;
        this.pos = parseInt(pos);
        this.rsId = undefined;

        if (this.chr === undefined) this.setGenomicPosition();
    }

    get variantId() {
        return this.varId;
    }

    get chromosome(){
        return this.chr;
    }    

    get colorValue(){
        return this.v;
    }

    setRsId(id){
        this.rsId = id;
    }

    setGenomicPosition(){
        this.pos = parseInt(this.varId.split("_")[1]);
        this.chr = this.varId.split("_")[0];
    }
}