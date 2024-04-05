/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
/**
 * Creates an SVG
 * @param id {String} a DOM element ID that starts with a "#"
 * @param width {Numeric}
 * @param height {Numeric}
 * @param margin {Object} with two attributes: width and height
 * @return {Selection} the d3 selection object of the SVG
 */

import {select} from "d3-selection";

export function checkDomId(id){
    // test input params
    if (select(`#${id}`).empty()) {
        let error = `Input Error: DOM ID ${id} is not found.`;
        //alert(error);
        console.warn(error);
        throw error;
    }
}

/**
 * Create a Canvas D3 object
 * @param id {String} the parent dom ID
 * @param width {Numeric}: the outer width
 * @param height {Numeric}: the outer height
 * @param margin {Object} with attr: left, top
 * @param canvasId {String}
 * @returns {*}
 */
export function createCanvas(id, width, height, margin, canvasId=undefined, position="absolute"){
    checkDomId(id);
    if(canvasId===undefined) canvasId=`${id}-canvas`;
    return select(`#${id}`)
        .append("canvas")
        .attr("id", canvasId)
        .attr("width", width)
        .attr("height", height)
        .style("position", position); // TODO: should the position be user-defined? relative vs absolute
}

/**
 * Create an SVG D3 object
 * @param id {String} the parent dom ID
 * @param width {Numeric}: the outer width
 * @param height {Numeric}: the outer height
 * @param margin {Object} with attr: left, top
 * @param svgId {String}
 * @returns {*}
 */
export function createSvg(id, width, height, margin, svgId=undefined){
    checkDomId(id);
    if (svgId===undefined) svgId=`${id}-svg`;
    if (margin===undefined) margin={top:0, left:0};
    return select("#"+id).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", svgId)
        // .style("position", position)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
}



