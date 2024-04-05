import { getGtexUrls } from "./modules/gtexDataParser";
import * as d3 from "d3";
import * as d3Chromatic from "d3-scale-chromatic";
import GroupedViolin from "./modules/GroupedViolin";
import { ascending, select } from "d3";
import $ from 'jquery'; 
import {RetrieveAllPaginatedData} from "./utils/pagination";

export function launch(
    rootId, 
    tooltipId, 
    gencodeId, 
    dimension={w: window.innerWidth*0.7, h:250},
    margin= {top: 50, right: 50, bottom: 150, left: 100}, 
    url=getGtexUrls()
){

    // assign default plot options
    let options = { 
        showAll: true, // show all data
        splitViolin: false, // show both filtered and unfiltered data in two half violins
        byTissue: false // group by tissue
    };

    // API call
    let dataUrl = url.singleCellExpression + gencodeId + "&excludeDataArray=False";
    // let dataUrl = "data/ccl21.data.json";
    Promise.all([
        RetrieveAllPaginatedData(dataUrl),
        RetrieveAllPaginatedData(url.tissue)
    ]).then(args=> {
        // data parsing
        let tissueRaw = args[1];
        let tIdNameMapper = _createTIDNameMap(tissueRaw);

        let raw = args[0];
        let dataT = _parseAPI(raw, tIdNameMapper, true, true, false, true);
        let dataC = _parseAPI(raw, tIdNameMapper, false, true, false, true);
        let nonzeroDataT = _parseAPI(raw, tIdNameMapper, true, false);
        let nonzeroDataC = _parseAPI(raw, tIdNameMapper, false, false);
        if (dataT.length == 0){
            console.error("This gene has no data");
            throw "This gene has no expression data";
        } 
        let data = !options.splitViolin?options.byTissue?dataT:dataC:options.byTissue?dataT.concat(nonzeroDataT):dataC.concat(nonzeroDataC);
        
        
        // set up: instantiate the plot object, assign DOM IDs, create a tooltip div, add the plot toolbar
        let plot = new GroupedViolin(data);
        const ids = _assignIDs(rootId, tooltipId); // assign DOM IDs
        plot.createTooltip(ids.tooltip);
        _addToolbar(plot, ids);

        // plot rendering
        _render(plot, margin, dimension, ids);
        _customizePlot(plot, options);

        // UI: define plot update triggered by rendering options, and create buttons for them
        let update = ()=>{
            _updatePlot(plot, options, dataT, dataC, nonzeroDataT, nonzeroDataC);
        };
        _createButtons(plot, options, ids, update);
    });

}

/**
 * Render the violin plot
 * @param {GroupedViolin} plot 
 * @param {Dictionary} margin with attr: top, right, bottom, left
 * @param {Dictionary} dimension with attr: width and height
 * @param {Dictionary} id
 */
function _render(plot, margin, dimension, id, demo, showZero, showOutliers=true){
    dimension.outerWidth = dimension.width + margin.left + margin.right;
    dimension.outerHeight = dimension.height + margin.top + margin.bottom;
    let svg = _createSvg(id, margin, dimension);
    let sortedX = plot.data.map((d)=>d.group).sort(ascending);
    const xDomain = _customizeXDomain(sortedX);
    const yDomain = [];
    const xAxis = {
        show: !showZero,
        angle: -90,
        paddingOuter: 0,
        paddingInner: 0.2,
        textAnchor: "start",
        adjustHeight: 0,
        hideLabels: false,
        hideTicks: true,
        direction: "top",
        addGroupGap: true
    };
    const subXAxis = {
        show: false,
    };
    const yAxis = {
        // label: "ln(CP10K+1)"
        label: "ln(counts per 10k + 1)"
    };
    const sizeAxis = {
        show: false,
        angle: 0,
        adjustHeight: 0
    };
    const showWhisker = false;
    const showDivider = false;
    const showLegend = false;
    const minDataPoints = 25;
   
    plot.render(svg, dimension.width, dimension.height, xDomain, yDomain, xAxis, subXAxis, yAxis, sizeAxis, showWhisker, showDivider, showLegend, showOutliers, minDataPoints, undefined, "kdeScott");
    
}

function _customizeXDomain(sortedX){
    // customizing xDomain to provide intergroup gap
    let xDomain = [];
    let previousX = "start";
    sortedX.forEach((d)=>{
        let x = d.split(":")[0];
        let isSame = previousX===x;
        if (!isSame) {
            xDomain.push(x+"-extra");
            // xDomain.push(x+"-v2-extra");
            xDomain.push(x); //flanking the group with spacer

        }
        xDomain.push(d);

        previousX = x;
    });
    return xDomain;
}

function _customizePlot(plot, options){
    let buffer = options.byTissue?30:30;
    let angle = options.byTissue?0:45;
    // customization
   
    _addSuperGroupLabels(plot, buffer, angle);
    _customizeXAxis(plot, options);
    _customizeTooltip(plot, options);
}

function _addSuperGroupLabels(plot, buffer=60, angle=-45, orientation="bottom"){
    let nested = d3.nest()
        .key((d)=>d.superGroup)
        .rollup((v)=>{
            v.sort((a,b)=>{
                if (a.group<b.group) return -1;
                if (a.group>b.group) return 1;
                return 0;
            });
            let midX = (plot.scale.x(v[v.length-1].group) - plot.scale.x(v[0].group) + 1)/2; // figuring out where the center X position  is for each super group
            let firstElement = v[0].group;
            let lastElement = v[v.length-1].group;
            return {
                superGroup: v[0].superGroup,
                midX: midX,
                firstElement: firstElement,
                lastElement: lastElement
            };
        })
        .entries(plot.data);

    let superGroupMetaData = nested.map((n)=>n.value);
    let firstElements = superGroupMetaData.map((n)=>n.firstElement);
    let lastElements = superGroupMetaData.map((n)=>n.lastElement);
    // create a new axis for the super group
    let axis = d3.axisTop(plot.scale.x).tickSize(0);
    let color = "#bacad6";
    const axisG = plot.dom.append("g")
        .attr("transform", orientation=="bottom"?`translate(0, ${plot.height})`:"translate(0, 0)")
        .call(axis);
    axisG.select("path").style("stroke", color).style("stroke-width", 0.5);
    axisG.append("line")
        .attr("x1", 0)
        .attr("x2", plot.width)
        .attr("y1", plot.height)
        .attr("y2", plot.height)
        .style("stroke-width", 0.5)
        .style("stroke", color);
    
    const ticks = axisG.selectAll(".tick");
    ticks.select("line")
        .attr("class", "grid")
        .attr("x1", -plot.scale.x.step())
        .attr("x2", -plot.scale.x.step())
        .attr("y1", 0)
        .attr("y2", -(plot.height+buffer))
        .attr("stroke", color)
        .attr("stroke-width", (d)=>{return firstElements.indexOf(d)>=0?1:0;});
    
    ticks.select("text").remove();
  
}

function _customizeXAxis(plot, options, mode=2){    
    if (mode == 0 || mode == 2){
        // add bubbles along the axis to encode nonzero cell proportion
        let rScale = d3.scaleSqrt()
            .domain([0, 20000])
            .range([1, plot.scale.x.step()/2>8?8:plot.scale.x.step()/2]);

        // sample size bubbles
        //// text label
        plot.dom.append("text")
            .attr("x", 0)
            .attr("y", -25)
            .style("text-anchor", "end")
            .style("font-size", "10px")
            .text("Total cells");

        //// bubble size legend
        plot.dom.selectAll(".bubble")
            .data([1000, 2000, 5000, 10000])
            .enter()
            .append("circle")
            .attr("cx", -10)
            .attr("cy", (d, i)=>-50-(10*i))
            .attr("r", (d)=>rScale(d))
            .style("fill", "rgba(148, 119, 91, 0.8)")
            .style("stroke-width", 0)
            .classed("bubble", true);
        plot.dom.selectAll(".bLabel")
            .data(["1e3","","", "1e4"])
            .enter()
            .append("text")
            .attr("x", -20)
            .attr("y", (d, i)=>-48-(10*i))
            .style("text-anchor", "end")
            .style("font-size", "10px")
            .text((d)=>d);
        plot.dom.select(".violin-x-axis")
            .selectAll(".tick")
            .append("circle")
            .attr("cx", 0)
            .attr("cy", -25)
            .attr("r", (d)=>{
                let v = d.split(":")[3]; // sample size (cells)
                return rScale(v);
            })
            .style("fill", "rgba(148, 119, 91, 0.8)")
            .style("stroke-width", 0);
    }
    if (mode==1 || mode ==2) {
        // add pie charts
        const pie = d3.pie()
            .padAngle(0.005)
            .sort(null)
            .value(d => d);
        const arc = ()=>{
            const radius = plot.scale.x.step()/2>8?8:plot.scale.x.step()/2;
            return d3.arc().innerRadius(radius * 0.0).outerRadius(radius - 1);
        };
        plot.dom.append("text")
            .attr("x", 0)
            .attr("y", -10)
            .style("text-anchor", "end")
            .style("font-size", "10px")
            .text("Cell fraction");
        const color = "rgba(0, 152, 199, 0.6)";
        plot.dom.select(".violin-x-axis")
            .selectAll(".tick")
            .each(function(d) {
                // console.log(d);
                let total = +(d.split(":")[3]);
                let p = +(d.split(":")[2]);
                if (isNaN(p)) return;
                // p = p<2?2:+(d.split(":")[2]);
                let arcs = pie([p, total-p]);
                d3.select(this).selectAll("path")
                    .data(arcs)
                    .join("path")
                    .attr("d", arc())
                    .style("stroke-width", 0.5)
                    .style("stroke", color)
                    .style("fill", (d)=>d.value==p?color:"white")
                    .attr("transform", "translate(0, -10)");
            })
            .style("cursor", "default")
            .on("mouseover", function(d){
                let label = d.split(":");
                if (label[1]===undefined) return;
                select(this).select("text").style("font-size", "10px");
                let tooltipData = [
                    `<span class="tooltip-key">${options.byTissue?"Cell type": "Tissue"}</span>: <span class="tooltip-value">${label[1]}</span>`,
                    `<span class="tooltip-key">${options.byTissue?"Tissue": "Cell type"}</span>: <span class="tooltip-value">${label[0]}</span>`,
                    `<span class="tooltip-key">Sample size</span>: <span class="tooltip-value">${label[3]} cells</span>`,
                    `<span class="tooltip-key">Detected in cells</span>: <span class="tooltip-value">${label[2]} (${(100*label[2]/label[3]).toFixed(2)}%)</span>`,
                ];
                plot.tooltip.show(tooltipData.join("<br/>"));
            })
            .on("mouseout", function(d){
                let label = d.split(":");
                if (label[1]===undefined) return;
                select(this).select("text").style("font-size", "8px");

            });
    }
    // text label    
    plot.dom.select(".violin-x-axis")
        .selectAll("text")
        .style("font-size", (d)=>{
            let label = d.split(":")[1];
            return label===undefined?"7px":"8px";
        })
        .style("fill", (d)=>{
            let label = d.split(":")[1];
            return label===undefined?"#666666":"#222222";
        })
       
        .style("font-weight", (d)=>{
            let label = d.split(":")[1];
            return label===undefined?"bold":"normal";
        })
        .attr("transform", `rotate(${plot.config.x.angle}, -15, -20)`)
        .text((d)=>{
            let label = d.split(":");
            let clean = label[1]===undefined?label[0].toUpperCase():label[1];
            return clean.endsWith("-EXTRA")?"":clean;
        }); // clean up X labels, note that the cleanup step should be done after the bubbles are rendered will get rid of the percent nonzero info    
}

/**
 * 
 * @param {String} id 
 * @param {Dictionary} margin with attr: top, right, bottom, left
 * @param {Dictionary} dimension with attr: outerWidth and outerHeight
 */
function _createSvg(id, margin, dimension){
    return d3.select(`#${id.root}`)
        .append("svg")
        .attr("id", id.svg)
        .attr("width", dimension.outerWidth)
        .attr("height", dimension.outerHeight)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
}

function _createTIDNameMap(raw) {
    const tissueIdNameMap = {};
    raw.forEach(t => {tissueIdNameMap[t.tissueSiteDetailId] = t.tissueSiteDetail;});
    return tissueIdNameMap;
}


function _parseAPI(raw, tIdNameMapper, byTissue=true, showZero=true, showSize=false, showBoxplot=true){
    let data = [];
    raw.forEach(tissueObj=>{
        tissueObj.cellTypes.forEach(cellTypeObj=>{
            let values = showZero?cellTypeObj.data.concat(new Array(cellTypeObj.numZeros).fill(0)):cellTypeObj.data;
            let totalCells = showZero?values.length:+cellTypeObj.numZeros+values.length;
            let percent = (100*(cellTypeObj.count/totalCells)).toFixed(2);
            let tissue = tIdNameMapper[tissueObj.tissueSiteDetailId];
            let maxDomain = showZero?5000:2500;
            let cTheme = showZero?d3Chromatic.interpolateGreys:d3Chromatic.interpolateGnBu;
            let cScale = d3.scaleSequential(cTheme)
                .domain([100, maxDomain]);
            let group = byTissue?[tissue, cellTypeObj.cellType, cellTypeObj.count, totalCells].join(":"):[cellTypeObj.cellType, tissue, cellTypeObj.count, totalCells].join(":");
            data.push( {
                color: showSize?cScale(values.length):showZero?"rgb(148, 119, 91)":"rgb(0, 152, 199)",
                label: "",
                group: group,
                superGroup: byTissue?tissue:cellTypeObj.cellType, // is this used?
                gencodeId: tissueObj.gencodeId,
                values: values,
                nonzero: percent,
                unit: tissueObj.unit,
                datasetId: tissueObj.datasetId,
                median: d3.median(values),
                total: totalCells,
                showHalfViolin: undefined,
                showBoxplot: showBoxplot,
                showPoints: false,
                // stroke: !showZero?"#357eb5":undefined,
                // fill: !showZero?"#ffffff":undefined,
                // debugging purposes
                nonzeroMedian: cellTypeObj.data.length==0?null:d3.median(cellTypeObj.data),
            } );
        });
    });
    return data;
}

/**
 * Customizes the tooltip specifically for this plot
 * @param vplot {GroupedViolin}
 * @private
 */
function _customizeTooltip(vplot, options){
    let violinGs = vplot.dom.selectAll(".violin-g");
    violinGs.on("mouseover", (d, i, nodes)=>{
        let vPath = d3.select(nodes[i]).select("path");
        vPath.classed("highlighted", true);
        let expressed = d.values.filter((v)=>v>0).length;
        let tooltipData = [
            `<span class="tooltip-key">${options.byTissue?"Tissue": "Cell type"}</span>: <span class="tooltip-value">${d.group.split(":")[0]}</span>`,
            `<span class="tooltip-key">${options.byTissue?"Cell type": "Tissue"}</span>: <span class="tooltip-value">${d.group.split(":")[1]}</span>`,
            `<span class="tooltip-key">Total cells</span>: <span class="tooltip-value">${d.total}</span>`,
            `<span class="tooltip-key">Detected in cells</span>: <span class="tooltip-value">${expressed} (${d.nonzero}%)</span>`,
            `<span class="tooltip-key">Median (${d.unit})</span>: <span class="tooltip-value">${d.median.toPrecision(4)}</span>`
        ];
        vplot.tooltip.show(tooltipData.join("<br/>"));
    });
}

/**
 * Assign DOM IDs
 * @param {String} rootId 
 * @param {String} tooltipId 
 * @returns 
 */
function _assignIDs(rootId, tooltipId){
    let id = {
        root: rootId,
        tooltip: tooltipId,
        svg: `${rootId}-svg`,
        clone: `${rootId}-svg-clone`,
        toolbar: `${rootId}-toolbar`,
        buttons: {
            save: `${rootId}-btn-save`,
            all: `${rootId}-btn-all`,
            nonzero: `${rootId}-btn-nonzero`,
            byTissue: `${rootId}-btn-by-tissue`,
            byCell: `${rootId}-btn-by-cell`,
            splitViolin: `${rootId}-btn-split-violin`
        }
    };
    return id;
}

/**
 * Adding the toolbar UI
 * @param {GroupedViolin} plot 
 * @param {Object} id 
 */
function _addToolbar(plot, id){
    if ($(`#${id.toolbar}`).length == 0) $("<div/>").attr("id", id.toolbar).appendTo($(`#${id.root}`));
    if ($(`#${id.clone}`).length == 0) $("<div/>").attr("id", id.clone).appendTo($(`#${id.root}`));
    plot.createToolbar(id.toolbar, plot.tooltip);
}

function _updatePlot(plot, options, dataT, dataC, nonzeroDataT, nonzeroDataC){
    let data = [];
    if (options.splitViolin){
        if (options.byTissue) {
            dataT.forEach((d)=>{d.showHalfViolin="left"; d.showBoxplot=false;});
            nonzeroDataT.forEach((d)=>d.showHalfViolin="right");
            data = dataT.concat(nonzeroDataT);
        }
        else {
            dataC.forEach((d)=>{d.showHalfViolin="left"; d.showBoxplot=false;});
            nonzeroDataC.forEach((d)=>d.showHalfViolin="right");
            data = dataC.concat(nonzeroDataC);
        }
    } else {
        if (options.showAll&&options.byTissue) data = dataT;
        else if (!options.showAll&&options.byTissue) data = nonzeroDataT;
        else if (options.showAll&&!options.byTissue) data = dataC;
        else data = nonzeroDataC;
        data.forEach((d)=>{d.showHalfViolin=undefined; d.showBoxplot=true;});
    }
    
    plot.updateData(data, false, !options.splitViolin);
    const xDomain = _customizeXDomain(plot.data.map((d)=>d.group).sort(ascending));
    plot.updateXScale(xDomain, true);
    _customizePlot(plot, options);
}

function _createButtons(plot, options, ids, callback){
    // create toolbar buttons and assign callback definitions
    let showAll = ()=>{
        options.showAll = true;
        options.splitViolin = false;
        callback();
        _updateButtons(options, ids);
    };
    let showNonZero = ()=>{
        options.showAll = false;
        options.splitViolin = false;
        callback();
        _updateButtons(options, ids);
    };
    let groupByTissue = ()=>{
        options.byTissue = true;
        callback();
        _updateButtons(options, ids);
    };
    let groupByCell = ()=>{
        options.byTissue = false;
        callback();
        _updateButtons(options, ids);
    };
    let splitViolin = ()=>{
        options.showAll = false;
        options.splitViolin = !options.splitViolin;
        callback();
        _updateButtons(options, ids);
    };
    // the appearing order of the buttons is determined as the order they are created
    plot.toolbar.createButton(ids.buttons.all, "All", "All cells", showAll);
    plot.toolbar.createButton(ids.buttons.nonzero, "Nonzero", "Expressing cells only", showNonZero);
    plot.toolbar.createButton(ids.buttons.splitViolin, "Split", "All vs expressing cells", splitViolin);
    plot.toolbar.createButton(ids.buttons.byCell, "C", "Group violins by cell type", groupByCell);
    plot.toolbar.createButton(ids.buttons.byTissue, "T", "Group violins by tissue", groupByTissue);
    // plot.toolbar.createButton(ids.buttons.filter, "fa-filter", "Filter options");
    plot.toolbar.createDownloadSvgButton(ids.buttons.save, ids.svg, `${ids.root}-save.svg`, ids.clone);

    _updateButtons(options, ids);   
}

function _updateButtons(options, ids){
    // update UI button styling based on the current selected options
    d3.select(`#${ids.buttons.all}`).classed("highlight active", options.showAll&&!options.splitViolin);
    d3.select(`#${ids.buttons.nonzero}`).classed("highlight active", !options.showAll&&!options.splitViolin);
    d3.select(`#${ids.buttons.byTissue}`).classed("highlight active", options.byTissue);
    d3.select(`#${ids.buttons.byCell}`).classed("highlight active", !options.byTissue);
    d3.select(`#${ids.buttons.splitViolin}`).classed("highlight active", options.splitViolin);
}
