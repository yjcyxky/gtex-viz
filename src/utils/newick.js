// Copyright 2011 Jason Davies https://github.com/jasondavies/newick.js

export function parseNewick(s) {
    var ancestors = [];
    var tree = {};
    var tokens = s.split(/\s*(;|\(|\)|,|:)\s*/);
    for (var i=0; i<tokens.length; i++) {
        var token = tokens[i];
        var subtree = {};

        switch (token) {
        case "(": // new branchset
            tree.branchset = [subtree];
            ancestors.push(tree);
            tree = subtree;
            break;
        case ",": // another branch
            ancestors[ancestors.length-1].branchset.push(subtree);
            tree = subtree;
            break;
        case ")": // optional name next
            tree = ancestors.pop();
            break;
        case ":": // optional length next
            break;
        default:
            var x = tokens[i-1];
            if (x == ")" || x == "(" || x == ",") {
                tree.name = token;
            } else if (x == ":") {
                tree.length = parseFloat(token);
            }
        }
    }
    return tree;
}

