/* eslint-disable no-prototype-builtins */
/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
"use strict";
export function getGtexUrls(){
    const host = "http://gtexportal.org/api/v2/";
    const datasetId = "gtex_v8";
    return {
        // single-cell expression
        singleCellExpression: 
            host + "expression/singleNucleusGeneExpression?datasetId=gtex_snrnaseq_pilot&gencodeId=",
        singleCellExpressionSummary:
            host + "expression/singleNucleusGeneExpressionSummary",

        // eqtl Dashboard specific
        dyneqtl: host + "association/dyneqtl",
        snp: host + "dataset/variant?snpId=",
        variantId: host + "dataset/variant?variantId=",

        // transcript, exon, junction expression specific
        exonExp: host + "expression/clusteredMedianExonExpression?gencodeId=",
        transcriptExp: host + "expression/clusteredMedianTranscriptExpression?gencodeId=",
        junctionExp: host + "expression/clusteredMedianJunctionExpression?gencodeId=",
        transcript: host + `reference/transcript?datasetId=${datasetId}&gencodeId=`,
        
        exon: host + `reference/exon?datasetId=${datasetId}&gencodeId=`,
        geneModel: host + "dataset/collapsedGeneModelExon?gencodeId=",
        geneModelUnfiltered: host + "dataset/fullCollapsedGeneModelExon?gencodeId=",

        // gene expression violin plot specific
        geneExp: host + "expression/geneExpression?gencodeId=",

        // gene expression heat map specific
        medGeneExp: host + "expression/clusteredMedianGeneExpression",
        
        // top expressed gene expression specific
        topInTissueFiltered: host + "expression/topExpressedGene?filterMtGene=true&tissueSiteDetailId=",
        topInTissue: host + "expression/topExpressedGene?&filterMtGene=false&tissueSiteDetailId=",

        geneId: host + "reference/gene?geneId=",

        // tissue menu specific
        tissue: host + "dataset/tissueSiteDetail",

        // local static files
        sample: "tmpSummaryData/gtex.Sample.csv",
        rnaseqCram: "tmpSummaryData/rnaseq_cram_files_v7_dbGaP_011516.txt",
        wgsCram: "tmpSummaryData/wgs_cram_files_v7_hg38_dbGaP_011516.txt",

        // additional dynamic QTL urls
        dynsqtl: host + "association/dynsqtl",

        // fireCloud
        fcBilling: "https://api.firecloud.org/api/profile/billing",
        fcWorkSpace: "https://api.firecloud.org/api/workspaces",
        fcPortalWorkSpace: "https://portal.firecloud.org/#workspaces"
    };
}

/**
 * parse GTEx dynqtl json
 * @param data {JSON} from GTEx dynamic QTL web services
 * @returns data {JSON} modified data
 * @private
 */
export function parseDynQtl(json){
    // check required json attributes
    ["data", "genotypes", "pValue", "pValueThreshold", "tissueSiteDetailId"].forEach((d)=>{
        // eslint-disable-next-line no-prototype-builtins
        if(!json.hasOwnProperty(d)){
            console.error(json);
            throw "Parse Error: Required json attribute is missing: " + d;
        }
    });

    json.expression_values = json.data.map((d)=>parseFloat(d));
    json.genotypes = json.genotypes.map((d)=>parseFloat(d));

    json.homoRefExp = json.expression_values.filter((d,i) => {
        return json.genotypes[i] == 0;
    });
    json.homoAltExp = json.expression_values.filter((d,i) => {
        return json.genotypes[i] == 2;
    });
    json.heteroExp = json.expression_values.filter((d,i) => {
        return json.genotypes[i] == 1;
    });

    // generate genotype text labels
    let ref = json.variantId.split(/_/)[2];
    let alt = json.variantId.split(/_/)[3];
    json.het = ref + alt;
    json.ref = ref + ref;
    json.alt = alt + alt;

    return json;
}


/**
 * Parse the single tissue eqtls from GTEx web service
 * @param data {Json}
 * @param tissueSiteTable {Json} optional for mapping tissueSiteDetailId to tissueSiteDetail, a dictionary of tissueSite objects (with the attr tissueSiteDetail) indexed by tissueSiteDetailId, and
 * @returns {List} of eqtls with attributes required for GEV rendering
 */
export function parseSingleTissueEqtls(data, tissueSiteTable = undefined){
    const attr = "singleTissueEqtl";
    if(!data.hasOwnProperty(attr)) throw "Parsing Error: required attribute is not found: " + attr;
    ["variantId", "tissueSiteDetailId", "nes", "pValue"].forEach((k)=>{
        if (!data[attr][0].hasOwnProperty(k)) throw "Parsing Error: required attribute is missing: " + attr;
    });


    return data[attr].map((d)=>{
        d.x = d.variantId;
        d.displayX = generateShortVariantId(d.variantId);
        d.y = d.tissueSiteDetailId;
        if (tissueSiteTable) d.displayY = tissueSiteTable[d.tissueSiteDetailId].tissueSiteDetail;
        d.value = d.nes;
        d.displayValue = d.nes.toPrecision(3);
        d.r = -Math.log10(d.pValue); // set r to be the -log10(p-value)
        d.rDisplayValue = parseFloat(d.pValue.toExponential()).toPrecision(3);
        return d;
    });
}

/**
 * Parse the genes from GTEx web service
 * @param data {Json}
 * @returns {List} of genes
 */
export function parseGenes(data, single=false, geneId=null){
    if (data.length==0){
        alert("No gene is found");
        throw "Fatal Error: gene(s) not found";
    }
    if (single){
        if (geneId === null) throw "Please provide a gene ID for search results validation";
        if (data.length>1) { // when a single gene ID has multiple matches
            let filtered = data.filter((g)=>{
                return g.geneSymbolUpper==geneId.toUpperCase() || g.gencodeId == geneId.toUpperCase();
            });
            if (filtered.length > 1) {
                alert("Fatal Error: input gene ID is not unique.");
                throw "Fatal Error: input gene ID is not unique.";
            } else if (filtered.length == 0){
                alert("No gene is found with " + geneId);
                throw "Fatal Error: gene not found";
            }
            else{
                data = filtered;
            }
        }
        return data[0];
    }
    else return data;
}

/**
 * Parse the tissues
 * @param data {Json}
 * @returns {List} of tissues
 */
export function parseTissues(json){
    // sanity check
    ["tissueSiteDetailId", "tissueSiteDetail", "colorHex"].forEach((d)=>{
        if (!json[0].hasOwnProperty(d)) throw "Parsing Error: required json attr is missing: " + d;
    });
    return json;
}

/**
 * Parse the tissues and return a lookup table indexed by tissueSiteDetailId
 * @param json from web service tissueSiteDetail
 * @returns {*}
 */
export function parseTissueDict(json){
    // const attr = "tissueInfo";
    // if(!json.hasOwnProperty(attr)) throw "Parsing Error: required json attr is missing: " + attr;
    // const tissues = json[attr];
    // TODO: It's a bug in the web service that the json object is not wrapped in a key
    const tissues = json;
    // sanity check
    ["tissueSiteDetailId", "tissueSiteDetail", "colorHex"].forEach((d)=>{
        if (!tissues[0].hasOwnProperty(d)) throw "Parsing Error: required json attr is missing: " + d;
    });
    return tissues.reduce((arr, d)=>{arr[d.tissueSiteDetailId] = d; return arr;},{});
}

/**
 * Parse the tissues sample counts, GTEx release specific
 * @param json from web service tissueInfo
 */
export function parseTissueSampleCounts(json){
    const attr = "tissueInfo";
    if(!json.hasOwnProperty(attr)) throw "Parsing Error: required json attr is missing: " + attr;
    const tissues = json[attr];

    // check json structure
    const tissue = tissues[0];
    if (!tissue.hasOwnProperty("tissueSiteDetailId")) throw "Parsing Error: required attr is missing: tissueSiteDetailId";
    if (!tissue.hasOwnProperty("rnaSeqAndGenotypeSampleCount")) throw "Parsing Error: required attr is missing: rnaSeqAndGenotypeSampleCount";
    return tissues;
}

/**
 * Parse the tissue groups
 * @param data {Json}
 * @param forEqtl {Boolean} restrict to eqtl tissues
 * @returns {Dictionary} of lists of tissues indexed by the tissue group name
 */
export function parseTissueSites(data, forEqtl=false){
    // the list of invalid eqtl tissues due to sample size < 70
    // a hard-coded list because the sample size is not easy to retrieve
    
    let tissues = data;
    const invalidTissues = tissues.filter((t)=>t.rnaSeqAndGenotypeSampleCount<=70).map((t)=>t.tissueSiteDetailId); //["Bladder", "Cervix_Ectocervix", "Cervix_Endocervix", "Fallopian_Tube", "Kidney_Medulla"];

    ["tissueSite","tissueSiteDetailId","tissueSiteDetail"].forEach((d)=>{
        if (!tissues[0].hasOwnProperty(d)) throw `parseTissueSites attr error. ${d} is not found`;
    });
    tissues = forEqtl==false?tissues:tissues.filter((d)=>{return !invalidTissues.includes(d.tissueSiteDetailId);}); // an array of tissueSiteDetailId objects

    // build the tissueGroups lookup dictionary indexed by the tissue group name (i.e. the tissue main site name)
    let tissueGroups = tissues.reduce((arr, d)=>{
        let groupName = d.tissueSite;
        let site = {
            id: d.tissueSiteDetailId,
            name: d.tissueSiteDetail
        };
        if (!arr.hasOwnProperty(groupName)) arr[groupName] = []; // initiate an array
        arr[groupName].push(site);
        return arr;
    }, {});

    // modify the tissue groups that have only a single site
    // by replacing the group's name with the single site's name -- resulting a better Alphabetical order of the tissue groups

    Object.keys(tissueGroups).forEach((d)=>{
        if (tissueGroups[d].length == 1){ // a single-site group
            let site = tissueGroups[d][0]; // the single site
            delete tissueGroups[d]; // remove the old group in the dictionary
            tissueGroups[site.name] = [site]; // create a new group with the site's name
        }
    });
    return tissueGroups;
}


/**
 * parse the exons
 * @param data {Json}
 * @param full {Boolean}
 * @returns {List} of exons
 */
export function parseModelExons(json){
    //const attr = full?"fullCollapsedGeneModelExon":"collapsedGeneModelExon";
    /*if(!json.hasOwnProperty(attr)){
        console.error(json);
        throw "Parsing Error: Required json attribute is missing: " + attr;
    }*/
    // sanity check
    ["start", "end"].forEach((d)=>{
        if (!json[0].hasOwnProperty(d)) throw "Parsing Error: Required json attribute is missing: " + d;
    });
    return json.map((d)=>{
        d.chromStart = d.start;
        d.chromEnd = d.end;
        return d;
    });
}

/**
 * parse the junctions
 * @param data
 * @returns {List} of junctions
 * // junction annotations are not stored in Mongo
    // so here we use the junction expression web service to parse the junction ID for its genomic location
    // assuming that each tissue has the same junctions,
    // to grab all the known junctions of a gene, we only need to query one tissue
    // here we arbitrarily pick Liver.
 */
export function parseJunctions(json){

    const attr = "medianJunctionExpression";
    
    if(!json.hasOwnProperty(attr)) throw "Parsing Error: parseJunctions input error. " + attr;
    if (json[attr].length == 0) {
        console.warn("There is no junction entry");
        return [];
    }
    // check required json attributes
    ["tissueSiteDetailId", "junctionId"].forEach((d)=>{
        // use the first element in the json objects as a test case
        if(!json[attr][0].hasOwnProperty(d)){
            console.error(json[0]);
            throw "Parsing Error: required junction attribute is missing: " + d;
        }
    });
    return json[attr].filter((d)=>d.tissueSiteDetailId=="Liver")
        .map((d) => {
            let pos = d.junctionId.split("_");
            return {
                chrom: pos[0],
                chromStart: pos[1],
                chromEnd: pos[2],
                junctionId: d.junctionId
            };
        });
}

/**
 * parse transcript isoforms from the GTEx web service: 'reference/transcript?release=v7&gencode_id='
 * @param data {Json}
 * returns a dictionary of transcript exon object lists indexed by transcript IDs -- ENST IDs
 */
export function parseExons(json){
    //const attr = "exon";
    //if(!json.hasOwnProperty(attr)) throw "Parsing Error: required json attribute is missing: exon";
    return json.reduce((a, d)=>{
        // check required attributes
        ["transcriptId", "chromosome", "start", "end", "exonNumber", "exonId"].forEach((k)=>{
            if(!d.hasOwnProperty(k)) {
                console.error(d);
                throw "Parsing Error: required json attribute is missing: " + k;
            }
        });
        if (a[d.transcriptId] === undefined) a[d.transcriptId] = [];
        d.chrom = d.chromosome;
        d.chromStart = d.start;
        d.chromEnd = d.end;
        a[d.transcriptId].push(d);
        return a;
    }, {});
}

/**
 * parse transcript isoforms from the GTEx web service: 'reference/transcript?release=v7&gencode_id='
 * @param data {Json} from web service exon
 * returns a list of all Exons
 */
export function parseExonsToList(json){
    const attr = "exon";
    if(!json.hasOwnProperty(attr)) throw "Parsing Error: required json attribute is missing: exon";
    return json[attr];
}

/**
 * parse transcript isoforms
 * @param data {Json} from GTEx web service 'reference/transcript?release=v7&gencode_id='
 * returns a list of isoform objects sorted by length in descending order
 */
export function parseTranscripts(json){
    //const attr = "transcript";
    //if(!json.hasOwnProperty(attr)) throw("parseIsoforms input error");

    // check required attributes, use the first transcript as the test case
    ["transcriptId", "start", "end"].forEach((k)=>{
        if(!json[0].hasOwnProperty(k)) {
            throw "Parsing Error: required json attribute is missing: " + k;
        }
    });

    return json.sort((a, b)=>{
        const l1 = Math.abs(a.end - a.start) + 1;
        const l2 = Math.abs(b.end - b.start) + 1;
        return -(l1-l2); // sort by isoform length in descending order
    });
}

/**
 * parse final (masked) gene model exon expression
 * expression is normalized to reads per kb
 * @param data {JSON} of exon expression web service
 * @param exons {List} of exons with positions
 * @returns {List} of exon objects
 */
export function parseExonExpression(data, exons){
    const exonDict = exons.reduce((a, d)=>{a[d.exonId] = d; return a;}, {});
    const attr = "medianExonExpression";
    if(!data.hasOwnProperty(attr)) throw("parseExonExpression input error");

    const exonObjects = data[attr];
    // error-checking
    ["median", "exonId", "tissueSiteDetailId"].forEach((d)=>{
        if (!exonObjects[0].hasOwnProperty(d)) throw "Fatal Error: parseExonExpression attr not found: " + d;
    });
    // parse GTEx median exon counts
    exonObjects.forEach((d) => {
        const exon = exonDict[d.exonId]; // for retrieving exon positions
        // error-checking
        ["end", "start"].forEach((p)=>{
            if (!exon.hasOwnProperty(p)) throw "Fatal Error: parseExonExpression position attr not found: " + p;
        });
        d.l = exon.end - exon.start + 1;
        d.value = Number(d.median)/d.l;
        d.displayValue = Number(d.median)/d.l;
        d.x = d.exonId;
        d.y = d.tissueSiteDetailId;
        d.id = d.gencodeId;
        d.chromStart = exon.start;
        d.chromEnd = exon.end;
        d.unit = "median " + d.unit + " per base";
        d.tissueId = d.tissueSiteDetailId;
    });
    return exonObjects.sort((a,b)=>{
        if (a.chromStart<b.chromStart) return -1;
        if (a.chromStart>b.chromStart) return 1;
        return 0;
    }); // sort by genomic location in ascending order
}

/**
 * Parse junction median read count data
 * @param data {JSON} of the junction expression web service
 * @returns {List} of junction objects
 */
export function parseJunctionExpression(data){
    const attr = "medianJunctionExpression";
    if(!data.hasOwnProperty(attr)) throw("parseJunctionExpression input error");

    const junctions = data[attr];

    // error-checking
    if (junctions === undefined || junctions.length == 0) {
        console.warn("No junction data found");
        return undefined;
    }


    // parse GTEx median junction read counts
    junctions.forEach((d) => {
        ["tissueSiteDetailId", "junctionId", "median", "gencodeId"].forEach((k)=>{
            if (!d.hasOwnProperty(k)) {
                console.error(d);
                throw "Parsingr Error: parseJunctionExpression attr not found: " + k;
            }
        });
        let median = d.median;
        let tissueId = d.tissueSiteDetailId;
        d.tissueId = tissueId;
        d.id = d.gencodeId;
        d.x = d.junctionId;
        d.y = tissueId;
        d.value = Number(median);
        d.displayValue = Number(median);
    });

    // sort by genomic location in ascending order
    return junctions.sort((a,b)=>{
        if (a.junctionId>b.junctionId) return 1;
        else if (a.junctionId<b.junctionId) return -1;
        return 0;
    });
}

/**
 * parse transcript expression
 * @param data
 * @returns {*}
 */
export function parseTranscriptExpression(data){
    const attr = "medianTranscriptExpression";
    if(!data.hasOwnProperty(attr)) throw("Parsing Error: parseTranscriptExpression input error");
    // parse GTEx isoform median TPM
    data[attr].forEach((d) => {
        ["median", "transcriptId", "tissueSiteDetailId", "gencodeId"].forEach((k)=>{
            if(!d.hasOwnProperty(k)) {
                console.error(d);
                throw("Parsing Error: required transcipt attribute is missing: " + k);
            }
        });
        d.value = Number(d.median);
        d.displayValue = Number(d.median);
        d.x = d.transcriptId;
        d.y = d.tissueSiteDetailId;
        d.id = d.gencodeId;
        d.tissueId = d.tissueSiteDetailId;
    });

    return data[attr];
}

/**
 * parse transcript expression, and transpose the matrix
 * @param data
 * @returns {*}
 */
export function parseTranscriptExpressionTranspose(data){
    const attr = "medianTranscriptExpression";
    if(!data.hasOwnProperty(attr)) {
        console.error(data);
        throw("Parsing Error: parseTranscriptExpressionTranspose input error.");
    }
    // parse GTEx isoform median TPM
    data[attr].forEach((d) => {
        ["median", "transcriptId", "tissueSiteDetailId", "gencodeId"].forEach((k)=>{
            if(!d.hasOwnProperty(k)) {
                console.error(d);
                throw("Parsing Error: Required transcript attribute is missing: " + k);
            }
        });
        const median = d.median;
        const tissueId = d.tissueSiteDetailId;
        d.value = Number(median);
        d.displayValue = Number(median);
        d.y = d.transcriptId;
        d.x = tissueId;
        d.id = d.gencodeId;
        d.tissueId = tissueId;
    });

    return data[attr];
}

/**
 * parse median gene expression
 * @param data {Json} with attr medianGeneExpression
 * @returns {*}
 */
export function parseMedianExpression(data){
    const attr = "medianGeneExpression";
    //if(!data.hasOwnProperty(attr)) throw "Parsing Error: required json attribute is missing: " + attr;
    // parse GTEx median gene expression
    // error-checking the required attributes:
    if (data[attr].length == 0) throw "parseMedianExpression finds no data.";
    ["median", "tissueSiteDetailId", "gencodeId"].forEach((d)=>{
        if (!data[attr][0].hasOwnProperty(d)) {
            console.error(data[attr][0]);
            throw `Parsing Error: required json attribute is missing: ${d}`;
        }
    });
    let results = data[attr];
    results.forEach(function(d){
        d.value = Number(d.median);
        d.x = d.tissueSiteDetailId;
        d.y = d.gencodeId;
        d.displayValue = Number(d.median);
        d.id = d.gencodeId;
    });

    return results;
}

/**
 * parse the expression data of a gene for a grouped violin plot
 * @param data {JSON} from GTEx gene expression web service
 * @param colors {Dictionary} the violin color for genes
 */
export function parseGeneExpressionForViolin(data, useLog=true, colors=undefined){
    //const attr = "geneExpression";
    //if(!data.hasOwnProperty(attr)) throw "Parsing Error: required json attribute is missing: " + attr;
    data.forEach((d)=>{
        ["data", "tissueSiteDetailId", "geneSymbol", "gencodeId"].forEach((k)=>{
            if(!d.hasOwnProperty(k)){
                console.error(d);
                throw "Parsing Error: required json attribute is missing: " + k;
            }
        });
        d.values = useLog?d.data.map((dd)=>{return Math.log10(+dd+1);}):d.data;
        d.group = d.tissueSiteDetailId;
        d.label = d.geneSymbol;
        d.color = colors===undefined?"#90c1c1":colors[d.gencodeId];
    });
    return data;
}

/**
 * parse the LD (linkage disequilibrium data)
 * @param data {JSON} from GTEx ld web service
 * @returns {Array}
 */
export function parseLD(data) {
    const attr = "ld";
    if (!data.hasOwnProperty(attr)) throw "Parsing Error: required json attribute is missing: " + attr;
    let parsed = [];
    let unique = {};
    data[attr].forEach((d) => {
        let labels = d[0].split(",").sort(); // sort the variant IDs
        unique[labels[0]] = true;
        unique[labels[1]] = true;
        parsed.push({
            x: labels[0],
            displayX: generateShortVariantId(labels[0]),
            y: labels[1],
            displayY: generateShortVariantId(labels[1]),
            value: parseFloat(d[1]),
            displayValue: parseFloat(d[1]).toPrecision(3) // toPrecision() returns a string
        });
    });
    Object.keys(unique).forEach((d)=>{
        parsed.push({
            x: d,
            displayX: generateShortVariantId(d),
            y: d,
            displayY: generateShortVariantId(d),
            value: 1,
            displayValue: "1"
        });
    });
    return parsed;
}

/* parse the expression data of a gene for boxplot
 * @param data {JSON} from GTEx gene expression web service
 * @param tissues {Object} mapping of tissue ids to labels (tissue name)
 * @param colors {Object} mapping of tissue ids to boxplot colors
 */
export function parseGeneExpressionForBoxplot(data, tissues=undefined, colors=undefined) {
    data.forEach((d)=>{
        ["data", "gencodeId", "geneSymbol", "tissueSiteDetailId"].forEach((k)=>{
            if (!d.hasOwnProperty(k)) {
                console.error(d);
                throw `Parsing error: required JSON attribute ${k} is missing from a record.`;
            }
        });
        d.label = tissues===undefined?d.tissueSiteDetailId:tissues[d.tissueSiteDetailId];
        d.color = colors===undefined?"#4682b4":colors[d.tissueSiteDetailId];
    });

    return data;
}

/**
 * generate variant ID shorthand
 * @param id
 * @returns {*}
 */
function generateShortVariantId(id){
    let temp = id.split("_");
    if(temp[2].length == 1 && temp[3].length == 1) return id;
    if(temp[2].length > temp[3].length) {
        temp[2] = "del";
        temp.splice(3, 1); // delete the alt
    }
    else if(temp[3].length > temp[2].length) {
        temp[3] = "ins";
        temp.splice(2, 1); // delete the ref
    }
    else { // temp[3].length == temp[2].length and temp[3].length > 1
        temp[3] = "sub";
        temp.splice(2, 1); // delete the ref
    }
    return temp.join("_");
}
