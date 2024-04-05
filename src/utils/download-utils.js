"use strict";
import {saveAs} from "file-saver";
import $ from "jquery";

/**
 * Download SVG
 * @param svgObj
 * @param downloadFileName {String}
 * @param tempDownloadDivId {String}
 */
export function downloadSvg(svgObj, downloadFileName, tempDownloadDivId){
    console.log(svgObj);
    var $svgCopy = svgObj.clone()
        .attr("version", "1.1")
        .attr("xmlns", "http://www.w3.org/2000/svg");

    // parse and add the CSS styling used by the SVG
    var styles = parseCssStyles(svgObj.get());
    $svgCopy.prepend(styles);

    $("#" + tempDownloadDivId).html("").hide();
    var svgHtml = $("#" + tempDownloadDivId).append($svgCopy).html();

    var svgBlob = new Blob([svgHtml], {type: "image/svg+xml"});
    saveAs(svgBlob, downloadFileName);

    // clear the temp download div
    $("#" + tempDownloadDivId).html("").hide();
}
/**
 * A function for parsing the CSS style sheet and including the style properties in the downloadable SVG.
 * @param dom
 * @returns {Element}
 */
export function parseCssStyles (dom) {
    var used = "";
    var sheets = document.styleSheets;

    for (var i = 0; i < sheets.length; i++) { // TODO: walk through this block of code

        try {
            if (sheets[i].cssRules == null) continue;
            var rules = sheets[i].cssRules;

            for (var j = 0; j < rules.length; j++) {
                var rule = rules[j];
                if (typeof(rule.style) != "undefined") {
                    var elems;
                    // removing any selector text including svg element ID -- dom already selects for that
                    var selector = rule.selectorText === undefined? rule.selectorText : rule.selectorText.replace(`#${dom[0].id} `, "");
                    //Some selectors won't work, and most of these don't matter.
                    try {
                        elems = $(dom).find(selector);
                    } catch (e) {
                        elems = [];
                    }

                    if (elems.length > 0) {
                        used += rule.selectorText + " { " + rule.style.cssText + " }\n";
                    }
                }
            }
        } catch (e) {
            // In Firefox, if stylesheet originates from a diff domain,
            // trying to access the cssRules will throw a SecurityError.
            // Hence, we must use a try/catch to handle this in Firefox
            if (e.name !== "SecurityError") throw e;
            continue;
        }
    }

    var s = document.createElement("style");
    s.setAttribute("type", "text/css");
    s.innerHTML = "<![CDATA[\n" + used + "\n]]>";

    return s;
}
