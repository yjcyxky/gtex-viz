/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
import {mean, quantile, deviation} from "d3-array";
import * as d3 from "d3";
// reference: https://en.wikipedia.org/wiki/Kernel_(statistics)
// reference: https://en.wikipedia.org/wiki/Kernel_density_estimation
export const kernel = {
    epanechnikov: function(u){return Math.abs(u) <= 1? (3/4)*(1-u*u):0;},
    gaussian: function(u){return 1/Math.sqrt(2*Math.PI)*Math.exp(-.5*u*u);}
};

// reference: https://github.com/jasondavies/science.js/blob/master/src/stats/bandwidth.js
export const kernelBandwidth = {
    // Bandwidth selectors for Gaussian kernels.
    nrd: function(x) {
        let iqr = quantile(x, 0.75) - quantile(x, 0.25);
        let h = iqr / 1.34;
        return 1.06 * Math.min(deviation(x), h) * Math.pow(x.length, -1/5);
    }
};

/**
 *
 * @param kernel: the kernel function, such as gaussian
 * @param X: list of bins
 * @param h: the bandwidth, either a numerical value given by the user or calculated using the function kernelBandwidth
 * @returns {Function}: the kernel density estimator
 */
export function kernelDensityEstimator(kernel, X, h){
    return function(V) {
        // X is the bins
        if (h==0) {
            // console.warn("Invallid value: bandwidth cannot be zero");
            // h=0.1;
        }
        // console.log("Bandwidth is " + h);
        return X.map((x) => [x, mean(V, (v) => kernel((x-v)/h))/h]);
    };
}

/**
 * Kernel density estimation using Scott's rule for estimating bandwidth
 * @param {list} V: input values 
 * @param {list} X: points at which to evaluate the distribution 
 * reference: https://github.com/scipy/scipy/blob/master/scipy/stats/kde.py
 */
export function kdeScott(V, X=undefined){
    // assign x if undefined
    if (X===undefined){
        X = d3.scaleLinear()
            .domain(d3.extent(V)).nice()
            .ticks(100); // using d3 scale linear to return evenly spaced ticks, but this may not always return 100 values
    }

    // whitening factor
    const scottsFactor = Math.pow(V.length, -0.2);
    const wFactor = 1/d3.deviation(V)/scottsFactor;
    const norm = Math.pow(2*Math.PI, -0.5)*wFactor/V.length;

    return X.map((x)=>{      
        let sum = 0;
        V.forEach((v)=>{
            sum += Math.exp(-Math.pow(((v - x)*wFactor), 2) / 2); //Math.exp: e^x
        });
        return [x, sum*norm];
    });
}

