/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */

/*
TODO
1. refactoring
 */
"use strict";
import {createSvg, checkDomId, createCanvas} from "./utils/dom-utils";
import {generateRandomMatrix} from "./utils/random-utils";
import {range} from "d3-array";
import {randomNormal} from "d3-random";
import Heatmap from "./modules/Heatmap";
import DendroHeatmapConfig from "./modules/DendroHeatmapConfig";
import DendroHeatmap from "./modules/DendroHeatmap";
import GroupedViolin from "./modules/GroupedViolin";
import IsoformTrackViewer from "./modules/IsoformTrackViewer";
// import BubbleMap from "./modules/BubbleMap";
import HalfMap from "./modules/HalfMap";

export const demoData = {
    heatmap:generateRandomMatrix({x:50, y:10, scaleFactor:1000}),
    dendroHeatmap: {
        rowTree: "(((TP53:0.17,SLK:0.17):1.18,NDRG4:1.34):1.33,ACTN3:2.67);",
        colTree: "(((Adipose Visceral Omentum:0.06,Adipose Subcutaneous:0.06):0.00,Bladder:0.06):0.16,Adrenal Gland:0.22);",
        heatmap: [
            {
                "y": "SLK",
                "value": 35.505,
                "x": "Adipose Subcutaneous",
                "unit": "TPM"
            },
            {
                "y": "SLK",
                "value": 29.28,
                "x": "Adipose Visceral Omentum",
                "unit": "TPM"
            },
            {
                "y": "SLK",
                "value": 17.405,
                "x": "Adrenal Gland",
                "unit": "TPM"
            },
            {
                "y": "SLK",
                "value": 53.29,
                "x": "Bladder",
                "unit": "TPM"
            },
            {
                "y": "NDRG4",
                "value": 12.035,
                "x": "Adipose Subcutaneous",
                "unit": "TPM"
            },
            {
                "y": "NDRG4",
                "value": 6.531000000000001,
                "x": "Adipose Visceral Omentum",
                "unit": "TPM"
            },
            {
                "y": "NDRG4",
                "value": 134.8,
                "x": "Adrenal Gland",
                "unit": "TPM"
            },
            {
                "y": "NDRG4",
                "value": 7.1160000000000005,
                "x": "Bladder",
                "unit": "TPM"
            },
            {
                "y": "TP53",
                "value": 29.935,
                "x": "Adipose Subcutaneous",
                "unit": "TPM"
            },
            {
                "y": "TP53",
                "value": 23.55,
                "x": "Adipose Visceral Omentum",
                "unit": "TPM"
            },
            {
                "y": "TP53",
                "value": 18.515,
                "x": "Adrenal Gland",
                "unit": "TPM"
            },
            {
                "y": "TP53",
                "value": 40.51,
                "x": "Bladder",
                "unit": "TPM"
            },
            {
                "y": "ACTN3",
                "value": 0.33145,
                "x": "Adipose Subcutaneous",
                "unit": "TPM"
            },
            {
                "y": "ACTN3",
                "value": 0.3317,
                "x": "Adipose Visceral Omentum",
                "unit": "TPM"
            },
            {
                "y": "ACTN3",
                "value": 0.100005,
                "x": "Adrenal Gland",
                "unit": "TPM"
            },
            {
                "y": "ACTN3",
                "value": 0.48100000000000004,
                "x": "Bladder",
                "unit": "TPM"
            }
        ]
    },
    groupedViolinPlot: [
        {
            group: "Group 1",
            label: "Gene 1",
            values: range(0, 2000).map(randomNormal(2, 1))
        },
        {
            group: "Group 1",
            label: "Gene 2",
            values: range(0, 2000).map(randomNormal(5, 1))
        },
        {
            group: "Group 1",
            label: "Gene 3",
            values: range(0, 2000).map(randomNormal(10, 1))
        },
        {
            group: "Group 2",
            label: "Gene 1",
            values: range(0, 2000).map(randomNormal(5, 1))
        },
        {
            group: "Group 2",
            label: "Gene 2",
            values: range(0, 2000).map(randomNormal(3, 1))
        },
        {
            group: "Group 2",
            label: "Gene 3",
            values: range(0, 2000).map(randomNormal(1, 1))
        },
        {
            group: "Group 3",
            label: "Gene 1",
            values: range(0, 2000).map(randomNormal(2, 1))
        },
        {
            group: "Group 3",
            label: "Gene 2",
            values: range(0, 2000).map(randomNormal(3, 1))
        },
        {
            group: "Group 3",
            label: "Gene 3",
            values: range(0, 2000).map(randomNormal(5, 1))
        }
    ],
    transcriptTracks: {
        "exons": {
            "ENST00000311595.9": [
                {
                    "chrom": "17",
                    "chromEnd": 77071172,
                    "exonId": "ENSE00002713933.1",
                    "exonNumber": "1",
                    "chromStart": 77071151,
                    "strand": "+"
                },
                {
                    "chrom": "17",
                    "chromEnd": 77073579,
                    "exonId": "ENSE00003672628.1",
                    "exonNumber": "2",
                    "chromStart": 77073512,
                    "strand": "+"
                },
                {
                    "chrom": "17",
                    "chromEnd": 77073946,
                    "exonId": "ENSE00003475281.1",
                    "exonNumber": "3",
                    "chromStart": 77073745,
                    "strand": "+"
                },
                {
                    "chrom": "17",
                    "chromEnd": 77075719,
                    "exonId": "ENSE00001111713.1",
                    "exonNumber": "4",
                    "chromStart": 77075571,
                    "strand": "+"
                },
                {
                    "chrom": "17",
                    "chromEnd": 77076446,
                    "exonId": "ENSE00003651250.1",
                    "exonNumber": "5",
                    "chromStart": 77076289,
                    "strand": "+"
                },
                {
                    "chrom": "17",
                    "chromEnd": 77077155,
                    "exonId": "ENSE00003607773.1",
                    "exonNumber": "6",
                    "chromStart": 77077007,
                    "strand": "+"
                },
                {
                    "chrom": "17",
                    "chromEnd": 77078612,
                    "exonId": "ENSE00002720924.1",
                    "exonNumber": "7",
                    "chromStart": 77077980,
                    "strand": "+"
                }
            ]
        },
        "transcripts": [
            {
                "chromosome": "17",
                "end": 77078612,
                "gencodeId": "ENSG00000167280.12",
                "geneSymbol": "ENGASE",
                "start": 77071151,
                "strand": "+",
                "transcriptId": "ENST00000311595.9"
            }
        ]
    },
    bubbleMap:generateRandomMatrix({x:50, y:10, scaleFactor: 1, diverging: true, bubble: true}),
    ldPlot: generateRandomMatrix({x:2, y:2, scaleFactor: 1})
};

export const cfdeDemoData = {
    groupedViolinByDataset: [
        {
            group: "GTEx",
            label: "Amygdala",
            values: range(0, 2000).map(randomNormal(2, 3)),
            color: "#a8cbea"
        },
        {
            group: "GTEx",
            label: "Cerebellum",
            values: range(0, 1248).map(randomNormal(5, 1)),
            color: "#a8cbea"
        },
        {
            group: "GTEx",
            label: "Cortex",
            values: range(0, 1568).map(randomNormal(10, 2)),
            color: "#a8cbea"
        },
        {
            group: "Kids First",
            label: "Amygdala",
            values: range(0, 1264).map(randomNormal(2, 1)),
            color: "#a597a1"
        },
        {
            group: "Kids First",
            label: "Cerebellum",
            values: range(0, 975).map(randomNormal(3, 2)),
            color: "#a597a1"
        },
        {
            group: "Kids First",
            label: "Cortex",
            values: range(0, 467).map(randomNormal(5, 4)),
            color: "#a597a1"
        }
    ],
    groupedViolinByTissue: [
        {
            label: "GTEx",
            group: "Amygdala",
            values: range(0, 2000).map(randomNormal(2, 3)),
            color: "#a8cbea"
        },
        {
            label: "GTEx",
            group: "Cerebellum",
            values: range(0, 1248).map(randomNormal(5, 1)),
            color: "#a8cbea"
        },
        {
            label: "GTEx",
            group: "Cortex",
            values: range(0, 1568).map(randomNormal(10, 2)),
            color: "#a8cbea"
        },
        {
            label: "Kids First",
            group: "Amygdala",
            values: range(0, 1264).map(randomNormal(2, 1)),
            color: "#a597a1"
        },
        {
            label: "Kids First",
            group: "Cerebellum",
            values: range(0, 975).map(randomNormal(3, 2)),
            color: "#a597a1"
        },
        {
            label: "Kids First",
            group: "Cortex",
            values: range(0, 467).map(randomNormal(5, 4)),
            color: "#a597a1"
        }
    ],
    groupedViolinBySex: [
        {
            label: "GTEx (F)",
            group: "Amygdala",
            values: range(0, 978).map(randomNormal(3, 5)),
            color: "#e67f7b"
        },
        {
            label: "GTEx (M)",
            group: "Amygdala",
            values: range(0, 834).map(randomNormal(1, 1)),
            color: "#70bcd2"
        },
        {
            label: "GTEx (F)",
            group: "Cerebellum",
            values: range(0, 745).map(randomNormal(5, 4)),
            color: "#e67f7b"
        },
        {
            label: "GTEx (M)",
            group: "Cerebellum",
            values: range(0, 812).map(randomNormal(5, 2)),
            color: "#70bcd2"
        },
        {
            label: "GTEx (F)",
            group: "Cortex",
            values: range(0, 632).map(randomNormal(10, 3)),
            color: "#e67f7b"
        },
        {
            label: "GTEx (M)",
            group: "Cortex",
            values: range(0, 431).map(randomNormal(1, 1)),
            color: "#70bcd2"
        },
        {
            label: "Kids First (F)",
            group: "Amygdala",
            values: range(0, 1264).map(randomNormal(2, 1)),
            color: "#e67f7b"
        },
        {
            label: "Kids First (M)",
            group: "Amygdala",
            values: range(0, 1264).map(randomNormal(2, 3)),
            color: "#70bcd2"
        },
        {
            label: "Kids First (F)",
            group: "Cerebellum",
            values: range(0, 975).map(randomNormal(3, 4)),
            color: "#e67f7b"
        },
        {
            label: "Kids First (M)",
            group: "Cerebellum",
            values: range(0, 975).map(randomNormal(3, 1)),
            color: "#70bcd2"
        },
        {
            label: "Kids First (F)",
            group: "Cortex",
            values: range(0, 467).map(randomNormal(5, 1)),
            color: "#e67f7b"
        },
        {
            label: "Kids First (M)",
            group: "Cortex",
            values: range(0, 467).map(randomNormal(3, 2)),
            color: "#70bcd2"
        }
    ]
}

const ldPlotDemoConfig = {
    id: "gtexVizLdPlot",
    data: demoData.ldPlot,
    cutoff: 0.0,
    width: 1000, // outer width
    marginLeft: 100,
    marginRight: 200,
    marginTop: 20,
    marginBottom: 100,
    colorScheme: "Greys",
    labelHeight: 20,
    showLabels: true,
    labelAngle: 30,
    legendSpace: 50,
    useLog: false,
    logBase: undefined
};

export function ldPlot(par=ldPlotDemoConfig){
    let margin = {
        left: par.marginLeft,
        top: par.showLabels?par.marginTop+par.labelHeight:par.marginTop,
        right: par.marginRight,
        bottom: par.marginBottom
    };
    let inWidth = par.width - (par.marginLeft + par.marginRight);
    let inHeight = par.width - (par.marginTop + par.marginBottom);
    inWidth = inWidth>inHeight?inHeight:inWidth; // adjust the dimensions based on the minimum required space
    let ldCanvas = new HalfMap(par.data, par.cutoff, par.useLog, par.logBase, par.colorScheme);
    ldCanvas.addTooltip(par.id);
    let canvas = createCanvas(par.id, par.width, par.width, margin);
    let svg = createSvg(par.id, par.width, par.width, margin, undefined, "absolute");
    ldCanvas.draw(canvas, svg, {w:inWidth, top: margin.top, left: margin.left}, [0, 1], par.showLabels, par.labelAngle);
    ldCanvas.drawColorLegend(svg, {x: 0, y: 100}, 10, "Value");
}

const transcriptTracksConfig = {
    id: "gtexTranscriptTracks",
    data: demoData.transcriptTracks,
    width: 1200,
    height: 80,
    marginLeft: 100,
    marginRight: 20,
    marginTop: 0,
    marginBottom: 20,
    labelPos: "left"
};
export function transcriptTracks(par=transcriptTracksConfig){
    let margin = {
        top: par.marginTop,
        right: par.marginRight,
        bottom: par.marginBottom,
        left: par.marginLeft
    };
    let inWidth = par.width - (par.marginLeft + par.marginRight);
    let inHeight = par.height - (par.marginTop + par.marginBottom);

    // test input params
    checkDomId(par.id);

    // create the SVG
    let svg = createSvg(par.id, par.width, par.height, margin);

    // render the transcripts
    let tooltipId = `${par.id}Tooltip`;
    let config = {
        x: 0,
        y: 0,
        w: inWidth,
        h: inHeight,
        labelOn: par.labelPos
    };
    let viewer = new IsoformTrackViewer(par.data.transcripts, par.data.exons, undefined, config);
    viewer.render(false, svg, par.labelPos);

}

const bubblemapDemoConfig = {
    id: "gtexVizBubblemap",
    data: demoData.bubbleMap,
    width: 1200, //window.innerWidth*0.9,
    height: 400, // TODO: use a dynamic width based on the matrix size
    marginTop: 100,
    marginRight: 100,
    marginBottom: 30,
    marginLeft: 30,
    labels: {
        column: {
            show: true,
            height: 100,
            angle: 90,
            adjust: 10,
            location: "bottom",
            textAlign: "left"
        },
        row: {
            show: true,
            width: 150,
            angle: 0,
            adjust: 0,
            location: "left",
            textAlign: "right"
        }
    },
    useLog: false,
    logBase: 10,
    colorScheme: "RdBu", // a diverging color scheme
    colorScaleDomain: [-0.75, 0.75],
    useCanvas: false
};
// export function bubblemap(par=bubblemapDemoConfig){
//     let margin = {
//         left: par.showLabels?par.marginLeft + par.rowLabelWidth: par.marginLeft,
//         top: par.marginTop,
//         right: par.marginRight,
//         bottom: par.showLabels?par.marginBottom + par.columnLabelHeight:par.marginBottom
//     };
//     let inWidth = par.width - (par.labels.row.width + par.marginLeft + par.marginRight);
//     let inHeight = par.height - (par.labels.column.height + par.marginTop + par.marginBottom);
//     if(par.useCanvas) {
//         let bmapCanvas = new BubbleMap(par.data, par.useLog, par.logBase, par.colorScheme);
//         bmapCanvas.addTooltip(canvasId);
//         let canvas = createCanvas(par.id, par.width, par.height, margin);
//         bmapCanvas.drawCanvas(
//             canvas,
//             {w:inWidth, h:inHeight, top: margin.top, left: margin.left},
//             par.colorScaleDomain,
//             par.labels
//         );
//     }
//     else {
//         let bmap = new BubbleMap(par.data, par.useLog, par.logBase, par.colorScheme);
//         bmap.addTooltip(par.id);
//         let svg = createSvg(par.id, par.width, par.height, margin);
//         bmap.drawSvg(svg, {w:inWidth, h:inHeight, top:0, left:0}, par.colorScaleDomain, 0, par.labels);
//         bmap.drawColorLegend(svg, {x: 0, y: -40}, 3, "NES");
//         bmap.drawBubbleLegend(svg, {x: 500, y:-40, title: "-log10(p-value)"}, 5, "-log10(p-value)");
//     }
// }

const heatmapDemoConfig = {
    id: "gtexVizHeatmap",
    data: demoData.heatmap,
    width: 1200, // outer width
    height: 300, // outer height
    marginLeft: 20,
    marginRight: 40,
    marginTop: 50,
    marginBottom: 50,
    colorScheme: "YlGnBu",
    cornerRadius: 2,
    columnLabelHeight: 20,
    columnLabelAngle: 60,
    columnLabelPosAdjust: 10,
    rowLabelWidth: 100,
    legendSpace: 50,
    useLog: true,
    logBase: 10
};
/**
 * Render a 2D Heatmap
 * @param params
 */
export function heatmap(par=heatmapDemoConfig, svg=undefined){
    let margin = {
        top: par.marginTop,
        right: par.marginRight,
        bottom: par.marginBottom,
        left: par.marginLeft
    };
    let inWidth = par.width - (par.marginLeft + par.marginRight + par.rowLabelWidth);
    let inHeight = par.height - (par.marginTop + par.marginBottom + par.columnLabelHeight);

    // test input params
    checkDomId(par.id);

    // create the SVG
    if (svg===undefined) svg = createSvg(par.id, par.width, par.height, margin);

    // render the heatmap
    let tooltipId = `${par.id}Tooltip`;
    let h = new Heatmap(par.data, par.useLog, par.logBase, par.colorScheme, par.cornerRadius, tooltipId);
    h.draw(svg, {w:inWidth, h:inHeight}, par.columnLabelAngle, false, par.columnLabelPosAdjust);
    h.drawColorLegend(svg, {x:20, y: -20}, 10);
    return h;
}

const dendroHeatmapDemoConfig = {
    id: "gtexVizDendroHeatmap",
    data: demoData.dendroHeatmap,
    useLog: true,
    logBase: 10,
    width: 600, // outer width
    height: 300, // outer height
    marginLeft: 20,
    marginRight: 40,
    marginTop: 50,
    marginBottom: 50,
    rowTreePanelWidth: 100,
    colTreePanelHeight: 100,
    colorScheme: "Blues",
    cornerRadius: 2,
    columnLabelHeight: 200,
    columnLabelAngle: 60,
    columnLabelPosAdjust: 10,
    rowLabelWidth: 200,
    legendSpace: 50
};
/**
 * Render a DendroHeatmap
 * @param par
 */
export function dendroHeatmap(par=dendroHeatmapDemoConfig){
    let margin = {
        top: par.marginTop,
        right: par.marginRight + par.rowLabelWidth,
        bottom: par.marginBottom + par.columnLabelHeight,
        left: par.marginLeft
    };

    // test input params
    checkDomId(par.id);

    let inWidth = par.width - (par.marginLeft + par.marginRight + par.rowLabelWidth);
    let inHeight = par.height - (par.marginTop + par.marginBottom + par.columnLabelHeight);

    let svgId = `${par.id}Svg`;
    let tooltipId = `${par.id}Tooltip`;
    let dmapConfig = new DendroHeatmapConfig(par.width, par.rowTreePanelWidth, par.colTreePanelHeight, margin);
    let dmap = new DendroHeatmap(par.data.colTree, par.data.rowTree, par.data.heatmap, par.colorScheme, par.cornerRadius, dmapConfig, tooltipId, par.useLog, par.logBase);
    let showColTree = par.data.colTree !== undefined;
    let showRowTree = par.data.rowTree !== undefined;
    dmap.render(par.id, svgId, showColTree, showRowTree, "top", 8);
}

const violinDemoConfig = {
    id: "gtexGroupedViolinPlot",
    data: demoData.groupedViolinPlot,
    width: 500,
    height: 300,
    margin: {top: 50, right: 20, bottom: 100, left: 100},
    xAxis: {
        show: true,
        angle: 0,
        paddingInner: 0.01,
        paddingOuter: 0.01
    },
    subXAxis: {
        show: true,
        angle: 0,
        paddingInner: 0,
        paddingOuter: 0,
        sort: false
    },
    yAxis: {
        label: "Random Value"
    },
    sizeAxis: {
        show: true
    },
    showDivider: true,
    showWhisker: false,
    showLegend: false,
};
export function groupedViolinPlot(par=violinDemoConfig){
    // test input params
    checkDomId(par.id);

    let inWidth = par.width - (par.margin.left + par.margin.right);
    let inHeight = par.height - (par.margin.top + par.margin.bottom);

    let svgId = `${par.id}Svg`;
    let tooltipId = `${par.id}Tooltip`;

    // create the SVG
    let svg = createSvg(par.id, par.width, par.height, par.margin);

    const gViolin = new GroupedViolin(par.data);
    gViolin.render(
        svg,
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

    gViolin.createTooltip(tooltipId);
    return svg;

}

export var GTExViz = {
    heatmap,
    dendroHeatmap,
    groupedViolinPlot,
    transcriptTracks,
    // bubblemap,
    ldPlot
};
