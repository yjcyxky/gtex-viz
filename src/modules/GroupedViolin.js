/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
/*
Input data structure: a list of data object with the following structure:
[
    {
        group: "group1"
        label: "dataset 1",
        values: [a list of numerical values]
     },
     {
        group: "group1"
        label: "dataset 2",
        values: [a list of numerical values]
     },
     {
        group: "group2"
        label: "dataset 3",
        values: [a list of numerical values]
     }
]
*/
import $ from "jquery"; 

import {extent, median, ascending, quantile, max} from "d3-array";
import {nest} from "d3-collection";
import {scaleBand, scaleLinear} from "d3-scale";
import {area} from "d3-shape";
import {axisTop, axisBottom, axisLeft} from "d3-axis";
import {select, event} from "d3-selection";
import {brush} from "d3-brush";
import {randomNormal} from "d3-random";

import {kernelDensityEstimator, kernel, kernelBandwidth, kdeScott} from "./kde";
import Tooltip from "./Tooltip";
import Toolbar from "./Toolbar";

export default class GroupedViolin {
    /**
     * constructor for GroupedViolin
     * @param data {List}: a list of objects with attributes: group: {String}, label: {String}, values: {List} of numerical values, size: integer, optional
     * @param groupInfo {Dictionary}: metadata of the group, indexed by group ID
     */
    constructor(data, groupInfo = {}){
        this._sanityCheck(data);
        this.data = data;
        this.groupInfo = groupInfo;
        this.toolbar = undefined;
        this.tooltip = undefined;
        // re-organized this.data indexed by groups
        this.groups = nest()
            .key((d) => {
                if (d.group === undefined) throw "required attribute does not exist";
                return d.group;
            })
            .entries(this.data);
    }

    setYDomain(yDomain){
        if (yDomain===undefined || 0 == yDomain.length){
            let allV = [];
            this.data.forEach((d) => allV = allV.concat(d.values));
            yDomain = extent(allV);
        }
        return yDomain;
    }

    /**
     * Rendering the grouped violin
     * @param {Object} dom: a D3 select object 
     * @param {Number} width 
     * @param {Number} height 
    * @param {Array} xDomain 
    * @param {Array} yDomain 
    * @param {Object} xAxisConfig 
    * @param {Object} subXAxisConfig 
    * @param {Object} yAxisConfig 
    * @param {Object} sizeAxisConfig
    * @param {Boolean} showWhisker 
    * @param {Boolean} showDivider 
    * @param {Boolean} showLegend 
    * @param {Boolean} showOutliers
    * @param {Integer} numPoints: min cutoff of data points to render data as a violin or data points
    * @param {String} vColor: violin color
    * @param {enum} kdeOption: default or kdeScott
    */
    render(
        dom,
        width=500,
        height=357,
        xDomain=undefined,
        yDomain=undefined,
        xAxisConfig = {show: true, angle: 30, paddingInner:0.01, paddingOuter: 0.01, textAnchor: "start", adjustHeight: 0, showLabels: true, showTicks: true},
        subXAxisConfig = {show: true, angle: 0, paddingInner: 0, paddingOuter: 0, sort: false, adjustHeight: 5},
        yAxisConfig = {label:"Y label"},
        sizeAxisConfig = {show: false, angle: 0, adjustHeight:undefined},
        showWhisker=false,
        showDivider=false,
        showLegend=false,
        showOutliers=false,
        numPoints=0, // shouldn't this be boolean?
        vColor=undefined,
        kdeOption="kdeScott",
    ){

        this.dom = dom;
        this.width = width;
        this.height = height;
           
        this.config = { // configs for axes
            x: xAxisConfig,
            subx: subXAxisConfig,
            y: yAxisConfig,
            size: sizeAxisConfig
        };
        // set the scales
        this.scale = {
            x: scaleBand()
                .range([0, this.width])
                .domain(xDomain||this.groups.map((d) => d.key))
                .paddingOuter(this.config.x.paddingOuter)
                .paddingInner(this.config.x.paddingInner),
            subx: scaleBand(),
            y: scaleLinear()
                .rangeRound([this.height, 0])
                .domain(this.setYDomain(yDomain)),
            z: scaleLinear() // this is the violin width, the domain and range are determined later individually for each violin
        };
        this.show = {
            whisker: showWhisker,
            outliers: showOutliers,
            divider: showDivider,
            legend: showLegend,
            points: numPoints
        };
        this.kdeOption = kdeOption;
        this.vColor = vColor;
        this.reset();
    }

    update(){
        // for each group, render its violins
        this.groups.forEach((g) => {
            g.index = this.scale.x.domain().indexOf(g.key);
            let info = this.groupInfo[g.key]; // optional

            if (info !== undefined){
                // renders group info such as p-value, group name
                this._renderGroupInfoText(info, g.key);
            }
            
            // define the sub X axis for the group's violins
            const getSubXDomain = ()=>{
                if (this.config.subx.sort) {
                    g.values.sort((a,b) => {
                        if (a.label < b.label) return -1;
                        else if (a.label > b.label) return 1;
                        return 0;
                    });
                }
                return g.values.map((d) => d.label);
            };
            this.scale.subx
                .domain(getSubXDomain())
                .range([this.scale.x(g.key), this.scale.x(g.key) + this.scale.x.bandwidth()]);

            // render each group's violins
            g.values.forEach((entry) => {
                if (0 == entry.values.length) return; // no further rendering if this group has no entries
                entry.values = entry.values.sort(ascending);
                if (this.vColor!==undefined) entry.color = this.vColor; // specify the violins' colors
                g.dom = this._drawViolin(entry, g.index);
            });

            // if indicated, show the size of each entry
            if (this.config.size.show) this._renderSizeAxis(g);

            // if indicated, show the sub-x axis
            if (this.config.subx.show) this._renderSubXAxis(g);
        });

        this._renderXAxis();
        this._renderYAxis();
        
        // plot mouse events
        this.dom.on("mouseout", ()=>{
            if(this.tooltip !== undefined) this.tooltip.hide();
        });

        // add group dividers
        if(this.show.divider) this._addGroupDivider();

        // add color legend
        if (this.show.legend) this._addLegend();
    }

    addPlotTitle(dom, title){
        let x = (this.scale.x.range()[1]-this.scale.x.range()[0] + 1) /2;
        let y = (this.scale.y.range()[1] - 10);
        dom.append("text")
            .attr("class", "violin-title")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${x}, ${y})`)
            .text(title);
    }

    /**
     * Create the tooltip object
     * @param domId {String} the tooltip's dom ID
     * @returns {Tooltip}
     */
    createTooltip(domId){
        if ($(`#${domId}`).length == 0) $("<div/>").attr("id", domId).appendTo($("body"));
        this.tooltip = new Tooltip(domId);
        select(`#${domId}`).classed("violin-tooltip", true);
        return this.tooltip;
    }

    /**
     * Create the toolbar panel
     * @param domId {String} the toolbar's dom ID
     * @param tooltip {Tooltip}
     * @returns {Toolbar}
     */

    createToolbar(domId, tooltip){
        if (tooltip === undefined) tooltip = this.createTooltip(domId);
        this.toolbar = new Toolbar(domId, tooltip);

        return this.toolbar;
    }

    /**
     * Add a brush to the plot
     * @param dom {D3} Dom element
     */
    addBrush(dom){
        const theBrush = brush();
        theBrush.on("end", ()=>{this.zoom(dom, theBrush);});
        dom.append("g")
            .attr("class", "brush")
            .call(theBrush);
    }

    zoom(dom, theBrush){
        let s = event.selection,
            idelTimeout,
            idelDelay = 350;
        if (theBrush === undefined){
            this.reset();
        }
        else if (!s) {
            if (!idelTimeout) return idelTimeout = setTimeout(function () {
                idelTimeout = null;
            }, idelDelay);
            this.reset();
        }
        else {
            // reset the current scales' domains based on the brushed window
            this.scale.x.domain(this.scale.x.domain().filter((d, i)=>{
                const lowBound = Math.floor(s[0][0]/this.scale.x.bandwidth());
                const upperBound = Math.floor(s[1][0]/this.scale.x.bandwidth());
                return i >= lowBound && i <=upperBound;
            })); // TODO: add comments

            const min = Math.floor(this.scale.y.invert(s[1][1]));
            const max = Math.floor(this.scale.y.invert(s[0][1]));
            this.scale.y.domain([min, max]); // todo: debug

            dom.select(".brush").call(theBrush.move, null);
        }

        // zoom
        let t = dom.transition().duration(750);
        dom.select(".axis--x").transition(t).call(this.xAxis);
        dom.select(".axis--y").transition(t).call(this.yAxis);

        this.groups.forEach((gg)=> {
            let group = gg.key;
            let entries = gg.values;

            // re-define the subx's range
            this.scale.subx
                .range([this.scale.x(group), this.scale.x(group) + this.scale.x.bandwidth()]);

            entries.forEach((entry) => {
                if (0 == entry.values.length) return; // no further rendering if this group has no entries
                this.scale.x.domain().indexOf(group);

                // re-define the scale.z's range
                this.scale.z
                    .range([this.scale.subx(entry.label), this.scale.subx(entry.label) + this.scale.subx.bandwidth()]);

                // re-render the violin
                const g = dom.select(`#violin${gg.index}-${entry.label}`);
                g.select(".violin")
                    .transition(t)
                    .attr("d", area()
                        .x0((d) => this.scale.z(d[1]))
                        .x1((d) => this.scale.z(-d[1]))
                        .y((d) => this.scale.y(d[0]))
                    );

                // re-render the box plot
                // interquartile range
                const q1 = quantile(entry.values, 0.25);
                const q3 = quantile(entry.values, 0.75);
                const z = 0.1;
                g.select(".violin-ir")
                    .transition(t)
                    .attr("x", this.scale.z(-z))
                    .attr("y", this.scale.y(q3))
                    .attr("width", Math.abs(this.scale.z(-z) - this.scale.z(z)))
                    .attr("height", Math.abs(this.scale.y(q3) - this.scale.y(q1)));

                // the median line
                const med = median(entry.values);
                g.select(".violin-median")
                    .transition(t)
                    .attr("x1", this.scale.z(-z))
                    .attr("x2", this.scale.z(z))
                    .attr("y1", this.scale.y(med))
                    .attr("y2", this.scale.y(med));
            });
        });

    }

    reset() {
        this.dom.selectAll("*").remove();
        this.update();
    }

    updateData(data, reset=false, showOutliers=true){
        this.data = data;
        this.groups = nest()
            .key((d) => {
                if (d.group === undefined) throw "required attribute does not exist";
                return d.group;
            })
            .entries(this.data);
        this.updateYScale();
        this.updateXScale();
        this.show.outliers = showOutliers;
        if (reset) this.reset();
    }

    updateYScale(yLabel=undefined, yDomain=undefined, reset=false) {
        if (yLabel !== undefined) this.config.y.label = yLabel;
        this.scale.y = scaleLinear()
            .rangeRound([this.height, 0])
            .domain(this.setYDomain(yDomain));
        if (reset) this.reset();
    }

    updateXScale(xDomain=undefined, reset=false) {
        this.scale.x = scaleBand()
            .range([0, this.width])
            .domain(xDomain||this.groups.map((d) => d.key))
            .paddingOuter(this.config.x.paddingOuter)
            .paddingInner(this.config.x.paddingInner);
        if(reset) this.reset();
    }

    /**
     * render the violin and box plots
     * @param dom {D3 DOM}
     * @param entry {Object} with attrs: values, label
     * @param gIndex
     * @private
     */
    _drawViolin(entry, gIndex){
        const resetZScale = (zMax)=>{
            this.scale.z
                .domain([-zMax, zMax])
                .range([this.scale.subx(entry.label), this.scale.subx(entry.label) + this.scale.subx.bandwidth()]);
        };
        const vertices = this._generateVertices(entry.values, this.kdeOption);
        // visual rendering
        const violinG = this.dom.append("g")
            .attr("id", `violin${gIndex}-${entry.label}`)
            .attr("class", "violin-g")
            .datum(entry);
        // violin plot and box can only be drawn when vertices exist and there are no NaN points
        if (entry.values.length > this.show.points && vertices.length && this._validVertices(vertices)) {
            // reset the z scale -- the violin width
            let zMax = max(vertices, (d)=>Math.abs(d[1])); // find the abs(value) in vertices
            resetZScale(zMax);

            // statistics of entry.values
            const q1 = quantile(entry.values, 0.25);
            const q3 = quantile(entry.values, 0.75);
            const iqr = Math.abs(q3-q1);
            const cutoff = extent(entry.values.filter((d)=>d<=q3+(iqr*1.5)));
            const upper = cutoff[1];
            const lower = cutoff[0];
            const med = median(entry.values);

            this._renderViolinShape(violinG, entry, vertices, med, gIndex%2==0);
            if (entry.showBoxplot===undefined || entry.showBoxplot) this._renderBoxPlot(violinG, entry, lower, upper, q1, q3, med);
            // outliers
            if (this.show.outliers) {
                const outliers = entry.values.filter((d)=>d<lower||d>upper);
                this._renderDataDots(violinG, {values:outliers, color: entry.color}, 1);
            } 
            if (entry.showPoints) {
                this._renderDataDots(violinG, entry, 1);
            }
        }
        else if (this.show.points>0) {
            // define the z scale -- the violin width
            let zMax = max(entry.values, (d)=>Math.abs(d)); // find the abs(value) in entry.values
            resetZScale(zMax);
            this._renderDataDots(violinG, entry, 1);
        }
        return violinG;
    }

    _renderViolinShape(g, entry, vertices, med, isEvenNumber, oddColor="#94a8b8", evenColor="#90c1c1"){
        let violin = area()
            .x0((d) => this.scale.z(entry.showHalfViolin=="left"?0:d[1]))
            .x1((d) => this.scale.z(entry.showHalfViolin=="right"?0:-d[1]))
            .y((d) => this.scale.y(d[0]));
        const getColor = ()=>{
            if (entry.color !== undefined) return entry.color;
            // alternate the odd and even colors, maybe we don't want this feature
            if(isEvenNumber) return evenColor;
            return oddColor;
        };
        const vPath = g.append("path")
            .datum(vertices)
            .attr("d", violin)
            .classed("violin", true)
            .style("fill", entry.fill?entry.fill:getColor)
            .style("stroke", entry.stroke?entry.stroke:getColor);
        // mouse events
        g.on("mouseover", ()=>{
            vPath.classed("highlighted", true);
            // console.log(entry);
            if(this.tooltip === undefined) console.warn("GroupViolin Warning: tooltip not defined");
            else {
                this.tooltip.show(
                    entry.group + "<br/>" +
                    entry.label + "<br/>" +
                    "Median: " + med.toPrecision(4) + "<br/>");
            }
        });
        g.on("mouseout", ()=>{
            vPath.classed("highlighted", false);
        });
    }

    _renderBoxPlot(g, entry, lower, upper, q1, q3, med){
        // boxplot
       
        const z = this.scale.z.domain()[1]/3;

        if(this.show.whisker){
            // the upper and lower limits of entry.values
   
            g.append("line") // or dom?
                .classed("whisker", true)
                .attr("x1", this.scale.z(0))
                .attr("x2", this.scale.z(0))
                .attr("y1", this.scale.y(upper))
                .attr("y2", this.scale.y(lower))
                .style("stroke", "#fff");
        }

        // interquartile range
        g.append("rect")
            .attr("x", entry.showHalfViolin=="right"?this.scale.z(0):this.scale.z(-z))
            .attr("y", this.scale.y(q3))
            .attr("width", entry.showHalfViolin===undefined?Math.abs(this.scale.z(-z)-this.scale.z(z)):Math.abs(this.scale.z(0)-this.scale.z(z)))
            .attr("height", Math.abs(this.scale.y(q3) - this.scale.y(q1)))
            .style("fill", entry.altColor||"#555f66")
            .style("stroke-width", 0.2);

        // median
        g.append("line") // the median line
            .attr("x1", entry.showHalfViolin=="right"?this.scale.z(0):this.scale.z(-z))
            .attr("x2", entry.showHalfViolin=="left"?this.scale.z(0):this.scale.z(z))
            .attr("y1", this.scale.y(med))
            .attr("y2", this.scale.y(med))
            .attr("class", "violin-median");
    }

    _renderDataDots(g, entry, r=2){
        const z = this.scale.z.domain()[1];
        const jitter = randomNormal(0, z/4);

        g.append("g")
            .attr("class", "violin-points")
            .selectAll("circle")
            .data(entry.values)
            .enter()
            .append("circle")
            .attr("cx", ()=>{
                let x = this.scale.z(entry.showHalfViolin=="left"?-Math.abs(jitter()):Math.abs(jitter()));
                return x;
            })
            .attr("cy", (d)=>this.scale.y(d))
            .attr("fill", entry.color)
            .attr("r", r);
    }

    _sanityCheck(data){
        const attr = ["group", "label", "values"];

        data.forEach((d) => {
            attr.forEach((a) => {
                if (d[a] === undefined) throw "GroupedViolin: input data error.";
            });
            // if (0 == d.values.length) throw "Violin: Input data error";
        });
    }

    _addGroupDivider(){
        const groups = this.scale.x.domain();
        const padding = Math.abs(this.scale.x(this.scale.x.domain()[1]) - this.scale.x(this.scale.x.domain()[0]) - this.scale.x.bandwidth());

        const getX = (g, i)=> {
            if (i !== groups.length - 1) {
                return this.scale.x(g) + +this.scale.x.bandwidth() + (padding/2);
            }
            else {
                return 0;
            }
        };

        this.dom.selectAll(".vline").data(groups)
            .enter()
            .append("line")
            .classed("vline", true)
            .attr("x1", getX)
            .attr("x2", getX)
            .attr("y1", this.scale.y.range()[0])
            .attr("y2", this.scale.y.range()[1])
            .style("stroke-width", (g, i)=>i!=groups.length-1?1:0)
            .style("stroke", "rgb(86,98,107)")
            .style("opacity", 0.5);

    }

    _addLegend(){
        const legendG = this.dom.append("g")
            .attr("id", "violinLegend")
            .attr("transform", "translate(0, 0)");

        legendG.append("rect")
            .attr("x", this.scale.x.range()[0])
            .attr("y", -35)
            .attr("width", 60*(this.groups[0].values.length) + 10)
            .attr("height", 24)
            .style("fill", "none")
            .style("stroke", "silver");

        const legends = legendG.selectAll(".violin-legend").data(this.groups[0].values);

        const g = legends.enter().append("g").classed("violin-legend", true);
        const w = 10;
        g.append("rect")
            .attr("x", (d, i) => 5 + 60*(i)  + this.scale.x.range()[0])
            .attr("y", -28)
            .attr("width", w)
            .attr("height", w)
            .style("fill", (d) => d.color);

        g.append("text")
            .attr("class", "violin-legend-text")
            .text((d) => d.label)
            .attr("x", (d, i) => 17 + 60*(i) + this.scale.x.range()[0])
            .attr("y", -20);
    }

    _renderGroupInfoText(info, group){
        const groupInfoDom = this.dom.append("g");
        const groupLabels = groupInfoDom.selectAll(".violin-group-label")
            .data(["pvalue"]);
        groupLabels.enter().append("text") // Code review: consider moving this part to the eQTL dashboard
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "violin-group-label")
            .attr("text-anchor", "middle")
            .attr("fill", (d) => {
                return d=="pvalue"&&parseFloat(info[d])<=parseFloat(info["pvalueThreshold"])?"orangered":"SlateGray";
            })
            .attr("transform", () => {
                let x = this.scale.x(group) + this.scale.x.bandwidth()/2;
                let y = this.scale.y(this.scale.y.domain()[0]) + 50; // todo: avoid hard-coded values
                return `translate(${x}, ${y})`;
            })
            .text((d) => `${d}: ${parseFloat(parseFloat(info[d]).toPrecision(3)).toExponential()}`);
    }

    _renderXAxis(){
        let buffer = this.config.subx.show?55:0; // Code review: hard-coded values
        const config = this.config.x;

        if (config.show){
            this.xAxis = config.direction=="top"?axisTop(this.scale.x):axisBottom(this.scale.x);
            if (config.hideLabels) {
                this.Axis = this.xAxis.tickFormat("");
            }
            if (config.hideTicks){
                this.Axis = this.xAxis.tickSize(0);
            }
            this.dom.append("g")
                .attr("class", "violin-x-axis axis--x")
                .attr("transform", `translate(0, ${config.adjustHeight!==undefined?config.adjustHeight:(this.height + buffer)})`)
                .call(this.xAxis) // set tickFormat("") to show tick marks without text labels
                .selectAll("text")
                .attr("text-anchor", config.textAnchor?config.textAnchor:"start")
                .attr("transform", `rotate(${config.angle}, 0, 10)`);
        } 
    }

    _renderYAxis(reset=false){
        // adds the y Axis
        let buffer = 5;
        this.yAxis = axisLeft(this.scale.y)
            .tickValues(this.scale.y.ticks(5));
        
        if (reset) this.dom.select(".violin-y-axis").empty().remove();
        this.dom.append("g")
            .attr("class", "violin-y-axis axis--y")
            .attr("transform", `translate(-${buffer}, 0)`)
            .call(this.yAxis);

        // adds the text label for the y axis
        this.dom.append("text")
            .attr("class", "violin-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(-${buffer * 2 + select(".violin-y-axis").node().getBBox().width}, ${this.scale.y.range()[0] + (this.scale.y.range()[1] - this.scale.y.range()[0])/2}) rotate(-90)`)
            .text(this.config.y.label);
    }

    _renderSizeAxis(g){
        let sizeMapper = {};
        g.values.forEach((d) => sizeMapper[d.label] = `(${d.size||d.values.length})`);
        const sizeScale = scaleBand()
            .domain(g.values.map((d) => {return d.label;}))
            .rangeRound([this.scale.x(g.key), this.scale.x(g.key) + this.scale.x.bandwidth()]);
        
        let sizeAxis = axisBottom(sizeScale).tickFormat((d) => {return sizeMapper[d];});
        const buffer = this.height + 18;
        const config = this.config.size;
        const sizeG = g.dom.append("g")
            .attr("class", "violin-size-axis")
            .attr("transform", `translate(0, ${config.adjustHeight||buffer})`)
            .call(sizeAxis);
        if (config.angle > 0) {
            sizeG.selectAll("text")
                .attr("text-anchor", "start")
                .attr("transform", `rotate(${config.angle}, 2, 10)`);
        }
    }

    _renderSubXAxis(g){
        const config = this.config.subx;
        const buffer = config.adjustHeight?config.adjustHeight:5;
        let subXAxis = axisBottom(this.scale.subx);
        if (config.hideTicks){
            subXAxis = subXAxis.tickSize(0);
        }
        const subxG = g.dom.append("g")
            .attr("class", "violin-sub-axis")
            .attr("transform", `translate(0, ${this.height + buffer})`)
            .call(subXAxis);

        if (config.angle > 0) {
            subxG.selectAll("text")
                .attr("text-anchor", "start")
                .attr("transform", `rotate(${config.angle}, 2, 10)`);
        }
    }

    /**
     * generate vertices for the violin
     * @param {List} values: object with attribute: values-- a list of numbers
     * @param {enum} kdeOption: default or kdeScott
     * @returns 
     */
    _generateVertices(values, kdeOption){
        let kde = kernelDensityEstimator(
            kernel.gaussian,
            this.scale.y.ticks(100), // use up to 100 vertices along the Y axis (to create the violin path)
            kernelBandwidth.nrd(values) // estimate the bandwidth based on the data
        );
        const eDomain = extent(values); // get the max and min in values
        let vertices = kdeOption=="default"?kde(values): kdeScott(values);
        vertices = vertices.filter((d)=>{
            return d[0]>=eDomain[0]&&d[0]<=eDomain[1];
        }); // filter the vertices that aren't in the values;
        return vertices;
    }

    _validVertices(vertices) {
        let vals = vertices.reduce((a, b)=>a.concat(b), []);
        let invalidVertices = vals.filter(d=>isNaN(d));

        return !(invalidVertices.length);
    }
}
