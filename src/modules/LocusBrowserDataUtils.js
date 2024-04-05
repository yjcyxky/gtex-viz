/* eslint-disable no-prototype-builtins */
"use strict";
import QTL from "../models/QTL";
import Gene from "../models/Gene";
import {min} from "d3-array";

/**
 * This module is to support GTEx LocusBrowser by
 * parsing and transforming from GTEx webservices
 * to the data modals that GTEx LocusBrowser supports.
 */
const host = "https://gtexportal.org/api/v2/";
const serviceUrls = {

    tissueInfo: host + "dataset/tissueSiteDetail",
    funcAnno: host + "dataset/functionalAnnotation?datasetId=gtex_v8",

    // gene-centric
    queryGene: host + "reference/gene?gencodeVersion=v26&genomeBuild=GRCh38%2Fhg38&geneId=",
    geneModel: host + "dataset/collapsedGeneModelExon?datasetId=gtex_v8&gencodeId=",
    eqtls: host + "association/singleTissueEqtl?datasetId=gtex_v8&gencodeId=",
    sqtls: host + "association/singleTissueSqtl?datasetId=gtex_v8&gencodeId=",
    ld: host + "dataset/ld?datasetId=gtex_v8&gencodeId=",
    independentEqtl: host + "association/independentEqtl?gencodeId=",
    genes: host + "reference/neighborGene?",
    geneInfo: host + "reference/gene?geneId=",
    fineMapping: host + "association/fineMapping?gencodeId=",
    // variant-centric
    variantEqtls: host + "association/singleTissueEqtl?tissueSiteDetailId=",
    variantSqtls: host + "association/singleTissueSqtl?variantId=",
    gwasCats: host + "reference/gwasCatalogByLocation",
    ldByVariant: host + "dataset/ldByVariant?variantId=",
    variantByLocation: host + "dataset/variantByLocation?sortBy=pos&sortDirection=asc"
};


const annoCatDict = {
    enhancer: "rgb(193, 39, 45)",
    promoter: "rgb(237, 28, 36)",
    open_chromatin_region: "rgb(247, 147, 30)",
    promoter_flanking_region: "rgb(241, 90, 36)",
    CTCF_binding_site: "rgb(255, 221, 13)",
    TF_binding_site: "rgb(252, 238, 33)",

    "3_prime_UTR_variant": "rgb(140, 198, 63)",
    "5_prime_UTR_variant": "rgb(57, 181, 74)",
    frameshift_variant: "rgb(102, 45, 145)",
    intron_variant: "rgb(179, 179, 179)",
    missense_variant: "rgb(255, 143, 241)",
    non_coding_transcript_exon_variant: "rgb(153, 134, 117)", 
    splice_acceptor_variant: "rgb(41, 171, 226)",
    splice_donor_variant: "rgb(0, 113, 188)",
    splice_region_variant: "rgb(46, 49, 146)",
    stop_gained: "rgb(255, 0, 255)",
    synonymous_variant: "rgb(255, 211, 206)"
};

/**
 * Parse tissue info
 * @param {Json} obj from the tissue info web service 
 * @returns {Dictionary} of tissue objects indexed by tissueSiteDetailId
 */
function parseTissueInfo(obj){
    // data error-echecking
    const tissues = obj;
    ["rnaSeqAndGenotypeSampleCount", "tissueSiteDetailId"].forEach((d)=>{_checkRequiredAttribute(tissues[0], d);});

    // parse
    let tissueMap = {};
    tissues.forEach((t)=>{
        tissueMap[t.tissueSiteDetailAbbr] = t;
    });
    return tissueMap;
}

/**
 * Erro-checking the gene with the query string
 * @param {JSON} obj 
 * @param {String} queryString: gencodeId or gene symbol
 * @returns {Gene} a Gene object
 */
function checkGene(obj, queryString){
    // data error-checking
    // const attr = "gene";
    // _checkRequiredAttribute(obj, attr);

    // find one unique matching gene
    let gene = undefined;

    if (obj.length > 1){ // the value of obj[attr] is a list
        console.warn("More than one matching entities to " + queryString);
        gene = _findBestMatchedGene(obj, queryString);
    } else {
        gene = obj[0];
    }

    // check required attributes
    ["tss", "chromosome", "strand", "gencodeId"].forEach((d)=>{_checkRequiredAttribute(gene, d);});
    return new Gene(gene.gencodeId, gene.chromosome, gene.strand, gene.start, gene.end, gene.geneType, gene.geneSymbol);
}

/**
 * Find the best matching gene from the list by gene symbol
 * @param glist {List} of gene objects
 * @param queryString
 * @returns {a gene object}
 * @private
 */
function _findBestMatchedGene(glist, queryString){
    const attr = "geneSymbolUpper";
    _checkRequiredAttribute(glist[0], attr);

    // find the best match
    let results = glist.filter((d)=>d[attr] == queryString.toUpperCase());
    if (results.length === 1) return results[0];
    else {
        alert("Error: More than one gene match to this search. ");
        throw "No matching gene found";
    }
}

/**
 * Filter neighbor genes by gene type
 * Currently, this function returns only protein coding genes and lincRNAs
 * @param obj {Json} the GTEx neighborGene service with a list of genes
 * @return {Gene[]} a list of Gene objects
 */
function findNeighborGenes(obj){
    // error-checking
    // const attr = "neighborGene";
    //_checkRequiredAttribute(obj, attr);

    // filtering by gene type
    _checkRequiredAttribute(obj[0], "geneType");
    let genes = obj.filter((d)=>{
        return d.geneType == "protein coding" || d.geneType == "lincRNA";
    });

    // parsing and transforming data to support Locus Browser
    return genes.map((d)=>{
        return new Gene(d.gencodeId, d.chromosome, d.strand, d.start, d.end, d.geneType, d.geneSymbol);
    });
}

/**
 * Get variant functional annotations
 * @param {Json} obj 
 */
function getVariantFunctionalAnnotations(obj, gene=undefined){
    
    const regCatSet = new Set([ // these are regulatory annotations
        "enhancer", 
        "promoter", 
        "open_chromatin_region", 
        "promoter_flanking_region", 
        "CTCF_binding_site",
        "TF_binding_site"
    ]);

    // data structure error-checking
    const attr = "functionalAnnotation";
    _checkRequiredAttribute(obj, attr);
    ["chromosome", "pos"].forEach((d)=>{ _checkRequiredAttribute(obj[0], d);});

    let funcAnnoDict = {}; // a dict of lists--lists of annotation categories indexed by variant ID
    
    const variantKeyMap = {
        "3PrimeUtrVariant": "3_prime_UTR_variant",
        "5PrimeUtrVariant": "5_prime_UTR_variant",
        "ctcfBindingSite": "CTCF_binding_site",
        "enhancer": "enhancer",
        "frameshiftVariant": "frameshift_variant",
        "intronVariant": "intron_variant",
        "missenseVariant": "missense_variant",
        "nonCodingTranscriptExonVariant": "non_coding_transcript_exon_variant",
        "openChromatinRegion": "open_chromatin_region",
        "promoter": "promoter",
        "promoterFlankingRegion": "promoter_flanking_region",
        "spliceAcceptorVariant": "splice_acceptor_variant",
        "spliceDonorVariant": "splice_donor_variant",
        "spliceRegionVariant": "splice_region_variant",
        "stopGained": "stop_gained",
        "synonymous_variant": "synonymouse_variant",
        "tfBindingSite": "TF_binding_site"
    };
    obj.forEach((d)=>{
        // find annotation categories of this variant
        let cats = Object.keys(d).filter((k)=>{ 
            if (d[k]==true && variantKeyMap.hasOwnProperty(k)){
                let colorKey = variantKeyMap[k];
                // this is a functional annotation attribute
                if (gene!==undefined && !(d.pos<=gene.end && d.pos>=gene.start)){
                    // if the position is outside the gene transcript region
                    // filter the annotation based on whether it's a regulatory category
                    return regCatSet.has(colorKey);
                } else {
                    return true;
                }
            }
        }).map((k)=>{return variantKeyMap[k];});
        // if there's one or more categories, then store in the dictionary
        if (cats.length > 0) funcAnnoDict[d.variantId] = cats;
    });
    return funcAnnoDict;
}

/**
 * Get the gene's collapsed gene model structure
 * @param obj {Json} from GTEx collapsed gene model web service
 * @returns {List} of exon objects
 */
function getGeneModel(obj){
    // data structure error-checking
    // const attr = "collapsedGeneModelExon";
    // _checkRequiredAttribute(obj, attr);
    if (obj.length == 0) {
        console.warn("This gene has no collapsed gene model information.");
        return [];
    }
    ["start", "exonId"].forEach((d)=>{_checkRequiredAttribute(obj[0], d);});

    // transform data for the visualization
    return obj.map((d)=>{
        d.pos = d.start;
        d.featureLabel = d.exonId;
        return d;
    });
}

/**
 * Get QTL track data
 * Collapse QTL data and report the best p-value for each variant
 * @param obj {Json} from GTEx QTL web service
 * @returns {List} of best p-value QTL at each locus
 */
function getQtlTrackData(obj, attr="singleTissueEqtl"){
    // data structure error-checking
    // _checkRequiredAttribute(obj, attr);
    let data = obj;
    if (data.length == 0) return [];
    ["variantId", "pos", "pValue"].forEach((d)=>{_checkRequiredAttribute(data[0], d);});

    // aggregate
    const collapse = (arr, d)=>{
        if (arr.hasOwnProperty(d.variantId)){
            if (arr[d.variantId].pValue > d.pValue) arr[d.variantId] = d;
        } else { arr[d.variantId] = d; }
        return arr;
    };
    let bestPvalueQtlDict = data.reduce(collapse, {});

    // transform data for the visualization
    let qtlFeatures = Object.values(bestPvalueQtlDict).map((d)=>{
        d.chr = d.chromosome;
        d.start = d.pos;
        d.end = d.pos;
        d.featureType = "variant";
        d.featureLabel = d.snpId||d.variantId;
        d.colorValue = -Math.log10(d.pValue);
        return d;
    });
    return qtlFeatures.sort((a, b) => {
        return parseInt(a.pos) - parseInt(b.pos);
    });
}

/**
 * Parse data objects for bubble heat map or data map
 * @param {Object[]} obj 
 * @param {String?} attr 
 * @param {String?} dType 
 * @returns QTL[] a list of QTL objects
 */
function getQtlMapData(obj, attr="singleTissueEqtl", dType="eQTL"){
    // data structure error-checking
    // _checkRequiredAttribute(obj, attr);
    let data = obj;
    if (data===undefined) throw `Data parsing error: ${obj} ${attr}`;
    if (data.length == 0) return [];
    ["variantId", "tissueSiteDetailId", "nes", "pValue"].forEach((d)=>{_checkRequiredAttribute(data[0], d);});

    // data transformation for the visualization

    return data.map((d)=>{
        const qtl = new QTL(d.variantId, d.gencodeId, d.phenotypeId, d.tissueSiteDetailId, d.pValue, d.nes, dType);
        qtl.setGeneSymbol(d.geneSymbol);
        qtl.setRsId(d.snpId);
        return qtl;
    });
}

/**
 * @param obj {List} of independent eQTLs of the gene
 * @returns {List} of filtered independent eQTLs
 */
function getEqtlIndieData(obj, attr="independentEqtl"){
    // data structure error-checking
    _checkRequiredAttribute(obj, attr);
    const data = obj;
    if (data.length == 0) return [];
    ["gencodeId", "variantId", "rank", "tissueSiteDetailId"].forEach((d)=>{_checkRequiredAttribute(data[0], d);});

    // generate a freq table, for filtering the results based on a cutoff (i.e. at least 2 observed independent events)
    const dict = data.reduce((arr, d)=>{
        const key = d.tissueSiteDetailId;
        if (!arr.hasOwnProperty(key)) arr[key] = 0;
        arr[key] += 1;
        return arr;
    }, {});

    return data
        .map((d)=>{
            d.tissueId = d.tissueSiteDetailId;
            d.x = d.variantId;
            d.y = "eQTL-" + d.tissueId;
            d.rank = parseInt(d.rank);
            return d;
        })
        .filter((d)=>{ // filter the data based on the frequency table
            const key = d.tissueSiteDetailId;
            return dict[key] >= 2; // requires a gene to be observed more than once in a tissue
        });
}

/**
 * parse and retrieve enhancer mapping data for a gene
 * @param obj {List} of enhancers
 * @param gencodeId {String}
 */
function getEnhancerData(obj, gencodeId){
    console.info(gencodeId);
    let newList = obj.filter((d)=>d.gencodeId==gencodeId)
        .map((d)=>{
            d.value = parseFloat(d["t.statistics"]);
            d.chr = d.chromosome;
            d.start = parseInt(d.start);
            d.pos = d.start;
            d.end = parseInt(d.end);
            d.featureLabel = d.enhancer;
            return d;
        });
    console.info(newList);
    return newList;
}

/**
 * Get the gene set from a data set
 * @param {Object} obj dataset from which to generate a gene list
 * @param {String?} dataAttr the attribute to use from each data element object
 * @param {String?} attr the attr in the obj where data is stored
 */
function getSet(obj, dataAttr="gencodeId"){
    // data structure error-checking
    let data = obj;
    if (data===undefined) throw `Data parsing error: ${obj}`;
    if (data.length == 0) return [];
    [dataAttr].forEach((d)=>{_checkRequiredAttribute(data[0], d);});

    let items = data.map((d)=>d[dataAttr]);
    return new Set([...items]);
}
/**
 * 
 * @param {Object[]} data a data set 
 * @param {number} pos the query position
 * @param {String?} dataAttr the attribute to calculate distance
 * @param {String?} attr the attribute in the dataset object to access the data
 */
function getClosest(data, pos, dataAttr="tss"){
    // data structure error-checking
    
    const minDist = min(data, (g)=>Math.abs(g[dataAttr]-pos));
    
    return data.filter((g)=>{
        return Math.abs(g[dataAttr]-pos) == minDist;
    })[0];
}

/*
* Currently not in-use
* @returns {Set} of indies sQTLs indexed by gencode
 */
// function getSqtlIndieData(obj){
//     const firstElement = obj[0];
//     ["spliceId", "variantId", "tissueId"].forEach((d)=>{_checkRequiredAttribute(firstElement, d)});
//
//     // generate a freq table
//     const dict = obj.reduce((arr, d)=>{
//         const gencodeId = d.spliceId.split(":")[4];
//         const key = gencodeId+"|"+d.tissueId;
//         if (!arr.hasOwnProperty(key)) arr[key] = 0;
//         arr[key] += 1;
//         return arr
//     }, {});
//
//     return new Set(obj
//         .filter((d)=>{ // filter the data based on the frequency table
//             const gencodeId = d.spliceId.split(":")[4];
//             const key = gencodeId+"|"+d.tissueId;
//             return dict[key] >= 2; // requires a gene to be observed more than once in a tissue
//         })
//         .map((d)=>{
//             const gencodeId = d.spliceId.split(":")[4];
//             return [gencodeId, d.variantId, d.tissueId].join("|")
//         })
//     );
//
// }


function _checkRequiredAttribute(obj, attr, debug=false){
    if (debug) console.info(obj);
    if (obj.hasOwnProperty(attr) === undefined) {
        console.error(obj);
        throw "Data Parsing Error: required attribute not found." + attr;
    }
}

export {
    //functions
    checkGene,
    findNeighborGenes,
    getVariantFunctionalAnnotations,
    getGeneModel,
    getQtlTrackData,
    getQtlMapData,
    getEqtlIndieData,
    getEnhancerData,
    // getSqtlIndieData,
    parseTissueInfo,
    getSet,
    getClosest,
    // variables
    serviceUrls,
    annoCatDict
};