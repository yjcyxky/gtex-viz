/* eslint-disable no-prototype-builtins */
import {axisLeft} from "d3-axis";
import {select} from "d3-selection";
import {tissues} from "../models/GTExTissues";


/**
 * Customize QTL tooltip
 * @param {QTL} d 
 */
const customizeQTLTooltip = (d)=>{
    const tissue = tissues.find(t => t.tissueSiteDetailId == d.tissueId);
    const tissueDisplayName = tissue !== undefined ? tissue.tissueSiteDetail : d.tissueId;
    const tooltipData = [
        `<span class="tooltip-key">QTL type</span>: <span class="tooltip-value">${d.type}</span>`,
        `<span class="tooltip-key">Tissue</span>: <span class="tooltip-value">${tissueDisplayName}</span>`,
        `<span class="tooltip-key">Variant</span>: <span class="tooltip-value">${d.x}</span>`,
        `<span class="tooltip-key">RS Id</span>: <span class="tooltip-value">${d.rsId}</span>`,
        `<span class="tooltip-key">NES</span>: <span class="tooltip-value">${d.value}</span>`,
        `<span class="tooltip-key">-log10(p-val)</span>: <span class="tooltip-value">${d.r.toPrecision(3)}</span>`
    ];
    return tooltipData.join("<br/>");
};

/**
 * Customize the barmap or bubblemap row text labels
 * @param bmap {DataMap}
 * @private
 */
function customizeMapRowLabels(bmap, tissueMap){
    bmap.svg.selectAll(".bubble-map-ylabel").remove();
    bmap.svg.select(".bar-map-y-axis").remove();
    bmap.svg.select(".custom-map-y-axis").selectAll("*").remove();
    bmap.svg.select(".custom-map-y-axis").remove();

    let axis = axisLeft(bmap.yScale).tickSize(0);
    let axisG = bmap.svg.append("g")
        .attr("class", "custom-map-y-axis")
        .attr("transform", "translate(-2, 0)")
        .call(axis);

    // modifying tissue names
    let typeCounts = {};
    bmap.yScale.domain().forEach((d)=>{
        let temp = d.split("-");
        let dType = temp[0];
        if (!typeCounts.hasOwnProperty(dType)) typeCounts[dType] = 0;
        typeCounts[dType]++;
    });
    const allTypes = Object.keys(typeCounts).sort((a, b)=>{return a-b;});
    
    // render QTL type background and labels
    bmap.svg.selectAll(".type-bar").remove();
    let typeG = bmap.svg.selectAll(".type-bar")
        .data(allTypes)
        .enter()
        .append("g")
        .attr("class", "type-bar");

    typeG.append("rect")
        .attr("x", 0)
        .attr("y", 2)
        .attr("class", (d)=>d)
        .attr("stroke", "white")
        .attr("width", 10)
        .attr("height", (d)=>bmap.yScale.step()*typeCounts[d])
        .attr("transform", (d, i)=>{
            const Y = i==0?0:bmap.yScale.step()*typeCounts[allTypes[i-1]];
            return `translate(-100, ${Y})`;
        });
    typeG.append("line")
        .attr("x1", -100)
        .attr("x2", 100)
        .attr("y1", 2)
        .attr("y2", 2)
        .attr("stroke-width", 1)
        .attr("class", (d)=>d)
        .attr("transform", (d, i)=>{
            const Y = i==0?0:bmap.yScale.step()*typeCounts[allTypes[i-1]];
            return `translate(-100, ${Y})`;
        });

    const shift = 15;
    typeG.append("text")
        .attr("x", 0)
        .attr("y",2)
        .attr("class", (d)=>d)
        .text((d)=>typeCounts[d]==undefined?"":d)
        .style("text-anchor", "end")
        .style("font-size", 12)
        .attr("transform", (d, i)=>{
            const Y = i==0?shift:bmap.yScale.step()*typeCounts[allTypes[i-1]]+shift;
            return `translate(-105, ${Y})`;
        });

    // render QTL tissue text labels
    axisG.select("path").remove();
    axisG.selectAll("text")
        .attr("class", "custom-map-y-label")
        .attr("fill", "#111111")
        .style("cursor", "pointer")
        .text((d)=>{
            let temp = d.split("-");
            let dType = temp[0];
            const tissueId = d.replace(`${dType}-`, ""); // tissueId is tissue abbr
           
            let sampleSize = 0;
            if (!tissueMap.hasOwnProperty(tissueId)){
                console.error(`Unrecognized ${tissueId}`);
            } 
            if (tissueMap[tissueId].hasOwnProperty("eqtlSampleSummary")){
                sampleSize = tissueMap[tissueId].eqtlSampleSummary.totalCount;
            }
            return `${tissueId} (${sampleSize})`;
        })
        .on("mouseover", function(d){
            let temp = d.split("-");
            let dType = temp[0];
            const tissueId = d.replace(`${dType}-`, "");
            const tooltipData = [
                `<span class="tooltip-key">Tissue</span>: <span class="tooltip-value">${tissueMap[tissueId].tissueSiteDetail}</span>`,
                `<span class="tooltip-key">QTL type</span>: <span class="tooltip-value">${dType}</span>`,
                `<span class="tooltip-key">Sample size</span>: <span class="tooltip-value">${tissueMap[tissueId].eqtlSampleSummary.totalCount}</span>`
            ];
            bmap.tooltip.show(tooltipData.join("<br/>"));
            select(this).style("font-weight", "bold");
        })
        .on("mouseout", function(){
            bmap.tooltip.hide();
            select(this).style("font-weight", "normal");
        });   

    // change row line color based on the data type
    bmap.svg.selectAll(".bar-row").select("line")
        .style("stroke", function(){
            let c = select(this).attr("class");
            if (c == "GWAS") return "#651b23";
            if (c == "sQTL") return "#0a3e7b";
            return "#bdbdbd";
        })
        .style("stroke-width", 0.5);
}

export {
    customizeMapRowLabels,
    customizeQTLTooltip
};