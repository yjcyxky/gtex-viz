/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
import { median } from "d3-array";
import {select} from "d3-selection";
import GroupedViolin from "./modules/GroupedViolin";
import {
    getGtexUrls,
    parseDynQtl, parseTissueSites
} from "./modules/gtexDataParser";

import {
    createTissueGroupMenu,
    parseTissueGroupMenu
} from "./modules/gtexMenuBuilder";

import {RetrieveAllPaginatedData, RetrieveNonPaginatedData} from "./utils/pagination";

/**
 * Build the eQTL Dashboard
 * Initiate the dashboard with a search form.
 * 1. Fetch and organize tissue sites into groups.
 * 2. Build the two-level tissue site menu.
 * 3. Bind the search function to the submit button.
 * ToDo: perhaps the dom elements in the form could be accessed without specifying the dom IDs?
 * @param dashboardId {String}: eQTL result <div> ID
 * @param menuId {String} tissue menu <div> ID
 * @param pairId {String} gene-variant <textarea> ID
 * @param submitId {String} form submit button <div> ID
 * @param formId {String} dashboard <form> ID
 * @param messageBoxId {String} message box <div> ID
 * @param urls {Dictionary} of GTEx web service URLs
 */
export function build(dashboardId, menuId, pairId, submitId, formId, messageBoxId, urls=getGtexUrls()){

    RetrieveAllPaginatedData(urls.tissue)
        .then(function(data){ // retrieve all tissue (sub)sites
            const forEqtl = true;
            let tissueGroups = parseTissueSites(data, forEqtl);
            createTissueGroupMenu(tissueGroups, menuId, forEqtl);
            $(`#${submitId}`).click(_submit(tissueGroups, dashboardId, menuId, pairId, submitId, formId, messageBoxId, urls));

        })
        .catch(function(err){
            console.error(err);
        });
}

/**
 *
 * @param gene {Object} with attr geneSymbol and gencodeId
 * @param variant {Object} with attr variantId and snpId
 * @param mainId {String} the main DIV id
 * @param input {Object} the violin data
 * @param info {Object} the metadata of the groups
 * @private
 */
function _visualize(gene, variant, mainId, input, info){

    const id = {
        main: mainId,
        tooltip: "eqtlTooltip",
        toolbar: `${mainId}Toolbar`,
        clone: `${mainId}Clone`,
        chart: `${mainId}Chart`,
        svg: `${mainId}Svg`,
        buttons: {
            save: `${mainId}Save`
        }
    };

    // error-checking DOM elements
    if ($(`#${id.main}`).length == 0) throw "Violin Plot Error: the chart DOM doesn't exist";
    if ($(`#${id.tooltip}`).length == 0) $("<div/>").attr("id", id.tooltip).appendTo($("body"));

    // clear previously rendered plot if any
    select(`#${id.main}`).selectAll("*").remove();

    // build the dom elements
    ["toolbar", "chart", "clone"].forEach((d)=>{
        $("<div/>").attr("id", id[d]).appendTo($(`#${id.main}`));
    });

    // violin plot
    // TODO: code review on the layout, remove hard-coded values and customized code in GroupedViolin.js
    let margin = {
        left: 50,
        top: 50,
        right: 50,
        bottom: 100
    };

    let innerWidth = input.length * 40, // set at at least 50 because of the long tissue names
        width = innerWidth + (margin.left + margin.right);
    let innerHeight = 80,
        height = innerHeight + (margin.top + margin.bottom);

    let dom = select(`#${id.chart}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", id.svg)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // render the violin
    let violin = new GroupedViolin(input, info);
    const tooltip = violin.createTooltip(id.tooltip);
    const toolbar = violin.createToolbar(id.toolbar, tooltip);
    toolbar.createDownloadSvgButton(id.buttons.save, id.svg, `${id.main}-save.svg`, id.clone);
    const configs = {
        x: {show: false, angle: 0, paddingInner:0.01, paddingOuter: 0.01},
        subx: {show: true, angle: 0, paddingInner: 0, paddingOuter: 0, sort: false},
        y: {label:"Norm. Expression"},
        size: {show: true}
    };
    violin.render(
        dom,
        innerWidth,
        innerHeight,
        undefined,
        [-3, 3],
        configs.x,
        configs.subx,
        configs.y,
        configs.size,
        false,
        true,
        false,
        true,
        10,
    );

    // add violin title -- must add after the violin renders, or the violin code removes it
    dom.insert("text", ":first-child")
        .classed("ed-section-title", true)
        .text(`${gene.geneSymbol} (${gene.gencodeId}) and ${variant.snpId||""} (${variant.variantId})`)
        .attr("x", 0)
        .attr("y", -margin.top + 16);
    _customizeViolinPlot(violin, dom);
    customizeTooltip(violin, gene, variant);
}
/**
 * Customization of the violin plot
 * @param plot {GroupedViolin}
 * @param dom {D3 DOM}
 */
function _customizeViolinPlot(plot, dom){
    plot.groups.forEach((g)=>{
        // customize the long tissue name
        const gname = g.key;
        const names = gname.replace(/\(/, " - (").split(/\s*-\s*/);
        const customXlabel = dom.append("g");
        const customLabels = customXlabel.selectAll(".violin-group-label")
            .data(names);
        customLabels.enter().append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "violin-group-label")
            .attr("transform", (d, i) => {
                let x = plot.scale.x(gname) + plot.scale.x.bandwidth()/2;
                let y = plot.scale.y(plot.scale.y.domain()[0]) + 75 + (12*i); // todo: avoid hard-coded values
                return `translate(${x}, ${y})`;
            })
            .text((d) => d);
    });

    dom.selectAll(".violin-size-axis").classed("violin-size-axis-hide", true).classed("violin-size-axis", false);

}

export function customizeTooltip(plot, gene, variant, dashBoard=true, tissue = undefined) {
    let geneSymbol = gene;
    let variantId = variant;
    if (dashBoard){
        geneSymbol = gene.geneSymbol;
        variantId = variant.variantId;
    }
    plot.dom.selectAll(".violin-g")
        .on("mouseover", (d, i, nodes) => {
            select(nodes[i]).classed("highlighted", true);
            const tooltipData = [
                `<span class="tooltip-key">Gene</span>: <span class="tooltip-value">${geneSymbol}</span>`,
                `<span class="tooltip-key">Variant</span>: <span class="tooltip-value">${variantId}</span>`,
                `<span class="tooltip-key">Tissue</span>: <span class="tooltip-value">${tissue==undefined?d.group:tissue}</span>`,
                `<span class="tooltip-key">Genotype</span>: <span class="tooltip-value">${d.label}</span>`,
                `<span class="tooltip-key">Sample size</span>: <span class="tooltip-value">${d.size}</span>`,
                `<span class="tooltip-key">Median</span>: <span class="tooltip-value">${median(d.values).toPrecision(4)}</span>`,
            ];
            plot.tooltip.show(tooltipData.join("<br/>"));
        });
}

/**
 * Define the submit button's action
 * @param tissueGroups {Dictionary} of lists of tissues indexed by tissue groups
 * @param dashboardId {String} eQTL results <div> ID
 * @param menuId {String} tissue menu <div> ID
 * @param pairId {String} gene-variant <textarea> ID
 * @param submitId {String} submit button <div> ID
 * @param messageBoxId {String} message box <div> ID
 * @param urls {Dictionary} of GTEx web service URLs
 * @param max {Integer} max number of gene-variant entries. The default is set to 30.
 * @private
 * Dependencies: jQuery
 */
function _submit(tissueGroups, dashboardId, menuId, pairId, submitId, formId, messageBoxId, urls= getGtexUrls(), max=30){
    return function(){

        // clear the previous dashboard search results if any
        $(`#${dashboardId}`).html("");

        ////// validate tissue inputs and convert them to tissue IDs //////
        let queryTissueIds = parseTissueGroupMenu(tissueGroups, menuId);

        // tissue input error-checking
        if (queryTissueIds.length == 0) {
            alert("Must select at least one tissue.");
            throw "Input error";
        }

        ////// parse the gene-variant input list //////
        let pairs = $(`#${pairId}`).val().split("\n").filter(function(d){return d != "";});
        if (pairs.length == 0) {
            alert("Must input at least one gene-variant pair.");
            throw "Input error";
        }
        else if (pairs.length > max) {
            $(`#${messageBoxId}`).append(`Your input has exceeded the maximum number of allowed entries. Only the first ${max} entries are processed.`);
            console.warn("User input has exceeded the maximum number of allowed entries.");
            pairs = pairs.slice(0, max);
        }

        ////// process each gene-variant pair //////

        // create a tissue name lookup table
        const tissueDict = {};
        Object.keys(tissueGroups).forEach((gname) => {
            tissueGroups[gname].forEach((site) => {
                tissueDict[site.id] = site.name;
            });
        });

        // for each gene-variant pair
        pairs.forEach(function(pair, i){
            pair.replace(/ /g, ""); // remove all spaces
            let vid = pair.split(",")[1],
                gid = pair.split(",")[0];

            // retrieve gene and variant info from the web service
            const geneUrl = urls.geneId + gid;
            const variantUrl = vid.toLowerCase().startsWith("rs") ? urls.snp+vid:urls.variantId+vid;
            const promises = [
                RetrieveAllPaginatedData(geneUrl), 
                RetrieveAllPaginatedData(variantUrl)
            ];
            Promise.all(promises)
                .then(function(args){
                    const gene = _parseGene(args[0], gid);
                    const variant = _parseVariant(args[1]);
                    if (gene === null){
                        const errorMessage = `Input Error: no gene found for ${gid}. <br/>`;
                        $(`#${messageBoxId}`).append(errorMessage);
                        throw errorMessage;
                    }
                    if (variant === null){
                        const errorMessage = `Input Error: no variant found for ${vid} <br/>`;
                        $(`#${messageBoxId}`).append(errorMessage);
                        throw errorMessage;
                    }

                    // calculate eQTLs and display the eQTL violin plots
                    _renderEqtlPlot(tissueDict, dashboardId, gene, variant, queryTissueIds, i, urls);

                    // hide the search form after the eQTL violin plots are reported
                    $(`#${formId}`).removeClass("show"); // for bootstrap 4
                    $(`#${formId}`).removeClass("in"); // for boostrap 3
                }
                )
                .catch(function(err){
                    console.error(err);
                });
        });
    };
}

/**
 * Parse GTEx gene web service
 * @param gjson
 * @param id {String} the query gene ID
 * @returns {*} a gene object or null if not found
 * @private
 */
function _parseGene(gjson, id){
    //const attr = "gene";
    //if(!gjson.hasOwnProperty(attr)) throw "Fatal Error: parse gene error";
    let genes = gjson.filter((d) => {return d.geneSymbolUpper == id.toUpperCase() || d.gencodeId == id.toUpperCase();}); // find the exact match
    if (genes.length ==0) return null;
    return genes[0];
}

/**
 * Parse GTEx variant/snp web service
 * @param vjson
 * @returns {*} a variant object or null
 * @private
 */
function _parseVariant(vjson){
    //const attr = "variant";
    //if(!vjson.hasOwnProperty(attr)) throw "Fatal Error: parse variant error";
    const variants = vjson;
    if (variants.length == 0) return null;
    return variants[0];
}

/**
 * calculate the eQTLs and fetch expression of genotypes for each gene-variant pair
 * @param tissuDict {Dictionary} tissue name lookup table, indexed by tissue IDs
 * @param dashboardId {String} the dashboard results <div> ID
 * @param gene {Object} a GTEx gene object
 * @param variant {Object} the GTEx variant object
 * @param tissues {List} of query tissue IDs
 * @param i {Integer} the boxplot DIV's index
 * @private
 */
function _renderEqtlPlot(tissueDict, dashboardId, gene, variant, tissues, i, urls=getGtexUrls()) {
    // display gene-variant pair names
    const id = `violinplot${i}`;
    $(`#${dashboardId}`).append(`<div id="${id}" class="col-sm-12"></div>`);

    // parse the genotypes from the variant ID
    let ref = variant.variantId.split(/_/)[2];
    let alt = variant.variantId.split(/_/)[3];
    const het = ref + alt;
    ref = ref + ref;
    alt = alt + alt;
    // d3-queue https://github.com/d3/d3-queue
    let promises = [];

    // queue up all tissue IDs
    tissues.forEach((tId) => {
        let urlRoot = urls.dyneqtl;
        let url = `${urlRoot}?variantId=${variant.variantId}&gencodeId=${gene.gencodeId}&tissueSiteDetailId=${tId}`; // use variant ID, gencode ID and tissue ID to query the dyneqtl
        promises.push(_apiCall(url, tId));
    });

    Promise.all(promises)
        .then(function(results){
            let input = []; // a list of genotype expression objects
            let info = {};
            results.forEach((d) => {
                if (d.status == "failed"){
                    // if eQTLs aren't available for this query, create an empty space for the layout of the report
                    let group = tissueDict[d.tissue]; // group refers to the tissue name, map tissue ID to tissue name
                    // genotype expression data
                    input = input.concat([
                        {
                            group: group,
                            label: ref.length>2?"ref":ref,
                            values: [0]
                        },
                        {
                            group: group,
                            label: het.length>2?"het":het,
                            values: [0]
                        },
                        {
                            group: group,
                            label: alt.length>2?"alt":alt,
                            values: [0]
                        }
                    ]);
                }
                else {
                    d = parseDynQtl(d); // reformat eQTL results d
                    let group = tissueDict[d.tissueSiteDetailId]; // group is the tissue name, map tissue ID to tissue name

                    input = input.concat([
                        {
                            group: group,
                            label: ref.length>2?"ref":ref,
                            size: d.homoRefExp.length,
                            values: d.homoRefExp
                        },
                        {
                            group: group,
                            label: het.length>2?"het":het,
                            size: d.heteroExp.length,
                            values: d.heteroExp
                        },
                        {
                            group: group,
                            label: alt.length>2?"alt":alt,
                            size: d.homoAltExp.length,
                            values: d.homoAltExp
                        }
                    ]);
                    // additional info of the group goes here
                    info[group] = {
                        "pvalue": d["pValue"]===null?1:parseFloat(d["pValue"]).toPrecision(3),
                        "pvalueThreshold": d["pValueThreshold"]===null?0:parseFloat(d["pValueThreshold"]).toPrecision(3)
                    };
                }

            });
            _visualize(gene, variant, id, input, info);
        })
        .catch(function(err){console.error(err);});
}

function _apiCall(url, tissue){
    // reference: http://adampaxton.com/handling-multiple-javascript-promises-even-if-some-fail/
    return new Promise(function(resolve, reject){
        RetrieveNonPaginatedData(url)
            .then(function(request) {
                resolve(request);
            })
            .catch(function(err){
                // report the tissue as failed
                console.error(err);
                const failed = {
                    tissue: tissue,
                    status: "failed"
                };
                resolve(failed);
            });
    });

}

export var EqtlDashboard = {
    build: build
};
