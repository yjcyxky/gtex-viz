import * as bulkTissueViolinPlot from "./ExpressionViolinPlot";
import * as singleCellViolinPlot from "./SingleCellExpressionViolinPlot";
import {getGtexUrls} from "./modules/gtexDataParser";

/**
 * Render a bulk tissue expression violin plot of a gene
 * @param {String} rootId 
 * @param {String} tooltipRootId 
 * @param {String} gencodeId 
 * @param {String} plotTitle 
 * @param {Dictionary} urls: optional, by default it is set to the urls from getGtexUrls()
 * @param {Dictionary} margins 
 * @param {Dictionary} dimensions 
 */
export function launchBulkTissueViolinPlot(rootId, tooltipRootId, gencodeId, 
    plotTitle="Bulk Tissue Gene Expression Violin Plot", 
    urls=getGtexUrls(), 
    margins= {top: 50, right: 50, bottom: 150, left: 100}, 
    dimensions={w: window.innerWidth*0.8, h:250}
) {
    bulkTissueViolinPlot.launch(rootId, tooltipRootId, gencodeId, plotTitle, urls, margins, dimensions);
}

/**
 * Render a single-tissue expression violin plot of a gene
 * @param {String} rootId 
 * @param {String} tooltipRootId 
 * @param {String} gencodeId 
 * @param {String} plotTitle 
 * @param {number} demo
 * @param {Boolean} showZero
 * @param {Dictionary} url
 * @param {Dictionary} margin
 * @param {Dictionary} dimension
 */
export function launchSingleCellViolinPlot(
    rootId, 
    tooltipRootId, 
    gencodeId, 
    dimension={width: window.innerWidth*0.9, height:150},
    margin= {top: 180, right: 0, bottom: 20, left: 80}, 
    url=getGtexUrls(), 
    
) {
    singleCellViolinPlot.launch(
        rootId, 
        tooltipRootId, 
        gencodeId, 
        dimension, 
        margin, 
        url
    );
}