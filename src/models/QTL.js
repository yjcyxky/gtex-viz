"use strict";
import Variant from "./Variant";
import {tissueTable} from "./GTExTissues";

export default class QTL extends Variant {
    /**
      * 
      * @param {String} variantId GTEx variant ID 
      * @param {String} gencodeId Gencode ID
      * @param {String} phenotypeId GTEx phenotype ID -- will only exist for sQTLs
      * @param {String} tissueId GTEx tissue ID 
      * @param {Number} pvalue 
      * @param {Number} nes 
      * @param {String} type 
      */
    constructor(varId, gencodeId, phenotypeId, tissueId, pvalue, nes, type){
        super(varId);
        this.gencodeId = gencodeId;
        this.phenotypeId = phenotypeId;
        this.tissueId = tissueId; 
        this.tissueSiteDetailAbbr = tissueTable()[this.tissueId].tissueSiteDetailAbbr;
        this.pValue = pvalue;
        this.nes = nes;
        this.type = type;

        // plot properties
        this.setCoord({
            x: this.varId, 
            y: this.type+"-"+this.tissueSiteDetailAbbr});
        this.setR(-Math.log10(parseFloat(this.pValue.toPrecision(3))));
        this.setValue(parseFloat(this.nes.toPrecision(3)));
    }

    get tissueSiteDetailId(){
        return this.tissueId;
    }

    setGeneSymbol(s){
        this.geneSymbol = s;
    }
}