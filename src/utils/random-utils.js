import {range} from "d3-array";

/**
 * Generate a list of x*y data objects with random values
 * The data object has this structure: {x: xlabel, y: ylabel, value: some value, displayValue: some value}
 * @param par
 * @returns {Array}
 */
export function generateRandomMatrix(par={x:20, y:20, scaleFactor:1, diverging:false, bubble:false}){
    let X = range(1, par.x+1); // generates a 1-based list.
    let Y = range(1, par.y+1);
    let data = [];
    X.forEach((x)=>{
        x = "x" + x.toString();
        Y.forEach((y)=>{
            y = "y" + y.toString();
            let v = Math.random()*par.scaleFactor;
            v = par.diverging&&Math.random() < 0.5 ? -v : v; // randomly assigning negative and positive values
            data.push({
                x: x,
                y: y,
                value: v,
                displayValue: parseFloat(v.toExponential()).toPrecision(3),
                r: par.bubble?Math.random()*30:undefined // only relevant to bubble map
            });
        });
    });
    return data;
}

/**
 * Generate a list of random values
 * @param par
 * @returns {Array}
 */
export function generateRandomList(par={n:100, scaleFactor:1}) {
    let X = range(0, par.n); // generates a 1-based list.
    return X.map(() => Math.random() * par.scaleFactor);

}