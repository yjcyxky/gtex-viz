/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
/*
This class is a viewer of transcriptional isoforms, each is render as a track
 */

import GeneModel from "./GeneModel";
import {select, selectAll} from "d3-selection";
import {scaleBand} from "d3-scale";
import {axisTop, axisRight} from "d3-axis";

export default class IsoformTrackViewer {
    /**
     *
     * @param isoforms {List} of isoform objects with attr: transcriptId, start, end
     * @param isoformExons {Dictionary} of lists of isoform exons indexed by isoform ID (transcriptId)
     * @param modelExons {List} of reference exons...
     * @param config
     */
    constructor(isoforms, isoformExons, modelExons, config){
        this.isoforms = isoforms;
        this.isoformExons = isoformExons;
        this.modelExons = modelExons;
        this.visualDom = undefined;
        this.config = config;
        this.nullColor = "#DDDDDD";
    }

    showData(data, colorScale, barScale, dataLabel, sort=true){
        if (sort){
            data.sort((a,b)=>{return -(a.displayValue - b.displayValue);}); // first sort the expression data
            const ids = data.map((d)=>d.transcriptId);
            this.sortTracks(ids);
        }

        data.forEach((d)=>{
            const isoform = this.visualDom.select(`#${d.transcriptId.replace(".", "_")}`);
            isoform.selectAll(".exon-curated")
                .style("fill", d.value==0?this.nullColor:colorScale(d.value));
        });

        // render the lollipop graph
        this.visualDom.select(".lollipopGraph").remove();
        const lollipopGraph = this.visualDom.append("g")
            .classed("lollipopGraph", true)
            .attr("transform", "translate(-100, 13)"); // TODO: remove hard-coded values

        const lollipops = lollipopGraph.selectAll(".lollipop")
            .data(data);

        const g = lollipops.enter()
            .append("g")
            .classed("lollipop", true);

        g.append("line")
            .attr("x1", 0)
            .attr("y1", (d)=>this.yScale(d.transcriptId))
            .attr("y2", (d)=>this.yScale(d.transcriptId))
            .style("stroke", (d)=>d.value==0?this.nullColor:colorScale(d.value))
            .style("stroke-width", 2)
            .transition()
            .duration(1000)
            .attr("x2", (d)=>d.value==0?0:barScale(d.value));

        g.append("circle")
            .attr("cx", 0)
            .attr("cy", (d)=>this.yScale(d.transcriptId) )
            .attr("r", 5)
            .style("fill", (d)=>d.value==0?this.nullColor:colorScale(d.value))
            .transition()
            .duration(1000)
            .attr("cx", (d)=>barScale(d.value));

        // add the axes
        lollipopGraph.append("g")
            .attr("class", "lollipop-axis")
            .attr("transform", `translate(0,-${this.yScale.bandwidth()/2})`)
            .call(
                axisTop(barScale)
                    .ticks(3)
            );

        lollipopGraph.append("text")
            .attr("id", "lolliLabel")
            .attr("x", 0)
            .attr("y", -40)
            .attr("text-anchor", "end")
            .style("font-size", 9)
            .text("TPM"); // TODO: this should be a user-defined text

        lollipopGraph.append("g")
            .attr("class", "lollipop-axis")
            .attr("transform", `translate(0,-${this.yScale.bandwidth()/2})`)
            .call(
                axisRight(this.yScale)
                    .tickValues([]) // show no ticks
            );

        // data label
        lollipopGraph.append("text")
            .attr("id", "lolliLabel")
            .attr("x", 10)
            .attr("y", -20)

            .text(`Transcript Expression in ${dataLabel}`)
            .attr("text-anchor", "start")
            .style("font-size", "12px");


    }

    sortTracks(ylist){
        this.setYscale(this.config.h, ylist);
        this.render(true);
    }

    render(redraw=false, dom=undefined, labelOn="left", duration=1000){
        if (dom === undefined && this.visualDom === undefined) throw "Fatal Error: must provide a dom element";
        if (dom === undefined) dom = this.visualDom;
        else this.visualDom = dom;

        if(this.yScale===undefined) this.setYscale(this.config.h);

        const isoTracks = dom.selectAll(".isotrack")
            .data(this.isoforms.map((d)=>d.transcriptId));

        // update old isoform tracks, if any
        isoTracks.transition()
            .duration(duration)
            .attr("transform", (d)=>{ return `translate(0, ${this.yScale(d)})`;});

        // update new tracks
        isoTracks.enter()
            .append("g")
            .attr("id", (d)=>(d.replace(".", "_")))
            .attr("class", "isotrack")
            .attr("transform", (d)=>{ return `translate(0, 0)`;})

            // .merge(isoTracks)
            .transition()
            .duration(duration/2)
            .attr("transform", (d)=>{ return `translate(0, ${this.yScale(d)})`;});

        if (redraw) return;

        this._renderModels(this.config.w, labelOn);

    }

    _renderModels(w, labelOn = "left"){
        this.isoforms.forEach((isoform) => {
            let reference = (this.modelExons === undefined || this.modelExons === null)?this.isoformExons[isoform.transcriptId]:this.modelExons;
            const model = new GeneModel(isoform, reference, this.isoformExons[isoform.transcriptId], [], true);
            const isoformG = select(`#${isoform.transcriptId.replace(".", "_")}`);
            model.render(isoformG, {w:w, h: this.yScale.bandwidth(), labelOn: labelOn});
        });
    }

    setYscale(h, ylist=undefined){
        if (ylist === undefined) ylist = this.isoforms.map((d)=>d.transcriptId);
        this.yScale = scaleBand()
            .domain(ylist)
            .range([0, h])
            .padding(.05);
    }

}