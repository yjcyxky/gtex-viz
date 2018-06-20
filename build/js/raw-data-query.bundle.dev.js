var RawDataQuery = (function (exports) {
'use strict';

var EOL = {};
var EOF = {};
var QUOTE = 34;
var NEWLINE = 10;
var RETURN = 13;

function objectConverter(columns) {
  return new Function("d", "return {" + columns.map(function(name, i) {
    return JSON.stringify(name) + ": d[" + i + "]";
  }).join(",") + "}");
}

function customConverter(columns, f) {
  var object = objectConverter(columns);
  return function(row, i) {
    return f(object(row), i, columns);
  };
}

// Compute unique columns in order of discovery.
function inferColumns(rows) {
  var columnSet = Object.create(null),
      columns = [];

  rows.forEach(function(row) {
    for (var column in row) {
      if (!(column in columnSet)) {
        columns.push(columnSet[column] = column);
      }
    }
  });

  return columns;
}

var dsv$1 = function(delimiter) {
  var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
      DELIMITER = delimiter.charCodeAt(0);

  function parse(text, f) {
    var convert, columns, rows = parseRows(text, function(row, i) {
      if (convert) return convert(row, i - 1);
      columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
    });
    rows.columns = columns || [];
    return rows;
  }

  function parseRows(text, f) {
    var rows = [], // output rows
        N = text.length,
        I = 0, // current character index
        n = 0, // current line number
        t, // current token
        eof = N <= 0, // current token followed by EOF?
        eol = false; // current token followed by EOL?

    // Strip the trailing newline.
    if (text.charCodeAt(N - 1) === NEWLINE) --N;
    if (text.charCodeAt(N - 1) === RETURN) --N;

    function token() {
      if (eof) return EOF;
      if (eol) return eol = false, EOL;

      // Unescape quotes.
      var i, j = I, c;
      if (text.charCodeAt(j) === QUOTE) {
        while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
        if ((i = I) >= N) eof = true;
        else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
        else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
        return text.slice(j + 1, i - 1).replace(/""/g, "\"");
      }

      // Find next delimiter or newline.
      while (I < N) {
        if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
        else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
        else if (c !== DELIMITER) continue;
        return text.slice(j, i);
      }

      // Return last token before EOF.
      return eof = true, text.slice(j, N);
    }

    while ((t = token()) !== EOF) {
      var row = [];
      while (t !== EOL && t !== EOF) row.push(t), t = token();
      if (f && (row = f(row, n++)) == null) continue;
      rows.push(row);
    }

    return rows;
  }

  function format(rows, columns) {
    if (columns == null) columns = inferColumns(rows);
    return [columns.map(formatValue).join(delimiter)].concat(rows.map(function(row) {
      return columns.map(function(column) {
        return formatValue(row[column]);
      }).join(delimiter);
    })).join("\n");
  }

  function formatRows(rows) {
    return rows.map(formatRow).join("\n");
  }

  function formatRow(row) {
    return row.map(formatValue).join(delimiter);
  }

  function formatValue(text) {
    return text == null ? ""
        : reFormat.test(text += "") ? "\"" + text.replace(/"/g, "\"\"") + "\""
        : text;
  }

  return {
    parse: parse,
    parseRows: parseRows,
    format: format,
    formatRows: formatRows
  };
};

var csv$1 = dsv$1(",");

var csvParse = csv$1.parse;

var tsv$1 = dsv$1("\t");

var tsvParse = tsv$1.parse;

function responseText(response) {
  if (!response.ok) throw new Error(response.status + " " + response.statusText);
  return response.text();
}

var text = function(input, init) {
  return fetch(input, init).then(responseText);
};

function dsvParse(parse) {
  return function(input, init, row) {
    if (arguments.length === 2 && typeof init === "function") row = init, init = undefined;
    return text(input, init).then(function(response) {
      return parse(response, row);
    });
  };
}

var csv = dsvParse(csvParse);
var tsv = dsvParse(tsvParse);

function responseJson(response) {
  if (!response.ok) throw new Error(response.status + " " + response.statusText);
  return response.json();
}

var json = function(input, init) {
  return fetch(input, init).then(responseJson);
};

var xhtml = "http://www.w3.org/1999/xhtml";

var namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

var namespace = function(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
};

function creatorInherit(name) {
  return function() {
    var document = this.ownerDocument,
        uri = this.namespaceURI;
    return uri === xhtml && document.documentElement.namespaceURI === xhtml
        ? document.createElement(name)
        : document.createElementNS(uri, name);
  };
}

function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}

var creator = function(name) {
  var fullname = namespace(name);
  return (fullname.local
      ? creatorFixed
      : creatorInherit)(fullname);
};

function none() {}

var selector = function(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
};

var selection_select = function(select) {
  if (typeof select !== "function") select = selector(select);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }

  return new Selection(subgroups, this._parents);
};

function empty() {
  return [];
}

var selectorAll = function(selector) {
  return selector == null ? empty : function() {
    return this.querySelectorAll(selector);
  };
};

var selection_selectAll = function(select) {
  if (typeof select !== "function") select = selectorAll(select);

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }

  return new Selection(subgroups, parents);
};

var matcher = function(selector) {
  return function() {
    return this.matches(selector);
  };
};

if (typeof document !== "undefined") {
  var element = document.documentElement;
  if (!element.matches) {
    var vendorMatches = element.webkitMatchesSelector
        || element.msMatchesSelector
        || element.mozMatchesSelector
        || element.oMatchesSelector;
    matcher = function(selector) {
      return function() {
        return vendorMatches.call(this, selector);
      };
    };
  }
}

var matcher$1 = matcher;

var selection_filter = function(match) {
  if (typeof match !== "function") match = matcher$1(match);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new Selection(subgroups, this._parents);
};

var sparse = function(update) {
  return new Array(update.length);
};

var selection_enter = function() {
  return new Selection(this._enter || this._groups.map(sparse), this._parents);
};

function EnterNode(parent, datum) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum;
}

EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
  insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
  querySelector: function(selector) { return this._parent.querySelector(selector); },
  querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
};

var constant = function(x) {
  return function() {
    return x;
  };
};

var keyPrefix = "$"; // Protect against keys like “__proto__”.

function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0,
      node,
      groupLength = group.length,
      dataLength = data.length;

  // Put any non-null nodes that fit into update.
  // Put any null nodes into enter.
  // Put any remaining data into enter.
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Put any non-null nodes that don’t fit into exit.
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}

function bindKey(parent, group, enter, update, exit, data, key) {
  var i,
      node,
      nodeByKeyValue = {},
      groupLength = group.length,
      dataLength = data.length,
      keyValues = new Array(groupLength),
      keyValue;

  // Compute the key for each node.
  // If multiple nodes have the same key, the duplicates are added to exit.
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
      if (keyValue in nodeByKeyValue) {
        exit[i] = node;
      } else {
        nodeByKeyValue[keyValue] = node;
      }
    }
  }

  // Compute the key for each datum.
  // If there a node associated with this key, join and add it to update.
  // If there is not (or the key is a duplicate), add it to enter.
  for (i = 0; i < dataLength; ++i) {
    keyValue = keyPrefix + key.call(parent, data[i], i, data);
    if (node = nodeByKeyValue[keyValue]) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue[keyValue] = null;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Add any remaining nodes that were not bound to data to exit.
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
      exit[i] = node;
    }
  }
}

var selection_data = function(value, key) {
  if (!value) {
    data = new Array(this.size()), j = -1;
    this.each(function(d) { data[++j] = d; });
    return data;
  }

  var bind = key ? bindKey : bindIndex,
      parents = this._parents,
      groups = this._groups;

  if (typeof value !== "function") value = constant(value);

  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j],
        group = groups[j],
        groupLength = group.length,
        data = value.call(parent, parent && parent.__data__, j, parents),
        dataLength = data.length,
        enterGroup = enter[j] = new Array(dataLength),
        updateGroup = update[j] = new Array(dataLength),
        exitGroup = exit[j] = new Array(groupLength);

    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

    // Now connect the enter nodes to their following update node, such that
    // appendChild can insert the materialized enter node before this node,
    // rather than at the end of the parent node.
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength);
        previous._next = next || null;
      }
    }
  }

  update = new Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
};

var selection_exit = function() {
  return new Selection(this._exit || this._groups.map(sparse), this._parents);
};

var selection_merge = function(selection$$1) {

  for (var groups0 = this._groups, groups1 = selection$$1._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new Selection(merges, this._parents);
};

var selection_order = function() {

  for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
      if (node = group[i]) {
        if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }

  return this;
};

var selection_sort = function(compare) {
  if (!compare) compare = ascending;

  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }

  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }

  return new Selection(sortgroups, this._parents).order();
};

function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

var selection_call = function() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
};

var selection_nodes = function() {
  var nodes = new Array(this.size()), i = -1;
  this.each(function() { nodes[++i] = this; });
  return nodes;
};

var selection_node = function() {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }

  return null;
};

var selection_size = function() {
  var size = 0;
  this.each(function() { ++size; });
  return size;
};

var selection_empty = function() {
  return !this.node();
};

var selection_each = function(callback) {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }

  return this;
};

function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}

function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}

function attrConstant(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}

function attrConstantNS(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}

function attrFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);
    else this.setAttribute(name, v);
  };
}

function attrFunctionNS(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}

var selection_attr = function(name, value) {
  var fullname = namespace(name);

  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local
        ? node.getAttributeNS(fullname.space, fullname.local)
        : node.getAttribute(fullname);
  }

  return this.each((value == null
      ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
      ? (fullname.local ? attrFunctionNS : attrFunction)
      : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
};

var defaultView = function(node) {
  return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
      || (node.document && node) // node is a Window
      || node.defaultView; // node is a Document
};

function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}

function styleConstant(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}

function styleFunction(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v, priority);
  };
}

var selection_style = function(name, value, priority) {
  return arguments.length > 1
      ? this.each((value == null
            ? styleRemove : typeof value === "function"
            ? styleFunction
            : styleConstant)(name, value, priority == null ? "" : priority))
      : styleValue(this.node(), name);
};

function styleValue(node, name) {
  return node.style.getPropertyValue(name)
      || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
}

function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}

function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}

function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];
    else this[name] = v;
  };
}

var selection_property = function(name, value) {
  return arguments.length > 1
      ? this.each((value == null
          ? propertyRemove : typeof value === "function"
          ? propertyFunction
          : propertyConstant)(name, value))
      : this.node()[name];
};

function classArray(string) {
  return string.trim().split(/^|\s+/);
}

function classList(node) {
  return node.classList || new ClassList(node);
}

function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}

ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};

function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.add(names[i]);
}

function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.remove(names[i]);
}

function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}

function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}

function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}

var selection_classed = function(name, value) {
  var names = classArray(name + "");

  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }

  return this.each((typeof value === "function"
      ? classedFunction : value
      ? classedTrue
      : classedFalse)(names, value));
};

function textRemove() {
  this.textContent = "";
}

function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}

function textFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}

var selection_text = function(value) {
  return arguments.length
      ? this.each(value == null
          ? textRemove : (typeof value === "function"
          ? textFunction
          : textConstant)(value))
      : this.node().textContent;
};

function htmlRemove() {
  this.innerHTML = "";
}

function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}

function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}

var selection_html = function(value) {
  return arguments.length
      ? this.each(value == null
          ? htmlRemove : (typeof value === "function"
          ? htmlFunction
          : htmlConstant)(value))
      : this.node().innerHTML;
};

function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}

var selection_raise = function() {
  return this.each(raise);
};

function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}

var selection_lower = function() {
  return this.each(lower);
};

var selection_append = function(name) {
  var create = typeof name === "function" ? name : creator(name);
  return this.select(function() {
    return this.appendChild(create.apply(this, arguments));
  });
};

function constantNull() {
  return null;
}

var selection_insert = function(name, before) {
  var create = typeof name === "function" ? name : creator(name),
      select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function() {
    return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
  });
};

function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}

var selection_remove = function() {
  return this.each(remove);
};

function selection_cloneShallow() {
  return this.parentNode.insertBefore(this.cloneNode(false), this.nextSibling);
}

function selection_cloneDeep() {
  return this.parentNode.insertBefore(this.cloneNode(true), this.nextSibling);
}

var selection_clone = function(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
};

var selection_datum = function(value) {
  return arguments.length
      ? this.property("__data__", value)
      : this.node().__data__;
};

var filterEvents = {};



if (typeof document !== "undefined") {
  var element$1 = document.documentElement;
  if (!("onmouseenter" in element$1)) {
    filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
  }
}

function filterContextListener(listener, index, group) {
  listener = contextListener(listener, index, group);
  return function(event) {
    var related = event.relatedTarget;
    if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
      listener.call(this, event);
    }
  };
}

function contextListener(listener, index, group) {
  return function(event1) {
    try {
      listener.call(this, this.__data__, index, group);
    } finally {
      
    }
  };
}

function parseTypenames(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return {type: t, name: name};
  });
}

function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.capture);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;
    else delete this.__on;
  };
}

function onAdd(typename, value, capture) {
  var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
  return function(d, i, group) {
    var on = this.__on, o, listener = wrap(value, i, group);
    if (on) for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.capture);
        this.addEventListener(o.type, o.listener = listener, o.capture = capture);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, capture);
    o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
    if (!on) this.__on = [o];
    else on.push(o);
  };
}

var selection_on = function(typename, value, capture) {
  var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }

  on = value ? onAdd : onRemove;
  if (capture == null) capture = false;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
  return this;
};

function dispatchEvent(node, type, params) {
  var window = defaultView(node),
      event = window.CustomEvent;

  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window.document.createEvent("Event");
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type, false, false);
  }

  node.dispatchEvent(event);
}

function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}

function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}

var selection_dispatch = function(type, params) {
  return this.each((typeof params === "function"
      ? dispatchFunction
      : dispatchConstant)(type, params));
};

var root = [null];

function Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}

function selection() {
  return new Selection([[document.documentElement]], root);
}

Selection.prototype = selection.prototype = {
  constructor: Selection,
  select: selection_select,
  selectAll: selection_selectAll,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  merge: selection_merge,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  clone: selection_clone,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch
};

var select = function(selector) {
  return typeof selector === "string"
      ? new Selection([[document.querySelector(selector)]], [document.documentElement])
      : new Selection([[selector]], root);
};

"use strict";
function getGtexUrls(){
    const host = 'https://gtexportal.org/rest/v1/'; // NOTE: top expressed genes are not yet in production
    return {
        dyneqtl: host + 'association/dyneqtl',

        exonExp: host + 'expression/medianExonExpression?datasetId=gtex_v7&hcluster=true&gencodeId=',

        geneId: host + 'reference/geneId?format=json&release=v7&geneId=',
        geneExp: host + 'expression/geneExpression?datasetId=gtex_v7&gencodeId=',
        geneModel: host + 'reference/collapsedGeneModel?unfiltered=false&release=v7&geneId=',
        geneModelUnfiltered: host + 'reference/collapsedGeneModel?unfiltered=true&release=v7&geneId=',

        isoform: host + 'reference/transcript?release=v7&gencode_id=',
        isoformExp: host + 'expression/isoformExpression?datasetId=gtex_v7&boxplotDetail=median&gencodeId=',

        junctionExp: host + 'expression/medianJunctionExpression?datasetId=gtex_v7&hcluster=true&gencodeId=',

        medGeneExp: host + 'expression/medianGeneExpression?datasetId=gtex_v7&hcluster=true&page_size=10000',

        // sample: 'data/gtex.Sample.csv',
        sample: 'tmpSummaryData/gtex.Sample.csv',
        snp: host + 'reference/snp?reference=current&format=json&snpId=',

        tissue:  host + 'dataset/tissueInfo',
        tissueSites: host + 'dataset/tissueSiteDetail?format=json',

        topInTissueFiltered: host + 'expression/topExpressedGene?datasetId=gtex_v7&filterMtGene=true&sort_by=median&sortDirection=desc&page_size=50&tissueId=',
        topInTissue: host + 'expression/topExpressedGene?datasetId=gtex_v7&sort_by=median&sortDirection=desc&page_size=50&tissueId=',

        variantId: host + 'reference/snp?format=json&reference=current&release=v7&variantId=',

        // local static files
        rnaseqCram: 'tmpSummaryData/rnaseq_cram_files_v7_dbGaP_011516.txt',
        wgsCram: 'tmpSummaryData/wgs_cram_files_v7_hg38_dbGaP_011516.txt',

        // fireCloud
        fcBilling: 'https://api.firecloud.org/api/profile/billing',
        fcWorkSpace: 'https://api.firecloud.org/api/workspaces',
        fcPortalWorkSpace: 'https://portal.firecloud.org/#workspaces'
    }
}

/**
 * Parse the genes from GTEx web service
 * @param data {Json}
 * @returns {List} of genes
 */


/**
 * Parse the tissues
 * @param data {Json}
 * @returns {List} of tissues
 */
function parseTissues(data){
    const attr = 'tissueInfo';
    if(!data.hasOwnProperty(attr)) throw 'Fatal Error: parseTissues input error.';
    const tissues = data[attr];

    // sanity check
    ['tissueId', 'tissueName', 'colorHex'].forEach((d)=>{
        if (!tissues[0].hasOwnProperty(d)) throw 'Fatal Error: parseTissue attr not found: ' + d;
    });

    return tissues;
}

/**
 * Parse the tissue groups
 * @param data {Json}
 * @param forEqtl {Boolean}
 * @returns {Dictionary} of lists of tissues indexed by the tissue group name
 */


/**
 * parse the exons
 * @param data {Json}
 * @returns {List} of exons
 */


/**
 * parse the junctions
 * @param data
 * @returns {List} of junctions
 * // we do not store junction structure annotations in Mongo
    // so here we use the junction expression web service to retrieve the junction genomic locations
    // assuming that each tissue has the same junctions,
    // to grab all the known junctions of a gene, we only need to look at one tissue
    // here we arbitrarily pick Liver.
 */


/**
 * parse transcript isoforms from the GTEx web service: 'reference/transcript?release=v7&gencode_id='
 * @param data {Json}
 * returns a dictionary of transcript exon object lists indexed by ENST IDs
 */


/**
 * parse transcript isoforms
 * @param data {Json} from GTEx web service 'reference/transcript?release=v7&gencode_id='
 * returns a list of isoform objects
 */


/**
 * parse final (masked) gene model exon expression
 * expression is normalized to reads per kb
 * @param data {JSON} of exon expression web service
 * @param exons {List} of exons with positions
 * @param useLog {boolean} use log2 transformation
 * @param adjust {Number} default 0.01
 * @returns {List} of exon objects
 */


/**
 * Parse junction median read count data
 * @param data {JSON} of the junction expression web service
 * @param useLog {Boolean} perform log transformation
 * @param adjust {Number} for handling 0's when useLog is true
 * @returns {List} of junction objects
 */


/**
 * parse isoform expression
 * @param data
 * @param useLog
 * @param adjust
 * @returns {*}
 */




/**
 * parse median gene expression
 * @param data {Json} with attr medianGeneExpression
 * @param useLog {Boolean} performs log10 transformation
 * @returns {*}
 */


/**
 * parse the gene expression
 * @param gencodeId {String}
 * @param data {Json} with attr: tissueId, geneSymbol
 * @returns {{exp: {}, geneSymbol: string}}
 */
// function parseGeneExpression(gencodeId, data){
//     let lookupTable = {
//         exp: {}, // indexed by tissueId
//         geneSymbol: ''
//     };
//     if(!data.hasOwnProperty(attr)) throw ('parseGeneExpression input error.');
//     data[attr].forEach((d)=>{
//         if (d.gencodeId == gencodeId) {
//             // if the gencode ID matches the query gencodeId,
//             // add the expression data to the lookup table
//             lookupTable.exp[d.tissueId] = d.data;
//             if ('' == lookupTable.geneSymbol) lookupTable.geneSymbol = d.geneSymbol
//         }
//     });
//     return lookupTable
// }

/**
 * parse the expression data of a gene for a grouped violin plot
 * @param data {JSON} from GTEx gene expression web service
 * @param colors {Dictionary} the violin color for genes
 */

/**
 * Creates an SVG
 * @param id {String} a DOM element ID that starts with a "#"
 * @param width {Numeric}
 * @param height {Numeric}
 * @param margin {Object} with two attributes: width and height
 * @return {Selection} the d3 selection object of the SVG
 */

/**
 *
 * @param id {String} the parent dom ID
 * @param width {Numeric}
 * @param height {Numeric}
 * @param margin {Object} with attr: left, top
 * @param svgId {String}
 * @returns {*}
 */


/**
 *
 * @param svgObj
 * @param downloadFileName {String}
 * @param tempDownloadDivId {String}
 */

/**
 * A function for parsing the CSS style sheet and including the style properties in the downloadable SVG.
 * @param dom
 * @returns {Element}
 */
function parseCssStyles (dom) {
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
                    //Some selectors won't work, and most of these don't matter.
                    try {
                        elems = $(dom).find(rule.selectorText);
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
            if (e.name !== 'SecurityError') throw e;
            continue;
        }
    }

    var s = document.createElement('style');
    s.setAttribute('type', 'text/css');
    s.innerHTML = "<![CDATA[\n" + used + "\n]]>";

    return s;
}

/**
 * Create a toolbar
 * This class uses a lot of jQuery for dom element manipulation
 */

class Toolbar {
    constructor(domId, tooltip=undefined, vertical=false){
        $(`#${domId}`).show(); // if hidden

        // add a new bargroup div to domID with bootstrap button classes
        const btnClasses = vertical?'btn-group-vertical btn-group-sm': 'btn-group btn-group-sm';
        this.bar = $('<div/>').addClass(btnClasses).appendTo(`#${domId}`);
        this.buttons = {};
        this.tooltip = tooltip;
    }

    /**
     * Create a download button for SVG
     * @param id {String} the button dom ID
     * @param svgId {String} the SVG dom ID to grab and download
     * @param outfileName {String} the download file name
     * @param cloneId {String} the cloned SVG dom ID
     * @param icon {String} a fontawesome's icon class name
     */
    createDownloadSvgButton(id, svgId, outfileName, cloneId, icon='fa-download'){
        const $button = this.createButton(id, icon);
        select(`#${id}`)
            .on('click', ()=>{
                this.downloadSvg(svgId, outfileName, cloneId);
            })
            .on('mouseover', ()=>{
                this.tooltip.show("Download");
            })
            .on('mouseout', ()=>{
                this.tooltip.hide();
            });
    }

    createResetButton(id, callback, icon='fa-expand-arrows-alt'){
        const $button = this.createButton(id, icon);
        select(`#${id}`)
            .on('click', callback)
            .on('mouseover', ()=>{
                this.tooltip.show("Reset the scales");
            })
            .on('mouseout', ()=>{
                this.tooltip.hide();
            });
    }

    /**
     * create a button to the toolbar
     * @param id {String} the button's id
     * @param icon {String} a fontawesome icon class
     * Dependencies: Bootstrap, jQuery, Fontawesome
     */
    createButton(id, icon='fa-download'){
        const $button = $('<a/>').attr('id', id)
            .addClass('btn btn-default').appendTo(this.bar);
        $('<i/>').addClass(`fa ${icon}`).appendTo($button);
        this.buttons[id] = $button;
        return $button;
    }

    /**
     * attach a tooltip dom with the toolbar
     * @param tooltip {Tooltip}
     */
    attachTooltip(tooltip){
        this.tooltip = tooltip;
    }

    /**
     * Download SVG obj
     * @param svgId {String} the SVG dom ID
     * @param fileName {String} the output file name
     * @param cloneId {String} the temporary dom ID to copy the SVG to
     * Dependencies: FileSaver
     */
    downloadSvg(svgId, fileName, cloneId){
        // let svgObj = $($($(`${"#" +svgId} svg`))[0]); // complicated jQuery to get to the SVG object
        let svgObj = $($($(`${"#" +svgId}`))[0]);
        let $svgCopy = svgObj.clone()
        .attr("version", "1.1")
        .attr("xmlns", "http://www.w3.org/2000/svg");

        // parse and add all the CSS styling used by the SVG
        let styles = parseCssStyles(svgObj.get());
        $svgCopy.prepend(styles);

        $("#" + cloneId).html('').hide(); // make sure the copyID is invisible
        let svgHtml = $(`#${cloneId}`).append($svgCopy).html();

        let svgBlob = new Blob([svgHtml], {type: "image/svg+xml"});
        saveAs(svgBlob, fileName); // this is a FileSaver function....

        // clear the temp download div
        $(`#${cloneId}`).html('').hide();
    }
}

/****** Google SignIn ******/
function googleFunc(){
    return {
        checkSignedIn: checkSignedIn,
        getUser: getUser,
        signInButton: renderSignInButton$1,
        signOut: signOut$1,
        grantScopes: grantScopes
    }
}

function renderSignInButton$1(){
    gapi.signin2.render('my-signin2', {
        // 'scope': 'profile email https://www.googleapis.com/auth/devstorage.full_control https://www.googleapis.com/auth/plus.me',
        'scope': 'profile email',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}

function onSuccess(googleUser){
    $('#g-signout').show();
}

function signOut$1() {
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function() {
        console.log('User signed out');
    });
    $('#g-signout').hide();
}

function onFailure(error){
    console.error(error);
}

function checkSignedIn(){
    if (gapi.auth2) {
        return getUser().isSignedIn();
    } else {
        return false;
    }
}

function getUser(){
    return gapi.auth2.getAuthInstance().currentUser.get()
}

function grantScopes(scopes){
    this.getUser().grant({scope: scopes}).then(
        function(success){
            console.log(JSON.stringify({message: "success", value: success}));
        },
        function(fail){
            console.error(JSON>stringify({message: "fail", value: fail}));
        }
    );
}

'use strict';
/*
TODO:
first build a data matrix with the following structure
{
    col: tissues
    row: data types
    data: [ objects with col and row and value ]
}
 */

/**
 * Render the google signed in button (if there isn't one provided already)
 * @param callback {Function}
 */
function renderSignInButton(callback=googleFunc().signInButton){
    callback();
}

/**
 * Define the Google sign out function
 * @param callback {Function}
 */
function signOut(callback=googleFunc().signOut){
    callback();
}

/**
 * build the data matrix table
 * @param tableId {String}
 * @param datasetId {String}
 * @param googleFunc {Object} with function attributes: checkSignedIn, getUser
 * @param urls
 */

function launch(tableId, datasetId='gtex_v7', googleFuncDict=googleFunc(), urls=getGtexUrls()){
    const promises = [
        // TODO: urls for other datasets
        json(urls.tissue),
        tsv(urls.rnaseqCram),
        tsv(urls.wgsCram),
        tsv(urls.sample),
    ];

    Promise.all(promises)
        .then(function(args){
            let tissues = parseTissues(args[0]);
            const cram = {
                rnaseq: args[1].reduce((a, d)=>{a[d.sample_id.toUpperCase()]=d; return a;}, {}),
                wgs: args[2].reduce((a, d)=>{a[d.sample_id.toUpperCase()]=d; return a;}, {})
            };
            let samples = args[3]
                .filter((s)=>s.datasetId==datasetId)
                .map((s)=>{
                    switch (s.dataType){
                        case "WGS": {
                            if (!cram.wgs.hasOwnProperty(s.sampleId)) throw s.sampleId + ' has no cram files';
                            s.cramFile = cram.wgs[s.sampleId];
                            break;
                        }
                        case "RNASEQ": {
                            if (!cram.rnaseq.hasOwnProperty(s.sampleId)) throw s.sampleId + ' has no cram files';
                            s.cramFile = cram.rnaseq[s.sampleId];
                            break;
                        }
                        default:
                            // do nothing
                    }
                    return s;
                });
            const theMatrix = _buildMatrix(datasetId, samples, tissues);
            _renderMatrixTable(tableId, theMatrix, googleFuncDict, urls);
            _addFilters(tableId, theMatrix, samples, tissues, googleFuncDict, urls);

        })
        .catch(function(err){console.error(err);});
}

function _addFilters(tableId, mat, samples, tissues, googleFuncDict, urls){
    const __filter = ()=>{
        const sex = select('input[name="sex"]:checked').node().value;
        const age = select('input[name="age"]:checked').node().value;
        if (sex == 'both' && age == 'all'){
            _renderMatrixTable(tableId, _buildMatrix(mat.datasetId, samples, tissues), googleFuncDict, urls);
        } else {
            let filteredMat = undefined;
            if (sex == 'both') filteredMat = _buildMatrix(mat.datasetId, samples.filter(s=>s.ageBracket==age), tissues);
            else if (age == 'all') filteredMat = _buildMatrix(mat.datasetId, samples.filter(s=>s.sex==sex), tissues);
            else filteredMat = _buildMatrix(mat.datasetId, samples.filter(s=>s.sex==sex && s.ageBracket==age), tissues);
            _renderMatrixTable(tableId, filteredMat, googleFuncDict, urls);
        }
    };
    select('#filter-menu').selectAll('input[name="sex"]').on('change', __filter);
    select('#filter-menu').selectAll('input[name="age"]').on('change', __filter);
}

function _buildMatrix(datasetId, samples, tissues){
    const __buildHash = function(dataType){
        return samples.filter((s)=>s.dataType==dataType).reduce((a, d)=>{
            if(a[d.tissueId]===undefined) a[d.tissueId] = 0;
            a[d.tissueId]= a[d.tissueId]+1;
            return a;
        }, {});
    };
    const columns = [
        {
            label: 'RNA-Seq',
            id: 'RNASEQ',
            data: __buildHash('RNASEQ')
        },
        {
            label: 'WES',
            id: 'WES',
            data: __buildHash('WES')
        },
        {
            label: 'WGS',
            id: 'WGS',
            data: __buildHash('WGS')
        }
    ];
    const rows = tissues.map((t)=>{
        t.id = t.tissueId;
        t.label = t.tissueName;
        columns.forEach((col)=>{
            t[col.id] = col.data[t.id] || undefined;
        });
        return t;
    });

    return {
        datasetId: datasetId,
        X: rows,
        Y: columns,
        data: samples
    };
}


/**
 * Render the matrix in an HTML table format
 * @param tableId {String} the DOM ID of the table
 * @param mat {Object} of attr: datasetId, X--a list of x objects, Y--a list of y objects
 * @private
 */
function _renderMatrixTable(tableId, mat, googleFuncDict, urls){
    const dataset = {
        'gtex_v7': {
            label:'GTEX V7',
            bgcolor: '#2a718b'
        }
    };
    // rendering the column labels
    const theTable = select(`#${tableId}`);
    theTable.select('thead').selectAll('th')
        .data([{label:"", id:""}].concat(mat.Y))
        .enter()
        .append('th')
        .attr('scope', 'col')
        .attr('class', (d, i)=>d.id==""?'':`y${i-1}`)
        .text((d)=>d.label);

    theTable.select('.table-label').selectAll('*').remove();
    theTable.select('.table-label').append('th')
        .attr('colspan', mat.Y.length + 1)
        .text(dataset[mat.datasetId].label)
        .style('background-color',dataset[mat.datasetId].bgcolor);

    _renderCounts(theTable.select('tbody'), mat);
    _addClickEvents(tableId);
    _addToolbar(tableId, mat, googleFuncDict, urls); // rebuild the toolbar with the new matrix
}

function _renderCounts(tbody, mat){
    tbody.selectAll('.data-row').remove();
    const theRows = tbody.selectAll('.data-row')
        .data(mat.X)
        .enter()
        .append('tr')
        .classed('data-row', true);

    // rendering the row label
    theRows.append('th')
        .attr('scope', 'row')
        .attr('class', (d, i)=>`x${i}`)
        .text((d)=>d.label);

    mat.Y.forEach((y, j)=>{
        theRows.append('td')
            .attr('class', (d, i)=>{
                return d[y.id]===undefined?'':`x${i} y${j}`;
            })
            .text((d)=>d[y.id]||'');
    });

}

/**
 * Add customized column, row and cell click events
 * @param tableId {String} the dom ID of the table
 * @private
 */
function _addClickEvents(tableId){
    const theCells = select(`#${tableId}`).select('tbody').selectAll('td');

    // column labels
    select(`#${tableId}`).select('thead').selectAll('th')
        .style('cursor', 'pointer')
        .on('click', function(){
            // toggle the selection
           const theColumn = select(this).attr('class');
           if (select(this).attr('scope') == 'col') {
               select(this).attr('scope', 'selected');
               theCells.filter(`.${theColumn}`).classed('selected', true);
           } else {
               select(this).attr('scope', 'col');
               theCells.filter(`.${theColumn}`).classed('selected', false);
           }
           // console.log(theColumn);
        });

    // row labels
    select(`#${tableId}`).select('tbody').selectAll('th')
        .style('cursor', 'pointer')
        .on('click', function(){
           const theRow = select(this).attr('class');
           if (select(this).attr('scope') == 'row') {
               select(this).attr('scope', 'selected');
               theCells.filter(`.${theRow}`).classed('selected', true);
           } else {
               select(this).attr('scope', 'row');
               theCells.filter(`.${theRow}`).classed('selected', false);
           }
           // console.log(theRow);
        });


    // data cells
    theCells.style('cursor', 'pointer')
        .on('click', function(){
            // toggle the selected class assignment
            select(this).classed('selected', !select(this).classed('selected'));
        });
}

/**
 *
 * @param tableId
 * @param mat
 * @private
 * Reference: https://github.com/eligrey/FileSaver.js/
 * Dependencies: googleUser.js
 */
function _addToolbar(tableId, mat, googleFuncDict, urls){
    // TODO: get rid of hard-coded dom IDs
    const theCells = select(`#${tableId}`).select('tbody').selectAll('td');
    select('#matrix-table-toolbar').selectAll('*').remove();
    const toolbar = new Toolbar('matrix-table-toolbar', undefined, true);
    toolbar.createButton('sample-download');
    toolbar.createButton('send-to-firecloud', 'fa-cloud-upload-alt');

    select('#sample-download')
        .style('cursor', 'pointer')
        .on('click', function(){
            let cells = theCells.filter(`.selected`);
            if (cells.empty()) alert('You have not selected any samples to download.');
            else {
                let downloadContent = [
                        'Sample ID',
                        'Tissue Name',
                        'Data Type',
                        'CRAM File GCP',
                        'CRAM File AWS',
                        'CRAM File MD5',
                        'CRAM File Size',
                        'CRAM Index GCP',
                        'CRAM Index AWS'
                    ].join("\t") + '\n';
                cells.each(function(d){
                    const marker = select(this).attr('class').split(' ').filter((c)=>{return c!='selected'});
                    const x = mat.X[parseInt(marker[0].replace('x', ''))].id;
                    const y = mat.Y[parseInt(marker[1].replace('y', ''))].id;
                    console.log('Download ' + x + ' : '+ y);

                    const selectedSamples = mat.data.filter((s)=>s.dataType==y&&s.tissueId==x&&s.dataType!='WES')
                        /**** WARNING: no WES cram files available ATM ****/
                        .map((s)=>{
                            console.log(s);
                            let cram = [
                                'cram_file',
                                'cram_file_aws',
                                'cram_file_md5',
                                'cram_file_size',
                                'cram_index',
                                'cram_index_aws'
                            ].map((d)=>s.cramFile[d]);
                            let columns = [s.cramFile.sample_id, s.tissueName, s.dataType].concat(cram);
                            return columns.join("\t");
                        });
                    console.log(selectedSamples);
                    downloadContent += selectedSamples.join("\n");
                });
                let file = new Blob([downloadContent], {type: 'text/plain;charset=utf-8'});
                saveAs(file, 'GTEx.cram.txt', true); // saveAs() is a FileSaver file, disable auto BOM

            }

        });

    select('#send-to-firecloud')
        .style('cursor', 'pointer')
        .on('click', function(){
            $('#fire-cloud-status').empty();
             if (!googleFuncDict.checkSignedIn()){
                 alert("You need to sign in first");
             }
             const scopes = 'profile email https://www.googleapis.com/auth/devstorage.full_control https://www.googleapis.com/auth/plus.me';
            googleFuncDict.grantScopes(scopes);
            _reportBillingProjects(googleFuncDict.getUser());
            _reportWorkspaces(googleFuncDict.getUser());

            let cells = theCells.filter(`.selected`);
            if (cells.empty()) alert('You have not selected any samples to download.');
            else {
                select('#fire-cloud-form').style("display", "block");
            }
        });

    select('#submit-to-firecloud-btn')
        .on('click', function(){
            $('#fire-cloud-status').empty();
            let cells = theCells.filter(`.selected`);
            let allSelectedSamples = [];
            cells.each(function(d) {
                const marker = select(this).attr('class').split(' ').filter((c) => {
                    return c != 'selected'
                });
                const x = mat.X[parseInt(marker[0].replace('x', ''))].id;
                const y = mat.Y[parseInt(marker[1].replace('y', ''))].id;
                console.log('Download ' + x + ' : ' + y);
                const selected = mat.data.filter((s)=>s.dataType==y&&s.tissueId==x&&s.dataType!='WES').map(d=> {
                    let temp = d.sampleId.split('-');
                    d.donorId = temp[0] + '-' + temp[1];
                    return d;
                }); // NOTE: currently we don't have WES CRAM file paths
                allSelectedSamples = allSelectedSamples.concat(selected);
            });
            console.log(allSelectedSamples.length);
            _submitToFireCloud(googleFuncDict, allSelectedSamples, urls);
            select('#fire-cloud-form').style("display", "none");
        });

    select('#cancel-firecloud-btn')
        .on('click', function(){
            select('#fire-cloud-form').style("display", "none");
            alert('Canceled!');
        });
}

/***** FireCloud API *****/
// reference: use this URL, https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=MyAccessToken, to check the access token info
// reference: https://developers.google.com/identity/sign-in/web/build-button
// dependencies: jQuery
function _reportBillingProjects(googleUser, domId="billing-project-list") {

    // let profile = googleUser.getBasicProfile();
    // console.log('ID: ' + profile.getId());
    // console.log('Name: ' + profile.getName());
    // console.log('Email: ' + profile.getEmail());
    // get the user's access token

    let token = googleUser.getAuthResponse(true).access_token;
    console.log(token);
    $.ajax({
        url: 'https://api.firecloud.org/api/profile/billing',
        type: 'GET',
        xhrFields: {
            withCredentials: false
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            // Can't figure out how to generate this form using D3... so here I'm using jQuery syntax
            $(`#${domId}`).empty();
            response.forEach((d)=>{
                $('<label>' +
                    `<input type="radio" name="billing-project" value="${d.projectName}"> ` +
                    d.projectName +
                   '</label><br/>'
                ).appendTo($(`#${domId}`));
            });

            console.log(response[0]);
        }
    });
}

function _reportWorkspaces(googleUser){
    let token = googleUser.getAuthResponse(true).access_token;
     // list User's workspaces
    $.ajax({
        url: 'https://api.firecloud.org/api/workspaces',
        type: 'GET',
        xhrFields: {
            withCredentials: false
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },

        success: function(response){
            const workspaces = response.filter((d)=>!d.public);
            console.log(workspaces);
        },
        error: function(error){
            console.error(error);
        }
    });
}

function _submitToFireCloud(googleFuncDict, samples, urls){
    const token = googleFuncDict.getUser().getAuthResponse(true).access_token;
    const namespace = $('input[name="billing-project"]').val();
    const workspace = $('input[name="workspace"]').val();
    if(namespace === undefined) {
        alert('You must provide a billin project');
        throw("billing project is not provided");
        return;
    }
    if (workspace === undefined || workspace == ''){
        alert('You must provide a new workspace name');
        throw('workspace name is not provided');
        return;
    }
    console.log(workspace);
    console.log(samples);
    $('#spinner').show();
    // create the workspace
    $.ajax({
        url: urls.fcWorkSpace,
        type: 'POST',
        xhrFields: {
            withCredentials: false
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({
            "namespace": namespace,
            "name": workspace,
            "attributes": {},
            "authorizationDomain": []
        }),
        success: function(response){ // callback function after workspace is created
            console.log("finished creating workspace...");
            const donors = samples.map(d=>{
                if (!d.hasOwnProperty('donorId')) throw 'Sample does not contain attr donorId.';
                return d.donorId;
            }).filter((d, i, a) => a.indexOf(d) === i); // obtain unique donors
            const donorEntityString = `entities=entity:participant_id\n${donors.join('\n')}\n`;
            const donorEntityUrlEncode = encodeURI(donorEntityString);

            // submitting participant IDs
            $.ajax({
                url: `${urls.fcWorkSpace}/${namespace}/${workspace}/importEntities`,
                type: 'POST',
                xhrFields: {
                    withCredentials: false
                },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                },
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'text',
                data: donorEntityUrlEncode,
                success: function(response){
                    $('#spinner').hide();
                    // finally, submitting samples
                    // prepare the sampleEntityString for FireCloud API
                    console.log("finished importing participant IDs...");
                    let sampleEntity = [['entity:sample_id', 'participant_id', 'sample_type', 'bam_file', 'bam_index'].join('\t')];
                    sampleEntity = sampleEntity.concat(samples.map(d=>{
                        if (d.cramFile === undefined) throw "Data Error: " + d;
                        if(!d.cramFile.hasOwnProperty('cram_file')) throw "Data Error: " + d;
                        // Note: use cramFile.sample_id instead of d.sampleId to preserve the occasional mixed case sample IDs
                        return [d.cramFile.sample_id, d.donorId, d.dataType, d.cramFile.cram_file, d.cramFile.cram_index].join('\t');
                    }));
                    const sampleEntityString = `entities=${sampleEntity.join('\n')}\n`;
                    const sampleEntityUrlEncode = encodeURI(sampleEntityString);
                    console.log(sampleEntityString);

                    $.ajax({
                        url: `${urls.fcWorkSpace}/${namespace}/${workspace}/importEntities`,
                        type: 'POST',
                        xhrFields: {
                            withCredentials: false
                        },
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                        },
                        contentType: 'application/x-www-form-urlencoded',
                        dataType: 'text',
                        data: sampleEntityUrlEncode,
                        success: function(response){
                            console.log("finished importing samples...");
                            const fcURL = `${urls.fcPortalWorkSpace}/${namespace}/${workspace}/data`;
                            $('#fire-cloud-status').html(`Submitted! <br/> Go to your <br/> <a target="_blank" href="${fcURL}">FireCloud workspace</a>`);
                        },
                        error: function(error){console.error(error);}
                    });
                },
                error: function(error){console.error(error);}
            });
        },
        error: function(error){console.error(error);}
    });
}

exports.renderSignInButton = renderSignInButton;
exports.signOut = signOut;
exports.launch = launch;

return exports;

}({}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF3LWRhdGEtcXVlcnkuYnVuZGxlLmRldi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWRzdi9zcmMvZHN2LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWRzdi9zcmMvY3N2LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWRzdi9zcmMvdHN2LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWZldGNoL3NyYy90ZXh0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWZldGNoL3NyYy9kc3YuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZDMtZmV0Y2gvc3JjL2pzb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9uYW1lc3BhY2VzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvbmFtZXNwYWNlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvY3JlYXRvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdG9yQWxsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdEFsbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL21hdGNoZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZmlsdGVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NwYXJzZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9lbnRlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2NvbnN0YW50LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2RhdGEuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZXhpdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9tZXJnZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9vcmRlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zb3J0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2NhbGwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbm9kZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbm9kZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zaXplLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VtcHR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VhY2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vYXR0ci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3dpbmRvdy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zdHlsZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9wcm9wZXJ0eS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbGFzc2VkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3RleHQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaHRtbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9yYWlzZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9sb3dlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9hcHBlbmQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaW5zZXJ0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3JlbW92ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbG9uZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXR1bS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9vbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kaXNwYXRjaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdC5qcyIsIi4uLy4uL3NyYy9zY3JpcHRzL21vZHVsZXMvZ3RleERhdGFQYXJzZXIuanMiLCIuLi8uLi9zcmMvc2NyaXB0cy9tb2R1bGVzL3V0aWxzLmpzIiwiLi4vLi4vc3JjL3NjcmlwdHMvbW9kdWxlcy9Ub29sYmFyLmpzIiwiLi4vLi4vc3JjL3NjcmlwdHMvbW9kdWxlcy9nb29nbGVVc2VyLmpzIiwiLi4vLi4vc3JjL3NjcmlwdHMvUmF3RGF0YVF1ZXJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBFT0wgPSB7fSxcbiAgICBFT0YgPSB7fSxcbiAgICBRVU9URSA9IDM0LFxuICAgIE5FV0xJTkUgPSAxMCxcbiAgICBSRVRVUk4gPSAxMztcblxuZnVuY3Rpb24gb2JqZWN0Q29udmVydGVyKGNvbHVtbnMpIHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbihcImRcIiwgXCJyZXR1cm4ge1wiICsgY29sdW1ucy5tYXAoZnVuY3Rpb24obmFtZSwgaSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShuYW1lKSArIFwiOiBkW1wiICsgaSArIFwiXVwiO1xuICB9KS5qb2luKFwiLFwiKSArIFwifVwiKTtcbn1cblxuZnVuY3Rpb24gY3VzdG9tQ29udmVydGVyKGNvbHVtbnMsIGYpIHtcbiAgdmFyIG9iamVjdCA9IG9iamVjdENvbnZlcnRlcihjb2x1bW5zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHJvdywgaSkge1xuICAgIHJldHVybiBmKG9iamVjdChyb3cpLCBpLCBjb2x1bW5zKTtcbiAgfTtcbn1cblxuLy8gQ29tcHV0ZSB1bmlxdWUgY29sdW1ucyBpbiBvcmRlciBvZiBkaXNjb3ZlcnkuXG5mdW5jdGlvbiBpbmZlckNvbHVtbnMocm93cykge1xuICB2YXIgY29sdW1uU2V0ID0gT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICAgIGNvbHVtbnMgPSBbXTtcblxuICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KSB7XG4gICAgZm9yICh2YXIgY29sdW1uIGluIHJvdykge1xuICAgICAgaWYgKCEoY29sdW1uIGluIGNvbHVtblNldCkpIHtcbiAgICAgICAgY29sdW1ucy5wdXNoKGNvbHVtblNldFtjb2x1bW5dID0gY29sdW1uKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBjb2x1bW5zO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihkZWxpbWl0ZXIpIHtcbiAgdmFyIHJlRm9ybWF0ID0gbmV3IFJlZ0V4cChcIltcXFwiXCIgKyBkZWxpbWl0ZXIgKyBcIlxcblxccl1cIiksXG4gICAgICBERUxJTUlURVIgPSBkZWxpbWl0ZXIuY2hhckNvZGVBdCgwKTtcblxuICBmdW5jdGlvbiBwYXJzZSh0ZXh0LCBmKSB7XG4gICAgdmFyIGNvbnZlcnQsIGNvbHVtbnMsIHJvd3MgPSBwYXJzZVJvd3ModGV4dCwgZnVuY3Rpb24ocm93LCBpKSB7XG4gICAgICBpZiAoY29udmVydCkgcmV0dXJuIGNvbnZlcnQocm93LCBpIC0gMSk7XG4gICAgICBjb2x1bW5zID0gcm93LCBjb252ZXJ0ID0gZiA/IGN1c3RvbUNvbnZlcnRlcihyb3csIGYpIDogb2JqZWN0Q29udmVydGVyKHJvdyk7XG4gICAgfSk7XG4gICAgcm93cy5jb2x1bW5zID0gY29sdW1ucyB8fCBbXTtcbiAgICByZXR1cm4gcm93cztcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlUm93cyh0ZXh0LCBmKSB7XG4gICAgdmFyIHJvd3MgPSBbXSwgLy8gb3V0cHV0IHJvd3NcbiAgICAgICAgTiA9IHRleHQubGVuZ3RoLFxuICAgICAgICBJID0gMCwgLy8gY3VycmVudCBjaGFyYWN0ZXIgaW5kZXhcbiAgICAgICAgbiA9IDAsIC8vIGN1cnJlbnQgbGluZSBudW1iZXJcbiAgICAgICAgdCwgLy8gY3VycmVudCB0b2tlblxuICAgICAgICBlb2YgPSBOIDw9IDAsIC8vIGN1cnJlbnQgdG9rZW4gZm9sbG93ZWQgYnkgRU9GP1xuICAgICAgICBlb2wgPSBmYWxzZTsgLy8gY3VycmVudCB0b2tlbiBmb2xsb3dlZCBieSBFT0w/XG5cbiAgICAvLyBTdHJpcCB0aGUgdHJhaWxpbmcgbmV3bGluZS5cbiAgICBpZiAodGV4dC5jaGFyQ29kZUF0KE4gLSAxKSA9PT0gTkVXTElORSkgLS1OO1xuICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoTiAtIDEpID09PSBSRVRVUk4pIC0tTjtcblxuICAgIGZ1bmN0aW9uIHRva2VuKCkge1xuICAgICAgaWYgKGVvZikgcmV0dXJuIEVPRjtcbiAgICAgIGlmIChlb2wpIHJldHVybiBlb2wgPSBmYWxzZSwgRU9MO1xuXG4gICAgICAvLyBVbmVzY2FwZSBxdW90ZXMuXG4gICAgICB2YXIgaSwgaiA9IEksIGM7XG4gICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGopID09PSBRVU9URSkge1xuICAgICAgICB3aGlsZSAoSSsrIDwgTiAmJiB0ZXh0LmNoYXJDb2RlQXQoSSkgIT09IFFVT1RFIHx8IHRleHQuY2hhckNvZGVBdCgrK0kpID09PSBRVU9URSk7XG4gICAgICAgIGlmICgoaSA9IEkpID49IE4pIGVvZiA9IHRydWU7XG4gICAgICAgIGVsc2UgaWYgKChjID0gdGV4dC5jaGFyQ29kZUF0KEkrKykpID09PSBORVdMSU5FKSBlb2wgPSB0cnVlO1xuICAgICAgICBlbHNlIGlmIChjID09PSBSRVRVUk4pIHsgZW9sID0gdHJ1ZTsgaWYgKHRleHQuY2hhckNvZGVBdChJKSA9PT0gTkVXTElORSkgKytJOyB9XG4gICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGogKyAxLCBpIC0gMSkucmVwbGFjZSgvXCJcIi9nLCBcIlxcXCJcIik7XG4gICAgICB9XG5cbiAgICAgIC8vIEZpbmQgbmV4dCBkZWxpbWl0ZXIgb3IgbmV3bGluZS5cbiAgICAgIHdoaWxlIChJIDwgTikge1xuICAgICAgICBpZiAoKGMgPSB0ZXh0LmNoYXJDb2RlQXQoaSA9IEkrKykpID09PSBORVdMSU5FKSBlb2wgPSB0cnVlO1xuICAgICAgICBlbHNlIGlmIChjID09PSBSRVRVUk4pIHsgZW9sID0gdHJ1ZTsgaWYgKHRleHQuY2hhckNvZGVBdChJKSA9PT0gTkVXTElORSkgKytJOyB9XG4gICAgICAgIGVsc2UgaWYgKGMgIT09IERFTElNSVRFUikgY29udGludWU7XG4gICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGosIGkpO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gbGFzdCB0b2tlbiBiZWZvcmUgRU9GLlxuICAgICAgcmV0dXJuIGVvZiA9IHRydWUsIHRleHQuc2xpY2UoaiwgTik7XG4gICAgfVxuXG4gICAgd2hpbGUgKCh0ID0gdG9rZW4oKSkgIT09IEVPRikge1xuICAgICAgdmFyIHJvdyA9IFtdO1xuICAgICAgd2hpbGUgKHQgIT09IEVPTCAmJiB0ICE9PSBFT0YpIHJvdy5wdXNoKHQpLCB0ID0gdG9rZW4oKTtcbiAgICAgIGlmIChmICYmIChyb3cgPSBmKHJvdywgbisrKSkgPT0gbnVsbCkgY29udGludWU7XG4gICAgICByb3dzLnB1c2gocm93KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcm93cztcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdChyb3dzLCBjb2x1bW5zKSB7XG4gICAgaWYgKGNvbHVtbnMgPT0gbnVsbCkgY29sdW1ucyA9IGluZmVyQ29sdW1ucyhyb3dzKTtcbiAgICByZXR1cm4gW2NvbHVtbnMubWFwKGZvcm1hdFZhbHVlKS5qb2luKGRlbGltaXRlcildLmNvbmNhdChyb3dzLm1hcChmdW5jdGlvbihyb3cpIHtcbiAgICAgIHJldHVybiBjb2x1bW5zLm1hcChmdW5jdGlvbihjb2x1bW4pIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdFZhbHVlKHJvd1tjb2x1bW5dKTtcbiAgICAgIH0pLmpvaW4oZGVsaW1pdGVyKTtcbiAgICB9KSkuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFJvd3Mocm93cykge1xuICAgIHJldHVybiByb3dzLm1hcChmb3JtYXRSb3cpLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRSb3cocm93KSB7XG4gICAgcmV0dXJuIHJvdy5tYXAoZm9ybWF0VmFsdWUpLmpvaW4oZGVsaW1pdGVyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFZhbHVlKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dCA9PSBudWxsID8gXCJcIlxuICAgICAgICA6IHJlRm9ybWF0LnRlc3QodGV4dCArPSBcIlwiKSA/IFwiXFxcIlwiICsgdGV4dC5yZXBsYWNlKC9cIi9nLCBcIlxcXCJcXFwiXCIpICsgXCJcXFwiXCJcbiAgICAgICAgOiB0ZXh0O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwYXJzZTogcGFyc2UsXG4gICAgcGFyc2VSb3dzOiBwYXJzZVJvd3MsXG4gICAgZm9ybWF0OiBmb3JtYXQsXG4gICAgZm9ybWF0Um93czogZm9ybWF0Um93c1xuICB9O1xufVxuIiwiaW1wb3J0IGRzdiBmcm9tIFwiLi9kc3ZcIjtcblxudmFyIGNzdiA9IGRzdihcIixcIik7XG5cbmV4cG9ydCB2YXIgY3N2UGFyc2UgPSBjc3YucGFyc2U7XG5leHBvcnQgdmFyIGNzdlBhcnNlUm93cyA9IGNzdi5wYXJzZVJvd3M7XG5leHBvcnQgdmFyIGNzdkZvcm1hdCA9IGNzdi5mb3JtYXQ7XG5leHBvcnQgdmFyIGNzdkZvcm1hdFJvd3MgPSBjc3YuZm9ybWF0Um93cztcbiIsImltcG9ydCBkc3YgZnJvbSBcIi4vZHN2XCI7XG5cbnZhciB0c3YgPSBkc3YoXCJcXHRcIik7XG5cbmV4cG9ydCB2YXIgdHN2UGFyc2UgPSB0c3YucGFyc2U7XG5leHBvcnQgdmFyIHRzdlBhcnNlUm93cyA9IHRzdi5wYXJzZVJvd3M7XG5leHBvcnQgdmFyIHRzdkZvcm1hdCA9IHRzdi5mb3JtYXQ7XG5leHBvcnQgdmFyIHRzdkZvcm1hdFJvd3MgPSB0c3YuZm9ybWF0Um93cztcbiIsImZ1bmN0aW9uIHJlc3BvbnNlVGV4dChyZXNwb25zZSkge1xuICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2Uuc3RhdHVzICsgXCIgXCIgKyByZXNwb25zZS5zdGF0dXNUZXh0KTtcbiAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgcmV0dXJuIGZldGNoKGlucHV0LCBpbml0KS50aGVuKHJlc3BvbnNlVGV4dCk7XG59XG4iLCJpbXBvcnQge2NzdlBhcnNlLCBkc3ZGb3JtYXQsIHRzdlBhcnNlfSBmcm9tIFwiZDMtZHN2XCI7XG5pbXBvcnQgdGV4dCBmcm9tIFwiLi90ZXh0XCI7XG5cbmZ1bmN0aW9uIGRzdlBhcnNlKHBhcnNlKSB7XG4gIHJldHVybiBmdW5jdGlvbihpbnB1dCwgaW5pdCwgcm93KSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIgJiYgdHlwZW9mIGluaXQgPT09IFwiZnVuY3Rpb25cIikgcm93ID0gaW5pdCwgaW5pdCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gdGV4dChpbnB1dCwgaW5pdCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgcmV0dXJuIHBhcnNlKHJlc3BvbnNlLCByb3cpO1xuICAgIH0pO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkc3YoZGVsaW1pdGVyLCBpbnB1dCwgaW5pdCwgcm93KSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzICYmIHR5cGVvZiBpbml0ID09PSBcImZ1bmN0aW9uXCIpIHJvdyA9IGluaXQsIGluaXQgPSB1bmRlZmluZWQ7XG4gIHZhciBmb3JtYXQgPSBkc3ZGb3JtYXQoZGVsaW1pdGVyKTtcbiAgcmV0dXJuIHRleHQoaW5wdXQsIGluaXQpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICByZXR1cm4gZm9ybWF0LnBhcnNlKHJlc3BvbnNlLCByb3cpO1xuICB9KTtcbn1cblxuZXhwb3J0IHZhciBjc3YgPSBkc3ZQYXJzZShjc3ZQYXJzZSk7XG5leHBvcnQgdmFyIHRzdiA9IGRzdlBhcnNlKHRzdlBhcnNlKTtcbiIsImZ1bmN0aW9uIHJlc3BvbnNlSnNvbihyZXNwb25zZSkge1xuICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2Uuc3RhdHVzICsgXCIgXCIgKyByZXNwb25zZS5zdGF0dXNUZXh0KTtcbiAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgcmV0dXJuIGZldGNoKGlucHV0LCBpbml0KS50aGVuKHJlc3BvbnNlSnNvbik7XG59XG4iLCJleHBvcnQgdmFyIHhodG1sID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgc3ZnOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXG4gIHhodG1sOiB4aHRtbCxcbiAgeGxpbms6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLFxuICB4bWw6IFwiaHR0cDovL3d3dy53My5vcmcvWE1MLzE5OTgvbmFtZXNwYWNlXCIsXG4gIHhtbG5zOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvXCJcbn07XG4iLCJpbXBvcnQgbmFtZXNwYWNlcyBmcm9tIFwiLi9uYW1lc3BhY2VzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIHByZWZpeCA9IG5hbWUgKz0gXCJcIiwgaSA9IHByZWZpeC5pbmRleE9mKFwiOlwiKTtcbiAgaWYgKGkgPj0gMCAmJiAocHJlZml4ID0gbmFtZS5zbGljZSgwLCBpKSkgIT09IFwieG1sbnNcIikgbmFtZSA9IG5hbWUuc2xpY2UoaSArIDEpO1xuICByZXR1cm4gbmFtZXNwYWNlcy5oYXNPd25Qcm9wZXJ0eShwcmVmaXgpID8ge3NwYWNlOiBuYW1lc3BhY2VzW3ByZWZpeF0sIGxvY2FsOiBuYW1lfSA6IG5hbWU7XG59XG4iLCJpbXBvcnQgbmFtZXNwYWNlIGZyb20gXCIuL25hbWVzcGFjZVwiO1xuaW1wb3J0IHt4aHRtbH0gZnJvbSBcIi4vbmFtZXNwYWNlc1wiO1xuXG5mdW5jdGlvbiBjcmVhdG9ySW5oZXJpdChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZG9jdW1lbnQgPSB0aGlzLm93bmVyRG9jdW1lbnQsXG4gICAgICAgIHVyaSA9IHRoaXMubmFtZXNwYWNlVVJJO1xuICAgIHJldHVybiB1cmkgPT09IHhodG1sICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5uYW1lc3BhY2VVUkkgPT09IHhodG1sXG4gICAgICAgID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKVxuICAgICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyh1cmksIG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdG9yRml4ZWQoZnVsbG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuICByZXR1cm4gKGZ1bGxuYW1lLmxvY2FsXG4gICAgICA/IGNyZWF0b3JGaXhlZFxuICAgICAgOiBjcmVhdG9ySW5oZXJpdCkoZnVsbG5hbWUpO1xufVxuIiwiZnVuY3Rpb24gbm9uZSgpIHt9XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiBzZWxlY3RvciA9PSBudWxsID8gbm9uZSA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICB9O1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4XCI7XG5pbXBvcnQgc2VsZWN0b3IgZnJvbSBcIi4uL3NlbGVjdG9yXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvcihzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIHN1Ym5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKHN1Ym5vZGUgPSBzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpKSB7XG4gICAgICAgIGlmIChcIl9fZGF0YV9fXCIgaW4gbm9kZSkgc3Vibm9kZS5fX2RhdGFfXyA9IG5vZGUuX19kYXRhX187XG4gICAgICAgIHN1Ymdyb3VwW2ldID0gc3Vibm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiZnVuY3Rpb24gZW1wdHkoKSB7XG4gIHJldHVybiBbXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHNlbGVjdG9yID09IG51bGwgPyBlbXB0eSA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICB9O1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4XCI7XG5pbXBvcnQgc2VsZWN0b3JBbGwgZnJvbSBcIi4uL3NlbGVjdG9yQWxsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvckFsbChzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IFtdLCBwYXJlbnRzID0gW10sIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHN1Ymdyb3Vwcy5wdXNoKHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSk7XG4gICAgICAgIHBhcmVudHMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHBhcmVudHMpO1xufVxuIiwidmFyIG1hdGNoZXIgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2hlcyhzZWxlY3Rvcik7XG4gIH07XG59O1xuXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICBpZiAoIWVsZW1lbnQubWF0Y2hlcykge1xuICAgIHZhciB2ZW5kb3JNYXRjaGVzID0gZWxlbWVudC53ZWJraXRNYXRjaGVzU2VsZWN0b3JcbiAgICAgICAgfHwgZWxlbWVudC5tc01hdGNoZXNTZWxlY3RvclxuICAgICAgICB8fCBlbGVtZW50Lm1vek1hdGNoZXNTZWxlY3RvclxuICAgICAgICB8fCBlbGVtZW50Lm9NYXRjaGVzU2VsZWN0b3I7XG4gICAgbWF0Y2hlciA9IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB2ZW5kb3JNYXRjaGVzLmNhbGwodGhpcywgc2VsZWN0b3IpO1xuICAgICAgfTtcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1hdGNoZXI7XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXhcIjtcbmltcG9ydCBtYXRjaGVyIGZyb20gXCIuLi9tYXRjaGVyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1hdGNoKSB7XG4gIGlmICh0eXBlb2YgbWF0Y2ggIT09IFwiZnVuY3Rpb25cIikgbWF0Y2ggPSBtYXRjaGVyKG1hdGNoKTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gW10sIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgbWF0Y2guY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpIHtcbiAgICAgICAgc3ViZ3JvdXAucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odXBkYXRlKSB7XG4gIHJldHVybiBuZXcgQXJyYXkodXBkYXRlLmxlbmd0aCk7XG59XG4iLCJpbXBvcnQgc3BhcnNlIGZyb20gXCIuL3NwYXJzZVwiO1xuaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLl9lbnRlciB8fCB0aGlzLl9ncm91cHMubWFwKHNwYXJzZSksIHRoaXMuX3BhcmVudHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRW50ZXJOb2RlKHBhcmVudCwgZGF0dW0pIHtcbiAgdGhpcy5vd25lckRvY3VtZW50ID0gcGFyZW50Lm93bmVyRG9jdW1lbnQ7XG4gIHRoaXMubmFtZXNwYWNlVVJJID0gcGFyZW50Lm5hbWVzcGFjZVVSSTtcbiAgdGhpcy5fbmV4dCA9IG51bGw7XG4gIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgdGhpcy5fX2RhdGFfXyA9IGRhdHVtO1xufVxuXG5FbnRlck5vZGUucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogRW50ZXJOb2RlLFxuICBhcHBlbmRDaGlsZDogZnVuY3Rpb24oY2hpbGQpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5pbnNlcnRCZWZvcmUoY2hpbGQsIHRoaXMuX25leHQpOyB9LFxuICBpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uKGNoaWxkLCBuZXh0KSB7IHJldHVybiB0aGlzLl9wYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkLCBuZXh0KTsgfSxcbiAgcXVlcnlTZWxlY3RvcjogZnVuY3Rpb24oc2VsZWN0b3IpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTsgfSxcbiAgcXVlcnlTZWxlY3RvckFsbDogZnVuY3Rpb24oc2VsZWN0b3IpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTsgfVxufTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4XCI7XG5pbXBvcnQge0VudGVyTm9kZX0gZnJvbSBcIi4vZW50ZXJcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi4vY29uc3RhbnRcIjtcblxudmFyIGtleVByZWZpeCA9IFwiJFwiOyAvLyBQcm90ZWN0IGFnYWluc3Qga2V5cyBsaWtlIOKAnF9fcHJvdG9fX+KAnS5cblxuZnVuY3Rpb24gYmluZEluZGV4KHBhcmVudCwgZ3JvdXAsIGVudGVyLCB1cGRhdGUsIGV4aXQsIGRhdGEpIHtcbiAgdmFyIGkgPSAwLFxuICAgICAgbm9kZSxcbiAgICAgIGdyb3VwTGVuZ3RoID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuXG4gIC8vIFB1dCBhbnkgbm9uLW51bGwgbm9kZXMgdGhhdCBmaXQgaW50byB1cGRhdGUuXG4gIC8vIFB1dCBhbnkgbnVsbCBub2RlcyBpbnRvIGVudGVyLlxuICAvLyBQdXQgYW55IHJlbWFpbmluZyBkYXRhIGludG8gZW50ZXIuXG4gIGZvciAoOyBpIDwgZGF0YUxlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgbm9kZS5fX2RhdGFfXyA9IGRhdGFbaV07XG4gICAgICB1cGRhdGVbaV0gPSBub2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbnRlcltpXSA9IG5ldyBFbnRlck5vZGUocGFyZW50LCBkYXRhW2ldKTtcbiAgICB9XG4gIH1cblxuICAvLyBQdXQgYW55IG5vbi1udWxsIG5vZGVzIHRoYXQgZG9u4oCZdCBmaXQgaW50byBleGl0LlxuICBmb3IgKDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBleGl0W2ldID0gbm9kZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYmluZEtleShwYXJlbnQsIGdyb3VwLCBlbnRlciwgdXBkYXRlLCBleGl0LCBkYXRhLCBrZXkpIHtcbiAgdmFyIGksXG4gICAgICBub2RlLFxuICAgICAgbm9kZUJ5S2V5VmFsdWUgPSB7fSxcbiAgICAgIGdyb3VwTGVuZ3RoID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoLFxuICAgICAga2V5VmFsdWVzID0gbmV3IEFycmF5KGdyb3VwTGVuZ3RoKSxcbiAgICAgIGtleVZhbHVlO1xuXG4gIC8vIENvbXB1dGUgdGhlIGtleSBmb3IgZWFjaCBub2RlLlxuICAvLyBJZiBtdWx0aXBsZSBub2RlcyBoYXZlIHRoZSBzYW1lIGtleSwgdGhlIGR1cGxpY2F0ZXMgYXJlIGFkZGVkIHRvIGV4aXQuXG4gIGZvciAoaSA9IDA7IGkgPCBncm91cExlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAga2V5VmFsdWVzW2ldID0ga2V5VmFsdWUgPSBrZXlQcmVmaXggKyBrZXkuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCk7XG4gICAgICBpZiAoa2V5VmFsdWUgaW4gbm9kZUJ5S2V5VmFsdWUpIHtcbiAgICAgICAgZXhpdFtpXSA9IG5vZGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub2RlQnlLZXlWYWx1ZVtrZXlWYWx1ZV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIENvbXB1dGUgdGhlIGtleSBmb3IgZWFjaCBkYXR1bS5cbiAgLy8gSWYgdGhlcmUgYSBub2RlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGtleSwgam9pbiBhbmQgYWRkIGl0IHRvIHVwZGF0ZS5cbiAgLy8gSWYgdGhlcmUgaXMgbm90IChvciB0aGUga2V5IGlzIGEgZHVwbGljYXRlKSwgYWRkIGl0IHRvIGVudGVyLlxuICBmb3IgKGkgPSAwOyBpIDwgZGF0YUxlbmd0aDsgKytpKSB7XG4gICAga2V5VmFsdWUgPSBrZXlQcmVmaXggKyBrZXkuY2FsbChwYXJlbnQsIGRhdGFbaV0sIGksIGRhdGEpO1xuICAgIGlmIChub2RlID0gbm9kZUJ5S2V5VmFsdWVba2V5VmFsdWVdKSB7XG4gICAgICB1cGRhdGVbaV0gPSBub2RlO1xuICAgICAgbm9kZS5fX2RhdGFfXyA9IGRhdGFbaV07XG4gICAgICBub2RlQnlLZXlWYWx1ZVtrZXlWYWx1ZV0gPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbnRlcltpXSA9IG5ldyBFbnRlck5vZGUocGFyZW50LCBkYXRhW2ldKTtcbiAgICB9XG4gIH1cblxuICAvLyBBZGQgYW55IHJlbWFpbmluZyBub2RlcyB0aGF0IHdlcmUgbm90IGJvdW5kIHRvIGRhdGEgdG8gZXhpdC5cbiAgZm9yIChpID0gMDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKG5vZGVCeUtleVZhbHVlW2tleVZhbHVlc1tpXV0gPT09IG5vZGUpKSB7XG4gICAgICBleGl0W2ldID0gbm9kZTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICBpZiAoIXZhbHVlKSB7XG4gICAgZGF0YSA9IG5ldyBBcnJheSh0aGlzLnNpemUoKSksIGogPSAtMTtcbiAgICB0aGlzLmVhY2goZnVuY3Rpb24oZCkgeyBkYXRhWysral0gPSBkOyB9KTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIHZhciBiaW5kID0ga2V5ID8gYmluZEtleSA6IGJpbmRJbmRleCxcbiAgICAgIHBhcmVudHMgPSB0aGlzLl9wYXJlbnRzLFxuICAgICAgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzO1xuXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdmFsdWUgPSBjb25zdGFudCh2YWx1ZSk7XG5cbiAgZm9yICh2YXIgbSA9IGdyb3Vwcy5sZW5ndGgsIHVwZGF0ZSA9IG5ldyBBcnJheShtKSwgZW50ZXIgPSBuZXcgQXJyYXkobSksIGV4aXQgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgdmFyIHBhcmVudCA9IHBhcmVudHNbal0sXG4gICAgICAgIGdyb3VwID0gZ3JvdXBzW2pdLFxuICAgICAgICBncm91cExlbmd0aCA9IGdyb3VwLmxlbmd0aCxcbiAgICAgICAgZGF0YSA9IHZhbHVlLmNhbGwocGFyZW50LCBwYXJlbnQgJiYgcGFyZW50Ll9fZGF0YV9fLCBqLCBwYXJlbnRzKSxcbiAgICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoLFxuICAgICAgICBlbnRlckdyb3VwID0gZW50ZXJbal0gPSBuZXcgQXJyYXkoZGF0YUxlbmd0aCksXG4gICAgICAgIHVwZGF0ZUdyb3VwID0gdXBkYXRlW2pdID0gbmV3IEFycmF5KGRhdGFMZW5ndGgpLFxuICAgICAgICBleGl0R3JvdXAgPSBleGl0W2pdID0gbmV3IEFycmF5KGdyb3VwTGVuZ3RoKTtcblxuICAgIGJpbmQocGFyZW50LCBncm91cCwgZW50ZXJHcm91cCwgdXBkYXRlR3JvdXAsIGV4aXRHcm91cCwgZGF0YSwga2V5KTtcblxuICAgIC8vIE5vdyBjb25uZWN0IHRoZSBlbnRlciBub2RlcyB0byB0aGVpciBmb2xsb3dpbmcgdXBkYXRlIG5vZGUsIHN1Y2ggdGhhdFxuICAgIC8vIGFwcGVuZENoaWxkIGNhbiBpbnNlcnQgdGhlIG1hdGVyaWFsaXplZCBlbnRlciBub2RlIGJlZm9yZSB0aGlzIG5vZGUsXG4gICAgLy8gcmF0aGVyIHRoYW4gYXQgdGhlIGVuZCBvZiB0aGUgcGFyZW50IG5vZGUuXG4gICAgZm9yICh2YXIgaTAgPSAwLCBpMSA9IDAsIHByZXZpb3VzLCBuZXh0OyBpMCA8IGRhdGFMZW5ndGg7ICsraTApIHtcbiAgICAgIGlmIChwcmV2aW91cyA9IGVudGVyR3JvdXBbaTBdKSB7XG4gICAgICAgIGlmIChpMCA+PSBpMSkgaTEgPSBpMCArIDE7XG4gICAgICAgIHdoaWxlICghKG5leHQgPSB1cGRhdGVHcm91cFtpMV0pICYmICsraTEgPCBkYXRhTGVuZ3RoKTtcbiAgICAgICAgcHJldmlvdXMuX25leHQgPSBuZXh0IHx8IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlID0gbmV3IFNlbGVjdGlvbih1cGRhdGUsIHBhcmVudHMpO1xuICB1cGRhdGUuX2VudGVyID0gZW50ZXI7XG4gIHVwZGF0ZS5fZXhpdCA9IGV4aXQ7XG4gIHJldHVybiB1cGRhdGU7XG59XG4iLCJpbXBvcnQgc3BhcnNlIGZyb20gXCIuL3NwYXJzZVwiO1xuaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLl9leGl0IHx8IHRoaXMuX2dyb3Vwcy5tYXAoc3BhcnNlKSwgdGhpcy5fcGFyZW50cyk7XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXhcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0aW9uKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzMCA9IHRoaXMuX2dyb3VwcywgZ3JvdXBzMSA9IHNlbGVjdGlvbi5fZ3JvdXBzLCBtMCA9IGdyb3VwczAubGVuZ3RoLCBtMSA9IGdyb3VwczEubGVuZ3RoLCBtID0gTWF0aC5taW4obTAsIG0xKSwgbWVyZ2VzID0gbmV3IEFycmF5KG0wKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cDAgPSBncm91cHMwW2pdLCBncm91cDEgPSBncm91cHMxW2pdLCBuID0gZ3JvdXAwLmxlbmd0aCwgbWVyZ2UgPSBtZXJnZXNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwMFtpXSB8fCBncm91cDFbaV0pIHtcbiAgICAgICAgbWVyZ2VbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBqIDwgbTA7ICsraikge1xuICAgIG1lcmdlc1tqXSA9IGdyb3VwczBbal07XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihtZXJnZXMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gLTEsIG0gPSBncm91cHMubGVuZ3RoOyArK2ogPCBtOykge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gZ3JvdXAubGVuZ3RoIC0gMSwgbmV4dCA9IGdyb3VwW2ldLCBub2RlOyAtLWkgPj0gMDspIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgaWYgKG5leHQgJiYgbmV4dCAhPT0gbm9kZS5uZXh0U2libGluZykgbmV4dC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShub2RlLCBuZXh0KTtcbiAgICAgICAgbmV4dCA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXhcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29tcGFyZSkge1xuICBpZiAoIWNvbXBhcmUpIGNvbXBhcmUgPSBhc2NlbmRpbmc7XG5cbiAgZnVuY3Rpb24gY29tcGFyZU5vZGUoYSwgYikge1xuICAgIHJldHVybiBhICYmIGIgPyBjb21wYXJlKGEuX19kYXRhX18sIGIuX19kYXRhX18pIDogIWEgLSAhYjtcbiAgfVxuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHNvcnRncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHNvcnRncm91cCA9IHNvcnRncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHNvcnRncm91cFtpXSA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICAgIHNvcnRncm91cC5zb3J0KGNvbXBhcmVOb2RlKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHNvcnRncm91cHMsIHRoaXMuX3BhcmVudHMpLm9yZGVyKCk7XG59XG5cbmZ1bmN0aW9uIGFzY2VuZGluZyhhLCBiKSB7XG4gIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogYSA+PSBiID8gMCA6IE5hTjtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbMF07XG4gIGFyZ3VtZW50c1swXSA9IHRoaXM7XG4gIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gIHJldHVybiB0aGlzO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBub2RlcyA9IG5ldyBBcnJheSh0aGlzLnNpemUoKSksIGkgPSAtMTtcbiAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkgeyBub2Rlc1srK2ldID0gdGhpczsgfSk7XG4gIHJldHVybiBub2Rlcztcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICB2YXIgbm9kZSA9IGdyb3VwW2ldO1xuICAgICAgaWYgKG5vZGUpIHJldHVybiBub2RlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBzaXplID0gMDtcbiAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkgeyArK3NpemU7IH0pO1xuICByZXR1cm4gc2l6ZTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gIXRoaXMubm9kZSgpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2FsbGJhY2spIHtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAwLCBtID0gZ3JvdXBzLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gMCwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZTsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkgY2FsbGJhY2suY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJpbXBvcnQgbmFtZXNwYWNlIGZyb20gXCIuLi9uYW1lc3BhY2VcIjtcblxuZnVuY3Rpb24gYXR0clJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0clJlbW92ZU5TKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudChuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnROUyhmdWxsbmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCB2YWx1ZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIGVsc2UgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdik7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbk5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBlbHNlIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCB2KTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciBub2RlID0gdGhpcy5ub2RlKCk7XG4gICAgcmV0dXJuIGZ1bGxuYW1lLmxvY2FsXG4gICAgICAgID8gbm9kZS5nZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpXG4gICAgICAgIDogbm9kZS5nZXRBdHRyaWJ1dGUoZnVsbG5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZWFjaCgodmFsdWUgPT0gbnVsbFxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyUmVtb3ZlTlMgOiBhdHRyUmVtb3ZlKSA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyRnVuY3Rpb25OUyA6IGF0dHJGdW5jdGlvbilcbiAgICAgIDogKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckNvbnN0YW50TlMgOiBhdHRyQ29uc3RhbnQpKSkoZnVsbG5hbWUsIHZhbHVlKSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlKSB7XG4gIHJldHVybiAobm9kZS5vd25lckRvY3VtZW50ICYmIG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldykgLy8gbm9kZSBpcyBhIE5vZGVcbiAgICAgIHx8IChub2RlLmRvY3VtZW50ICYmIG5vZGUpIC8vIG5vZGUgaXMgYSBXaW5kb3dcbiAgICAgIHx8IG5vZGUuZGVmYXVsdFZpZXc7IC8vIG5vZGUgaXMgYSBEb2N1bWVudFxufVxuIiwiaW1wb3J0IGRlZmF1bHRWaWV3IGZyb20gXCIuLi93aW5kb3dcIjtcblxuZnVuY3Rpb24gc3R5bGVSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVDb25zdGFudChuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgdmFsdWUsIHByaW9yaXR5KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVGdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICAgIGVsc2UgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCB2LCBwcmlvcml0eSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgID8gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgICA/IHN0eWxlUmVtb3ZlIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgID8gc3R5bGVGdW5jdGlvblxuICAgICAgICAgICAgOiBzdHlsZUNvbnN0YW50KShuYW1lLCB2YWx1ZSwgcHJpb3JpdHkgPT0gbnVsbCA/IFwiXCIgOiBwcmlvcml0eSkpXG4gICAgICA6IHN0eWxlVmFsdWUodGhpcy5ub2RlKCksIG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3R5bGVWYWx1ZShub2RlLCBuYW1lKSB7XG4gIHJldHVybiBub2RlLnN0eWxlLmdldFByb3BlcnR5VmFsdWUobmFtZSlcbiAgICAgIHx8IGRlZmF1bHRWaWV3KG5vZGUpLmdldENvbXB1dGVkU3R5bGUobm9kZSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKTtcbn1cbiIsImZ1bmN0aW9uIHByb3BlcnR5UmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGRlbGV0ZSB0aGlzW25hbWVdO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwcm9wZXJ0eUNvbnN0YW50KG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzW25hbWVdID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb3BlcnR5RnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSBkZWxldGUgdGhpc1tuYW1lXTtcbiAgICBlbHNlIHRoaXNbbmFtZV0gPSB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgID8gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyBwcm9wZXJ0eVJlbW92ZSA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBwcm9wZXJ0eUZ1bmN0aW9uXG4gICAgICAgICAgOiBwcm9wZXJ0eUNvbnN0YW50KShuYW1lLCB2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpW25hbWVdO1xufVxuIiwiZnVuY3Rpb24gY2xhc3NBcnJheShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy50cmltKCkuc3BsaXQoL158XFxzKy8pO1xufVxuXG5mdW5jdGlvbiBjbGFzc0xpc3Qobm9kZSkge1xuICByZXR1cm4gbm9kZS5jbGFzc0xpc3QgfHwgbmV3IENsYXNzTGlzdChub2RlKTtcbn1cblxuZnVuY3Rpb24gQ2xhc3NMaXN0KG5vZGUpIHtcbiAgdGhpcy5fbm9kZSA9IG5vZGU7XG4gIHRoaXMuX25hbWVzID0gY2xhc3NBcnJheShub2RlLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCIpO1xufVxuXG5DbGFzc0xpc3QucHJvdG90eXBlID0ge1xuICBhZGQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgaWYgKGkgPCAwKSB7XG4gICAgICB0aGlzLl9uYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLl9uYW1lcy5qb2luKFwiIFwiKSk7XG4gICAgfVxuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgaWYgKGkgPj0gMCkge1xuICAgICAgdGhpcy5fbmFtZXMuc3BsaWNlKGksIDEpO1xuICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLl9uYW1lcy5qb2luKFwiIFwiKSk7XG4gICAgfVxuICB9LFxuICBjb250YWluczogZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9uYW1lcy5pbmRleE9mKG5hbWUpID49IDA7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNsYXNzZWRBZGQobm9kZSwgbmFtZXMpIHtcbiAgdmFyIGxpc3QgPSBjbGFzc0xpc3Qobm9kZSksIGkgPSAtMSwgbiA9IG5hbWVzLmxlbmd0aDtcbiAgd2hpbGUgKCsraSA8IG4pIGxpc3QuYWRkKG5hbWVzW2ldKTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZFJlbW92ZShub2RlLCBuYW1lcykge1xuICB2YXIgbGlzdCA9IGNsYXNzTGlzdChub2RlKSwgaSA9IC0xLCBuID0gbmFtZXMubGVuZ3RoO1xuICB3aGlsZSAoKytpIDwgbikgbGlzdC5yZW1vdmUobmFtZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkVHJ1ZShuYW1lcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2xhc3NlZEFkZCh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRGYWxzZShuYW1lcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2xhc3NlZFJlbW92ZSh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRGdW5jdGlvbihuYW1lcywgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICh2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpID8gY2xhc3NlZEFkZCA6IGNsYXNzZWRSZW1vdmUpKHRoaXMsIG5hbWVzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIG5hbWVzID0gY2xhc3NBcnJheShuYW1lICsgXCJcIik7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIGxpc3QgPSBjbGFzc0xpc3QodGhpcy5ub2RlKCkpLCBpID0gLTEsIG4gPSBuYW1lcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIGlmICghbGlzdC5jb250YWlucyhuYW1lc1tpXSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IGNsYXNzZWRGdW5jdGlvbiA6IHZhbHVlXG4gICAgICA/IGNsYXNzZWRUcnVlXG4gICAgICA6IGNsYXNzZWRGYWxzZSkobmFtZXMsIHZhbHVlKSk7XG59XG4iLCJmdW5jdGlvbiB0ZXh0UmVtb3ZlKCkge1xuICB0aGlzLnRleHRDb250ZW50ID0gXCJcIjtcbn1cblxuZnVuY3Rpb24gdGV4dENvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRleHRGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKHZhbHVlID09IG51bGxcbiAgICAgICAgICA/IHRleHRSZW1vdmUgOiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IHRleHRGdW5jdGlvblxuICAgICAgICAgIDogdGV4dENvbnN0YW50KSh2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpLnRleHRDb250ZW50O1xufVxuIiwiZnVuY3Rpb24gaHRtbFJlbW92ZSgpIHtcbiAgdGhpcy5pbm5lckhUTUwgPSBcIlwiO1xufVxuXG5mdW5jdGlvbiBodG1sQ29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaW5uZXJIVE1MID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGh0bWxGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuaW5uZXJIVE1MID0gdiA9PSBudWxsID8gXCJcIiA6IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyBodG1sUmVtb3ZlIDogKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBodG1sRnVuY3Rpb25cbiAgICAgICAgICA6IGh0bWxDb25zdGFudCkodmFsdWUpKVxuICAgICAgOiB0aGlzLm5vZGUoKS5pbm5lckhUTUw7XG59XG4iLCJmdW5jdGlvbiByYWlzZSgpIHtcbiAgaWYgKHRoaXMubmV4dFNpYmxpbmcpIHRoaXMucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gocmFpc2UpO1xufVxuIiwiZnVuY3Rpb24gbG93ZXIoKSB7XG4gIGlmICh0aGlzLnByZXZpb3VzU2libGluZykgdGhpcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLCB0aGlzLnBhcmVudE5vZGUuZmlyc3RDaGlsZCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKGxvd2VyKTtcbn1cbiIsImltcG9ydCBjcmVhdG9yIGZyb20gXCIuLi9jcmVhdG9yXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGNyZWF0ZSA9IHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCIgPyBuYW1lIDogY3JlYXRvcihuYW1lKTtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmFwcGVuZENoaWxkKGNyZWF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfSk7XG59XG4iLCJpbXBvcnQgY3JlYXRvciBmcm9tIFwiLi4vY3JlYXRvclwiO1xuaW1wb3J0IHNlbGVjdG9yIGZyb20gXCIuLi9zZWxlY3RvclwiO1xuXG5mdW5jdGlvbiBjb25zdGFudE51bGwoKSB7XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCBiZWZvcmUpIHtcbiAgdmFyIGNyZWF0ZSA9IHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCIgPyBuYW1lIDogY3JlYXRvcihuYW1lKSxcbiAgICAgIHNlbGVjdCA9IGJlZm9yZSA9PSBudWxsID8gY29uc3RhbnROdWxsIDogdHlwZW9mIGJlZm9yZSA9PT0gXCJmdW5jdGlvblwiID8gYmVmb3JlIDogc2VsZWN0b3IoYmVmb3JlKTtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmluc2VydEJlZm9yZShjcmVhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSwgc2VsZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgbnVsbCk7XG4gIH0pO1xufVxuIiwiZnVuY3Rpb24gcmVtb3ZlKCkge1xuICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICBpZiAocGFyZW50KSBwYXJlbnQucmVtb3ZlQ2hpbGQodGhpcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKHJlbW92ZSk7XG59XG4iLCJmdW5jdGlvbiBzZWxlY3Rpb25fY2xvbmVTaGFsbG93KCkge1xuICByZXR1cm4gdGhpcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLmNsb25lTm9kZShmYWxzZSksIHRoaXMubmV4dFNpYmxpbmcpO1xufVxuXG5mdW5jdGlvbiBzZWxlY3Rpb25fY2xvbmVEZWVwKCkge1xuICByZXR1cm4gdGhpcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLmNsb25lTm9kZSh0cnVlKSwgdGhpcy5uZXh0U2libGluZyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGRlZXApIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGRlZXAgPyBzZWxlY3Rpb25fY2xvbmVEZWVwIDogc2VsZWN0aW9uX2Nsb25lU2hhbGxvdyk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLnByb3BlcnR5KFwiX19kYXRhX19cIiwgdmFsdWUpXG4gICAgICA6IHRoaXMubm9kZSgpLl9fZGF0YV9fO1xufVxuIiwidmFyIGZpbHRlckV2ZW50cyA9IHt9O1xuXG5leHBvcnQgdmFyIGV2ZW50ID0gbnVsbDtcblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgaWYgKCEoXCJvbm1vdXNlZW50ZXJcIiBpbiBlbGVtZW50KSkge1xuICAgIGZpbHRlckV2ZW50cyA9IHttb3VzZWVudGVyOiBcIm1vdXNlb3ZlclwiLCBtb3VzZWxlYXZlOiBcIm1vdXNlb3V0XCJ9O1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbHRlckNvbnRleHRMaXN0ZW5lcihsaXN0ZW5lciwgaW5kZXgsIGdyb3VwKSB7XG4gIGxpc3RlbmVyID0gY29udGV4dExpc3RlbmVyKGxpc3RlbmVyLCBpbmRleCwgZ3JvdXApO1xuICByZXR1cm4gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgcmVsYXRlZCA9IGV2ZW50LnJlbGF0ZWRUYXJnZXQ7XG4gICAgaWYgKCFyZWxhdGVkIHx8IChyZWxhdGVkICE9PSB0aGlzICYmICEocmVsYXRlZC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbih0aGlzKSAmIDgpKSkge1xuICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBjb250ZXh0TGlzdGVuZXIobGlzdGVuZXIsIGluZGV4LCBncm91cCkge1xuICByZXR1cm4gZnVuY3Rpb24oZXZlbnQxKSB7XG4gICAgdmFyIGV2ZW50MCA9IGV2ZW50OyAvLyBFdmVudHMgY2FuIGJlIHJlZW50cmFudCAoZS5nLiwgZm9jdXMpLlxuICAgIGV2ZW50ID0gZXZlbnQxO1xuICAgIHRyeSB7XG4gICAgICBsaXN0ZW5lci5jYWxsKHRoaXMsIHRoaXMuX19kYXRhX18sIGluZGV4LCBncm91cCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGV2ZW50ID0gZXZlbnQwO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gcGFyc2VUeXBlbmFtZXModHlwZW5hbWVzKSB7XG4gIHJldHVybiB0eXBlbmFtZXMudHJpbSgpLnNwbGl0KC9efFxccysvKS5tYXAoZnVuY3Rpb24odCkge1xuICAgIHZhciBuYW1lID0gXCJcIiwgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgbmFtZSA9IHQuc2xpY2UoaSArIDEpLCB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICByZXR1cm4ge3R5cGU6IHQsIG5hbWU6IG5hbWV9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gb25SZW1vdmUodHlwZW5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBvbiA9IHRoaXMuX19vbjtcbiAgICBpZiAoIW9uKSByZXR1cm47XG4gICAgZm9yICh2YXIgaiA9IDAsIGkgPSAtMSwgbSA9IG9uLmxlbmd0aCwgbzsgaiA8IG07ICsraikge1xuICAgICAgaWYgKG8gPSBvbltqXSwgKCF0eXBlbmFtZS50eXBlIHx8IG8udHlwZSA9PT0gdHlwZW5hbWUudHlwZSkgJiYgby5uYW1lID09PSB0eXBlbmFtZS5uYW1lKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLnR5cGUsIG8ubGlzdGVuZXIsIG8uY2FwdHVyZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvblsrK2ldID0gbztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCsraSkgb24ubGVuZ3RoID0gaTtcbiAgICBlbHNlIGRlbGV0ZSB0aGlzLl9fb247XG4gIH07XG59XG5cbmZ1bmN0aW9uIG9uQWRkKHR5cGVuYW1lLCB2YWx1ZSwgY2FwdHVyZSkge1xuICB2YXIgd3JhcCA9IGZpbHRlckV2ZW50cy5oYXNPd25Qcm9wZXJ0eSh0eXBlbmFtZS50eXBlKSA/IGZpbHRlckNvbnRleHRMaXN0ZW5lciA6IGNvbnRleHRMaXN0ZW5lcjtcbiAgcmV0dXJuIGZ1bmN0aW9uKGQsIGksIGdyb3VwKSB7XG4gICAgdmFyIG9uID0gdGhpcy5fX29uLCBvLCBsaXN0ZW5lciA9IHdyYXAodmFsdWUsIGksIGdyb3VwKTtcbiAgICBpZiAob24pIGZvciAodmFyIGogPSAwLCBtID0gb24ubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgICBpZiAoKG8gPSBvbltqXSkudHlwZSA9PT0gdHlwZW5hbWUudHlwZSAmJiBvLm5hbWUgPT09IHR5cGVuYW1lLm5hbWUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciwgby5jYXB0dXJlKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciA9IGxpc3RlbmVyLCBvLmNhcHR1cmUgPSBjYXB0dXJlKTtcbiAgICAgICAgby52YWx1ZSA9IHZhbHVlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0eXBlbmFtZS50eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgbyA9IHt0eXBlOiB0eXBlbmFtZS50eXBlLCBuYW1lOiB0eXBlbmFtZS5uYW1lLCB2YWx1ZTogdmFsdWUsIGxpc3RlbmVyOiBsaXN0ZW5lciwgY2FwdHVyZTogY2FwdHVyZX07XG4gICAgaWYgKCFvbikgdGhpcy5fX29uID0gW29dO1xuICAgIGVsc2Ugb24ucHVzaChvKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHlwZW5hbWUsIHZhbHVlLCBjYXB0dXJlKSB7XG4gIHZhciB0eXBlbmFtZXMgPSBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZSArIFwiXCIpLCBpLCBuID0gdHlwZW5hbWVzLmxlbmd0aCwgdDtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB2YXIgb24gPSB0aGlzLm5vZGUoKS5fX29uO1xuICAgIGlmIChvbikgZm9yICh2YXIgaiA9IDAsIG0gPSBvbi5sZW5ndGgsIG87IGogPCBtOyArK2opIHtcbiAgICAgIGZvciAoaSA9IDAsIG8gPSBvbltqXTsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAoKHQgPSB0eXBlbmFtZXNbaV0pLnR5cGUgPT09IG8udHlwZSAmJiB0Lm5hbWUgPT09IG8ubmFtZSkge1xuICAgICAgICAgIHJldHVybiBvLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIG9uID0gdmFsdWUgPyBvbkFkZCA6IG9uUmVtb3ZlO1xuICBpZiAoY2FwdHVyZSA9PSBudWxsKSBjYXB0dXJlID0gZmFsc2U7XG4gIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHRoaXMuZWFjaChvbih0eXBlbmFtZXNbaV0sIHZhbHVlLCBjYXB0dXJlKSk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3VzdG9tRXZlbnQoZXZlbnQxLCBsaXN0ZW5lciwgdGhhdCwgYXJncykge1xuICB2YXIgZXZlbnQwID0gZXZlbnQ7XG4gIGV2ZW50MS5zb3VyY2VFdmVudCA9IGV2ZW50O1xuICBldmVudCA9IGV2ZW50MTtcbiAgdHJ5IHtcbiAgICByZXR1cm4gbGlzdGVuZXIuYXBwbHkodGhhdCwgYXJncyk7XG4gIH0gZmluYWxseSB7XG4gICAgZXZlbnQgPSBldmVudDA7XG4gIH1cbn1cbiIsImltcG9ydCBkZWZhdWx0VmlldyBmcm9tIFwiLi4vd2luZG93XCI7XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQobm9kZSwgdHlwZSwgcGFyYW1zKSB7XG4gIHZhciB3aW5kb3cgPSBkZWZhdWx0Vmlldyhub2RlKSxcbiAgICAgIGV2ZW50ID0gd2luZG93LkN1c3RvbUV2ZW50O1xuXG4gIGlmICh0eXBlb2YgZXZlbnQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGV2ZW50ID0gbmV3IGV2ZW50KHR5cGUsIHBhcmFtcyk7XG4gIH0gZWxzZSB7XG4gICAgZXZlbnQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudFwiKTtcbiAgICBpZiAocGFyYW1zKSBldmVudC5pbml0RXZlbnQodHlwZSwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlKSwgZXZlbnQuZGV0YWlsID0gcGFyYW1zLmRldGFpbDtcbiAgICBlbHNlIGV2ZW50LmluaXRFdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UpO1xuICB9XG5cbiAgbm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hDb25zdGFudCh0eXBlLCBwYXJhbXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkaXNwYXRjaEV2ZW50KHRoaXMsIHR5cGUsIHBhcmFtcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRnVuY3Rpb24odHlwZSwgcGFyYW1zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2hFdmVudCh0aGlzLCB0eXBlLCBwYXJhbXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHR5cGUsIHBhcmFtcykge1xuICByZXR1cm4gdGhpcy5lYWNoKCh0eXBlb2YgcGFyYW1zID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gZGlzcGF0Y2hGdW5jdGlvblxuICAgICAgOiBkaXNwYXRjaENvbnN0YW50KSh0eXBlLCBwYXJhbXMpKTtcbn1cbiIsImltcG9ydCBzZWxlY3Rpb25fc2VsZWN0IGZyb20gXCIuL3NlbGVjdFwiO1xuaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3RBbGwgZnJvbSBcIi4vc2VsZWN0QWxsXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2ZpbHRlciBmcm9tIFwiLi9maWx0ZXJcIjtcbmltcG9ydCBzZWxlY3Rpb25fZGF0YSBmcm9tIFwiLi9kYXRhXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2VudGVyIGZyb20gXCIuL2VudGVyXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2V4aXQgZnJvbSBcIi4vZXhpdFwiO1xuaW1wb3J0IHNlbGVjdGlvbl9tZXJnZSBmcm9tIFwiLi9tZXJnZVwiO1xuaW1wb3J0IHNlbGVjdGlvbl9vcmRlciBmcm9tIFwiLi9vcmRlclwiO1xuaW1wb3J0IHNlbGVjdGlvbl9zb3J0IGZyb20gXCIuL3NvcnRcIjtcbmltcG9ydCBzZWxlY3Rpb25fY2FsbCBmcm9tIFwiLi9jYWxsXCI7XG5pbXBvcnQgc2VsZWN0aW9uX25vZGVzIGZyb20gXCIuL25vZGVzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX25vZGUgZnJvbSBcIi4vbm9kZVwiO1xuaW1wb3J0IHNlbGVjdGlvbl9zaXplIGZyb20gXCIuL3NpemVcIjtcbmltcG9ydCBzZWxlY3Rpb25fZW1wdHkgZnJvbSBcIi4vZW1wdHlcIjtcbmltcG9ydCBzZWxlY3Rpb25fZWFjaCBmcm9tIFwiLi9lYWNoXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2F0dHIgZnJvbSBcIi4vYXR0clwiO1xuaW1wb3J0IHNlbGVjdGlvbl9zdHlsZSBmcm9tIFwiLi9zdHlsZVwiO1xuaW1wb3J0IHNlbGVjdGlvbl9wcm9wZXJ0eSBmcm9tIFwiLi9wcm9wZXJ0eVwiO1xuaW1wb3J0IHNlbGVjdGlvbl9jbGFzc2VkIGZyb20gXCIuL2NsYXNzZWRcIjtcbmltcG9ydCBzZWxlY3Rpb25fdGV4dCBmcm9tIFwiLi90ZXh0XCI7XG5pbXBvcnQgc2VsZWN0aW9uX2h0bWwgZnJvbSBcIi4vaHRtbFwiO1xuaW1wb3J0IHNlbGVjdGlvbl9yYWlzZSBmcm9tIFwiLi9yYWlzZVwiO1xuaW1wb3J0IHNlbGVjdGlvbl9sb3dlciBmcm9tIFwiLi9sb3dlclwiO1xuaW1wb3J0IHNlbGVjdGlvbl9hcHBlbmQgZnJvbSBcIi4vYXBwZW5kXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2luc2VydCBmcm9tIFwiLi9pbnNlcnRcIjtcbmltcG9ydCBzZWxlY3Rpb25fcmVtb3ZlIGZyb20gXCIuL3JlbW92ZVwiO1xuaW1wb3J0IHNlbGVjdGlvbl9jbG9uZSBmcm9tIFwiLi9jbG9uZVwiO1xuaW1wb3J0IHNlbGVjdGlvbl9kYXR1bSBmcm9tIFwiLi9kYXR1bVwiO1xuaW1wb3J0IHNlbGVjdGlvbl9vbiBmcm9tIFwiLi9vblwiO1xuaW1wb3J0IHNlbGVjdGlvbl9kaXNwYXRjaCBmcm9tIFwiLi9kaXNwYXRjaFwiO1xuXG5leHBvcnQgdmFyIHJvb3QgPSBbbnVsbF07XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWxlY3Rpb24oZ3JvdXBzLCBwYXJlbnRzKSB7XG4gIHRoaXMuX2dyb3VwcyA9IGdyb3VwcztcbiAgdGhpcy5fcGFyZW50cyA9IHBhcmVudHM7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oW1tkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRdXSwgcm9vdCk7XG59XG5cblNlbGVjdGlvbi5wcm90b3R5cGUgPSBzZWxlY3Rpb24ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogU2VsZWN0aW9uLFxuICBzZWxlY3Q6IHNlbGVjdGlvbl9zZWxlY3QsXG4gIHNlbGVjdEFsbDogc2VsZWN0aW9uX3NlbGVjdEFsbCxcbiAgZmlsdGVyOiBzZWxlY3Rpb25fZmlsdGVyLFxuICBkYXRhOiBzZWxlY3Rpb25fZGF0YSxcbiAgZW50ZXI6IHNlbGVjdGlvbl9lbnRlcixcbiAgZXhpdDogc2VsZWN0aW9uX2V4aXQsXG4gIG1lcmdlOiBzZWxlY3Rpb25fbWVyZ2UsXG4gIG9yZGVyOiBzZWxlY3Rpb25fb3JkZXIsXG4gIHNvcnQ6IHNlbGVjdGlvbl9zb3J0LFxuICBjYWxsOiBzZWxlY3Rpb25fY2FsbCxcbiAgbm9kZXM6IHNlbGVjdGlvbl9ub2RlcyxcbiAgbm9kZTogc2VsZWN0aW9uX25vZGUsXG4gIHNpemU6IHNlbGVjdGlvbl9zaXplLFxuICBlbXB0eTogc2VsZWN0aW9uX2VtcHR5LFxuICBlYWNoOiBzZWxlY3Rpb25fZWFjaCxcbiAgYXR0cjogc2VsZWN0aW9uX2F0dHIsXG4gIHN0eWxlOiBzZWxlY3Rpb25fc3R5bGUsXG4gIHByb3BlcnR5OiBzZWxlY3Rpb25fcHJvcGVydHksXG4gIGNsYXNzZWQ6IHNlbGVjdGlvbl9jbGFzc2VkLFxuICB0ZXh0OiBzZWxlY3Rpb25fdGV4dCxcbiAgaHRtbDogc2VsZWN0aW9uX2h0bWwsXG4gIHJhaXNlOiBzZWxlY3Rpb25fcmFpc2UsXG4gIGxvd2VyOiBzZWxlY3Rpb25fbG93ZXIsXG4gIGFwcGVuZDogc2VsZWN0aW9uX2FwcGVuZCxcbiAgaW5zZXJ0OiBzZWxlY3Rpb25faW5zZXJ0LFxuICByZW1vdmU6IHNlbGVjdGlvbl9yZW1vdmUsXG4gIGNsb25lOiBzZWxlY3Rpb25fY2xvbmUsXG4gIGRhdHVtOiBzZWxlY3Rpb25fZGF0dW0sXG4gIG9uOiBzZWxlY3Rpb25fb24sXG4gIGRpc3BhdGNoOiBzZWxlY3Rpb25fZGlzcGF0Y2hcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHNlbGVjdGlvbjtcbiIsImltcG9ydCB7U2VsZWN0aW9uLCByb290fSBmcm9tIFwiLi9zZWxlY3Rpb24vaW5kZXhcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHR5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIlxuICAgICAgPyBuZXcgU2VsZWN0aW9uKFtbZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcildXSwgW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudF0pXG4gICAgICA6IG5ldyBTZWxlY3Rpb24oW1tzZWxlY3Rvcl1dLCByb290KTtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuZXhwb3J0IGZ1bmN0aW9uIGdldEd0ZXhVcmxzKCl7XG4gICAgY29uc3QgaG9zdCA9ICdodHRwczovL2d0ZXhwb3J0YWwub3JnL3Jlc3QvdjEvJzsgLy8gTk9URTogdG9wIGV4cHJlc3NlZCBnZW5lcyBhcmUgbm90IHlldCBpbiBwcm9kdWN0aW9uXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZHluZXF0bDogaG9zdCArICdhc3NvY2lhdGlvbi9keW5lcXRsJyxcblxuICAgICAgICBleG9uRXhwOiBob3N0ICsgJ2V4cHJlc3Npb24vbWVkaWFuRXhvbkV4cHJlc3Npb24/ZGF0YXNldElkPWd0ZXhfdjcmaGNsdXN0ZXI9dHJ1ZSZnZW5jb2RlSWQ9JyxcblxuICAgICAgICBnZW5lSWQ6IGhvc3QgKyAncmVmZXJlbmNlL2dlbmVJZD9mb3JtYXQ9anNvbiZyZWxlYXNlPXY3JmdlbmVJZD0nLFxuICAgICAgICBnZW5lRXhwOiBob3N0ICsgJ2V4cHJlc3Npb24vZ2VuZUV4cHJlc3Npb24/ZGF0YXNldElkPWd0ZXhfdjcmZ2VuY29kZUlkPScsXG4gICAgICAgIGdlbmVNb2RlbDogaG9zdCArICdyZWZlcmVuY2UvY29sbGFwc2VkR2VuZU1vZGVsP3VuZmlsdGVyZWQ9ZmFsc2UmcmVsZWFzZT12NyZnZW5lSWQ9JyxcbiAgICAgICAgZ2VuZU1vZGVsVW5maWx0ZXJlZDogaG9zdCArICdyZWZlcmVuY2UvY29sbGFwc2VkR2VuZU1vZGVsP3VuZmlsdGVyZWQ9dHJ1ZSZyZWxlYXNlPXY3JmdlbmVJZD0nLFxuXG4gICAgICAgIGlzb2Zvcm06IGhvc3QgKyAncmVmZXJlbmNlL3RyYW5zY3JpcHQ/cmVsZWFzZT12NyZnZW5jb2RlX2lkPScsXG4gICAgICAgIGlzb2Zvcm1FeHA6IGhvc3QgKyAnZXhwcmVzc2lvbi9pc29mb3JtRXhwcmVzc2lvbj9kYXRhc2V0SWQ9Z3RleF92NyZib3hwbG90RGV0YWlsPW1lZGlhbiZnZW5jb2RlSWQ9JyxcblxuICAgICAgICBqdW5jdGlvbkV4cDogaG9zdCArICdleHByZXNzaW9uL21lZGlhbkp1bmN0aW9uRXhwcmVzc2lvbj9kYXRhc2V0SWQ9Z3RleF92NyZoY2x1c3Rlcj10cnVlJmdlbmNvZGVJZD0nLFxuXG4gICAgICAgIG1lZEdlbmVFeHA6IGhvc3QgKyAnZXhwcmVzc2lvbi9tZWRpYW5HZW5lRXhwcmVzc2lvbj9kYXRhc2V0SWQ9Z3RleF92NyZoY2x1c3Rlcj10cnVlJnBhZ2Vfc2l6ZT0xMDAwMCcsXG5cbiAgICAgICAgLy8gc2FtcGxlOiAnZGF0YS9ndGV4LlNhbXBsZS5jc3YnLFxuICAgICAgICBzYW1wbGU6ICd0bXBTdW1tYXJ5RGF0YS9ndGV4LlNhbXBsZS5jc3YnLFxuICAgICAgICBzbnA6IGhvc3QgKyAncmVmZXJlbmNlL3NucD9yZWZlcmVuY2U9Y3VycmVudCZmb3JtYXQ9anNvbiZzbnBJZD0nLFxuXG4gICAgICAgIHRpc3N1ZTogIGhvc3QgKyAnZGF0YXNldC90aXNzdWVJbmZvJyxcbiAgICAgICAgdGlzc3VlU2l0ZXM6IGhvc3QgKyAnZGF0YXNldC90aXNzdWVTaXRlRGV0YWlsP2Zvcm1hdD1qc29uJyxcblxuICAgICAgICB0b3BJblRpc3N1ZUZpbHRlcmVkOiBob3N0ICsgJ2V4cHJlc3Npb24vdG9wRXhwcmVzc2VkR2VuZT9kYXRhc2V0SWQ9Z3RleF92NyZmaWx0ZXJNdEdlbmU9dHJ1ZSZzb3J0X2J5PW1lZGlhbiZzb3J0RGlyZWN0aW9uPWRlc2MmcGFnZV9zaXplPTUwJnRpc3N1ZUlkPScsXG4gICAgICAgIHRvcEluVGlzc3VlOiBob3N0ICsgJ2V4cHJlc3Npb24vdG9wRXhwcmVzc2VkR2VuZT9kYXRhc2V0SWQ9Z3RleF92NyZzb3J0X2J5PW1lZGlhbiZzb3J0RGlyZWN0aW9uPWRlc2MmcGFnZV9zaXplPTUwJnRpc3N1ZUlkPScsXG5cbiAgICAgICAgdmFyaWFudElkOiBob3N0ICsgJ3JlZmVyZW5jZS9zbnA/Zm9ybWF0PWpzb24mcmVmZXJlbmNlPWN1cnJlbnQmcmVsZWFzZT12NyZ2YXJpYW50SWQ9JyxcblxuICAgICAgICAvLyBsb2NhbCBzdGF0aWMgZmlsZXNcbiAgICAgICAgcm5hc2VxQ3JhbTogJ3RtcFN1bW1hcnlEYXRhL3JuYXNlcV9jcmFtX2ZpbGVzX3Y3X2RiR2FQXzAxMTUxNi50eHQnLFxuICAgICAgICB3Z3NDcmFtOiAndG1wU3VtbWFyeURhdGEvd2dzX2NyYW1fZmlsZXNfdjdfaGczOF9kYkdhUF8wMTE1MTYudHh0JyxcblxuICAgICAgICAvLyBmaXJlQ2xvdWRcbiAgICAgICAgZmNCaWxsaW5nOiAnaHR0cHM6Ly9hcGkuZmlyZWNsb3VkLm9yZy9hcGkvcHJvZmlsZS9iaWxsaW5nJyxcbiAgICAgICAgZmNXb3JrU3BhY2U6ICdodHRwczovL2FwaS5maXJlY2xvdWQub3JnL2FwaS93b3Jrc3BhY2VzJyxcbiAgICAgICAgZmNQb3J0YWxXb3JrU3BhY2U6ICdodHRwczovL3BvcnRhbC5maXJlY2xvdWQub3JnLyN3b3Jrc3BhY2VzJ1xuICAgIH1cbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2VuZXMgZnJvbSBHVEV4IHdlYiBzZXJ2aWNlXG4gKiBAcGFyYW0gZGF0YSB7SnNvbn1cbiAqIEByZXR1cm5zIHtMaXN0fSBvZiBnZW5lc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VHZW5lcyhkYXRhKXtcbiAgICBjb25zdCBhdHRyID0gJ2dlbmVJZCc7XG4gICAgaWYoIWRhdGEuaGFzT3duUHJvcGVydHkoYXR0cikpIHRocm93ICdHZW5lIHdlYiBzZXJ2aWNlIHBhcnNpbmcgZXJyb3InO1xuICAgIHJldHVybiBkYXRhW2F0dHJdO1xufVxuXG4vKipcbiAqIFBhcnNlIHRoZSB0aXNzdWVzXG4gKiBAcGFyYW0gZGF0YSB7SnNvbn1cbiAqIEByZXR1cm5zIHtMaXN0fSBvZiB0aXNzdWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRpc3N1ZXMoZGF0YSl7XG4gICAgY29uc3QgYXR0ciA9ICd0aXNzdWVJbmZvJztcbiAgICBpZighZGF0YS5oYXNPd25Qcm9wZXJ0eShhdHRyKSkgdGhyb3cgJ0ZhdGFsIEVycm9yOiBwYXJzZVRpc3N1ZXMgaW5wdXQgZXJyb3IuJztcbiAgICBjb25zdCB0aXNzdWVzID0gZGF0YVthdHRyXTtcblxuICAgIC8vIHNhbml0eSBjaGVja1xuICAgIFsndGlzc3VlSWQnLCAndGlzc3VlTmFtZScsICdjb2xvckhleCddLmZvckVhY2goKGQpPT57XG4gICAgICAgIGlmICghdGlzc3Vlc1swXS5oYXNPd25Qcm9wZXJ0eShkKSkgdGhyb3cgJ0ZhdGFsIEVycm9yOiBwYXJzZVRpc3N1ZSBhdHRyIG5vdCBmb3VuZDogJyArIGQ7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGlzc3Vlcztcbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgdGlzc3VlIGdyb3Vwc1xuICogQHBhcmFtIGRhdGEge0pzb259XG4gKiBAcGFyYW0gZm9yRXF0bCB7Qm9vbGVhbn1cbiAqIEByZXR1cm5zIHtEaWN0aW9uYXJ5fSBvZiBsaXN0cyBvZiB0aXNzdWVzIGluZGV4ZWQgYnkgdGhlIHRpc3N1ZSBncm91cCBuYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRpc3N1ZVNpdGVzKGRhdGEsIGZvckVxdGw9ZmFsc2Upe1xuICAgIC8vIHRoZSBsaXN0IG9mIGludmFsaWRlIGVxdGwgdGlzc3VlcyBkdWUgdG8gc2FtcGxlIHNpemUgPCA3MFxuICAgIC8vIGEgaGFyZC1jb2RlZCBsaXN0IGJlY2F1c2UgdGhlIHNhbXBsZSBzaXplIGlzIG5vdCBlYXN5IHRvIHJldHJpZXZlXG4gICAgY29uc3QgaW52YWxpZFRpc3N1ZXMgPSBbJ0JsYWRkZXInLCAnQ2Vydml4X0VjdG9jZXJ2aXgnLCAnQ2Vydml4X0VuZG9jZXJ2aXgnLCAnRmFsbG9waWFuX1R1YmUnLCAnS2lkbmV5X0NvcnRleCddO1xuXG4gICAgY29uc3QgYXR0ciA9ICd0aXNzdWVTaXRlRGV0YWlsJztcbiAgICBpZighZGF0YS5oYXNPd25Qcm9wZXJ0eShhdHRyKSkgdGhyb3cgJ0ZhdGFsIEVycm9yOiBwYXJzZVRpc3N1ZVNpdGVzIGlucHV0IGVycm9yLic7XG4gICAgY29uc3QgdGlzc3VlcyA9IGZvckVxdGw9PWZhbHNlP2RhdGFbYXR0cl06ZGF0YVthdHRyXS5maWx0ZXIoKGQpPT57cmV0dXJuICFpbnZhbGlkVGlzc3Vlcy5pbmNsdWRlcyhkLnRpc3N1ZV9zaXRlX2RldGFpbF9pZCl9KTsgLy8gYW4gYXJyYXkgb2YgdGlzc3VlX3NpdGVfZGV0YWlsIG9iamVjdHNcblxuICAgIC8vIGJ1aWxkIHRoZSB0aXNzdWVHcm91cHMgbG9va3VwIGRpY3Rpb25hcnkgaW5kZXhlZCBieSB0aGUgdGlzc3VlIGdyb3VwIG5hbWUgKGkuZS4gdGhlIHRpc3N1ZSBtYWluIHNpdGUgbmFtZSlcbiAgICBbJ3Rpc3N1ZV9zaXRlJywgJ3Rpc3N1ZV9zaXRlX2RldGFpbF9pZCcsICd0aXNzdWVfc2l0ZV9kZXRhaWwnXS5mb3JFYWNoKChkKT0+e1xuICAgICAgICBpZiAoIXRpc3N1ZXNbMF0uaGFzT3duUHJvcGVydHkoZCkpIHRocm93IGBwYXJzZVRpc3N1ZVNpdGVzIGF0dHIgZXJyb3IuICR7ZH0gaXMgbm90IGZvdW5kYDtcbiAgICB9KTtcbiAgICBsZXQgdGlzc3VlR3JvdXBzID0gdGlzc3Vlcy5yZWR1Y2UoKGFyciwgZCk9PntcbiAgICAgICAgbGV0IGdyb3VwTmFtZSA9IGQudGlzc3VlX3NpdGU7XG4gICAgICAgIGxldCBzaXRlID0ge1xuICAgICAgICAgICAgaWQ6IGQudGlzc3VlX3NpdGVfZGV0YWlsX2lkLFxuICAgICAgICAgICAgbmFtZTogZC50aXNzdWVfc2l0ZV9kZXRhaWxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFhcnIuaGFzT3duUHJvcGVydHkoZ3JvdXBOYW1lKSkgYXJyW2dyb3VwTmFtZV0gPSBbXTsgLy8gaW5pdGlhdGUgYW4gYXJyYXlcbiAgICAgICAgYXJyW2dyb3VwTmFtZV0ucHVzaChzaXRlKTtcbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9LCB7fSk7XG5cbiAgICAvLyBtb2RpZnkgdGhlIHRpc3N1ZSBncm91cHMgdGhhdCBoYXZlIG9ubHkgYSBzaW5nbGUgc2l0ZVxuICAgIC8vIGJ5IHJlcGxhY2luZyB0aGUgZ3JvdXAncyBuYW1lIHdpdGggdGhlIHNpbmdsZSBzaXRlJ3MgbmFtZSAtLSBmb3IgYSBiZXR0ZXIgQWxwaGFiZXRpY2FsIG9yZGVyIG9mIHRoZSB0aXNzdWUgZ3JvdXBzXG5cbiAgICBPYmplY3Qua2V5cyh0aXNzdWVHcm91cHMpLmZvckVhY2goKGQpPT57XG4gICAgICAgIGlmICh0aXNzdWVHcm91cHNbZF0ubGVuZ3RoID09IDEpeyAvLyBhIHNpbmdsZS1zaXRlIGdyb3VwXG4gICAgICAgICAgICBsZXQgc2l0ZSA9IHRpc3N1ZUdyb3Vwc1tkXVswXTsgLy8gdGhlIHNpbmdsZSBzaXRlXG4gICAgICAgICAgICBkZWxldGUgdGlzc3VlR3JvdXBzW2RdOyAvLyByZW1vdmUgdGhlIG9sZCBncm91cCBpbiB0aGUgZGljdGlvbmFyeVxuICAgICAgICAgICAgdGlzc3VlR3JvdXBzW3NpdGUubmFtZV0gPSBbc2l0ZV07IC8vIGNyZWF0ZSBhIG5ldyBncm91cCB3aXRoIHRoZSBzaXRlJ3MgbmFtZVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGlzc3VlR3JvdXBzO1xuXG59XG5cbi8qKlxuICogcGFyc2UgdGhlIGV4b25zXG4gKiBAcGFyYW0gZGF0YSB7SnNvbn1cbiAqIEByZXR1cm5zIHtMaXN0fSBvZiBleG9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFeG9ucyhkYXRhKXtcbiAgICBjb25zdCBhdHRyID0gJ2NvbGxhcHNlZEdlbmVNb2RlbCc7XG4gICAgaWYoIWRhdGEuaGFzT3duUHJvcGVydHkoYXR0cikpIHRocm93ICdGYXRhbCBFcnJvcjogcGFyc2VFeG9ucyBpbnB1dCBlcnJvci4nICsgZGF0YTtcbiAgICAvLyBzYW5pdHkgY2hlY2tcbiAgICBbJ2ZlYXR1cmVUeXBlJywgJ3N0YXJ0JywgJ2VuZCddLmZvckVhY2goKGQpPT57XG4gICAgICAgIGlmICghZGF0YVthdHRyXVswXS5oYXNPd25Qcm9wZXJ0eShkKSkgdGhyb3cgJ0ZhdGFsIEVycm9yOiBwYXJzZUV4b25zIGF0dHIgbm90IGZvdW5kOiAnICsgZDtcbiAgICB9KTtcbiAgICByZXR1cm4gZGF0YVthdHRyXS5maWx0ZXIoKGQpPT5kLmZlYXR1cmVUeXBlID09ICdleG9uJykubWFwKChkKT0+e1xuICAgICAgICBkLmNocm9tU3RhcnQgPSBkLnN0YXJ0O1xuICAgICAgICBkLmNocm9tRW5kID0gZC5lbmQ7XG4gICAgICAgIHJldHVybiBkO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIHBhcnNlIHRoZSBqdW5jdGlvbnNcbiAqIEBwYXJhbSBkYXRhXG4gKiBAcmV0dXJucyB7TGlzdH0gb2YganVuY3Rpb25zXG4gKiAvLyB3ZSBkbyBub3Qgc3RvcmUganVuY3Rpb24gc3RydWN0dXJlIGFubm90YXRpb25zIGluIE1vbmdvXG4gICAgLy8gc28gaGVyZSB3ZSB1c2UgdGhlIGp1bmN0aW9uIGV4cHJlc3Npb24gd2ViIHNlcnZpY2UgdG8gcmV0cmlldmUgdGhlIGp1bmN0aW9uIGdlbm9taWMgbG9jYXRpb25zXG4gICAgLy8gYXNzdW1pbmcgdGhhdCBlYWNoIHRpc3N1ZSBoYXMgdGhlIHNhbWUganVuY3Rpb25zLFxuICAgIC8vIHRvIGdyYWIgYWxsIHRoZSBrbm93biBqdW5jdGlvbnMgb2YgYSBnZW5lLCB3ZSBvbmx5IG5lZWQgdG8gbG9vayBhdCBvbmUgdGlzc3VlXG4gICAgLy8gaGVyZSB3ZSBhcmJpdHJhcmlseSBwaWNrIExpdmVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VKdW5jdGlvbnMoZGF0YSl7XG5cbiAgICBjb25zdCBhdHRyID0gJ21lZGlhbkp1bmN0aW9uRXhwcmVzc2lvbic7XG4gICAgaWYoIWRhdGEuaGFzT3duUHJvcGVydHkoYXR0cikpIHRocm93ICdGYXRhbCBFcnJvcjogcGFyc2VKdW5jdGlvbnMgaW5wdXQgZXJyb3IuICcgKyBkYXRhO1xuICAgIHJldHVybiBkYXRhW2F0dHJdLmZpbHRlcigoZCk9PmQudGlzc3VlSWQ9PSdMaXZlcicpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwb3MgPSBkLmp1bmN0aW9uSWQuc3BsaXQoJ18nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hyb206IHBvc1swXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHJvbVN0YXJ0OiBwb3NbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21FbmQ6IHBvc1syXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqdW5jdGlvbklkOiBkLmp1bmN0aW9uSWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG59XG5cbi8qKlxuICogcGFyc2UgdHJhbnNjcmlwdCBpc29mb3JtcyBmcm9tIHRoZSBHVEV4IHdlYiBzZXJ2aWNlOiAncmVmZXJlbmNlL3RyYW5zY3JpcHQ/cmVsZWFzZT12NyZnZW5jb2RlX2lkPSdcbiAqIEBwYXJhbSBkYXRhIHtKc29ufVxuICogcmV0dXJucyBhIGRpY3Rpb25hcnkgb2YgdHJhbnNjcmlwdCBleG9uIG9iamVjdCBsaXN0cyBpbmRleGVkIGJ5IEVOU1QgSURzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUlzb2Zvcm1FeG9ucyhkYXRhKXtcbiAgICBjb25zdCBhdHRyID0gJ3RyYW5zY3JpcHQnO1xuICAgIGlmKCFkYXRhLmhhc093blByb3BlcnR5KGF0dHIpKSB0aHJvdyAncGFyc2VJc29mb3JtcyBpbnB1dCBlcnJvciAnICsgZGF0YTtcbiAgICByZXR1cm4gZGF0YVthdHRyXS5maWx0ZXIoKGQpPT57cmV0dXJuICdleG9uJyA9PSBkLmZlYXR1cmVUeXBlfSlcbiAgICAgICAgLnJlZHVjZSgoYSwgZCk9PntcbiAgICAgICAgaWYgKGFbZC50cmFuc2NyaXB0SWRdID09PSB1bmRlZmluZWQpIGFbZC50cmFuc2NyaXB0SWRdID0gW107XG4gICAgICAgIGFbZC50cmFuc2NyaXB0SWRdLnB1c2goZCk7XG4gICAgICAgIHJldHVybiBhO1xuICAgIH0sIHt9KTtcbn1cblxuLyoqXG4gKiBwYXJzZSB0cmFuc2NyaXB0IGlzb2Zvcm1zXG4gKiBAcGFyYW0gZGF0YSB7SnNvbn0gZnJvbSBHVEV4IHdlYiBzZXJ2aWNlICdyZWZlcmVuY2UvdHJhbnNjcmlwdD9yZWxlYXNlPXY3JmdlbmNvZGVfaWQ9J1xuICogcmV0dXJucyBhIGxpc3Qgb2YgaXNvZm9ybSBvYmplY3RzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUlzb2Zvcm1zKGRhdGEpe1xuICAgIGNvbnN0IGF0dHIgPSAndHJhbnNjcmlwdCc7XG4gICAgaWYoIWRhdGEuaGFzT3duUHJvcGVydHkoYXR0cikpIHRocm93KCdwYXJzZUlzb2Zvcm1zIGlucHV0IGVycm9yJyk7XG4gICAgcmV0dXJuIGRhdGFbYXR0cl0uZmlsdGVyKChkKT0+e3JldHVybiAndHJhbnNjcmlwdCcgPT0gZC5mZWF0dXJlVHlwZX0pLnNvcnQoKGEsIGIpPT57XG4gICAgICAgIGNvbnN0IGwxID0gTWF0aC5hYnMoYS5jaHJvbUVuZCAtIGEuY2hyb21TdGFydCkgKyAxO1xuICAgICAgICBjb25zdCBsMiA9IE1hdGguYWJzKGIuY2hyb21FbmQgLSBiLmNocm9tU3RhcnQpICsgMTtcbiAgICAgICAgcmV0dXJuIC0obDEtbDIpOyAvLyBzb3J0IGJ5IGlzb2Zvcm0gbGVuZ3RoIGluIGRlc2NlbmRpbmcgb3JkZXJcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBwYXJzZSBmaW5hbCAobWFza2VkKSBnZW5lIG1vZGVsIGV4b24gZXhwcmVzc2lvblxuICogZXhwcmVzc2lvbiBpcyBub3JtYWxpemVkIHRvIHJlYWRzIHBlciBrYlxuICogQHBhcmFtIGRhdGEge0pTT059IG9mIGV4b24gZXhwcmVzc2lvbiB3ZWIgc2VydmljZVxuICogQHBhcmFtIGV4b25zIHtMaXN0fSBvZiBleG9ucyB3aXRoIHBvc2l0aW9uc1xuICogQHBhcmFtIHVzZUxvZyB7Ym9vbGVhbn0gdXNlIGxvZzIgdHJhbnNmb3JtYXRpb25cbiAqIEBwYXJhbSBhZGp1c3Qge051bWJlcn0gZGVmYXVsdCAwLjAxXG4gKiBAcmV0dXJucyB7TGlzdH0gb2YgZXhvbiBvYmplY3RzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV4b25FeHByZXNzaW9uKGRhdGEsIGV4b25zLCB1c2VMb2c9dHJ1ZSwgYWRqdXN0PTEpe1xuICAgIGNvbnN0IGV4b25EaWN0ID0gZXhvbnMucmVkdWNlKChhLCBkKT0+e2FbZC5leG9uSWRdID0gZDsgcmV0dXJuIGE7fSwge30pO1xuICAgIGNvbnN0IGF0dHIgPSAnbWVkaWFuRXhvbkV4cHJlc3Npb24nO1xuICAgIGlmKCFkYXRhLmhhc093blByb3BlcnR5KGF0dHIpKSB0aHJvdygncGFyc2VFeG9uRXhwcmVzc2lvbiBpbnB1dCBlcnJvcicpO1xuXG4gICAgY29uc3QgZXhvbk9iamVjdHMgPSBkYXRhW2F0dHJdO1xuICAgIC8vIGVycm9yLWNoZWNraW5nXG4gICAgWydkYXRhJywgJ2V4b25JZCcsICd0aXNzdWVJZCddLmZvckVhY2goKGQpPT57XG4gICAgICAgIGlmICghZXhvbk9iamVjdHNbMF0uaGFzT3duUHJvcGVydHkoZCkpIHRocm93ICdGYXRhbCBFcnJvcjogcGFyc2VFeG9uRXhwcmVzc2lvbiBhdHRyIG5vdCBmb3VuZDogJyArIGQ7XG4gICAgfSk7XG4gICAgLy8gcGFyc2UgR1RFeCBtZWRpYW4gZXhvbiBjb3VudHNcbiAgICBleG9uT2JqZWN0cy5mb3JFYWNoKChkKSA9PiB7XG4gICAgICAgIGNvbnN0IGV4b24gPSBleG9uRGljdFtkLmV4b25JZF07IC8vIGZvciByZXRyaWV2aW5nIGV4b24gcG9zaXRpb25zXG4gICAgICAgIC8vIGVycm9yLWNoZWNraW5nXG4gICAgICAgIFsnZW5kJywgJ3N0YXJ0J10uZm9yRWFjaCgocCk9PntcbiAgICAgICAgICAgIGlmICghZXhvbi5oYXNPd25Qcm9wZXJ0eShwKSkgdGhyb3cgJ0ZhdGFsIEVycm9yOiBwYXJzZUV4b25FeHByZXNzaW9uIGF0dHIgbm90IGZvdW5kOiAnICsgcDtcbiAgICAgICAgfSk7XG4gICAgICAgIGQubCA9IGV4b24uZW5kIC0gZXhvbi5zdGFydCArIDE7XG4gICAgICAgIGQudmFsdWUgPSBOdW1iZXIoZC5kYXRhKS9kLmw7XG4gICAgICAgIGQub3JpZ2luYWxWYWx1ZSA9IE51bWJlcihkLmRhdGEpL2QubDtcbiAgICAgICAgaWYgKHVzZUxvZykgZC52YWx1ZSA9IE1hdGgubG9nMihkLnZhbHVlICsgMSk7XG4gICAgICAgIGQueCA9IGQuZXhvbklkO1xuICAgICAgICBkLnkgPSBkLnRpc3N1ZUlkO1xuICAgICAgICBkLmlkID0gZC5nZW5jb2RlSWQ7XG4gICAgICAgIGQuY2hyb21TdGFydCA9IGV4b24uc3RhcnQ7XG4gICAgICAgIGQuY2hyb21FbmQgPSBleG9uLmVuZDtcbiAgICAgICAgZC51bml0ID0gZC51bml0ICsgJyBwZXIgYmFzZSc7XG4gICAgfSk7XG4gICAgcmV0dXJuIGV4b25PYmplY3RzLnNvcnQoKGEsYik9PntcbiAgICAgICAgaWYgKGEuY2hyb21TdGFydDxiLmNocm9tU3RhcnQpIHJldHVybiAtMTtcbiAgICAgICAgaWYgKGEuY2hyb21TdGFydD5iLmNocm9tU3RhcnQpIHJldHVybiAxO1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9KTsgLy8gc29ydCBieSBnZW5vbWljIGxvY2F0aW9uIGluIGFzY2VuZGluZyBvcmRlclxufVxuXG4vKipcbiAqIFBhcnNlIGp1bmN0aW9uIG1lZGlhbiByZWFkIGNvdW50IGRhdGFcbiAqIEBwYXJhbSBkYXRhIHtKU09OfSBvZiB0aGUganVuY3Rpb24gZXhwcmVzc2lvbiB3ZWIgc2VydmljZVxuICogQHBhcmFtIHVzZUxvZyB7Qm9vbGVhbn0gcGVyZm9ybSBsb2cgdHJhbnNmb3JtYXRpb25cbiAqIEBwYXJhbSBhZGp1c3Qge051bWJlcn0gZm9yIGhhbmRsaW5nIDAncyB3aGVuIHVzZUxvZyBpcyB0cnVlXG4gKiBAcmV0dXJucyB7TGlzdH0gb2YganVuY3Rpb24gb2JqZWN0c1xuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VKdW5jdGlvbkV4cHJlc3Npb24oZGF0YSwgdXNlTG9nPXRydWUsIGFkanVzdD0xKXtcbiAgICBjb25zdCBhdHRyID0gJ21lZGlhbkp1bmN0aW9uRXhwcmVzc2lvbic7XG4gICAgaWYoIWRhdGEuaGFzT3duUHJvcGVydHkoYXR0cikpIHRocm93KCdwYXJzZUp1bmN0aW9uRXhwcmVzc2lvbiBpbnB1dCBlcnJvcicpO1xuXG4gICAgY29uc3QganVuY3Rpb25zID0gZGF0YVthdHRyXTtcblxuICAgIC8vIGVycm9yLWNoZWNraW5nXG4gICAgaWYgKGp1bmN0aW9ucyA9PT0gdW5kZWZpbmVkIHx8IGp1bmN0aW9ucy5sZW5ndGggPT0gMCkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ05vIGp1bmN0aW9uIGRhdGEgZm91bmQnKTtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgWyd0aXNzdWVJZCcsICdqdW5jdGlvbklkJywgJ2RhdGEnLCAnZ2VuY29kZUlkJ10uZm9yRWFjaCgoZCk9PntcbiAgICAgICAgaWYgKCFqdW5jdGlvbnNbMF0uaGFzT3duUHJvcGVydHkoZCkpIHRocm93ICdGYXRhbCBFcnJvcjogcGFyc2VKdW5jdGlvbkV4cHJlc3Npb24gYXR0ciBub3QgZm91bmQ6ICcgKyBkO1xuICAgIH0pO1xuXG4gICAgLy8gcGFyc2UgR1RFeCBtZWRpYW4ganVuY3Rpb24gcmVhZCBjb3VudHNcbiAgICBqdW5jdGlvbnMuZm9yRWFjaCgoZCkgPT4ge1xuICAgICAgICBkLnZhbHVlID0gdXNlTG9nP01hdGgubG9nMTAoTnVtYmVyKGQuZGF0YSArIGFkanVzdCkpOk51bWJlcihkLmRhdGEpO1xuICAgICAgICBkLnggPSBkLmp1bmN0aW9uSWQ7XG4gICAgICAgIGQueSA9IGQudGlzc3VlSWQ7XG4gICAgICAgIGQub3JpZ2luYWxWYWx1ZSA9IE51bWJlcihkLmRhdGEpO1xuICAgICAgICBkLmlkID0gZC5nZW5jb2RlSWRcbiAgICB9KTtcblxuICAgIC8vIHNvcnQgYnkgZ2Vub21pYyBsb2NhdGlvbiBpbiBhc2NlbmRpbmcgb3JkZXJcbiAgICByZXR1cm4ganVuY3Rpb25zLnNvcnQoKGEsYik9PntcbiAgICAgICAgaWYgKGEuanVuY3Rpb25JZD5iLmp1bmN0aW9uSWQpIHJldHVybiAxO1xuICAgICAgICBlbHNlIGlmIChhLmp1bmN0aW9uSWQ8Yi5qdW5jdGlvbklkKSByZXR1cm4gLTE7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIHBhcnNlIGlzb2Zvcm0gZXhwcmVzc2lvblxuICogQHBhcmFtIGRhdGFcbiAqIEBwYXJhbSB1c2VMb2dcbiAqIEBwYXJhbSBhZGp1c3RcbiAqIEByZXR1cm5zIHsqfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VJc29mb3JtRXhwcmVzc2lvbihkYXRhLCB1c2VMb2c9dHJ1ZSwgYWRqdXN0PTEpe1xuICAgIGNvbnN0IGF0dHIgPSAnaXNvZm9ybUV4cHJlc3Npb24nO1xuICAgIGlmKCFkYXRhLmhhc093blByb3BlcnR5KGF0dHIpKSB0aHJvdygncGFyc2VJc29mb3JtRXhwcmVzc2lvbiBpbnB1dCBlcnJvcicpO1xuICAgIC8vIHBhcnNlIEdURXggaXNvZm9ybSBtZWRpYW4gVFBNXG4gICAgZGF0YVthdHRyXS5mb3JFYWNoKChkKSA9PiB7XG4gICAgICAgIGQudmFsdWUgPSB1c2VMb2c/TWF0aC5sb2cxMChOdW1iZXIoZC5kYXRhICsgYWRqdXN0KSk6TnVtYmVyKGQuZGF0YSk7XG4gICAgICAgIGQub3JpZ2luYWxWYWx1ZSA9IE51bWJlcihkLmRhdGEpO1xuICAgICAgICBkLnggPSBkLnRyYW5zY3JpcHRJZDtcbiAgICAgICAgZC55ID0gZC50aXNzdWVJZDtcbiAgICAgICAgZC5pZCA9IGQuZ2VuY29kZUlkO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRhdGFbYXR0cl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUlzb2Zvcm1FeHByZXNzaW9uVHJhbnNwb3NlKGRhdGEsIHVzZUxvZz10cnVlLCBhZGp1c3Q9MSl7XG4gICAgY29uc3QgYXR0ciA9ICdpc29mb3JtRXhwcmVzc2lvbic7XG4gICAgaWYoIWRhdGEuaGFzT3duUHJvcGVydHkoYXR0cikpIHRocm93KCdwYXJzZUlzb2Zvcm1FeHByZXNzaW9uIGlucHV0IGVycm9yJyk7XG4gICAgLy8gcGFyc2UgR1RFeCBpc29mb3JtIG1lZGlhbiBUUE1cbiAgICBkYXRhW2F0dHJdLmZvckVhY2goKGQpID0+IHtcbiAgICAgICAgZC52YWx1ZSA9IHVzZUxvZz9NYXRoLmxvZzEwKE51bWJlcihkLmRhdGEgKyBhZGp1c3QpKTpOdW1iZXIoZC5kYXRhKTtcbiAgICAgICAgZC5vcmlnaW5hbFZhbHVlID0gTnVtYmVyKGQuZGF0YSk7XG4gICAgICAgIGQueSA9IGQudHJhbnNjcmlwdElkO1xuICAgICAgICBkLnggPSBkLnRpc3N1ZUlkO1xuICAgICAgICBkLmlkID0gZC5nZW5jb2RlSWQ7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZGF0YVthdHRyXTtcbn1cblxuLyoqXG4gKiBwYXJzZSBtZWRpYW4gZ2VuZSBleHByZXNzaW9uXG4gKiBAcGFyYW0gZGF0YSB7SnNvbn0gd2l0aCBhdHRyIG1lZGlhbkdlbmVFeHByZXNzaW9uXG4gKiBAcGFyYW0gdXNlTG9nIHtCb29sZWFufSBwZXJmb3JtcyBsb2cxMCB0cmFuc2Zvcm1hdGlvblxuICogQHJldHVybnMgeyp9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1lZGlhbkV4cHJlc3Npb24oZGF0YSwgdXNlTG9nPXRydWUpe1xuICAgIGNvbnN0IGF0dHIgPSAnbWVkaWFuR2VuZUV4cHJlc3Npb24nO1xuICAgIGlmKCFkYXRhLmhhc093blByb3BlcnR5KGF0dHIpKSB0aHJvdyAncGFyc2VNZWRpYW5FeHByZXNzaW9uIGlucHV0IGVycm9yLic7XG4gICAgY29uc3QgYWRqdXN0ID0gMTtcbiAgICAvLyBwYXJzZSBHVEV4IG1lZGlhbiBnZW5lIGV4cHJlc3Npb25cbiAgICAvLyBlcnJvci1jaGVja2luZyB0aGUgcmVxdWlyZWQgYXR0cmlidXRlczpcbiAgICBpZiAoZGF0YVthdHRyXS5sZW5ndGggPT0gMCkgdGhyb3cgJ3BhcnNlTWVkaWFuRXhwcmVzc2lvbiBmaW5kcyBubyBkYXRhLic7XG4gICAgWydtZWRpYW4nLCAndGlzc3VlSWQnLCAnZ2VuY29kZUlkJ10uZm9yRWFjaCgoZCk9PntcbiAgICAgICAgaWYgKCFkYXRhW2F0dHJdWzBdLmhhc093blByb3BlcnR5KGQpKSB0aHJvdyBgcGFyc2VNZWRpYW5FeHByZXNzaW9uIGF0dHIgZXJyb3IuICR7ZH0gaXMgbm90IGZvdW5kYDtcbiAgICB9KTtcbiAgICBsZXQgcmVzdWx0cyA9IGRhdGFbYXR0cl07XG4gICAgcmVzdWx0cy5mb3JFYWNoKGZ1bmN0aW9uKGQpe1xuICAgICAgICBkLnZhbHVlID0gdXNlTG9nP01hdGgubG9nMTAoTnVtYmVyKGQubWVkaWFuKSArIGFkanVzdCk6TnVtYmVyKGQubWVkaWFuKTtcbiAgICAgICAgZC54ID0gZC50aXNzdWVJZDtcbiAgICAgICAgZC55ID0gZC5nZW5jb2RlSWQ7XG4gICAgICAgIGQub3JpZ2luYWxWYWx1ZSA9IE51bWJlcihkLm1lZGlhbik7XG4gICAgICAgIGQuaWQgPSBkLmdlbmNvZGVJZDtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHRzO1xufVxuXG4vKipcbiAqIHBhcnNlIHRoZSBnZW5lIGV4cHJlc3Npb25cbiAqIEBwYXJhbSBnZW5jb2RlSWQge1N0cmluZ31cbiAqIEBwYXJhbSBkYXRhIHtKc29ufSB3aXRoIGF0dHI6IHRpc3N1ZUlkLCBnZW5lU3ltYm9sXG4gKiBAcmV0dXJucyB7e2V4cDoge30sIGdlbmVTeW1ib2w6IHN0cmluZ319XG4gKi9cbi8vIGZ1bmN0aW9uIHBhcnNlR2VuZUV4cHJlc3Npb24oZ2VuY29kZUlkLCBkYXRhKXtcbi8vICAgICBsZXQgbG9va3VwVGFibGUgPSB7XG4vLyAgICAgICAgIGV4cDoge30sIC8vIGluZGV4ZWQgYnkgdGlzc3VlSWRcbi8vICAgICAgICAgZ2VuZVN5bWJvbDogJydcbi8vICAgICB9O1xuLy8gICAgIGlmKCFkYXRhLmhhc093blByb3BlcnR5KGF0dHIpKSB0aHJvdyAoJ3BhcnNlR2VuZUV4cHJlc3Npb24gaW5wdXQgZXJyb3IuJyk7XG4vLyAgICAgZGF0YVthdHRyXS5mb3JFYWNoKChkKT0+e1xuLy8gICAgICAgICBpZiAoZC5nZW5jb2RlSWQgPT0gZ2VuY29kZUlkKSB7XG4vLyAgICAgICAgICAgICAvLyBpZiB0aGUgZ2VuY29kZSBJRCBtYXRjaGVzIHRoZSBxdWVyeSBnZW5jb2RlSWQsXG4vLyAgICAgICAgICAgICAvLyBhZGQgdGhlIGV4cHJlc3Npb24gZGF0YSB0byB0aGUgbG9va3VwIHRhYmxlXG4vLyAgICAgICAgICAgICBsb29rdXBUYWJsZS5leHBbZC50aXNzdWVJZF0gPSBkLmRhdGE7XG4vLyAgICAgICAgICAgICBpZiAoJycgPT0gbG9va3VwVGFibGUuZ2VuZVN5bWJvbCkgbG9va3VwVGFibGUuZ2VuZVN5bWJvbCA9IGQuZ2VuZVN5bWJvbFxuLy8gICAgICAgICB9XG4vLyAgICAgfSk7XG4vLyAgICAgcmV0dXJuIGxvb2t1cFRhYmxlXG4vLyB9XG5cbi8qKlxuICogcGFyc2UgdGhlIGV4cHJlc3Npb24gZGF0YSBvZiBhIGdlbmUgZm9yIGEgZ3JvdXBlZCB2aW9saW4gcGxvdFxuICogQHBhcmFtIGRhdGEge0pTT059IGZyb20gR1RFeCBnZW5lIGV4cHJlc3Npb24gd2ViIHNlcnZpY2VcbiAqIEBwYXJhbSBjb2xvcnMge0RpY3Rpb25hcnl9IHRoZSB2aW9saW4gY29sb3IgZm9yIGdlbmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUdlbmVFeHByZXNzaW9uRm9yVmlvbGluKGRhdGEsIHVzZUxvZz10cnVlLCBjb2xvcnM9dW5kZWZpbmVkKXtcbiAgICBjb25zdCBhdHRyID0gJ2dlbmVFeHByZXNzaW9uJztcbiAgICBpZighZGF0YS5oYXNPd25Qcm9wZXJ0eShhdHRyKSkgdGhyb3cgJ3BhcnNlR2VuZUV4cHJlc3Npb25Gb3JWaW9saW4gaW5wdXQgZXJyb3IuJztcbiAgICBkYXRhW2F0dHJdLmZvckVhY2goKGQpPT57XG4gICAgICAgIGQudmFsdWVzID0gdXNlTG9nP2QuZGF0YS5tYXAoKGRkKT0+e3JldHVybiBNYXRoLmxvZzEwKCtkZCsxKX0pOmQuZGF0YTtcbiAgICAgICAgZC5ncm91cCA9IGQudGlzc3VlSWQ7XG4gICAgICAgIGQubGFiZWwgPSBkLmdlbmVTeW1ib2w7XG4gICAgICAgIGQuY29sb3IgPSBjb2xvcnM9PT11bmRlZmluZWQ/JyM5MGMxYzEnOmNvbG9yc1tkLmdlbmNvZGVJZF07XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGFbYXR0cl07XG59XG4iLCIvKipcbiAqIENyZWF0ZXMgYW4gU1ZHXG4gKiBAcGFyYW0gaWQge1N0cmluZ30gYSBET00gZWxlbWVudCBJRCB0aGF0IHN0YXJ0cyB3aXRoIGEgXCIjXCJcbiAqIEBwYXJhbSB3aWR0aCB7TnVtZXJpY31cbiAqIEBwYXJhbSBoZWlnaHQge051bWVyaWN9XG4gKiBAcGFyYW0gbWFyZ2luIHtPYmplY3R9IHdpdGggdHdvIGF0dHJpYnV0ZXM6IHdpZHRoIGFuZCBoZWlnaHRcbiAqIEByZXR1cm4ge1NlbGVjdGlvbn0gdGhlIGQzIHNlbGVjdGlvbiBvYmplY3Qgb2YgdGhlIFNWR1xuICovXG5cbmltcG9ydCB7c2VsZWN0fSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBpZCB7U3RyaW5nfSB0aGUgcGFyZW50IGRvbSBJRFxuICogQHBhcmFtIHdpZHRoIHtOdW1lcmljfVxuICogQHBhcmFtIGhlaWdodCB7TnVtZXJpY31cbiAqIEBwYXJhbSBtYXJnaW4ge09iamVjdH0gd2l0aCBhdHRyOiBsZWZ0LCB0b3BcbiAqIEBwYXJhbSBzdmdJZCB7U3RyaW5nfVxuICogQHJldHVybnMgeyp9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdmcoaWQsIHdpZHRoLCBoZWlnaHQsIG1hcmdpbiwgc3ZnSWQ9dW5kZWZpbmVkKXtcbiAgICBpZiAoc3ZnSWQ9PT11bmRlZmluZWQpIHN2Z0lkPWAke2lkfS1zdmdgO1xuICAgIHJldHVybiBzZWxlY3QoXCIjXCIraWQpLmFwcGVuZChcInN2Z1wiKVxuICAgICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpXG4gICAgICAgIC5hdHRyKFwiaWRcIiwgc3ZnSWQpXG4gICAgICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHttYXJnaW4ubGVmdH0sICR7bWFyZ2luLnRvcH0pYClcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHN2Z09ialxuICogQHBhcmFtIGRvd25sb2FkRmlsZU5hbWUge1N0cmluZ31cbiAqIEBwYXJhbSB0ZW1wRG93bmxvYWREaXZJZCB7U3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZG93bmxvYWRTdmcoc3ZnT2JqLCBkb3dubG9hZEZpbGVOYW1lLCB0ZW1wRG93bmxvYWREaXZJZCl7XG4gICAgY29uc29sZS5sb2coc3ZnT2JqKTtcbiAgICB2YXIgJHN2Z0NvcHkgPSBzdmdPYmouY2xvbmUoKVxuICAgIC5hdHRyKFwidmVyc2lvblwiLCBcIjEuMVwiKVxuICAgIC5hdHRyKFwieG1sbnNcIiwgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiKTtcblxuICAgIC8vIHBhcnNlIGFuZCBhZGQgdGhlIENTUyBzdHlsaW5nIHVzZWQgYnkgdGhlIFNWR1xuICAgIHZhciBzdHlsZXMgPSBwYXJzZUNzc1N0eWxlcyhzdmdPYmouZ2V0KCkpO1xuICAgICRzdmdDb3B5LnByZXBlbmQoc3R5bGVzKTtcblxuICAgICQoXCIjXCIgKyB0ZW1wRG93bmxvYWREaXZJZCkuaHRtbCgnJykuaGlkZSgpO1xuICAgIHZhciBzdmdIdG1sID0gJChcIiNcIiArIHRlbXBEb3dubG9hZERpdklkKS5hcHBlbmQoJHN2Z0NvcHkpLmh0bWwoKTtcblxuICAgIHZhciBzdmdCbG9iID0gbmV3IEJsb2IoW3N2Z0h0bWxdLCB7dHlwZTogXCJpbWFnZS9zdmcreG1sXCJ9KTtcbiAgICBzYXZlQXMoc3ZnQmxvYiwgZG93bmxvYWRGaWxlTmFtZSk7XG5cbiAgICAvLyBjbGVhciB0aGUgdGVtcCBkb3dubG9hZCBkaXZcbiAgICAkKFwiI1wiICsgdGVtcERvd25sb2FkRGl2SWQpLmh0bWwoJycpLmhpZGUoKTtcbn1cbi8qKlxuICogQSBmdW5jdGlvbiBmb3IgcGFyc2luZyB0aGUgQ1NTIHN0eWxlIHNoZWV0IGFuZCBpbmNsdWRpbmcgdGhlIHN0eWxlIHByb3BlcnRpZXMgaW4gdGhlIGRvd25sb2FkYWJsZSBTVkcuXG4gKiBAcGFyYW0gZG9tXG4gKiBAcmV0dXJucyB7RWxlbWVudH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ3NzU3R5bGVzIChkb20pIHtcbiAgICB2YXIgdXNlZCA9IFwiXCI7XG4gICAgdmFyIHNoZWV0cyA9IGRvY3VtZW50LnN0eWxlU2hlZXRzO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaGVldHMubGVuZ3RoOyBpKyspIHsgLy8gVE9ETzogd2FsayB0aHJvdWdoIHRoaXMgYmxvY2sgb2YgY29kZVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoc2hlZXRzW2ldLmNzc1J1bGVzID09IG51bGwpIGNvbnRpbnVlO1xuICAgICAgICAgICAgdmFyIHJ1bGVzID0gc2hlZXRzW2ldLmNzc1J1bGVzO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJ1bGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJ1bGUgPSBydWxlc1tqXTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mKHJ1bGUuc3R5bGUpICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsZW1zO1xuICAgICAgICAgICAgICAgICAgICAvL1NvbWUgc2VsZWN0b3JzIHdvbid0IHdvcmssIGFuZCBtb3N0IG9mIHRoZXNlIGRvbid0IG1hdHRlci5cbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1zID0gJChkb20pLmZpbmQocnVsZS5zZWxlY3RvclRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZWQgKz0gcnVsZS5zZWxlY3RvclRleHQgKyBcIiB7IFwiICsgcnVsZS5zdHlsZS5jc3NUZXh0ICsgXCIgfVxcblwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBJbiBGaXJlZm94LCBpZiBzdHlsZXNoZWV0IG9yaWdpbmF0ZXMgZnJvbSBhIGRpZmYgZG9tYWluLFxuICAgICAgICAgICAgLy8gdHJ5aW5nIHRvIGFjY2VzcyB0aGUgY3NzUnVsZXMgd2lsbCB0aHJvdyBhIFNlY3VyaXR5RXJyb3IuXG4gICAgICAgICAgICAvLyBIZW5jZSwgd2UgbXVzdCB1c2UgYSB0cnkvY2F0Y2ggdG8gaGFuZGxlIHRoaXMgaW4gRmlyZWZveFxuICAgICAgICAgICAgaWYgKGUubmFtZSAhPT0gJ1NlY3VyaXR5RXJyb3InKSB0aHJvdyBlO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgcy5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dC9jc3MnKTtcbiAgICBzLmlubmVySFRNTCA9IFwiPCFbQ0RBVEFbXFxuXCIgKyB1c2VkICsgXCJcXG5dXT5cIjtcblxuICAgIHJldHVybiBzO1xufVxuIiwiLyoqXG4gKiBDcmVhdGUgYSB0b29sYmFyXG4gKiBUaGlzIGNsYXNzIHVzZXMgYSBsb3Qgb2YgalF1ZXJ5IGZvciBkb20gZWxlbWVudCBtYW5pcHVsYXRpb25cbiAqL1xuXG5pbXBvcnQge3NlbGVjdH0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtwYXJzZUNzc1N0eWxlc30gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9vbGJhciB7XG4gICAgY29uc3RydWN0b3IoZG9tSWQsIHRvb2x0aXA9dW5kZWZpbmVkLCB2ZXJ0aWNhbD1mYWxzZSl7XG4gICAgICAgICQoYCMke2RvbUlkfWApLnNob3coKTsgLy8gaWYgaGlkZGVuXG5cbiAgICAgICAgLy8gYWRkIGEgbmV3IGJhcmdyb3VwIGRpdiB0byBkb21JRCB3aXRoIGJvb3RzdHJhcCBidXR0b24gY2xhc3Nlc1xuICAgICAgICBjb25zdCBidG5DbGFzc2VzID0gdmVydGljYWw/J2J0bi1ncm91cC12ZXJ0aWNhbCBidG4tZ3JvdXAtc20nOiAnYnRuLWdyb3VwIGJ0bi1ncm91cC1zbSc7XG4gICAgICAgIHRoaXMuYmFyID0gJCgnPGRpdi8+JykuYWRkQ2xhc3MoYnRuQ2xhc3NlcykuYXBwZW5kVG8oYCMke2RvbUlkfWApO1xuICAgICAgICB0aGlzLmJ1dHRvbnMgPSB7fTtcbiAgICAgICAgdGhpcy50b29sdGlwID0gdG9vbHRpcDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBkb3dubG9hZCBidXR0b24gZm9yIFNWR1xuICAgICAqIEBwYXJhbSBpZCB7U3RyaW5nfSB0aGUgYnV0dG9uIGRvbSBJRFxuICAgICAqIEBwYXJhbSBzdmdJZCB7U3RyaW5nfSB0aGUgU1ZHIGRvbSBJRCB0byBncmFiIGFuZCBkb3dubG9hZFxuICAgICAqIEBwYXJhbSBvdXRmaWxlTmFtZSB7U3RyaW5nfSB0aGUgZG93bmxvYWQgZmlsZSBuYW1lXG4gICAgICogQHBhcmFtIGNsb25lSWQge1N0cmluZ30gdGhlIGNsb25lZCBTVkcgZG9tIElEXG4gICAgICogQHBhcmFtIGljb24ge1N0cmluZ30gYSBmb250YXdlc29tZSdzIGljb24gY2xhc3MgbmFtZVxuICAgICAqL1xuICAgIGNyZWF0ZURvd25sb2FkU3ZnQnV0dG9uKGlkLCBzdmdJZCwgb3V0ZmlsZU5hbWUsIGNsb25lSWQsIGljb249J2ZhLWRvd25sb2FkJyl7XG4gICAgICAgIGNvbnN0ICRidXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbihpZCwgaWNvbik7XG4gICAgICAgIHNlbGVjdChgIyR7aWR9YClcbiAgICAgICAgICAgIC5vbignY2xpY2snLCAoKT0+e1xuICAgICAgICAgICAgICAgIHRoaXMuZG93bmxvYWRTdmcoc3ZnSWQsIG91dGZpbGVOYW1lLCBjbG9uZUlkKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub24oJ21vdXNlb3ZlcicsICgpPT57XG4gICAgICAgICAgICAgICAgdGhpcy50b29sdGlwLnNob3coXCJEb3dubG9hZFwiKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub24oJ21vdXNlb3V0JywgKCk9PntcbiAgICAgICAgICAgICAgICB0aGlzLnRvb2x0aXAuaGlkZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3JlYXRlUmVzZXRCdXR0b24oaWQsIGNhbGxiYWNrLCBpY29uPSdmYS1leHBhbmQtYXJyb3dzLWFsdCcpe1xuICAgICAgICBjb25zdCAkYnV0dG9uID0gdGhpcy5jcmVhdGVCdXR0b24oaWQsIGljb24pO1xuICAgICAgICBzZWxlY3QoYCMke2lkfWApXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgY2FsbGJhY2spXG4gICAgICAgICAgICAub24oJ21vdXNlb3ZlcicsICgpPT57XG4gICAgICAgICAgICAgICAgdGhpcy50b29sdGlwLnNob3coXCJSZXNldCB0aGUgc2NhbGVzXCIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vbignbW91c2VvdXQnLCAoKT0+e1xuICAgICAgICAgICAgICAgIHRoaXMudG9vbHRpcC5oaWRlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjcmVhdGUgYSBidXR0b24gdG8gdGhlIHRvb2xiYXJcbiAgICAgKiBAcGFyYW0gaWQge1N0cmluZ30gdGhlIGJ1dHRvbidzIGlkXG4gICAgICogQHBhcmFtIGljb24ge1N0cmluZ30gYSBmb250YXdlc29tZSBpY29uIGNsYXNzXG4gICAgICogRGVwZW5kZW5jaWVzOiBCb290c3RyYXAsIGpRdWVyeSwgRm9udGF3ZXNvbWVcbiAgICAgKi9cbiAgICBjcmVhdGVCdXR0b24oaWQsIGljb249J2ZhLWRvd25sb2FkJyl7XG4gICAgICAgIGNvbnN0ICRidXR0b24gPSAkKCc8YS8+JykuYXR0cignaWQnLCBpZClcbiAgICAgICAgICAgIC5hZGRDbGFzcygnYnRuIGJ0bi1kZWZhdWx0JykuYXBwZW5kVG8odGhpcy5iYXIpO1xuICAgICAgICAkKCc8aS8+JykuYWRkQ2xhc3MoYGZhICR7aWNvbn1gKS5hcHBlbmRUbygkYnV0dG9uKTtcbiAgICAgICAgdGhpcy5idXR0b25zW2lkXSA9ICRidXR0b247XG4gICAgICAgIHJldHVybiAkYnV0dG9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGF0dGFjaCBhIHRvb2x0aXAgZG9tIHdpdGggdGhlIHRvb2xiYXJcbiAgICAgKiBAcGFyYW0gdG9vbHRpcCB7VG9vbHRpcH1cbiAgICAgKi9cbiAgICBhdHRhY2hUb29sdGlwKHRvb2x0aXApe1xuICAgICAgICB0aGlzLnRvb2x0aXAgPSB0b29sdGlwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERvd25sb2FkIFNWRyBvYmpcbiAgICAgKiBAcGFyYW0gc3ZnSWQge1N0cmluZ30gdGhlIFNWRyBkb20gSURcbiAgICAgKiBAcGFyYW0gZmlsZU5hbWUge1N0cmluZ30gdGhlIG91dHB1dCBmaWxlIG5hbWVcbiAgICAgKiBAcGFyYW0gY2xvbmVJZCB7U3RyaW5nfSB0aGUgdGVtcG9yYXJ5IGRvbSBJRCB0byBjb3B5IHRoZSBTVkcgdG9cbiAgICAgKiBEZXBlbmRlbmNpZXM6IEZpbGVTYXZlclxuICAgICAqL1xuICAgIGRvd25sb2FkU3ZnKHN2Z0lkLCBmaWxlTmFtZSwgY2xvbmVJZCl7XG4gICAgICAgIC8vIGxldCBzdmdPYmogPSAkKCQoJChgJHtcIiNcIiArc3ZnSWR9IHN2Z2ApKVswXSk7IC8vIGNvbXBsaWNhdGVkIGpRdWVyeSB0byBnZXQgdG8gdGhlIFNWRyBvYmplY3RcbiAgICAgICAgbGV0IHN2Z09iaiA9ICQoJCgkKGAke1wiI1wiICtzdmdJZH1gKSlbMF0pO1xuICAgICAgICBsZXQgJHN2Z0NvcHkgPSBzdmdPYmouY2xvbmUoKVxuICAgICAgICAuYXR0cihcInZlcnNpb25cIiwgXCIxLjFcIilcbiAgICAgICAgLmF0dHIoXCJ4bWxuc1wiLCBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIpO1xuXG4gICAgICAgIC8vIHBhcnNlIGFuZCBhZGQgYWxsIHRoZSBDU1Mgc3R5bGluZyB1c2VkIGJ5IHRoZSBTVkdcbiAgICAgICAgbGV0IHN0eWxlcyA9IHBhcnNlQ3NzU3R5bGVzKHN2Z09iai5nZXQoKSk7XG4gICAgICAgICRzdmdDb3B5LnByZXBlbmQoc3R5bGVzKTtcblxuICAgICAgICAkKFwiI1wiICsgY2xvbmVJZCkuaHRtbCgnJykuaGlkZSgpOyAvLyBtYWtlIHN1cmUgdGhlIGNvcHlJRCBpcyBpbnZpc2libGVcbiAgICAgICAgbGV0IHN2Z0h0bWwgPSAkKGAjJHtjbG9uZUlkfWApLmFwcGVuZCgkc3ZnQ29weSkuaHRtbCgpO1xuXG4gICAgICAgIGxldCBzdmdCbG9iID0gbmV3IEJsb2IoW3N2Z0h0bWxdLCB7dHlwZTogXCJpbWFnZS9zdmcreG1sXCJ9KTtcbiAgICAgICAgc2F2ZUFzKHN2Z0Jsb2IsIGZpbGVOYW1lKTsgLy8gdGhpcyBpcyBhIEZpbGVTYXZlciBmdW5jdGlvbi4uLi5cblxuICAgICAgICAvLyBjbGVhciB0aGUgdGVtcCBkb3dubG9hZCBkaXZcbiAgICAgICAgJChgIyR7Y2xvbmVJZH1gKS5odG1sKCcnKS5oaWRlKCk7XG4gICAgfVxufSIsIi8qKioqKiogR29vZ2xlIFNpZ25JbiAqKioqKiovXG5leHBvcnQgZnVuY3Rpb24gZ29vZ2xlRnVuYygpe1xuICAgIHJldHVybiB7XG4gICAgICAgIGNoZWNrU2lnbmVkSW46IGNoZWNrU2lnbmVkSW4sXG4gICAgICAgIGdldFVzZXI6IGdldFVzZXIsXG4gICAgICAgIHNpZ25JbkJ1dHRvbjogcmVuZGVyU2lnbkluQnV0dG9uLFxuICAgICAgICBzaWduT3V0OiBzaWduT3V0LFxuICAgICAgICBncmFudFNjb3BlczogZ3JhbnRTY29wZXNcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNpZ25JbkJ1dHRvbigpe1xuICAgIGdhcGkuc2lnbmluMi5yZW5kZXIoJ215LXNpZ25pbjInLCB7XG4gICAgICAgIC8vICdzY29wZSc6ICdwcm9maWxlIGVtYWlsIGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZGV2c3RvcmFnZS5mdWxsX2NvbnRyb2wgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9wbHVzLm1lJyxcbiAgICAgICAgJ3Njb3BlJzogJ3Byb2ZpbGUgZW1haWwnLFxuICAgICAgICAnd2lkdGgnOiAyNDAsXG4gICAgICAgICdoZWlnaHQnOiA1MCxcbiAgICAgICAgJ2xvbmd0aXRsZSc6IHRydWUsXG4gICAgICAgICd0aGVtZSc6ICdkYXJrJyxcbiAgICAgICAgJ29uc3VjY2Vzcyc6IG9uU3VjY2VzcyxcbiAgICAgICAgJ29uZmFpbHVyZSc6IG9uRmFpbHVyZVxuICAgIH0pXG59XG5cbmZ1bmN0aW9uIG9uU3VjY2Vzcyhnb29nbGVVc2VyKXtcbiAgICAkKCcjZy1zaWdub3V0Jykuc2hvdygpO1xufVxuXG5mdW5jdGlvbiBzaWduT3V0KCkge1xuICAgIGxldCBhdXRoMiA9IGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCk7XG4gICAgYXV0aDIuc2lnbk91dCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdVc2VyIHNpZ25lZCBvdXQnKTtcbiAgICB9KTtcbiAgICAkKCcjZy1zaWdub3V0JykuaGlkZSgpO1xufVxuXG5mdW5jdGlvbiBvbkZhaWx1cmUoZXJyb3Ipe1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG59XG5cbmZ1bmN0aW9uIGNoZWNrU2lnbmVkSW4oKXtcbiAgICBpZiAoZ2FwaS5hdXRoMikge1xuICAgICAgICByZXR1cm4gZ2V0VXNlcigpLmlzU2lnbmVkSW4oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRVc2VyKCl7XG4gICAgcmV0dXJuIGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuY3VycmVudFVzZXIuZ2V0KClcbn1cblxuZnVuY3Rpb24gZ3JhbnRTY29wZXMoc2NvcGVzKXtcbiAgICB0aGlzLmdldFVzZXIoKS5ncmFudCh7c2NvcGU6IHNjb3Blc30pLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3Mpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoe21lc3NhZ2U6IFwic3VjY2Vzc1wiLCB2YWx1ZTogc3VjY2Vzc30pKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZmFpbCl7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKEpTT04+c3RyaW5naWZ5KHttZXNzYWdlOiBcImZhaWxcIiwgdmFsdWU6IGZhaWx9KSk7XG4gICAgICAgIH1cbiAgICApO1xufSIsIid1c2Ugc3RyaWN0JztcbmltcG9ydCB7anNvbiwgdHN2fSBmcm9tICdkMy1mZXRjaCc7XG5pbXBvcnQge3NlbGVjdCwgc2VsZWN0QWxsfSBmcm9tICdkMy1zZWxlY3Rpb24nO1xuaW1wb3J0IHtnZXRHdGV4VXJscyxcbiAgICBwYXJzZVRpc3N1ZXNcbn0gZnJvbSAnLi9tb2R1bGVzL2d0ZXhEYXRhUGFyc2VyJztcbmltcG9ydCBUb29sYmFyIGZyb20gJy4vbW9kdWxlcy9Ub29sYmFyJztcbmltcG9ydCB7Z29vZ2xlRnVuY30gZnJvbSAnLi9tb2R1bGVzL2dvb2dsZVVzZXInO1xuXG4vKlxuVE9ETzpcbmZpcnN0IGJ1aWxkIGEgZGF0YSBtYXRyaXggd2l0aCB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZVxue1xuICAgIGNvbDogdGlzc3Vlc1xuICAgIHJvdzogZGF0YSB0eXBlc1xuICAgIGRhdGE6IFsgb2JqZWN0cyB3aXRoIGNvbCBhbmQgcm93IGFuZCB2YWx1ZSBdXG59XG4gKi9cblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdvb2dsZSBzaWduZWQgaW4gYnV0dG9uIChpZiB0aGVyZSBpc24ndCBvbmUgcHJvdmlkZWQgYWxyZWFkeSlcbiAqIEBwYXJhbSBjYWxsYmFjayB7RnVuY3Rpb259XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJTaWduSW5CdXR0b24oY2FsbGJhY2s9Z29vZ2xlRnVuYygpLnNpZ25JbkJ1dHRvbil7XG4gICAgY2FsbGJhY2soKTtcbn1cblxuLyoqXG4gKiBEZWZpbmUgdGhlIEdvb2dsZSBzaWduIG91dCBmdW5jdGlvblxuICogQHBhcmFtIGNhbGxiYWNrIHtGdW5jdGlvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNpZ25PdXQoY2FsbGJhY2s9Z29vZ2xlRnVuYygpLnNpZ25PdXQpe1xuICAgIGNhbGxiYWNrKCk7XG59XG5cbi8qKlxuICogYnVpbGQgdGhlIGRhdGEgbWF0cml4IHRhYmxlXG4gKiBAcGFyYW0gdGFibGVJZCB7U3RyaW5nfVxuICogQHBhcmFtIGRhdGFzZXRJZCB7U3RyaW5nfVxuICogQHBhcmFtIGdvb2dsZUZ1bmMge09iamVjdH0gd2l0aCBmdW5jdGlvbiBhdHRyaWJ1dGVzOiBjaGVja1NpZ25lZEluLCBnZXRVc2VyXG4gKiBAcGFyYW0gdXJsc1xuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBsYXVuY2godGFibGVJZCwgZGF0YXNldElkPSdndGV4X3Y3JywgZ29vZ2xlRnVuY0RpY3Q9Z29vZ2xlRnVuYygpLCB1cmxzPWdldEd0ZXhVcmxzKCkpe1xuICAgIGNvbnN0IHByb21pc2VzID0gW1xuICAgICAgICAvLyBUT0RPOiB1cmxzIGZvciBvdGhlciBkYXRhc2V0c1xuICAgICAgICBqc29uKHVybHMudGlzc3VlKSxcbiAgICAgICAgdHN2KHVybHMucm5hc2VxQ3JhbSksXG4gICAgICAgIHRzdih1cmxzLndnc0NyYW0pLFxuICAgICAgICB0c3YodXJscy5zYW1wbGUpLFxuICAgIF07XG5cbiAgICBQcm9taXNlLmFsbChwcm9taXNlcylcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oYXJncyl7XG4gICAgICAgICAgICBsZXQgdGlzc3VlcyA9IHBhcnNlVGlzc3VlcyhhcmdzWzBdKTtcbiAgICAgICAgICAgIGNvbnN0IGNyYW0gPSB7XG4gICAgICAgICAgICAgICAgcm5hc2VxOiBhcmdzWzFdLnJlZHVjZSgoYSwgZCk9PnthW2Quc2FtcGxlX2lkLnRvVXBwZXJDYXNlKCldPWQ7IHJldHVybiBhO30sIHt9KSxcbiAgICAgICAgICAgICAgICB3Z3M6IGFyZ3NbMl0ucmVkdWNlKChhLCBkKT0+e2FbZC5zYW1wbGVfaWQudG9VcHBlckNhc2UoKV09ZDsgcmV0dXJuIGE7fSwge30pXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IHNhbXBsZXMgPSBhcmdzWzNdXG4gICAgICAgICAgICAgICAgLmZpbHRlcigocyk9PnMuZGF0YXNldElkPT1kYXRhc2V0SWQpXG4gICAgICAgICAgICAgICAgLm1hcCgocyk9PntcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChzLmRhdGFUeXBlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJXR1NcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3JhbS53Z3MuaGFzT3duUHJvcGVydHkocy5zYW1wbGVJZCkpIHRocm93IHMuc2FtcGxlSWQgKyAnIGhhcyBubyBjcmFtIGZpbGVzJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzLmNyYW1GaWxlID0gY3JhbS53Z3Nbcy5zYW1wbGVJZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiUk5BU0VRXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNyYW0ucm5hc2VxLmhhc093blByb3BlcnR5KHMuc2FtcGxlSWQpKSB0aHJvdyBzLnNhbXBsZUlkICsgJyBoYXMgbm8gY3JhbSBmaWxlcyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcy5jcmFtRmlsZSA9IGNyYW0ucm5hc2VxW3Muc2FtcGxlSWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHM7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCB0aGVNYXRyaXggPSBfYnVpbGRNYXRyaXgoZGF0YXNldElkLCBzYW1wbGVzLCB0aXNzdWVzKTtcbiAgICAgICAgICAgIF9yZW5kZXJNYXRyaXhUYWJsZSh0YWJsZUlkLCB0aGVNYXRyaXgsIGdvb2dsZUZ1bmNEaWN0LCB1cmxzKTtcbiAgICAgICAgICAgIF9hZGRGaWx0ZXJzKHRhYmxlSWQsIHRoZU1hdHJpeCwgc2FtcGxlcywgdGlzc3VlcywgZ29vZ2xlRnVuY0RpY3QsIHVybHMpO1xuXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpe2NvbnNvbGUuZXJyb3IoZXJyKX0pO1xufVxuXG5mdW5jdGlvbiBfYWRkRmlsdGVycyh0YWJsZUlkLCBtYXQsIHNhbXBsZXMsIHRpc3N1ZXMsIGdvb2dsZUZ1bmNEaWN0LCB1cmxzKXtcbiAgICBjb25zdCBfX2ZpbHRlciA9ICgpPT57XG4gICAgICAgIGNvbnN0IHNleCA9IHNlbGVjdCgnaW5wdXRbbmFtZT1cInNleFwiXTpjaGVja2VkJykubm9kZSgpLnZhbHVlO1xuICAgICAgICBjb25zdCBhZ2UgPSBzZWxlY3QoJ2lucHV0W25hbWU9XCJhZ2VcIl06Y2hlY2tlZCcpLm5vZGUoKS52YWx1ZTtcbiAgICAgICAgaWYgKHNleCA9PSAnYm90aCcgJiYgYWdlID09ICdhbGwnKXtcbiAgICAgICAgICAgIF9yZW5kZXJNYXRyaXhUYWJsZSh0YWJsZUlkLCBfYnVpbGRNYXRyaXgobWF0LmRhdGFzZXRJZCwgc2FtcGxlcywgdGlzc3VlcyksIGdvb2dsZUZ1bmNEaWN0LCB1cmxzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBmaWx0ZXJlZE1hdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChzZXggPT0gJ2JvdGgnKSBmaWx0ZXJlZE1hdCA9IF9idWlsZE1hdHJpeChtYXQuZGF0YXNldElkLCBzYW1wbGVzLmZpbHRlcihzPT5zLmFnZUJyYWNrZXQ9PWFnZSksIHRpc3N1ZXMpO1xuICAgICAgICAgICAgZWxzZSBpZiAoYWdlID09ICdhbGwnKSBmaWx0ZXJlZE1hdCA9IF9idWlsZE1hdHJpeChtYXQuZGF0YXNldElkLCBzYW1wbGVzLmZpbHRlcihzPT5zLnNleD09c2V4KSwgdGlzc3Vlcyk7XG4gICAgICAgICAgICBlbHNlIGZpbHRlcmVkTWF0ID0gX2J1aWxkTWF0cml4KG1hdC5kYXRhc2V0SWQsIHNhbXBsZXMuZmlsdGVyKHM9PnMuc2V4PT1zZXggJiYgcy5hZ2VCcmFja2V0PT1hZ2UpLCB0aXNzdWVzKTtcbiAgICAgICAgICAgIF9yZW5kZXJNYXRyaXhUYWJsZSh0YWJsZUlkLCBmaWx0ZXJlZE1hdCwgZ29vZ2xlRnVuY0RpY3QsIHVybHMpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBzZWxlY3QoJyNmaWx0ZXItbWVudScpLnNlbGVjdEFsbCgnaW5wdXRbbmFtZT1cInNleFwiXScpLm9uKCdjaGFuZ2UnLCBfX2ZpbHRlcik7XG4gICAgc2VsZWN0KCcjZmlsdGVyLW1lbnUnKS5zZWxlY3RBbGwoJ2lucHV0W25hbWU9XCJhZ2VcIl0nKS5vbignY2hhbmdlJywgX19maWx0ZXIpO1xufVxuXG5mdW5jdGlvbiBfYnVpbGRNYXRyaXgoZGF0YXNldElkLCBzYW1wbGVzLCB0aXNzdWVzKXtcbiAgICBjb25zdCBfX2J1aWxkSGFzaCA9IGZ1bmN0aW9uKGRhdGFUeXBlKXtcbiAgICAgICAgcmV0dXJuIHNhbXBsZXMuZmlsdGVyKChzKT0+cy5kYXRhVHlwZT09ZGF0YVR5cGUpLnJlZHVjZSgoYSwgZCk9PntcbiAgICAgICAgICAgIGlmKGFbZC50aXNzdWVJZF09PT11bmRlZmluZWQpIGFbZC50aXNzdWVJZF0gPSAwO1xuICAgICAgICAgICAgYVtkLnRpc3N1ZUlkXT0gYVtkLnRpc3N1ZUlkXSsxO1xuICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgIH0sIHt9KTtcbiAgICB9O1xuICAgIGNvbnN0IGNvbHVtbnMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnUk5BLVNlcScsXG4gICAgICAgICAgICBpZDogJ1JOQVNFUScsXG4gICAgICAgICAgICBkYXRhOiBfX2J1aWxkSGFzaCgnUk5BU0VRJylcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdXRVMnLFxuICAgICAgICAgICAgaWQ6ICdXRVMnLFxuICAgICAgICAgICAgZGF0YTogX19idWlsZEhhc2goJ1dFUycpXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnV0dTJyxcbiAgICAgICAgICAgIGlkOiAnV0dTJyxcbiAgICAgICAgICAgIGRhdGE6IF9fYnVpbGRIYXNoKCdXR1MnKVxuICAgICAgICB9XG4gICAgXTtcbiAgICBjb25zdCByb3dzID0gdGlzc3Vlcy5tYXAoKHQpPT57XG4gICAgICAgIHQuaWQgPSB0LnRpc3N1ZUlkO1xuICAgICAgICB0LmxhYmVsID0gdC50aXNzdWVOYW1lO1xuICAgICAgICBjb2x1bW5zLmZvckVhY2goKGNvbCk9PntcbiAgICAgICAgICAgIHRbY29sLmlkXSA9IGNvbC5kYXRhW3QuaWRdIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YXNldElkOiBkYXRhc2V0SWQsXG4gICAgICAgIFg6IHJvd3MsXG4gICAgICAgIFk6IGNvbHVtbnMsXG4gICAgICAgIGRhdGE6IHNhbXBsZXNcbiAgICB9O1xufVxuXG5cbi8qKlxuICogUmVuZGVyIHRoZSBtYXRyaXggaW4gYW4gSFRNTCB0YWJsZSBmb3JtYXRcbiAqIEBwYXJhbSB0YWJsZUlkIHtTdHJpbmd9IHRoZSBET00gSUQgb2YgdGhlIHRhYmxlXG4gKiBAcGFyYW0gbWF0IHtPYmplY3R9IG9mIGF0dHI6IGRhdGFzZXRJZCwgWC0tYSBsaXN0IG9mIHggb2JqZWN0cywgWS0tYSBsaXN0IG9mIHkgb2JqZWN0c1xuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX3JlbmRlck1hdHJpeFRhYmxlKHRhYmxlSWQsIG1hdCwgZ29vZ2xlRnVuY0RpY3QsIHVybHMpe1xuICAgIGNvbnN0IGRhdGFzZXQgPSB7XG4gICAgICAgICdndGV4X3Y3Jzoge1xuICAgICAgICAgICAgbGFiZWw6J0dURVggVjcnLFxuICAgICAgICAgICAgYmdjb2xvcjogJyMyYTcxOGInXG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIHJlbmRlcmluZyB0aGUgY29sdW1uIGxhYmVsc1xuICAgIGNvbnN0IHRoZVRhYmxlID0gc2VsZWN0KGAjJHt0YWJsZUlkfWApO1xuICAgIHRoZVRhYmxlLnNlbGVjdCgndGhlYWQnKS5zZWxlY3RBbGwoJ3RoJylcbiAgICAgICAgLmRhdGEoW3tsYWJlbDpcIlwiLCBpZDpcIlwifV0uY29uY2F0KG1hdC5ZKSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgndGgnKVxuICAgICAgICAuYXR0cignc2NvcGUnLCAnY29sJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgKGQsIGkpPT5kLmlkPT1cIlwiPycnOmB5JHtpLTF9YClcbiAgICAgICAgLnRleHQoKGQpPT5kLmxhYmVsKTtcblxuICAgIHRoZVRhYmxlLnNlbGVjdCgnLnRhYmxlLWxhYmVsJykuc2VsZWN0QWxsKCcqJykucmVtb3ZlKCk7XG4gICAgdGhlVGFibGUuc2VsZWN0KCcudGFibGUtbGFiZWwnKS5hcHBlbmQoJ3RoJylcbiAgICAgICAgLmF0dHIoJ2NvbHNwYW4nLCBtYXQuWS5sZW5ndGggKyAxKVxuICAgICAgICAudGV4dChkYXRhc2V0W21hdC5kYXRhc2V0SWRdLmxhYmVsKVxuICAgICAgICAuc3R5bGUoJ2JhY2tncm91bmQtY29sb3InLGRhdGFzZXRbbWF0LmRhdGFzZXRJZF0uYmdjb2xvcik7XG5cbiAgICBfcmVuZGVyQ291bnRzKHRoZVRhYmxlLnNlbGVjdCgndGJvZHknKSwgbWF0KTtcbiAgICBfYWRkQ2xpY2tFdmVudHModGFibGVJZCk7XG4gICAgX2FkZFRvb2xiYXIodGFibGVJZCwgbWF0LCBnb29nbGVGdW5jRGljdCwgdXJscyk7IC8vIHJlYnVpbGQgdGhlIHRvb2xiYXIgd2l0aCB0aGUgbmV3IG1hdHJpeFxufVxuXG5mdW5jdGlvbiBfcmVuZGVyQ291bnRzKHRib2R5LCBtYXQpe1xuICAgIHRib2R5LnNlbGVjdEFsbCgnLmRhdGEtcm93JykucmVtb3ZlKCk7XG4gICAgY29uc3QgdGhlUm93cyA9IHRib2R5LnNlbGVjdEFsbCgnLmRhdGEtcm93JylcbiAgICAgICAgLmRhdGEobWF0LlgpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoJ3RyJylcbiAgICAgICAgLmNsYXNzZWQoJ2RhdGEtcm93JywgdHJ1ZSk7XG5cbiAgICAvLyByZW5kZXJpbmcgdGhlIHJvdyBsYWJlbFxuICAgIHRoZVJvd3MuYXBwZW5kKCd0aCcpXG4gICAgICAgIC5hdHRyKCdzY29wZScsICdyb3cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAoZCwgaSk9PmB4JHtpfWApXG4gICAgICAgIC50ZXh0KChkKT0+ZC5sYWJlbCk7XG5cbiAgICBtYXQuWS5mb3JFYWNoKCh5LCBqKT0+e1xuICAgICAgICB0aGVSb3dzLmFwcGVuZCgndGQnKVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgKGQsIGkpPT57XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRbeS5pZF09PT11bmRlZmluZWQ/Jyc6YHgke2l9IHkke2p9YDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGV4dCgoZCk9PmRbeS5pZF18fCcnKTtcbiAgICB9KTtcblxufVxuXG4vKipcbiAqIEFkZCBjdXN0b21pemVkIGNvbHVtbiwgcm93IGFuZCBjZWxsIGNsaWNrIGV2ZW50c1xuICogQHBhcmFtIHRhYmxlSWQge1N0cmluZ30gdGhlIGRvbSBJRCBvZiB0aGUgdGFibGVcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9hZGRDbGlja0V2ZW50cyh0YWJsZUlkKXtcbiAgICBjb25zdCB0aGVDZWxscyA9IHNlbGVjdChgIyR7dGFibGVJZH1gKS5zZWxlY3QoJ3Rib2R5Jykuc2VsZWN0QWxsKCd0ZCcpO1xuXG4gICAgLy8gY29sdW1uIGxhYmVsc1xuICAgIHNlbGVjdChgIyR7dGFibGVJZH1gKS5zZWxlY3QoJ3RoZWFkJykuc2VsZWN0QWxsKCd0aCcpXG4gICAgICAgIC5zdHlsZSgnY3Vyc29yJywgJ3BvaW50ZXInKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIC8vIHRvZ2dsZSB0aGUgc2VsZWN0aW9uXG4gICAgICAgICAgIGNvbnN0IHRoZUNvbHVtbiA9IHNlbGVjdCh0aGlzKS5hdHRyKCdjbGFzcycpO1xuICAgICAgICAgICBpZiAoc2VsZWN0KHRoaXMpLmF0dHIoJ3Njb3BlJykgPT0gJ2NvbCcpIHtcbiAgICAgICAgICAgICAgIHNlbGVjdCh0aGlzKS5hdHRyKCdzY29wZScsICdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgICAgdGhlQ2VsbHMuZmlsdGVyKGAuJHt0aGVDb2x1bW59YCkuY2xhc3NlZCgnc2VsZWN0ZWQnLCB0cnVlKTtcbiAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgIHNlbGVjdCh0aGlzKS5hdHRyKCdzY29wZScsICdjb2wnKTtcbiAgICAgICAgICAgICAgIHRoZUNlbGxzLmZpbHRlcihgLiR7dGhlQ29sdW1ufWApLmNsYXNzZWQoJ3NlbGVjdGVkJywgZmFsc2UpO1xuICAgICAgICAgICB9XG4gICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoZUNvbHVtbik7XG4gICAgICAgIH0pO1xuXG4gICAgLy8gcm93IGxhYmVsc1xuICAgIHNlbGVjdChgIyR7dGFibGVJZH1gKS5zZWxlY3QoJ3Rib2R5Jykuc2VsZWN0QWxsKCd0aCcpXG4gICAgICAgIC5zdHlsZSgnY3Vyc29yJywgJ3BvaW50ZXInKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgY29uc3QgdGhlUm93ID0gc2VsZWN0KHRoaXMpLmF0dHIoJ2NsYXNzJyk7XG4gICAgICAgICAgIGlmIChzZWxlY3QodGhpcykuYXR0cignc2NvcGUnKSA9PSAncm93Jykge1xuICAgICAgICAgICAgICAgc2VsZWN0KHRoaXMpLmF0dHIoJ3Njb3BlJywgJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICB0aGVDZWxscy5maWx0ZXIoYC4ke3RoZVJvd31gKS5jbGFzc2VkKCdzZWxlY3RlZCcsIHRydWUpO1xuICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgc2VsZWN0KHRoaXMpLmF0dHIoJ3Njb3BlJywgJ3JvdycpO1xuICAgICAgICAgICAgICAgdGhlQ2VsbHMuZmlsdGVyKGAuJHt0aGVSb3d9YCkuY2xhc3NlZCgnc2VsZWN0ZWQnLCBmYWxzZSk7XG4gICAgICAgICAgIH1cbiAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhlUm93KTtcbiAgICAgICAgfSk7XG5cblxuICAgIC8vIGRhdGEgY2VsbHNcbiAgICB0aGVDZWxscy5zdHlsZSgnY3Vyc29yJywgJ3BvaW50ZXInKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIC8vIHRvZ2dsZSB0aGUgc2VsZWN0ZWQgY2xhc3MgYXNzaWdubWVudFxuICAgICAgICAgICAgc2VsZWN0KHRoaXMpLmNsYXNzZWQoJ3NlbGVjdGVkJywgIXNlbGVjdCh0aGlzKS5jbGFzc2VkKCdzZWxlY3RlZCcpKTtcbiAgICAgICAgfSlcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHRhYmxlSWRcbiAqIEBwYXJhbSBtYXRcbiAqIEBwcml2YXRlXG4gKiBSZWZlcmVuY2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9lbGlncmV5L0ZpbGVTYXZlci5qcy9cbiAqIERlcGVuZGVuY2llczogZ29vZ2xlVXNlci5qc1xuICovXG5mdW5jdGlvbiBfYWRkVG9vbGJhcih0YWJsZUlkLCBtYXQsIGdvb2dsZUZ1bmNEaWN0LCB1cmxzKXtcbiAgICAvLyBUT0RPOiBnZXQgcmlkIG9mIGhhcmQtY29kZWQgZG9tIElEc1xuICAgIGNvbnN0IHRoZUNlbGxzID0gc2VsZWN0KGAjJHt0YWJsZUlkfWApLnNlbGVjdCgndGJvZHknKS5zZWxlY3RBbGwoJ3RkJyk7XG4gICAgc2VsZWN0KCcjbWF0cml4LXRhYmxlLXRvb2xiYXInKS5zZWxlY3RBbGwoJyonKS5yZW1vdmUoKTtcbiAgICBjb25zdCB0b29sYmFyID0gbmV3IFRvb2xiYXIoJ21hdHJpeC10YWJsZS10b29sYmFyJywgdW5kZWZpbmVkLCB0cnVlKTtcbiAgICB0b29sYmFyLmNyZWF0ZUJ1dHRvbignc2FtcGxlLWRvd25sb2FkJyk7XG4gICAgdG9vbGJhci5jcmVhdGVCdXR0b24oJ3NlbmQtdG8tZmlyZWNsb3VkJywgJ2ZhLWNsb3VkLXVwbG9hZC1hbHQnKTtcblxuICAgIHNlbGVjdCgnI3NhbXBsZS1kb3dubG9hZCcpXG4gICAgICAgIC5zdHlsZSgnY3Vyc29yJywgJ3BvaW50ZXInKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGxldCBjZWxscyA9IHRoZUNlbGxzLmZpbHRlcihgLnNlbGVjdGVkYCk7XG4gICAgICAgICAgICBpZiAoY2VsbHMuZW1wdHkoKSkgYWxlcnQoJ1lvdSBoYXZlIG5vdCBzZWxlY3RlZCBhbnkgc2FtcGxlcyB0byBkb3dubG9hZC4nKTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBkb3dubG9hZENvbnRlbnQgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnU2FtcGxlIElEJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdUaXNzdWUgTmFtZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnRGF0YSBUeXBlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDUkFNIEZpbGUgR0NQJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDUkFNIEZpbGUgQVdTJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDUkFNIEZpbGUgTUQ1JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDUkFNIEZpbGUgU2l6ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ1JBTSBJbmRleCBHQ1AnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NSQU0gSW5kZXggQVdTJ1xuICAgICAgICAgICAgICAgICAgICBdLmpvaW4oXCJcXHRcIikgKyAnXFxuJztcbiAgICAgICAgICAgICAgICBjZWxscy5lYWNoKGZ1bmN0aW9uKGQpe1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXJrZXIgPSBzZWxlY3QodGhpcykuYXR0cignY2xhc3MnKS5zcGxpdCgnICcpLmZpbHRlcigoYyk9PntyZXR1cm4gYyE9J3NlbGVjdGVkJ30pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB4ID0gbWF0LlhbcGFyc2VJbnQobWFya2VyWzBdLnJlcGxhY2UoJ3gnLCAnJykpXS5pZDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeSA9IG1hdC5ZW3BhcnNlSW50KG1hcmtlclsxXS5yZXBsYWNlKCd5JywgJycpKV0uaWQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEb3dubG9hZCAnICsgeCArICcgOiAnKyB5KTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZFNhbXBsZXMgPSBtYXQuZGF0YS5maWx0ZXIoKHMpPT5zLmRhdGFUeXBlPT15JiZzLnRpc3N1ZUlkPT14JiZzLmRhdGFUeXBlIT0nV0VTJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKioqIFdBUk5JTkc6IG5vIFdFUyBjcmFtIGZpbGVzIGF2YWlsYWJsZSBBVE0gKioqKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKHMpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNyYW0gPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjcmFtX2ZpbGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY3JhbV9maWxlX2F3cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjcmFtX2ZpbGVfbWQ1JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NyYW1fZmlsZV9zaXplJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NyYW1faW5kZXgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY3JhbV9pbmRleF9hd3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXS5tYXAoKGQpPT5zLmNyYW1GaWxlW2RdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY29sdW1ucyA9IFtzLmNyYW1GaWxlLnNhbXBsZV9pZCwgcy50aXNzdWVOYW1lLCBzLmRhdGFUeXBlXS5jb25jYXQoY3JhbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbHVtbnMuam9pbihcIlxcdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzZWxlY3RlZFNhbXBsZXMpO1xuICAgICAgICAgICAgICAgICAgICBkb3dubG9hZENvbnRlbnQgKz0gc2VsZWN0ZWRTYW1wbGVzLmpvaW4oXCJcXG5cIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbGV0IGZpbGUgPSBuZXcgQmxvYihbZG93bmxvYWRDb250ZW50XSwge3R5cGU6ICd0ZXh0L3BsYWluO2NoYXJzZXQ9dXRmLTgnfSk7XG4gICAgICAgICAgICAgICAgc2F2ZUFzKGZpbGUsICdHVEV4LmNyYW0udHh0JywgdHJ1ZSk7IC8vIHNhdmVBcygpIGlzIGEgRmlsZVNhdmVyIGZpbGUsIGRpc2FibGUgYXV0byBCT01cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgc2VsZWN0KCcjc2VuZC10by1maXJlY2xvdWQnKVxuICAgICAgICAuc3R5bGUoJ2N1cnNvcicsICdwb2ludGVyJylcbiAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKCcjZmlyZS1jbG91ZC1zdGF0dXMnKS5lbXB0eSgpO1xuICAgICAgICAgICAgIGlmICghZ29vZ2xlRnVuY0RpY3QuY2hlY2tTaWduZWRJbigpKXtcbiAgICAgICAgICAgICAgICAgYWxlcnQoXCJZb3UgbmVlZCB0byBzaWduIGluIGZpcnN0XCIpO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICBjb25zdCBzY29wZXMgPSAncHJvZmlsZSBlbWFpbCBodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RldnN0b3JhZ2UuZnVsbF9jb250cm9sIGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvcGx1cy5tZSc7XG4gICAgICAgICAgICBnb29nbGVGdW5jRGljdC5ncmFudFNjb3BlcyhzY29wZXMpO1xuICAgICAgICAgICAgX3JlcG9ydEJpbGxpbmdQcm9qZWN0cyhnb29nbGVGdW5jRGljdC5nZXRVc2VyKCkpO1xuICAgICAgICAgICAgX3JlcG9ydFdvcmtzcGFjZXMoZ29vZ2xlRnVuY0RpY3QuZ2V0VXNlcigpKTtcblxuICAgICAgICAgICAgbGV0IGNlbGxzID0gdGhlQ2VsbHMuZmlsdGVyKGAuc2VsZWN0ZWRgKTtcbiAgICAgICAgICAgIGlmIChjZWxscy5lbXB0eSgpKSBhbGVydCgnWW91IGhhdmUgbm90IHNlbGVjdGVkIGFueSBzYW1wbGVzIHRvIGRvd25sb2FkLicpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0KCcjZmlyZS1jbG91ZC1mb3JtJykuc3R5bGUoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgc2VsZWN0KCcjc3VibWl0LXRvLWZpcmVjbG91ZC1idG4nKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQoJyNmaXJlLWNsb3VkLXN0YXR1cycpLmVtcHR5KCk7XG4gICAgICAgICAgICBsZXQgY2VsbHMgPSB0aGVDZWxscy5maWx0ZXIoYC5zZWxlY3RlZGApO1xuICAgICAgICAgICAgbGV0IGFsbFNlbGVjdGVkU2FtcGxlcyA9IFtdO1xuICAgICAgICAgICAgY2VsbHMuZWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFya2VyID0gc2VsZWN0KHRoaXMpLmF0dHIoJ2NsYXNzJykuc3BsaXQoJyAnKS5maWx0ZXIoKGMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGMgIT0gJ3NlbGVjdGVkJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBtYXQuWFtwYXJzZUludChtYXJrZXJbMF0ucmVwbGFjZSgneCcsICcnKSldLmlkO1xuICAgICAgICAgICAgICAgIGNvbnN0IHkgPSBtYXQuWVtwYXJzZUludChtYXJrZXJbMV0ucmVwbGFjZSgneScsICcnKSldLmlkO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEb3dubG9hZCAnICsgeCArICcgOiAnICsgeSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBtYXQuZGF0YS5maWx0ZXIoKHMpPT5zLmRhdGFUeXBlPT15JiZzLnRpc3N1ZUlkPT14JiZzLmRhdGFUeXBlIT0nV0VTJykubWFwKGQ9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gZC5zYW1wbGVJZC5zcGxpdCgnLScpO1xuICAgICAgICAgICAgICAgICAgICBkLmRvbm9ySWQgPSB0ZW1wWzBdICsgJy0nICsgdGVtcFsxXTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQ7XG4gICAgICAgICAgICAgICAgfSk7IC8vIE5PVEU6IGN1cnJlbnRseSB3ZSBkb24ndCBoYXZlIFdFUyBDUkFNIGZpbGUgcGF0aHNcbiAgICAgICAgICAgICAgICBhbGxTZWxlY3RlZFNhbXBsZXMgPSBhbGxTZWxlY3RlZFNhbXBsZXMuY29uY2F0KHNlbGVjdGVkKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhbGxTZWxlY3RlZFNhbXBsZXMubGVuZ3RoKTtcbiAgICAgICAgICAgIF9zdWJtaXRUb0ZpcmVDbG91ZChnb29nbGVGdW5jRGljdCwgYWxsU2VsZWN0ZWRTYW1wbGVzLCB1cmxzKTtcbiAgICAgICAgICAgIHNlbGVjdCgnI2ZpcmUtY2xvdWQtZm9ybScpLnN0eWxlKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgIH0pO1xuXG4gICAgc2VsZWN0KCcjY2FuY2VsLWZpcmVjbG91ZC1idG4nKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHNlbGVjdCgnI2ZpcmUtY2xvdWQtZm9ybScpLnN0eWxlKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgICAgICBhbGVydCgnQ2FuY2VsZWQhJyk7XG4gICAgICAgIH0pXG59XG5cbi8qKioqKiBGaXJlQ2xvdWQgQVBJICoqKioqL1xuLy8gcmVmZXJlbmNlOiB1c2UgdGhpcyBVUkwsIGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL29hdXRoMi92MS90b2tlbmluZm8/YWNjZXNzX3Rva2VuPU15QWNjZXNzVG9rZW4sIHRvIGNoZWNrIHRoZSBhY2Nlc3MgdG9rZW4gaW5mb1xuLy8gcmVmZXJlbmNlOiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9pZGVudGl0eS9zaWduLWluL3dlYi9idWlsZC1idXR0b25cbi8vIGRlcGVuZGVuY2llczogalF1ZXJ5XG5mdW5jdGlvbiBfcmVwb3J0QmlsbGluZ1Byb2plY3RzKGdvb2dsZVVzZXIsIGRvbUlkPVwiYmlsbGluZy1wcm9qZWN0LWxpc3RcIikge1xuXG4gICAgLy8gbGV0IHByb2ZpbGUgPSBnb29nbGVVc2VyLmdldEJhc2ljUHJvZmlsZSgpO1xuICAgIC8vIGNvbnNvbGUubG9nKCdJRDogJyArIHByb2ZpbGUuZ2V0SWQoKSk7XG4gICAgLy8gY29uc29sZS5sb2coJ05hbWU6ICcgKyBwcm9maWxlLmdldE5hbWUoKSk7XG4gICAgLy8gY29uc29sZS5sb2coJ0VtYWlsOiAnICsgcHJvZmlsZS5nZXRFbWFpbCgpKTtcbiAgICAvLyBnZXQgdGhlIHVzZXIncyBhY2Nlc3MgdG9rZW5cblxuICAgIGxldCB0b2tlbiA9IGdvb2dsZVVzZXIuZ2V0QXV0aFJlc3BvbnNlKHRydWUpLmFjY2Vzc190b2tlbjtcbiAgICBjb25zb2xlLmxvZyh0b2tlbik7XG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9hcGkuZmlyZWNsb3VkLm9yZy9hcGkvcHJvZmlsZS9iaWxsaW5nJyxcbiAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgIHhockZpZWxkczoge1xuICAgICAgICAgICAgd2l0aENyZWRlbnRpYWxzOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIHRva2VuKTtcbiAgICAgICAgfSxcbiAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04JyxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgLy8gQ2FuJ3QgZmlndXJlIG91dCBob3cgdG8gZ2VuZXJhdGUgdGhpcyBmb3JtIHVzaW5nIEQzLi4uIHNvIGhlcmUgSSdtIHVzaW5nIGpRdWVyeSBzeW50YXhcbiAgICAgICAgICAgICQoYCMke2RvbUlkfWApLmVtcHR5KCk7XG4gICAgICAgICAgICByZXNwb25zZS5mb3JFYWNoKChkKT0+e1xuICAgICAgICAgICAgICAgICQoJzxsYWJlbD4nICtcbiAgICAgICAgICAgICAgICAgICAgYDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwiYmlsbGluZy1wcm9qZWN0XCIgdmFsdWU9XCIke2QucHJvamVjdE5hbWV9XCI+IGAgK1xuICAgICAgICAgICAgICAgICAgICBkLnByb2plY3ROYW1lICtcbiAgICAgICAgICAgICAgICAgICAnPC9sYWJlbD48YnIvPidcbiAgICAgICAgICAgICAgICApLmFwcGVuZFRvKCQoYCMke2RvbUlkfWApKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZVswXSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gX3JlcG9ydFdvcmtzcGFjZXMoZ29vZ2xlVXNlcil7XG4gICAgbGV0IHRva2VuID0gZ29vZ2xlVXNlci5nZXRBdXRoUmVzcG9uc2UodHJ1ZSkuYWNjZXNzX3Rva2VuO1xuICAgICAvLyBsaXN0IFVzZXIncyB3b3Jrc3BhY2VzXG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9hcGkuZmlyZWNsb3VkLm9yZy9hcGkvd29ya3NwYWNlcycsXG4gICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICB4aHJGaWVsZHM6IHtcbiAgICAgICAgICAgIHdpdGhDcmVkZW50aWFsczogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyB0b2tlbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgY29uc3Qgd29ya3NwYWNlcyA9IHJlc3BvbnNlLmZpbHRlcigoZCk9PiFkLnB1YmxpYyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh3b3Jrc3BhY2VzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIF9zdWJtaXRUb0ZpcmVDbG91ZChnb29nbGVGdW5jRGljdCwgc2FtcGxlcywgdXJscyl7XG4gICAgY29uc3QgdG9rZW4gPSBnb29nbGVGdW5jRGljdC5nZXRVc2VyKCkuZ2V0QXV0aFJlc3BvbnNlKHRydWUpLmFjY2Vzc190b2tlbjtcbiAgICBjb25zdCBuYW1lc3BhY2UgPSAkKCdpbnB1dFtuYW1lPVwiYmlsbGluZy1wcm9qZWN0XCJdJykudmFsKCk7XG4gICAgY29uc3Qgd29ya3NwYWNlID0gJCgnaW5wdXRbbmFtZT1cIndvcmtzcGFjZVwiXScpLnZhbCgpO1xuICAgIGlmKG5hbWVzcGFjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGFsZXJ0KCdZb3UgbXVzdCBwcm92aWRlIGEgYmlsbGluIHByb2plY3QnKTtcbiAgICAgICAgdGhyb3coXCJiaWxsaW5nIHByb2plY3QgaXMgbm90IHByb3ZpZGVkXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh3b3Jrc3BhY2UgPT09IHVuZGVmaW5lZCB8fCB3b3Jrc3BhY2UgPT0gJycpe1xuICAgICAgICBhbGVydCgnWW91IG11c3QgcHJvdmlkZSBhIG5ldyB3b3Jrc3BhY2UgbmFtZScpO1xuICAgICAgICB0aHJvdygnd29ya3NwYWNlIG5hbWUgaXMgbm90IHByb3ZpZGVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc29sZS5sb2cod29ya3NwYWNlKTtcbiAgICBjb25zb2xlLmxvZyhzYW1wbGVzKTtcbiAgICAkKCcjc3Bpbm5lcicpLnNob3coKTtcbiAgICAvLyBjcmVhdGUgdGhlIHdvcmtzcGFjZVxuICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdXJscy5mY1dvcmtTcGFjZSxcbiAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICB4aHJGaWVsZHM6IHtcbiAgICAgICAgICAgIHdpdGhDcmVkZW50aWFsczogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyB0b2tlbik7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcsXG4gICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIFwibmFtZXNwYWNlXCI6IG5hbWVzcGFjZSxcbiAgICAgICAgICAgIFwibmFtZVwiOiB3b3Jrc3BhY2UsXG4gICAgICAgICAgICBcImF0dHJpYnV0ZXNcIjoge30sXG4gICAgICAgICAgICBcImF1dGhvcml6YXRpb25Eb21haW5cIjogW11cbiAgICAgICAgfSksXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXsgLy8gY2FsbGJhY2sgZnVuY3Rpb24gYWZ0ZXIgd29ya3NwYWNlIGlzIGNyZWF0ZWRcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmluaXNoZWQgY3JlYXRpbmcgd29ya3NwYWNlLi4uXCIpO1xuICAgICAgICAgICAgY29uc3QgZG9ub3JzID0gc2FtcGxlcy5tYXAoZD0+e1xuICAgICAgICAgICAgICAgIGlmICghZC5oYXNPd25Qcm9wZXJ0eSgnZG9ub3JJZCcpKSB0aHJvdyAnU2FtcGxlIGRvZXMgbm90IGNvbnRhaW4gYXR0ciBkb25vcklkLic7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQuZG9ub3JJZDtcbiAgICAgICAgICAgIH0pLmZpbHRlcigoZCwgaSwgYSkgPT4gYS5pbmRleE9mKGQpID09PSBpKTsgLy8gb2J0YWluIHVuaXF1ZSBkb25vcnNcbiAgICAgICAgICAgIGNvbnN0IGRvbm9yRW50aXR5U3RyaW5nID0gYGVudGl0aWVzPWVudGl0eTpwYXJ0aWNpcGFudF9pZFxcbiR7ZG9ub3JzLmpvaW4oJ1xcbicpfVxcbmA7XG4gICAgICAgICAgICBjb25zdCBkb25vckVudGl0eVVybEVuY29kZSA9IGVuY29kZVVSSShkb25vckVudGl0eVN0cmluZyk7XG5cbiAgICAgICAgICAgIC8vIHN1Ym1pdHRpbmcgcGFydGljaXBhbnQgSURzXG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogYCR7dXJscy5mY1dvcmtTcGFjZX0vJHtuYW1lc3BhY2V9LyR7d29ya3NwYWNlfS9pbXBvcnRFbnRpdGllc2AsXG4gICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHhockZpZWxkczoge1xuICAgICAgICAgICAgICAgICAgICB3aXRoQ3JlZGVudGlhbHM6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgdG9rZW4pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAndGV4dCcsXG4gICAgICAgICAgICAgICAgZGF0YTogZG9ub3JFbnRpdHlVcmxFbmNvZGUsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgICAgICAkKCcjc3Bpbm5lcicpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZmluYWxseSwgc3VibWl0dGluZyBzYW1wbGVzXG4gICAgICAgICAgICAgICAgICAgIC8vIHByZXBhcmUgdGhlIHNhbXBsZUVudGl0eVN0cmluZyBmb3IgRmlyZUNsb3VkIEFQSVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmlzaGVkIGltcG9ydGluZyBwYXJ0aWNpcGFudCBJRHMuLi5cIik7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzYW1wbGVFbnRpdHkgPSBbWydlbnRpdHk6c2FtcGxlX2lkJywgJ3BhcnRpY2lwYW50X2lkJywgJ3NhbXBsZV90eXBlJywgJ2JhbV9maWxlJywgJ2JhbV9pbmRleCddLmpvaW4oJ1xcdCcpXTtcbiAgICAgICAgICAgICAgICAgICAgc2FtcGxlRW50aXR5ID0gc2FtcGxlRW50aXR5LmNvbmNhdChzYW1wbGVzLm1hcChkPT57XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZC5jcmFtRmlsZSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBcIkRhdGEgRXJyb3I6IFwiICsgZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFkLmNyYW1GaWxlLmhhc093blByb3BlcnR5KCdjcmFtX2ZpbGUnKSkgdGhyb3cgXCJEYXRhIEVycm9yOiBcIiArIGQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiB1c2UgY3JhbUZpbGUuc2FtcGxlX2lkIGluc3RlYWQgb2YgZC5zYW1wbGVJZCB0byBwcmVzZXJ2ZSB0aGUgb2NjYXNpb25hbCBtaXhlZCBjYXNlIHNhbXBsZSBJRHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbZC5jcmFtRmlsZS5zYW1wbGVfaWQsIGQuZG9ub3JJZCwgZC5kYXRhVHlwZSwgZC5jcmFtRmlsZS5jcmFtX2ZpbGUsIGQuY3JhbUZpbGUuY3JhbV9pbmRleF0uam9pbignXFx0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2FtcGxlRW50aXR5U3RyaW5nID0gYGVudGl0aWVzPSR7c2FtcGxlRW50aXR5LmpvaW4oJ1xcbicpfVxcbmA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhbXBsZUVudGl0eVVybEVuY29kZSA9IGVuY29kZVVSSShzYW1wbGVFbnRpdHlTdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzYW1wbGVFbnRpdHlTdHJpbmcpO1xuXG4gICAgICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGAke3VybHMuZmNXb3JrU3BhY2V9LyR7bmFtZXNwYWNlfS8ke3dvcmtzcGFjZX0vaW1wb3J0RW50aXRpZXNgLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyRmllbGRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aENyZWRlbnRpYWxzOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZm9yZVNlbmQ6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArIHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogc2FtcGxlRW50aXR5VXJsRW5jb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmluaXNoZWQgaW1wb3J0aW5nIHNhbXBsZXMuLi5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmNVUkwgPSBgJHt1cmxzLmZjUG9ydGFsV29ya1NwYWNlfS8ke25hbWVzcGFjZX0vJHt3b3Jrc3BhY2V9L2RhdGFgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNmaXJlLWNsb3VkLXN0YXR1cycpLmh0bWwoYFN1Ym1pdHRlZCEgPGJyLz4gR28gdG8geW91ciA8YnIvPiA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiJHtmY1VSTH1cIj5GaXJlQ2xvdWQgd29ya3NwYWNlPC9hPmApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcil7Y29uc29sZS5lcnJvcihlcnJvcil9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKXtjb25zb2xlLmVycm9yKGVycm9yKX1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3Ipe2NvbnNvbGUuZXJyb3IoZXJyb3IpfVxuICAgIH0pO1xufVxuXG5cblxuXG4iXSwibmFtZXMiOlsiY3N2IiwiZHN2IiwidHN2IiwibWF0Y2hlciIsInNlbGVjdGlvbiIsImVsZW1lbnQiLCJyZW5kZXJTaWduSW5CdXR0b24iLCJzaWduT3V0Il0sIm1hcHBpbmdzIjoiOzs7QUFBQSxJQUFJLEdBQUcsR0FBRyxFQUFFO0lBQ1IsR0FBRyxHQUFHLEVBQUU7SUFDUixLQUFLLEdBQUcsRUFBRTtJQUNWLE9BQU8sR0FBRyxFQUFFO0lBQ1osTUFBTSxHQUFHLEVBQUUsQ0FBQzs7QUFFaEIsU0FBUyxlQUFlLENBQUMsT0FBTyxFQUFFO0VBQ2hDLE9BQU8sSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFVB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
