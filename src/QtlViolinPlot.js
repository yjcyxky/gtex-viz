/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */

"use strict";
import {
    getGtexUrls,
    parseDynQtl, parseTissueDict
} from "./modules/gtexDataParser";
import GroupedViolin from "./modules/GroupedViolin";
import {RetrieveAllPaginatedData, RetrieveNonPaginatedData} from "./utils/pagination";
import {createSvg} from "./utils/dom-utils";
import {customizeTooltip} from "./EqtlDashboard";

export function render(par, featureId, variantId, tissueId, groupName=undefined, qtlType="eqtl", urls=getGtexUrls()){
    let queryUrl = "";
    if (qtlType.toLowerCase() == "sqtl")
        queryUrl = urls.dynsqtl + `?variantId=${variantId}&phenotypeId=${featureId}&tissueSiteDetailId=${tissueId}`;
    else
        queryUrl = urls.dyneqtl + `?variantId=${variantId}&gencodeId=${featureId}&tissueSiteDetailId=${tissueId}`;
    const promises = [
        RetrieveAllPaginatedData(urls.geneId + featureId),
        RetrieveNonPaginatedData(queryUrl),
        RetrieveAllPaginatedData(urls.tissue)
    ];
    Promise.all(promises).then(function(args){
        //for sqtl: the feature ID is a phenotpye ID. There won't be any return from the geneSearch function
        let geneSymbol = args[0].length == 1? args[0][0].geneSymbol : featureId;
        let json = args[1];
        let data = parseDynQtl(json);
        let group = groupName||data.tissueSiteDetailId;
        let tissueDict = parseTissueDict(args[2]);
        let tissueSiteDetail = tissueDict[data.tissueSiteDetailId]["tissueSiteDetail"];
        // construct the dynEqtl data for the three genotypes: ref, het, alt
        par.data = [
            {
                group: group,
                label: data.ref.length>2?"ref":data.ref,
                size: data.homoRefExp.length,
                values: data.homoRefExp
            },
            {
                group: group,
                label: data.het.length>2?"het":data.het,
                size: data.heteroExp.length,
                values: data.heteroExp
            },
            {
                group: group,
                label: data.alt.length>2?"alt":data.alt,
                size: data.homoAltExp.length,
                values: data.homoAltExp
            }
        ];
        par.numPoints = 10;
        let info = {};
        info[group] = {
            "pvalue": data["pValue"]===null?1:parseFloat(data["pValue"]).toPrecision(3),
            "pvalueThreshold": data["pValueThreshold"]===null?0:parseFloat(data["pValueThreshold"]).toPrecision(3)
        };
        let violin = new GroupedViolin(par.data, info);
        let inWidth = par.width - (par.margin.left + par.margin.right);
        let inHeight = par.height - (par.margin.top + par.margin.bottom);

        let tooltipId = `${par.id}Tooltip`;

        // create the SVG
        let svg = createSvg(par.id, par.width, par.height, par.margin);

        violin.render(svg,
            inWidth,
            inHeight,
            undefined,
            [],
            par.xAxis,
            par.subXAxis,
            par.yAxis,
            par.sizeAxis,
            par.showWhisker,
            par.showDivider,
            par.showLegend,
            par.showOutliers,
            par.numPoints,
            par.vColor);
        svg.selectAll(".violin-size-axis").classed("violin-size-axis-hide", true).classed("violin-size-axis", false);

        violin.createTooltip(tooltipId);

        customizeTooltip(violin, geneSymbol, variantId, false, tissueSiteDetail);
        
        return svg;

    });
}

export var QtlViolinPlot = {
    render
};
