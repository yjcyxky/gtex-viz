/**
 * ToDo
 * bug fixing: eqtl file doesn't include all the eqtl data for all variants rendered in the browser
 * web services: eventually when the web services are available, move the data source code to LocusBrowserDataUtils.js
 */
import {extent} from "d3-array";
import {select, selectAll} from "d3-selection";
import * as View from "./modules/LocusBrowserVCView";
import * as dataUtils from "./modules/LocusBrowserDataUtils";
import Variant from "./models/Variant";
import Gene from "./models/Gene";
import * as tissueUtils from "./models/GTExTissues";
import * as commomUI from "./modules/LocusBrowserUIUtils";
import $ from "jquery";
import {RetrieveAllPaginatedData} from "./utils/pagination";

// plot default settings, which can be overriden by users on the fly using demo()
let ViewWindow = 1e4;
let MODE = "LD";
let LDThreshold = 0.2;

// data files and URLs

let URL = {
    variantByLocation: (chr, start, end)=>{
        return `${dataUtils.serviceUrls.variantByLocation}&chromosome=${chr}&start=${start}&end=${end}`;
    },
    ld: (id)=>{return dataUtils.serviceUrls.ldByVariant + id;}, // for a given variant, fetch its LD data
    variantEqtl: (id)=>{
        let base_url = dataUtils.serviceUrls.variantEqtls;
        let all_tissues = "Adipose_Subcutaneous,Adipose_Visceral_Omentum,Adrenal_Gland,Artery_Aorta," +
            "Artery_Coronary,Artery_Tibial,Bladder,Brain_Amygdala,Brain_Anterior_cingulate_cortex_BA24," +
            "Brain_Caudate_basal_ganglia,Brain_Cerebellar_Hemisphere,Brain_Cerebellum,Brain_Cortex," +
            "Brain_Frontal_Cortex_BA9,Brain_Hippocampus,Brain_Hypothalamus,Brain_Nucleus_accumbens_basal_ganglia," +
            "Brain_Putamen_basal_ganglia,Brain_Spinal_cord_cervical_c-1,Brain_Substantia_nigra,Breast_Mammary_Tissue," +
            "Cells_EBV-transformed_lymphocytes,Cells_Cultured_fibroblasts,Cervix_Ectocervix,Cervix_Endocervix," +
            "Colon_Sigmoid,Colon_Transverse,Esophagus_Gastroesophageal_Junction,Esophagus_Mucosa,Esophagus_Muscularis," +
            "Fallopian_Tube,Heart_Atrial_Appendage,Heart_Left_Ventricle,Kidney_Cortex,Kidney_Medulla,Liver,Lung," +
            "Minor_Salivary_Gland,Muscle_Skeletal,Nerve_Tibial,Ovary,Pancreas,Pituitary,Prostate," +
            "Skin_Not_Sun_Exposed_Suprapubic,Skin_Sun_Exposed_Lower_leg,Small_Intestine_Terminal_Ileum," +
            "Spleen,Stomach,Testis,Thyroid,Uterus,Vagina,Whole_Blood";
        all_tissues = all_tissues.split(",");
        let url = base_url + all_tissues.join("&tissueSiteDetailId=");
        url = url + "&variantId=";
        return url+id;
    }, // for a given variant, fetch its eQTLs
    variantSqtl: (id)=>{return dataUtils.serviceUrls.variantSqtls+id;}, // for a given variant, fetch its sQTLs
    funcAnnoGtex: (chr, hExtent)=>{
        const funcAnnoUrlRoot = dataUtils.serviceUrls.funcAnno;
        return funcAnnoUrlRoot + `&chromosome=${chr}&start=${hExtent[0]}&end=${hExtent[1]}`;
    }, // for a given genomic window, fetch functional annotations of variants
    gwasCat: (chr, hExtent)=>{
        const gwasCatUrlRoot = dataUtils.serviceUrls.gwasCats; 
        return gwasCatUrlRoot + `?chromosome=${chr}&start=${hExtent[0]}&end=${hExtent[1]}`;
    },
    tissueInfo: dataUtils.serviceUrls.tissueInfo,
    geneEqtl: (id)=>{return dataUtils.serviceUrls.eqtls+id;},
    geneSqtl: (id)=>{return dataUtils.serviceUrls.sqtls+id;},
    fineMap: (id)=>{return dataUtils.serviceUrls.fineMapping+id;}

};

/**
 * Demo LocusBrowserVC
 * @param {String?} queryId 
 * @param {String?} domId 
 * @param {enum?} mode: For setting the default genomic window: LD: use the query variant's LD, WIN: use a fix window size centered at the query variant
 */
export function init(queryId="chr11_65592772_G_A_b38", domId="locus-browser", mode=MODE, url=undefined){

    // show the spinner and erase previous visualization
    select("#locus-browser-spinner").style("display", "block");
    select(`#${domId}`).select("svg").remove();
    select("#q-variant").text("");
    select("#heatmapTooltip").style("opacity", 0);

    if (url !== undefined){
        // allows users to redefine URL
        URL = url;
    }
    /**
     * Initiation
     * LocusBrowserVC has two view modes which define the genomic window size to display:
     * mode LD--display the query variant's LD block
     * mode WIN--display all variants within a window centered at the query variant's position.
     * 
     * By default, the browser uses mode LD unless the query variant isn't in an LD with any variants.
     * The view mode can be set by user using the parameter mode.
     */
    const variant=new Variant(queryId); // parse and build a variant object for the query variant  
    const maxWindow = 1e6;
    const promises = [
        // tsv(ldFile(variant.varId)),
        RetrieveAllPaginatedData(URL.ld(variant.varId), 1000),
        RetrieveAllPaginatedData(URL.variantByLocation(variant.chromosome, variant.pos-maxWindow < 0 ? 0 : variant.pos - maxWindow, variant.pos+maxWindow ), 10000)
    ];
    Promise.all(promises)
        .then((args)=>{
            // hide the spinner
            select("#locus-browser-spinner").style("display", "none");

            // parse data
            let ld = args[0];
            let variants = args[1];
            switchMode(domId, mode, variant, variants, ld);
            // bind UI elements
            bindUIEvents(queryId, domId, variant, variants, ld);
        });
}

function switchMode(domId, mode, variant, variants, ld){
    if (ld.length == 0) mode = "WIN"; // when a query variant has no LD, then switch to mode WIN
    let hExtent = [];
    let hood = []; // a list of variants in the "variant hood", which will be displayed in the browser
    let modeValue=mode=="LD"?LDThreshold:ViewWindow;
    
    switch(mode){
    case "LD": {
        let ldSet = new Set([variant.pos]);
        ld.filter((d)=>{
            return d[1] >= modeValue;
        }).forEach((d)=>{
            d[0] = d[0].replace(",", "").replace(variant.varId, "");
            let v = new Variant(d[0]);
            let pos = v.pos;
            ldSet.add(Math.abs(pos)); // how could this value be negative??
        });
        hExtent = extent([...ldSet]);
        hood =variants.filter((v)=>{
            let pos = parseInt(v.pos);
            return ldSet.has(pos);
        });
        break;
    }
    case "WIN": {
        hExtent = [variant.pos-modeValue, variant.pos+modeValue];
        hood =variants.filter((v)=>{
            let pos = parseInt(v.pos);
            return pos>=hExtent[0] && pos<=hExtent[1];
        });
        break;
    }
    default: {
        console.error(`Unrecognized view mode: ${mode}`);
    }
    }
    _render(domId, variant, hood, ld, hExtent);

}

// fetch data and render the plot
/**
 * 
 * @param {Variant} variant 
 * @param {Variant[]} vlist 
 * @param {LD objects} ldBlock 
 * @param {[winMin, winMax]} hExtent 
 */
function _render (domId, variant, vlist, ldBlock, hExtent){
    const funcAnnoUrl = URL.funcAnnoGtex(variant.chromosome, hExtent);
    const eqtlUrl = URL.variantEqtl(variant.varId); 
    const sqtlUrl = URL.variantSqtl(variant.varId); 
    const gwasUrl = URL.gwasCat(variant.chromosome, hExtent);
    const promises = [
        RetrieveAllPaginatedData(eqtlUrl, 1000),
        RetrieveAllPaginatedData(sqtlUrl, 1000),
        RetrieveAllPaginatedData(funcAnnoUrl), 
        // tsv(gwasCatFile), 
        RetrieveAllPaginatedData(gwasUrl),
        RetrieveAllPaginatedData(URL.tissueInfo)
    ];
    Promise.all(promises)
        .then((args)=>{
            // find all genes associated with the variant
            const geneSet = dataUtils.getSet(args.shift(), "gencodeId"); // egenes of the query variant
            const geneSet2 = dataUtils.getSet(args.shift(), "gencodeId"); // sgenes
            geneSet2.forEach((g)=>{
                if (!geneSet.has(g)) geneSet.add(g); // combine geneSet and geneSet2
            });
            const gids = [...geneSet].join("&geneId=");
            if ([...geneSet].length != 0) {
                RetrieveAllPaginatedData(`${dataUtils.serviceUrls.geneInfo}${gids}`)
                    .then((geneJson)=>{
                        let genes = geneJson.map((g)=>{
                            let gene= new Gene(g.gencodeId, g.chromosome, g.strand, parseInt(g.start), parseInt(g.end), g.geneType, g.geneSymbol);
                            return gene;
                        });
                        View.render(domId, variant, vlist, ldBlock, genes, args, URL);
                    });
            }

        });
}


function bindUIEvents(queryId, domId, variant, variants, ld){
    updateViewerStatus(queryId);
    bindViewModeButtons(domId, variant, variants, ld);
    bindSliderEvents(domId, variant, variants, ld);
    bindFineMappingSwitch();
    bindQTLViewSwitch();
    buildTissueMenu();
}

function updateViewerStatus(queryId){
    $("#q-variant").text(queryId);
}

function buildTissueMenu(){
    // build the tissue menu
    // get the unique list of tissues
    let tissues = tissueUtils.tissues
        .filter((t)=>t.hasEGenes||t.hasSGenes);
    
    let formId = "tissue-menu";
    // Note: this tissue menu is fixed number of tissues. It's all GTEx tissues with sGenes/eGenes
    // do not regenerate this tissue menu
    // this way the tissue menu filtering remains even after changing view or variant
    if ($(`#${formId} input`).length == 0) commomUI.renderTissueMenu(tissues, formId);

}

function bindViewModeButtons(domId, variant, variants, ld){
    // can't figure out how to unbind anonymnous function events using vanilla javascript
    $("#ld-mode").unbind().on("click", function(){
        let mode = "LD";
        $("#ld-mode").addClass("active");
        $("#win-mode").removeClass("active");
        $("#ld-cutoff-ui").show();
        $("#win-size-ui").hide();
        switchMode(domId, mode, variant, variants, ld);
    });
    $("#win-mode").unbind().on("click", function(){
        let mode = "WIN";
        $("#win-mode").addClass("active");
        $("#ld-mode").removeClass("active");
        $("#win-size-ui").show();
        $("#ld-cutoff-ui").hide();
        switchMode(domId, mode, variant, variants, ld);
    });
}

function bindFineMappingSwitch(){
    $("#fine-mapping-off").unbind().on("click", function(){
        $("#fine-mapping-off").addClass("active");
        $("#fine-mapping-on").removeClass("active");
        $(".fine-map").hide();
        View.setShowFineMapConfig(false);
    });
    $("#fine-mapping-on").unbind().on("click", function(){
        $("#fine-mapping-on").addClass("active");
        $("#fine-mapping-off").removeClass("active");
        $(".fine-map").show();
        View.setShowFineMapConfig(true);
    });
}

function bindQTLViewSwitch(){
    $("#qtl-view-off").unbind().on("click", function(){
        let opacity = 0.1;
        $("#qtl-view-off").addClass("active");
        $("#qtl-view-on").removeClass("active");
        selectAll(".map-bubble").style("opacity", opacity);
        View.setDimBubbleConfig(opacity);
    });
    $("#qtl-view-on").unbind().on("click", function(){
        let opacity = 1;
        $("#qtl-view-on").addClass("active");
        $("#qtl-view-off").removeClass("active");
        selectAll(".map-bubble").style("opacity", opacity);
        View.setDimBubbleConfig(opacity);
    });
}
function bindSliderEvents(domId, variant, variants, ld){
    $("#ld-slider").unbind().mouseup(function(){
        switchMode(domId, "LD", variant, variants, ld);
    });
    $("#ld-slider").on("input", function(){
        const v = $(this).val();
        $("#ld-cutoff").val(v);
        LDThreshold = parseFloat(v);
    });
    $("#ld-cutoff").unbind().keypress(function(event){
        let keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == "13"){
            const v = $(this).val();
            $("#ld-slider").val(v);
            LDThreshold = parseFloat(v);
            switchMode(domId, "LD", variant, variants, ld);
        }
    });
    $("#win-slider").unbind().mouseup(function(){
        switchMode(domId, "WIN", variant, variants, ld);
    });
    $("#win-slider").on("input", function(){
        const v = $(this).val();
        $("#win-size").val(v);
        ViewWindow = parseFloat(v)*1000;
    });
    $("#win-size").unbind().keypress(function(event){
        let keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == "13"){
            const v = $(this).val();
            $("#win-slider").val(v);
            ViewWindow = parseFloat(v)*1000;
            switchMode(domId, "WIN", variant, variants, ld);
        }
    });
}



