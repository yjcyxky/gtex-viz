/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
/*
Input data structure: a list of data object with the following structure:
// todo
*/
import * as d3 from "d3";
import {extent, median, ascending, quantile, max, min} from "d3-array";
import {nest} from "d3-collection";
import {scaleBand, scaleLinear} from "d3-scale";
import {axisTop, axisBottom, axisLeft} from "d3-axis";
import {select, event, selectAll} from "d3-selection";
import Tooltip from "./Tooltip";

const duration = 400;
const lightgrey = "#e2e2e2";
const mediumgrey = "rgb(200,200,200)";
const ochre = "rgba(148, 119, 91, 0.8)";

export default class AnyPointMatrix {
    constructor(data, 
        summary,
        rootId, 
        tooltipId,
        legendId,
        type,
        axis,
        point,
        dimension = {   
            width: d3.select(`#${rootId}`).node().clientWidth, 
            height: d3.select(`#${rootId}`).node().clientHeight
        },
        padding={top: 50, right: 50, bottom:50, left:50}
    ) { 

        this._sanityCheck(data); // check data for all necessary attributes 
        this.data = data;  
        this.summary = summary; // this should be optional? 
        this.rootId = rootId;
        this.tooltipId = tooltipId;
        this.legendId = legendId;
        this.type = type;
        this.axis = axis;
        this.point = point;
        this.dimension = dimension; // if height is not defined, height will be maxRadius * yDomain.length.
        this.padding = padding;      
        this._updateDimensions();
        this._createScales(); // where does height get defined?
        this._createTooltip(this.tooltipId);
        this._createLegend(this.rootId, this.legendId, this.type, this.scale);
    }
    /** 
     * check data for x, y, and point attributes 
     * @param data formatted via config with: x, y, point, and groupInfo_ (parsed data)
     */
    _sanityCheck(data){
        const attr = ["x", "y", "point"];
        let pt;
        switch (this.type){
        case "DotPoint":
            pt = ["radius", "color"];
        case "AsterPoint":
            pt = ["innerRadius", "outerRadius", "arcLength", "color"];
        }
        data.forEach((d) => {
            attr.forEach((a) => {
                if (d[a] === undefined) throw "GroupedMatrix: input data error.";
                if (d[a] == "point"){
                    pt.forEach((p)=> {
                        if (a[p] === undefined) throw "GroupedMatrix: input POINT error.";
                    });
                }
            });
        });
    }
    /**
     * TODO: calculate height based on number of y-values * maxRadius
     */
    _updateDimensions() {
        this.dimension.innerWidth = this.dimension.width - this.padding.left - this.padding.right;
        this.dimension.innerHeight = this.dimension.height - this.padding.top - this.padding.bottom;
    }
    _createScales(){
        let xDomain = this.data.map(d => d.x).filter((v, i, a) => a.indexOf(v) === i);
        const xGroupDomain = this.data.map((d)=> d.groupInfo_[`${this.axis.x[0]}`]).filter((v, i, a) => a.indexOf(v) === i); 
        xDomain = xDomain.concat(xGroupDomain).sort(ascending); // customized for grouped x-axis layout and display
        let yDomain = this.data.map(d => d.y).filter((v, i, a) => a.indexOf(v) === i);
        yDomain = yDomain.sort(function(a, b){ return d3.ascending(a, b);});
        let maxRadius = (this.dimension.innerWidth / xDomain.length)/1.85;
        if (maxRadius >= 10){ 
            maxRadius = 10;
            this.dimension.innerWidth = (maxRadius*2) * xDomain.length;
        }
        let height = ((maxRadius*4) * yDomain.length);
        if (height <= 80){  height = 80;  } 
        this.dimension.height = height + this.padding.top + this.padding.bottom;
        this.dimension.innerHeight = height;

        const _createSummaryScale = (d) =>{
            let numCells = [];
            this.summary.forEach(d=>{
                numCells.push(d.numCells);
            });
            return {
                radius: d3.scaleSqrt().domain(d3.extent(numCells)).range([2, maxRadius]),
                color: ochre
            };
        };
        const _createPointScales = (d)=>{
       
            const colorInterp = d3.interpolateReds;
            const expressionExtent = [0,6];
            const percentExtent = [0, 100];

            switch(this.type) { 
            case "AsterPoint":
                return {
                    outerRadius: d3.scaleSqrt().domain(d3.extent(expressionExtent)).range([2, maxRadius]),
                    color: d3.scaleSequential().domain(d3.extent(expressionExtent)).interpolator(colorInterp)
                };
            case "DotPoint":
                return {
                    // radius: d3.scaleSqrt().domain(d3.extent(this.data.map(d => d.point.radius))).range([2, maxRadius]),
                    radius: d3.scaleSqrt().domain(percentExtent).range([2, maxRadius]),
                    color: d3.scaleSequential().domain(expressionExtent).interpolator(colorInterp)
                };
            }
        };
        this.scale = {
            x: d3.scaleBand().domain(xDomain).range([0, this.dimension.innerWidth]),
            y: d3.scaleBand().domain(yDomain).rangeRound([this.dimension.innerHeight, 0]).padding([1]),
            point: _createPointScales(),
            summary: _createSummaryScale(),
            maxRadius: maxRadius
        };   
    }
    /**
 * Create the tooltip object
 * @param domId {String} the tooltip's dom ID
 * @returns {Tooltip}
 */
    _createTooltip(domId){
        if ($(`#${domId}`).length == 0) $("<div/>").attr("id", domId).appendTo($("body"));
        this.tooltip = new Tooltip(domId);
        select(`#${domId}`).classed("apm-tooltip", true);
        return this.tooltip;
    }

    _createLegend(rootId, legendId, type, scale){
        d3.select(`#${rootId}-svg`).append("g")
            .attr("transform", "translate(0, 20)")
            .attr("id", legendId);

        const summaryRadiusLegend = function (id, scale) {
            const width = 150;
            const height = 60;
            const padding = { top: 20, right: 20, bottom:10, left:20 };
            const innerWidth = width - padding.left - padding.right;
            const innerHeight = height - padding.top - padding.bottom;
            const dom = d3.select("#" + id).append("g")
                .attr("id", "radius-legend")
                .attr("transform", `translate(${padding.left}, ${padding.top})`);

            var data = [scale.radius.domain()[0], (scale.radius.domain()[1]/2).toPrecision(1), scale.radius.domain()[1].toPrecision(1)];

            var xScale = d3.scaleBand()
                .domain(data)
                .range([0, innerWidth]);
        
            var u = dom.selectAll("g")
                .data(data)
                .enter()
                .append("g")
                .attr("transform", (d) => {
                    return `translate(${Math.floor(xScale(d))}, ${0})`;
                })
                .each( function(d){
                    select(this).append("circle")
                        .attr("cx", 0)
                        .attr("cy", innerHeight/2)
                        .attr("r", scale.radius(d))
                        .attr("fill", scale.color);

                    select(this).append("text")
                        .attr("x", 0)
                        .attr("y", innerHeight)
                        .attr("dy", 10)
                        .html((d)=>{
                            if (d>=1000){
                                return d3.format(",.1s")(d);
                            } else {
                                return d;
                            }
                        })
                        .attr("text-anchor", "middle")
                        .attr("fill", "black")
                        .attr("class", "apm-legend-axis-tick");
                });
            dom.append("text").text("Total cells")
                .attr("x", innerWidth/2)
                .attr("dy", 10)
                .attr("y", innerHeight + padding.top)
                .attr("text-anchor", "middle")
                .attr("class", "apm-legend-axis-label");
            
            dom.append("text").text("Area")
                .attr("x", innerWidth/2)
                .attr("y", -6)
                .attr("text-anchor", "middle")
                .attr("class", "apm-legend-title");

        };
        const dotColorLegend = function (id, scale) { 
            const width = 200;
            const height = 60;
            const padding = { top: 20, right: 20, bottom:10, left:20 };
            const innerWidth = width - padding.left - padding.right;
            const innerHeight = height - padding.top - padding.bottom;
            const dom = d3.select("#" + id)
                .append("g")
                .attr("id", "color-legend")
                .attr("transform", `translate(${padding.left+ 350}, ${padding.top})`);

            function range(start, end, step = 1) {
                const len = Math.floor((end - start) / step) + 1;
                return Array(len).fill().map((_, idx) => start + (idx * step));
            }
            var data = range(scale.domain()[0], scale.domain()[1], 1);

            var xScale = d3.scaleBand()
                .domain(data)
                .range([0, innerWidth]);
        
            var u = dom.selectAll("g")
                .data(data)
                .enter()
                .append("g")
                .attr("transform", (d) => {
                    return `translate(${Math.floor(xScale(d))}, ${0})`;
                })
                .each( function(d){
                    select(this).append("rect")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("height", innerHeight-10)
                        .attr("width", (d) => {
                            return innerWidth / data.length;
                        })
                        .attr("fill", (d) => {
                            if (d == 0) {
                                return lightgrey;
                            } else {
                                return scale(d);
                            }
                        });
                    select(this).append("text")
                        .attr("x", (innerWidth / data.length)/2)
                        .attr("y", innerHeight)
                        .attr("dy", 10)
                        .html(d)
                        .attr("text-anchor", "middle")
                        .attr("fill", "black")
                        .attr("class", "apm-legend-axis-tick");
                });
      
            dom.append("text").text("Expression (ln(counts per 10k + 1))")
                .attr("x", innerWidth/2)
                .attr("dy", 10)
                .attr("y", innerHeight + padding.top)
                .attr("text-anchor", "middle")
                .attr("class", "apm-legend-axis-label");
            
            dom.append("text").text("Color")
                .attr("x", innerWidth/2)
                .attr("y", -6)
                .attr("text-anchor", "middle")
                .attr("class", "apm-legend-title");
        };
        const dotRadiusLegend = function (id, scale) {
            const width = 200;
            const height = 60;
            const padding = { top: 20, right: 20, bottom:10, left:20 };
            const innerWidth = width - padding.left - padding.right;
            const innerHeight = height - padding.top - padding.bottom;
            const dom = d3.select("#" + id).append("g")
                .attr("id", "radius-legend")
                .attr("transform", `translate(${padding.left + 150}, ${padding.top})`);

            function range(start, end, step = 1) {
                const len = Math.floor((end - start) / step) + 1;
                return Array(len).fill().map((_, idx) => start + (idx * step));
            }
            var data = range(scale.domain()[0], scale.domain()[1], 20);

            var xScale = d3.scaleBand()
                .domain(data)
                .range([0, innerWidth]);
        
            var u = dom.selectAll("g")
                .data(data)
                .enter()
                .append("g")
                .attr("transform", (d) => {
                    return `translate(${Math.floor(xScale(d))}, ${0})`;
                })
                .each( function(d){
                    select(this).append("circle")
                        .attr("cx", 0)
                        .attr("cy", innerHeight/2)
                        .attr("r", scale(d))
                        .attr("stroke", mediumgrey)
                        .attr("fill", "none");

                    select(this).append("text")
                        .attr("x", 0)
                        .attr("y", innerHeight)
                        .attr("dy", 10)
                        .html(d)
                        .attr("text-anchor", "middle")
                        .attr("fill", "black")
                        .attr("class", "apm-legend-axis-tick");
                });
            dom.append("text").text("Detected in cells (%)")
                .attr("x", innerWidth/2)
                .attr("dy", 10)
                .attr("y", innerHeight + padding.top)
                .attr("text-anchor", "middle")
                .attr("class", "apm-legend-axis-label");
            
            dom.append("text").text("Area")
                .attr("x", innerWidth/2)
                .attr("y", -6)
                .attr("text-anchor", "middle")
                .attr("class", "apm-legend-title");

        };
        const asterColorRadiusLegend = function (id, cScale, rScale) {
            const width = 200;
            const height = 60;
            const padding = { top: 20, right: 20, bottom:10, left:20 };
            const innerWidth = width - padding.left - padding.right;
            const innerHeight = height - padding.top - padding.bottom;
            const dom = d3.select("#" + id).append("g")
                .attr("id", "aster-legend")
                .attr("transform", `translate(${padding.left+150}, ${padding.top})`);

            function range(start, end, step = 1) {
                const len = Math.floor((end - start) / step) + 1;
                return Array(len).fill().map((_, idx) => start + (idx * step));
            }
            var data = range(cScale.domain()[0], cScale.domain()[1], 1);

            var xScale = d3.scaleBand()
                .domain(data)
                .range([0, innerWidth]);
        
            var u = dom.selectAll("g")
                .data(data)
                .enter()
                .append("g")
                .attr("transform", (d) => {
                    return `translate(${Math.floor(xScale(d))}, ${0})`;
                })
                .each( function(d){
                    select(this).append("circle")
                        .attr("cx", 0)
                        .attr("cy", innerHeight/2)
                        .attr("r", rScale(d))
                        .attr("fill", () => {
                            if (d == 0) {  return lightgrey; } 
                            else { return cScale(d);  }
                        });
                    select(this).append("text")
                        .attr("x", 0)
                        .attr("y", innerHeight)
                        .attr("dy", 10)
                        .html(d)
                        .attr("text-anchor", "middle")
                        .attr("class", "apm-legend-axis-tick");
                });
              
            dom.append("text").text("Expression (ln(counts per 10k + 1))")
                .attr("x", innerWidth/2)
                .attr("dy", 10)
                .attr("y", innerHeight + padding.top)
                .attr("text-anchor", "middle")
                .attr("class", "apm-legend-axis-label");
                
            dom.append("text").text("Area & Color")
                .attr("x", innerWidth/2)
                .attr("y", -6)
                .attr("text-anchor", "middle")
                .attr("class", "apm-legend-title");

        };
        const asterArcLegend = function(id){
            const width = 200;
            const height = 60;
            const padding = { top: 20, right: 20, bottom:10, left:20 };
            const innerWidth = width - padding.left - padding.right;
            const innerHeight = height - padding.top - padding.bottom;
            const dom = d3.select("#" + id).append("g")
                .attr("id", "aster-arc-legend")
                .attr("transform", `translate(${padding.left + 350}, ${padding.top})`);

            const outerRadiusScale = d3.scaleSqrt().domain([0,6]).range([2, 20]);
            const data = [
                {
                    arcLength: .3,
                    outerRadius: 5,
                    color:5
                },
                {
                    arcLength: .7,
                    outerRadius: 1.5,
                    color:1.5
                }
            ];
            var pie = d3.pie()
                .sort(null)
                .value(function(e) { return e.arcLength; });
            var arc = d3.arc()
                .innerRadius(0)
                .outerRadius(function (e) { 
                    return outerRadiusScale(e.data.outerRadius);
                });
            var path = dom.selectAll(".apm-asterpoint")
                .data(pie(data)
                    .sort(function(a, b) { return d3.ascending(a.data.outerRadius, b.data.outerRadius ); }));
            path
                .enter()
                .append("g")
                .attr("transform", `translate(${0}, ${innerHeight})`)
                .each(function(d, i){
   
                    select(this).append("path")
                        .attr("transform", `translate(${0}, ${0})`)
                        .attr("fill", "none")
                        .attr("stroke", function() { 
                            if (i==1){ return "rgb(80,80,80)"; } 
                            else { return mediumgrey; }
                        })
                        .attr("d", arc);

                    select(this).append("text")
                        .attr("transform", function(){
                            if (i==0){
                                return `translate(${arc.centroid(d)[0]},${arc.centroid(d)[1]+24})`;
                            } else {
                                return `translate(${arc.centroid(d)[0]+12},${arc.centroid(d)[1]})`;
                            }
                        })
                        .html(function() { 
                            if (i==1){ return "Detected in cells (%)"; } 
                            else { return "All cells"; }
                        })
                        .attr("text-anchor", "start")
                        .attr("class", "apm-legend-axis-label");
                });

            dom.append("text").text("Arc")
                .attr("x", 0)
                .attr("y", -6)
                .attr("text-anchor", "start")
                .attr("class", "apm-legend-title");

        };
        summaryRadiusLegend(`${legendId}`, scale.summary);

        if (type == "DotPoint"){
            dotColorLegend(`${legendId}`, scale.point.color);
            dotRadiusLegend(`${legendId}`, scale.point.radius);
        } else {
            asterColorRadiusLegend(`${legendId}`, scale.point.color, scale.point.outerRadius);
            asterArcLegend(`${legendId}`);
        }
    }
          
    render(){
        var svg;
        if (!document.getElementById(`${this.rootId}-svg`)) { 
            svg = _createSvg(this.rootId, this.padding, this.dimension);
        } else {
            svg = d3.select(`#${this.rootId}-svg-g`);
        } 
        /** remove axes and points on each render. should just remove the whole svg/group? */
        d3.selectAll(`#${this.legendId}`).remove();
        d3.selectAll(".apm-points").remove();
        d3.selectAll(".apm-x-axis").remove();
        d3.selectAll(".apm-y-axis").remove();

        this._createLegend(this.rootId, this.legendId, this.type, this.scale);

        const renderAsterPoint = (dom, d, scale)=>{
            var pie = d3.pie()
                .sort(null)
                .value(function(e) { return e.arcLength; });

            var arc = d3.arc()
                .innerRadius(0)
                .outerRadius(function (e) { 
                    return scale.outerRadius(e.data.outerRadius); // d3.pie stores original attrs in .data attr
                });
            
            var path = select(`#_${dom}`).selectAll(".apm-asterpoint")
                .data(pie(d)
                    .sort(function(a, b) { return d3.ascending(a.data.outerRadius, b.data.outerRadius ); }));

            path
                .enter()
                .append("path")
                .attr("class", "apm-asterpoint")
                .attr("fill", function(e) { 
                    if (e.data.color <= 0){
                        return lightgrey;
                    } else {
                        return scale.color(e.data.color); // d3.pie stores original attrs in .data attr
                    }
                })
                .attr("stroke", function(e) { 
                    if (e.data.color == 0){
                        return lightgrey;
                    } else {
                        return scale.color(e.data.color); // d3.pie stores original attrs in .data attr
                    }
                })
                .attr("d", arc);
            
            path.exit().remove();
        };

        const renderDotPoint = (dom, d, scale)=>{
            let circle = select(`#_${dom}`).selectAll(".apm-dotpoint").data([d]);
            circle
                .enter()
                .append("circle")
                .attr("class", "apm-dotpoint")
                .attr("r", scale.radius(d.radius))
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("fill", function() { 
                    if (d.color <= 0){
                        return lightgrey;
                    } else {
                        return scale.color(d.color); 
                    }
                }); 
            circle.exit().remove();
        };
     
        // adds the y Axis
        this.yAxis = axisLeft(this.scale.y);
        let yAxisG = svg.append("g")
            .attr("class", "apm-y-axis axis--y")
            .call(this.yAxis);

        const yLabelMap = d3.map();
        this.data.forEach(function(each){
            yLabelMap.set(each.y, each.groupInfo_.geneSymbol);
        });
        /** custom y-axis tick text */
        yAxisG.selectAll(".tick text")
            .html(d=> { return yLabelMap.get(d); });
        /**
         * adds a custom grouped x-axis.. need to restructure config input for defining a grouped/non-grouped x-axis. 
         * that would require modifications in other places for parsings dataPrefixes
         */
        _createGroupedXAxis(svg, this.data, this.summary, this.dimension, this.scale, this.axis);
        
        let points = svg.append("g").attr("class", "apm-points");

        let point = points.selectAll(".apm-point").data(this.data);
        point.enter()
            .append("g")
            .attr("class", "apm-point")
            .attr("id", (d, i)=> `_${i}`) // give unique id for selecting dom for rendering points
            .attr("transform", (d) => {
                let x = this.scale.x(d.x);
                let y = this.scale.y(d.y);
                return `translate(${x}, ${y})`;
            })
            .each((d, i) =>{
                switch(this.type) {
                case "DotPoint":
                    renderDotPoint(i, d.point, this.scale.point);
                    break;
                case "AsterPoint":
                    renderAsterPoint(i, d.point, this.scale.point);
                    break;
                }
            });
        point.exit().remove();

        // plot mouse events
        svg.on("mouseout", ()=>{
            this.tooltip.hide();
        });
    }
}

function _createSvg(id, padding, dimension) {
    const root = d3.select(`#${id}`);
    if (root.empty()) {
        console.error(`Element with id ${id} not found`);
        throw `Element with id ${id} not found`;
    }
    // create svg
    return root.append("svg").attr("id", `${id}-svg`)
        .attr("width", dimension.width)
        .attr("height", dimension.height)
        .append("g")
        .attr("id", `${id}-svg-g`)
        .attr("transform", `translate(${padding.left}, ${padding.top})`);
}

function _createGroupedXAxis(svg, data, summary, dimension, scale, axis){
    /**
     * creates custom circles for x-axis. should refactor this as a custom option?
     */
    let map = d3.map();

    summary.forEach(d=>{
        map.set(`${d[`${axis.x[0]}`]}*${d[`${axis.x[1]}`]}`, d.numCells);
    });

    /**
     * @returns axisData formatted as list of objs with x, y, label, depth. formatted for input to rendering
     */
    const createAxisData = function(){
        /** creates a nested object for a grouped axis */            
        let group = d3.nest()
            .key((d)=> d.groupInfo_[`${axis.x[0]}`])
            .key((d)=> d.groupInfo_[`${axis.x[1]}`])
            .entries(data);
        /** creates a data object for each axis tick, formatted for rendering */      
        let axisObj = [];
        group.forEach((d)=> {
            axisObj.push({
                label: d.key,
                x: d.key,
                y: 0,
                depth: 0
            });
            d.values.forEach((e)=> {
                axisObj.push({
                    label: e.key,
                    x: `${d.key}*${e.key}`,
                    y:0,
                    depth: 1
                });
            });
        });
        return axisObj;
    };
    const axisData = createAxisData();

    let xAxisG = svg.append("g").attr("class", "apm-x-axis axis--x") // append a group for all axis elements to append
        .attr("transform", function(d){
            return `translate(0,${-scale.maxRadius*2})`;
        });

    xAxisG.append("text").text("Total cells")
        .attr("class", "apm-axis-title")
        .attr("x", -10)
        .attr("dy", 14)
        .attr("y", 0)
        .attr("text-anchor", "end");

    let xAxis = xAxisG.selectAll(".tick")
        .data(axisData.filter((v, i, a) => a.indexOf(v) === i))
        .enter();
    xAxis.append("g")
        .attr("class", "tick")
        .attr("transform", function(d){
            return `translate(${scale.x(d.x)},0)`;
        })
        .each(function(d){
            /** adds mouseover for depth>0 */
            d3.select(this)
                .filter(d=> d.depth > 0)
                .on("mouseover", (e=> {
                    d3.select(this).classed("active", true);
                }))
                .on("mouseleave", (e=>{
                    d3.select(this).classed("active", false);
                }));
            /** add text for ticks */
            d3.select(this)
                .append("text")
                .attr("class", (d=> {
                    if(d.depth == 0){ return "group-label"; } 
                    else { return "label"; }
                }))
                .attr("dy", 2)
                .attr("transform", function(d){
                    return `translate(0, 0)rotate(-90)`;
                })
                .html(function(d){ return d.label;})
                .style("font-size", ()=>{
                    let fontsize = scale.maxRadius*2;
                    if(fontsize >=12){
                        fontsize = 12;
                    } 
                    if(d.depth == 0){ return fontsize*.8; } 
                    else { return fontsize; }
                });
                
            /** add ticks for xGroup */
            d3.select(this)
                .append("line")
                .attr("class", (d=> {
                    if(d.depth == 0){ return "group-line"; } 
                    else { return "line"; }
                }))
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", scale.maxRadius)
                .attr("y2", dimension.innerHeight)
                .attr("stroke", lightgrey)
                .attr("stroke-width", .75);

            /** adds circles for numCells  */
            d3.select(this)
                .filter(d=> d.depth > 0)
                .append("circle")
                .attr("cx", 0)
                .attr("cy", scale.maxRadius + 2)
                .attr("r", d=> scale.summary.radius(map.get(d.x)))
                .attr("fill", ochre);
        });
    xAxis.exit().remove();
}
