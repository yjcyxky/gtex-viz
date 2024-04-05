import { 
    getGtexUrls,
    parseGenes 
} from "./modules/gtexDataParser";

import * as d3 from "d3";
import AnyPointMatrix from "./modules/AnyPointMatrix";
import $ from "jquery"; 
import Toolbar from "./modules/Toolbar";
import {RetrieveAllPaginatedData} from "./utils/pagination";

export function launch(config, geneInput, url=getGtexUrls()){ 

    // get the input list of genes
    if (geneInput == ""){
        alert("Input Error: At least one gene must be provided.");
        throw("Gene input error");
    }
    const MAX = 100;
    // message for geneInput errors
    let message = "";
    if (geneInput.length > MAX) {
        message = `Warning: Too many genes. Input list truncated to the first ${MAX}. <br/>`;
        geneInput = geneInput.slice(0, MAX);
    }
    let genes = url.geneId+geneInput.join("&geneId=");
    let dataUrl = url.singleCellExpression;
    let metadataUrl = url.singleCellExpressionSummary;

    const promises = [
        RetrieveAllPaginatedData(genes),
        dataUrl,
        RetrieveAllPaginatedData(metadataUrl)
    ];

    Promise.all(promises).then(args=> { // should I just load genes here? 
        // genes
        const genes = parseGenes(args[0]);
        // error-checking
        message += _validateGenes(genes, geneInput);
        // get list of gencodeIds
        const gQuery = genes.map((g)=>g.gencodeId).join("&gencodeId=");
        // get singleCellData for each querried gencodeId
        let fetchData = args[1] + gQuery + "&includeDataArray=False"; 

        RetrieveAllPaginatedData(fetchData)
            .then(function(fData){
                $("#geneQueryMessage").html(message);
                
                const data = _parseSingleCellAPINew(fData);
                const summary = _parseSummaryAPI(args[2]);
                if (data.length == 0){
                    console.error("This gene has no data");
                } else {
                    _launch(data, summary, config);
                    _controller(data, summary, config);
                }
            })
            .catch(function(err){console.error(err);});     
    })
        .catch(function(err){console.error(err);});
}
function _validateGenes(genes, input){
    let message = "";
    if (genes.length == 0) message = "Fatal Error: the gene list is empty.<br/>";
    else {
        if (genes.length < input.length){
            let allIds = [];
            genes.forEach((g)=>{
                // compile a list of all known IDs
                allIds.push(g.gencodeId);
                allIds.push(g.geneSymbolUpper);
            });
            let missingGenes = input.filter((g)=>!allIds.includes(g.toLowerCase())&&!allIds.includes(g.toUpperCase()));
            if (missingGenes.length > 0) message = `Warning: Not all genes are found: ${missingGenes.join(",")}<br/>`;
        }
    }
    return message;
}
function _controller(data, summary, config){
    let summaryStatistic = "mean";
    let summaryData = "AllCells";

    $("#single-cell-multi-gene-apm-type-DotPoint").on("click", ()=>{
        $("#single-cell-multi-gene-apm-type-DotPoint").addClass("active");
        $("#single-cell-multi-gene-apm-type-AsterPoint").removeClass("active");
        $("#single-cell-multi-gene-apm-point-summary-data").removeClass("hidden");
        config.type = "DotPoint";
        _launch(data, summary, config);
    });
    $("#single-cell-multi-gene-apm-type-AsterPoint").on("click", ()=>{
        $("#single-cell-multi-gene-apm-type-AsterPoint").addClass("active");
        $("#single-cell-multi-gene-apm-type-DotPoint").removeClass("active");
        $("#single-cell-multi-gene-apm-point-summary-data").addClass("hidden");
        config.type = "AsterPoint";
        _launch(data, summary, config);
    });
    $("#single-cell-multi-gene-apm-point-Mean").on("click", ()=>{
        $("#single-cell-multi-gene-apm-point-Mean").addClass("active");
        $("#single-cell-multi-gene-apm-point-Median").removeClass("active");
        summaryStatistic = "mean";
        config.points.DotPoint.color = `${summaryStatistic}${summaryData}`;
        config.points.AsterPoint.color = summaryStatistic;
        config.points.AsterPoint.outerRadius = summaryStatistic;
        _launch(data, summary, config);
    });
    $("#single-cell-multi-gene-apm-point-Median").on("click", ()=>{
        $("#single-cell-multi-gene-apm-point-Median").addClass("active");
        $("#single-cell-multi-gene-apm-point-Mean").removeClass("active");
        summaryStatistic = "median";
        config.points.DotPoint.color = `${summaryStatistic}${summaryData}`;
        config.points.AsterPoint.color = summaryStatistic;
        config.points.AsterPoint.outerRadius = summaryStatistic;
        _launch(data, summary, config);
    });
    $("#single-cell-multi-gene-apm-axis-x-Tissue").on("click", ()=>{
        $("#single-cell-multi-gene-apm-axis-x-Tissue").addClass("active");
        $("#single-cell-multi-gene-apm-axis-x-CellType").removeClass("active");
        config.axis.x = ["tissue", "cellType"];
        _launch(data, summary, config);
    });
    $("#single-cell-multi-gene-apm-axis-x-CellType").on("click", ()=>{
        $("#single-cell-multi-gene-apm-axis-x-Tissue").removeClass("active");
        $("#single-cell-multi-gene-apm-axis-x-CellType").addClass("active");
        config.axis.x = ["cellType", "tissue"];
        _launch(data, summary, config);
    });
    $("#single-cell-multi-gene-apm-point-AllCells").on("click", ()=>{
        $("#single-cell-multi-gene-apm-point-DetectedInCells").removeClass("active");
        $("#single-cell-multi-gene-apm-point-AllCells").addClass("active");
        summaryData = "AllCells";
        config.points.DotPoint.color = `${summaryStatistic}${summaryData}`;
        console.log("config.points.DotPoint.color", config.points.DotPoint.color);
        _launch(data, summary, config);
    });
    $("#single-cell-multi-gene-apm-point-DetectedInCells").on("click", ()=>{
        $("#single-cell-multi-gene-apm-point-AllCells").removeClass("active");
        $("#single-cell-multi-gene-apm-point-DetectedInCells").addClass("active");
        summaryData = "DetectedInCells";
        config.points.DotPoint.color = `${summaryStatistic}${summaryData}`;
        console.log("config.points.DotPoint.color", config.points.DotPoint.color);
        _launch(data, summary, config);
    });
    $("#single-cell-multi-gene-apm-download").on("click", ()=>{
        const cloneId = config.rootId + "-clone";
        const svgId = config.rootId + "-svg";
        if ($(`#${cloneId}`).length == 0) $("<div/>").attr("id", cloneId).appendTo($(`#${config.rootId}`));
        const toolbar = new Toolbar(config.rootId);
        toolbar.downloadSvg(svgId, "single-cell-multi-gene-matrix.svg", cloneId);
        // alert("downloading");
    });
}
/**
 * 1. create the plot data
 * 2. initiate AnyPointMatrix
 * 3. render plot
 * @param {*} data parsed single cell data
 * @param {*} summary parsed summary data for total num cells
 * @param {*} config axis: {x, y}, type: "", point: {}, 
 */
function _launch(data, summary, config){
    config.point = config.points[config.type];
    const apmData = createApmData(data, config.axis, config.point, config.type); // attrs: x, y, point, groupInfo_
    const plot = new AnyPointMatrix(apmData, summary, config.rootId, config.tooltipId, config.legendId, config.type, config.axis, config.point, config.dimension, config.padding); 
    plot.render();
    _customizeTooltip(plot);
}
function createApmData(data, axis, point, type){
    /**
     * @param data list of objs with parsed single cell data
     * @param axis obj with x: [dataPrefix, dataPrefix], y: dataPrefix
     * @param point obj within config.points selected by key based on config.type. 
     *              Can be: radius, color OR innerRadius, outerRadius, arcLength, color
     * @param type string that determines which key to choose from config.points. Can be: AsterPoint or DotPoint 
     */
    data = data.map((d)=> {
        return {
            x: `${d[`${axis.x[0]}`]}*${d[`${axis.x[1]}`]}`,
            y: d[`${axis.y}`],
            type: type,
            groupInfo_: d
        };
    });
    const formatAsterData = (d)=> { // refactor: input array of keys for arcs: [medianWithoutZeros, medianWithZeros]..but how to get percent of each dynamically?
        let data = [{ 
            mean: +d.meanDetectedInCells,
            median: +d.medianDetectedInCells,
            percent: +d.percentDetectedInCells / 100
        },
        {
            mean: +d.meanAllCells,
            median: +d.medianAllCells,
            percent: 1 - (+d.percentDetectedInCells / 100)
        }];
        return data;
    };
    data.forEach((d)=> {
        switch(type) { // add a default case
        case "AsterPoint":
            // eslint-disable-next-line no-case-declarations
            const asterData = formatAsterData(d.groupInfo_); // define constant called formatAsterData
            d.point = createAsterPoint(asterData, point.innerRadius, point.outerRadius, point.arcLength, point.color);
            break;
        case "DotPoint":
            d.point = createDotPoint(d.groupInfo_, point.radius, point.color);
            break;
        }
    });
    return data;
}
function createAsterPoint(data, innerRadius, outerRadius, arcLength, color){
    const point = data.map((d) => {
        return {
            innerRadius:+d[`${innerRadius}`] || innerRadius, // not functional in config!
            outerRadius: +d[`${outerRadius}`],
            color: +d[`${color}`],
            arcLength: +d[`${arcLength}`]
        };
    });
    return point;
}
function createDotPoint(d, radius, color){
    const point = {
        radius: +d[`${radius}`],
        color: +d[`${color}`]
    };
    return point;
}
function _parseSingleCellAPI(raw){
    let data = [];
    raw.forEach(tissueObj=>{
        tissueObj.cellTypes.forEach(cellTypeObj=>{
            let total = cellTypeObj.count + cellTypeObj.numZeros;
            let percent = +(100*(  cellTypeObj.count / total) ).toFixed(2);
            let tissue = tissueObj.tissueSiteDetailId;

            data.push( {
                label: "",
                tissue: tissue,
                cellType: cellTypeObj.cellType,
                gencodeId: tissueObj.gencodeId,
                geneSymbol: tissueObj.geneSymbol,
                gene: {
                    gencodeId: tissueObj.gencodeId,
                    geneSymbol: tissueObj.geneSymbol
                },
                datasetId: tissueObj.datasetId,
                medianAllCells: cellTypeObj.medianWithZeros,
                meanAllCells: cellTypeObj.meanWithZeros,
                medianDetectedInCells: cellTypeObj.medianWithoutZeros,
                meanDetectedInCells: cellTypeObj.meanWithoutZeros,
                percentDetectedInCells: percent,
                numWithoutZeros: cellTypeObj.count,
                numWithZeros: total,
                unit: tissueObj.unit
            } );
        });
    });
    return data;
}

function _parseSingleCellAPINew(raw){
    let data = [];
    raw.forEach(tissueObj=>{
        tissueObj.cellTypes.forEach(cellTypeObj=>{
            let total = cellTypeObj.count + cellTypeObj.numZeros;
            let percent = +(100*(  cellTypeObj.count / total) ).toFixed(2);
            let tissue = tissueObj.tissueSiteDetailId;

            data.push( {
                label: "",
                tissue: tissue,
                cellType: cellTypeObj.cellType,
                gencodeId: tissueObj.gencodeId,
                geneSymbol: tissueObj.geneSymbol,
                gene: {
                    gencodeId: tissueObj.gencodeId,
                    geneSymbol: tissueObj.geneSymbol
                },
                datasetId: tissueObj.datasetId,
                medianAllCells: cellTypeObj.medianWithZeros,
                meanAllCells: cellTypeObj.meanWithZeros,
                medianDetectedInCells: cellTypeObj.medianWithoutZeros,
                meanDetectedInCells: cellTypeObj.meanWithoutZeros,
                percentDetectedInCells: percent,
                numWithoutZeros: cellTypeObj.count,
                numWithZeros: total,
                unit: tissueObj.unit
            } );
        });
    });
    return data;
}

function _parseSummaryAPI(raw){
    raw.forEach(d=>{
        d.tissue = d.tissueSiteDetailId;
        delete d.tissueSiteDetailId;
        // map.set(d.tissueSiteDetailId, d.numCells)
    });
    return raw;
}
/**
 * Customizes the tooltip specifically for this plot
 * @param plot {AnyPointMatrix}
 * @private
 */
function _customizeTooltip(plot){
    let points = d3.selectAll(".apm-point");
    points.on("mouseover", (d, i, nodes)=>{
        plot.tooltip.show(`<span class="tooltip-key">Gene: </span><span class="tooltip-value">${d.groupInfo_.geneSymbol}</span><br>
            <span class="tooltip-key">Tissue: </span><span class="tooltip-value">${d.groupInfo_.tissue}</span><br>
            <span class="tooltip-key">Cell type: </span><span class="tooltip-value">${d.groupInfo_.cellType}</span><br>
            <span class="tooltip-key">Total cells: </span><span class="tooltip-value">${d.groupInfo_.numWithZeros}</span></br>
            <span class="tooltip-key">Detected in cells: </span><span class="tooltip-value">${d.groupInfo_.percentDetectedInCells}%</span></br>
            <span class="tooltip-key">Unit: </span><span class="tooltip-value">log cp10k</span>
            <hr>
            <span class="tooltip-head">All cells</span><br>

            <span class="tooltip-key">Mean: </span><span class="tooltip-value">${d.groupInfo_.meanAllCells.toPrecision(4)}</span><br>
            <span class="tooltip-key">Median: </span><span class="tooltip-value">${d.groupInfo_.medianAllCells.toPrecision(4)}</span></br>
            <hr>
            <span class="tooltip-head">Detected in cells</span><br>
       
            <span class="tooltip-key">Mean: </span><span class="tooltip-value">${d.groupInfo_.meanDetectedInCells.toPrecision(4)}</span></br>
            <span class="tooltip-key">Median: </span><span class="tooltip-value">${d.groupInfo_.medianDetectedInCells.toPrecision(4)}`);

        d3.select(".apm-x-axis").selectAll(".tick") // using custom axis
            .filter(function(e){ return e.x == d.x; })
            .classed("active", true);

        d3.select(".apm-y-axis").selectAll(".tick") // using d3 axis
            .filter(function(e){  
                return e == d.y;
            })
            .classed("active", true);
            
        d3.select(nodes[i]).classed("active-point", true);
    }).on("mouseleave", (d, i, nodes)=> {
        d3.select(".apm-x-axis").selectAll(".tick")
            .filter(function(e){ return e.x == d.x; })
            .classed("active", false);

        d3.select(".apm-y-axis").selectAll(".tick") // using d3 axis
            .filter(function(e){  return e == d.y; }) 
            .classed("active", false);
        d3.select(nodes[i]).classed("active-point", false);
    });
}