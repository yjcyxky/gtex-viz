import {select} from "d3-selection";
import * as qtlViolinPlot from "../QtlViolinPlot";
import $ from "jquery";
import "jquery-ui";

/**
 * Create a dialog popup window for the eQTL violin plots
 * @param parentDivId {String} where to create the dialog
 * @param dialogDivId {String}
 * @param title {String} the title of the dialog window
 * Dependencies: jQuery
 */
function  createDialog(parentDivId, dialogDivId, title){
    // jquery UI dialog
    checkDomId(parentDivId);
    let parent = $(`#${parentDivId}`);
    let dialog = $("<div/>")
        .attr("id", dialogDivId)
        .attr("title", title)
        .appendTo(parent);
    let clearDiv = $("<div/>")
        .html("Clear All")
        .appendTo(dialog);
    let contentDiv = $("<div/>")
        .attr("id", `${dialogDivId}-content`)
        .appendTo(dialog);
    dialog.dialog({
        title: title,
        autoOpen: false
    });
    clearDiv.click(function(){
        contentDiv.empty();
    });
}

/**
 * Add a new violin plot to the specified jQuery dialog
 * @param {String} dialogDivId 
 * @param {Object} QTL data object
 * @param {Object} web service urls with attributes: dyneqtl
 * @returns plot object
 * dependencies: jQuery, font awesome
 */
function addPlotToDialog(dialogDivId, data, urls){
    // add a new plot div to the dialog content
    let plot = $("<div/>")
        .attr("class", "violin-dialog")
        .css("float", "left")
        .css("margin", "20px")
        .appendTo(`#${dialogDivId}-content`);
    let plotHeader = $("<div/>").appendTo(plot);
    
    // add a close button of the plot
    $("<i/>").attr("class", "fa fa-window-close")
        .css("margin-right", "2px")
        .click(function () {
            plot.remove();
        })
        .appendTo(plotHeader);

    let plotTitle = `${data.y}<br/><span style="font-size: 12px">${data.geneSymbol}: ${data.gencodeId}<br/>${data.x}<br/></span>`;
    if (data.type == "sQTL"){
        plotTitle += `<span style="font-size: 12px">${data.phenotypeId.replace(":"+data.gencodeId, "")}</span><br/>`;
    } else {
        plotTitle += "<br/>";
    }
    $("<span/>")
        .attr("class", "title")
        .html(plotTitle)
        .appendTo(plotHeader);

    // add the violin plot
    let id = "dEqtl" + Date.now().toString(); // random ID generator
    $("<div/>").attr("id", id).appendTo(plot);

    renderViolinPlot(id, data, urls);
    return plot;
}

function renderViolinPlot(id, data, urls){
    let config = {
        id: id,
        data: undefined, // this would be assigned by the eqtl violin function
        width: 250,
        height: 200,
        margin: { left: 50, right: 20, top: 20, bottom: 50 },
        showDivider: false,
        xAxis: {show: false, angle: 0, paddingInner:0.01, paddingOuter: 0.01, textAnchor: "start", adjustHeight: 0, showLabels: false, showTicks: false},
        yAxis: {
            label: data.type=="eQTL"?"Norm. Expression":"Norm. Intron-Excision Ratio"
        },
        showWhisker: false,
        showLegend: false,
        showSampleSize: true,
        vColor: data.type=="sQTL"?"#a4dced":"#a9e4cc"
    };
    let featureId = data.type=="eQTL"?data.gencodeId:data.phenotypeId;
    qtlViolinPlot.render(config, featureId, data.variantId, data.tissueSiteDetailId, data.y, data.type, urls);
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

/**
 * Render the tissue menu
 * @param {List} tissues tissu objects from GTexTissues 
 * @param {*} id DOM ID of the tissue form
 */
function renderTissueMenu(tissues, id, clearBtnId="modal-clear-tissues-btn", selectAllBtnId="modal-all-tissues-btn"){
    select(`#${id}`).selectAll("*").remove(); // clear previously rendered menu

    let form = document.getElementById(id);
    tissues.forEach((d)=>{
        let item = document.createElement("input");
        item.type = "checkbox";
        item.value = d.tissueSiteDetailAbbr;
        item.name="tissueSite";
        item.checked = true;
        let label = document.createElement("label");
        label.innerHTML = `${d.tissueSiteDetail} (${d.tissueSiteDetailAbbr}) `; // display tissue name
        label.classList.add("tissue-menu-item");
  
        form.appendChild(item);
        form.appendChild(label);
        form.appendChild(document.createElement("br"));
    });

    select(`#${clearBtnId}`).on("click", ()=>{
        let tissueSiteInputs = document.getElementsByName("tissueSite");
        tissueSiteInputs.forEach((d)=>{
            d.checked = false;
        });
    });
    select(`#${selectAllBtnId}`).on("click", ()=>{
        let tissueSiteInputs = document.getElementsByName("tissueSite");
        tissueSiteInputs.forEach((d)=>{
            d.checked = true;
        });
    });

}

export {
    createDialog,
    addPlotToDialog,
    renderTissueMenu
};