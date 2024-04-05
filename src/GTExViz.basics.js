import {randomNormal} from "d3-random";
import {range, extent, mean} from "d3-array";
import {scaleLinear} from "d3-scale";
import {axisBottom, axisLeft} from "d3-axis";
import {select} from "d3-selection";

/**
 * Render a scatter plot
 * @param {List} data: a list of data objects: {x: num, y: num, color (optional): color in hex or rgb}
 * @param {String} domId: the ID of the root DOM element
 * @param {Object} config
 * @returns the root SVG D3 object
 */
function renderScatterPlot(
    domId,
    config={
        width: 550,
        height: 500,
        margin: {top: 50, right: 100, bottom: 75, left: 75},
        xLabel: "X label",
        yLabel: "Y label",
        title: "Plot title",
        colorLegend: [{label: "Foo", color: "rgba(0, 0, 0, 0.3)"}]
    },
    data
){
    // If data is not provided, generate some random data for a demo
    if (data === undefined) data = getRandomPoints(500);

    // Set all config
    const finalizeConfig = ()=>{
        config.innerWidth = config.width - (config.margin.left + config.margin.right);
        config.innerHeight = config.height - (config.margin.top + config.margin.bottom);
    }; 
    finalizeConfig();
    
    // Create scales and axes
    const scale = {
        x: scaleLinear()
            .range([0, config.innerWidth])
            .domain(extent(data, (d)=>d.x)),
        y: scaleLinear()
            .range([config.innerHeight, 0])
            .domain(extent(data, (d)=>d.y))
    };

    const axis = {
        x: axisBottom().scale(scale.x),
        y: axisLeft().scale(scale.y)
    };

    // Render
    // create the root D3 select object
    const rootG = createSvg(domId, config.width, config.height, undefined, config.margin);

    // rendering Axes
    const renderAxes = ()=>{
        const buffer = 5;
        // x axis
        rootG.append("g")
            .attr("class", "scatter-plot-x-axis")
            .attr("transform", `translate(0, ${config.innerHeight})`)
            .call(axis.x.ticks(5));
        
        rootG.append("text")
            .attr("class", "scatter-plot-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${scale.x.range()[0] + (scale.x.range()[1] - scale.x.range()[0])/2}, ${scale.y.range()[0] + 50})`)
            .text(config.xLabel);
        // y axis
        rootG.append("g")
            .attr("class", "scatter-plot-y-axis")
            .call(axis.y.ticks(5));

        rootG.append("text")
            .attr("class", "scatter-plot-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(-${buffer * 2 + select(".scatter-plot-y-axis").node().getBBox().width}, ${scale.y.range()[0] + (scale.y.range()[1] - scale.y.range()[0])/2}) rotate(-90)`)
            .text(config.yLabel);
    };
    renderAxes();

    // render plot title
    const renderTitleAndColorLegend = ()=>{
        rootG.append("text")
            .attr("class", "scatter-plot-title")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${scale.x.range()[0] + (scale.x.range()[1] - scale.x.range()[0])/2}, -30)`)
            .text(config.title);

        let legendG = rootG.append("g")
            .attr("transform", `translate(${scale.x.range()[1] + 20}, 30)`);

        legendG.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("width", config.margin.right - 30)
            .attr("height", 20*config.colorLegend.length)
            .style("stroke", "#ced1d5")
            .style("stroke-width", 1)
            .style("fill", "none");
        
        let legendItems = legendG.selectAll(".legend")
            .data(config.colorLegend)
            .enter()
            .append("g");
            
        legendItems.append("circle")
            .attr("cy", (d, i)=>10 + 20*i)
            .attr("cx", 10)
            .attr("r", 2.5)
            .style("fill", (d)=>d.color);

        legendItems.append("text")
            .attr("class", "scatter-plot-legend-text")
            .attr("x", 18)
            .attr("y", (d, i)=>14 + 20*i)
            .text((d)=>d.label);
    };
    renderTitleAndColorLegend();

    // render data points
    const renderPoints = ()=>{
        rootG.selectAll(".point")
	        .data(data)
	        .enter().append("circle")
	        .attr("class", "point")
	        .attr("r", 3.5)
	        .attr("cy", (d)=>scale.y(d.y))
            .attr("cx", (d)=>scale.x(d.x))
            .style("fill", (d)=>{
                return d.color===undefined?"rgba(0, 0, 0, 0.3)":d.color;
            });
    };
    renderPoints();
    return {
        svg: rootG,
        scale: scale
    };
}

/**
 * Get a list of points of {x:random number, y:random number}
 * @param {Integer} n: number of points 
 * @param {Object} x: {mu: mean value, sigma: standard deviation}, 
 * @param {Object} y: {mu: mean value, sigma: sd}
 */
function getRandomPoints(n, x={mu:0, sigma:1}, y={mu:0, sigma:1}){
    let points = range(0, n).map((d)=>{
        let pX = randomNormal(x.mu, x.sigma)();
        let pY = randomNormal(y.mu, y.sigma)();
        return {x: pX, y:pY};
    });
    let allX = points.map((d)=>d.x);
    let allY = points.map((d)=>d.y);
    console.info(mean(allX), extent(allX));
    console.info(mean(allY), extent(allY));
    return points;
}

/**
 * Create an SVG and an inner <g> object
 * @param id {String} the parent dom ID
 * @param width {Numeric}: the outer width
 * @param height {Numeric}: the outer height
 * @param svgId {String}
 * @param margin {Object} with attr: left, top
 * @returns {*}
 */
function createSvg(id, width, height, svgId=undefined, margin={left: 0, top: 0}){
    checkDomId(id);
    if (svgId===undefined) svgId=`${id}-svg`;
    if (margin===undefined) margin={top:0, left:0};
    return select("#"+id).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", svgId)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
}

/**
 * Check if DOM ID exist
 * @param {String} id 
 */
function checkDomId(id){
    if (select(`#${id}`).empty()) {
        let error = `Input Error: DOM ID ${id} is not found.`;
        console.warn(error);
        throw error;
    }
}

export {
    renderScatterPlot,
};