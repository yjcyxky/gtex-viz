/* eslint-disable no-prototype-builtins */
/**
 * Copyright © 2015 - 2019 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */

/**
 * TODO:
 * No jQuery... or at least isolate out the functionalities that require jQuery
 */
"use strict";

import {select, selectAll} from "d3-selection";
import {axisBottom} from "d3-axis";
import {scaleBand} from "d3-scale";
import {brushSelection} from "d3-brush";
import {symbol, symbolDiamond} from "d3-shape";
import $ from "jquery";

import MiniGenomeBrowser from "./modules/MiniGenomeBrowser";
import DataMap from "./modules/DataMap.js";
import HalfMap from "./modules/HalfMap.js";
import {checkDomId} from "./utils/dom-utils";
import * as tissueUtils from "./models/GTExTissues";
import * as dataUtils from "./modules/LocusBrowserDataUtils";
import * as uiUtils from "./modules/LocusBrowserUIUtils";
import * as commonFeatures from "./modules/LocusBorwserCommonFeatures";
import {RetrieveAllPaginatedData} from "./utils/pagination";
// the data structure is predefined here for par.data
export let data = {
    locusData: {
        gwasImputed: undefined,
        eqtl: undefined,
        sqtl: undefined
    },
    track: { // genome browser tracks
        tss: undefined,
        geneModel: undefined,
        eqtl: undefined,
        sqtl: undefined,

        // the following tracks are from H3K27Ac
        enhancerBrain: undefined,
        enhancerHeart: undefined,
        enhancerLung: undefined,
        enhancerSkeletalMuscle: undefined
    },
    queryGene: undefined,
    genes: undefined,
    gwasToGene: undefined,
    functionAnnotationDict: undefined,
    ld: [],
    tissueMap: {}
};

export let vizComponents = {
    svg: undefined,
    lastTrack: undefined,
    ldMap: undefined
};

export const dataUrls = dataUtils.serviceUrls;
const functionAnnotationKeys = dataUtils.annoCatDict;

/**
 * 
 * @param {String} geneId 
 * @param {Object} par 
 * @param {Function} callback: callback function to execute external tasks (and the required parameter is the gene ID)
 */
export function init(geneId, par=DefaultConfig){
    // get data from web services and set the values in par.data
    _showSpinner(par);
    select("#locus-browser-error").text(""); // erase any previous error messages
    _fetchData(par, geneId); // this function fetches data and then calls _render() to render the plot
    if (par.callback!== undefined) par.callback(geneId); // runs additional parallele callback function if it's specified in par.callback
}

/**
 * Fetch data by calling GTEx web services, and execute the callback function
 * @param {DefaultConfig} par 
 * @param {String} geneId 
 * @param {Function} callback: that callback function should take two parameters: par and geneId
 */
function _fetchData(par, geneId){ 
    ////// first find the query gene
    RetrieveAllPaginatedData(par.urls.queryGene + geneId) 
        .then((geneJson)=>{
            const theGene = dataUtils.checkGene(geneJson, geneId);
            ////// then fetch neiboring genes within the defined genomic range
            RetrieveAllPaginatedData(`${par.urls.genes}pos=${theGene.tss}&chromosome=${theGene.chromosome}&bp_window=${par.genomicWindow}`)
                .then((nbJson)=>{
                    // create promises for all other data
                    const promises = ["geneModel", "tissueInfo", "funcAnno", "eqtls", 
                        "sqtls", "independentEqtl", "ld"].map((d)=>{
                        if (d=="tissueInfo"){
                            return RetrieveAllPaginatedData(par.urls[d]);
                        }
                        if (d=="funcAnno"){
                            return RetrieveAllPaginatedData(par.urls[d] + `&chromosome=${theGene.chromosome}&start=${theGene.tss-1e6}&end=${theGene.tss+1e6}`, 10000);
                        }
                        const url = par.urls[d] + theGene.gencodeId;
                        if (d=="ld"){
                            return RetrieveAllPaginatedData(url, 10000);
                        }
                        return RetrieveAllPaginatedData(url, 1000);
                    });

                    ////// then get all other data
                    Promise.all(promises)
                        .then((args)=>{
                            par.data.queryGene = theGene;
                            par.data.genes = dataUtils.findNeighborGenes(nbJson);
                            par.data.tissueMap = dataUtils.parseTissueInfo(args[1]);
                            par.data.functionAnnotationDict = dataUtils.getVariantFunctionalAnnotations(args[2], theGene);
                            par.data.locusData = {
                                eqtl: dataUtils.getQtlMapData(args[3], "singleTissueEqtl", "eQTL"),
                                sqtl: dataUtils.getQtlMapData(args[4], "singleTissueSqtl", "sQTL"),
                            };
                            par.data.indies = {
                                eqtl: dataUtils.getEqtlIndieData(args[5]),
                            };
                            par.data.track = {
                                tss: par.data.genes,
                                geneModel: dataUtils.getGeneModel(args[0]),
                                eqtl: dataUtils.getQtlTrackData(args[3], "singleTissueEqtl"),
                                sqtl: dataUtils.getQtlTrackData(args[4], "singleTissueSqtl")
                            };
                            par.data.ld = _ldMapDataParserHelper(args[6]);
                            par.data.qtlMap = [].concat(par.data.locusData.eqtl).concat(par.data.locusData.sqtl);
                
                            // hide the spinner
                            _hideSpinner(par);

                            // execute the callback function
                            _render(par, geneId);
                        });
                });
        })
        .catch((e)=>{
            console.error(e);
            _hideSpinner(par);
            select("#locus-browser-error").text(`${geneId.toUpperCase()} cannot be rendered.`);
            select(".show-if-success").style("opacity", 0);
            select("#locus-browser-toolbar").style("opacity", 0);
        });
}

/**
 * Render function
 * @param par {Object} visualization config with required attributes
 */
function _render(par=DefaultConfig, geneId){
    // rendering visualizations
    _calculateDimensions(par);
    par.viz.svg = _createSvg(par.id, par.width, par.height, {left:0, top:0}, undefined);
    par.viz.bmap = undefined; 
    _renderGeneVisualComponents(par);

    if (par.data.track.geneModel.length == 0){
        // this gene has no gene model, indicating that the gene was not included in the data analysis.
        // no more rendering to proceed
        select("#gene-model-track").append("text") // TODO: remove hard-coded DOM ID reference
            .attr("x", 0)
            .attr("y", 50)
            .attr("fill", "red")    
            .text(`${geneId} is not included in the QTL analysis.`);
        return;
    }
    par.viz.lastTrack = _renderVariantTracks(par); // it's important to keep track of the last track on the mini genome, because that's where the brush is implemented
    _renderQtlMapWithLD(par, true);

    // rendering DOM components
    _renderGeneInfo(par);
    _setUIEvents(geneId, par);
    _renderDataFilterModal(par);
    _bindVariantSearchForm(par);
}

function _bindVariantSearchForm(par){
    $("#variantInput").keypress(function(e){
        if(e.keyCode == 13){
            // bind the enter key
            e.preventDefault(); // Note: prevent the default behavior of the enter key, which is refreshing the page
            const queryVariants = $("#variantInput").val();
            _locateVariants(queryVariants, par);
        }
    });
}

/**
 * Locate user-speficied variants in LocusBrowser
 * @param {String} vInput a comma-separated list of variant IDs, rs IDs, and or positions
 * @param {Object} par the plot's config object
 */
function _locateVariants(vInput, par){
    const vInputSet = new Set(vInput.replace(/\s/g, "").toUpperCase().split(","));
    const flag = {};
    [...vInputSet].forEach((v)=>{
        flag[v] = false;
    });
    const foundVar = {};
    par.viz.bmap.data.filter((d)=>{
        let found = false;
        if (vInputSet.has(d.variantId.toUpperCase())) {
            found = true;
            flag[d.variantId.toUpperCase()] = true;
        }
        else if (vInputSet.has(`${d.chromosome.toUpperCase()}_${d.pos}`)) {
            found = true;
            flag[`${d.chromosome.toUpperCase()}_${d.pos}`] = true;
        }
        else if (d.rsId!==null && vInputSet.has(d.rsId.toUpperCase())) {
            found = true;
            flag[d.rsId.toUpperCase()] = true;
        }
        return found;
    }).forEach((d)=>{
        foundVar[d.variantId] = {"variantId": d.variantId, "pos": d.pos, "chr": d.chromosome, "rsId": d.snpId};
    });

    // report variants that aren't found
    const notFound = Object.keys(flag).filter((v)=>flag[v]== false);
    if (notFound.length>0) $("#locus-browser-error").text(`Variants not found: ${notFound.join(", ")}`);

    // render found variants
    par.selectedVariants = Object.values(foundVar);
    _renderFoundVariants(par);
}

/**
 * Render the symbols and highlight text labels of user-specified variants when found in the QTL data
 * @param {Object} par LocusBrowser's plot config object 
 */
function _renderFoundVariants(par){
    const foundVar = par.selectedVariants;
    if (foundVar === undefined) return; // do nothing when there's no selected variants

    // clear any previously rendered markers 
    selectAll(".found-variant").remove();
    selectAll(".found-variant-2").remove();

    // render the variant markers
    par.viz.lastTrack.dom
        .selectAll(".found-variant")
        .data(foundVar) // find unique positions
        .enter()
        .append("path")
        .attr("d", symbol().type(symbolDiamond).size(36))
        .attr("class", "found-variant")
        .attr("transform", (d)=>`translate(${par.viz.lastTrack.scale(d.pos)}, 25)`)
        .attr("fill", "#dcc30c")
        .attr("stroke", "white");

    par.viz.bmap.svg
        .selectAll(".found-variant")
        .data(foundVar)
        .enter()
        .append("path")
        .attr("d", symbol().type(symbolDiamond))
        .attr("class", "found-variant")
        .attr("transform", (d)=>`translate(${par.viz.bmap.xScale(d.variantId) + par.viz.bmap.xScale.bandwidth()/2||0}, -20)`)
        .attr("fill", (d)=>par.viz.bmap.xScale(d.variantId)?"#dcc30c":"white")
        .attr("stroke", "white")
        .style("cursor", "pointer")
        .on("mouseover", function(d){
            const tooltipData = [
                `<span class="tooltip-key">Variant Id</span>: <span class="tooltip-value">${d.variantId}</span>`,
                `<span class="tooltip-key">RS Id</span>: <span class="tooltip-value">${d.rsId}</span>`
            ];
            par.viz.bmap.tooltip.show(tooltipData.join("<br/>"));
        })
        .on("mouseout", function(){
            par.viz.bmap.tooltip.hide();
        });
    
    par.viz.bmap.svg
        .selectAll(".found-variant-2")
        .data(foundVar)
        .enter()
        .append("path")
        .attr("d", symbol().type(symbolDiamond))
        .attr("class", "found-variant-2")
        .attr("transform", (d)=>`translate(${par.viz.bmap.xScale(d.variantId) + par.viz.bmap.xScale.bandwidth()/2||0}, ${par.viz.bmap.yScale.range()[1]})`)
        .attr("fill", (d)=>par.viz.bmap.xScale(d.variantId)?"#dcc30c":"white")
        .attr("stroke", "white")
        .style("cursor", "pointer")
        .on("mouseover", function(d){
            const tooltipData = [
                `<span class="tooltip-key">Variant Id</span>: <span class="tooltip-value">${d.variantId}</span>`,
                `<span class="tooltip-key">RS Id</span>: <span class="tooltip-value">${d.rsId}</span>`
            ];
            par.viz.bmap.tooltip.show(tooltipData.join("<br/>"));
        })
        .on("mouseout", function(){
            par.viz.bmap.tooltip.hide();
        });
    

}

function _showSpinner(par){
    select(`#${par.spinnerId}`).style("opacity", 1);
}
function _hideSpinner(par){
    select(`#${par.spinnerId}`).style("opacity", 0);
}

function _renderGeneInfo(par){
    select(".show-if-success").style("opacity", 100);
    let panel = select(`#${par.infoId}`);
    let gene = par.data.queryGene;
    let data = par.data;
    panel.selectAll("*").remove(); // clear any previous contents

    panel.append("div")
        .text(`Query Gene: ${gene.geneSymbol} (${gene.gencodeId}), ${gene.description}`);

    panel.append("div")
        .text(`Gene Location: ${gene.chromosome}:${gene.start} - ${gene.end} (${gene.strand})`);

    panel.append("div")
        .text(`Total eQTLs: ${data.locusData.eqtl.length}`);

    panel.append("div")
        .text(`Total sQTLs: ${data.locusData.sqtl.length}`);
}

/**
 * Create an SVG D3 object
 * @param id {String} the parent dom ID
 * @param width {Numeric}: the outer width
 * @param height {Numeric}: the outer height
 * @param margin {Object} with attr: left, top
 * @param svgId {String}
 * @returns {*}
 * @private
 */
export function _createSvg(id, width, height, margin, svgId=undefined){
    checkDomId(id);
    if (svgId===undefined) svgId=`${id}-svg`;
    if (margin===undefined) margin={top:0, left:0};
    let dom = select("#"+id).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", svgId)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    return dom;
}

/**
 * Define the click event of the QTL map -- generate the QTL violin plots
 */
function _setQtlClickEvent(par){
    const dialogDivId = "qtl-violin-dialog";
    const qtlClickEvent = (d)=>{
        $(`#${dialogDivId}`).dialog("open");
        uiUtils.addPlotToDialog(dialogDivId, d, par.urls);
    };
    par.viz.bmap.svg.selectAll(".data-bar")
        .on("click", qtlClickEvent);
    par.viz.bmap.svg.selectAll(".map-bubble")
        .on("click", qtlClickEvent);
}

/**
 * Define UI mouse events
 * @param geneId
 * @param par
 */
function _setUIEvents(geneId, par){
    // create violin plot dialog window
    uiUtils.createDialog("qtl-violin-div", "qtl-violin-dialog", "QTL Violin Plot Dialog");
    
    // show the toolbar
    select("#locus-browser-toolbar").style("opacity", 100).style("display", "block");

    // Visualization click events
    // Toolbar
    select("#show-v-id")
        .on("click", ()=>{
            par.panels.qtlMap.showColumnLabel = !par.panels.qtlMap.showColumnLabel;
            if (par.panels.qtlMap.showColumnLabel) {
                select("#"+par.id).select("svg").attr("height", par.height + 80);
                select("#show-v-id").text("Hide Variant ID");
            } // make room for text labels
            else {
                select("#"+par.id).select("svg").attr("height", par.height);
                select("#show-v-id").text("Show Variant ID");
            }
            _customizeMapColumnLabels(par);
        });
    select("#change-qtl-map")
        .on("click", ()=>{
            if (par.panels.qtlMap.mapType=="barmap"){
                par.panels.qtlMap.mapType = "bubblemap";
                selectAll(".bar-row").remove();
                select("#change-qtl-map").text("Use Bar Map");
            } else {
                par.panels.qtlMap.mapType = "barmap";
                select("#change-qtl-map").text("Use Bubble Map");
            }
            _changeQtlMapType(par);
        });

    // modal related UI events
    const dataTypeFilter = ()=>{
        let dataTypeInputs = document.getElementsByName("dataType");
        let dataTypes = [];
        dataTypeInputs.forEach((d)=>{
            if (d.checked) dataTypes.push(d.value);
        });
        return dataTypes;
    };
    const tissueSiteFilter = ()=>{
        let tissueSiteInputs = document.getElementsByName("tissueSite");
        let sites = [];
        tissueSiteInputs.forEach((d)=>{
            if (d.checked) sites.push(d.value);
        });
        return sites;
    };
    const filter = ()=>{
        let bmap = par.viz.bmap;
        let oldDomain = new Set(bmap.fullYDomain);
        let dataTypes = dataTypeFilter();
        let sites = tissueSiteFilter();
        // let newDomain = [bmap.yScale.domain()[0]]; // always include the GWAS data
        let newDomain = [];
        dataTypes.forEach((d)=>{
            sites.forEach((s)=>{
                let item = `${d}-${s}`;
                if (oldDomain.has(item)) newDomain.push(item); // check if the dataType in a tissue site is available in the full data set
            });
        });
        // optimize visualization dimensions for the filtered data
        let oldInHeight = bmap.yScale.range()[1];
        let newInHeight = newDomain.length * par.panels.qtlMap.rowHeight;
        par.height = par.height + (newInHeight-oldInHeight);
        if (par.panels.qtlMap.showColumnLabel){
            select("#"+par.id).select("svg").attr("height", par.height + 80);
        }
        else {
            select("#"+par.id).select("svg").attr("height", par.height);
        }
        bmap.yScale.domain(newDomain) // reset the yScale domain
            .range([bmap.yScale.range()[0], newInHeight]);
        _rerender(par);
       
    };
    select("#modal-close-btn").on("click", filter);
    select("#modal-filter-btn").on("click", filter);

    select("#zoom-plus")
        .on("click", ()=>{
            par.genomicWindow = par.genomicWindow <= 5e4?5e4:par.genomicWindow/2;
            _rerender(par);
        });
    select("#zoom-minus")
        .on("click", ()=>{
            par.genomicWindow = par.genomicWindow >= 1e6?1e6:par.genomicWindow*2;
            _rerender(par);
        });
    select("#zoom-reset")
        .on("click", ()=>{
            par.genomicWindow = 1e6;
            _rerender(par);
        });
    _reportCurrentWindow(par);
}

/**
 * Generate a tissue menu based off of the QTL data
 * @param {*} par 
 */
function _renderDataFilterModal(par){
    // data modal
    select("#tissue-menu").selectAll("*").remove(); // clear previously rendered menu
    // get the unique list of tissues
    let tissueSet = new Set(par.viz.bmap.yScale.domain()
        .map((d)=>{
            return d.replace("eQTL-", "").replace("sQTL-", "");
        })
        .filter((d, i, self)=>{
            return !d.startsWith("GWAS") && self.indexOf(d)===i;
        }));
    
    let tissues = tissueUtils.tissues.filter((t)=>tissueSet.has(t.tissueSiteDetailAbbr));

    uiUtils.renderTissueMenu(tissues, "tissue-menu");
}

/**
 * Find all neighbor genes of the query gene
 * Only searching for coding and lincRNA genes are
 * @param data {List} of gene objects
 * @param par {Object} of the viz config with required attributes: dataFilters.genes, data.queryGene, genomicWindow...
 * @returns {List} of neighbor gene objects (including the query gene itself
 * @private
 */

function _findNeighbors(data, par){
    const geneFilter = (d, gene, window) => {
        const lower = gene.tss - window; // lower bound
        const upper = gene.tss + window;
        if (d.chromosome==gene.chromosome && d.tss>=lower && d.tss<=upper){
            return d.type == "protein coding" || d.type == "lincRNA";
        } else {
            return false;
        }
    };
    // fetch neighbor genes including the query gene itself
    let genes = data.filter((d)=>{ // all genes within the genomic view range
        return geneFilter(d, par.data.queryGene, par.genomicWindow);
    }); // genes are filtered by gene types defined in the config object
    genes.sort((a, b) => {
        return parseInt(a.tss - parseInt(b.tss));
    });
    return genes;
}

/**
 * Calculate and sum the height of the root SVG based on the individual visual panels
 * Calculate and determine the Y position of each individual visual panel in the root SVG
 * @param par
 */
function _calculateDimensions(par=DefaultConfig){
    par.height = Object.keys(par.panels)
        .reduce((total, panelKey)=>{
            let p = par.panels[panelKey];
            // simultaneously calculate the panel's yPos
            p.yPos = total;
            return total + p.height; // summing the height
        }, 0);
}

/**
 * Re-render the visualization when the genomic window range is changed
 * @param par {Object} visualization config
 */
function _rerender(par){
    // clear all visualizations
    Object.keys(par.panels).forEach((k)=>{
        let panel = par.panels[k];
        select(`#${panel.id}`).remove();
    });
    select(`#${par.ld.id}`).selectAll("*").remove();
    _reportCurrentWindow(par);
    _renderGeneVisualComponents(par);
    par.viz.lastTrack = _renderVariantTracks(par);
    _renderQtlMapWithLD(par, true);
}

function _reportCurrentWindow(par){
    select("#zoom-size").text(`Current window: ${(2*par.genomicWindow/1000).toLocaleString()} kb`);
}

/**
 * Render the visual components related to genes: GWAS trait heatmap, gene position track
 * @param par {Object} the configuration object of the overall visualization
 */
function _renderGeneVisualComponents(par = DefaultConfig){
    // render the gene map as a heat map
    // const heatmapViz = _renderGeneHeatmap(par);
    let geneLabelScale = _renderNeighborGenes(par);
    
    // render gene related genomic tracks
    const tssTrackViz = _renderGeneTracks(par);

    //// visual customization: draw connecting lines between the gene heatmap column labels and tss positions on the tss track
    _customizeGene2TssTrackLines(par, geneLabelScale, tssTrackViz);
}

/**
 * Adding connecting lines from gene text labels to the TSS track in the mini genome
 * @param {*} par 
 * @param {ScaleBand} geneMapScale 
 * @param {MiniGenomeBrowser} tssTrack 
 */
function _customizeGene2TssTrackLines(par, geneMapScale, tssTrack){
    let geneMapPanel = par.panels.geneMap;
    let tssPanel = par.panels.tssTrack;
    let xAdjust = geneMapPanel.margin.left - tssPanel.margin.left + 2;
    let yAdjust = tssPanel.margin.top;
    let trackHeight = tssPanel.height - (tssPanel.margin.top + tssPanel.margin.bottom);
    let gene = par.data.queryGene;
    const _getStrokeColor = (d)=>{
        // color the query gene in red
        // color all other genes in grey
        return d.geneSymbol==gene.geneSymbol?"red":"#cccccc";
    };

    const _getStrokeWidth = (d, i)=>{
        return d.geneSymbol==gene.geneSymbol?2:(((i+1)%10==0)?1:0.5);
    };

    let genesInWindow = _findNeighbors(par.data.track.tss, par);
    // error-checking
    if (genesInWindow.length == 0) console.error("Data error: now genes in window " + par.data.track.tss);
    tssTrack.svg.selectAll(".connect").remove();
    tssTrack.svg.selectAll(".connect")
        .data(genesInWindow)
        .enter()
        .append("line")
        .attr("class", (d)=>`connect ${d.geneSymbol}`)
        .attr("x1", (d)=>geneMapScale(d.geneSymbol) + xAdjust)
        .attr("x2", (d)=>tssTrack.scale(d.tss))
        .attr("y1", trackHeight/2-yAdjust)
        .attr("y2", trackHeight/2)
        .style("stroke", _getStrokeColor)
        .style("stroke-width", _getStrokeWidth);

    // vertical connecting line
    tssTrack.svg.selectAll(".connect2")
        .data(genesInWindow)
        .enter()
        .append("line")
        .attr("class", (d)=>`connect2 ${d.geneSymbol}`)
        .attr("x1", (d)=>geneMapScale(d.geneSymbol) + xAdjust)
        .attr("x2", (d)=>geneMapScale(d.geneSymbol) + xAdjust)
        .attr("y1", trackHeight/2-yAdjust)
        .attr("y2", trackHeight/2-geneMapPanel.margin.bottom-tssPanel.margin.top)
        .attr("stroke", _getStrokeColor)
        .attr("stroke-width", _getStrokeWidth);
}

/**
 * Render gene based genomic tracks: tss, exon
 * @param par {Object} the viz CONFIG
 * @returns {MiniGenomeBrowser} of the tss track
 */
function _renderGeneTracks(par=DefaultConfig){

    // tss track
    let tssTrack = par.panels.tssTrack;
    const tssTrackViz = _renderFeatureTrack(par, tssTrack, par.data.track.tss, false);

    // gene model (exon) track
    let exonTrack = par.panels.geneModelTrack;
    _renderFeatureTrack(par, exonTrack, par.data.track.geneModel, true);

    return tssTrackViz; // why?
}

function _renderQtlIndies(par){
    const bmap = par.viz.bmap;
    // const gencodeId = par.data.queryGene.gencodeId;
    bmap.svg.select("#qtl-indies").selectAll("*").remove();
    bmap.svg.select("#qtl-indies").remove();
    let indieG = bmap.svg.append("g").attr("id", "qtl-indies");

    const drawI = (d)=>{
        let iSymbol = indieG.append("g")
            .attr("x", 0)
            .attr("y", 0)
            .style("cursor", "pointer")
            .attr("transform", `translate(${bmap.xScale(d.x) + bmap.xScale.bandwidth()/2}, ${bmap.yScale(d.y) + bmap.yScale.step() - 10})`);
        iSymbol.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 5)
            .attr("stroke", "black")
            .attr("fill", "none");
        iSymbol.append("text")
            .attr("x", -3)
            .attr("y", 3)
            .text(d.rank)
            .style("fill", "blank")
            .style("font-size", "10px")
            .style("font-weight", "bold");
        iSymbol.on("mouseover", function() {
            const tooltipData = [
                `<span class="tooltip-key">Independent eQTL</span>: <span class="tooltip-value">${d.tissueId}</span>`,
                `<span class="tooltip-key">Variant Id</span>: <span class="tooltip-value">${d.variantId}</span>`,
                `<span class="tooltip-key">Rank</span>: <span class="tooltip-value">${d.rank}</span>`
            ];
            par.viz.bmap.tooltip.show(tooltipData.join("<br/>"));
            select(this).select("circle").style("stroke-width", 2);
        });
        iSymbol.on("mouseout", function(){
            bmap.tooltip.hide();
            select(this).select("circle").style("stroke-width", 1);
        });
    };
    par.data.indies.eqtl.forEach((d)=>{
        if (bmap.xScale(d.x) && bmap.yScale(d.y)) drawI(d);
    });
}

/**
 * Rendering QTL map of loci and their LD map with an interactive brush for zoom
 * @param par {Plot config object}
 */
function _renderQtlMapWithLD(par=DefaultConfig){
    let bmap = _instantiateQtlDataMap(par);
    if (par.viz.bmap !== undefined){
        bmap.yScale = par.viz.bmap.yScale; // use customized data
    }
    // initial rendering components
    let dim = {
        w:Math.abs(bmap.xScale.range()[1]-bmap.xScale.range()[0]),
        h:Math.abs(bmap.yScale.range()[1]-bmap.yScale.range()[0]),
        top: 0,
        left:0
    };

    bmap.drawSvg(bmap.svg, dim, par.panels.qtlMap.mapType, false, commonFeatures.customizeQTLTooltip, true); // initial rendering of the QTL heat map
    bmap.drawColorLegend(bmap.svg, "Normalized Effect Size (NES)", {x: 0, y: -60}, {w:30, h:5}, [-1, -0.5, -0.2, 0, 0.2, 0.5, 1], "h");
    if (par.panels.qtlMap.mapType == "bubblemap") {
        let dataMax = Math.floor(bmap.rScale.domain()[1]);
        bmap.drawBubbleLegend(bmap.svg, "-log10(p-value)", {x: 500, y: -60}, [dataMax, dataMax/2, dataMax/4, dataMax/8].map((d)=>parseInt(d)).reverse(), 40, "h"); // TODO: remove hard-coded values
    } // TODO: code review and refactoring
    par.viz.bmap = bmap;
    _setQtlClickEvent(par);
    par.viz.ldMap = _renderLdMap(par, bmap.xScale.domain()); // the rendering function returns a callback function for updating the LD map
    _renderGeneStartEndMarkers(bmap, par); // initial rendering of the tss and tes markers
    _brush(par); // initiate and call the brush
}

function _instantiateQtlDataMap(par=DefaultConfig){
    let qtlMapPanel = par.panels.qtlMap; // get panel config
    let qtlMapData = par.data.qtlMap; // get QTL data
    let bmapInWidth = qtlMapPanel.width-(qtlMapPanel.margin.left + qtlMapPanel.margin.right); // calculate the inner width

    // adjust heights based on QTL data
    let ylist = [...new Set(qtlMapData.map((d)=>d.y))];
    const adjustH = ()=>{
        let oldInHeight = qtlMapPanel.height-(qtlMapPanel.margin.top + qtlMapPanel.margin.bottom);
        let newInHeight = ylist.length * qtlMapPanel.rowHeight;
        qtlMapPanel.height = newInHeight + (qtlMapPanel.margin.top + qtlMapPanel.margin.bottom);
        return newInHeight - oldInHeight;
    };

    par.height = par.height + (adjustH());

    // update SVG's <svg> height
    if (par.panels.qtlMap.showColumnLabel)
        select("#"+par.id).select("svg").attr("height", par.height + 80);
    else
        select(`#${par.id}-svg`).attr("height", par.height);

    // rendering the map
    //// remove existing DOM with the same panel ID
    //// Note par.viz.svg is not <svg>, it is a <g>
    par.viz.svg.select("#"+qtlMapPanel.id).remove();

    //// instantiate the object
    let bmap = new DataMap(qtlMapData, qtlMapPanel.colorScheme);

    //// create the root <g> for the map
    bmap.svg = par.viz.svg.append("g")
        .attr("id", qtlMapPanel.id)
        .attr("class", "focus")
        .attr("transform", `translate(${qtlMapPanel.margin.left}, ${qtlMapPanel.margin.top + qtlMapPanel.yPos})`);

    bmap.setScales({w:bmapInWidth, h:ylist.length * qtlMapPanel.rowHeight, top: 0, left:0}, undefined, ylist); // hard setting for the color value range
    bmap.addTooltip("locus-browser", "locus-browser");
    bmap.fullXDomain = bmap.xScale.domain(); // save initial x domain since the active x list might change
    bmap.fullYDomain = bmap.yScale.domain(); // save the initial y domain since the active y list might change

    //-- TSS and TES markers
    let gene = par.data.queryGene;
    _findVariantsClosestToGeneStartEnd(gene, bmap); // NOTE: bmap.fullXDomain is required in this function and bmap.tss, bmap.tes are created and assigned by this function

    return bmap;
}

function _changeQtlMapType(par){
    let bmap = par.viz.bmap;
    let currentZoomDomain = bmap.xScale.domain();
    bmap.xScale.domain(bmap.fullXDomain);
    if(par.panels.qtlMap.mapType=="barmap") {
        bmap.renderBars(bmap.svg, bmap.svg.select(".clippedArea"), false);
        bmap.svg.select("#dataMap-bubble-legend").remove(); // make sure there is no redundant rendering
        bmap.svg.selectAll(".bubble-legend").remove();
    }
    else {
        bmap.renderBubbles(bmap.svg.select(".clippedArea"), [0, 10], true);
        let dataMax = Math.floor(bmap.rScale.domain()[1]);
        bmap.drawBubbleLegend(bmap.svg, "-log10(p-value)", {x: 500, y: -60}, [dataMax, dataMax/2, dataMax/4, dataMax/8].map((d)=>parseInt(d)).reverse(), 40, "h"); // TODO: remove hard-coded values
    }
    bmap.renderWithNewXDomain(bmap.svg, currentZoomDomain, par.panels.qtlMap.mapType);
    const brushRange = brushSelection(select("#miniBrowserBrush").node()); // figure out the current brush range
    select("#miniBrowserBrush").call(par.brush.move, brushRange); // trigger the brush event
    _setQtlClickEvent(par);
}

function _customizeMapColumnLabels(par){
    let bmap = par.viz.bmap;
    bmap.svg.selectAll(".bubble-map-xlabel").remove(); // remove default xlabels of the bubble map
    bmap.svg.selectAll(".bar-map-x-axis").remove(); // remove default xlabels of the bubble map
    bmap.svg.selectAll(".custom-map-x-axis").remove(); // remove default xlabels of the bubble map

    let axis = axisBottom(bmap.xScale).tickSize(0);
    let Y = bmap.yScale.range()[1] + (2*bmap.yScale.step());
    let axisG = bmap.svg.append("g")
        .attr("class", "custom-map-x-axis")
        .attr("transform", `translate(${-bmap.xScale.bandwidth()/2}, ${Y})`)
        .call(axis);
    axisG.select("path").remove(); // remove the axis line

    if (par.panels.qtlMap.showColumnLabel){
        let foundVar = {};

        if (par.selectedVariants!==undefined){
            par.selectedVariants.forEach((v)=>{
                foundVar[v.variantId] = v;
            });
        }
        axisG.selectAll("text")
            .attr("y", -bmap.xScale.bandwidth()/2) // due to 90 degrees rotation, y controls the actual horizontal position
            .attr("x", 0)
            .attr("class", (d, i)=>`custom-map-x-label x${i}`)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("fill", (d)=>foundVar.hasOwnProperty(d)?"red":"black")
            .style("text-anchor", "start")
            .text((d)=>{
                d=d.replace("chr", "");
                let t = d.split("_");
                return t.splice(0, 2).join("_");
            });
    } else {
        axisG.selectAll("text").remove();
    }

    // add variant functional annotation categories
    axisG.selectAll(".tick").append("rect")
        .attr("class", "anno-box")
        .attr("x", 0) // relative to its parent <g>
        .attr("y", -bmap.yScale.bandwidth()*2) // position is relative to its parent <g>
        .attr("rx", 2)
        .attr("width", bmap.xScale.bandwidth())
        .attr("height", bmap.yScale.bandwidth()*0.75)
        .style("fill", (d)=>{
            if (par.data.functionAnnotationDict===undefined) return "none";
            let cats = par.data.functionAnnotationDict[d]; // cats is a list
            if (cats === undefined) return "#ffffff";
            return cats.length == 1?functionAnnotationKeys[cats[0]]:"black";
            
        })
        .style("opacity", 0.5)
        .style("stroke", "#eeeeee")
        .style("stoke-width", 1)
        .on("mouseover", function(d){
            let cats = par.data.functionAnnotationDict[d];
            if (cats !== undefined){
                const tooltipData = [
                    `<span class="tooltip-key">Variant Id</span>: <span class="tooltip-value">${d}</span>`,
                    `<span class="tooltip-key">Annotations</span>: <span class="tooltip-value">${cats.join(", ").replace(/_d/g, "")}</span>`
                ];
                bmap.tooltip.show(tooltipData.join("<br/>"));
                select(this).style("stroke", "#f53956");
            }
        })
        .on("mouseout", function(){
            bmap.tooltip.hide();
            select(this).style("stroke", "#eeeeee");
        });

  
    axisG.append("text")
        .attr("class", "anno-row-label")
        .attr("x", -5)
        .attr("y", -bmap.yScale.bandwidth()*2 + (bmap.yScale.bandwidth()/2))
        .style("fill", "black")
        .style("text-anchor", "end")
        .text("Functional Annotations");

}

/**
 * render variant related genomic tracks
 * @param par
 * @param maxColorValue {Number} set the maximum color value for the color scale to color code the features on the track
 * @returns {MiniGenomeBrowser}
 */
function _renderVariantTracks(par=DefaultConfig, maxColorValue=30){
    let eqtlPanel = par.panels.eqtlTrack;
    let sqtlPanel = par.panels.sqtlTrack;

    // QTL tracks rendering
    _renderFeatureTrack(par, eqtlPanel,par.data.track.eqtl, false, true, maxColorValue);
    const sqtlTrackViz = _renderFeatureTrack(par, sqtlPanel,  par.data.track.sqtl, false, true, maxColorValue);
    return sqtlTrackViz;
}

/**
 * Create the brush on the genomic tracks
 * @param par
 * @private
 */
function _brush(par){
    let gene = par.data.queryGene;
    let bmap = par.viz.bmap;
    let ldMap = par.viz.ldMap;
    let trackViz = par.viz.lastTrack;
    const qtlMapPanel = par.panels.qtlMap;

    const brushPanel = par.panels.sqtlTrack; // TODO: the genomic track that the brush is on may not be the sqtl track
    
    // Define the brush events in a callback function: 
    // redraw all visualizations that are affected by the change of the zoom 
    // callback function parameters: left and right are screen coordinates, xA and xB are genomic coordinates
    const callback = (left, right, xA, xB)=>{
        // re-define the x scale's domain() based on the brush 
        let focusDomain = bmap.fullXDomain.filter((d)=>{
            let pos = parseInt(d.split("_")[1]);
            return pos>=xA && pos<=xB;
        });
        bmap.renderWithNewXDomain(bmap.svg, focusDomain, qtlMapPanel.mapType);

        _renderGeneStartEndMarkers(bmap, par);  // rerender the gene's TSS and TES markers on the bubble map
        commonFeatures.customizeMapRowLabels(bmap, par.data.tissueMap); // rerender the rows text labels
        _customizeMapColumnLabels(par); // rerender the columns text labels
        _renderQtlIndies(par); // rerender the QTLs independent variants
        _renderFoundVariants(par); // rerender found variant markers if any
        // rerender the corresponding LD
        ldMap.svg.selectAll("*").remove();
        ldMap.redraw(focusDomain, focusDomain, bmap.xScale.range()); // range makes sure that the plot dimensions are consistent

        // redraw the connecting lines between the edges of the brush window to the edges of the bubble map
        selectAll(".brushLine").remove();
        select(".brush")
            .append("line")
            .classed("brushLine", true)
            .attr("x1", left)
            .attr("x2", bmap.xScale.range()[0] + qtlMapPanel.margin.left - brushPanel.margin.left)
            .attr("y1",5)
            .attr("y2", par.panels.qtlMap.margin.top-20)
            .style("stroke-width", 1)
            .style("stroke", "#ababab");
        select(".brush")
            .append("line")
            .classed("brushLine", true)
            .attr("x1", right)
            .attr("x2", bmap.xScale.range()[1]+ qtlMapPanel.margin.left - brushPanel.margin.left)
            .attr("y1", 5)
            .attr("y2", par.panels.qtlMap.margin.top-20)
            .style("stroke-width", 1)
            .style("stroke", "#ababab");

    }; 

    let brushConfig = {
        w: par.width/10, // a fraction of the viz's width
        h: 20
    };

    // Create the view brush:
    // A brush is added as the X axis is rendered and appended to the last track of the mini genome browser
    let addBrush = true;
    const brush = MiniGenomeBrowser.renderAxis(trackViz.dom, trackViz.scale, brushPanel.height + 30, addBrush, callback, brushConfig, gene.tss); 
    par.brush = brush;
}

/**
 * LD map parser
 * This parser may change again when the data is queried from the web service
 * @param data {Object} raw LD data
 * @param bmap {DataMap}
 * @param par {config object}
 * @private
 */
function _ldMapDataParserHelper(data){
    let ldData = data.map((d)=>{
        let vars = d[0].split(",");
        return {
            x: vars[0],
            y: vars[1],
            value: Number(d[1]),
            displayValue: Number(d[1]).toPrecision(3)
        };
    });
    const vList = {};
    ldData.forEach((d)=>{
        vList[d.x] = true;
        vList[d.y] = true;
    });
    return ldData.concat(Object.keys(vList).map((v)=>{
        return {
            x: v,
            y: v,
            value: 1,
            displayValue: "1"
        };
    }));
}

/**
 * Render the LD halfmap
 * @param config {Locus Browser Config}
 * @param domain {List} domain for the scales
 * @returns {Halfmap} LD map object
 * @private
 */
function _renderLdMap(par, domain){
    let config = par.ld;
    let data = par.data.ld;
    let ldMap = new HalfMap(data, config.cutoff, false, undefined, config.colorScheme, [0,1]);
    ldMap.addTooltip("locus-browser");

    // LD heat map is rendered in canvas for performance optimization
    let ldCanvas = select(`#${config.id}`).append("canvas")
        .attr("id", config.id + "-ld-canvas")
        .attr("width", config.width)
        .attr("height", config.width)
        .style("position", "absolute");
    let ldContext = ldCanvas.node().getContext("2d");
    ldContext.translate(config.margin.left, config.margin.top);

    // SVG is used to render the cursor's rectangle
    let ldSvg = _createSvg(config.id, config.width, config.width, {top: config.margin.top, left:config.margin.left});
    ldSvg.attr("class", "ld")
        .attr("id", "ldG");

    // render the color legend in the parent node of the ld svg
    const ldSvgParent = select(ldSvg.node().parentNode);
    ldMap.drawColorLegend(ldSvgParent, {x: config.margin.left, y: 100}, 10, "LD");

    // draw the ld map
    const drawConfig = {w: config.width-(config.margin.left+config.margin.right), top: 0, left: 0};
    ldMap.draw(ldCanvas, ldSvg, drawConfig, [0, 1], false, undefined, domain, domain);
    ldMap.saveSvgObj(ldSvg);
    ldMap.saveCanvasObj(ldCanvas);
    ldMap.saveConfig(drawConfig);

    return ldMap;
}

/**
 * Render the neighboring gene list
 * @param {Object} par the viz config 
 */

function _renderNeighborGenes(par=DefaultConfig){
    // data
    par.data.genes = par.data.genes.sort((a, b)=>{
        return a.tss-b.tss; // TSS
    });
    let nb = par.data.genes.map((d)=>d.geneSymbol);

    // visual properties
    let panel = par.panels.geneMap;
    let svg = par.viz.svg;

    // calculate panel dimensions
    let inWidth = panel.width - (panel.margin.left + panel.margin.right);
    if (inWidth == 0) throw "The inner height and width of the GWAS heatmap panel must be positive values. Check the height and margin configuration of this panel";

    // create panel <g> root element
    let mapG = svg.append("g")
        .attr("id", panel.id)
        .attr("transform", `translate(${panel.margin.left}, ${panel.margin.top})`);

    // set the scale
    let scale = scaleBand()
        .domain(nb)
        .range([0, inWidth])
        .padding(.05);

    // render
    let gene = par.data.queryGene;

    mapG.selectAll(".exp-map-xlabel")
        .data(nb)
        .enter()
        .append("text")
        .attr("class", "exp-map-xlabel")
        .attr("x", 0)
        .attr("y", 0)
        .style("text-anchor", "start")
        .style("cursor", "default")
        .style("font-size", (d)=>{
            return d==gene.geneSymbol?14:scale.bandwidth()>10?10:scale.bandwidth();
        })
        .attr("transform", (d)=>{
            let x = scale(d) + 5;
            let y = 0;
            return `translate(${x}, ${y}) rotate(90)`;
        })
        .text((d)=>d);

    // CUSTOMIZATION: highlight the anchor gene
    mapG.selectAll(".exp-map-xlabel")
        .attr("fill", (d)=>d==gene.geneSymbol?"red":"#cccccc")
        .style("cursor", "pointer")
        .on("mouseover", function(d){
            select(this).attr("fill", d==gene.geneSymbol?"red":"#000000");
            selectAll(`.${d}`).style("stroke", "#000000");
        })
        .on("mouseout", function(d){
            let c =  d==gene.geneSymbol?"red":"#cccccc";
            select(this).attr("fill", c);
            selectAll(`.${d}`).style("stroke", c);
        })
        .on("click", (d)=>{
            // clear all visual panels
            select(`#${par.infoId}`).selectAll("*").remove(); // clear any previous contents
            select(`#${par.id}`).selectAll("*").remove();
            select(`#${par.ld.id}`).selectAll("*").remove();
            $("#geneInput").val(d);
            $("#variantInput").val("");
        
            // render data of the new gene
            init(d, par); 
        });
    return scale;
}

/**
 * Render the Gene Heatmap
 * @param par {Object} the viz DefaultConfig
 * @returns {Heatmap}
 * Currently not in use
 */
// function _renderGeneHeatmap(par=DefaultConfig){
//     // data
//     let gene = par.data.queryGene;
//     let data = par.data.gwasToGene;

//     // visual properties
//     let panel = par.panels.geneMap;
//     let svg = par.viz.svg;

//     // calculate panel dimensions
//     let inWidth = panel.width - (panel.margin.left + panel.margin.right);
//     let inHeight = panel.height - (panel.margin.top + panel.margin.bottom);
//     if (inWidth * inHeight <= 0) throw "The inner height and width of the GWAS heatmap panel must be positive values. Check the height and margin configuration of this panel"

//     // create panel <g> root element
//     let mapG = svg.append("g")
//         .attr("id", panel.id)
//         .attr("transform", `translate(${panel.margin.left}, ${panel.margin.top})`);

//     // instantiate a Heatmap object
//     let tooltipId = "locus-browser-tooltip";
//     let hViz = new Heatmap(data, panel.useLog, 10, panel.colorScheme, panel.cornerRadius, tooltipId, tooltipId);

//     // render
//     hViz.draw(mapG, {w:inWidth, h:inHeight}, panel.columnLabel.angle, false, panel.columnLabel.adjust);
//     hViz.drawColorLegend(mapG, {x: 20, y:-20}, 5);

//     // CUSTOMIZATION: highlight the anchor gene
//     mapG.selectAll(".exp-map-xlabel")
//         .attr("fill", (d)=>d==gene.geneSymbol?"red":"#dddddd")
//         .style("cursor", "pointer")
//         .on("click", (d)=>{
//             // clear all visual panels
//             select(`#${par.infoId}`).selectAll("*").remove(); // clear any previous contents
//             select(`#${par.id}`).selectAll("*").remove();
//             select(`#${par.ld.id}`).selectAll("*").remove();
//             init(d, par); // render data of the new gene
//         });
//     hViz.svg = mapG;
//     return hViz
// }

/**
 * Render a feature track
 * @param par {Plot Config}
 * @param panel {Object} of the panel, by default, it's defined in CONFIG
 * @param data {List} panel's data
 * @param showWidth {Boolean} render the feature's width
 * @param useColorScale {Boolean} whether the color of the features should use a color scale
 * @param maxColorValue {Numnber} defines the maximum color value when useColorScale is true
 * @returns {MiniGenomeBrowser}
 */
function _renderFeatureTrack(par=DefaultConfig.panels, panel=DefaultConfig.panels.tssTrack, data, showWidth, useColorScale=false, maxColorValue=undefined){

    let centerPos = par.data.queryGene.tss;
    let svg = par.viz.svg;
    let window = par.genomicWindow;

    // preparation for the plot
    let inWidth = panel.width - (panel.margin.left + panel.margin.right);
    let inHeight = panel.height - (panel.margin.top + panel.margin.bottom);
    let trackG = svg.append("g")
        .attr("id", panel.id)
        .attr("transform", `translate(${panel.margin.left}, ${panel.margin.top + panel.yPos})`);

    let featureViz = new MiniGenomeBrowser(data, centerPos, window);
    featureViz.render(
        trackG,
        inWidth,
        inHeight,
        showWidth,
        panel.label,
        panel.color.background,
        panel.color.feature,
        useColorScale,
        maxColorValue
    );
    featureViz.svg = trackG;
    return featureViz;

}

/**
 * Find the closest left-side variant of the gene start and end sites (tss and tes)
 * This function creates two new attributes, tss and tes, for bmap
 * @param gene {Object} that has attributes start and end
 * @param bmap {DataMap}
 */
function _findVariantsClosestToGeneStartEnd(gene, bmap) {
    let tss = gene.strand == "+" ? gene.start : gene.end;
    let tes = gene.strand == "+" ? gene.end : gene.start;
    let variants = bmap.fullXDomain;
    const findLeftSideNearestNeighborVariant = (site) => {
        return variants.filter((d, i) => {
            // if the variant position is the site position
            let pos = parseFloat(d.split("_")[1]); // assumption: the variant ID has the genomic location
            if (pos === site) return true;

            // else find where the site is located
            // first, get the neighbor variant
            if (variants[i + 1] === undefined) return false;
            let next = parseFloat(variants[i + 1].split("_")[1]) || undefined;
            return (pos - site) * (next - site) < 0; // rationale: the value would be < 0 when the site is located between two variants.
        });
    };

    let tssVariant = findLeftSideNearestNeighborVariant(tss);
    let tesVariant = findLeftSideNearestNeighborVariant(tes);
    bmap.tss = tssVariant[0]; // bmap.tss stores the closest left-side variant of the start site
    bmap.tes = tesVariant[0]; // bmap.tes stores the closest left-side variant of the end site
}

/**
 * Render the TSS and TES of the Gene if applicable
 * @param bmap {DataMap}
 * @param bmapSvg {D3} the SVG object of the bubble map
 */
function _renderGeneStartEndMarkers(bmap){
    // rendering TSS
    let dom = bmap.svg;
    if (select("#siteMarkers").empty()){
        let g = dom.append("g").attr("id", "siteMarkers");
        if (bmap.tss && bmap.xScale(bmap.tss)){
            let tssMarker = g.append("g")
                .attr("id", "tssMarker")
                .attr("transform", ()=>{
                    const X = bmap.xScale(bmap.tss) + bmap.xScale.bandwidth();
                    return `translate(${X}, -10)`;
                });

            tssMarker.append("line")
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", 0)
                .attr("y2", bmap.yScale.range()[1])
                .style("stroke", "#94a8b8")
                .style("stroke-width", 2);
            tssMarker.append("text")
                .text("TSS")
                .attr("x", -bmap.xScale.bandwidth()/2)
                .attr("y", -2)
                .attr("text-anchor", "center")
                .style("font-size", "12px");
        }

        if (bmap.tes && bmap.xScale(bmap.tes)){
            let tesMarker = g.append("g")
                .attr("id", "tesMarker")
                .attr("transform", ()=>{
                    const X = bmap.xScale(bmap.tes) + bmap.xScale.bandwidth();
                    return `translate(${X}, -10)`;
                });

            tesMarker.append("line")
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", 0)
                .attr("y2", bmap.yScale.range()[1])
                .style("stroke", "#748797")
                .style("stroke-width", 2);
            tesMarker.append("text")
                .text("TES")
                .attr("x", -bmap.xScale.bandwidth()/2)
                .attr("y", -2)
                .attr("text-anchor", "center")
                .style("font-size", "12px");
        }
    } else {
        if (bmap.xScale(bmap.tss)){
            select("#tssMarker")
                .attr("transform", ()=>{
                    const X = bmap.xScale(bmap.tss) + bmap.xScale.bandwidth();
                    return `translate(${X}, -10)`;
                })
                .attr("visibility", "visible");
        } else {
            select("#tssMarker")
                .attr("visibility", "hidden");
        }

        if (bmap.xScale(bmap.tes)){
            select("#tesMarker")
                .attr("transform", ()=>{
                    const X = bmap.xScale(bmap.tes) + bmap.xScale.bandwidth();
                    return `translate(${X}, -10)`;
                })                
                .attr("visibility", "visible");
        } else {
            select("#tesMarker")
                .attr("visibility", "hidden");
        }
    }
}

/*********************/
const GlobalWidth = window.innerWidth;

const DefaultConfig = {
    id: "locus-browser",
    ldId: "ld-browser",
    width: GlobalWidth,
    height: null, // should be dynamically calculated
    genomicWindow: 1e6,
    data: data,
    urls: dataUrls,
    panels: {
        geneMap: {
            id: "gene-map",
            data: null,
            useLog: true,
            logBase: null,
            margin: {
                top: 0, // provide enough space for the color legend
                right: 100, // provide enough space for the row labels
                bottom: 0, // provide enough space for the column labels
                left: 80
            },
            width: GlobalWidth,
            height: 100, // outer height: this includes top and bottom margins + inner height
            colorScheme: "YlGnBu",
            cornerRadius: 2,
            columnLabel: {
                angle: 90,
                adjust: 10
            },
            rowLabel: {
                width: 100
            }
        },
        tssTrack: {
            id: "tss-track",
            label: "TSS location",
            data: null,
            yPos: null, // where the panel should be placed to be calculated based on the panel layout
            margin: {
                top: 50,
                right: 50,
                bottom: 0,
                left: 80
            },
            width: GlobalWidth,
            height: 70, // outer height=inner height + top margin + bottom margin
            color: {
                background: "#ffffff",
                feature: "#ababab"
            }
        },
        geneModelTrack: {
            id: "gene-model-track",
            label: "Gene model",
            yPos: null,
            margin: {
                top: 0,
                right: 50,
                bottom: 10,
                left: 80
            },
            width: GlobalWidth,
            height: 30,
            color: {
                background: "#ffffff",
                feature: "#910807"
            }
        },
        eqtlTrack: {
            id: "eqtl-track",
            label: "eQTL summary",
            data: null,
            yPos: null,
            margin: {
                top: 0,
                right: 50,
                bottom: 0,
                left: 80
            },
            width: GlobalWidth,
            height: 20, // outer height. outer height=inner height + top margin + bottom margin.
            color: {
                background: "#ffffff",
                feature: "#ababab"
            }

        },
        sqtlTrack: {
            id: "sqtl-track",
            label: "sQTL summary",
            data: null,
            yPos: null,
            margin: {
                top: 0,
                right: 50,
                bottom: 0,
                left: 80
            },
            width: GlobalWidth,
            height: 20, // outer height. outer height=inner height + top margin + bottom margin.
            color: {
                background: "#ffffff",
                feature: "#ababab"
            }
        },

        qtlMap: {
            id: "qtl-map", // the bubble heat map of QTLs
            width: GlobalWidth,
            data: null,
            yPos: null,
            margin: {
                top: 100, // provide space for the genome position scale
                right: 100,
                bottom: 120, // provide space for the column labels
                left: 200
            },
            height: 500,
            colorScheme: "RdBu",
            colorScaleDomain: [-1, 1],
            useLog: false,
            logBase: null,
            label: {
                column: {
                    show: true,
                    angle: 90,
                    adjust: 10,
                    location: "bottom",
                    textAlign: "left"
                },
                row: {
                    show: true,
                    width: 150,
                    angle: 0,
                    adjust: 0,
                    location: "left",
                    textAlign: "right"
                }
            }
        }
    },
    ld: { // LD configuration is separate from the panels because it's in its own DIV and is rendered using canvas.
        id: "ld-browser",
        data: [],
        cutoff: 0.1,
        width: GlobalWidth,
        margin: {
            top: 10,
            right: 100,
            bottom: 0,
            left: 200
        },
        colorScheme: "Greys"
    }
};

