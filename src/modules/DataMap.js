/**
 * Copyright © 2015 - 2019 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */



import {scaleBand, scaleLinear, scaleSqrt} from "d3-scale";
import {nest} from "d3-collection";

import {axisBottom, axisLeft, axisRight} from "d3-axis";
import {select, selectAll} from "d3-selection";
import {max, min} from "d3-array";
import Tooltip from "./Tooltip";

export default class DataMap {

    constructor(data, colorScheme="Reds"){
        this.data = data;
        this.colorScheme = colorScheme;
        this.xScale = undefined;
        this.yScale = undefined;
        this.ghScale = {}; // group hScales indexed by group
        this.cScale = undefined;
        this.tooltip = undefined;
    }

    addTooltip(parentId, tooltipCssClass="bar-map-tooltip"){
        // error-checking
        if (select(`#${parentId}`).empty()) throw "DOM ID is missing: " + parentId;
        let parent = select(`#${parentId}`);
        let tooltipId = parentId + "-tooltip";
        if (select(`#${tooltipId}`).empty()) parent.append("div").attr("id", tooltipId);
        this.tooltip = new Tooltip(tooltipId);
        select(`#${tooltipId}`).classed(tooltipCssClass, true);
    }

    renderWithNewXDomain(dom, domain, mapType, renderAxis=false){
        this.xScale.domain(domain);
        let bw = this.xScale.bandwidth();
        if(renderAxis) this._renderXAxis(dom);
        if (mapType=="barmap"){
            dom.selectAll(".bar-row").selectAll("rect")
                .attr("x", (d)=>this.xScale(d.x)||0)
                .attr("width", (d)=>this.xScale(d.x)===undefined?0:bw);
        } else {
            this._setRScale();
            dom.selectAll(".map-bubble")
                .attr("cx", (d)=>this.xScale(d.x) + this.xScale.bandwidth()/2||0)
                .attr("r", (d)=>this.xScale(d.x)===undefined?0:this.rScale(d.r));

            dom.selectAll(".map-grid-vline")
                .attr("x1", (d)=>this.xScale(d) + this.xScale.bandwidth()/2 ||0)
                .attr("x2", (d)=>this.xScale(d) + this.xScale.bandwidth()/2 ||0)
                .attr("stroke-width", (d)=>this.xScale(d)>=0?0:0.3);
        }
    }

    /**
     * Render and define the visualization
     * @param {D3} dom 
     * @param {Object{w,h,top,left}?} dimensions 
     * @param {String} type barmap or bubblemap 
     * @param {Boolean} setGroupHScale 
     * @param {Function} tooltipCallback 
     */
    drawSvg(dom, dimensions={w:1000, h: 600, top:0, left: 0}, type="barmap", setGroupHScale=false, tooltipCallback=undefined, showGrids=false, bubbleDomain=[0, 50]){
        if (tooltipCallback !== undefined) this.tooltipCallback = tooltipCallback;
        if (this.xScale=== undefined || this.yScale===undefined || this.cScale===undefined) this.setScales(dimensions);
        this._renderAxes(dom);
        let clipped = this._createClipPath(dom, dimensions);
        if (type=="barmap") {
            this.renderBars(dom, clipped, setGroupHScale);
        }
        else if (type=="bubbleNoClip"){
            this.renderBubbles(dom, bubbleDomain, showGrids, tooltipCallback);
        }
        else {
            this.renderBubbles(clipped, bubbleDomain, showGrids, tooltipCallback);
        }
    }

    setScales(dimensions, xlist=undefined, ylist=undefined){
        this._setXScale(dimensions, xlist);
        this._setYScale(dimensions, ylist);
        this._setCScale();
    }

    _createClipPath(dom, dim){
        dom.classed("data-area", true);
        dom.append("defs")
            .append("clipPath") // defines a clip path
            .attr("id", "data-map-clip")
            .append("rect")
            .attr("width", dim.w)
            .attr("height", dim.h*2) // weird fix: add a factor to fix some cropping in the clip path
            .attr("fill", "none")
            .attr("stroke", "silver");
        return dom.append("g") // renders the clip path
            .attr("clip-path", "url(#data-map-clip)")
            .classed("clippedArea", true);
    }

    /**
     * Set X scale to a scale band
     * reference: https://github.com/d3/d3-scale#scaleBand
     * @param dim
     * @param xlist {List} of x. optional. User-defined list of x.
     */
    _setXScale(dim={w:1000, left:20}, xlist = undefined, padding=0.05){
        // param error checking
        const createErrorMessage = (v, message)=>{
            console.error(`This value is invalid: ${v}`);
            throw message;
        };
        if (isNaN(dim.w)) createErrorMessage(dim.w, "ValueError");
        if (isNaN(dim.left)) createErrorMessage(dim.left, "ValueError");
        if (xlist === undefined) {
            let xset = new Set(this.data.map((d)=>d.x));
            xlist = [...xset].sort((a, b) => {return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;});
        }
        this.xScale = scaleBand()
            .domain(xlist)
            .range([dim.left, dim.left+dim.w])
            .padding(padding);
    }

    /**
     * Set Y scale to a scale band
     * reference: https://github.com/d3/d3-scale#scaleBand
     * @param dim
     * @param xlist {List} of x. optional. User-defined list of x.
     */
    _setYScale(dim={h:600, top:20}, ylist = undefined, padding=0.3){
        if (ylist === undefined) {
            let yset = new Set(this.data.map((d)=>d.y));
            ylist = [...yset];
        }
        ylist.sort((a, b) => {return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;});

        this.yScale = scaleBand()
            .domain(ylist)
            .range([dim.top, dim.top+dim.h])
            .padding(padding);

    }

    _setCScale(domain=[-0.5, 0, 0.5]){
        this.cScale = scaleLinear()
            .domain(domain)
            .range(["#129cff", "#ffffff", "#f53956"]);
    }

    // _setRScale(dMax, dMin){
    _setRScale(dMin=0, dMax=5){
        if (dMin === undefined) dMin = min(this.data.map((d)=>d.r));
        if (dMax === undefined) dMax = max(this.data.map((d)=>d.r));
        this.rScale = scaleSqrt()
            .domain([dMin, dMax])
            .range([0, max([this.xScale.bandwidth(), this.yScale.bandwidth()])/2]);
        return this.rScale;
    }

    _renderAxes(g){
        this._renderXAxis(g);
        this._renderYAxis(g);
    }

    _renderXAxis(g){
        let axis = axisBottom(this.xScale).tickSize(0); // show no tick marks
        g.select(".bar-map-x-axis").remove(); // remove previously rendered X axis;
        let Y = this.yScale.range()[1];
        if (Y===undefined || isNaN(Y)) {
            console.error(`This value must be defined: ${Y}`);
            throw "Value Error";
        }
        g.append("g")
            .attr("class", "bar-map-x-axis")
            .attr("transform", `translate(0, ${Y})`)
            .call(axis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("class", "bar-map-x-label")
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");
    }

    _renderYAxis(g){
        let axis = axisLeft(this.yScale).tickSize(0);
        g.append("g")
            .attr("class", "bar-map-y-axis")
            .call(axis)
            .selectAll("text")
            .attr("class", "bar-map-y-label");
    }

    renderBubbles(g, domain=[0, 10], showGrids=false, tooltipCallback){
        let rScale = this._setRScale(domain[0], domain[1]);
        let cScale = this.cScale;
        g.selectAll(".data-bar").remove(); // make sure it's clean g
        selectAll(".h-axis").remove();

        let gridG = g.append("g");
        let bubbleG = g.append("g");
        let yDomain = new Set(this.yScale.domain());
        let xDomain = new Set(this.xScale.domain());
        const radius = {
            x: this.xScale.bandwidth()/2,
            y: this.yScale.bandwidth()/2
        };
        if (showGrids){
            // TODO: code refactoring
            gridG.selectAll(".map-grid-hline")
                .data(this.yScale.domain())
                .enter()
                .append("line")
                .classed("map-grid-hline", true)
                .attr("x1", this.xScale.range()[0] + radius.x)
                .attr("x2", this.xScale.range()[1] + radius.x)
                .attr("y1", (d)=>this.yScale(d)+radius.y)
                .attr("y2", (d)=>this.yScale(d)+radius.y)
                .style("stroke", "lightgrey")
                .style("stroke-width", 0.3);
            
            gridG.selectAll(".map-grid-vline")
                .data(this.xScale.domain())
                .enter()
                .append("line")
                .classed("map-grid-vline", true)
                .attr("x1", (d)=>this.xScale(d) + radius.x)
                .attr("x2", (d)=>this.xScale(d) + radius.x)
                .attr("y1", this.yScale.range()[0] + radius.y)
                .attr("y2", this.yScale.range()[1] - radius.y)
                .style("stroke", "lightgrey")
                .style("stroke-width", 0.3);
        }
        
        let bubbles = bubbleG.selectAll(".map-bubble")
            .data(this.data.filter((d)=>yDomain.has(d.y)&&xDomain.has(d.x)))
            .enter()
            .append("circle")
            .classed("map-bubble", true)
            .attr("cx", (d) => this.xScale(d.x) + radius.x)
            .attr("cy", (d) => this.yScale(d.y) + radius.y) // the attr r is originally for radius...
            .attr("r", (d)=>{
                return rScale(d.r)<1?1:rScale(d.r);
            })
            .attr("fill", (d)=>{
                if (isNaN(d.value)) return "darkgrey";
                return cScale(d.value);
            })
            .attr("opacity", 0.95)
            .attr("stroke", "#aaaaaa")
            .attr("cursor", "pointer");

        let tooltip = this.tooltip;
        if (tooltipCallback === undefined) {
            if (this.tooltipCallback !== undefined) tooltipCallback = this.tooltipCallback;
            else {
                tooltipCallback = (d)=>{
                    const tooltipData = [
                        `<span class="tooltip-key">Row</span>: <span class="tooltip-value">${d.y}</span>`,
                        `<span class="tooltip-key">Column</span>: <span class="tooltip-value">${d.x}</span>`,
                        `<span class="tooltip-key">Color value</span>: <span class="tooltip-value">${d.value.toPrecision(5)}</span>`,
                        `<span class="tooltip-key">Bubble size</span>: <span class="tooltip-value">${d.r.toPrecision(5)}</span>`
                    ];
                    return tooltipData.join("<br/>");
                };
            }
        }
        bubbles.on("mouseover", function(d){
            tooltip.show(tooltipCallback(d));
            select(this).classed("hover", true);
        })
            .on("mouseout", function(){
                tooltip.hide();
                select(this).classed("hover", false);
            });
    }
    renderBars(g, clipped, groupHScale=false, tooltipCallback=undefined){
        clipped.selectAll(".map-bubble").remove(); // make sure it's clean g
        g.selectAll(".map-grid-hline").remove();
        g.selectAll(".map-grid-vline").remove();
        g.selectAll(".h-axis").remove(); // remove existing h-axis components
        let cScale = this.cScale;
        let nest_data = nest()
            .key((d)=>d.y)
            .entries(this.data);

        let grouped_data = nest()
            .key((d)=>d.dataType)
            .entries(this.data);

        let groups = grouped_data.reduce((arr, d)=>{
            arr[d.key] = 0;
            return arr;
        }, {});

        Object.keys(groups).forEach((k)=>{
            let dMax = max(grouped_data.filter((g)=>g.key==k)[0].values.map((d)=>d.r));
            this.ghScale[k] = scaleLinear()
                .rangeRound([0, -this.yScale.bandwidth()])
                .domain([0, dMax]);
        });

        let rows = new Set(this.yScale.domain()); // yScale.domain() controls what rows to render
        nest_data.forEach((row)=> {
            if (!rows.has(row.key)) return; // if the yScale domain does not have this row, then skip this row
            let hScale = undefined;
            if (groupHScale){
                // use a global scale
                let type = row.values[0].dataType;
                hScale = this.ghScale[type];
            }
            else{
                let dMax = max(row.values, (d) => d.r); // find the maximum value for each row
                hScale = scaleLinear()
                    .rangeRound([0, -this.yScale.bandwidth()])
                    .domain([0, dMax]);

            }

            let rowG = clipped.append("g")
                .classed("bar-row", true);

            // add a row baseline to help visual alignment
            rowG.append("line")
                .attr("class", row.key.split(/-|\s/)[0])
                .attr("x1", this.xScale.range()[0])
                .attr("x2", this.xScale.range()[1])
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("transform", `translate(0, ${this.yScale(row.key)+this.yScale.bandwidth()})`)
                .style("stroke", "#efefef");

            let hAxis = axisRight(hScale).ticks(2);
            g.append("g")
                .attr("class", "h-axis")
                .attr("transform", `translate(${this.xScale.range()[1] + 3}, ${this.yScale(row.key)+this.yScale.bandwidth()})`)
                .call(hAxis)
                .selectAll("text")
                .attr("font-size", 6);

            let bars = rowG.selectAll(".data-bar")
                .data(row.values)
                .enter()
                .append("rect")
                .attr("class", "data-bar")
                .attr("rx", 2)
                .attr("x", (d) => this.xScale(d.x)||0)
                .attr("y", (d) => this.yScale(d.y) + this.yScale.bandwidth() + hScale(d.r)) // the attr r is originally for radius...
                .attr("width", (d)=>this.xScale(d.x)===undefined?0:this.xScale.bandwidth())
                .attr("height", (d) => {
                    return Math.abs(hScale(d.r));
                })
                .attr("fill", (d)=>{
                    if (isNaN(d.value)) return "darkgrey";
                    return cScale(d.value);
                })
                .attr("stroke","#aaaaaa");

            let tooltip = this.tooltip;
            if (tooltipCallback === undefined) {
                if (this.tooltipCallback !== undefined) tooltipCallback = this.tooltipCallback;
                else {
                    tooltipCallback = (d)=>{
                        const tooltipData = [
                            `<span class="tooltip-key">Row</span>: <span class="tooltip-value">${d.y}</span>`,
                            `<span class="tooltip-key">Column</span>: <span class="tooltip-value">${d.x}</span>`,
                            `<span class="tooltip-key">Value</span>: <span class="tooltip-value">${d.value}</span>`,
                            `<span class="tooltip-key">Height</span>: <span class="tooltip-value">${d.r}</span>`
                        ];
                        return tooltipData.join("<br/>");
                    };
                }
            }
            bars.on("mouseover", function(d){
                tooltip.show(tooltipCallback(d));
                select(this).classed("hover", true);
            })
                .on("mouseout", function(){
                    tooltip.hide();
                    select(this).classed("hover", false);
                });
        });
    }

    drawBubbleLegend(dom, title="bubble legend", config={x:0, y:0}, data=[5, 10, 20, 40, 80], cell=20, orientation){
        // legend groups
        dom.select("#dataMap-bubble-legend").remove(); // make sure there is no redundant rendering
        dom.selectAll(".bubble-legend").remove();
        const legends = dom.append("g")
            .attr("id", "dataMap-bubble-legend")
            .attr("transform", `translate(${config.x}, ${config.y})`)
            .selectAll(".legend").data(data);

        const g = legends.enter().append("g").classed("legend", true);

        if (orientation == "h"){
            // a horizontal bubble strip
            dom.append("text")
                .attr("class", "bubble-legend color-legend")
                .text(title)
                .attr("x", 0)
                .attr("text-anchor", "end")
                .attr("y", -5)
                .attr("transform", `translate(${config.x}, ${config.y})`);

            g.append("circle")
                .attr("cx", (d, i) => cell*i)
                .attr("cy", 0)
                .attr("r", (d)=>this.rScale(d)<0?1:this.rScale(d))
                .style("fill", "#ababab");

            g.append("text")
                .attr("class", "color-legend")
                .text((d)=>d)
                .attr("x", (d, i) => cell * i - 10)
                .attr("y", 20);
        } else {
            // a vertical bubble strip
            dom.append("text")
                .attr("class", "bubble-legend color-legend")
                .text(title)
                .attr("x", 5)
                .attr("text-anchor", "start")
                .attr("y", 0)
                .attr("transform", `translate(${config.x}, ${config.y + cell * (data.length)})`);

            g.append("circle")
                .attr("cx", 0)
                .attr("cy", (d, i) => cell*i)
                .attr("r", (d)=>this.rScale(d)<0?0:this.rScale(d))
                .style("fill", "#ababab");

            g.append("text")
                .attr("class", "color-legend")
                .text((d)=>d)
                .attr("x", 10)
                .attr("y", (d, i) => cell * i + 5);
        }
    }

    drawColorLegend(dom, title="color legend", config={x:0, y:0}, cell={w: 30, h:5}, data=[-1, -0.5, -0.25, 0, 0.25, 0.5, 1], orientation="v"){
        // legend groups
        const legends = dom.append("g")
            .attr("transform", `translate(${config.x}, ${config.y})`)
            .selectAll(".legend").data(data);

        const g = legends.enter().append("g").classed("legend", true);

        if (orientation == "h") {
            // a horizontal color strip
            dom.append("text")
                .attr("class", "color-legend")
                .text(title)
                .attr("x", 0)
                .attr("text-anchor", "end")
                .attr("y", -5)
                .attr("transform", `translate(${config.x}, ${config.y})`);

            g.append("rect")
                .attr("x", (d, i) => cell.w*i)
                .attr("y", 0)
                .attr("rx", 2)
                .attr("width", cell.w)
                .attr("height", cell.h)
                .style("fill", (d)=>this.cScale(d));

            g.append("text")
                .attr("class", "color-legend")
                .text((d)=>d)
                .attr("x", (d, i) => cell.w * i)
                .attr("y", cell.h + 15);
        } else {
            // a vertical color strip
            dom.append("text")
                .attr("class", "color-legend")
                .text(title)
                .attr("x", 5)
                .attr("text-anchor", "start")
                .attr("y", 0)
                .attr("transform", `translate(${config.x}, ${config.y + cell.h * (data.length + 1)})`);

            g.append("rect")
                .attr("x", 0)
                .attr("y", (d, i) => cell.h*i)
                .attr("width", cell.w)
                .attr("height", cell.h)
                .style("fill", (d)=>this.cScale(d));

            g.append("text")
                .attr("class", "color-legend")
                .text((d)=>d)
                .attr("x", 10)
                .attr("y", (d, i) => cell.h * i + (cell.h/2));
        }  
    }
}