/* eslint-disable no-prototype-builtins */
/**
 * Copyright © 2015 - 2019 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
"use strict";
import $ from "jquery";

import {json} from "d3-fetch";
import {max} from "d3-array";
import {select} from "d3-selection";

import {checkDomId} from "../utils/dom-utils";
import Heatmap from "./Heatmap";
import DataMap from "./DataMap";

import MiniGenomeBrowser from "./MiniGenomeBrowser";
import * as dataUtils from "./LocusBrowserDataUtils";
import * as commonFeatures from "./LocusBorwserCommonFeatures";
import Variant from "../models/Variant";
import * as GTExTissues from "../models/GTExTissues";

import {RetrieveAllPaginatedData} from "../utils/pagination";

const GlobalWidth = window.innerWidth;
let visConfig = {
    "eGeneBrowserTrack": {
        trans: {x: 0, y: -20},
        id: "egene-browser-track"
    },
    "variantBrowserTrack": {
        trans: {x: 0, y: 20}, // translation
        id: "variant-browser-track"
    },
    "ldHeatmap": {
        trans: {x: 0, y: 80},
        id: "ld-heatmap"
    },
    "gwasHeatmap": {
        trans: {x: 0, y: 100},
        id: "gwas-heatmap"
    },
    "funcAnnoHeatmap": {
        trans: {x: 0, y: 110},
        id: "func-anno-heatmap"
    },
    "qtlBubbleMap": {
        trans: {x: 0, y: 145},
        rowH: undefined,
        genes: [],
        filters: {
            tissue: undefined,
            // type: new Set(["eQTL", "sQTL"])
            type: new Set(["eQTL"])
        },
        opacity: 1,
        showFineMap: false,
    },
    "tissueMap": {}
};

export function setShowFineMapConfig(show){
    visConfig.qtlBubbleMap.showFineMap = show;
}

export function setDimBubbleConfig(value){
    visConfig.qtlBubbleMap.opacity = value;
}

/**
 * Render LocusBrowserVC
 * @param {String} domId the parent DOM ID for the plot 
 * @param {Variant} variant the query variant 
 * @param {Object[]} variants of variant objects 
 * @param {Object[]} ldBlock of variant objects in the query variant's ldBlock
 * @param {Gene[]} eGenes (and sGenes) of the query variant
 * @param {List[]} args plot data: args[0]: functional annotation, args[1]: GWAS categories, args[2]: eQTLs
 * @param {Object} url API endpoints
 */
export function render(domId, variant, variants, ldBlock, eGenes, args, url){
    // preparation steps
    $(`#${domId}`).empty();
    _resetQTLConfig();
    const funcAnno = args[0]; // functional annotation data
    const gwasCat = args[1]; // GWAS categories
    visConfig.tissueMap = dataUtils.parseTissueInfo(args[2]);
    /***** data transformation */
    const vlist = _parseVariants(variant, variants, ldBlock);
    const closestEGene = dataUtils.getClosest(eGenes, variant.pos);

    /***** viz rendering */
    // create the parent SVG D3 object
    const svg = _createSvg(domId, GlobalWidth, 1500, {left: 180, top: 80});

    // mini browser
    const mgb = _renderMiniGenomeBrowser(svg, vlist, variant.pos, visConfig.variantBrowserTrack.trans, visConfig.variantBrowserTrack.id); // this renders the variants on a genome browser
    
    // eGenes
    const adjustY = ()=>{
        // adjust and update all bubble map plots' Y position
        let Y = visConfig.qtlBubbleMap.trans.y;
        visConfig.qtlBubbleMap.genes.forEach((g, i)=>{
            const plotId = g.id+"-qtl";
            if (i > 0) {
                let previous = visConfig.qtlBubbleMap.genes[i-1];
                Y += previous.bubbleMapH+30;
            }
            select(`#${plotId}`).attr("transform", `translate(${visConfig.qtlBubbleMap.trans.x}, ${Y})`);
        });
    };
    const updateBubbleMapConfig = (d, h)=>{ // d is a Gene object
        d.bubbleMapH = h; // store the bubble map height of the gene
        visConfig.qtlBubbleMap.genes.push(d);
        // adjust root svg height to accommodate new data
        const root = select(`#${domId}-svg`);
        const oldH = parseInt(root.attr("height"));
        root.attr("height", d.bubbleMapH+oldH);
        adjustY();
    };
    const eGeneBrowserTrackClickEvent = function(d){ // d is a Gene object
        const gId = d.id+"-qtl";
        const found = visConfig.qtlBubbleMap.genes.map((g,i)=>{g.index = i; return g;})
            .filter((g)=>{return g.gencodeId==d.gencodeId;});
            
        // click event is dependent on whether the gene QTL map is in view
        if (found.length > 0){ // if so, remove the gene
            visConfig.qtlBubbleMap.genes.splice(found[0].index, 1);
            select(`#${gId}`).remove();
            // change the gene label styling on the mini genome browser
            select(this).select("text").attr("font-size", 8); // TODO: use class to toggle the styling
            select(this).select("text").attr("fill", "DarkSlateGray");

            // adjust the SVG height
            const root = select(`#${domId}-svg`); // Note: the variable svg is a <g> in the root 
            const oldH = parseInt(root.attr("height"));
            root.attr("height", oldH-d.bubbleMapH);
            adjustY();
        } else { // if not, show the gene
            // passing in updateBubbleMapConfig as a callback as a way to handle ajax call
            let callback = updateBubbleMapConfig;
            _renderQTLBubbleMap(url, domId, svg, vlist, variant, d, callback, visConfig.qtlBubbleMap.trans, gId, visConfig.qtlBubbleMap.rowH, false, visConfig.qtlBubbleMap.opacity, visConfig.qtlBubbleMap.showFineMap);
            select(this).select("text").attr("font-size", 12);
            select(this).select("text").attr("fill", "#178A7F");
        }
        
    };
    _renderEGenesBrowserTrack(svg, variant.pos, mgb, eGenes, closestEGene.gencodeId, eGeneBrowserTrackClickEvent, visConfig.eGeneBrowserTrack.trans, visConfig.eGeneBrowserTrack.id);

    // LD 1D heatmap
    const ldhp = _renderLDHeatMap(svg, vlist, variant.varId, visConfig.ldHeatmap.trans, visConfig.ldHeatmap.id);
    _customizeLD(svg, vlist, variant.varId, mgb, ldhp);

    // GWAS catalog 1D heatmap
    _renderGWASHeatMap(svg, vlist, variant, gwasCat, visConfig.gwasHeatmap.trans, visConfig.gwasHeatmap.id);

    // Functional annotation 1D heatmap
    _renderFuncAnnoHeatMap(svg, vlist, variant.varId, funcAnno, visConfig.funcAnnoHeatmap.trans, visConfig.funcAnnoHeatmap.id);

    // QTL
    visConfig.qtlBubbleMap.rowH = Math.ceil(ldhp.xScale.bandwidth())<10?10:Math.ceil(ldhp.xScale.bandwidth()); // set the row height the same has the column width, so that the bubbles are circles
    select(`#${closestEGene.id}`).dispatch("click");

    // data filtering events
    _defineTissueFiltering();
}

function _resetQTLConfig(){
    visConfig.qtlBubbleMap.rowH = undefined;
    visConfig.qtlBubbleMap.genes = [];
}

function _defineTissueFiltering(){
    // modal related UI events
    const dataTypeFilter = ()=>{
        let dataTypeInputs = document.getElementsByName("dataType");
        let dataTypes = [];
        dataTypeInputs.forEach((d)=>{
            if (d.checked) dataTypes.push(d.value);
        });
        visConfig.qtlBubbleMap.filters.type = new Set(dataTypes);
    };
    const tissueSiteFilter = ()=>{
        let tissueSiteInputs = document.getElementsByName("tissueSite");
        let sites = [];
        tissueSiteInputs.forEach((d)=>{
            if (d.checked) sites.push(d.value);
        });
        visConfig.qtlBubbleMap.filters.tissue = new Set(sites);
    };
    const filter = ()=>{
        const genes = visConfig.qtlBubbleMap.genes.map((g)=>g);
        dataTypeFilter();
        tissueSiteFilter();
        // delete all QTL maps in view
        genes.forEach((g)=>{
            select(`#${g.id}`).dispatch("click"); // delete
        });

        // re-render all QTL maps in view
        genes.forEach((g)=>{
            select(`#${g.id}`).dispatch("click"); // re-render
        });
    };
    select("#modal-close-btn").on("click", filter);
    select("#modal-filter-btn").on("click", filter);
}

/**
 * Parse the query variant's ID to generate a LD lookup table
 * @param {Object} qVariant 
 * @param {Object[]} ld a list of variants in the qVariant's LD with attributes: snpId1, snpId2, rSquared
 * @returns {Object} LD lookup table indexed by variant ID
 */
function _parseLD(qVariant, ld){
    let newList = ld.map((d)=>{
        return {
            varId: d[0],
            rSquared: parseFloat(d[1])
        };
    });
    // build the look up table
    let ldBlockLookup = {};
    newList.forEach((d)=>{
        ldBlockLookup[d.varId] = d;
    });
    return ldBlockLookup;
}

/**
 * Parse the variants and returns a new list of Variant objects
 * @param {Variant} qVariant the query variant with attributes: varId, chromosome, pos
 * @param {Object[]} vars a list of variants to render
 * @param {Object[]} ldBlock a list of LD variants in the query variant's LD 
 * @returns {Variant[]} a list of Variant objects
 */
function _parseVariants(qVariant, vars, ldBlock){
    let ldLookup = _parseLD(qVariant, ldBlock);
    let newList = vars.map((d)=>{
        let varId = d.varId||d.variantId; 
        let pos = d.pos||d.varId.split("_")[1];
        let chromosome = d.chromosome||d.varId.split("_")[0];

        let v = new Variant(varId, chromosome, pos);

        // assign variant plot value to the LD r-squared
        let value = v.varId==qVariant.varId?1:ldLookup.hasOwnProperty(v.varId)?ldLookup[v.varId].rSquared:0;
        v.setValue(value);

        // x and y attributes for visualization--the LD 1D heat map
        v.setCoord({x:varId, y:"LD"});
        return v;
    }).sort((a, b)=>{
        return a.pos-b.pos;
    });
   
    return newList;
}

/**
 * Customize the LD 1D heatmap
 *  - Add connecting lines from the mini genome browser to the LD 1D heatmap
 *  - Highlight the query variant in red
 * @param {D3 svg object} svg the parent D3 object for this plot
 * @param {Variant[]} vlist of variant objects 
 * @param {String} varId the query variant ID
 * @param {MiniGenomeBrowser} mgb 
 * @param {Heatmap} hp the LD 1D heatmap object
 */
function _customizeLD(svg, vlist, varId, mgb, hp){
    const g = svg.append("g")
        .attr("id", "ld-line")
        .attr("transform", "translate(0, 80)");
    g.selectAll(".connect")
        .data(vlist)
        .enter()
        .append("line")
        .attr("class", "connect")
        .attr("x1", (d)=>mgb.scale(d.pos)) // use the MiniGenomeBrowser object's position scale
        .attr("x2", (d)=>hp.xScale(d.varId))
        .attr("y2", 0)
        .attr("y1", -25)
        .style("stroke", (d)=>{
            return d.varId==varId?"red":d.value==0?"#cccccc":hp.colorScale(d.value);
        })
        .style("stroke-width", (d)=>{return d.varId==varId?1:0.3;});

    svg.selectAll(".minibrowser-feature")
        .style("fill", (d)=>d.varId==varId?"red":d.value==0?"#cccccc":hp.colorScale(d.value));
}

/**
 * Render a mini genome browser
 * @param {D3 selection} svg D3 selection 
 * @param {Variant[]} vlist a list of variants
 * @param {Number} pos the query variant's position
 * @param {Object{x:Number,y:Number}?} trans translate the viz to {x:xpos, y:ypos}
 * @param {String?} id the <g> ID for the mini genome browser
 * @returns MiniGenomeBrowser
 * @private
 */
function _renderMiniGenomeBrowser(svg, vlist, pos, trans={x:0, y:20}, id="variant-browser-track"){
    const window = Math.ceil(max(vlist.map(d=>{return Math.abs(d.pos-pos);}))/1000)*1000; // adjust the window to make it symmetrical on both sides (i.e. centering at the query position)
    let g = svg.append("g")
        .attr("id", id)
        .attr("transform", `translate(${trans.x}, ${trans.y})`);

    let miniGenomeBrowser = new MiniGenomeBrowser(vlist, pos, window);
    miniGenomeBrowser.render(g, GlobalWidth*0.85, 50, false, "Variants", "#ffffff", "steelblue");
    MiniGenomeBrowser.renderAxis(g, miniGenomeBrowser.scale, 20, false, null, {w:100, h:20}, pos, "top");
    g.select("#miniBrowserAxis")
        .selectAll("text")
        .text((d)=>{return ((parseInt(d)-pos)/1000).toString() + "k";});
    return miniGenomeBrowser;
}

/**
 * Render the query variant's LD block in a 1D heat map
 * @param {D3 selection} svg D3 selection
 * @param {Variant[]} vlist a list of variant objects
 * @param {String} variant query variant ID 
 * @param {Object{x:Number, y:Number}?} trans
 * @param {String} id
 * @returns Heatmap
 */
function _renderLDHeatMap(svg, vlist, varId, trans, id){
    let heatMap = new Heatmap(vlist, false, 1, "Blues");
    let g = svg.append("g")
        .attr("id", id)
        .attr("transform", `translate(${trans.x}, ${trans.y})`);

    heatMap.draw(g, {w:GlobalWidth*0.85, h:10}, 90, true, 0, 0, "left");
    
    // add click event
    g.selectAll(".exp-map-cell")
        .on("mouseover", function(d){
            select(this).style("stroke", "cyan")
                .style("stroke-width", 1)
                .style("cursor", "pointer");
            const tooltipData = [
                "<span class=\"tooltip-head\">LD</span>",
                `<span class="tooltip-key">Variant</span>: <span class="tooltip-value">${d.x}</span>`,
                `<span class="tooltip-key">R-squared</span>: <span class="tooltip-value">${d.displayValue}</span>`,
                "<span>Click the cell to recenter the visualization</span>"
            ];
            heatMap.tooltip.show(tooltipData.join("<br/>"));
        })
        .on("mouseout", function(){
            select(this).style("stroke", "none").style("cursor", "auto");
            heatMap.tooltip.hide();
        })
        .on("click", (d)=>{
            LocusBrowserVC.init(d.x);
        });
    // highlight the query variant

    g.selectAll(".exp-map-cell")
        .filter((d)=>d.x==varId)
        .style("stroke", "red")
        .style("stroke-width", 1);
       
 
    g.selectAll(".exp-map-xlabel").remove();
    return heatMap;
}

/**
 * Render the 1D GWAS catelog heat map
 * @param {D3 selection} svg 
 * @param {Variant[]} vlist 
 * @param {Variant} variant 
 * @param {Object[]} data: GWAS catelog data
 * @param {Object{x:Number, y:Number}?} trans
 * @param {String} id
 */
function _renderGWASHeatMap(svg, vlist, variant, data, trans={x:0, y:100}, id="gwas-heatmap"){
    let posSet = new Set(vlist.map((d)=>d.pos));
    let gwasCatDict = {};

    // Filter the GWAS catalog based on vlist
    data.filter((d)=>{
        return d.chromosome==variant.chromosome && posSet.has(parseInt(d.start));
    }).forEach((d)=>{
        if (!gwasCatDict.hasOwnProperty(d.start)) gwasCatDict[d.start] = new Set();
        gwasCatDict[d.start].add(d["phenotype"]);
    });
    
    const gwasList = vlist.map((d)=>{
        return {
            x: d.varId,
            y: "GWAS catalog",
            value: 0,
            displayValue: !gwasCatDict.hasOwnProperty(d.pos)?"":[...gwasCatDict[d.pos]].join(","),
            color: !gwasCatDict.hasOwnProperty(d.pos)?"white":"steelblue",
            stroke: "lightgrey"
        };
    });

    // TODO: code refactoring
    const gwasMap = new Heatmap(gwasList, false);
    let g= svg.append("g")
        .attr("id", id)
        .attr("transform", `translate(${trans.x}, ${trans.y})`);

    gwasMap.draw(g, {w:GlobalWidth*0.85, h:10}, 90, false, 0, 0, "left");
    
    // add click event
    g.selectAll(".exp-map-cell")
        .on("mouseover", function(d){
            select(this).style("stroke", "cyan");
            const displayValue = d.displayValue == ""?"NA":d.displayValue;
            const tooltipData = [
                "<span class=\"tooltip-head\">GWAS Catalog</span>",
                `<span class="tooltip-key">Variant</span>: <span class="tooltip-value">${d.x}</span>`,
                `<span class="tooltip-key">Catalogs</span>: <span class="tooltip-value">${displayValue}</span>`
            ];

            gwasMap.tooltip.show(tooltipData.join("<br/>"));
        })
        .on("mouseout", function(){
            select(this).style("stroke", "lightgrey");
            gwasMap.tooltip.hide();
        });

    g.selectAll(".exp-map-cell")
        .style("opacity", 0.5)
        .filter((d)=>d.x==variant.varId)
        .style("stroke", "red")
        .style("stroke-width", 1);

    g.selectAll(".exp-map-xlabel").remove();

    return gwasMap;
}

/**
 * Render the functional annotation 1D heat map
 * @param {D3 selection} svg 
 * @param {Variant[]} vlist 
 * @param {String} varId 
 * @param {Object[]} data Functional Annotation
 * @param {Object{x:Number, y:Number}?} trans
 * @param {String} id
 * @returns Heatmap: functional annotation
 */
function _renderFuncAnnoHeatMap(svg, vlist, varId, data, trans={x: 0, y:110}, id="fa-heatmap"){
    const funcAnnoDict = dataUtils.getVariantFunctionalAnnotations(data);
    const funcList = vlist.map((d)=>{
        const cats = funcAnnoDict[d.varId]==undefined?[]:funcAnnoDict[d.varId];
        dataUtils.annoCatDict;
        return {
            x: d.x,
            y: "Func Annot",
            value: 0,
            displayValue: cats.join(","),
            color: cats.length==0?"white":(cats.length==1?dataUtils.annoCatDict[cats[0]]:"black"),
            stroke: "lightgrey"
        };
    });
    const funcMap = new Heatmap(funcList, false);
    let g= svg.append("g")
        .attr("id", id)
        .attr("transform", `translate(${trans.x}, ${trans.y})`);
    funcMap.draw(g, {w:GlobalWidth*0.85, h:10}, 90, false, 0, 0, "left");
    
    // add click event
    g.selectAll(".exp-map-cell")
        .on("mouseover", function(d){
            select(this).style("stroke", "cyan");
            const displayValue = d.displayValue == ""?"NA":d.displayValue;
            const tooltipData = [
                "<span class=\"tooltip-head\">Functional Annotations</span>",
                `<span class="tooltip-key">Variant</span>: <span class="tooltip-value">${d.x}</span>`,
                `<span class="tooltip-key">Functions</span>: <span class="tooltip-value">${displayValue}</span>`
            ];
            funcMap.tooltip.show(tooltipData.join("<br/>"));
        })
        .on("mouseout", function(){
            select(this).style("stroke", "lightgrey");
            funcMap.tooltip.hide();
        });


    g.selectAll(".exp-map-cell")
        .style("opacity", 0.5)
        .filter((d)=>d.x==varId)
        .style("stroke", "red")
        .style("stroke-width", 1);
    
    g.selectAll(".exp-map-xlabel").remove();

    return funcMap;
}

/**
 * 
 * @param {D3 selection} svg 
 * @param {Variant[]} vlist 
 * @param {Variant} variant
 * @param {Gene} gene
 * @param {Function} callback: function to run after ajax
 * @param {Object{x:Number, y:Number}?} trans
 * @param {String} id
 * @param {Number} cellH cell height
 * @param {Boolean} showXLab
 * @param {Number} opacity
 * @param {Boolean} showFineMap
 */
function _renderQTLBubbleMap(url, domId, svg, vlist, variant, gene, callback, trans={x: 0, y:145}, id="eqtl-bubble-map",cellH=12, showXLab=false, opacity=1, showFineMap=false){
    
    let g= svg.append("g")
        .attr("id", id)
        .attr("class", "qtl-map")
        .attr("transform", `translate(${trans.x}, ${trans.y})`);
    
    const renderMap = (geneLabel, dataset, dapg)=>{
        const qtlMap = new DataMap(dataset, "RdBu");
        qtlMap.addTooltip(domId, `${domId}-tooltip`);

        const calculateH = ()=>{
            const tSet = new Set(dataset.map((d)=>d.y));
            let H = cellH*tSet.size; 
            return H;
        };
        const dim = {w:GlobalWidth*0.85, h:calculateH(), top:0, left: 0};
        qtlMap.setScales(dim, vlist.map((d)=>d.varId), undefined);
        qtlMap.drawSvg(g, dim, "bubbleNoClip", false, commonFeatures.customizeQTLTooltip, true, [0, 15]);
        
        // customization
        g.selectAll(".map-bubble")
            .attr("opacity", opacity);

        // fine-mapping markers
        let fmap = g.selectAll(".fine-map")
            .data(dapg)
            .enter()
            .filter((d)=>qtlMap.yScale("eQTL-"+d.y)!==undefined&&qtlMap.xScale(d.varId)!==undefined)
            .append("g")
            .classed("fine-map", true)
            .style("display", showFineMap?"block":"none");

        const fmapSetColors = ["#1e1d1f", "#ebbf23","#3698d1", "#a1b3cd", "#c8cda1",  "#cda1bb", "#b7a1cd", "#5eccb0","#d1bf36"]; //Note: limited number of colors!

        const rx = qtlMap.xScale.bandwidth()/2;
        const ry = qtlMap.yScale.bandwidth()/2;
        const r = rx>ry?ry:rx;
        fmap.append("circle")
            .attr("cx", (d)=>qtlMap.xScale(d.varId)+rx||0)
            .attr("cy", (d)=>qtlMap.yScale("eQTL-"+d.y)+ry||0)
            .attr("r", r)
            .attr("stroke", (d)=>fmapSetColors[parseInt(d.setId)-1])
            .attr("stroke-width", (d)=>r*d.value<0.5?0.5:r*d.value)
            .attr("fill", "none");

        g.append("text")
            .text(geneLabel + " QTLs")
            .attr("x", 0)
            .attr("y", -2)
            .style("text-anchor", "end")
            .style("font-size", 16);

        g.selectAll(".map-grid-vline")
            .filter((d)=>d==variant.varId)
            .style("stroke-width", qtlMap.xScale.bandwidth())
            .style("stroke", "#f5f5f5");

        if (showXLab){
            g.selectAll(".bar-map-x-label")
                .filter((d)=>d==variant.varId)
                .style("font-weight", 800)
                .style("z-index", 1000)
                .style("opacity", 0.5);

        } else {
            g.selectAll(".bar-map-x-label").remove();
        }
        qtlMap.svg = g;
        commonFeatures.customizeMapRowLabels(qtlMap, visConfig.tissueMap);
        return dim.h;
    };
    
    // render QTL bubble map of the closest gene
    const eqtlUrl = url.geneEqtl(gene.gencodeId);
    const sqtlUrl = url.geneSqtl(gene.gencodeId);
    const fineMapUrl = url.fineMap(gene.gencodeId);
    const promises = [
        RetrieveAllPaginatedData(eqtlUrl, 1000),
        RetrieveAllPaginatedData(sqtlUrl, 1000),
        RetrieveAllPaginatedData(fineMapUrl, 1000)
    ];
    Promise.all(promises)
        .then((args)=>{
            let qtls = [];
            if (visConfig.qtlBubbleMap.filters.type.has("eQTL")){
                const eqtls = dataUtils.getQtlMapData(args[0]);
                qtls = qtls.concat(eqtls);
            }
            if (visConfig.qtlBubbleMap.filters.type.has("sQTL")){
                const sqtls = dataUtils.getQtlMapData(args[1], "singleTissueSqtl", "sQTL");
                qtls = qtls.concat(sqtls);
            }

            // tissue filtering
            if (visConfig.qtlBubbleMap.filters.tissue!==undefined){
                qtls = qtls.filter((q)=>{
                    let check = q.tissueSiteDetailAbbr;
                    return visConfig.qtlBubbleMap.filters.tissue.has(check);
                });
            }

            // fine-mapping data
            const parseFineMap = (data)=>{
                const tissueTable = GTExTissues.tissueTable();

                return data.map((d)=>{
                    return {
                        tissueId: d.tissueSiteDetailId,
                        varId: d.variantId,
                        prop: d.pip,
                        setId: d.setId,
                        setSize: d.setSize,
                        x: d.variantId,
                        y: tissueTable[d.tissueSiteDetailId].tissueSiteDetailAbbr,
                        value: d.pip
                    };
                });
            };
            const fMap = parseFineMap(args[2]);
            const h = renderMap(gene.geneSymbol, qtls, fMap);
            callback(gene, h);
        });
}

/**
 * Render eGenes and sGenes on the mini genome browser
 * @param {D3 selection} svg 
 * @param {Number} pos of the query variant 
 * @param {MiniGenomeBrowser} miniGenomeBrowserTrack of the LD
 * @param {Gene[]} eGenes 
 * @param {String} gencodeId to be highlighted
 * @param {Function} click 
 * @param {Object{x:Number, y:Number}?} trans
 * @param {String?} id
 */
function _renderEGenesBrowserTrack(svg, pos, miniGenomeBrowser, eGenes, gencodeId, click, trans={x:0, y:-20}, id="egene-browser-track"){
    // render the egenes as a mini browser track
    const window = miniGenomeBrowser.window;
    let egeneG = svg.append("g")
        .attr("id", id) 
        .attr("transform", `translate(${trans.x}, ${trans.y})`);
    let miniEgeneTrack = new MiniGenomeBrowser(eGenes, pos, window); // this is how a new track is created
    miniEgeneTrack.setScale(GlobalWidth*0.85);

    // customized visualization
    const geneLabelG = egeneG.selectAll(".egene-post")
        .data(eGenes)
        .enter()
        .filter((d)=>miniEgeneTrack.scale(d.pos)>0) // render only if genes are within the view window
        .append("g")
        .attr("id", (d)=>d.id);

    geneLabelG.append("rect")
        .attr("x", (d)=>miniEgeneTrack.scale(d.pos))
        .attr("y", (d, i)=>d.gencodeId==gencodeId?0:i%2==0?25:15)
        .attr("height", (d, i)=>d.gencodeId==gencodeId?60:i%2==0?35:45)
        .attr("width", 0.5)
        .style("stroke", "DarkSlateGray")
        .style("stroke-width", 0.3);
   
    geneLabelG.append("text")
        .attr("class", "egene-label")
        .attr("x",0)
        .attr("y", (d)=>d.gencodeId==gencodeId?-25:0)
        .attr("transform", (d, i)=>`translate(${miniEgeneTrack.scale(d.pos)}, ${i%2==0?20:10})`)
        .text((d)=>d.geneSymbol)
        .attr("font-size", (d)=>d.gencodeId==gencodeId?12:8)
        .attr("fill", (d)=>d.gencodeId==gencodeId?"#178A7F":"DarkSlateGray");

    geneLabelG
        .style("cursor", "pointer")
        .on("click", click);
}

/**
 * Create an SVG D3 object
 * @param id {String} the parent dom ID
 * @param width {Number}: the outer width
 * @param height {Number}: the outer height
 * @param margin {Object} the margin object with attr: left, top
 * @param svgId {String=} [svgId=undefined]: the SVG DOM ID
 * @returns a new D3 selection object
 * @private
 */
function _createSvg(id, width, height, margin, svgId=undefined){
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




