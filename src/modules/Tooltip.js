/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
// import {select, event} from "d3-selection";
// import transition from 'd3-transition';
import * as d3 from "d3";

export default class Tooltip {
    constructor(id, verbose=false, offsetX=30, offsetY=-40, duration=100){
        this.id = id;
        this.verbose = verbose;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.duration = duration;
    }

    show(info) {
        if(this.verbose) console.log(info);
        this.edit(info);
        this.move();
        d3.select("#" + this.id)
            .style("display", "inline")
            .transition()
            .duration(this.duration)
            .style("opacity", 1.0);
    }

    hide() {
        d3.select("#" + this.id)
            .transition()
            .duration(this.duration)
            .style("opacity", 0.0);
        this.edit("");
    }

    move(x = d3.event.pageX, y = d3.event.pageY) {
        if (this.verbose) {
            console.log(x);
            console.log(y);
        }
        x = x + this.offsetX; // TODO: get rid of the hard-coded adjustment
        y = (y + this.offsetY)<0?10:y+this.offsetY;
        d3.select("#"+this.id)
            .style("left", `${x}px`)
            .style("top", `${y}px`);
    }

    edit(info) {
        d3.select("#" + this.id)
            .html(info);
    }
}

