import {json} from "d3-fetch";
import {renderScatterPlot} from "./GTExViz.basics.js";
import {line} from "d3-shape";

const subsetColors = {
    "0": "rgba(73, 199, 112, 0.7)", 
    "1": "rgba(255, 128, 0, 0.7)", 
    "2": "rgba(20, 179, 236, 0.7)"
};

/**
 * Render the GTEx ieQTL data
 * @param {String} url: GTEx ieQTL web service URL
 * @param {String} domId: the ID of the root DOM element
 * @param {Object} config: plot config
 */
function render(url, domId, config={
    width: 550,
    height: 500,
    margin: {top: 50, right:100, bottom: 75, left: 75},
    yLabel: "normalized expression",
    xLabel: "enrichment score",
    title: "ieQTL scatter plot",
    colorLabels: ["ref", "het", "alt"]
}){
    // prepare color legend objects in to plot config
    const finalizeConfig = ()=>{
        config.colorLegend = config.colorLabels.map((d, i)=>{
            return {
                label: d,
                color: subsetColors[i.toString()]
            };
        });
    };
    finalizeConfig();

    // ping the web service of interaction eQTL for data
    json(url, {credentials: "include"})
        .then(function(raw){ 
            const data = parseIeqtlData(raw);
            const plot = renderScatterPlot(domId, config, data);
            const lineData = parseRegressionData(raw);
            renderRegressionLine(plot, lineData);
        })
        .catch(function(err){
            console.error(err);
        });
}

/**
 * Rendering regression lines on the scatter plot
 * @param {Object} plot: {svg: D3 select object, scale: {x: x scale, y: y scale}} 
 * @param {Object} data: data from parseRegressionData
 */
function renderRegressionLine(plot, data){
    const scale = plot.scale;
    const lineDef = line()
        .x((d) => scale.x(d.x))
        .y((d) => scale.y(d.y));
    data.forEach((l)=>{
        plot.svg.append("path")
            .datum(l.points)
            .attr("fill", "none")
            .style("stroke-width", 2)
            .style("stroke", l.color)
            .attr("d", lineDef);
    });
}

/**
 * Parse GTEx ieQTL web service json to get the regression data
 * @param {Json} input 
 */
function parseRegressionData(input){
    let attr = "regressionCoord";
    if(!input.hasOwnProperty(attr)) throw "Fatal Error: required attribute is missing.";
    return Object.keys(input[attr]).map((d)=>{
        let vals = input[attr][d];
        return {
            subset: d,
            color: subsetColors[d],
            points: [
                {
                    x: vals[0],
                    y: vals[2]
                },
                {
                    x: vals[1],
                    y: vals[3]
                }
            ]
        };
    });
}

/**
 * Parse GTEx ieQTL web service json to get the data for the scatter plot
 * @param {Json} input
 * Assumption: the lists of x, y, and genotypes are in the same order 
 * @returns {List} of data objects {x:Num, y: Num, color: in hexadecimal or rgb, subset: data subgroup}
 */

function parseIeqtlData(input){
    const yAttr = "data";
    const xAttr = "enrichmentScores";
    const subset = "genotypes";
    if (!input.hasOwnProperty(yAttr)||!input.hasOwnProperty(xAttr)||!input.hasOwnProperty(subset)) throw "Data structure error. Required attribute(s) not found.";
    
    // pre-defined genotype colors
    // parse data
    let data = input[subset].map((d, i)=>{
        return {
            x: parseFloat(input[xAttr][i]),
            y: parseFloat(input[yAttr][i]),
            color: subsetColors[d],
            subset: d // genotype
        };
    });
    return data;
}

export {
    render
};