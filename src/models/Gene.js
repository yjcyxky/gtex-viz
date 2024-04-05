"use strict";
import Feature from "./Feature";
export default class Gene extends Feature{
    /**
     * 
     * @param {String} gencodeId GTEx variant ID
     * @param {String} chr 
     * @param {String} strand
     * @param {Number} start
     * @param {Number} end
     * @param {String?} type: gene type
     * @param {String?} symbol: gene symbol
     */
    constructor(gencodeId, chr, strand, start, end, type=undefined, symbol=undefined){
        super(symbol, type);
        this.gencodeId = gencodeId;
        this.id = gencodeId.split(".")[0].toLowerCase(); // remove gencodeId version otherwise it can't be a DOM ID
        this.chr = chr;
        this.start = start;
        this.end = end;
        this.type = type;
        this.symbol = symbol;
        this.strand = strand;
        this.tss = this.strand=="+"?this.start:this.end;
    }

    // computed properties

    // aliases 
    get chromosome(){
        return this.chr;
    }  

    get pos(){
        return this.tss;
    }

    get geneSymbol(){
        return this.symbol;
    }
}