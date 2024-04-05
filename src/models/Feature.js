"use strict";

export default class Feature {
    constructor(label, type){
        this.label = label;
        this.type = type;
    }
    get featureLabel(){
        return this.label;
    }
    get featureType(){
        return this.type;
    }
}