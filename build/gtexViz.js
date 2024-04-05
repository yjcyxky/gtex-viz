'use strict';

function ascending$1(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function bisector(compare) {
  if (compare.length === 1) compare = ascendingComparator(compare);
  return {
    left: function(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) < 0) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    },
    right: function(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) > 0) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }
  };
}

function ascendingComparator(f) {
  return function(d, x) {
    return ascending$1(f(d), x);
  };
}

var ascendingBisect = bisector(ascending$1);
var bisectRight = ascendingBisect.right;

function number$2(x) {
  return x === null ? NaN : +x;
}

function variance(values, valueof) {
  var n = values.length,
      m = 0,
      i = -1,
      mean = 0,
      value,
      delta,
      sum = 0;

  if (valueof == null) {
    while (++i < n) {
      if (!isNaN(value = number$2(values[i]))) {
        delta = value - mean;
        mean += delta / ++m;
        sum += delta * (value - mean);
      }
    }
  }

  else {
    while (++i < n) {
      if (!isNaN(value = number$2(valueof(values[i], i, values)))) {
        delta = value - mean;
        mean += delta / ++m;
        sum += delta * (value - mean);
      }
    }
  }

  if (m > 1) return sum / (m - 1);
}

function deviation(array, f) {
  var v = variance(array, f);
  return v ? Math.sqrt(v) : v;
}

function extent(values, valueof) {
  var n = values.length,
      i = -1,
      value,
      min,
      max;

  if (valueof == null) {
    while (++i < n) { // Find the first comparable value.
      if ((value = values[i]) != null && value >= value) {
        min = max = value;
        while (++i < n) { // Compare the remaining values.
          if ((value = values[i]) != null) {
            if (min > value) min = value;
            if (max < value) max = value;
          }
        }
      }
    }
  }

  else {
    while (++i < n) { // Find the first comparable value.
      if ((value = valueof(values[i], i, values)) != null && value >= value) {
        min = max = value;
        while (++i < n) { // Compare the remaining values.
          if ((value = valueof(values[i], i, values)) != null) {
            if (min > value) min = value;
            if (max < value) max = value;
          }
        }
      }
    }
  }

  return [min, max];
}

function range(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

  var i = -1,
      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
      range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }

  return range;
}

var e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);

function ticks(start, stop, count) {
  var reverse,
      i = -1,
      n,
      ticks,
      step;

  stop = +stop, start = +start, count = +count;
  if (start === stop && count > 0) return [start];
  if (reverse = stop < start) n = start, start = stop, stop = n;
  if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

  if (step > 0) {
    start = Math.ceil(start / step);
    stop = Math.floor(stop / step);
    ticks = new Array(n = Math.ceil(stop - start + 1));
    while (++i < n) ticks[i] = (start + i) * step;
  } else {
    start = Math.floor(start * step);
    stop = Math.ceil(stop * step);
    ticks = new Array(n = Math.ceil(start - stop + 1));
    while (++i < n) ticks[i] = (start - i) / step;
  }

  if (reverse) ticks.reverse();

  return ticks;
}

function tickIncrement(start, stop, count) {
  var step = (stop - start) / Math.max(0, count),
      power = Math.floor(Math.log(step) / Math.LN10),
      error = step / Math.pow(10, power);
  return power >= 0
      ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
      : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}

function tickStep(start, stop, count) {
  var step0 = Math.abs(stop - start) / Math.max(0, count),
      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
      error = step0 / step1;
  if (error >= e10) step1 *= 10;
  else if (error >= e5) step1 *= 5;
  else if (error >= e2) step1 *= 2;
  return stop < start ? -step1 : step1;
}

function quantile(values, p, valueof) {
  if (valueof == null) valueof = number$2;
  if (!(n = values.length)) return;
  if ((p = +p) <= 0 || n < 2) return +valueof(values[0], 0, values);
  if (p >= 1) return +valueof(values[n - 1], n - 1, values);
  var n,
      i = (n - 1) * p,
      i0 = Math.floor(i),
      value0 = +valueof(values[i0], i0, values),
      value1 = +valueof(values[i0 + 1], i0 + 1, values);
  return value0 + (value1 - value0) * (i - i0);
}

function max$1(values, valueof) {
  var n = values.length,
      i = -1,
      value,
      max;

  if (valueof == null) {
    while (++i < n) { // Find the first comparable value.
      if ((value = values[i]) != null && value >= value) {
        max = value;
        while (++i < n) { // Compare the remaining values.
          if ((value = values[i]) != null && value > max) {
            max = value;
          }
        }
      }
    }
  }

  else {
    while (++i < n) { // Find the first comparable value.
      if ((value = valueof(values[i], i, values)) != null && value >= value) {
        max = value;
        while (++i < n) { // Compare the remaining values.
          if ((value = valueof(values[i], i, values)) != null && value > max) {
            max = value;
          }
        }
      }
    }
  }

  return max;
}

function mean(values, valueof) {
  var n = values.length,
      m = n,
      i = -1,
      value,
      sum = 0;

  if (valueof == null) {
    while (++i < n) {
      if (!isNaN(value = number$2(values[i]))) sum += value;
      else --m;
    }
  }

  else {
    while (++i < n) {
      if (!isNaN(value = number$2(valueof(values[i], i, values)))) sum += value;
      else --m;
    }
  }

  if (m) return sum / m;
}

function median(values, valueof) {
  var n = values.length,
      i = -1,
      value,
      numbers = [];

  if (valueof == null) {
    while (++i < n) {
      if (!isNaN(value = number$2(values[i]))) {
        numbers.push(value);
      }
    }
  }

  else {
    while (++i < n) {
      if (!isNaN(value = number$2(valueof(values[i], i, values)))) {
        numbers.push(value);
      }
    }
  }

  return quantile(numbers.sort(ascending$1), 0.5);
}

function min$1(values, valueof) {
  var n = values.length,
      i = -1,
      value,
      min;

  if (valueof == null) {
    while (++i < n) { // Find the first comparable value.
      if ((value = values[i]) != null && value >= value) {
        min = value;
        while (++i < n) { // Compare the remaining values.
          if ((value = values[i]) != null && min > value) {
            min = value;
          }
        }
      }
    }
  }

  else {
    while (++i < n) { // Find the first comparable value.
      if ((value = valueof(values[i], i, values)) != null && value >= value) {
        min = value;
        while (++i < n) { // Compare the remaining values.
          if ((value = valueof(values[i], i, values)) != null && min > value) {
            min = value;
          }
        }
      }
    }
  }

  return min;
}

function sum(values, valueof) {
  var n = values.length,
      i = -1,
      value,
      sum = 0;

  if (valueof == null) {
    while (++i < n) {
      if (value = +values[i]) sum += value; // Note: zero and null are equivalent.
    }
  }

  else {
    while (++i < n) {
      if (value = +valueof(values[i], i, values)) sum += value;
    }
  }

  return sum;
}

var xhtml = "http://www.w3.org/1999/xhtml";

var namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

function namespace(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
}

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

function creator(name) {
  var fullname = namespace(name);
  return (fullname.local
      ? creatorFixed
      : creatorInherit)(fullname);
}

function none() {}

function selector(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
}

function selection_select(select) {
  if (typeof select !== "function") select = selector(select);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }

  return new Selection$1(subgroups, this._parents);
}

function empty$1() {
  return [];
}

function selectorAll(selector) {
  return selector == null ? empty$1 : function() {
    return this.querySelectorAll(selector);
  };
}

function selection_selectAll(select) {
  if (typeof select !== "function") select = selectorAll(select);

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }

  return new Selection$1(subgroups, parents);
}

function matcher(selector) {
  return function() {
    return this.matches(selector);
  };
}

function selection_filter(match) {
  if (typeof match !== "function") match = matcher(match);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new Selection$1(subgroups, this._parents);
}

function sparse(update) {
  return new Array(update.length);
}

function selection_enter() {
  return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
}

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

function constant$4(x) {
  return function() {
    return x;
  };
}

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

function selection_data(value, key) {
  if (!value) {
    data = new Array(this.size()), j = -1;
    this.each(function(d) { data[++j] = d; });
    return data;
  }

  var bind = key ? bindKey : bindIndex,
      parents = this._parents,
      groups = this._groups;

  if (typeof value !== "function") value = constant$4(value);

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

  update = new Selection$1(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}

function selection_exit() {
  return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
}

function selection_join(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
  if (onupdate != null) update = onupdate(update);
  if (onexit == null) exit.remove(); else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}

function selection_merge(selection) {

  for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new Selection$1(merges, this._parents);
}

function selection_order() {

  for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }

  return this;
}

function selection_sort(compare) {
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

  return new Selection$1(sortgroups, this._parents).order();
}

function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function selection_call() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}

function selection_nodes() {
  var nodes = new Array(this.size()), i = -1;
  this.each(function() { nodes[++i] = this; });
  return nodes;
}

function selection_node() {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }

  return null;
}

function selection_size() {
  var size = 0;
  this.each(function() { ++size; });
  return size;
}

function selection_empty() {
  return !this.node();
}

function selection_each(callback) {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }

  return this;
}

function attrRemove$1(name) {
  return function() {
    this.removeAttribute(name);
  };
}

function attrRemoveNS$1(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}

function attrConstant$1(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}

function attrConstantNS$1(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}

function attrFunction$1(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);
    else this.setAttribute(name, v);
  };
}

function attrFunctionNS$1(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}

function selection_attr(name, value) {
  var fullname = namespace(name);

  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local
        ? node.getAttributeNS(fullname.space, fullname.local)
        : node.getAttribute(fullname);
  }

  return this.each((value == null
      ? (fullname.local ? attrRemoveNS$1 : attrRemove$1) : (typeof value === "function"
      ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)
      : (fullname.local ? attrConstantNS$1 : attrConstant$1)))(fullname, value));
}

function defaultView(node) {
  return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
      || (node.document && node) // node is a Window
      || node.defaultView; // node is a Document
}

function styleRemove$1(name) {
  return function() {
    this.style.removeProperty(name);
  };
}

function styleConstant$1(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}

function styleFunction$1(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v, priority);
  };
}

function selection_style(name, value, priority) {
  return arguments.length > 1
      ? this.each((value == null
            ? styleRemove$1 : typeof value === "function"
            ? styleFunction$1
            : styleConstant$1)(name, value, priority == null ? "" : priority))
      : styleValue(this.node(), name);
}

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

function selection_property(name, value) {
  return arguments.length > 1
      ? this.each((value == null
          ? propertyRemove : typeof value === "function"
          ? propertyFunction
          : propertyConstant)(name, value))
      : this.node()[name];
}

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

function selection_classed(name, value) {
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
}

function textRemove() {
  this.textContent = "";
}

function textConstant$1(value) {
  return function() {
    this.textContent = value;
  };
}

function textFunction$1(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}

function selection_text(value) {
  return arguments.length
      ? this.each(value == null
          ? textRemove : (typeof value === "function"
          ? textFunction$1
          : textConstant$1)(value))
      : this.node().textContent;
}

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

function selection_html(value) {
  return arguments.length
      ? this.each(value == null
          ? htmlRemove : (typeof value === "function"
          ? htmlFunction
          : htmlConstant)(value))
      : this.node().innerHTML;
}

function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}

function selection_raise() {
  return this.each(raise);
}

function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}

function selection_lower() {
  return this.each(lower);
}

function selection_append(name) {
  var create = typeof name === "function" ? name : creator(name);
  return this.select(function() {
    return this.appendChild(create.apply(this, arguments));
  });
}

function constantNull() {
  return null;
}

function selection_insert(name, before) {
  var create = typeof name === "function" ? name : creator(name),
      select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function() {
    return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
  });
}

function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}

function selection_remove() {
  return this.each(remove);
}

function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}

function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}

function selection_clone(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}

function selection_datum(value) {
  return arguments.length
      ? this.property("__data__", value)
      : this.node().__data__;
}

var filterEvents = {};

var event = null;

if (typeof document !== "undefined") {
  var element = document.documentElement;
  if (!("onmouseenter" in element)) {
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
    var event0 = event; // Events can be reentrant (e.g., focus).
    event = event1;
    try {
      listener.call(this, this.__data__, index, group);
    } finally {
      event = event0;
    }
  };
}

function parseTypenames$1(typenames) {
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

function selection_on(typename, value, capture) {
  var typenames = parseTypenames$1(typename + ""), i, n = typenames.length, t;

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
}

function customEvent(event1, listener, that, args) {
  var event0 = event;
  event1.sourceEvent = event;
  event = event1;
  try {
    return listener.apply(that, args);
  } finally {
    event = event0;
  }
}

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

function selection_dispatch(type, params) {
  return this.each((typeof params === "function"
      ? dispatchFunction
      : dispatchConstant)(type, params));
}

var root = [null];

function Selection$1(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}

function selection() {
  return new Selection$1([[document.documentElement]], root);
}

Selection$1.prototype = selection.prototype = {
  constructor: Selection$1,
  select: selection_select,
  selectAll: selection_selectAll,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  join: selection_join,
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

function select(selector) {
  return typeof selector === "string"
      ? new Selection$1([[document.querySelector(selector)]], [document.documentElement])
      : new Selection$1([[selector]], root);
}

function sourceEvent() {
  var current = event, source;
  while (source = current.sourceEvent) current = source;
  return current;
}

function point$1(node, event) {
  var svg = node.ownerSVGElement || node;

  if (svg.createSVGPoint) {
    var point = svg.createSVGPoint();
    point.x = event.clientX, point.y = event.clientY;
    point = point.matrixTransform(node.getScreenCTM().inverse());
    return [point.x, point.y];
  }

  var rect = node.getBoundingClientRect();
  return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
}

function mouse(node) {
  var event = sourceEvent();
  if (event.changedTouches) event = event.changedTouches[0];
  return point$1(node, event);
}

function selectAll(selector) {
  return typeof selector === "string"
      ? new Selection$1([document.querySelectorAll(selector)], [document.documentElement])
      : new Selection$1([selector == null ? [] : selector], root);
}

function touch(node, touches, identifier) {
  if (arguments.length < 3) identifier = touches, touches = sourceEvent().changedTouches;

  for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
    if ((touch = touches[i]).identifier === identifier) {
      return point$1(node, touch);
    }
  }

  return null;
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var jquery = {exports: {}};

/*!
 * jQuery JavaScript Library v3.7.1
 * https://jquery.com/
 *
 * Copyright OpenJS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2023-08-28T13:37Z
 */

(function (module) {
	( function( global, factory ) {

		{

			// For CommonJS and CommonJS-like environments where a proper `window`
			// is present, execute the factory and get jQuery.
			// For environments that do not have a `window` with a `document`
			// (such as Node.js), expose a factory as module.exports.
			// This accentuates the need for the creation of a real `window`.
			// e.g. var jQuery = require("jquery")(window);
			// See ticket trac-14549 for more info.
			module.exports = global.document ?
				factory( global, true ) :
				function( w ) {
					if ( !w.document ) {
						throw new Error( "jQuery requires a window with a document" );
					}
					return factory( w );
				};
		}

	// Pass this if window is not defined yet
	} )( typeof window !== "undefined" ? window : commonjsGlobal, function( window, noGlobal ) {

	var arr = [];

	var getProto = Object.getPrototypeOf;

	var slice = arr.slice;

	var flat = arr.flat ? function( array ) {
		return arr.flat.call( array );
	} : function( array ) {
		return arr.concat.apply( [], array );
	};


	var push = arr.push;

	var indexOf = arr.indexOf;

	var class2type = {};

	var toString = class2type.toString;

	var hasOwn = class2type.hasOwnProperty;

	var fnToString = hasOwn.toString;

	var ObjectFunctionString = fnToString.call( Object );

	var support = {};

	var isFunction = function isFunction( obj ) {

			// Support: Chrome <=57, Firefox <=52
			// In some browsers, typeof returns "function" for HTML <object> elements
			// (i.e., `typeof document.createElement( "object" ) === "function"`).
			// We don't want to classify *any* DOM node as a function.
			// Support: QtWeb <=3.8.5, WebKit <=534.34, wkhtmltopdf tool <=0.12.5
			// Plus for old WebKit, typeof returns "function" for HTML collections
			// (e.g., `typeof document.getElementsByTagName("div") === "function"`). (gh-4756)
			return typeof obj === "function" && typeof obj.nodeType !== "number" &&
				typeof obj.item !== "function";
		};


	var isWindow = function isWindow( obj ) {
			return obj != null && obj === obj.window;
		};


	var document = window.document;



		var preservedScriptAttributes = {
			type: true,
			src: true,
			nonce: true,
			noModule: true
		};

		function DOMEval( code, node, doc ) {
			doc = doc || document;

			var i, val,
				script = doc.createElement( "script" );

			script.text = code;
			if ( node ) {
				for ( i in preservedScriptAttributes ) {

					// Support: Firefox 64+, Edge 18+
					// Some browsers don't support the "nonce" property on scripts.
					// On the other hand, just using `getAttribute` is not enough as
					// the `nonce` attribute is reset to an empty string whenever it
					// becomes browsing-context connected.
					// See https://github.com/whatwg/html/issues/2369
					// See https://html.spec.whatwg.org/#nonce-attributes
					// The `node.getAttribute` check was added for the sake of
					// `jQuery.globalEval` so that it can fake a nonce-containing node
					// via an object.
					val = node[ i ] || node.getAttribute && node.getAttribute( i );
					if ( val ) {
						script.setAttribute( i, val );
					}
				}
			}
			doc.head.appendChild( script ).parentNode.removeChild( script );
		}


	function toType( obj ) {
		if ( obj == null ) {
			return obj + "";
		}

		// Support: Android <=2.3 only (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	}
	/* global Symbol */
	// Defining this global in .eslintrc.json would create a danger of using the global
	// unguarded in another place, it seems safer to define global only for this module



	var version = "3.7.1",

		rhtmlSuffix = /HTML$/i,

		// Define a local copy of jQuery
		jQuery = function( selector, context ) {

			// The jQuery object is actually just the init constructor 'enhanced'
			// Need init if jQuery is called (just allow error to be thrown if not included)
			return new jQuery.fn.init( selector, context );
		};

	jQuery.fn = jQuery.prototype = {

		// The current version of jQuery being used
		jquery: version,

		constructor: jQuery,

		// The default length of a jQuery object is 0
		length: 0,

		toArray: function() {
			return slice.call( this );
		},

		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function( num ) {

			// Return all the elements in a clean array
			if ( num == null ) {
				return slice.call( this );
			}

			// Return just the one element from the set
			return num < 0 ? this[ num + this.length ] : this[ num ];
		},

		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function( elems ) {

			// Build a new jQuery matched element set
			var ret = jQuery.merge( this.constructor(), elems );

			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;

			// Return the newly-formed element set
			return ret;
		},

		// Execute a callback for every element in the matched set.
		each: function( callback ) {
			return jQuery.each( this, callback );
		},

		map: function( callback ) {
			return this.pushStack( jQuery.map( this, function( elem, i ) {
				return callback.call( elem, i, elem );
			} ) );
		},

		slice: function() {
			return this.pushStack( slice.apply( this, arguments ) );
		},

		first: function() {
			return this.eq( 0 );
		},

		last: function() {
			return this.eq( -1 );
		},

		even: function() {
			return this.pushStack( jQuery.grep( this, function( _elem, i ) {
				return ( i + 1 ) % 2;
			} ) );
		},

		odd: function() {
			return this.pushStack( jQuery.grep( this, function( _elem, i ) {
				return i % 2;
			} ) );
		},

		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
		},

		end: function() {
			return this.prevObject || this.constructor();
		},

		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: arr.sort,
		splice: arr.splice
	};

	jQuery.extend = jQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[ 0 ] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;

			// Skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !isFunction( target ) ) {
			target = {};
		}

		// Extend jQuery itself if only one argument is passed
		if ( i === length ) {
			target = this;
			i--;
		}

		for ( ; i < length; i++ ) {

			// Only deal with non-null/undefined values
			if ( ( options = arguments[ i ] ) != null ) {

				// Extend the base object
				for ( name in options ) {
					copy = options[ name ];

					// Prevent Object.prototype pollution
					// Prevent never-ending loop
					if ( name === "__proto__" || target === copy ) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
						( copyIsArray = Array.isArray( copy ) ) ) ) {
						src = target[ name ];

						// Ensure proper type for the source value
						if ( copyIsArray && !Array.isArray( src ) ) {
							clone = [];
						} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
							clone = {};
						} else {
							clone = src;
						}
						copyIsArray = false;

						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );

					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	jQuery.extend( {

		// Unique for each copy of jQuery on the page
		expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

		// Assume jQuery is ready without the ready module
		isReady: true,

		error: function( msg ) {
			throw new Error( msg );
		},

		noop: function() {},

		isPlainObject: function( obj ) {
			var proto, Ctor;

			// Detect obvious negatives
			// Use toString instead of jQuery.type to catch host objects
			if ( !obj || toString.call( obj ) !== "[object Object]" ) {
				return false;
			}

			proto = getProto( obj );

			// Objects with no prototype (e.g., `Object.create( null )`) are plain
			if ( !proto ) {
				return true;
			}

			// Objects with prototype are plain iff they were constructed by a global Object function
			Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
			return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
		},

		isEmptyObject: function( obj ) {
			var name;

			for ( name in obj ) {
				return false;
			}
			return true;
		},

		// Evaluates a script in a provided context; falls back to the global one
		// if not specified.
		globalEval: function( code, options, doc ) {
			DOMEval( code, { nonce: options && options.nonce }, doc );
		},

		each: function( obj, callback ) {
			var length, i = 0;

			if ( isArrayLike( obj ) ) {
				length = obj.length;
				for ( ; i < length; i++ ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			}

			return obj;
		},


		// Retrieve the text value of an array of DOM nodes
		text: function( elem ) {
			var node,
				ret = "",
				i = 0,
				nodeType = elem.nodeType;

			if ( !nodeType ) {

				// If no nodeType, this is expected to be an array
				while ( ( node = elem[ i++ ] ) ) {

					// Do not traverse comment nodes
					ret += jQuery.text( node );
				}
			}
			if ( nodeType === 1 || nodeType === 11 ) {
				return elem.textContent;
			}
			if ( nodeType === 9 ) {
				return elem.documentElement.textContent;
			}
			if ( nodeType === 3 || nodeType === 4 ) {
				return elem.nodeValue;
			}

			// Do not include comment or processing instruction nodes

			return ret;
		},

		// results is for internal usage only
		makeArray: function( arr, results ) {
			var ret = results || [];

			if ( arr != null ) {
				if ( isArrayLike( Object( arr ) ) ) {
					jQuery.merge( ret,
						typeof arr === "string" ?
							[ arr ] : arr
					);
				} else {
					push.call( ret, arr );
				}
			}

			return ret;
		},

		inArray: function( elem, arr, i ) {
			return arr == null ? -1 : indexOf.call( arr, elem, i );
		},

		isXMLDoc: function( elem ) {
			var namespace = elem && elem.namespaceURI,
				docElem = elem && ( elem.ownerDocument || elem ).documentElement;

			// Assume HTML when documentElement doesn't yet exist, such as inside
			// document fragments.
			return !rhtmlSuffix.test( namespace || docElem && docElem.nodeName || "HTML" );
		},

		// Support: Android <=4.0 only, PhantomJS 1 only
		// push.apply(_, arraylike) throws on ancient WebKit
		merge: function( first, second ) {
			var len = +second.length,
				j = 0,
				i = first.length;

			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}

			first.length = i;

			return first;
		},

		grep: function( elems, callback, invert ) {
			var callbackInverse,
				matches = [],
				i = 0,
				length = elems.length,
				callbackExpect = !invert;

			// Go through the array, only saving the items
			// that pass the validator function
			for ( ; i < length; i++ ) {
				callbackInverse = !callback( elems[ i ], i );
				if ( callbackInverse !== callbackExpect ) {
					matches.push( elems[ i ] );
				}
			}

			return matches;
		},

		// arg is for internal usage only
		map: function( elems, callback, arg ) {
			var length, value,
				i = 0,
				ret = [];

			// Go through the array, translating each of the items to their new values
			if ( isArrayLike( elems ) ) {
				length = elems.length;
				for ( ; i < length; i++ ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}

			// Go through every key on the object,
			} else {
				for ( i in elems ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}
			}

			// Flatten any nested arrays
			return flat( ret );
		},

		// A global GUID counter for objects
		guid: 1,

		// jQuery.support is not used in Core but other projects attach their
		// properties to it so it needs to exist.
		support: support
	} );

	if ( typeof Symbol === "function" ) {
		jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
	}

	// Populate the class2type map
	jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
		function( _i, name ) {
			class2type[ "[object " + name + "]" ] = name.toLowerCase();
		} );

	function isArrayLike( obj ) {

		// Support: real iOS 8.2 only (not reproducible in simulator)
		// `in` check used to prevent JIT error (gh-2145)
		// hasOwn isn't used here due to false negatives
		// regarding Nodelist length in IE
		var length = !!obj && "length" in obj && obj.length,
			type = toType( obj );

		if ( isFunction( obj ) || isWindow( obj ) ) {
			return false;
		}

		return type === "array" || length === 0 ||
			typeof length === "number" && length > 0 && ( length - 1 ) in obj;
	}


	function nodeName( elem, name ) {

		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

	}
	var pop = arr.pop;


	var sort = arr.sort;


	var splice = arr.splice;


	var whitespace = "[\\x20\\t\\r\\n\\f]";


	var rtrimCSS = new RegExp(
		"^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$",
		"g"
	);




	// Note: an element does not contain itself
	jQuery.contains = function( a, b ) {
		var bup = b && b.parentNode;

		return a === bup || !!( bup && bup.nodeType === 1 && (

			// Support: IE 9 - 11+
			// IE doesn't have `contains` on SVG.
			a.contains ?
				a.contains( bup ) :
				a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
		) );
	};




	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	var rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;

	function fcssescape( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	}

	jQuery.escapeSelector = function( sel ) {
		return ( sel + "" ).replace( rcssescape, fcssescape );
	};




	var preferredDoc = document,
		pushNative = push;

	( function() {

	var i,
		Expr,
		outermostContext,
		sortInput,
		hasDuplicate,
		push = pushNative,

		// Local document vars
		document,
		documentElement,
		documentIsHTML,
		rbuggyQSA,
		matches,

		// Instance-specific data
		expando = jQuery.expando,
		dirruns = 0,
		done = 0,
		classCache = createCache(),
		tokenCache = createCache(),
		compilerCache = createCache(),
		nonnativeSelectorCache = createCache(),
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
			}
			return 0;
		},

		booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|" +
			"loop|multiple|open|readonly|required|scoped",

		// Regular expressions

		// https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
		identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace +
			"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",

		// Attribute selectors: https://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +

			// Operator (capture 2)
			"*([*^$|!~]?=)" + whitespace +

			// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
			"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" +
			whitespace + "*\\]",

		pseudos = ":(" + identifier + ")(?:\\((" +

			// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
			// 1. quoted (capture 3; capture 4 or capture 5)
			"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +

			// 2. simple (capture 6)
			"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +

			// 3. anything else (capture 2)
			".*" +
			")\\)|)",

		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rwhitespace = new RegExp( whitespace + "+", "g" ),

		rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
		rleadingCombinator = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" +
			whitespace + "*" ),
		rdescend = new RegExp( whitespace + "|>" ),

		rpseudo = new RegExp( pseudos ),
		ridentifier = new RegExp( "^" + identifier + "$" ),

		matchExpr = {
			ID: new RegExp( "^#(" + identifier + ")" ),
			CLASS: new RegExp( "^\\.(" + identifier + ")" ),
			TAG: new RegExp( "^(" + identifier + "|[*])" ),
			ATTR: new RegExp( "^" + attributes ),
			PSEUDO: new RegExp( "^" + pseudos ),
			CHILD: new RegExp(
				"^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
					whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" +
					whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
			bool: new RegExp( "^(?:" + booleans + ")$", "i" ),

			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			needsContext: new RegExp( "^" + whitespace +
				"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
				"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
		},

		rinputs = /^(?:input|select|textarea|button)$/i,
		rheader = /^h\d$/i,

		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

		rsibling = /[+~]/,

		// CSS escapes
		// https://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		runescape = new RegExp( "\\\\[\\da-fA-F]{1,6}" + whitespace +
			"?|\\\\([^\\r\\n\\f])", "g" ),
		funescape = function( escape, nonHex ) {
			var high = "0x" + escape.slice( 1 ) - 0x10000;

			if ( nonHex ) {

				// Strip the backslash prefix from a non-hex escape sequence
				return nonHex;
			}

			// Replace a hexadecimal escape sequence with the encoded Unicode code point
			// Support: IE <=11+
			// For values outside the Basic Multilingual Plane (BMP), manually construct a
			// surrogate pair
			return high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
		},

		// Used for iframes; see `setDocument`.
		// Support: IE 9 - 11+, Edge 12 - 18+
		// Removing the function wrapper causes a "Permission Denied"
		// error in IE/Edge.
		unloadHandler = function() {
			setDocument();
		},

		inDisabledFieldset = addCombinator(
			function( elem ) {
				return elem.disabled === true && nodeName( elem, "fieldset" );
			},
			{ dir: "parentNode", next: "legend" }
		);

	// Support: IE <=9 only
	// Accessing document.activeElement can throw unexpectedly
	// https://bugs.jquery.com/ticket/13393
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch ( err ) { }
	}

	// Optimize for push.apply( _, NodeList )
	try {
		push.apply(
			( arr = slice.call( preferredDoc.childNodes ) ),
			preferredDoc.childNodes
		);

		// Support: Android <=4.0
		// Detect silently failing push.apply
		// eslint-disable-next-line no-unused-expressions
		arr[ preferredDoc.childNodes.length ].nodeType;
	} catch ( e ) {
		push = {
			apply: function( target, els ) {
				pushNative.apply( target, slice.call( els ) );
			},
			call: function( target ) {
				pushNative.apply( target, slice.call( arguments, 1 ) );
			}
		};
	}

	function find( selector, context, results, seed ) {
		var m, i, elem, nid, match, groups, newSelector,
			newContext = context && context.ownerDocument,

			// nodeType defaults to 9, since context defaults to document
			nodeType = context ? context.nodeType : 9;

		results = results || [];

		// Return early from calls with invalid selector or context
		if ( typeof selector !== "string" || !selector ||
			nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

			return results;
		}

		// Try to shortcut find operations (as opposed to filters) in HTML documents
		if ( !seed ) {
			setDocument( context );
			context = context || document;

			if ( documentIsHTML ) {

				// If the selector is sufficiently simple, try using a "get*By*" DOM method
				// (excepting DocumentFragment context, where the methods don't exist)
				if ( nodeType !== 11 && ( match = rquickExpr.exec( selector ) ) ) {

					// ID selector
					if ( ( m = match[ 1 ] ) ) {

						// Document context
						if ( nodeType === 9 ) {
							if ( ( elem = context.getElementById( m ) ) ) {

								// Support: IE 9 only
								// getElementById can match elements by name instead of ID
								if ( elem.id === m ) {
									push.call( results, elem );
									return results;
								}
							} else {
								return results;
							}

						// Element context
						} else {

							// Support: IE 9 only
							// getElementById can match elements by name instead of ID
							if ( newContext && ( elem = newContext.getElementById( m ) ) &&
								find.contains( context, elem ) &&
								elem.id === m ) {

								push.call( results, elem );
								return results;
							}
						}

					// Type selector
					} else if ( match[ 2 ] ) {
						push.apply( results, context.getElementsByTagName( selector ) );
						return results;

					// Class selector
					} else if ( ( m = match[ 3 ] ) && context.getElementsByClassName ) {
						push.apply( results, context.getElementsByClassName( m ) );
						return results;
					}
				}

				// Take advantage of querySelectorAll
				if ( !nonnativeSelectorCache[ selector + " " ] &&
					( !rbuggyQSA || !rbuggyQSA.test( selector ) ) ) {

					newSelector = selector;
					newContext = context;

					// qSA considers elements outside a scoping root when evaluating child or
					// descendant combinators, which is not what we want.
					// In such cases, we work around the behavior by prefixing every selector in the
					// list with an ID selector referencing the scope context.
					// The technique has to be used as well when a leading combinator is used
					// as such selectors are not recognized by querySelectorAll.
					// Thanks to Andrew Dupont for this technique.
					if ( nodeType === 1 &&
						( rdescend.test( selector ) || rleadingCombinator.test( selector ) ) ) {

						// Expand context for sibling selectors
						newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
							context;

						// We can use :scope instead of the ID hack if the browser
						// supports it & if we're not changing the context.
						// Support: IE 11+, Edge 17 - 18+
						// IE/Edge sometimes throw a "Permission denied" error when
						// strict-comparing two documents; shallow comparisons work.
						// eslint-disable-next-line eqeqeq
						if ( newContext != context || !support.scope ) {

							// Capture the context ID, setting it first if necessary
							if ( ( nid = context.getAttribute( "id" ) ) ) {
								nid = jQuery.escapeSelector( nid );
							} else {
								context.setAttribute( "id", ( nid = expando ) );
							}
						}

						// Prefix every selector in the list
						groups = tokenize( selector );
						i = groups.length;
						while ( i-- ) {
							groups[ i ] = ( nid ? "#" + nid : ":scope" ) + " " +
								toSelector( groups[ i ] );
						}
						newSelector = groups.join( "," );
					}

					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
						nonnativeSelectorCache( selector, true );
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}

		// All others
		return select( selector.replace( rtrimCSS, "$1" ), context, results, seed );
	}

	/**
	 * Create key-value caches of limited size
	 * @returns {function(string, object)} Returns the Object data after storing it on itself with
	 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	 *	deleting the oldest entry
	 */
	function createCache() {
		var keys = [];

		function cache( key, value ) {

			// Use (key + " ") to avoid collision with native prototype properties
			// (see https://github.com/jquery/sizzle/issues/157)
			if ( keys.push( key + " " ) > Expr.cacheLength ) {

				// Only keep the most recent entries
				delete cache[ keys.shift() ];
			}
			return ( cache[ key + " " ] = value );
		}
		return cache;
	}

	/**
	 * Mark a function for special use by jQuery selector module
	 * @param {Function} fn The function to mark
	 */
	function markFunction( fn ) {
		fn[ expando ] = true;
		return fn;
	}

	/**
	 * Support testing using an element
	 * @param {Function} fn Passed the created element and returns a boolean result
	 */
	function assert( fn ) {
		var el = document.createElement( "fieldset" );

		try {
			return !!fn( el );
		} catch ( e ) {
			return false;
		} finally {

			// Remove from its parent by default
			if ( el.parentNode ) {
				el.parentNode.removeChild( el );
			}

			// release memory in IE
			el = null;
		}
	}

	/**
	 * Returns a function to use in pseudos for input types
	 * @param {String} type
	 */
	function createInputPseudo( type ) {
		return function( elem ) {
			return nodeName( elem, "input" ) && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for buttons
	 * @param {String} type
	 */
	function createButtonPseudo( type ) {
		return function( elem ) {
			return ( nodeName( elem, "input" ) || nodeName( elem, "button" ) ) &&
				elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for :enabled/:disabled
	 * @param {Boolean} disabled true for :disabled; false for :enabled
	 */
	function createDisabledPseudo( disabled ) {

		// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
		return function( elem ) {

			// Only certain elements can match :enabled or :disabled
			// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
			// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
			if ( "form" in elem ) {

				// Check for inherited disabledness on relevant non-disabled elements:
				// * listed form-associated elements in a disabled fieldset
				//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
				//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
				// * option elements in a disabled optgroup
				//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
				// All such elements have a "form" property.
				if ( elem.parentNode && elem.disabled === false ) {

					// Option elements defer to a parent optgroup if present
					if ( "label" in elem ) {
						if ( "label" in elem.parentNode ) {
							return elem.parentNode.disabled === disabled;
						} else {
							return elem.disabled === disabled;
						}
					}

					// Support: IE 6 - 11+
					// Use the isDisabled shortcut property to check for disabled fieldset ancestors
					return elem.isDisabled === disabled ||

						// Where there is no isDisabled, check manually
						elem.isDisabled !== !disabled &&
							inDisabledFieldset( elem ) === disabled;
				}

				return elem.disabled === disabled;

			// Try to winnow out elements that can't be disabled before trusting the disabled property.
			// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
			// even exist on them, let alone have a boolean value.
			} else if ( "label" in elem ) {
				return elem.disabled === disabled;
			}

			// Remaining elements are neither :enabled nor :disabled
			return false;
		};
	}

	/**
	 * Returns a function to use in pseudos for positionals
	 * @param {Function} fn
	 */
	function createPositionalPseudo( fn ) {
		return markFunction( function( argument ) {
			argument = +argument;
			return markFunction( function( seed, matches ) {
				var j,
					matchIndexes = fn( [], seed.length, argument ),
					i = matchIndexes.length;

				// Match elements found at the specified indexes
				while ( i-- ) {
					if ( seed[ ( j = matchIndexes[ i ] ) ] ) {
						seed[ j ] = !( matches[ j ] = seed[ j ] );
					}
				}
			} );
		} );
	}

	/**
	 * Checks a node for validity as a jQuery selector context
	 * @param {Element|Object=} context
	 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
	 */
	function testContext( context ) {
		return context && typeof context.getElementsByTagName !== "undefined" && context;
	}

	/**
	 * Sets document-related variables once based on the current document
	 * @param {Element|Object} [node] An element or document object to use to set the document
	 * @returns {Object} Returns the current document
	 */
	function setDocument( node ) {
		var subWindow,
			doc = node ? node.ownerDocument || node : preferredDoc;

		// Return early if doc is invalid or already selected
		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		if ( doc == document || doc.nodeType !== 9 || !doc.documentElement ) {
			return document;
		}

		// Update global variables
		document = doc;
		documentElement = document.documentElement;
		documentIsHTML = !jQuery.isXMLDoc( document );

		// Support: iOS 7 only, IE 9 - 11+
		// Older browsers didn't support unprefixed `matches`.
		matches = documentElement.matches ||
			documentElement.webkitMatchesSelector ||
			documentElement.msMatchesSelector;

		// Support: IE 9 - 11+, Edge 12 - 18+
		// Accessing iframe documents after unload throws "permission denied" errors
		// (see trac-13936).
		// Limit the fix to IE & Edge Legacy; despite Edge 15+ implementing `matches`,
		// all IE 9+ and Edge Legacy versions implement `msMatchesSelector` as well.
		if ( documentElement.msMatchesSelector &&

			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			preferredDoc != document &&
			( subWindow = document.defaultView ) && subWindow.top !== subWindow ) {

			// Support: IE 9 - 11+, Edge 12 - 18+
			subWindow.addEventListener( "unload", unloadHandler );
		}

		// Support: IE <10
		// Check if getElementById returns elements by name
		// The broken getElementById methods don't pick up programmatically-set names,
		// so use a roundabout getElementsByName test
		support.getById = assert( function( el ) {
			documentElement.appendChild( el ).id = jQuery.expando;
			return !document.getElementsByName ||
				!document.getElementsByName( jQuery.expando ).length;
		} );

		// Support: IE 9 only
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node.
		support.disconnectedMatch = assert( function( el ) {
			return matches.call( el, "*" );
		} );

		// Support: IE 9 - 11+, Edge 12 - 18+
		// IE/Edge don't support the :scope pseudo-class.
		support.scope = assert( function() {
			return document.querySelectorAll( ":scope" );
		} );

		// Support: Chrome 105 - 111 only, Safari 15.4 - 16.3 only
		// Make sure the `:has()` argument is parsed unforgivingly.
		// We include `*` in the test to detect buggy implementations that are
		// _selectively_ forgiving (specifically when the list includes at least
		// one valid selector).
		// Note that we treat complete lack of support for `:has()` as if it were
		// spec-compliant support, which is fine because use of `:has()` in such
		// environments will fail in the qSA path and fall back to jQuery traversal
		// anyway.
		support.cssHas = assert( function() {
			try {
				document.querySelector( ":has(*,:jqfake)" );
				return false;
			} catch ( e ) {
				return true;
			}
		} );

		// ID filter and find
		if ( support.getById ) {
			Expr.filter.ID = function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					return elem.getAttribute( "id" ) === attrId;
				};
			};
			Expr.find.ID = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var elem = context.getElementById( id );
					return elem ? [ elem ] : [];
				}
			};
		} else {
			Expr.filter.ID =  function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== "undefined" &&
						elem.getAttributeNode( "id" );
					return node && node.value === attrId;
				};
			};

			// Support: IE 6 - 7 only
			// getElementById is not reliable as a find shortcut
			Expr.find.ID = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var node, i, elems,
						elem = context.getElementById( id );

					if ( elem ) {

						// Verify the id attribute
						node = elem.getAttributeNode( "id" );
						if ( node && node.value === id ) {
							return [ elem ];
						}

						// Fall back on getElementsByName
						elems = context.getElementsByName( id );
						i = 0;
						while ( ( elem = elems[ i++ ] ) ) {
							node = elem.getAttributeNode( "id" );
							if ( node && node.value === id ) {
								return [ elem ];
							}
						}
					}

					return [];
				}
			};
		}

		// Tag
		Expr.find.TAG = function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else {
				return context.querySelectorAll( tag );
			}
		};

		// Class
		Expr.find.CLASS = function( className, context ) {
			if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
				return context.getElementsByClassName( className );
			}
		};

		/* QSA/matchesSelector
		---------------------------------------------------------------------- */

		// QSA and matchesSelector support

		rbuggyQSA = [];

		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert( function( el ) {

			var input;

			documentElement.appendChild( el ).innerHTML =
				"<a id='" + expando + "' href='' disabled='disabled'></a>" +
				"<select id='" + expando + "-\r\\' disabled='disabled'>" +
				"<option selected=''></option></select>";

			// Support: iOS <=7 - 8 only
			// Boolean attributes and "value" are not treated correctly in some XML documents
			if ( !el.querySelectorAll( "[selected]" ).length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: iOS <=7 - 8 only
			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push( "~=" );
			}

			// Support: iOS 8 only
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibling-combinator selector` fails
			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push( ".#.+[+~]" );
			}

			// Support: Chrome <=105+, Firefox <=104+, Safari <=15.4+
			// In some of the document kinds, these selectors wouldn't work natively.
			// This is probably OK but for backwards compatibility we want to maintain
			// handling them through jQuery traversal in jQuery 3.x.
			if ( !el.querySelectorAll( ":checked" ).length ) {
				rbuggyQSA.push( ":checked" );
			}

			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			input = document.createElement( "input" );
			input.setAttribute( "type", "hidden" );
			el.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE 9 - 11+
			// IE's :disabled selector does not pick up the children of disabled fieldsets
			// Support: Chrome <=105+, Firefox <=104+, Safari <=15.4+
			// In some of the document kinds, these selectors wouldn't work natively.
			// This is probably OK but for backwards compatibility we want to maintain
			// handling them through jQuery traversal in jQuery 3.x.
			documentElement.appendChild( el ).disabled = true;
			if ( el.querySelectorAll( ":disabled" ).length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: IE 11+, Edge 15 - 18+
			// IE 11/Edge don't find elements on a `[name='']` query in some cases.
			// Adding a temporary attribute to the document before the selection works
			// around the issue.
			// Interestingly, IE 10 & older don't seem to have the issue.
			input = document.createElement( "input" );
			input.setAttribute( "name", "" );
			el.appendChild( input );
			if ( !el.querySelectorAll( "[name='']" ).length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*name" + whitespace + "*=" +
					whitespace + "*(?:''|\"\")" );
			}
		} );

		if ( !support.cssHas ) {

			// Support: Chrome 105 - 110+, Safari 15.4 - 16.3+
			// Our regular `try-catch` mechanism fails to detect natively-unsupported
			// pseudo-classes inside `:has()` (such as `:has(:contains("Foo"))`)
			// in browsers that parse the `:has()` argument as a forgiving selector list.
			// https://drafts.csswg.org/selectors/#relational now requires the argument
			// to be parsed unforgivingly, but browsers have not yet fully adjusted.
			rbuggyQSA.push( ":has" );
		}

		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join( "|" ) );

		/* Sorting
		---------------------------------------------------------------------- */

		// Document order sorting
		sortOrder = function( a, b ) {

			// Flag for duplicate removal
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			// Sort on method existence if only one input has compareDocumentPosition
			var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
			if ( compare ) {
				return compare;
			}

			// Calculate position if both inputs belong to the same document
			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			compare = ( a.ownerDocument || a ) == ( b.ownerDocument || b ) ?
				a.compareDocumentPosition( b ) :

				// Otherwise we know they are disconnected
				1;

			// Disconnected nodes
			if ( compare & 1 ||
				( !support.sortDetached && b.compareDocumentPosition( a ) === compare ) ) {

				// Choose the first element that is related to our preferred document
				// Support: IE 11+, Edge 17 - 18+
				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
				// two documents; shallow comparisons work.
				// eslint-disable-next-line eqeqeq
				if ( a === document || a.ownerDocument == preferredDoc &&
					find.contains( preferredDoc, a ) ) {
					return -1;
				}

				// Support: IE 11+, Edge 17 - 18+
				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
				// two documents; shallow comparisons work.
				// eslint-disable-next-line eqeqeq
				if ( b === document || b.ownerDocument == preferredDoc &&
					find.contains( preferredDoc, b ) ) {
					return 1;
				}

				// Maintain original order
				return sortInput ?
					( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
					0;
			}

			return compare & 4 ? -1 : 1;
		};

		return document;
	}

	find.matches = function( expr, elements ) {
		return find( expr, null, null, elements );
	};

	find.matchesSelector = function( elem, expr ) {
		setDocument( elem );

		if ( documentIsHTML &&
			!nonnativeSelectorCache[ expr + " " ] &&
			( !rbuggyQSA || !rbuggyQSA.test( expr ) ) ) {

			try {
				var ret = matches.call( elem, expr );

				// IE 9's matchesSelector returns false on disconnected nodes
				if ( ret || support.disconnectedMatch ||

						// As well, disconnected nodes are said to be in a document
						// fragment in IE 9
						elem.document && elem.document.nodeType !== 11 ) {
					return ret;
				}
			} catch ( e ) {
				nonnativeSelectorCache( expr, true );
			}
		}

		return find( expr, document, null, [ elem ] ).length > 0;
	};

	find.contains = function( context, elem ) {

		// Set document vars if needed
		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		if ( ( context.ownerDocument || context ) != document ) {
			setDocument( context );
		}
		return jQuery.contains( context, elem );
	};


	find.attr = function( elem, name ) {

		// Set document vars if needed
		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		if ( ( elem.ownerDocument || elem ) != document ) {
			setDocument( elem );
		}

		var fn = Expr.attrHandle[ name.toLowerCase() ],

			// Don't get fooled by Object.prototype properties (see trac-13807)
			val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
				fn( elem, name, !documentIsHTML ) :
				undefined;

		if ( val !== undefined ) {
			return val;
		}

		return elem.getAttribute( name );
	};

	find.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};

	/**
	 * Document sorting and removing duplicates
	 * @param {ArrayLike} results
	 */
	jQuery.uniqueSort = function( results ) {
		var elem,
			duplicates = [],
			j = 0,
			i = 0;

		// Unless we *know* we can detect duplicates, assume their presence
		//
		// Support: Android <=4.0+
		// Testing for detecting duplicates is unpredictable so instead assume we can't
		// depend on duplicate detection in all browsers without a stable sort.
		hasDuplicate = !support.sortStable;
		sortInput = !support.sortStable && slice.call( results, 0 );
		sort.call( results, sortOrder );

		if ( hasDuplicate ) {
			while ( ( elem = results[ i++ ] ) ) {
				if ( elem === results[ i ] ) {
					j = duplicates.push( i );
				}
			}
			while ( j-- ) {
				splice.call( results, duplicates[ j ], 1 );
			}
		}

		// Clear input after sorting to release objects
		// See https://github.com/jquery/sizzle/pull/225
		sortInput = null;

		return results;
	};

	jQuery.fn.uniqueSort = function() {
		return this.pushStack( jQuery.uniqueSort( slice.apply( this ) ) );
	};

	Expr = jQuery.expr = {

		// Can be adjusted by the user
		cacheLength: 50,

		createPseudo: markFunction,

		match: matchExpr,

		attrHandle: {},

		find: {},

		relative: {
			">": { dir: "parentNode", first: true },
			" ": { dir: "parentNode" },
			"+": { dir: "previousSibling", first: true },
			"~": { dir: "previousSibling" }
		},

		preFilter: {
			ATTR: function( match ) {
				match[ 1 ] = match[ 1 ].replace( runescape, funescape );

				// Move the given value to match[3] whether quoted or unquoted
				match[ 3 ] = ( match[ 3 ] || match[ 4 ] || match[ 5 ] || "" )
					.replace( runescape, funescape );

				if ( match[ 2 ] === "~=" ) {
					match[ 3 ] = " " + match[ 3 ] + " ";
				}

				return match.slice( 0, 4 );
			},

			CHILD: function( match ) {

				/* matches from matchExpr["CHILD"]
					1 type (only|nth|...)
					2 what (child|of-type)
					3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
					4 xn-component of xn+y argument ([+-]?\d*n|)
					5 sign of xn-component
					6 x of xn-component
					7 sign of y-component
					8 y of y-component
				*/
				match[ 1 ] = match[ 1 ].toLowerCase();

				if ( match[ 1 ].slice( 0, 3 ) === "nth" ) {

					// nth-* requires argument
					if ( !match[ 3 ] ) {
						find.error( match[ 0 ] );
					}

					// numeric x and y parameters for Expr.filter.CHILD
					// remember that false/true cast respectively to 0/1
					match[ 4 ] = +( match[ 4 ] ?
						match[ 5 ] + ( match[ 6 ] || 1 ) :
						2 * ( match[ 3 ] === "even" || match[ 3 ] === "odd" )
					);
					match[ 5 ] = +( ( match[ 7 ] + match[ 8 ] ) || match[ 3 ] === "odd" );

				// other types prohibit arguments
				} else if ( match[ 3 ] ) {
					find.error( match[ 0 ] );
				}

				return match;
			},

			PSEUDO: function( match ) {
				var excess,
					unquoted = !match[ 6 ] && match[ 2 ];

				if ( matchExpr.CHILD.test( match[ 0 ] ) ) {
					return null;
				}

				// Accept quoted arguments as-is
				if ( match[ 3 ] ) {
					match[ 2 ] = match[ 4 ] || match[ 5 ] || "";

				// Strip excess characters from unquoted arguments
				} else if ( unquoted && rpseudo.test( unquoted ) &&

					// Get excess from tokenize (recursively)
					( excess = tokenize( unquoted, true ) ) &&

					// advance to the next closing parenthesis
					( excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length ) ) {

					// excess is a negative index
					match[ 0 ] = match[ 0 ].slice( 0, excess );
					match[ 2 ] = unquoted.slice( 0, excess );
				}

				// Return only captures needed by the pseudo filter method (type and argument)
				return match.slice( 0, 3 );
			}
		},

		filter: {

			TAG: function( nodeNameSelector ) {
				var expectedNodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
				return nodeNameSelector === "*" ?
					function() {
						return true;
					} :
					function( elem ) {
						return nodeName( elem, expectedNodeName );
					};
			},

			CLASS: function( className ) {
				var pattern = classCache[ className + " " ];

				return pattern ||
					( pattern = new RegExp( "(^|" + whitespace + ")" + className +
						"(" + whitespace + "|$)" ) ) &&
					classCache( className, function( elem ) {
						return pattern.test(
							typeof elem.className === "string" && elem.className ||
								typeof elem.getAttribute !== "undefined" &&
									elem.getAttribute( "class" ) ||
								""
						);
					} );
			},

			ATTR: function( name, operator, check ) {
				return function( elem ) {
					var result = find.attr( elem, name );

					if ( result == null ) {
						return operator === "!=";
					}
					if ( !operator ) {
						return true;
					}

					result += "";

					if ( operator === "=" ) {
						return result === check;
					}
					if ( operator === "!=" ) {
						return result !== check;
					}
					if ( operator === "^=" ) {
						return check && result.indexOf( check ) === 0;
					}
					if ( operator === "*=" ) {
						return check && result.indexOf( check ) > -1;
					}
					if ( operator === "$=" ) {
						return check && result.slice( -check.length ) === check;
					}
					if ( operator === "~=" ) {
						return ( " " + result.replace( rwhitespace, " " ) + " " )
							.indexOf( check ) > -1;
					}
					if ( operator === "|=" ) {
						return result === check || result.slice( 0, check.length + 1 ) === check + "-";
					}

					return false;
				};
			},

			CHILD: function( type, what, _argument, first, last ) {
				var simple = type.slice( 0, 3 ) !== "nth",
					forward = type.slice( -4 ) !== "last",
					ofType = what === "of-type";

				return first === 1 && last === 0 ?

					// Shortcut for :nth-*(n)
					function( elem ) {
						return !!elem.parentNode;
					} :

					function( elem, _context, xml ) {
						var cache, outerCache, node, nodeIndex, start,
							dir = simple !== forward ? "nextSibling" : "previousSibling",
							parent = elem.parentNode,
							name = ofType && elem.nodeName.toLowerCase(),
							useCache = !xml && !ofType,
							diff = false;

						if ( parent ) {

							// :(first|last|only)-(child|of-type)
							if ( simple ) {
								while ( dir ) {
									node = elem;
									while ( ( node = node[ dir ] ) ) {
										if ( ofType ?
											nodeName( node, name ) :
											node.nodeType === 1 ) {

											return false;
										}
									}

									// Reverse direction for :only-* (if we haven't yet done so)
									start = dir = type === "only" && !start && "nextSibling";
								}
								return true;
							}

							start = [ forward ? parent.firstChild : parent.lastChild ];

							// non-xml :nth-child(...) stores cache data on `parent`
							if ( forward && useCache ) {

								// Seek `elem` from a previously-cached index
								outerCache = parent[ expando ] || ( parent[ expando ] = {} );
								cache = outerCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex && cache[ 2 ];
								node = nodeIndex && parent.childNodes[ nodeIndex ];

								while ( ( node = ++nodeIndex && node && node[ dir ] ||

									// Fallback to seeking `elem` from the start
									( diff = nodeIndex = 0 ) || start.pop() ) ) {

									// When found, cache indexes on `parent` and break
									if ( node.nodeType === 1 && ++diff && node === elem ) {
										outerCache[ type ] = [ dirruns, nodeIndex, diff ];
										break;
									}
								}

							} else {

								// Use previously-cached element index if available
								if ( useCache ) {
									outerCache = elem[ expando ] || ( elem[ expando ] = {} );
									cache = outerCache[ type ] || [];
									nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
									diff = nodeIndex;
								}

								// xml :nth-child(...)
								// or :nth-last-child(...) or :nth(-last)?-of-type(...)
								if ( diff === false ) {

									// Use the same loop as above to seek `elem` from the start
									while ( ( node = ++nodeIndex && node && node[ dir ] ||
										( diff = nodeIndex = 0 ) || start.pop() ) ) {

										if ( ( ofType ?
											nodeName( node, name ) :
											node.nodeType === 1 ) &&
											++diff ) {

											// Cache the index of each encountered element
											if ( useCache ) {
												outerCache = node[ expando ] ||
													( node[ expando ] = {} );
												outerCache[ type ] = [ dirruns, diff ];
											}

											if ( node === elem ) {
												break;
											}
										}
									}
								}
							}

							// Incorporate the offset, then check against cycle size
							diff -= last;
							return diff === first || ( diff % first === 0 && diff / first >= 0 );
						}
					};
			},

			PSEUDO: function( pseudo, argument ) {

				// pseudo-class names are case-insensitive
				// https://www.w3.org/TR/selectors/#pseudo-classes
				// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
				// Remember that setFilters inherits from pseudos
				var args,
					fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
						find.error( "unsupported pseudo: " + pseudo );

				// The user may use createPseudo to indicate that
				// arguments are needed to create the filter function
				// just as jQuery does
				if ( fn[ expando ] ) {
					return fn( argument );
				}

				// But maintain support for old signatures
				if ( fn.length > 1 ) {
					args = [ pseudo, pseudo, "", argument ];
					return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
						markFunction( function( seed, matches ) {
							var idx,
								matched = fn( seed, argument ),
								i = matched.length;
							while ( i-- ) {
								idx = indexOf.call( seed, matched[ i ] );
								seed[ idx ] = !( matches[ idx ] = matched[ i ] );
							}
						} ) :
						function( elem ) {
							return fn( elem, 0, args );
						};
				}

				return fn;
			}
		},

		pseudos: {

			// Potentially complex pseudos
			not: markFunction( function( selector ) {

				// Trim the selector passed to compile
				// to avoid treating leading and trailing
				// spaces as combinators
				var input = [],
					results = [],
					matcher = compile( selector.replace( rtrimCSS, "$1" ) );

				return matcher[ expando ] ?
					markFunction( function( seed, matches, _context, xml ) {
						var elem,
							unmatched = matcher( seed, null, xml, [] ),
							i = seed.length;

						// Match elements unmatched by `matcher`
						while ( i-- ) {
							if ( ( elem = unmatched[ i ] ) ) {
								seed[ i ] = !( matches[ i ] = elem );
							}
						}
					} ) :
					function( elem, _context, xml ) {
						input[ 0 ] = elem;
						matcher( input, null, xml, results );

						// Don't keep the element
						// (see https://github.com/jquery/sizzle/issues/299)
						input[ 0 ] = null;
						return !results.pop();
					};
			} ),

			has: markFunction( function( selector ) {
				return function( elem ) {
					return find( selector, elem ).length > 0;
				};
			} ),

			contains: markFunction( function( text ) {
				text = text.replace( runescape, funescape );
				return function( elem ) {
					return ( elem.textContent || jQuery.text( elem ) ).indexOf( text ) > -1;
				};
			} ),

			// "Whether an element is represented by a :lang() selector
			// is based solely on the element's language value
			// being equal to the identifier C,
			// or beginning with the identifier C immediately followed by "-".
			// The matching of C against the element's language value is performed case-insensitively.
			// The identifier C does not have to be a valid language name."
			// https://www.w3.org/TR/selectors/#lang-pseudo
			lang: markFunction( function( lang ) {

				// lang value must be a valid identifier
				if ( !ridentifier.test( lang || "" ) ) {
					find.error( "unsupported lang: " + lang );
				}
				lang = lang.replace( runescape, funescape ).toLowerCase();
				return function( elem ) {
					var elemLang;
					do {
						if ( ( elemLang = documentIsHTML ?
							elem.lang :
							elem.getAttribute( "xml:lang" ) || elem.getAttribute( "lang" ) ) ) {

							elemLang = elemLang.toLowerCase();
							return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
						}
					} while ( ( elem = elem.parentNode ) && elem.nodeType === 1 );
					return false;
				};
			} ),

			// Miscellaneous
			target: function( elem ) {
				var hash = window.location && window.location.hash;
				return hash && hash.slice( 1 ) === elem.id;
			},

			root: function( elem ) {
				return elem === documentElement;
			},

			focus: function( elem ) {
				return elem === safeActiveElement() &&
					document.hasFocus() &&
					!!( elem.type || elem.href || ~elem.tabIndex );
			},

			// Boolean properties
			enabled: createDisabledPseudo( false ),
			disabled: createDisabledPseudo( true ),

			checked: function( elem ) {

				// In CSS3, :checked should return both checked and selected elements
				// https://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				return ( nodeName( elem, "input" ) && !!elem.checked ) ||
					( nodeName( elem, "option" ) && !!elem.selected );
			},

			selected: function( elem ) {

				// Support: IE <=11+
				// Accessing the selectedIndex property
				// forces the browser to treat the default option as
				// selected when in an optgroup.
				if ( elem.parentNode ) {
					// eslint-disable-next-line no-unused-expressions
					elem.parentNode.selectedIndex;
				}

				return elem.selected === true;
			},

			// Contents
			empty: function( elem ) {

				// https://www.w3.org/TR/selectors/#empty-pseudo
				// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
				//   but not by others (comment: 8; processing instruction: 7; etc.)
				// nodeType < 6 works because attributes (2) do not appear as children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					if ( elem.nodeType < 6 ) {
						return false;
					}
				}
				return true;
			},

			parent: function( elem ) {
				return !Expr.pseudos.empty( elem );
			},

			// Element/input types
			header: function( elem ) {
				return rheader.test( elem.nodeName );
			},

			input: function( elem ) {
				return rinputs.test( elem.nodeName );
			},

			button: function( elem ) {
				return nodeName( elem, "input" ) && elem.type === "button" ||
					nodeName( elem, "button" );
			},

			text: function( elem ) {
				var attr;
				return nodeName( elem, "input" ) && elem.type === "text" &&

					// Support: IE <10 only
					// New HTML5 attribute values (e.g., "search") appear
					// with elem.type === "text"
					( ( attr = elem.getAttribute( "type" ) ) == null ||
						attr.toLowerCase() === "text" );
			},

			// Position-in-collection
			first: createPositionalPseudo( function() {
				return [ 0 ];
			} ),

			last: createPositionalPseudo( function( _matchIndexes, length ) {
				return [ length - 1 ];
			} ),

			eq: createPositionalPseudo( function( _matchIndexes, length, argument ) {
				return [ argument < 0 ? argument + length : argument ];
			} ),

			even: createPositionalPseudo( function( matchIndexes, length ) {
				var i = 0;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			} ),

			odd: createPositionalPseudo( function( matchIndexes, length ) {
				var i = 1;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			} ),

			lt: createPositionalPseudo( function( matchIndexes, length, argument ) {
				var i;

				if ( argument < 0 ) {
					i = argument + length;
				} else if ( argument > length ) {
					i = length;
				} else {
					i = argument;
				}

				for ( ; --i >= 0; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			} ),

			gt: createPositionalPseudo( function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; ++i < length; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			} )
		}
	};

	Expr.pseudos.nth = Expr.pseudos.eq;

	// Add button/input type pseudos
	for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
		Expr.pseudos[ i ] = createInputPseudo( i );
	}
	for ( i in { submit: true, reset: true } ) {
		Expr.pseudos[ i ] = createButtonPseudo( i );
	}

	// Easy API for creating new setFilters
	function setFilters() {}
	setFilters.prototype = Expr.filters = Expr.pseudos;
	Expr.setFilters = new setFilters();

	function tokenize( selector, parseOnly ) {
		var matched, match, tokens, type,
			soFar, groups, preFilters,
			cached = tokenCache[ selector + " " ];

		if ( cached ) {
			return parseOnly ? 0 : cached.slice( 0 );
		}

		soFar = selector;
		groups = [];
		preFilters = Expr.preFilter;

		while ( soFar ) {

			// Comma and first run
			if ( !matched || ( match = rcomma.exec( soFar ) ) ) {
				if ( match ) {

					// Don't consume trailing commas as valid
					soFar = soFar.slice( match[ 0 ].length ) || soFar;
				}
				groups.push( ( tokens = [] ) );
			}

			matched = false;

			// Combinators
			if ( ( match = rleadingCombinator.exec( soFar ) ) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,

					// Cast descendant combinators to space
					type: match[ 0 ].replace( rtrimCSS, " " )
				} );
				soFar = soFar.slice( matched.length );
			}

			// Filters
			for ( type in Expr.filter ) {
				if ( ( match = matchExpr[ type ].exec( soFar ) ) && ( !preFilters[ type ] ||
					( match = preFilters[ type ]( match ) ) ) ) {
					matched = match.shift();
					tokens.push( {
						value: matched,
						type: type,
						matches: match
					} );
					soFar = soFar.slice( matched.length );
				}
			}

			if ( !matched ) {
				break;
			}
		}

		// Return the length of the invalid excess
		// if we're just parsing
		// Otherwise, throw an error or return tokens
		if ( parseOnly ) {
			return soFar.length;
		}

		return soFar ?
			find.error( selector ) :

			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
	}

	function toSelector( tokens ) {
		var i = 0,
			len = tokens.length,
			selector = "";
		for ( ; i < len; i++ ) {
			selector += tokens[ i ].value;
		}
		return selector;
	}

	function addCombinator( matcher, combinator, base ) {
		var dir = combinator.dir,
			skip = combinator.next,
			key = skip || dir,
			checkNonElements = base && key === "parentNode",
			doneName = done++;

		return combinator.first ?

			// Check against closest ancestor/preceding element
			function( elem, context, xml ) {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						return matcher( elem, context, xml );
					}
				}
				return false;
			} :

			// Check against all ancestor/preceding elements
			function( elem, context, xml ) {
				var oldCache, outerCache,
					newCache = [ dirruns, doneName ];

				// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
				if ( xml ) {
					while ( ( elem = elem[ dir ] ) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							if ( matcher( elem, context, xml ) ) {
								return true;
							}
						}
					}
				} else {
					while ( ( elem = elem[ dir ] ) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							outerCache = elem[ expando ] || ( elem[ expando ] = {} );

							if ( skip && nodeName( elem, skip ) ) {
								elem = elem[ dir ] || elem;
							} else if ( ( oldCache = outerCache[ key ] ) &&
								oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

								// Assign to newCache so results back-propagate to previous elements
								return ( newCache[ 2 ] = oldCache[ 2 ] );
							} else {

								// Reuse newcache so results back-propagate to previous elements
								outerCache[ key ] = newCache;

								// A match means we're done; a fail means we have to keep checking
								if ( ( newCache[ 2 ] = matcher( elem, context, xml ) ) ) {
									return true;
								}
							}
						}
					}
				}
				return false;
			};
	}

	function elementMatcher( matchers ) {
		return matchers.length > 1 ?
			function( elem, context, xml ) {
				var i = matchers.length;
				while ( i-- ) {
					if ( !matchers[ i ]( elem, context, xml ) ) {
						return false;
					}
				}
				return true;
			} :
			matchers[ 0 ];
	}

	function multipleContexts( selector, contexts, results ) {
		var i = 0,
			len = contexts.length;
		for ( ; i < len; i++ ) {
			find( selector, contexts[ i ], results );
		}
		return results;
	}

	function condense( unmatched, map, filter, context, xml ) {
		var elem,
			newUnmatched = [],
			i = 0,
			len = unmatched.length,
			mapped = map != null;

		for ( ; i < len; i++ ) {
			if ( ( elem = unmatched[ i ] ) ) {
				if ( !filter || filter( elem, context, xml ) ) {
					newUnmatched.push( elem );
					if ( mapped ) {
						map.push( i );
					}
				}
			}
		}

		return newUnmatched;
	}

	function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
		if ( postFilter && !postFilter[ expando ] ) {
			postFilter = setMatcher( postFilter );
		}
		if ( postFinder && !postFinder[ expando ] ) {
			postFinder = setMatcher( postFinder, postSelector );
		}
		return markFunction( function( seed, results, context, xml ) {
			var temp, i, elem, matcherOut,
				preMap = [],
				postMap = [],
				preexisting = results.length,

				// Get initial elements from seed or context
				elems = seed ||
					multipleContexts( selector || "*",
						context.nodeType ? [ context ] : context, [] ),

				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && ( seed || !selector ) ?
					condense( elems, preMap, preFilter, context, xml ) :
					elems;

			if ( matcher ) {

				// If we have a postFinder, or filtered seed, or non-seed postFilter
				// or preexisting results,
				matcherOut = postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results;

				// Find primary matches
				matcher( matcherIn, matcherOut, context, xml );
			} else {
				matcherOut = matcherIn;
			}

			// Apply postFilter
			if ( postFilter ) {
				temp = condense( matcherOut, postMap );
				postFilter( temp, [], context, xml );

				// Un-match failing elements by moving them back to matcherIn
				i = temp.length;
				while ( i-- ) {
					if ( ( elem = temp[ i ] ) ) {
						matcherOut[ postMap[ i ] ] = !( matcherIn[ postMap[ i ] ] = elem );
					}
				}
			}

			if ( seed ) {
				if ( postFinder || preFilter ) {
					if ( postFinder ) {

						// Get the final matcherOut by condensing this intermediate into postFinder contexts
						temp = [];
						i = matcherOut.length;
						while ( i-- ) {
							if ( ( elem = matcherOut[ i ] ) ) {

								// Restore matcherIn since elem is not yet a final match
								temp.push( ( matcherIn[ i ] = elem ) );
							}
						}
						postFinder( null, ( matcherOut = [] ), temp, xml );
					}

					// Move matched elements from seed to results to keep them synchronized
					i = matcherOut.length;
					while ( i-- ) {
						if ( ( elem = matcherOut[ i ] ) &&
							( temp = postFinder ? indexOf.call( seed, elem ) : preMap[ i ] ) > -1 ) {

							seed[ temp ] = !( results[ temp ] = elem );
						}
					}
				}

			// Add elements to results, through postFinder if defined
			} else {
				matcherOut = condense(
					matcherOut === results ?
						matcherOut.splice( preexisting, matcherOut.length ) :
						matcherOut
				);
				if ( postFinder ) {
					postFinder( null, results, matcherOut, xml );
				} else {
					push.apply( results, matcherOut );
				}
			}
		} );
	}

	function matcherFromTokens( tokens ) {
		var checkContext, matcher, j,
			len = tokens.length,
			leadingRelative = Expr.relative[ tokens[ 0 ].type ],
			implicitRelative = leadingRelative || Expr.relative[ " " ],
			i = leadingRelative ? 1 : 0,

			// The foundational matcher ensures that elements are reachable from top-level context(s)
			matchContext = addCombinator( function( elem ) {
				return elem === checkContext;
			}, implicitRelative, true ),
			matchAnyContext = addCombinator( function( elem ) {
				return indexOf.call( checkContext, elem ) > -1;
			}, implicitRelative, true ),
			matchers = [ function( elem, context, xml ) {

				// Support: IE 11+, Edge 17 - 18+
				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
				// two documents; shallow comparisons work.
				// eslint-disable-next-line eqeqeq
				var ret = ( !leadingRelative && ( xml || context != outermostContext ) ) || (
					( checkContext = context ).nodeType ?
						matchContext( elem, context, xml ) :
						matchAnyContext( elem, context, xml ) );

				// Avoid hanging onto element
				// (see https://github.com/jquery/sizzle/issues/299)
				checkContext = null;
				return ret;
			} ];

		for ( ; i < len; i++ ) {
			if ( ( matcher = Expr.relative[ tokens[ i ].type ] ) ) {
				matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
			} else {
				matcher = Expr.filter[ tokens[ i ].type ].apply( null, tokens[ i ].matches );

				// Return special upon seeing a positional matcher
				if ( matcher[ expando ] ) {

					// Find the next relative operator (if any) for proper handling
					j = ++i;
					for ( ; j < len; j++ ) {
						if ( Expr.relative[ tokens[ j ].type ] ) {
							break;
						}
					}
					return setMatcher(
						i > 1 && elementMatcher( matchers ),
						i > 1 && toSelector(

							// If the preceding token was a descendant combinator, insert an implicit any-element `*`
							tokens.slice( 0, i - 1 )
								.concat( { value: tokens[ i - 2 ].type === " " ? "*" : "" } )
						).replace( rtrimCSS, "$1" ),
						matcher,
						i < j && matcherFromTokens( tokens.slice( i, j ) ),
						j < len && matcherFromTokens( ( tokens = tokens.slice( j ) ) ),
						j < len && toSelector( tokens )
					);
				}
				matchers.push( matcher );
			}
		}

		return elementMatcher( matchers );
	}

	function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
		var bySet = setMatchers.length > 0,
			byElement = elementMatchers.length > 0,
			superMatcher = function( seed, context, xml, results, outermost ) {
				var elem, j, matcher,
					matchedCount = 0,
					i = "0",
					unmatched = seed && [],
					setMatched = [],
					contextBackup = outermostContext,

					// We must always have either seed elements or outermost context
					elems = seed || byElement && Expr.find.TAG( "*", outermost ),

					// Use integer dirruns iff this is the outermost matcher
					dirrunsUnique = ( dirruns += contextBackup == null ? 1 : Math.random() || 0.1 ),
					len = elems.length;

				if ( outermost ) {

					// Support: IE 11+, Edge 17 - 18+
					// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
					// two documents; shallow comparisons work.
					// eslint-disable-next-line eqeqeq
					outermostContext = context == document || context || outermost;
				}

				// Add elements passing elementMatchers directly to results
				// Support: iOS <=7 - 9 only
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching
				// elements by id. (see trac-14142)
				for ( ; i !== len && ( elem = elems[ i ] ) != null; i++ ) {
					if ( byElement && elem ) {
						j = 0;

						// Support: IE 11+, Edge 17 - 18+
						// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
						// two documents; shallow comparisons work.
						// eslint-disable-next-line eqeqeq
						if ( !context && elem.ownerDocument != document ) {
							setDocument( elem );
							xml = !documentIsHTML;
						}
						while ( ( matcher = elementMatchers[ j++ ] ) ) {
							if ( matcher( elem, context || document, xml ) ) {
								push.call( results, elem );
								break;
							}
						}
						if ( outermost ) {
							dirruns = dirrunsUnique;
						}
					}

					// Track unmatched elements for set filters
					if ( bySet ) {

						// They will have gone through all possible matchers
						if ( ( elem = !matcher && elem ) ) {
							matchedCount--;
						}

						// Lengthen the array for every element, matched or not
						if ( seed ) {
							unmatched.push( elem );
						}
					}
				}

				// `i` is now the count of elements visited above, and adding it to `matchedCount`
				// makes the latter nonnegative.
				matchedCount += i;

				// Apply set filters to unmatched elements
				// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
				// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
				// no element matchers and no seed.
				// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
				// case, which will result in a "00" `matchedCount` that differs from `i` but is also
				// numerically zero.
				if ( bySet && i !== matchedCount ) {
					j = 0;
					while ( ( matcher = setMatchers[ j++ ] ) ) {
						matcher( unmatched, setMatched, context, xml );
					}

					if ( seed ) {

						// Reintegrate element matches to eliminate the need for sorting
						if ( matchedCount > 0 ) {
							while ( i-- ) {
								if ( !( unmatched[ i ] || setMatched[ i ] ) ) {
									setMatched[ i ] = pop.call( results );
								}
							}
						}

						// Discard index placeholder values to get only actual matches
						setMatched = condense( setMatched );
					}

					// Add matches to results
					push.apply( results, setMatched );

					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if ( outermost && !seed && setMatched.length > 0 &&
						( matchedCount + setMatchers.length ) > 1 ) {

						jQuery.uniqueSort( results );
					}
				}

				// Override manipulation of globals by nested matchers
				if ( outermost ) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}

				return unmatched;
			};

		return bySet ?
			markFunction( superMatcher ) :
			superMatcher;
	}

	function compile( selector, match /* Internal Use Only */ ) {
		var i,
			setMatchers = [],
			elementMatchers = [],
			cached = compilerCache[ selector + " " ];

		if ( !cached ) {

			// Generate a function of recursive functions that can be used to check each element
			if ( !match ) {
				match = tokenize( selector );
			}
			i = match.length;
			while ( i-- ) {
				cached = matcherFromTokens( match[ i ] );
				if ( cached[ expando ] ) {
					setMatchers.push( cached );
				} else {
					elementMatchers.push( cached );
				}
			}

			// Cache the compiled function
			cached = compilerCache( selector,
				matcherFromGroupMatchers( elementMatchers, setMatchers ) );

			// Save selector and tokenization
			cached.selector = selector;
		}
		return cached;
	}

	/**
	 * A low-level selection function that works with jQuery's compiled
	 *  selector functions
	 * @param {String|Function} selector A selector or a pre-compiled
	 *  selector function built with jQuery selector compile
	 * @param {Element} context
	 * @param {Array} [results]
	 * @param {Array} [seed] A set of elements to match against
	 */
	function select( selector, context, results, seed ) {
		var i, tokens, token, type, find,
			compiled = typeof selector === "function" && selector,
			match = !seed && tokenize( ( selector = compiled.selector || selector ) );

		results = results || [];

		// Try to minimize operations if there is only one selector in the list and no seed
		// (the latter of which guarantees us context)
		if ( match.length === 1 ) {

			// Reduce context if the leading compound selector is an ID
			tokens = match[ 0 ] = match[ 0 ].slice( 0 );
			if ( tokens.length > 2 && ( token = tokens[ 0 ] ).type === "ID" &&
					context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[ 1 ].type ] ) {

				context = ( Expr.find.ID(
					token.matches[ 0 ].replace( runescape, funescape ),
					context
				) || [] )[ 0 ];
				if ( !context ) {
					return results;

				// Precompiled matchers will still verify ancestry, so step up a level
				} else if ( compiled ) {
					context = context.parentNode;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr.needsContext.test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[ i ];

				// Abort if we hit a combinator
				if ( Expr.relative[ ( type = token.type ) ] ) {
					break;
				}
				if ( ( find = Expr.find[ type ] ) ) {

					// Search, expanding context for leading sibling combinators
					if ( ( seed = find(
						token.matches[ 0 ].replace( runescape, funescape ),
						rsibling.test( tokens[ 0 ].type ) &&
							testContext( context.parentNode ) || context
					) ) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}

		// Compile and execute a filtering function if one is not provided
		// Provide `match` to avoid retokenization if we modified the selector above
		( compiled || compile( selector, match ) )(
			seed,
			context,
			!documentIsHTML,
			results,
			!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
		);
		return results;
	}

	// One-time assignments

	// Support: Android <=4.0 - 4.1+
	// Sort stability
	support.sortStable = expando.split( "" ).sort( sortOrder ).join( "" ) === expando;

	// Initialize against the default document
	setDocument();

	// Support: Android <=4.0 - 4.1+
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert( function( el ) {

		// Should return 1, but returns 4 (following)
		return el.compareDocumentPosition( document.createElement( "fieldset" ) ) & 1;
	} );

	jQuery.find = find;

	// Deprecated
	jQuery.expr[ ":" ] = jQuery.expr.pseudos;
	jQuery.unique = jQuery.uniqueSort;

	// These have always been private, but they used to be documented as part of
	// Sizzle so let's maintain them for now for backwards compatibility purposes.
	find.compile = compile;
	find.select = select;
	find.setDocument = setDocument;
	find.tokenize = tokenize;

	find.escape = jQuery.escapeSelector;
	find.getText = jQuery.text;
	find.isXML = jQuery.isXMLDoc;
	find.selectors = jQuery.expr;
	find.support = jQuery.support;
	find.uniqueSort = jQuery.uniqueSort;

		/* eslint-enable */

	} )();


	var dir = function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	};


	var siblings = function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	};


	var rneedsContext = jQuery.expr.match.needsContext;

	var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



	// Implement the identical functionality for filter and not
	function winnow( elements, qualifier, not ) {
		if ( isFunction( qualifier ) ) {
			return jQuery.grep( elements, function( elem, i ) {
				return !!qualifier.call( elem, i, elem ) !== not;
			} );
		}

		// Single element
		if ( qualifier.nodeType ) {
			return jQuery.grep( elements, function( elem ) {
				return ( elem === qualifier ) !== not;
			} );
		}

		// Arraylike of elements (jQuery, arguments, Array)
		if ( typeof qualifier !== "string" ) {
			return jQuery.grep( elements, function( elem ) {
				return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
			} );
		}

		// Filtered directly for both simple and complex selectors
		return jQuery.filter( qualifier, elements, not );
	}

	jQuery.filter = function( expr, elems, not ) {
		var elem = elems[ 0 ];

		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		if ( elems.length === 1 && elem.nodeType === 1 ) {
			return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
		}

		return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
	};

	jQuery.fn.extend( {
		find: function( selector ) {
			var i, ret,
				len = this.length,
				self = this;

			if ( typeof selector !== "string" ) {
				return this.pushStack( jQuery( selector ).filter( function() {
					for ( i = 0; i < len; i++ ) {
						if ( jQuery.contains( self[ i ], this ) ) {
							return true;
						}
					}
				} ) );
			}

			ret = this.pushStack( [] );

			for ( i = 0; i < len; i++ ) {
				jQuery.find( selector, self[ i ], ret );
			}

			return len > 1 ? jQuery.uniqueSort( ret ) : ret;
		},
		filter: function( selector ) {
			return this.pushStack( winnow( this, selector || [], false ) );
		},
		not: function( selector ) {
			return this.pushStack( winnow( this, selector || [], true ) );
		},
		is: function( selector ) {
			return !!winnow(
				this,

				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				typeof selector === "string" && rneedsContext.test( selector ) ?
					jQuery( selector ) :
					selector || [],
				false
			).length;
		}
	} );


	// Initialize a jQuery object


	// A central reference to the root jQuery(document)
	var rootjQuery,

		// A simple way to check for HTML strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (trac-9521)
		// Strict HTML recognition (trac-11290: must start with <)
		// Shortcut simple #id case for speed
		rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

		init = jQuery.fn.init = function( selector, context, root ) {
			var match, elem;

			// HANDLE: $(""), $(null), $(undefined), $(false)
			if ( !selector ) {
				return this;
			}

			// Method init() accepts an alternate rootjQuery
			// so migrate can support jQuery.sub (gh-2101)
			root = root || rootjQuery;

			// Handle HTML strings
			if ( typeof selector === "string" ) {
				if ( selector[ 0 ] === "<" &&
					selector[ selector.length - 1 ] === ">" &&
					selector.length >= 3 ) {

					// Assume that strings that start and end with <> are HTML and skip the regex check
					match = [ null, selector, null ];

				} else {
					match = rquickExpr.exec( selector );
				}

				// Match html or make sure no context is specified for #id
				if ( match && ( match[ 1 ] || !context ) ) {

					// HANDLE: $(html) -> $(array)
					if ( match[ 1 ] ) {
						context = context instanceof jQuery ? context[ 0 ] : context;

						// Option to run scripts is true for back-compat
						// Intentionally let the error be thrown if parseHTML is not present
						jQuery.merge( this, jQuery.parseHTML(
							match[ 1 ],
							context && context.nodeType ? context.ownerDocument || context : document,
							true
						) );

						// HANDLE: $(html, props)
						if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
							for ( match in context ) {

								// Properties of context are called as methods if possible
								if ( isFunction( this[ match ] ) ) {
									this[ match ]( context[ match ] );

								// ...and otherwise set as attributes
								} else {
									this.attr( match, context[ match ] );
								}
							}
						}

						return this;

					// HANDLE: $(#id)
					} else {
						elem = document.getElementById( match[ 2 ] );

						if ( elem ) {

							// Inject the element directly into the jQuery object
							this[ 0 ] = elem;
							this.length = 1;
						}
						return this;
					}

				// HANDLE: $(expr, $(...))
				} else if ( !context || context.jquery ) {
					return ( context || root ).find( selector );

				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
				} else {
					return this.constructor( context ).find( selector );
				}

			// HANDLE: $(DOMElement)
			} else if ( selector.nodeType ) {
				this[ 0 ] = selector;
				this.length = 1;
				return this;

			// HANDLE: $(function)
			// Shortcut for document ready
			} else if ( isFunction( selector ) ) {
				return root.ready !== undefined ?
					root.ready( selector ) :

					// Execute immediately if ready is not present
					selector( jQuery );
			}

			return jQuery.makeArray( selector, this );
		};

	// Give the init function the jQuery prototype for later instantiation
	init.prototype = jQuery.fn;

	// Initialize central reference
	rootjQuery = jQuery( document );


	var rparentsprev = /^(?:parents|prev(?:Until|All))/,

		// Methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};

	jQuery.fn.extend( {
		has: function( target ) {
			var targets = jQuery( target, this ),
				l = targets.length;

			return this.filter( function() {
				var i = 0;
				for ( ; i < l; i++ ) {
					if ( jQuery.contains( this, targets[ i ] ) ) {
						return true;
					}
				}
			} );
		},

		closest: function( selectors, context ) {
			var cur,
				i = 0,
				l = this.length,
				matched = [],
				targets = typeof selectors !== "string" && jQuery( selectors );

			// Positional selectors never match, since there's no _selection_ context
			if ( !rneedsContext.test( selectors ) ) {
				for ( ; i < l; i++ ) {
					for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

						// Always skip document fragments
						if ( cur.nodeType < 11 && ( targets ?
							targets.index( cur ) > -1 :

							// Don't pass non-elements to jQuery#find
							cur.nodeType === 1 &&
								jQuery.find.matchesSelector( cur, selectors ) ) ) {

							matched.push( cur );
							break;
						}
					}
				}
			}

			return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
		},

		// Determine the position of an element within the set
		index: function( elem ) {

			// No argument, return index in parent
			if ( !elem ) {
				return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
			}

			// Index in selector
			if ( typeof elem === "string" ) {
				return indexOf.call( jQuery( elem ), this[ 0 ] );
			}

			// Locate the position of the desired element
			return indexOf.call( this,

				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[ 0 ] : elem
			);
		},

		add: function( selector, context ) {
			return this.pushStack(
				jQuery.uniqueSort(
					jQuery.merge( this.get(), jQuery( selector, context ) )
				)
			);
		},

		addBack: function( selector ) {
			return this.add( selector == null ?
				this.prevObject : this.prevObject.filter( selector )
			);
		}
	} );

	function sibling( cur, dir ) {
		while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
		return cur;
	}

	jQuery.each( {
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, _i, until ) {
			return dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return sibling( elem, "nextSibling" );
		},
		prev: function( elem ) {
			return sibling( elem, "previousSibling" );
		},
		nextAll: function( elem ) {
			return dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, _i, until ) {
			return dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, _i, until ) {
			return dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return siblings( ( elem.parentNode || {} ).firstChild, elem );
		},
		children: function( elem ) {
			return siblings( elem.firstChild );
		},
		contents: function( elem ) {
			if ( elem.contentDocument != null &&

				// Support: IE 11+
				// <object> elements with no `data` attribute has an object
				// `contentDocument` with a `null` prototype.
				getProto( elem.contentDocument ) ) {

				return elem.contentDocument;
			}

			// Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
			// Treat the template element as a regular one in browsers that
			// don't support it.
			if ( nodeName( elem, "template" ) ) {
				elem = elem.content || elem;
			}

			return jQuery.merge( [], elem.childNodes );
		}
	}, function( name, fn ) {
		jQuery.fn[ name ] = function( until, selector ) {
			var matched = jQuery.map( this, fn, until );

			if ( name.slice( -5 ) !== "Until" ) {
				selector = until;
			}

			if ( selector && typeof selector === "string" ) {
				matched = jQuery.filter( selector, matched );
			}

			if ( this.length > 1 ) {

				// Remove duplicates
				if ( !guaranteedUnique[ name ] ) {
					jQuery.uniqueSort( matched );
				}

				// Reverse order for parents* and prev-derivatives
				if ( rparentsprev.test( name ) ) {
					matched.reverse();
				}
			}

			return this.pushStack( matched );
		};
	} );
	var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



	// Convert String-formatted options into Object-formatted ones
	function createOptions( options ) {
		var object = {};
		jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
			object[ flag ] = true;
		} );
		return object;
	}

	/*
	 * Create a callback list using the following parameters:
	 *
	 *	options: an optional list of space-separated options that will change how
	 *			the callback list behaves or a more traditional option object
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible options:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
	jQuery.Callbacks = function( options ) {

		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ?
			createOptions( options ) :
			jQuery.extend( {}, options );

		var // Flag to know if list is currently firing
			firing,

			// Last fire value for non-forgettable lists
			memory,

			// Flag to know if list was already fired
			fired,

			// Flag to prevent firing
			locked,

			// Actual callback list
			list = [],

			// Queue of execution data for repeatable lists
			queue = [],

			// Index of currently firing callback (modified by add/remove as needed)
			firingIndex = -1,

			// Fire callbacks
			fire = function() {

				// Enforce single-firing
				locked = locked || options.once;

				// Execute callbacks for all pending executions,
				// respecting firingIndex overrides and runtime changes
				fired = firing = true;
				for ( ; queue.length; firingIndex = -1 ) {
					memory = queue.shift();
					while ( ++firingIndex < list.length ) {

						// Run callback and check for early termination
						if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
							options.stopOnFalse ) {

							// Jump to end and forget the data so .add doesn't re-fire
							firingIndex = list.length;
							memory = false;
						}
					}
				}

				// Forget the data if we're done with it
				if ( !options.memory ) {
					memory = false;
				}

				firing = false;

				// Clean up if we're done firing for good
				if ( locked ) {

					// Keep an empty list if we have data for future add calls
					if ( memory ) {
						list = [];

					// Otherwise, this object is spent
					} else {
						list = "";
					}
				}
			},

			// Actual Callbacks object
			self = {

				// Add a callback or a collection of callbacks to the list
				add: function() {
					if ( list ) {

						// If we have memory from a past run, we should fire after adding
						if ( memory && !firing ) {
							firingIndex = list.length - 1;
							queue.push( memory );
						}

						( function add( args ) {
							jQuery.each( args, function( _, arg ) {
								if ( isFunction( arg ) ) {
									if ( !options.unique || !self.has( arg ) ) {
										list.push( arg );
									}
								} else if ( arg && arg.length && toType( arg ) !== "string" ) {

									// Inspect recursively
									add( arg );
								}
							} );
						} )( arguments );

						if ( memory && !firing ) {
							fire();
						}
					}
					return this;
				},

				// Remove a callback from the list
				remove: function() {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );

							// Handle firing indexes
							if ( index <= firingIndex ) {
								firingIndex--;
							}
						}
					} );
					return this;
				},

				// Check if a given callback is in the list.
				// If no argument is given, return whether or not list has callbacks attached.
				has: function( fn ) {
					return fn ?
						jQuery.inArray( fn, list ) > -1 :
						list.length > 0;
				},

				// Remove all callbacks from the list
				empty: function() {
					if ( list ) {
						list = [];
					}
					return this;
				},

				// Disable .fire and .add
				// Abort any current/pending executions
				// Clear all callbacks and values
				disable: function() {
					locked = queue = [];
					list = memory = "";
					return this;
				},
				disabled: function() {
					return !list;
				},

				// Disable .fire
				// Also disable .add unless we have memory (since it would have no effect)
				// Abort any pending executions
				lock: function() {
					locked = queue = [];
					if ( !memory && !firing ) {
						list = memory = "";
					}
					return this;
				},
				locked: function() {
					return !!locked;
				},

				// Call all callbacks with the given context and arguments
				fireWith: function( context, args ) {
					if ( !locked ) {
						args = args || [];
						args = [ context, args.slice ? args.slice() : args ];
						queue.push( args );
						if ( !firing ) {
							fire();
						}
					}
					return this;
				},

				// Call all the callbacks with the given arguments
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},

				// To know if the callbacks have already been called at least once
				fired: function() {
					return !!fired;
				}
			};

		return self;
	};


	function Identity( v ) {
		return v;
	}
	function Thrower( ex ) {
		throw ex;
	}

	function adoptValue( value, resolve, reject, noValue ) {
		var method;

		try {

			// Check for promise aspect first to privilege synchronous behavior
			if ( value && isFunction( ( method = value.promise ) ) ) {
				method.call( value ).done( resolve ).fail( reject );

			// Other thenables
			} else if ( value && isFunction( ( method = value.then ) ) ) {
				method.call( value, resolve, reject );

			// Other non-thenables
			} else {

				// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
				// * false: [ value ].slice( 0 ) => resolve( value )
				// * true: [ value ].slice( 1 ) => resolve()
				resolve.apply( undefined, [ value ].slice( noValue ) );
			}

		// For Promises/A+, convert exceptions into rejections
		// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
		// Deferred#then to conditionally suppress rejection.
		} catch ( value ) {

			// Support: Android 4.0 only
			// Strict mode functions invoked without .call/.apply get global-object context
			reject.apply( undefined, [ value ] );
		}
	}

	jQuery.extend( {

		Deferred: function( func ) {
			var tuples = [

					// action, add listener, callbacks,
					// ... .then handlers, argument index, [final state]
					[ "notify", "progress", jQuery.Callbacks( "memory" ),
						jQuery.Callbacks( "memory" ), 2 ],
					[ "resolve", "done", jQuery.Callbacks( "once memory" ),
						jQuery.Callbacks( "once memory" ), 0, "resolved" ],
					[ "reject", "fail", jQuery.Callbacks( "once memory" ),
						jQuery.Callbacks( "once memory" ), 1, "rejected" ]
				],
				state = "pending",
				promise = {
					state: function() {
						return state;
					},
					always: function() {
						deferred.done( arguments ).fail( arguments );
						return this;
					},
					"catch": function( fn ) {
						return promise.then( null, fn );
					},

					// Keep pipe for back-compat
					pipe: function( /* fnDone, fnFail, fnProgress */ ) {
						var fns = arguments;

						return jQuery.Deferred( function( newDefer ) {
							jQuery.each( tuples, function( _i, tuple ) {

								// Map tuples (progress, done, fail) to arguments (done, fail, progress)
								var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

								// deferred.progress(function() { bind to newDefer or newDefer.notify })
								// deferred.done(function() { bind to newDefer or newDefer.resolve })
								// deferred.fail(function() { bind to newDefer or newDefer.reject })
								deferred[ tuple[ 1 ] ]( function() {
									var returned = fn && fn.apply( this, arguments );
									if ( returned && isFunction( returned.promise ) ) {
										returned.promise()
											.progress( newDefer.notify )
											.done( newDefer.resolve )
											.fail( newDefer.reject );
									} else {
										newDefer[ tuple[ 0 ] + "With" ](
											this,
											fn ? [ returned ] : arguments
										);
									}
								} );
							} );
							fns = null;
						} ).promise();
					},
					then: function( onFulfilled, onRejected, onProgress ) {
						var maxDepth = 0;
						function resolve( depth, deferred, handler, special ) {
							return function() {
								var that = this,
									args = arguments,
									mightThrow = function() {
										var returned, then;

										// Support: Promises/A+ section 2.3.3.3.3
										// https://promisesaplus.com/#point-59
										// Ignore double-resolution attempts
										if ( depth < maxDepth ) {
											return;
										}

										returned = handler.apply( that, args );

										// Support: Promises/A+ section 2.3.1
										// https://promisesaplus.com/#point-48
										if ( returned === deferred.promise() ) {
											throw new TypeError( "Thenable self-resolution" );
										}

										// Support: Promises/A+ sections 2.3.3.1, 3.5
										// https://promisesaplus.com/#point-54
										// https://promisesaplus.com/#point-75
										// Retrieve `then` only once
										then = returned &&

											// Support: Promises/A+ section 2.3.4
											// https://promisesaplus.com/#point-64
											// Only check objects and functions for thenability
											( typeof returned === "object" ||
												typeof returned === "function" ) &&
											returned.then;

										// Handle a returned thenable
										if ( isFunction( then ) ) {

											// Special processors (notify) just wait for resolution
											if ( special ) {
												then.call(
													returned,
													resolve( maxDepth, deferred, Identity, special ),
													resolve( maxDepth, deferred, Thrower, special )
												);

											// Normal processors (resolve) also hook into progress
											} else {

												// ...and disregard older resolution values
												maxDepth++;

												then.call(
													returned,
													resolve( maxDepth, deferred, Identity, special ),
													resolve( maxDepth, deferred, Thrower, special ),
													resolve( maxDepth, deferred, Identity,
														deferred.notifyWith )
												);
											}

										// Handle all other returned values
										} else {

											// Only substitute handlers pass on context
											// and multiple values (non-spec behavior)
											if ( handler !== Identity ) {
												that = undefined;
												args = [ returned ];
											}

											// Process the value(s)
											// Default process is resolve
											( special || deferred.resolveWith )( that, args );
										}
									},

									// Only normal processors (resolve) catch and reject exceptions
									process = special ?
										mightThrow :
										function() {
											try {
												mightThrow();
											} catch ( e ) {

												if ( jQuery.Deferred.exceptionHook ) {
													jQuery.Deferred.exceptionHook( e,
														process.error );
												}

												// Support: Promises/A+ section 2.3.3.3.4.1
												// https://promisesaplus.com/#point-61
												// Ignore post-resolution exceptions
												if ( depth + 1 >= maxDepth ) {

													// Only substitute handlers pass on context
													// and multiple values (non-spec behavior)
													if ( handler !== Thrower ) {
														that = undefined;
														args = [ e ];
													}

													deferred.rejectWith( that, args );
												}
											}
										};

								// Support: Promises/A+ section 2.3.3.3.1
								// https://promisesaplus.com/#point-57
								// Re-resolve promises immediately to dodge false rejection from
								// subsequent errors
								if ( depth ) {
									process();
								} else {

									// Call an optional hook to record the error, in case of exception
									// since it's otherwise lost when execution goes async
									if ( jQuery.Deferred.getErrorHook ) {
										process.error = jQuery.Deferred.getErrorHook();

									// The deprecated alias of the above. While the name suggests
									// returning the stack, not an error instance, jQuery just passes
									// it directly to `console.warn` so both will work; an instance
									// just better cooperates with source maps.
									} else if ( jQuery.Deferred.getStackHook ) {
										process.error = jQuery.Deferred.getStackHook();
									}
									window.setTimeout( process );
								}
							};
						}

						return jQuery.Deferred( function( newDefer ) {

							// progress_handlers.add( ... )
							tuples[ 0 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									isFunction( onProgress ) ?
										onProgress :
										Identity,
									newDefer.notifyWith
								)
							);

							// fulfilled_handlers.add( ... )
							tuples[ 1 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									isFunction( onFulfilled ) ?
										onFulfilled :
										Identity
								)
							);

							// rejected_handlers.add( ... )
							tuples[ 2 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									isFunction( onRejected ) ?
										onRejected :
										Thrower
								)
							);
						} ).promise();
					},

					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					promise: function( obj ) {
						return obj != null ? jQuery.extend( obj, promise ) : promise;
					}
				},
				deferred = {};

			// Add list-specific methods
			jQuery.each( tuples, function( i, tuple ) {
				var list = tuple[ 2 ],
					stateString = tuple[ 5 ];

				// promise.progress = list.add
				// promise.done = list.add
				// promise.fail = list.add
				promise[ tuple[ 1 ] ] = list.add;

				// Handle state
				if ( stateString ) {
					list.add(
						function() {

							// state = "resolved" (i.e., fulfilled)
							// state = "rejected"
							state = stateString;
						},

						// rejected_callbacks.disable
						// fulfilled_callbacks.disable
						tuples[ 3 - i ][ 2 ].disable,

						// rejected_handlers.disable
						// fulfilled_handlers.disable
						tuples[ 3 - i ][ 3 ].disable,

						// progress_callbacks.lock
						tuples[ 0 ][ 2 ].lock,

						// progress_handlers.lock
						tuples[ 0 ][ 3 ].lock
					);
				}

				// progress_handlers.fire
				// fulfilled_handlers.fire
				// rejected_handlers.fire
				list.add( tuple[ 3 ].fire );

				// deferred.notify = function() { deferred.notifyWith(...) }
				// deferred.resolve = function() { deferred.resolveWith(...) }
				// deferred.reject = function() { deferred.rejectWith(...) }
				deferred[ tuple[ 0 ] ] = function() {
					deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
					return this;
				};

				// deferred.notifyWith = list.fireWith
				// deferred.resolveWith = list.fireWith
				// deferred.rejectWith = list.fireWith
				deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
			} );

			// Make the deferred a promise
			promise.promise( deferred );

			// Call given func if any
			if ( func ) {
				func.call( deferred, deferred );
			}

			// All done!
			return deferred;
		},

		// Deferred helper
		when: function( singleValue ) {
			var

				// count of uncompleted subordinates
				remaining = arguments.length,

				// count of unprocessed arguments
				i = remaining,

				// subordinate fulfillment data
				resolveContexts = Array( i ),
				resolveValues = slice.call( arguments ),

				// the primary Deferred
				primary = jQuery.Deferred(),

				// subordinate callback factory
				updateFunc = function( i ) {
					return function( value ) {
						resolveContexts[ i ] = this;
						resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
						if ( !( --remaining ) ) {
							primary.resolveWith( resolveContexts, resolveValues );
						}
					};
				};

			// Single- and empty arguments are adopted like Promise.resolve
			if ( remaining <= 1 ) {
				adoptValue( singleValue, primary.done( updateFunc( i ) ).resolve, primary.reject,
					!remaining );

				// Use .then() to unwrap secondary thenables (cf. gh-3000)
				if ( primary.state() === "pending" ||
					isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

					return primary.then();
				}
			}

			// Multiple arguments are aggregated like Promise.all array elements
			while ( i-- ) {
				adoptValue( resolveValues[ i ], updateFunc( i ), primary.reject );
			}

			return primary.promise();
		}
	} );


	// These usually indicate a programmer mistake during development,
	// warn about them ASAP rather than swallowing them by default.
	var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

	// If `jQuery.Deferred.getErrorHook` is defined, `asyncError` is an error
	// captured before the async barrier to get the original error cause
	// which may otherwise be hidden.
	jQuery.Deferred.exceptionHook = function( error, asyncError ) {

		// Support: IE 8 - 9 only
		// Console exists when dev tools are open, which can happen at any time
		if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
			window.console.warn( "jQuery.Deferred exception: " + error.message,
				error.stack, asyncError );
		}
	};




	jQuery.readyException = function( error ) {
		window.setTimeout( function() {
			throw error;
		} );
	};




	// The deferred used on DOM ready
	var readyList = jQuery.Deferred();

	jQuery.fn.ready = function( fn ) {

		readyList
			.then( fn )

			// Wrap jQuery.readyException in a function so that the lookup
			// happens at the time of error handling instead of callback
			// registration.
			.catch( function( error ) {
				jQuery.readyException( error );
			} );

		return this;
	};

	jQuery.extend( {

		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,

		// A counter to track how many items to wait for before
		// the ready event fires. See trac-6781
		readyWait: 1,

		// Handle when the DOM is ready
		ready: function( wait ) {

			// Abort if there are pending holds or we're already ready
			if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
				return;
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );
		}
	} );

	jQuery.ready.then = readyList.then;

	// The ready event handler and self cleanup method
	function completed() {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );
		jQuery.ready();
	}

	// Catch cases where $(document).ready() is called
	// after the browser event has already occurred.
	// Support: IE <=9 - 10 only
	// Older IE sometimes signals "interactive" too soon
	if ( document.readyState === "complete" ||
		( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

		// Handle it asynchronously to allow scripts the opportunity to delay ready
		window.setTimeout( jQuery.ready );

	} else {

		// Use the handy event callback
		document.addEventListener( "DOMContentLoaded", completed );

		// A fallback to window.onload, that will always work
		window.addEventListener( "load", completed );
	}




	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			len = elems.length,
			bulk = key == null;

		// Sets many values
		if ( toType( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				access( elems, fn, i, key[ i ], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {

				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, _key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < len; i++ ) {
					fn(
						elems[ i ], key, raw ?
							value :
							value.call( elems[ i ], i, fn( elems[ i ], key ) )
					);
				}
			}
		}

		if ( chainable ) {
			return elems;
		}

		// Gets
		if ( bulk ) {
			return fn.call( elems );
		}

		return len ? fn( elems[ 0 ], key ) : emptyGet;
	};


	// Matches dashed string for camelizing
	var rmsPrefix = /^-ms-/,
		rdashAlpha = /-([a-z])/g;

	// Used by camelCase as callback to replace()
	function fcamelCase( _all, letter ) {
		return letter.toUpperCase();
	}

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE <=9 - 11, Edge 12 - 15
	// Microsoft forgot to hump their vendor prefix (trac-9572)
	function camelCase( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	}
	var acceptData = function( owner ) {

		// Accepts only:
		//  - Node
		//    - Node.ELEMENT_NODE
		//    - Node.DOCUMENT_NODE
		//  - Object
		//    - Any
		return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
	};




	function Data() {
		this.expando = jQuery.expando + Data.uid++;
	}

	Data.uid = 1;

	Data.prototype = {

		cache: function( owner ) {

			// Check if the owner object already has a cache
			var value = owner[ this.expando ];

			// If not, create one
			if ( !value ) {
				value = {};

				// We can accept data for non-element nodes in modern browsers,
				// but we should not, see trac-8335.
				// Always return an empty object.
				if ( acceptData( owner ) ) {

					// If it is a node unlikely to be stringify-ed or looped over
					// use plain assignment
					if ( owner.nodeType ) {
						owner[ this.expando ] = value;

					// Otherwise secure it in a non-enumerable property
					// configurable must be true to allow the property to be
					// deleted when data is removed
					} else {
						Object.defineProperty( owner, this.expando, {
							value: value,
							configurable: true
						} );
					}
				}
			}

			return value;
		},
		set: function( owner, data, value ) {
			var prop,
				cache = this.cache( owner );

			// Handle: [ owner, key, value ] args
			// Always use camelCase key (gh-2257)
			if ( typeof data === "string" ) {
				cache[ camelCase( data ) ] = value;

			// Handle: [ owner, { properties } ] args
			} else {

				// Copy the properties one-by-one to the cache object
				for ( prop in data ) {
					cache[ camelCase( prop ) ] = data[ prop ];
				}
			}
			return cache;
		},
		get: function( owner, key ) {
			return key === undefined ?
				this.cache( owner ) :

				// Always use camelCase key (gh-2257)
				owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
		},
		access: function( owner, key, value ) {

			// In cases where either:
			//
			//   1. No key was specified
			//   2. A string key was specified, but no value provided
			//
			// Take the "read" path and allow the get method to determine
			// which value to return, respectively either:
			//
			//   1. The entire cache object
			//   2. The data stored at the key
			//
			if ( key === undefined ||
					( ( key && typeof key === "string" ) && value === undefined ) ) {

				return this.get( owner, key );
			}

			// When the key is not a string, or both a key and value
			// are specified, set or extend (existing objects) with either:
			//
			//   1. An object of properties
			//   2. A key and value
			//
			this.set( owner, key, value );

			// Since the "set" path can have two possible entry points
			// return the expected data based on which path was taken[*]
			return value !== undefined ? value : key;
		},
		remove: function( owner, key ) {
			var i,
				cache = owner[ this.expando ];

			if ( cache === undefined ) {
				return;
			}

			if ( key !== undefined ) {

				// Support array or space separated string of keys
				if ( Array.isArray( key ) ) {

					// If key is an array of keys...
					// We always set camelCase keys, so remove that.
					key = key.map( camelCase );
				} else {
					key = camelCase( key );

					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					key = key in cache ?
						[ key ] :
						( key.match( rnothtmlwhite ) || [] );
				}

				i = key.length;

				while ( i-- ) {
					delete cache[ key[ i ] ];
				}
			}

			// Remove the expando if there's no more data
			if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

				// Support: Chrome <=35 - 45
				// Webkit & Blink performance suffers when deleting properties
				// from DOM nodes, so set to undefined instead
				// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
				if ( owner.nodeType ) {
					owner[ this.expando ] = undefined;
				} else {
					delete owner[ this.expando ];
				}
			}
		},
		hasData: function( owner ) {
			var cache = owner[ this.expando ];
			return cache !== undefined && !jQuery.isEmptyObject( cache );
		}
	};
	var dataPriv = new Data();

	var dataUser = new Data();



	//	Implementation Summary
	//
	//	1. Enforce API surface and semantic compatibility with 1.9.x branch
	//	2. Improve the module's maintainability by reducing the storage
	//		paths to a single mechanism.
	//	3. Use the same single mechanism to support "private" and "user" data.
	//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	//	5. Avoid exposing implementation details on user objects (eg. expando properties)
	//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

	var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
		rmultiDash = /[A-Z]/g;

	function getData( data ) {
		if ( data === "true" ) {
			return true;
		}

		if ( data === "false" ) {
			return false;
		}

		if ( data === "null" ) {
			return null;
		}

		// Only convert to a number if it doesn't change the string
		if ( data === +data + "" ) {
			return +data;
		}

		if ( rbrace.test( data ) ) {
			return JSON.parse( data );
		}

		return data;
	}

	function dataAttr( elem, key, data ) {
		var name;

		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
			name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
			data = elem.getAttribute( name );

			if ( typeof data === "string" ) {
				try {
					data = getData( data );
				} catch ( e ) {}

				// Make sure we set the data so it isn't changed later
				dataUser.set( elem, key, data );
			} else {
				data = undefined;
			}
		}
		return data;
	}

	jQuery.extend( {
		hasData: function( elem ) {
			return dataUser.hasData( elem ) || dataPriv.hasData( elem );
		},

		data: function( elem, name, data ) {
			return dataUser.access( elem, name, data );
		},

		removeData: function( elem, name ) {
			dataUser.remove( elem, name );
		},

		// TODO: Now that all calls to _data and _removeData have been replaced
		// with direct calls to dataPriv methods, these can be deprecated.
		_data: function( elem, name, data ) {
			return dataPriv.access( elem, name, data );
		},

		_removeData: function( elem, name ) {
			dataPriv.remove( elem, name );
		}
	} );

	jQuery.fn.extend( {
		data: function( key, value ) {
			var i, name, data,
				elem = this[ 0 ],
				attrs = elem && elem.attributes;

			// Gets all values
			if ( key === undefined ) {
				if ( this.length ) {
					data = dataUser.get( elem );

					if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
						i = attrs.length;
						while ( i-- ) {

							// Support: IE 11 only
							// The attrs elements can be null (trac-14894)
							if ( attrs[ i ] ) {
								name = attrs[ i ].name;
								if ( name.indexOf( "data-" ) === 0 ) {
									name = camelCase( name.slice( 5 ) );
									dataAttr( elem, name, data[ name ] );
								}
							}
						}
						dataPriv.set( elem, "hasDataAttrs", true );
					}
				}

				return data;
			}

			// Sets multiple values
			if ( typeof key === "object" ) {
				return this.each( function() {
					dataUser.set( this, key );
				} );
			}

			return access( this, function( value ) {
				var data;

				// The calling jQuery object (element matches) is not empty
				// (and therefore has an element appears at this[ 0 ]) and the
				// `value` parameter was not undefined. An empty jQuery object
				// will result in `undefined` for elem = this[ 0 ] which will
				// throw an exception if an attempt to read a data cache is made.
				if ( elem && value === undefined ) {

					// Attempt to get data from the cache
					// The key will always be camelCased in Data
					data = dataUser.get( elem, key );
					if ( data !== undefined ) {
						return data;
					}

					// Attempt to "discover" the data in
					// HTML5 custom data-* attrs
					data = dataAttr( elem, key );
					if ( data !== undefined ) {
						return data;
					}

					// We tried really hard, but the data doesn't exist.
					return;
				}

				// Set the data...
				this.each( function() {

					// We always store the camelCased key
					dataUser.set( this, key, value );
				} );
			}, null, value, arguments.length > 1, null, true );
		},

		removeData: function( key ) {
			return this.each( function() {
				dataUser.remove( this, key );
			} );
		}
	} );


	jQuery.extend( {
		queue: function( elem, type, data ) {
			var queue;

			if ( elem ) {
				type = ( type || "fx" ) + "queue";
				queue = dataPriv.get( elem, type );

				// Speed up dequeue by getting out quickly if this is just a lookup
				if ( data ) {
					if ( !queue || Array.isArray( data ) ) {
						queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
					} else {
						queue.push( data );
					}
				}
				return queue || [];
			}
		},

		dequeue: function( elem, type ) {
			type = type || "fx";

			var queue = jQuery.queue( elem, type ),
				startLength = queue.length,
				fn = queue.shift(),
				hooks = jQuery._queueHooks( elem, type ),
				next = function() {
					jQuery.dequeue( elem, type );
				};

			// If the fx queue is dequeued, always remove the progress sentinel
			if ( fn === "inprogress" ) {
				fn = queue.shift();
				startLength--;
			}

			if ( fn ) {

				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if ( type === "fx" ) {
					queue.unshift( "inprogress" );
				}

				// Clear up the last queue stop function
				delete hooks.stop;
				fn.call( elem, next, hooks );
			}

			if ( !startLength && hooks ) {
				hooks.empty.fire();
			}
		},

		// Not public - generate a queueHooks object, or return the current one
		_queueHooks: function( elem, type ) {
			var key = type + "queueHooks";
			return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
				empty: jQuery.Callbacks( "once memory" ).add( function() {
					dataPriv.remove( elem, [ type + "queue", key ] );
				} )
			} );
		}
	} );

	jQuery.fn.extend( {
		queue: function( type, data ) {
			var setter = 2;

			if ( typeof type !== "string" ) {
				data = type;
				type = "fx";
				setter--;
			}

			if ( arguments.length < setter ) {
				return jQuery.queue( this[ 0 ], type );
			}

			return data === undefined ?
				this :
				this.each( function() {
					var queue = jQuery.queue( this, type, data );

					// Ensure a hooks for this queue
					jQuery._queueHooks( this, type );

					if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
						jQuery.dequeue( this, type );
					}
				} );
		},
		dequeue: function( type ) {
			return this.each( function() {
				jQuery.dequeue( this, type );
			} );
		},
		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		},

		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function( type, obj ) {
			var tmp,
				count = 1,
				defer = jQuery.Deferred(),
				elements = this,
				i = this.length,
				resolve = function() {
					if ( !( --count ) ) {
						defer.resolveWith( elements, [ elements ] );
					}
				};

			if ( typeof type !== "string" ) {
				obj = type;
				type = undefined;
			}
			type = type || "fx";

			while ( i-- ) {
				tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
				if ( tmp && tmp.empty ) {
					count++;
					tmp.empty.add( resolve );
				}
			}
			resolve();
			return defer.promise( obj );
		}
	} );
	var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

	var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


	var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

	var documentElement = document.documentElement;



		var isAttached = function( elem ) {
				return jQuery.contains( elem.ownerDocument, elem );
			},
			composed = { composed: true };

		// Support: IE 9 - 11+, Edge 12 - 18+, iOS 10.0 - 10.2 only
		// Check attachment across shadow DOM boundaries when possible (gh-3504)
		// Support: iOS 10.0-10.2 only
		// Early iOS 10 versions support `attachShadow` but not `getRootNode`,
		// leading to errors. We need to check for `getRootNode`.
		if ( documentElement.getRootNode ) {
			isAttached = function( elem ) {
				return jQuery.contains( elem.ownerDocument, elem ) ||
					elem.getRootNode( composed ) === elem.ownerDocument;
			};
		}
	var isHiddenWithinTree = function( elem, el ) {

			// isHiddenWithinTree might be called from jQuery#filter function;
			// in that case, element will be second argument
			elem = el || elem;

			// Inline style trumps all
			return elem.style.display === "none" ||
				elem.style.display === "" &&

				// Otherwise, check computed style
				// Support: Firefox <=43 - 45
				// Disconnected elements can have computed display: none, so first confirm that elem is
				// in the document.
				isAttached( elem ) &&

				jQuery.css( elem, "display" ) === "none";
		};



	function adjustCSS( elem, prop, valueParts, tween ) {
		var adjusted, scale,
			maxIterations = 20,
			currentValue = tween ?
				function() {
					return tween.cur();
				} :
				function() {
					return jQuery.css( elem, prop, "" );
				},
			initial = currentValue(),
			unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

			// Starting value computation is required for potential unit mismatches
			initialInUnit = elem.nodeType &&
				( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
				rcssNum.exec( jQuery.css( elem, prop ) );

		if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

			// Support: Firefox <=54
			// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
			initial = initial / 2;

			// Trust units reported by jQuery.css
			unit = unit || initialInUnit[ 3 ];

			// Iteratively approximate from a nonzero starting point
			initialInUnit = +initial || 1;

			while ( maxIterations-- ) {

				// Evaluate and update our best guess (doubling guesses that zero out).
				// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
				jQuery.style( elem, prop, initialInUnit + unit );
				if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
					maxIterations = 0;
				}
				initialInUnit = initialInUnit / scale;

			}

			initialInUnit = initialInUnit * 2;
			jQuery.style( elem, prop, initialInUnit + unit );

			// Make sure we update the tween properties later on
			valueParts = valueParts || [];
		}

		if ( valueParts ) {
			initialInUnit = +initialInUnit || +initial || 0;

			// Apply relative offset (+=/-=) if specified
			adjusted = valueParts[ 1 ] ?
				initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
				+valueParts[ 2 ];
			if ( tween ) {
				tween.unit = unit;
				tween.start = initialInUnit;
				tween.end = adjusted;
			}
		}
		return adjusted;
	}


	var defaultDisplayMap = {};

	function getDefaultDisplay( elem ) {
		var temp,
			doc = elem.ownerDocument,
			nodeName = elem.nodeName,
			display = defaultDisplayMap[ nodeName ];

		if ( display ) {
			return display;
		}

		temp = doc.body.appendChild( doc.createElement( nodeName ) );
		display = jQuery.css( temp, "display" );

		temp.parentNode.removeChild( temp );

		if ( display === "none" ) {
			display = "block";
		}
		defaultDisplayMap[ nodeName ] = display;

		return display;
	}

	function showHide( elements, show ) {
		var display, elem,
			values = [],
			index = 0,
			length = elements.length;

		// Determine new display value for elements that need to change
		for ( ; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}

			display = elem.style.display;
			if ( show ) {

				// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
				// check is required in this first loop unless we have a nonempty display value (either
				// inline or about-to-be-restored)
				if ( display === "none" ) {
					values[ index ] = dataPriv.get( elem, "display" ) || null;
					if ( !values[ index ] ) {
						elem.style.display = "";
					}
				}
				if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
					values[ index ] = getDefaultDisplay( elem );
				}
			} else {
				if ( display !== "none" ) {
					values[ index ] = "none";

					// Remember what we're overwriting
					dataPriv.set( elem, "display", display );
				}
			}
		}

		// Set the display of the elements in a second loop to avoid constant reflow
		for ( index = 0; index < length; index++ ) {
			if ( values[ index ] != null ) {
				elements[ index ].style.display = values[ index ];
			}
		}

		return elements;
	}

	jQuery.fn.extend( {
		show: function() {
			return showHide( this, true );
		},
		hide: function() {
			return showHide( this );
		},
		toggle: function( state ) {
			if ( typeof state === "boolean" ) {
				return state ? this.show() : this.hide();
			}

			return this.each( function() {
				if ( isHiddenWithinTree( this ) ) {
					jQuery( this ).show();
				} else {
					jQuery( this ).hide();
				}
			} );
		}
	} );
	var rcheckableType = ( /^(?:checkbox|radio)$/i );

	var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]*)/i );

	var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



	( function() {
		var fragment = document.createDocumentFragment(),
			div = fragment.appendChild( document.createElement( "div" ) ),
			input = document.createElement( "input" );

		// Support: Android 4.0 - 4.3 only
		// Check state lost if the name is set (trac-11217)
		// Support: Windows Web Apps (WWA)
		// `name` and `type` must use .setAttribute for WWA (trac-14901)
		input.setAttribute( "type", "radio" );
		input.setAttribute( "checked", "checked" );
		input.setAttribute( "name", "t" );

		div.appendChild( input );

		// Support: Android <=4.1 only
		// Older WebKit doesn't clone checked state correctly in fragments
		support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

		// Support: IE <=11 only
		// Make sure textarea (and checkbox) defaultValue is properly cloned
		div.innerHTML = "<textarea>x</textarea>";
		support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

		// Support: IE <=9 only
		// IE <=9 replaces <option> tags with their contents when inserted outside of
		// the select element.
		div.innerHTML = "<option></option>";
		support.option = !!div.lastChild;
	} )();


	// We have to close these tags to support XHTML (trac-13200)
	var wrapMap = {

		// XHTML parsers do not magically insert elements in the
		// same way that tag soup parsers do. So we cannot shorten
		// this by omitting <tbody> or other required elements.
		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;

	// Support: IE <=9 only
	if ( !support.option ) {
		wrapMap.optgroup = wrapMap.option = [ 1, "<select multiple='multiple'>", "</select>" ];
	}


	function getAll( context, tag ) {

		// Support: IE <=9 - 11 only
		// Use typeof to avoid zero-argument method invocation on host objects (trac-15151)
		var ret;

		if ( typeof context.getElementsByTagName !== "undefined" ) {
			ret = context.getElementsByTagName( tag || "*" );

		} else if ( typeof context.querySelectorAll !== "undefined" ) {
			ret = context.querySelectorAll( tag || "*" );

		} else {
			ret = [];
		}

		if ( tag === undefined || tag && nodeName( context, tag ) ) {
			return jQuery.merge( [ context ], ret );
		}

		return ret;
	}


	// Mark scripts as having already been evaluated
	function setGlobalEval( elems, refElements ) {
		var i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			dataPriv.set(
				elems[ i ],
				"globalEval",
				!refElements || dataPriv.get( refElements[ i ], "globalEval" )
			);
		}
	}


	var rhtml = /<|&#?\w+;/;

	function buildFragment( elems, context, scripts, selection, ignored ) {
		var elem, tmp, tag, wrap, attached, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( toType( elem ) === "object" ) {

					// Support: Android <=4.0 only, PhantomJS 1 only
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: Android <=4.0 only, PhantomJS 1 only
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Ensure the created nodes are orphaned (trac-12392)
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( ( elem = nodes[ i++ ] ) ) {

			// Skip elements already in the context collection (trac-4087)
			if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
				if ( ignored ) {
					ignored.push( elem );
				}
				continue;
			}

			attached = isAttached( elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( attached ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( ( elem = tmp[ j++ ] ) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	}


	var rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

	function returnTrue() {
		return true;
	}

	function returnFalse() {
		return false;
	}

	function on( elem, types, selector, data, fn, one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {

			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {

				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				on( elem, type, selector, data, types[ type ], one );
			}
			return elem;
		}

		if ( data == null && fn == null ) {

			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {

				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {

				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return elem;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {

				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};

			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return elem.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		} );
	}

	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	jQuery.event = {

		global: {},

		add: function( elem, types, handler, data, selector ) {

			var handleObjIn, eventHandle, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.get( elem );

			// Only attach events to objects that accept data
			if ( !acceptData( elem ) ) {
				return;
			}

			// Caller can pass in an object of custom data in lieu of the handler
			if ( handler.handler ) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}

			// Ensure that invalid selectors throw exceptions at attach time
			// Evaluate against documentElement in case elem is a non-element node (e.g., document)
			if ( selector ) {
				jQuery.find.matchesSelector( documentElement, selector );
			}

			// Make sure that the handler has a unique ID, used to find/remove it later
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}

			// Init the element's event structure and main handler, if this is the first
			if ( !( events = elemData.events ) ) {
				events = elemData.events = Object.create( null );
			}
			if ( !( eventHandle = elemData.handle ) ) {
				eventHandle = elemData.handle = function( e ) {

					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
						jQuery.event.dispatch.apply( elem, arguments ) : undefined;
				};
			}

			// Handle multiple events separated by a space
			types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// There *must* be a type, no attaching namespace-only handlers
				if ( !type ) {
					continue;
				}

				// If event changes its type, use the special event handlers for the changed type
				special = jQuery.event.special[ type ] || {};

				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;

				// Update special based on newly reset type
				special = jQuery.event.special[ type ] || {};

				// handleObj is passed to all event handlers
				handleObj = jQuery.extend( {
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
					namespace: namespaces.join( "." )
				}, handleObjIn );

				// Init the event handler queue if we're the first
				if ( !( handlers = events[ type ] ) ) {
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;

					// Only use addEventListener if the special events handler returns false
					if ( !special.setup ||
						special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle );
						}
					}
				}

				if ( special.add ) {
					special.add.call( elem, handleObj );

					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}

				// Add to the element's handler list, delegates in front
				if ( selector ) {
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}

				// Keep track of which events have ever been used, for event optimization
				jQuery.event.global[ type ] = true;
			}

		},

		// Detach an event or set of events from an element
		remove: function( elem, types, handler, selector, mappedTypes ) {

			var j, origCount, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

			if ( !elemData || !( events = elemData.events ) ) {
				return;
			}

			// Once for each type.namespace in types; type may be omitted
			types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {
						jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}

				special = jQuery.event.special[ type ] || {};
				type = ( selector ? special.delegateType : special.bindType ) || type;
				handlers = events[ type ] || [];
				tmp = tmp[ 2 ] &&
					new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

				// Remove matching events
				origCount = j = handlers.length;
				while ( j-- ) {
					handleObj = handlers[ j ];

					if ( ( mappedTypes || origType === handleObj.origType ) &&
						( !handler || handler.guid === handleObj.guid ) &&
						( !tmp || tmp.test( handleObj.namespace ) ) &&
						( !selector || selector === handleObj.selector ||
							selector === "**" && handleObj.selector ) ) {
						handlers.splice( j, 1 );

						if ( handleObj.selector ) {
							handlers.delegateCount--;
						}
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}

				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if ( origCount && !handlers.length ) {
					if ( !special.teardown ||
						special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

						jQuery.removeEvent( elem, type, elemData.handle );
					}

					delete events[ type ];
				}
			}

			// Remove data and the expando if it's no longer used
			if ( jQuery.isEmptyObject( events ) ) {
				dataPriv.remove( elem, "handle events" );
			}
		},

		dispatch: function( nativeEvent ) {

			var i, j, ret, matched, handleObj, handlerQueue,
				args = new Array( arguments.length ),

				// Make a writable jQuery.Event from the native event object
				event = jQuery.event.fix( nativeEvent ),

				handlers = (
					dataPriv.get( this, "events" ) || Object.create( null )
				)[ event.type ] || [],
				special = jQuery.event.special[ event.type ] || {};

			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[ 0 ] = event;

			for ( i = 1; i < arguments.length; i++ ) {
				args[ i ] = arguments[ i ];
			}

			event.delegateTarget = this;

			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}

			// Determine handlers
			handlerQueue = jQuery.event.handlers.call( this, event, handlers );

			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
				event.currentTarget = matched.elem;

				j = 0;
				while ( ( handleObj = matched.handlers[ j++ ] ) &&
					!event.isImmediatePropagationStopped() ) {

					// If the event is namespaced, then each handler is only invoked if it is
					// specially universal or its namespaces are a superset of the event's.
					if ( !event.rnamespace || handleObj.namespace === false ||
						event.rnamespace.test( handleObj.namespace ) ) {

						event.handleObj = handleObj;
						event.data = handleObj.data;

						ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
							handleObj.handler ).apply( matched.elem, args );

						if ( ret !== undefined ) {
							if ( ( event.result = ret ) === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}

			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}

			return event.result;
		},

		handlers: function( event, handlers ) {
			var i, handleObj, sel, matchedHandlers, matchedSelectors,
				handlerQueue = [],
				delegateCount = handlers.delegateCount,
				cur = event.target;

			// Find delegate handlers
			if ( delegateCount &&

				// Support: IE <=9
				// Black-hole SVG <use> instance trees (trac-13180)
				cur.nodeType &&

				// Support: Firefox <=42
				// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
				// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
				// Support: IE 11 only
				// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
				!( event.type === "click" && event.button >= 1 ) ) {

				for ( ; cur !== this; cur = cur.parentNode || this ) {

					// Don't check non-elements (trac-13208)
					// Don't process clicks on disabled elements (trac-6911, trac-8165, trac-11382, trac-11764)
					if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
						matchedHandlers = [];
						matchedSelectors = {};
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];

							// Don't conflict with Object.prototype properties (trac-13203)
							sel = handleObj.selector + " ";

							if ( matchedSelectors[ sel ] === undefined ) {
								matchedSelectors[ sel ] = handleObj.needsContext ?
									jQuery( sel, this ).index( cur ) > -1 :
									jQuery.find( sel, this, null, [ cur ] ).length;
							}
							if ( matchedSelectors[ sel ] ) {
								matchedHandlers.push( handleObj );
							}
						}
						if ( matchedHandlers.length ) {
							handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
						}
					}
				}
			}

			// Add the remaining (directly-bound) handlers
			cur = this;
			if ( delegateCount < handlers.length ) {
				handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
			}

			return handlerQueue;
		},

		addProp: function( name, hook ) {
			Object.defineProperty( jQuery.Event.prototype, name, {
				enumerable: true,
				configurable: true,

				get: isFunction( hook ) ?
					function() {
						if ( this.originalEvent ) {
							return hook( this.originalEvent );
						}
					} :
					function() {
						if ( this.originalEvent ) {
							return this.originalEvent[ name ];
						}
					},

				set: function( value ) {
					Object.defineProperty( this, name, {
						enumerable: true,
						configurable: true,
						writable: true,
						value: value
					} );
				}
			} );
		},

		fix: function( originalEvent ) {
			return originalEvent[ jQuery.expando ] ?
				originalEvent :
				new jQuery.Event( originalEvent );
		},

		special: {
			load: {

				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			click: {

				// Utilize native event to ensure correct state for checkable inputs
				setup: function( data ) {

					// For mutual compressibility with _default, replace `this` access with a local var.
					// `|| data` is dead code meant only to preserve the variable through minification.
					var el = this || data;

					// Claim the first handler
					if ( rcheckableType.test( el.type ) &&
						el.click && nodeName( el, "input" ) ) {

						// dataPriv.set( el, "click", ... )
						leverageNative( el, "click", true );
					}

					// Return false to allow normal processing in the caller
					return false;
				},
				trigger: function( data ) {

					// For mutual compressibility with _default, replace `this` access with a local var.
					// `|| data` is dead code meant only to preserve the variable through minification.
					var el = this || data;

					// Force setup before triggering a click
					if ( rcheckableType.test( el.type ) &&
						el.click && nodeName( el, "input" ) ) {

						leverageNative( el, "click" );
					}

					// Return non-false to allow normal event-path propagation
					return true;
				},

				// For cross-browser consistency, suppress native .click() on links
				// Also prevent it if we're currently inside a leveraged native-event stack
				_default: function( event ) {
					var target = event.target;
					return rcheckableType.test( target.type ) &&
						target.click && nodeName( target, "input" ) &&
						dataPriv.get( target, "click" ) ||
						nodeName( target, "a" );
				}
			},

			beforeunload: {
				postDispatch: function( event ) {

					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if ( event.result !== undefined && event.originalEvent ) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		}
	};

	// Ensure the presence of an event listener that handles manually-triggered
	// synthetic events by interrupting progress until reinvoked in response to
	// *native* events that it fires directly, ensuring that state changes have
	// already occurred before other listeners are invoked.
	function leverageNative( el, type, isSetup ) {

		// Missing `isSetup` indicates a trigger call, which must force setup through jQuery.event.add
		if ( !isSetup ) {
			if ( dataPriv.get( el, type ) === undefined ) {
				jQuery.event.add( el, type, returnTrue );
			}
			return;
		}

		// Register the controller as a special universal handler for all event namespaces
		dataPriv.set( el, type, false );
		jQuery.event.add( el, type, {
			namespace: false,
			handler: function( event ) {
				var result,
					saved = dataPriv.get( this, type );

				if ( ( event.isTrigger & 1 ) && this[ type ] ) {

					// Interrupt processing of the outer synthetic .trigger()ed event
					if ( !saved ) {

						// Store arguments for use when handling the inner native event
						// There will always be at least one argument (an event object), so this array
						// will not be confused with a leftover capture object.
						saved = slice.call( arguments );
						dataPriv.set( this, type, saved );

						// Trigger the native event and capture its result
						this[ type ]();
						result = dataPriv.get( this, type );
						dataPriv.set( this, type, false );

						if ( saved !== result ) {

							// Cancel the outer synthetic event
							event.stopImmediatePropagation();
							event.preventDefault();

							return result;
						}

					// If this is an inner synthetic event for an event with a bubbling surrogate
					// (focus or blur), assume that the surrogate already propagated from triggering
					// the native event and prevent that from happening again here.
					// This technically gets the ordering wrong w.r.t. to `.trigger()` (in which the
					// bubbling surrogate propagates *after* the non-bubbling base), but that seems
					// less bad than duplication.
					} else if ( ( jQuery.event.special[ type ] || {} ).delegateType ) {
						event.stopPropagation();
					}

				// If this is a native event triggered above, everything is now in order
				// Fire an inner synthetic event with the original arguments
				} else if ( saved ) {

					// ...and capture the result
					dataPriv.set( this, type, jQuery.event.trigger(
						saved[ 0 ],
						saved.slice( 1 ),
						this
					) );

					// Abort handling of the native event by all jQuery handlers while allowing
					// native handlers on the same element to run. On target, this is achieved
					// by stopping immediate propagation just on the jQuery event. However,
					// the native event is re-wrapped by a jQuery one on each level of the
					// propagation so the only way to stop it for jQuery is to stop it for
					// everyone via native `stopPropagation()`. This is not a problem for
					// focus/blur which don't bubble, but it does also stop click on checkboxes
					// and radios. We accept this limitation.
					event.stopPropagation();
					event.isImmediatePropagationStopped = returnTrue;
				}
			}
		} );
	}

	jQuery.removeEvent = function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	};

	jQuery.Event = function( src, props ) {

		// Allow instantiation without the 'new' keyword
		if ( !( this instanceof jQuery.Event ) ) {
			return new jQuery.Event( src, props );
		}

		// Event object
		if ( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented ||
					src.defaultPrevented === undefined &&

					// Support: Android <=2.3 only
					src.returnValue === false ?
				returnTrue :
				returnFalse;

			// Create target properties
			// Support: Safari <=6 - 7 only
			// Target should not be a text node (trac-504, trac-13143)
			this.target = ( src.target && src.target.nodeType === 3 ) ?
				src.target.parentNode :
				src.target;

			this.currentTarget = src.currentTarget;
			this.relatedTarget = src.relatedTarget;

		// Event type
		} else {
			this.type = src;
		}

		// Put explicitly provided properties onto the event object
		if ( props ) {
			jQuery.extend( this, props );
		}

		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || Date.now();

		// Mark it as fixed
		this[ jQuery.expando ] = true;
	};

	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		constructor: jQuery.Event,
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,
		isSimulated: false,

		preventDefault: function() {
			var e = this.originalEvent;

			this.isDefaultPrevented = returnTrue;

			if ( e && !this.isSimulated ) {
				e.preventDefault();
			}
		},
		stopPropagation: function() {
			var e = this.originalEvent;

			this.isPropagationStopped = returnTrue;

			if ( e && !this.isSimulated ) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			var e = this.originalEvent;

			this.isImmediatePropagationStopped = returnTrue;

			if ( e && !this.isSimulated ) {
				e.stopImmediatePropagation();
			}

			this.stopPropagation();
		}
	};

	// Includes all common event props including KeyEvent and MouseEvent specific props
	jQuery.each( {
		altKey: true,
		bubbles: true,
		cancelable: true,
		changedTouches: true,
		ctrlKey: true,
		detail: true,
		eventPhase: true,
		metaKey: true,
		pageX: true,
		pageY: true,
		shiftKey: true,
		view: true,
		"char": true,
		code: true,
		charCode: true,
		key: true,
		keyCode: true,
		button: true,
		buttons: true,
		clientX: true,
		clientY: true,
		offsetX: true,
		offsetY: true,
		pointerId: true,
		pointerType: true,
		screenX: true,
		screenY: true,
		targetTouches: true,
		toElement: true,
		touches: true,
		which: true
	}, jQuery.event.addProp );

	jQuery.each( { focus: "focusin", blur: "focusout" }, function( type, delegateType ) {

		function focusMappedHandler( nativeEvent ) {
			if ( document.documentMode ) {

				// Support: IE 11+
				// Attach a single focusin/focusout handler on the document while someone wants
				// focus/blur. This is because the former are synchronous in IE while the latter
				// are async. In other browsers, all those handlers are invoked synchronously.

				// `handle` from private data would already wrap the event, but we need
				// to change the `type` here.
				var handle = dataPriv.get( this, "handle" ),
					event = jQuery.event.fix( nativeEvent );
				event.type = nativeEvent.type === "focusin" ? "focus" : "blur";
				event.isSimulated = true;

				// First, handle focusin/focusout
				handle( nativeEvent );

				// ...then, handle focus/blur
				//
				// focus/blur don't bubble while focusin/focusout do; simulate the former by only
				// invoking the handler at the lower level.
				if ( event.target === event.currentTarget ) {

					// The setup part calls `leverageNative`, which, in turn, calls
					// `jQuery.event.add`, so event handle will already have been set
					// by this point.
					handle( event );
				}
			} else {

				// For non-IE browsers, attach a single capturing handler on the document
				// while someone wants focusin/focusout.
				jQuery.event.simulate( delegateType, nativeEvent.target,
					jQuery.event.fix( nativeEvent ) );
			}
		}

		jQuery.event.special[ type ] = {

			// Utilize native event if possible so blur/focus sequence is correct
			setup: function() {

				var attaches;

				// Claim the first handler
				// dataPriv.set( this, "focus", ... )
				// dataPriv.set( this, "blur", ... )
				leverageNative( this, type, true );

				if ( document.documentMode ) {

					// Support: IE 9 - 11+
					// We use the same native handler for focusin & focus (and focusout & blur)
					// so we need to coordinate setup & teardown parts between those events.
					// Use `delegateType` as the key as `type` is already used by `leverageNative`.
					attaches = dataPriv.get( this, delegateType );
					if ( !attaches ) {
						this.addEventListener( delegateType, focusMappedHandler );
					}
					dataPriv.set( this, delegateType, ( attaches || 0 ) + 1 );
				} else {

					// Return false to allow normal processing in the caller
					return false;
				}
			},
			trigger: function() {

				// Force setup before trigger
				leverageNative( this, type );

				// Return non-false to allow normal event-path propagation
				return true;
			},

			teardown: function() {
				var attaches;

				if ( document.documentMode ) {
					attaches = dataPriv.get( this, delegateType ) - 1;
					if ( !attaches ) {
						this.removeEventListener( delegateType, focusMappedHandler );
						dataPriv.remove( this, delegateType );
					} else {
						dataPriv.set( this, delegateType, attaches );
					}
				} else {

					// Return false to indicate standard teardown should be applied
					return false;
				}
			},

			// Suppress native focus or blur if we're currently inside
			// a leveraged native-event stack
			_default: function( event ) {
				return dataPriv.get( event.target, type );
			},

			delegateType: delegateType
		};

		// Support: Firefox <=44
		// Firefox doesn't have focus(in | out) events
		// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
		//
		// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
		// focus(in | out) events fire after focus & blur events,
		// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
		// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
		//
		// Support: IE 9 - 11+
		// To preserve relative focusin/focus & focusout/blur event order guaranteed on the 3.x branch,
		// attach a single handler for both events in IE.
		jQuery.event.special[ delegateType ] = {
			setup: function() {

				// Handle: regular nodes (via `this.ownerDocument`), window
				// (via `this.document`) & document (via `this`).
				var doc = this.ownerDocument || this.document || this,
					dataHolder = document.documentMode ? this : doc,
					attaches = dataPriv.get( dataHolder, delegateType );

				// Support: IE 9 - 11+
				// We use the same native handler for focusin & focus (and focusout & blur)
				// so we need to coordinate setup & teardown parts between those events.
				// Use `delegateType` as the key as `type` is already used by `leverageNative`.
				if ( !attaches ) {
					if ( document.documentMode ) {
						this.addEventListener( delegateType, focusMappedHandler );
					} else {
						doc.addEventListener( type, focusMappedHandler, true );
					}
				}
				dataPriv.set( dataHolder, delegateType, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this.document || this,
					dataHolder = document.documentMode ? this : doc,
					attaches = dataPriv.get( dataHolder, delegateType ) - 1;

				if ( !attaches ) {
					if ( document.documentMode ) {
						this.removeEventListener( delegateType, focusMappedHandler );
					} else {
						doc.removeEventListener( type, focusMappedHandler, true );
					}
					dataPriv.remove( dataHolder, delegateType );
				} else {
					dataPriv.set( dataHolder, delegateType, attaches );
				}
			}
		};
	} );

	// Create mouseenter/leave events using mouseover/out and event-time checks
	// so that event delegation works in jQuery.
	// Do the same for pointerenter/pointerleave and pointerover/pointerout
	//
	// Support: Safari 7 only
	// Safari sends mouseenter too often; see:
	// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
	// for the description of the bug (it existed in older Chrome versions as well).
	jQuery.each( {
		mouseenter: "mouseover",
		mouseleave: "mouseout",
		pointerenter: "pointerover",
		pointerleave: "pointerout"
	}, function( orig, fix ) {
		jQuery.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,

			handle: function( event ) {
				var ret,
					target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj;

				// For mouseenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	} );

	jQuery.fn.extend( {

		on: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn );
		},
		one: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn, 1 );
		},
		off: function( types, selector, fn ) {
			var handleObj, type;
			if ( types && types.preventDefault && types.handleObj ) {

				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ?
						handleObj.origType + "." + handleObj.namespace :
						handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			if ( typeof types === "object" ) {

				// ( types-object [, selector] )
				for ( type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			if ( selector === false || typeof selector === "function" ) {

				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if ( fn === false ) {
				fn = returnFalse;
			}
			return this.each( function() {
				jQuery.event.remove( this, types, fn, selector );
			} );
		}
	} );


	var

		// Support: IE <=10 - 11, Edge 12 - 13 only
		// In IE/Edge using regex groups here causes severe slowdowns.
		// See https://connect.microsoft.com/IE/feedback/details/1736512/
		rnoInnerhtml = /<script|<style|<link/i,

		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,

		rcleanScript = /^\s*<!\[CDATA\[|\]\]>\s*$/g;

	// Prefer a tbody over its parent table for containing new rows
	function manipulationTarget( elem, content ) {
		if ( nodeName( elem, "table" ) &&
			nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

			return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
		}

		return elem;
	}

	// Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript( elem ) {
		elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
		return elem;
	}
	function restoreScript( elem ) {
		if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
			elem.type = elem.type.slice( 5 );
		} else {
			elem.removeAttribute( "type" );
		}

		return elem;
	}

	function cloneCopyEvent( src, dest ) {
		var i, l, type, pdataOld, udataOld, udataCur, events;

		if ( dest.nodeType !== 1 ) {
			return;
		}

		// 1. Copy private data: events, handlers, etc.
		if ( dataPriv.hasData( src ) ) {
			pdataOld = dataPriv.get( src );
			events = pdataOld.events;

			if ( events ) {
				dataPriv.remove( dest, "handle events" );

				for ( type in events ) {
					for ( i = 0, l = events[ type ].length; i < l; i++ ) {
						jQuery.event.add( dest, type, events[ type ][ i ] );
					}
				}
			}
		}

		// 2. Copy user data
		if ( dataUser.hasData( src ) ) {
			udataOld = dataUser.access( src );
			udataCur = jQuery.extend( {}, udataOld );

			dataUser.set( dest, udataCur );
		}
	}

	// Fix IE bugs, see support tests
	function fixInput( src, dest ) {
		var nodeName = dest.nodeName.toLowerCase();

		// Fails to persist the checked state of a cloned checkbox or radio button.
		if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
			dest.checked = src.checked;

		// Fails to return the selected option to the default selected state when cloning options
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;
		}
	}

	function domManip( collection, args, callback, ignored ) {

		// Flatten any nested arrays
		args = flat( args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = collection.length,
			iNoClone = l - 1,
			value = args[ 0 ],
			valueIsFunction = isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( valueIsFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return collection.each( function( index ) {
				var self = collection.eq( index );
				if ( valueIsFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				domManip( self, args, callback, ignored );
			} );
		}

		if ( l ) {
			fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			// Require either new content or an interest in ignored elements to invoke the callback
			if ( first || ignored ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item
				// instead of the first because it can end up
				// being emptied incorrectly in certain situations (trac-8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {

							// Support: Android <=4.0 only, PhantomJS 1 only
							// push.apply(_, arraylike) throws on ancient WebKit
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( collection[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Re-enable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!dataPriv.access( node, "globalEval" ) &&
							jQuery.contains( doc, node ) ) {

							if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl && !node.noModule ) {
									jQuery._evalUrl( node.src, {
										nonce: node.nonce || node.getAttribute( "nonce" )
									}, doc );
								}
							} else {

								// Unwrap a CDATA section containing script contents. This shouldn't be
								// needed as in XML documents they're already not visible when
								// inspecting element contents and in HTML documents they have no
								// meaning but we're preserving that logic for backwards compatibility.
								// This will be removed completely in 4.0. See gh-4904.
								DOMEval( node.textContent.replace( rcleanScript, "" ), node, doc );
							}
						}
					}
				}
			}
		}

		return collection;
	}

	function remove( elem, selector, keepData ) {
		var node,
			nodes = selector ? jQuery.filter( selector, elem ) : elem,
			i = 0;

		for ( ; ( node = nodes[ i ] ) != null; i++ ) {
			if ( !keepData && node.nodeType === 1 ) {
				jQuery.cleanData( getAll( node ) );
			}

			if ( node.parentNode ) {
				if ( keepData && isAttached( node ) ) {
					setGlobalEval( getAll( node, "script" ) );
				}
				node.parentNode.removeChild( node );
			}
		}

		return elem;
	}

	jQuery.extend( {
		htmlPrefilter: function( html ) {
			return html;
		},

		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var i, l, srcElements, destElements,
				clone = elem.cloneNode( true ),
				inPage = isAttached( elem );

			// Fix IE cloning issues
			if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
					!jQuery.isXMLDoc( elem ) ) {

				// We eschew jQuery#find here for performance reasons:
				// https://jsperf.com/getall-vs-sizzle/2
				destElements = getAll( clone );
				srcElements = getAll( elem );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					fixInput( srcElements[ i ], destElements[ i ] );
				}
			}

			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				if ( deepDataAndEvents ) {
					srcElements = srcElements || getAll( elem );
					destElements = destElements || getAll( clone );

					for ( i = 0, l = srcElements.length; i < l; i++ ) {
						cloneCopyEvent( srcElements[ i ], destElements[ i ] );
					}
				} else {
					cloneCopyEvent( elem, clone );
				}
			}

			// Preserve script evaluation history
			destElements = getAll( clone, "script" );
			if ( destElements.length > 0 ) {
				setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
			}

			// Return the cloned set
			return clone;
		},

		cleanData: function( elems ) {
			var data, elem, type,
				special = jQuery.event.special,
				i = 0;

			for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
				if ( acceptData( elem ) ) {
					if ( ( data = elem[ dataPriv.expando ] ) ) {
						if ( data.events ) {
							for ( type in data.events ) {
								if ( special[ type ] ) {
									jQuery.event.remove( elem, type );

								// This is a shortcut to avoid jQuery.event.remove's overhead
								} else {
									jQuery.removeEvent( elem, type, data.handle );
								}
							}
						}

						// Support: Chrome <=35 - 45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataPriv.expando ] = undefined;
					}
					if ( elem[ dataUser.expando ] ) {

						// Support: Chrome <=35 - 45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataUser.expando ] = undefined;
					}
				}
			}
		}
	} );

	jQuery.fn.extend( {
		detach: function( selector ) {
			return remove( this, selector, true );
		},

		remove: function( selector ) {
			return remove( this, selector );
		},

		text: function( value ) {
			return access( this, function( value ) {
				return value === undefined ?
					jQuery.text( this ) :
					this.empty().each( function() {
						if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
							this.textContent = value;
						}
					} );
			}, null, value, arguments.length );
		},

		append: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.appendChild( elem );
				}
			} );
		},

		prepend: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.insertBefore( elem, target.firstChild );
				}
			} );
		},

		before: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this );
				}
			} );
		},

		after: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				}
			} );
		},

		empty: function() {
			var elem,
				i = 0;

			for ( ; ( elem = this[ i ] ) != null; i++ ) {
				if ( elem.nodeType === 1 ) {

					// Prevent memory leaks
					jQuery.cleanData( getAll( elem, false ) );

					// Remove any remaining nodes
					elem.textContent = "";
				}
			}

			return this;
		},

		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

			return this.map( function() {
				return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
			} );
		},

		html: function( value ) {
			return access( this, function( value ) {
				var elem = this[ 0 ] || {},
					i = 0,
					l = this.length;

				if ( value === undefined && elem.nodeType === 1 ) {
					return elem.innerHTML;
				}

				// See if we can take a shortcut and just use innerHTML
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

					value = jQuery.htmlPrefilter( value );

					try {
						for ( ; i < l; i++ ) {
							elem = this[ i ] || {};

							// Remove element nodes and prevent memory leaks
							if ( elem.nodeType === 1 ) {
								jQuery.cleanData( getAll( elem, false ) );
								elem.innerHTML = value;
							}
						}

						elem = 0;

					// If using innerHTML throws an exception, use the fallback method
					} catch ( e ) {}
				}

				if ( elem ) {
					this.empty().append( value );
				}
			}, null, value, arguments.length );
		},

		replaceWith: function() {
			var ignored = [];

			// Make the changes, replacing each non-ignored context element with the new content
			return domManip( this, arguments, function( elem ) {
				var parent = this.parentNode;

				if ( jQuery.inArray( this, ignored ) < 0 ) {
					jQuery.cleanData( getAll( this ) );
					if ( parent ) {
						parent.replaceChild( elem, this );
					}
				}

			// Force callback invocation
			}, ignored );
		}
	} );

	jQuery.each( {
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var elems,
				ret = [],
				insert = jQuery( selector ),
				last = insert.length - 1,
				i = 0;

			for ( ; i <= last; i++ ) {
				elems = i === last ? this : this.clone( true );
				jQuery( insert[ i ] )[ original ]( elems );

				// Support: Android <=4.0 only, PhantomJS 1 only
				// .get() because push.apply(_, arraylike) throws on ancient WebKit
				push.apply( ret, elems.get() );
			}

			return this.pushStack( ret );
		};
	} );
	var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

	var rcustomProp = /^--/;


	var getStyles = function( elem ) {

			// Support: IE <=11 only, Firefox <=30 (trac-15098, trac-14150)
			// IE throws on elements created in popups
			// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
			var view = elem.ownerDocument.defaultView;

			if ( !view || !view.opener ) {
				view = window;
			}

			return view.getComputedStyle( elem );
		};

	var swap = function( elem, options, callback ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	};


	var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );



	( function() {

		// Executing both pixelPosition & boxSizingReliable tests require only one layout
		// so they're executed at the same time to save the second computation.
		function computeStyleTests() {

			// This is a singleton, we need to execute it only once
			if ( !div ) {
				return;
			}

			container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
				"margin-top:1px;padding:0;border:0";
			div.style.cssText =
				"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
				"margin:auto;border:1px;padding:1px;" +
				"width:60%;top:1%";
			documentElement.appendChild( container ).appendChild( div );

			var divStyle = window.getComputedStyle( div );
			pixelPositionVal = divStyle.top !== "1%";

			// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
			reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

			// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
			// Some styles come back with percentage values, even though they shouldn't
			div.style.right = "60%";
			pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

			// Support: IE 9 - 11 only
			// Detect misreporting of content dimensions for box-sizing:border-box elements
			boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

			// Support: IE 9 only
			// Detect overflow:scroll screwiness (gh-3699)
			// Support: Chrome <=64
			// Don't get tricked when zoom affects offsetWidth (gh-4029)
			div.style.position = "absolute";
			scrollboxSizeVal = roundPixelMeasures( div.offsetWidth / 3 ) === 12;

			documentElement.removeChild( container );

			// Nullify the div so it wouldn't be stored in the memory and
			// it will also be a sign that checks already performed
			div = null;
		}

		function roundPixelMeasures( measure ) {
			return Math.round( parseFloat( measure ) );
		}

		var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
			reliableTrDimensionsVal, reliableMarginLeftVal,
			container = document.createElement( "div" ),
			div = document.createElement( "div" );

		// Finish early in limited (non-browser) environments
		if ( !div.style ) {
			return;
		}

		// Support: IE <=9 - 11 only
		// Style of cloned element affects source element cloned (trac-8908)
		div.style.backgroundClip = "content-box";
		div.cloneNode( true ).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";

		jQuery.extend( support, {
			boxSizingReliable: function() {
				computeStyleTests();
				return boxSizingReliableVal;
			},
			pixelBoxStyles: function() {
				computeStyleTests();
				return pixelBoxStylesVal;
			},
			pixelPosition: function() {
				computeStyleTests();
				return pixelPositionVal;
			},
			reliableMarginLeft: function() {
				computeStyleTests();
				return reliableMarginLeftVal;
			},
			scrollboxSize: function() {
				computeStyleTests();
				return scrollboxSizeVal;
			},

			// Support: IE 9 - 11+, Edge 15 - 18+
			// IE/Edge misreport `getComputedStyle` of table rows with width/height
			// set in CSS while `offset*` properties report correct values.
			// Behavior in IE 9 is more subtle than in newer versions & it passes
			// some versions of this test; make sure not to make it pass there!
			//
			// Support: Firefox 70+
			// Only Firefox includes border widths
			// in computed dimensions. (gh-4529)
			reliableTrDimensions: function() {
				var table, tr, trChild, trStyle;
				if ( reliableTrDimensionsVal == null ) {
					table = document.createElement( "table" );
					tr = document.createElement( "tr" );
					trChild = document.createElement( "div" );

					table.style.cssText = "position:absolute;left:-11111px;border-collapse:separate";
					tr.style.cssText = "box-sizing:content-box;border:1px solid";

					// Support: Chrome 86+
					// Height set through cssText does not get applied.
					// Computed height then comes back as 0.
					tr.style.height = "1px";
					trChild.style.height = "9px";

					// Support: Android 8 Chrome 86+
					// In our bodyBackground.html iframe,
					// display for all div elements is set to "inline",
					// which causes a problem only in Android 8 Chrome 86.
					// Ensuring the div is `display: block`
					// gets around this issue.
					trChild.style.display = "block";

					documentElement
						.appendChild( table )
						.appendChild( tr )
						.appendChild( trChild );

					trStyle = window.getComputedStyle( tr );
					reliableTrDimensionsVal = ( parseInt( trStyle.height, 10 ) +
						parseInt( trStyle.borderTopWidth, 10 ) +
						parseInt( trStyle.borderBottomWidth, 10 ) ) === tr.offsetHeight;

					documentElement.removeChild( table );
				}
				return reliableTrDimensionsVal;
			}
		} );
	} )();


	function curCSS( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			isCustomProp = rcustomProp.test( name ),

			// Support: Firefox 51+
			// Retrieving style before computed somehow
			// fixes an issue with getting wrong values
			// on detached elements
			style = elem.style;

		computed = computed || getStyles( elem );

		// getPropertyValue is needed for:
		//   .css('filter') (IE 9 only, trac-12537)
		//   .css('--customProperty) (gh-3144)
		if ( computed ) {

			// Support: IE <=9 - 11+
			// IE only supports `"float"` in `getPropertyValue`; in computed styles
			// it's only available as `"cssFloat"`. We no longer modify properties
			// sent to `.css()` apart from camelCasing, so we need to check both.
			// Normally, this would create difference in behavior: if
			// `getPropertyValue` returns an empty string, the value returned
			// by `.css()` would be `undefined`. This is usually the case for
			// disconnected elements. However, in IE even disconnected elements
			// with no styles return `"none"` for `getPropertyValue( "float" )`
			ret = computed.getPropertyValue( name ) || computed[ name ];

			if ( isCustomProp && ret ) {

				// Support: Firefox 105+, Chrome <=105+
				// Spec requires trimming whitespace for custom properties (gh-4926).
				// Firefox only trims leading whitespace. Chrome just collapses
				// both leading & trailing whitespace to a single space.
				//
				// Fall back to `undefined` if empty string returned.
				// This collapses a missing definition with property defined
				// and set to an empty string but there's no standard API
				// allowing us to differentiate them without a performance penalty
				// and returning `undefined` aligns with older jQuery.
				//
				// rtrimCSS treats U+000D CARRIAGE RETURN and U+000C FORM FEED
				// as whitespace while CSS does not, but this is not a problem
				// because CSS preprocessing replaces them with U+000A LINE FEED
				// (which *is* CSS whitespace)
				// https://www.w3.org/TR/css-syntax-3/#input-preprocessing
				ret = ret.replace( rtrimCSS, "$1" ) || undefined;
			}

			if ( ret === "" && !isAttached( elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Android Browser returns percentage for some values,
			// but width seems to be reliably pixels.
			// This is against the CSSOM draft spec:
			// https://drafts.csswg.org/cssom/#resolved-values
			if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret !== undefined ?

			// Support: IE <=9 - 11 only
			// IE returns zIndex value as an integer.
			ret + "" :
			ret;
	}


	function addGetHookIf( conditionFn, hookFn ) {

		// Define the hook, we'll check on the first run if it's really needed.
		return {
			get: function() {
				if ( conditionFn() ) {

					// Hook not needed (or it's not possible to use it due
					// to missing dependency), remove it.
					delete this.get;
					return;
				}

				// Hook needed; redefine it so that the support test is not executed again.
				return ( this.get = hookFn ).apply( this, arguments );
			}
		};
	}


	var cssPrefixes = [ "Webkit", "Moz", "ms" ],
		emptyStyle = document.createElement( "div" ).style,
		vendorProps = {};

	// Return a vendor-prefixed property or undefined
	function vendorPropName( name ) {

		// Check for vendor prefixed names
		var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
			i = cssPrefixes.length;

		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in emptyStyle ) {
				return name;
			}
		}
	}

	// Return a potentially-mapped jQuery.cssProps or vendor prefixed property
	function finalPropName( name ) {
		var final = jQuery.cssProps[ name ] || vendorProps[ name ];

		if ( final ) {
			return final;
		}
		if ( name in emptyStyle ) {
			return name;
		}
		return vendorProps[ name ] = vendorPropName( name ) || name;
	}


	var

		// Swappable if display is none or starts with table
		// except "table", "table-cell", or "table-caption"
		// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,
		cssShow = { position: "absolute", visibility: "hidden", display: "block" },
		cssNormalTransform = {
			letterSpacing: "0",
			fontWeight: "400"
		};

	function setPositiveNumber( _elem, value, subtract ) {

		// Any relative (+/-) values have already been
		// normalized at this point
		var matches = rcssNum.exec( value );
		return matches ?

			// Guard against undefined "subtract", e.g., when used as in cssHooks
			Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
			value;
	}

	function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
		var i = dimension === "width" ? 1 : 0,
			extra = 0,
			delta = 0,
			marginDelta = 0;

		// Adjustment may not be necessary
		if ( box === ( isBorderBox ? "border" : "content" ) ) {
			return 0;
		}

		for ( ; i < 4; i += 2 ) {

			// Both box models exclude margin
			// Count margin delta separately to only add it after scroll gutter adjustment.
			// This is needed to make negative margins work with `outerHeight( true )` (gh-3982).
			if ( box === "margin" ) {
				marginDelta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
			}

			// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
			if ( !isBorderBox ) {

				// Add padding
				delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

				// For "border" or "margin", add border
				if ( box !== "padding" ) {
					delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

				// But still keep track of it otherwise
				} else {
					extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}

			// If we get here with a border-box (content + padding + border), we're seeking "content" or
			// "padding" or "margin"
			} else {

				// For "content", subtract padding
				if ( box === "content" ) {
					delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
				}

				// For "content" or "padding", subtract border
				if ( box !== "margin" ) {
					delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			}
		}

		// Account for positive content-box scroll gutter when requested by providing computedVal
		if ( !isBorderBox && computedVal >= 0 ) {

			// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
			// Assuming integer scroll gutter, subtract the rest and round down
			delta += Math.max( 0, Math.ceil(
				elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
				computedVal -
				delta -
				extra -
				0.5

			// If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
			// Use an explicit zero to avoid NaN (gh-3964)
			) ) || 0;
		}

		return delta + marginDelta;
	}

	function getWidthOrHeight( elem, dimension, extra ) {

		// Start with computed style
		var styles = getStyles( elem ),

			// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
			// Fake content-box until we know it's needed to know the true value.
			boxSizingNeeded = !support.boxSizingReliable() || extra,
			isBorderBox = boxSizingNeeded &&
				jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
			valueIsBorderBox = isBorderBox,

			val = curCSS( elem, dimension, styles ),
			offsetProp = "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 );

		// Support: Firefox <=54
		// Return a confounding non-pixel value or feign ignorance, as appropriate.
		if ( rnumnonpx.test( val ) ) {
			if ( !extra ) {
				return val;
			}
			val = "auto";
		}


		// Support: IE 9 - 11 only
		// Use offsetWidth/offsetHeight for when box sizing is unreliable.
		// In those cases, the computed value can be trusted to be border-box.
		if ( ( !support.boxSizingReliable() && isBorderBox ||

			// Support: IE 10 - 11+, Edge 15 - 18+
			// IE/Edge misreport `getComputedStyle` of table rows with width/height
			// set in CSS while `offset*` properties report correct values.
			// Interestingly, in some cases IE 9 doesn't suffer from this issue.
			!support.reliableTrDimensions() && nodeName( elem, "tr" ) ||

			// Fall back to offsetWidth/offsetHeight when value is "auto"
			// This happens for inline elements with no explicit setting (gh-3571)
			val === "auto" ||

			// Support: Android <=4.1 - 4.3 only
			// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
			!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) &&

			// Make sure the element is visible & connected
			elem.getClientRects().length ) {

			isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

			// Where available, offsetWidth/offsetHeight approximate border box dimensions.
			// Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
			// retrieved value as a content box dimension.
			valueIsBorderBox = offsetProp in elem;
			if ( valueIsBorderBox ) {
				val = elem[ offsetProp ];
			}
		}

		// Normalize "" and auto
		val = parseFloat( val ) || 0;

		// Adjust for the element's box model
		return ( val +
			boxModelAdjustment(
				elem,
				dimension,
				extra || ( isBorderBox ? "border" : "content" ),
				valueIsBorderBox,
				styles,

				// Provide the current computed size to request scroll gutter calculation (gh-3589)
				val
			)
		) + "px";
	}

	jQuery.extend( {

		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function( elem, computed ) {
					if ( computed ) {

						// We should always get a number back from opacity
						var ret = curCSS( elem, "opacity" );
						return ret === "" ? "1" : ret;
					}
				}
			}
		},

		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			animationIterationCount: true,
			aspectRatio: true,
			borderImageSlice: true,
			columnCount: true,
			flexGrow: true,
			flexShrink: true,
			fontWeight: true,
			gridArea: true,
			gridColumn: true,
			gridColumnEnd: true,
			gridColumnStart: true,
			gridRow: true,
			gridRowEnd: true,
			gridRowStart: true,
			lineHeight: true,
			opacity: true,
			order: true,
			orphans: true,
			scale: true,
			widows: true,
			zIndex: true,
			zoom: true,

			// SVG-related
			fillOpacity: true,
			floodOpacity: true,
			stopOpacity: true,
			strokeMiterlimit: true,
			strokeOpacity: true
		},

		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {},

		// Get and set the style property on a DOM Node
		style: function( elem, name, value, extra ) {

			// Don't set styles on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
				return;
			}

			// Make sure that we're working with the right name
			var ret, type, hooks,
				origName = camelCase( name ),
				isCustomProp = rcustomProp.test( name ),
				style = elem.style;

			// Make sure that we're working with the right name. We don't
			// want to query the value if it is a CSS custom property
			// since they are user-defined.
			if ( !isCustomProp ) {
				name = finalPropName( origName );
			}

			// Gets hook for the prefixed version, then unprefixed version
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// Check if we're setting a value
			if ( value !== undefined ) {
				type = typeof value;

				// Convert "+=" or "-=" to relative numbers (trac-7345)
				if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
					value = adjustCSS( elem, name, ret );

					// Fixes bug trac-9237
					type = "number";
				}

				// Make sure that null and NaN values aren't set (trac-7116)
				if ( value == null || value !== value ) {
					return;
				}

				// If a number was passed in, add the unit (except for certain CSS properties)
				// The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
				// "px" to a few hardcoded values.
				if ( type === "number" && !isCustomProp ) {
					value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
				}

				// background-* props affect original clone's values
				if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
					style[ name ] = "inherit";
				}

				// If a hook was provided, use that value, otherwise just set the specified value
				if ( !hooks || !( "set" in hooks ) ||
					( value = hooks.set( elem, value, extra ) ) !== undefined ) {

					if ( isCustomProp ) {
						style.setProperty( name, value );
					} else {
						style[ name ] = value;
					}
				}

			} else {

				// If a hook was provided get the non-computed value from there
				if ( hooks && "get" in hooks &&
					( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

					return ret;
				}

				// Otherwise just get the value from the style object
				return style[ name ];
			}
		},

		css: function( elem, name, extra, styles ) {
			var val, num, hooks,
				origName = camelCase( name ),
				isCustomProp = rcustomProp.test( name );

			// Make sure that we're working with the right name. We don't
			// want to modify the value if it is a CSS custom property
			// since they are user-defined.
			if ( !isCustomProp ) {
				name = finalPropName( origName );
			}

			// Try prefixed name followed by the unprefixed name
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// If a hook was provided get the computed value from there
			if ( hooks && "get" in hooks ) {
				val = hooks.get( elem, true, extra );
			}

			// Otherwise, if a way to get the computed value exists, use that
			if ( val === undefined ) {
				val = curCSS( elem, name, styles );
			}

			// Convert "normal" to computed value
			if ( val === "normal" && name in cssNormalTransform ) {
				val = cssNormalTransform[ name ];
			}

			// Make numeric if forced or a qualifier was provided and val looks numeric
			if ( extra === "" || extra ) {
				num = parseFloat( val );
				return extra === true || isFinite( num ) ? num || 0 : val;
			}

			return val;
		}
	} );

	jQuery.each( [ "height", "width" ], function( _i, dimension ) {
		jQuery.cssHooks[ dimension ] = {
			get: function( elem, computed, extra ) {
				if ( computed ) {

					// Certain elements can have dimension info if we invisibly show them
					// but it must have a current display style that would benefit
					return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

						// Support: Safari 8+
						// Table columns in Safari have non-zero offsetWidth & zero
						// getBoundingClientRect().width unless display is changed.
						// Support: IE <=11 only
						// Running getBoundingClientRect on a disconnected node
						// in IE throws an error.
						( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, dimension, extra );
						} ) :
						getWidthOrHeight( elem, dimension, extra );
				}
			},

			set: function( elem, value, extra ) {
				var matches,
					styles = getStyles( elem ),

					// Only read styles.position if the test has a chance to fail
					// to avoid forcing a reflow.
					scrollboxSizeBuggy = !support.scrollboxSize() &&
						styles.position === "absolute",

					// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
					boxSizingNeeded = scrollboxSizeBuggy || extra,
					isBorderBox = boxSizingNeeded &&
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					subtract = extra ?
						boxModelAdjustment(
							elem,
							dimension,
							extra,
							isBorderBox,
							styles
						) :
						0;

				// Account for unreliable border-box dimensions by comparing offset* to computed and
				// faking a content-box to get border and padding (gh-3699)
				if ( isBorderBox && scrollboxSizeBuggy ) {
					subtract -= Math.ceil(
						elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
						parseFloat( styles[ dimension ] ) -
						boxModelAdjustment( elem, dimension, "border", false, styles ) -
						0.5
					);
				}

				// Convert to pixels if value adjustment is needed
				if ( subtract && ( matches = rcssNum.exec( value ) ) &&
					( matches[ 3 ] || "px" ) !== "px" ) {

					elem.style[ dimension ] = value;
					value = jQuery.css( elem, dimension );
				}

				return setPositiveNumber( elem, value, subtract );
			}
		};
	} );

	jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
		function( elem, computed ) {
			if ( computed ) {
				return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} )
				) + "px";
			}
		}
	);

	// These hooks are used by animate to expand properties
	jQuery.each( {
		margin: "",
		padding: "",
		border: "Width"
	}, function( prefix, suffix ) {
		jQuery.cssHooks[ prefix + suffix ] = {
			expand: function( value ) {
				var i = 0,
					expanded = {},

					// Assumes a single number if not a string
					parts = typeof value === "string" ? value.split( " " ) : [ value ];

				for ( ; i < 4; i++ ) {
					expanded[ prefix + cssExpand[ i ] + suffix ] =
						parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
				}

				return expanded;
			}
		};

		if ( prefix !== "margin" ) {
			jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
		}
	} );

	jQuery.fn.extend( {
		css: function( name, value ) {
			return access( this, function( elem, name, value ) {
				var styles, len,
					map = {},
					i = 0;

				if ( Array.isArray( name ) ) {
					styles = getStyles( elem );
					len = name.length;

					for ( ; i < len; i++ ) {
						map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
					}

					return map;
				}

				return value !== undefined ?
					jQuery.style( elem, name, value ) :
					jQuery.css( elem, name );
			}, name, value, arguments.length > 1 );
		}
	} );


	function Tween( elem, options, prop, end, easing ) {
		return new Tween.prototype.init( elem, options, prop, end, easing );
	}
	jQuery.Tween = Tween;

	Tween.prototype = {
		constructor: Tween,
		init: function( elem, options, prop, end, easing, unit ) {
			this.elem = elem;
			this.prop = prop;
			this.easing = easing || jQuery.easing._default;
			this.options = options;
			this.start = this.now = this.cur();
			this.end = end;
			this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
		},
		cur: function() {
			var hooks = Tween.propHooks[ this.prop ];

			return hooks && hooks.get ?
				hooks.get( this ) :
				Tween.propHooks._default.get( this );
		},
		run: function( percent ) {
			var eased,
				hooks = Tween.propHooks[ this.prop ];

			if ( this.options.duration ) {
				this.pos = eased = jQuery.easing[ this.easing ](
					percent, this.options.duration * percent, 0, 1, this.options.duration
				);
			} else {
				this.pos = eased = percent;
			}
			this.now = ( this.end - this.start ) * eased + this.start;

			if ( this.options.step ) {
				this.options.step.call( this.elem, this.now, this );
			}

			if ( hooks && hooks.set ) {
				hooks.set( this );
			} else {
				Tween.propHooks._default.set( this );
			}
			return this;
		}
	};

	Tween.prototype.init.prototype = Tween.prototype;

	Tween.propHooks = {
		_default: {
			get: function( tween ) {
				var result;

				// Use a property on the element directly when it is not a DOM element,
				// or when there is no matching style property that exists.
				if ( tween.elem.nodeType !== 1 ||
					tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
					return tween.elem[ tween.prop ];
				}

				// Passing an empty string as a 3rd parameter to .css will automatically
				// attempt a parseFloat and fallback to a string if the parse fails.
				// Simple values such as "10px" are parsed to Float;
				// complex values such as "rotate(1rad)" are returned as-is.
				result = jQuery.css( tween.elem, tween.prop, "" );

				// Empty strings, null, undefined and "auto" are converted to 0.
				return !result || result === "auto" ? 0 : result;
			},
			set: function( tween ) {

				// Use step hook for back compat.
				// Use cssHook if its there.
				// Use .style if available and use plain properties where available.
				if ( jQuery.fx.step[ tween.prop ] ) {
					jQuery.fx.step[ tween.prop ]( tween );
				} else if ( tween.elem.nodeType === 1 && (
					jQuery.cssHooks[ tween.prop ] ||
						tween.elem.style[ finalPropName( tween.prop ) ] != null ) ) {
					jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
				} else {
					tween.elem[ tween.prop ] = tween.now;
				}
			}
		}
	};

	// Support: IE <=9 only
	// Panic based approach to setting things on disconnected nodes
	Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
		set: function( tween ) {
			if ( tween.elem.nodeType && tween.elem.parentNode ) {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	};

	jQuery.easing = {
		linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p * Math.PI ) / 2;
		},
		_default: "swing"
	};

	jQuery.fx = Tween.prototype.init;

	// Back compat <1.8 extension point
	jQuery.fx.step = {};




	var
		fxNow, inProgress,
		rfxtypes = /^(?:toggle|show|hide)$/,
		rrun = /queueHooks$/;

	function schedule() {
		if ( inProgress ) {
			if ( document.hidden === false && window.requestAnimationFrame ) {
				window.requestAnimationFrame( schedule );
			} else {
				window.setTimeout( schedule, jQuery.fx.interval );
			}

			jQuery.fx.tick();
		}
	}

	// Animations created synchronously will run synchronously
	function createFxNow() {
		window.setTimeout( function() {
			fxNow = undefined;
		} );
		return ( fxNow = Date.now() );
	}

	// Generate parameters to create a standard animation
	function genFx( type, includeWidth ) {
		var which,
			i = 0,
			attrs = { height: type };

		// If we include width, step value is 1 to do all cssExpand values,
		// otherwise step value is 2 to skip over Left and Right
		includeWidth = includeWidth ? 1 : 0;
		for ( ; i < 4; i += 2 - includeWidth ) {
			which = cssExpand[ i ];
			attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
		}

		if ( includeWidth ) {
			attrs.opacity = attrs.width = type;
		}

		return attrs;
	}

	function createTween( value, prop, animation ) {
		var tween,
			collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

				// We're done with this property
				return tween;
			}
		}
	}

	function defaultPrefilter( elem, props, opts ) {
		var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
			isBox = "width" in props || "height" in props,
			anim = this,
			orig = {},
			style = elem.style,
			hidden = elem.nodeType && isHiddenWithinTree( elem ),
			dataShow = dataPriv.get( elem, "fxshow" );

		// Queue-skipping animations hijack the fx hooks
		if ( !opts.queue ) {
			hooks = jQuery._queueHooks( elem, "fx" );
			if ( hooks.unqueued == null ) {
				hooks.unqueued = 0;
				oldfire = hooks.empty.fire;
				hooks.empty.fire = function() {
					if ( !hooks.unqueued ) {
						oldfire();
					}
				};
			}
			hooks.unqueued++;

			anim.always( function() {

				// Ensure the complete handler is called before this completes
				anim.always( function() {
					hooks.unqueued--;
					if ( !jQuery.queue( elem, "fx" ).length ) {
						hooks.empty.fire();
					}
				} );
			} );
		}

		// Detect show/hide animations
		for ( prop in props ) {
			value = props[ prop ];
			if ( rfxtypes.test( value ) ) {
				delete props[ prop ];
				toggle = toggle || value === "toggle";
				if ( value === ( hidden ? "hide" : "show" ) ) {

					// Pretend to be hidden if this is a "show" and
					// there is still data from a stopped show/hide
					if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
						hidden = true;

					// Ignore all other no-op show/hide data
					} else {
						continue;
					}
				}
				orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
			}
		}

		// Bail out if this is a no-op like .hide().hide()
		propTween = !jQuery.isEmptyObject( props );
		if ( !propTween && jQuery.isEmptyObject( orig ) ) {
			return;
		}

		// Restrict "overflow" and "display" styles during box animations
		if ( isBox && elem.nodeType === 1 ) {

			// Support: IE <=9 - 11, Edge 12 - 15
			// Record all 3 overflow attributes because IE does not infer the shorthand
			// from identically-valued overflowX and overflowY and Edge just mirrors
			// the overflowX value there.
			opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

			// Identify a display type, preferring old show/hide data over the CSS cascade
			restoreDisplay = dataShow && dataShow.display;
			if ( restoreDisplay == null ) {
				restoreDisplay = dataPriv.get( elem, "display" );
			}
			display = jQuery.css( elem, "display" );
			if ( display === "none" ) {
				if ( restoreDisplay ) {
					display = restoreDisplay;
				} else {

					// Get nonempty value(s) by temporarily forcing visibility
					showHide( [ elem ], true );
					restoreDisplay = elem.style.display || restoreDisplay;
					display = jQuery.css( elem, "display" );
					showHide( [ elem ] );
				}
			}

			// Animate inline elements as inline-block
			if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
				if ( jQuery.css( elem, "float" ) === "none" ) {

					// Restore the original display value at the end of pure show/hide animations
					if ( !propTween ) {
						anim.done( function() {
							style.display = restoreDisplay;
						} );
						if ( restoreDisplay == null ) {
							display = style.display;
							restoreDisplay = display === "none" ? "" : display;
						}
					}
					style.display = "inline-block";
				}
			}
		}

		if ( opts.overflow ) {
			style.overflow = "hidden";
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}

		// Implement show/hide animations
		propTween = false;
		for ( prop in orig ) {

			// General show/hide setup for this element animation
			if ( !propTween ) {
				if ( dataShow ) {
					if ( "hidden" in dataShow ) {
						hidden = dataShow.hidden;
					}
				} else {
					dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
				}

				// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
				if ( toggle ) {
					dataShow.hidden = !hidden;
				}

				// Show elements before animating them
				if ( hidden ) {
					showHide( [ elem ], true );
				}

				/* eslint-disable no-loop-func */

				anim.done( function() {

					/* eslint-enable no-loop-func */

					// The final step of a "hide" animation is actually hiding the element
					if ( !hidden ) {
						showHide( [ elem ] );
					}
					dataPriv.remove( elem, "fxshow" );
					for ( prop in orig ) {
						jQuery.style( elem, prop, orig[ prop ] );
					}
				} );
			}

			// Per-property setup
			propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = propTween.start;
				if ( hidden ) {
					propTween.end = propTween.start;
					propTween.start = 0;
				}
			}
		}
	}

	function propFilter( props, specialEasing ) {
		var index, name, easing, value, hooks;

		// camelCase, specialEasing and expand cssHook pass
		for ( index in props ) {
			name = camelCase( index );
			easing = specialEasing[ name ];
			value = props[ index ];
			if ( Array.isArray( value ) ) {
				easing = value[ 1 ];
				value = props[ index ] = value[ 0 ];
			}

			if ( index !== name ) {
				props[ name ] = value;
				delete props[ index ];
			}

			hooks = jQuery.cssHooks[ name ];
			if ( hooks && "expand" in hooks ) {
				value = hooks.expand( value );
				delete props[ name ];

				// Not quite $.extend, this won't overwrite existing keys.
				// Reusing 'index' because we have the correct "name"
				for ( index in value ) {
					if ( !( index in props ) ) {
						props[ index ] = value[ index ];
						specialEasing[ index ] = easing;
					}
				}
			} else {
				specialEasing[ name ] = easing;
			}
		}
	}

	function Animation( elem, properties, options ) {
		var result,
			stopped,
			index = 0,
			length = Animation.prefilters.length,
			deferred = jQuery.Deferred().always( function() {

				// Don't match elem in the :animated selector
				delete tick.elem;
			} ),
			tick = function() {
				if ( stopped ) {
					return false;
				}
				var currentTime = fxNow || createFxNow(),
					remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

					// Support: Android 2.3 only
					// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (trac-12497)
					temp = remaining / animation.duration || 0,
					percent = 1 - temp,
					index = 0,
					length = animation.tweens.length;

				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( percent );
				}

				deferred.notifyWith( elem, [ animation, percent, remaining ] );

				// If there's more to do, yield
				if ( percent < 1 && length ) {
					return remaining;
				}

				// If this was an empty animation, synthesize a final progress notification
				if ( !length ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
				}

				// Resolve the animation and report its conclusion
				deferred.resolveWith( elem, [ animation ] );
				return false;
			},
			animation = deferred.promise( {
				elem: elem,
				props: jQuery.extend( {}, properties ),
				opts: jQuery.extend( true, {
					specialEasing: {},
					easing: jQuery.easing._default
				}, options ),
				originalProperties: properties,
				originalOptions: options,
				startTime: fxNow || createFxNow(),
				duration: options.duration,
				tweens: [],
				createTween: function( prop, end ) {
					var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
					animation.tweens.push( tween );
					return tween;
				},
				stop: function( gotoEnd ) {
					var index = 0,

						// If we are going to the end, we want to run all the tweens
						// otherwise we skip this part
						length = gotoEnd ? animation.tweens.length : 0;
					if ( stopped ) {
						return this;
					}
					stopped = true;
					for ( ; index < length; index++ ) {
						animation.tweens[ index ].run( 1 );
					}

					// Resolve when we played the last frame; otherwise, reject
					if ( gotoEnd ) {
						deferred.notifyWith( elem, [ animation, 1, 0 ] );
						deferred.resolveWith( elem, [ animation, gotoEnd ] );
					} else {
						deferred.rejectWith( elem, [ animation, gotoEnd ] );
					}
					return this;
				}
			} ),
			props = animation.props;

		propFilter( props, animation.opts.specialEasing );

		for ( ; index < length; index++ ) {
			result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
			if ( result ) {
				if ( isFunction( result.stop ) ) {
					jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
						result.stop.bind( result );
				}
				return result;
			}
		}

		jQuery.map( props, createTween, animation );

		if ( isFunction( animation.opts.start ) ) {
			animation.opts.start.call( elem, animation );
		}

		// Attach callbacks from options
		animation
			.progress( animation.opts.progress )
			.done( animation.opts.done, animation.opts.complete )
			.fail( animation.opts.fail )
			.always( animation.opts.always );

		jQuery.fx.timer(
			jQuery.extend( tick, {
				elem: elem,
				anim: animation,
				queue: animation.opts.queue
			} )
		);

		return animation;
	}

	jQuery.Animation = jQuery.extend( Animation, {

		tweeners: {
			"*": [ function( prop, value ) {
				var tween = this.createTween( prop, value );
				adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
				return tween;
			} ]
		},

		tweener: function( props, callback ) {
			if ( isFunction( props ) ) {
				callback = props;
				props = [ "*" ];
			} else {
				props = props.match( rnothtmlwhite );
			}

			var prop,
				index = 0,
				length = props.length;

			for ( ; index < length; index++ ) {
				prop = props[ index ];
				Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
				Animation.tweeners[ prop ].unshift( callback );
			}
		},

		prefilters: [ defaultPrefilter ],

		prefilter: function( callback, prepend ) {
			if ( prepend ) {
				Animation.prefilters.unshift( callback );
			} else {
				Animation.prefilters.push( callback );
			}
		}
	} );

	jQuery.speed = function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !isFunction( easing ) && easing
		};

		// Go to the end state if fx are off
		if ( jQuery.fx.off ) {
			opt.duration = 0;

		} else {
			if ( typeof opt.duration !== "number" ) {
				if ( opt.duration in jQuery.fx.speeds ) {
					opt.duration = jQuery.fx.speeds[ opt.duration ];

				} else {
					opt.duration = jQuery.fx.speeds._default;
				}
			}
		}

		// Normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function() {
			if ( isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			}
		};

		return opt;
	};

	jQuery.fn.extend( {
		fadeTo: function( speed, to, easing, callback ) {

			// Show any hidden elements after setting opacity to 0
			return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

				// Animate to the value specified
				.end().animate( { opacity: to }, speed, easing, callback );
		},
		animate: function( prop, speed, easing, callback ) {
			var empty = jQuery.isEmptyObject( prop ),
				optall = jQuery.speed( speed, easing, callback ),
				doAnimation = function() {

					// Operate on a copy of prop so per-property easing won't be lost
					var anim = Animation( this, jQuery.extend( {}, prop ), optall );

					// Empty animations, or finishing resolves immediately
					if ( empty || dataPriv.get( this, "finish" ) ) {
						anim.stop( true );
					}
				};

			doAnimation.finish = doAnimation;

			return empty || optall.queue === false ?
				this.each( doAnimation ) :
				this.queue( optall.queue, doAnimation );
		},
		stop: function( type, clearQueue, gotoEnd ) {
			var stopQueue = function( hooks ) {
				var stop = hooks.stop;
				delete hooks.stop;
				stop( gotoEnd );
			};

			if ( typeof type !== "string" ) {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if ( clearQueue ) {
				this.queue( type || "fx", [] );
			}

			return this.each( function() {
				var dequeue = true,
					index = type != null && type + "queueHooks",
					timers = jQuery.timers,
					data = dataPriv.get( this );

				if ( index ) {
					if ( data[ index ] && data[ index ].stop ) {
						stopQueue( data[ index ] );
					}
				} else {
					for ( index in data ) {
						if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
							stopQueue( data[ index ] );
						}
					}
				}

				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this &&
						( type == null || timers[ index ].queue === type ) ) {

						timers[ index ].anim.stop( gotoEnd );
						dequeue = false;
						timers.splice( index, 1 );
					}
				}

				// Start the next in the queue if the last step wasn't forced.
				// Timers currently will call their complete callbacks, which
				// will dequeue but only if they were gotoEnd.
				if ( dequeue || !gotoEnd ) {
					jQuery.dequeue( this, type );
				}
			} );
		},
		finish: function( type ) {
			if ( type !== false ) {
				type = type || "fx";
			}
			return this.each( function() {
				var index,
					data = dataPriv.get( this ),
					queue = data[ type + "queue" ],
					hooks = data[ type + "queueHooks" ],
					timers = jQuery.timers,
					length = queue ? queue.length : 0;

				// Enable finishing flag on private data
				data.finish = true;

				// Empty the queue first
				jQuery.queue( this, type, [] );

				if ( hooks && hooks.stop ) {
					hooks.stop.call( this, true );
				}

				// Look for any active animations, and finish them
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
						timers[ index ].anim.stop( true );
						timers.splice( index, 1 );
					}
				}

				// Look for any animations in the old queue and finish them
				for ( index = 0; index < length; index++ ) {
					if ( queue[ index ] && queue[ index ].finish ) {
						queue[ index ].finish.call( this );
					}
				}

				// Turn off finishing flag
				delete data.finish;
			} );
		}
	} );

	jQuery.each( [ "toggle", "show", "hide" ], function( _i, name ) {
		var cssFn = jQuery.fn[ name ];
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return speed == null || typeof speed === "boolean" ?
				cssFn.apply( this, arguments ) :
				this.animate( genFx( name, true ), speed, easing, callback );
		};
	} );

	// Generate shortcuts for custom animations
	jQuery.each( {
		slideDown: genFx( "show" ),
		slideUp: genFx( "hide" ),
		slideToggle: genFx( "toggle" ),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function( name, props ) {
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return this.animate( props, speed, easing, callback );
		};
	} );

	jQuery.timers = [];
	jQuery.fx.tick = function() {
		var timer,
			i = 0,
			timers = jQuery.timers;

		fxNow = Date.now();

		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];

			// Run the timer and safely remove it when done (allowing for external removal)
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
		fxNow = undefined;
	};

	jQuery.fx.timer = function( timer ) {
		jQuery.timers.push( timer );
		jQuery.fx.start();
	};

	jQuery.fx.interval = 13;
	jQuery.fx.start = function() {
		if ( inProgress ) {
			return;
		}

		inProgress = true;
		schedule();
	};

	jQuery.fx.stop = function() {
		inProgress = null;
	};

	jQuery.fx.speeds = {
		slow: 600,
		fast: 200,

		// Default speed
		_default: 400
	};


	// Based off of the plugin by Clint Helfers, with permission.
	jQuery.fn.delay = function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = window.setTimeout( next, time );
			hooks.stop = function() {
				window.clearTimeout( timeout );
			};
		} );
	};


	( function() {
		var input = document.createElement( "input" ),
			select = document.createElement( "select" ),
			opt = select.appendChild( document.createElement( "option" ) );

		input.type = "checkbox";

		// Support: Android <=4.3 only
		// Default value for a checkbox should be "on"
		support.checkOn = input.value !== "";

		// Support: IE <=11 only
		// Must access selectedIndex to make default options select
		support.optSelected = opt.selected;

		// Support: IE <=11 only
		// An input loses its value after becoming a radio
		input = document.createElement( "input" );
		input.value = "t";
		input.type = "radio";
		support.radioValue = input.value === "t";
	} )();


	var boolHook,
		attrHandle = jQuery.expr.attrHandle;

	jQuery.fn.extend( {
		attr: function( name, value ) {
			return access( this, jQuery.attr, name, value, arguments.length > 1 );
		},

		removeAttr: function( name ) {
			return this.each( function() {
				jQuery.removeAttr( this, name );
			} );
		}
	} );

	jQuery.extend( {
		attr: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set attributes on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			// Fallback to prop when attributes are not supported
			if ( typeof elem.getAttribute === "undefined" ) {
				return jQuery.prop( elem, name, value );
			}

			// Attribute hooks are determined by the lowercase version
			// Grab necessary hook if one is defined
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
				hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
					( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
			}

			if ( value !== undefined ) {
				if ( value === null ) {
					jQuery.removeAttr( elem, name );
					return;
				}

				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				elem.setAttribute( name, value + "" );
				return value;
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ? undefined : ret;
		},

		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( !support.radioValue && value === "radio" &&
						nodeName( elem, "input" ) ) {
						var val = elem.value;
						elem.setAttribute( "type", value );
						if ( val ) {
							elem.value = val;
						}
						return value;
					}
				}
			}
		},

		removeAttr: function( elem, value ) {
			var name,
				i = 0,

				// Attribute names can contain non-HTML whitespace characters
				// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
				attrNames = value && value.match( rnothtmlwhite );

			if ( attrNames && elem.nodeType === 1 ) {
				while ( ( name = attrNames[ i++ ] ) ) {
					elem.removeAttribute( name );
				}
			}
		}
	} );

	// Hooks for boolean attributes
	boolHook = {
		set: function( elem, value, name ) {
			if ( value === false ) {

				// Remove boolean attributes when set to false
				jQuery.removeAttr( elem, name );
			} else {
				elem.setAttribute( name, name );
			}
			return name;
		}
	};

	jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( _i, name ) {
		var getter = attrHandle[ name ] || jQuery.find.attr;

		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle,
				lowercaseName = name.toLowerCase();

			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ lowercaseName ];
				attrHandle[ lowercaseName ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					lowercaseName :
					null;
				attrHandle[ lowercaseName ] = handle;
			}
			return ret;
		};
	} );




	var rfocusable = /^(?:input|select|textarea|button)$/i,
		rclickable = /^(?:a|area)$/i;

	jQuery.fn.extend( {
		prop: function( name, value ) {
			return access( this, jQuery.prop, name, value, arguments.length > 1 );
		},

		removeProp: function( name ) {
			return this.each( function() {
				delete this[ jQuery.propFix[ name ] || name ];
			} );
		}
	} );

	jQuery.extend( {
		prop: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set properties on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

				// Fix name and attach hooks
				name = jQuery.propFix[ name ] || name;
				hooks = jQuery.propHooks[ name ];
			}

			if ( value !== undefined ) {
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				return ( elem[ name ] = value );
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			return elem[ name ];
		},

		propHooks: {
			tabIndex: {
				get: function( elem ) {

					// Support: IE <=9 - 11 only
					// elem.tabIndex doesn't always return the
					// correct value when it hasn't been explicitly set
					// Use proper attribute retrieval (trac-12072)
					var tabindex = jQuery.find.attr( elem, "tabindex" );

					if ( tabindex ) {
						return parseInt( tabindex, 10 );
					}

					if (
						rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) &&
						elem.href
					) {
						return 0;
					}

					return -1;
				}
			}
		},

		propFix: {
			"for": "htmlFor",
			"class": "className"
		}
	} );

	// Support: IE <=11 only
	// Accessing the selectedIndex property
	// forces the browser to respect setting selected
	// on the option
	// The getter ensures a default option is selected
	// when in an optgroup
	// eslint rule "no-unused-expressions" is disabled for this code
	// since it considers such accessions noop
	if ( !support.optSelected ) {
		jQuery.propHooks.selected = {
			get: function( elem ) {

				/* eslint no-unused-expressions: "off" */

				var parent = elem.parentNode;
				if ( parent && parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
				return null;
			},
			set: function( elem ) {

				/* eslint no-unused-expressions: "off" */

				var parent = elem.parentNode;
				if ( parent ) {
					parent.selectedIndex;

					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
			}
		};
	}

	jQuery.each( [
		"tabIndex",
		"readOnly",
		"maxLength",
		"cellSpacing",
		"cellPadding",
		"rowSpan",
		"colSpan",
		"useMap",
		"frameBorder",
		"contentEditable"
	], function() {
		jQuery.propFix[ this.toLowerCase() ] = this;
	} );




		// Strip and collapse whitespace according to HTML spec
		// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
		function stripAndCollapse( value ) {
			var tokens = value.match( rnothtmlwhite ) || [];
			return tokens.join( " " );
		}


	function getClass( elem ) {
		return elem.getAttribute && elem.getAttribute( "class" ) || "";
	}

	function classesToArray( value ) {
		if ( Array.isArray( value ) ) {
			return value;
		}
		if ( typeof value === "string" ) {
			return value.match( rnothtmlwhite ) || [];
		}
		return [];
	}

	jQuery.fn.extend( {
		addClass: function( value ) {
			var classNames, cur, curValue, className, i, finalValue;

			if ( isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			classNames = classesToArray( value );

			if ( classNames.length ) {
				return this.each( function() {
					curValue = getClass( this );
					cur = this.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

					if ( cur ) {
						for ( i = 0; i < classNames.length; i++ ) {
							className = classNames[ i ];
							if ( cur.indexOf( " " + className + " " ) < 0 ) {
								cur += className + " ";
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = stripAndCollapse( cur );
						if ( curValue !== finalValue ) {
							this.setAttribute( "class", finalValue );
						}
					}
				} );
			}

			return this;
		},

		removeClass: function( value ) {
			var classNames, cur, curValue, className, i, finalValue;

			if ( isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			if ( !arguments.length ) {
				return this.attr( "class", "" );
			}

			classNames = classesToArray( value );

			if ( classNames.length ) {
				return this.each( function() {
					curValue = getClass( this );

					// This expression is here for better compressibility (see addClass)
					cur = this.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

					if ( cur ) {
						for ( i = 0; i < classNames.length; i++ ) {
							className = classNames[ i ];

							// Remove *all* instances
							while ( cur.indexOf( " " + className + " " ) > -1 ) {
								cur = cur.replace( " " + className + " ", " " );
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = stripAndCollapse( cur );
						if ( curValue !== finalValue ) {
							this.setAttribute( "class", finalValue );
						}
					}
				} );
			}

			return this;
		},

		toggleClass: function( value, stateVal ) {
			var classNames, className, i, self,
				type = typeof value,
				isValidValue = type === "string" || Array.isArray( value );

			if ( isFunction( value ) ) {
				return this.each( function( i ) {
					jQuery( this ).toggleClass(
						value.call( this, i, getClass( this ), stateVal ),
						stateVal
					);
				} );
			}

			if ( typeof stateVal === "boolean" && isValidValue ) {
				return stateVal ? this.addClass( value ) : this.removeClass( value );
			}

			classNames = classesToArray( value );

			return this.each( function() {
				if ( isValidValue ) {

					// Toggle individual class names
					self = jQuery( this );

					for ( i = 0; i < classNames.length; i++ ) {
						className = classNames[ i ];

						// Check each className given, space separated list
						if ( self.hasClass( className ) ) {
							self.removeClass( className );
						} else {
							self.addClass( className );
						}
					}

				// Toggle whole class name
				} else if ( value === undefined || type === "boolean" ) {
					className = getClass( this );
					if ( className ) {

						// Store className if set
						dataPriv.set( this, "__className__", className );
					}

					// If the element has a class name or if we're passed `false`,
					// then remove the whole classname (if there was one, the above saved it).
					// Otherwise bring back whatever was previously saved (if anything),
					// falling back to the empty string if nothing was stored.
					if ( this.setAttribute ) {
						this.setAttribute( "class",
							className || value === false ?
								"" :
								dataPriv.get( this, "__className__" ) || ""
						);
					}
				}
			} );
		},

		hasClass: function( selector ) {
			var className, elem,
				i = 0;

			className = " " + selector + " ";
			while ( ( elem = this[ i++ ] ) ) {
				if ( elem.nodeType === 1 &&
					( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
					return true;
				}
			}

			return false;
		}
	} );




	var rreturn = /\r/g;

	jQuery.fn.extend( {
		val: function( value ) {
			var hooks, ret, valueIsFunction,
				elem = this[ 0 ];

			if ( !arguments.length ) {
				if ( elem ) {
					hooks = jQuery.valHooks[ elem.type ] ||
						jQuery.valHooks[ elem.nodeName.toLowerCase() ];

					if ( hooks &&
						"get" in hooks &&
						( ret = hooks.get( elem, "value" ) ) !== undefined
					) {
						return ret;
					}

					ret = elem.value;

					// Handle most common string cases
					if ( typeof ret === "string" ) {
						return ret.replace( rreturn, "" );
					}

					// Handle cases where value is null/undef or number
					return ret == null ? "" : ret;
				}

				return;
			}

			valueIsFunction = isFunction( value );

			return this.each( function( i ) {
				var val;

				if ( this.nodeType !== 1 ) {
					return;
				}

				if ( valueIsFunction ) {
					val = value.call( this, i, jQuery( this ).val() );
				} else {
					val = value;
				}

				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";

				} else if ( typeof val === "number" ) {
					val += "";

				} else if ( Array.isArray( val ) ) {
					val = jQuery.map( val, function( value ) {
						return value == null ? "" : value + "";
					} );
				}

				hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

				// If set returns undefined, fall back to normal setting
				if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
					this.value = val;
				}
			} );
		}
	} );

	jQuery.extend( {
		valHooks: {
			option: {
				get: function( elem ) {

					var val = jQuery.find.attr( elem, "value" );
					return val != null ?
						val :

						// Support: IE <=10 - 11 only
						// option.text throws exceptions (trac-14686, trac-14858)
						// Strip and collapse whitespace
						// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
						stripAndCollapse( jQuery.text( elem ) );
				}
			},
			select: {
				get: function( elem ) {
					var value, option, i,
						options = elem.options,
						index = elem.selectedIndex,
						one = elem.type === "select-one",
						values = one ? null : [],
						max = one ? index + 1 : options.length;

					if ( index < 0 ) {
						i = max;

					} else {
						i = one ? index : 0;
					}

					// Loop through all the selected options
					for ( ; i < max; i++ ) {
						option = options[ i ];

						// Support: IE <=9 only
						// IE8-9 doesn't update selected after form reset (trac-2551)
						if ( ( option.selected || i === index ) &&

								// Don't return options that are disabled or in a disabled optgroup
								!option.disabled &&
								( !option.parentNode.disabled ||
									!nodeName( option.parentNode, "optgroup" ) ) ) {

							// Get the specific value for the option
							value = jQuery( option ).val();

							// We don't need an array for one selects
							if ( one ) {
								return value;
							}

							// Multi-Selects return an array
							values.push( value );
						}
					}

					return values;
				},

				set: function( elem, value ) {
					var optionSet, option,
						options = elem.options,
						values = jQuery.makeArray( value ),
						i = options.length;

					while ( i-- ) {
						option = options[ i ];

						/* eslint-disable no-cond-assign */

						if ( option.selected =
							jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
						) {
							optionSet = true;
						}

						/* eslint-enable no-cond-assign */
					}

					// Force browsers to behave consistently when non-matching value is set
					if ( !optionSet ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		}
	} );

	// Radios and checkboxes getter/setter
	jQuery.each( [ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			set: function( elem, value ) {
				if ( Array.isArray( value ) ) {
					return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
				}
			}
		};
		if ( !support.checkOn ) {
			jQuery.valHooks[ this ].get = function( elem ) {
				return elem.getAttribute( "value" ) === null ? "on" : elem.value;
			};
		}
	} );




	// Return jQuery for attributes-only inclusion
	var location = window.location;

	var nonce = { guid: Date.now() };

	var rquery = ( /\?/ );



	// Cross-browser xml parsing
	jQuery.parseXML = function( data ) {
		var xml, parserErrorElem;
		if ( !data || typeof data !== "string" ) {
			return null;
		}

		// Support: IE 9 - 11 only
		// IE throws on parseFromString with invalid input.
		try {
			xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
		} catch ( e ) {}

		parserErrorElem = xml && xml.getElementsByTagName( "parsererror" )[ 0 ];
		if ( !xml || parserErrorElem ) {
			jQuery.error( "Invalid XML: " + (
				parserErrorElem ?
					jQuery.map( parserErrorElem.childNodes, function( el ) {
						return el.textContent;
					} ).join( "\n" ) :
					data
			) );
		}
		return xml;
	};


	var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
		stopPropagationCallback = function( e ) {
			e.stopPropagation();
		};

	jQuery.extend( jQuery.event, {

		trigger: function( event, data, elem, onlyHandlers ) {

			var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
				eventPath = [ elem || document ],
				type = hasOwn.call( event, "type" ) ? event.type : event,
				namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

			cur = lastElement = tmp = elem = elem || document;

			// Don't do events on text and comment nodes
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}

			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
				return;
			}

			if ( type.indexOf( "." ) > -1 ) {

				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split( "." );
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf( ":" ) < 0 && "on" + type;

			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[ jQuery.expando ] ?
				event :
				new jQuery.Event( type, typeof event === "object" && event );

			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join( "." );
			event.rnamespace = event.namespace ?
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
				null;

			// Clean up the event in case it is being reused
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ?
				[ event ] :
				jQuery.makeArray( data, [ event ] );

			// Allow special events to draw outside the lines
			special = jQuery.event.special[ type ] || {};
			if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}

			// Determine event propagation path in advance, per W3C events spec (trac-9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (trac-9724)
			if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

				bubbleType = special.delegateType || type;
				if ( !rfocusMorph.test( bubbleType + type ) ) {
					cur = cur.parentNode;
				}
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push( cur );
					tmp = cur;
				}

				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( tmp === ( elem.ownerDocument || document ) ) {
					eventPath.push( tmp.defaultView || tmp.parentWindow || window );
				}
			}

			// Fire handlers on the event path
			i = 0;
			while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
				lastElement = cur;
				event.type = i > 1 ?
					bubbleType :
					special.bindType || type;

				// jQuery handler
				handle = ( dataPriv.get( cur, "events" ) || Object.create( null ) )[ event.type ] &&
					dataPriv.get( cur, "handle" );
				if ( handle ) {
					handle.apply( cur, data );
				}

				// Native handler
				handle = ontype && cur[ ontype ];
				if ( handle && handle.apply && acceptData( cur ) ) {
					event.result = handle.apply( cur, data );
					if ( event.result === false ) {
						event.preventDefault();
					}
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {

				if ( ( !special._default ||
					special._default.apply( eventPath.pop(), data ) === false ) &&
					acceptData( elem ) ) {

					// Call a native DOM method on the target with the same name as the event.
					// Don't do default actions on window, that's where global variables be (trac-6170)
					if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ ontype ];

						if ( tmp ) {
							elem[ ontype ] = null;
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;

						if ( event.isPropagationStopped() ) {
							lastElement.addEventListener( type, stopPropagationCallback );
						}

						elem[ type ]();

						if ( event.isPropagationStopped() ) {
							lastElement.removeEventListener( type, stopPropagationCallback );
						}

						jQuery.event.triggered = undefined;

						if ( tmp ) {
							elem[ ontype ] = tmp;
						}
					}
				}
			}

			return event.result;
		},

		// Piggyback on a donor event to simulate a different one
		// Used only for `focus(in | out)` events
		simulate: function( type, elem, event ) {
			var e = jQuery.extend(
				new jQuery.Event(),
				event,
				{
					type: type,
					isSimulated: true
				}
			);

			jQuery.event.trigger( e, null, elem );
		}

	} );

	jQuery.fn.extend( {

		trigger: function( type, data ) {
			return this.each( function() {
				jQuery.event.trigger( type, data, this );
			} );
		},
		triggerHandler: function( type, data ) {
			var elem = this[ 0 ];
			if ( elem ) {
				return jQuery.event.trigger( type, data, elem, true );
			}
		}
	} );


	var
		rbracket = /\[\]$/,
		rCRLF = /\r?\n/g,
		rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable = /^(?:input|select|textarea|keygen)/i;

	function buildParams( prefix, obj, traditional, add ) {
		var name;

		if ( Array.isArray( obj ) ) {

			// Serialize array item.
			jQuery.each( obj, function( i, v ) {
				if ( traditional || rbracket.test( prefix ) ) {

					// Treat each array item as a scalar.
					add( prefix, v );

				} else {

					// Item is non-scalar (array or object), encode its numeric index.
					buildParams(
						prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
						v,
						traditional,
						add
					);
				}
			} );

		} else if ( !traditional && toType( obj ) === "object" ) {

			// Serialize object item.
			for ( name in obj ) {
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
			}

		} else {

			// Serialize scalar item.
			add( prefix, obj );
		}
	}

	// Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param = function( a, traditional ) {
		var prefix,
			s = [],
			add = function( key, valueOrFunction ) {

				// If value is a function, invoke it and use its return value
				var value = isFunction( valueOrFunction ) ?
					valueOrFunction() :
					valueOrFunction;

				s[ s.length ] = encodeURIComponent( key ) + "=" +
					encodeURIComponent( value == null ? "" : value );
			};

		if ( a == null ) {
			return "";
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			} );

		} else {

			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" );
	};

	jQuery.fn.extend( {
		serialize: function() {
			return jQuery.param( this.serializeArray() );
		},
		serializeArray: function() {
			return this.map( function() {

				// Can add propHook for "elements" to filter or add form elements
				var elements = jQuery.prop( this, "elements" );
				return elements ? jQuery.makeArray( elements ) : this;
			} ).filter( function() {
				var type = this.type;

				// Use .is( ":disabled" ) so that fieldset[disabled] works
				return this.name && !jQuery( this ).is( ":disabled" ) &&
					rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
					( this.checked || !rcheckableType.test( type ) );
			} ).map( function( _i, elem ) {
				var val = jQuery( this ).val();

				if ( val == null ) {
					return null;
				}

				if ( Array.isArray( val ) ) {
					return jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} );
				}

				return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
			} ).get();
		}
	} );


	var
		r20 = /%20/g,
		rhash = /#.*$/,
		rantiCache = /([?&])_=[^&]*/,
		rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

		// trac-7653, trac-8125, trac-8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
		rnoContent = /^(?:GET|HEAD)$/,
		rprotocol = /^\/\//,

		/* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */
		prefilters = {},

		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		transports = {},

		// Avoid comment-prolog char sequence (trac-10098); must appease lint and evade compression
		allTypes = "*/".concat( "*" ),

		// Anchor tag for parsing the document origin
		originAnchor = document.createElement( "a" );

	originAnchor.href = location.href;

	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports( structure ) {

		// dataTypeExpression is optional and defaults to "*"
		return function( dataTypeExpression, func ) {

			if ( typeof dataTypeExpression !== "string" ) {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}

			var dataType,
				i = 0,
				dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

			if ( isFunction( func ) ) {

				// For each dataType in the dataTypeExpression
				while ( ( dataType = dataTypes[ i++ ] ) ) {

					// Prepend if requested
					if ( dataType[ 0 ] === "+" ) {
						dataType = dataType.slice( 1 ) || "*";
						( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

					// Otherwise append
					} else {
						( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
					}
				}
			}
		};
	}

	// Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

		var inspected = {},
			seekingTransport = ( structure === transports );

		function inspect( dataType ) {
			var selected;
			inspected[ dataType ] = true;
			jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
				var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
				if ( typeof dataTypeOrTransport === "string" &&
					!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

					options.dataTypes.unshift( dataTypeOrTransport );
					inspect( dataTypeOrTransport );
					return false;
				} else if ( seekingTransport ) {
					return !( selected = dataTypeOrTransport );
				}
			} );
			return selected;
		}

		return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
	}

	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes trac-9887
	function ajaxExtend( target, src ) {
		var key, deep,
			flatOptions = jQuery.ajaxSettings.flatOptions || {};

		for ( key in src ) {
			if ( src[ key ] !== undefined ) {
				( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
			}
		}
		if ( deep ) {
			jQuery.extend( true, target, deep );
		}

		return target;
	}

	/* Handles responses to an ajax request:
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */
	function ajaxHandleResponses( s, jqXHR, responses ) {

		var ct, type, finalDataType, firstDataType,
			contents = s.contents,
			dataTypes = s.dataTypes;

		// Remove auto dataType and get content-type in the process
		while ( dataTypes[ 0 ] === "*" ) {
			dataTypes.shift();
			if ( ct === undefined ) {
				ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
			}
		}

		// Check if we're dealing with a known content-type
		if ( ct ) {
			for ( type in contents ) {
				if ( contents[ type ] && contents[ type ].test( ct ) ) {
					dataTypes.unshift( type );
					break;
				}
			}
		}

		// Check to see if we have a response for the expected dataType
		if ( dataTypes[ 0 ] in responses ) {
			finalDataType = dataTypes[ 0 ];
		} else {

			// Try convertible dataTypes
			for ( type in responses ) {
				if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
					finalDataType = type;
					break;
				}
				if ( !firstDataType ) {
					firstDataType = type;
				}
			}

			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}

		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if ( finalDataType ) {
			if ( finalDataType !== dataTypes[ 0 ] ) {
				dataTypes.unshift( finalDataType );
			}
			return responses[ finalDataType ];
		}
	}

	/* Chain conversions given the request and the original response
	 * Also sets the responseXXX fields on the jqXHR instance
	 */
	function ajaxConvert( s, response, jqXHR, isSuccess ) {
		var conv2, current, conv, tmp, prev,
			converters = {},

			// Work with a copy of dataTypes in case we need to modify it for conversion
			dataTypes = s.dataTypes.slice();

		// Create converters map with lowercased keys
		if ( dataTypes[ 1 ] ) {
			for ( conv in s.converters ) {
				converters[ conv.toLowerCase() ] = s.converters[ conv ];
			}
		}

		current = dataTypes.shift();

		// Convert to each sequential dataType
		while ( current ) {

			if ( s.responseFields[ current ] ) {
				jqXHR[ s.responseFields[ current ] ] = response;
			}

			// Apply the dataFilter if provided
			if ( !prev && isSuccess && s.dataFilter ) {
				response = s.dataFilter( response, s.dataType );
			}

			prev = current;
			current = dataTypes.shift();

			if ( current ) {

				// There's only work to do if current dataType is non-auto
				if ( current === "*" ) {

					current = prev;

				// Convert response if prev dataType is non-auto and differs from current
				} else if ( prev !== "*" && prev !== current ) {

					// Seek a direct converter
					conv = converters[ prev + " " + current ] || converters[ "* " + current ];

					// If none found, seek a pair
					if ( !conv ) {
						for ( conv2 in converters ) {

							// If conv2 outputs current
							tmp = conv2.split( " " );
							if ( tmp[ 1 ] === current ) {

								// If prev can be converted to accepted input
								conv = converters[ prev + " " + tmp[ 0 ] ] ||
									converters[ "* " + tmp[ 0 ] ];
								if ( conv ) {

									// Condense equivalence converters
									if ( conv === true ) {
										conv = converters[ conv2 ];

									// Otherwise, insert the intermediate dataType
									} else if ( converters[ conv2 ] !== true ) {
										current = tmp[ 0 ];
										dataTypes.unshift( tmp[ 1 ] );
									}
									break;
								}
							}
						}
					}

					// Apply converter (if not an equivalence)
					if ( conv !== true ) {

						// Unless errors are allowed to bubble, catch and return them
						if ( conv && s.throws ) {
							response = conv( response );
						} else {
							try {
								response = conv( response );
							} catch ( e ) {
								return {
									state: "parsererror",
									error: conv ? e : "No conversion from " + prev + " to " + current
								};
							}
						}
					}
				}
			}
		}

		return { state: "success", data: response };
	}

	jQuery.extend( {

		// Counter for holding the number of active queries
		active: 0,

		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},

		ajaxSettings: {
			url: location.href,
			type: "GET",
			isLocal: rlocalProtocol.test( location.protocol ),
			global: true,
			processData: true,
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",

			/*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			throws: false,
			traditional: false,
			headers: {},
			*/

			accepts: {
				"*": allTypes,
				text: "text/plain",
				html: "text/html",
				xml: "application/xml, text/xml",
				json: "application/json, text/javascript"
			},

			contents: {
				xml: /\bxml\b/,
				html: /\bhtml/,
				json: /\bjson\b/
			},

			responseFields: {
				xml: "responseXML",
				text: "responseText",
				json: "responseJSON"
			},

			// Data converters
			// Keys separate source (or catchall "*") and destination types with a single space
			converters: {

				// Convert anything to text
				"* text": String,

				// Text to html (true = no transformation)
				"text html": true,

				// Evaluate text as a json expression
				"text json": JSON.parse,

				// Parse text as xml
				"text xml": jQuery.parseXML
			},

			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				url: true,
				context: true
			}
		},

		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup: function( target, settings ) {
			return settings ?

				// Building a settings object
				ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

				// Extending ajaxSettings
				ajaxExtend( jQuery.ajaxSettings, target );
		},

		ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
		ajaxTransport: addToPrefiltersOrTransports( transports ),

		// Main method
		ajax: function( url, options ) {

			// If url is an object, simulate pre-1.5 signature
			if ( typeof url === "object" ) {
				options = url;
				url = undefined;
			}

			// Force options to be an object
			options = options || {};

			var transport,

				// URL without anti-cache param
				cacheURL,

				// Response headers
				responseHeadersString,
				responseHeaders,

				// timeout handle
				timeoutTimer,

				// Url cleanup var
				urlAnchor,

				// Request state (becomes false upon send and true upon completion)
				completed,

				// To know if global events are to be dispatched
				fireGlobals,

				// Loop variable
				i,

				// uncached part of the url
				uncached,

				// Create the final options object
				s = jQuery.ajaxSetup( {}, options ),

				// Callbacks context
				callbackContext = s.context || s,

				// Context for global events is callbackContext if it is a DOM node or jQuery collection
				globalEventContext = s.context &&
					( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

				// Deferreds
				deferred = jQuery.Deferred(),
				completeDeferred = jQuery.Callbacks( "once memory" ),

				// Status-dependent callbacks
				statusCode = s.statusCode || {},

				// Headers (they are sent all at once)
				requestHeaders = {},
				requestHeadersNames = {},

				// Default abort message
				strAbort = "canceled",

				// Fake xhr
				jqXHR = {
					readyState: 0,

					// Builds headers hashtable if needed
					getResponseHeader: function( key ) {
						var match;
						if ( completed ) {
							if ( !responseHeaders ) {
								responseHeaders = {};
								while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
									responseHeaders[ match[ 1 ].toLowerCase() + " " ] =
										( responseHeaders[ match[ 1 ].toLowerCase() + " " ] || [] )
											.concat( match[ 2 ] );
								}
							}
							match = responseHeaders[ key.toLowerCase() + " " ];
						}
						return match == null ? null : match.join( ", " );
					},

					// Raw string
					getAllResponseHeaders: function() {
						return completed ? responseHeadersString : null;
					},

					// Caches the header
					setRequestHeader: function( name, value ) {
						if ( completed == null ) {
							name = requestHeadersNames[ name.toLowerCase() ] =
								requestHeadersNames[ name.toLowerCase() ] || name;
							requestHeaders[ name ] = value;
						}
						return this;
					},

					// Overrides response content-type header
					overrideMimeType: function( type ) {
						if ( completed == null ) {
							s.mimeType = type;
						}
						return this;
					},

					// Status-dependent callbacks
					statusCode: function( map ) {
						var code;
						if ( map ) {
							if ( completed ) {

								// Execute the appropriate callbacks
								jqXHR.always( map[ jqXHR.status ] );
							} else {

								// Lazy-add the new callbacks in a way that preserves old ones
								for ( code in map ) {
									statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
								}
							}
						}
						return this;
					},

					// Cancel the request
					abort: function( statusText ) {
						var finalText = statusText || strAbort;
						if ( transport ) {
							transport.abort( finalText );
						}
						done( 0, finalText );
						return this;
					}
				};

			// Attach deferreds
			deferred.promise( jqXHR );

			// Add protocol if not provided (prefilters might expect it)
			// Handle falsy url in the settings object (trac-10093: consistency with old signature)
			// We also use the url parameter if available
			s.url = ( ( url || s.url || location.href ) + "" )
				.replace( rprotocol, location.protocol + "//" );

			// Alias method option to type as per ticket trac-12004
			s.type = options.method || options.type || s.method || s.type;

			// Extract dataTypes list
			s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

			// A cross-domain request is in order when the origin doesn't match the current origin.
			if ( s.crossDomain == null ) {
				urlAnchor = document.createElement( "a" );

				// Support: IE <=8 - 11, Edge 12 - 15
				// IE throws exception on accessing the href property if url is malformed,
				// e.g. http://example.com:80x/
				try {
					urlAnchor.href = s.url;

					// Support: IE <=8 - 11 only
					// Anchor's host property isn't correctly set when s.url is relative
					urlAnchor.href = urlAnchor.href;
					s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
						urlAnchor.protocol + "//" + urlAnchor.host;
				} catch ( e ) {

					// If there is an error parsing the URL, assume it is crossDomain,
					// it can be rejected by the transport if it is invalid
					s.crossDomain = true;
				}
			}

			// Convert data if not already a string
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				s.data = jQuery.param( s.data, s.traditional );
			}

			// Apply prefilters
			inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

			// If request was aborted inside a prefilter, stop there
			if ( completed ) {
				return jqXHR;
			}

			// We can fire global events as of now if asked to
			// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (trac-15118)
			fireGlobals = jQuery.event && s.global;

			// Watch for a new set of requests
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger( "ajaxStart" );
			}

			// Uppercase the type
			s.type = s.type.toUpperCase();

			// Determine if request has content
			s.hasContent = !rnoContent.test( s.type );

			// Save the URL in case we're toying with the If-Modified-Since
			// and/or If-None-Match header later on
			// Remove hash to simplify url manipulation
			cacheURL = s.url.replace( rhash, "" );

			// More options handling for requests with no content
			if ( !s.hasContent ) {

				// Remember the hash so we can put it back
				uncached = s.url.slice( cacheURL.length );

				// If data is available and should be processed, append data to url
				if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
					cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

					// trac-9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}

				// Add or update anti-cache param if needed
				if ( s.cache === false ) {
					cacheURL = cacheURL.replace( rantiCache, "$1" );
					uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce.guid++ ) +
						uncached;
				}

				// Put hash and anti-cache on the URL that will be requested (gh-1732)
				s.url = cacheURL + uncached;

			// Change '%20' to '+' if this is encoded form body content (gh-2658)
			} else if ( s.data && s.processData &&
				( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
				s.data = s.data.replace( r20, "+" );
			}

			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if ( s.ifModified ) {
				if ( jQuery.lastModified[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
				}
				if ( jQuery.etag[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
				}
			}

			// Set the correct header, if data is being sent
			if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
				jqXHR.setRequestHeader( "Content-Type", s.contentType );
			}

			// Set the Accepts header for the server, depending on the dataType
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
					s.accepts[ s.dataTypes[ 0 ] ] +
						( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
					s.accepts[ "*" ]
			);

			// Check for headers option
			for ( i in s.headers ) {
				jqXHR.setRequestHeader( i, s.headers[ i ] );
			}

			// Allow custom headers/mimetypes and early abort
			if ( s.beforeSend &&
				( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

				// Abort if not done already and return
				return jqXHR.abort();
			}

			// Aborting is no longer a cancellation
			strAbort = "abort";

			// Install callbacks on deferreds
			completeDeferred.add( s.complete );
			jqXHR.done( s.success );
			jqXHR.fail( s.error );

			// Get transport
			transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

			// If no transport, we auto-abort
			if ( !transport ) {
				done( -1, "No Transport" );
			} else {
				jqXHR.readyState = 1;

				// Send global event
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
				}

				// If request was aborted inside ajaxSend, stop there
				if ( completed ) {
					return jqXHR;
				}

				// Timeout
				if ( s.async && s.timeout > 0 ) {
					timeoutTimer = window.setTimeout( function() {
						jqXHR.abort( "timeout" );
					}, s.timeout );
				}

				try {
					completed = false;
					transport.send( requestHeaders, done );
				} catch ( e ) {

					// Rethrow post-completion exceptions
					if ( completed ) {
						throw e;
					}

					// Propagate others as results
					done( -1, e );
				}
			}

			// Callback for when everything is done
			function done( status, nativeStatusText, responses, headers ) {
				var isSuccess, success, error, response, modified,
					statusText = nativeStatusText;

				// Ignore repeat invocations
				if ( completed ) {
					return;
				}

				completed = true;

				// Clear timeout if it exists
				if ( timeoutTimer ) {
					window.clearTimeout( timeoutTimer );
				}

				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;

				// Cache response headers
				responseHeadersString = headers || "";

				// Set readyState
				jqXHR.readyState = status > 0 ? 4 : 0;

				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;

				// Get response data
				if ( responses ) {
					response = ajaxHandleResponses( s, jqXHR, responses );
				}

				// Use a noop converter for missing script but not if jsonp
				if ( !isSuccess &&
					jQuery.inArray( "script", s.dataTypes ) > -1 &&
					jQuery.inArray( "json", s.dataTypes ) < 0 ) {
					s.converters[ "text script" ] = function() {};
				}

				// Convert no matter what (that way responseXXX fields are always set)
				response = ajaxConvert( s, response, jqXHR, isSuccess );

				// If successful, handle type chaining
				if ( isSuccess ) {

					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if ( s.ifModified ) {
						modified = jqXHR.getResponseHeader( "Last-Modified" );
						if ( modified ) {
							jQuery.lastModified[ cacheURL ] = modified;
						}
						modified = jqXHR.getResponseHeader( "etag" );
						if ( modified ) {
							jQuery.etag[ cacheURL ] = modified;
						}
					}

					// if no content
					if ( status === 204 || s.type === "HEAD" ) {
						statusText = "nocontent";

					// if not modified
					} else if ( status === 304 ) {
						statusText = "notmodified";

					// If we have data, let's convert it
					} else {
						statusText = response.state;
						success = response.data;
						error = response.error;
						isSuccess = !error;
					}
				} else {

					// Extract error from statusText and normalize for non-aborts
					error = statusText;
					if ( status || !statusText ) {
						statusText = "error";
						if ( status < 0 ) {
							status = 0;
						}
					}
				}

				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = ( nativeStatusText || statusText ) + "";

				// Success/Error
				if ( isSuccess ) {
					deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
				} else {
					deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
				}

				// Status-dependent callbacks
				jqXHR.statusCode( statusCode );
				statusCode = undefined;

				if ( fireGlobals ) {
					globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
						[ jqXHR, s, isSuccess ? success : error ] );
				}

				// Complete
				completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

					// Handle the global AJAX counter
					if ( !( --jQuery.active ) ) {
						jQuery.event.trigger( "ajaxStop" );
					}
				}
			}

			return jqXHR;
		},

		getJSON: function( url, data, callback ) {
			return jQuery.get( url, data, callback, "json" );
		},

		getScript: function( url, callback ) {
			return jQuery.get( url, undefined, callback, "script" );
		}
	} );

	jQuery.each( [ "get", "post" ], function( _i, method ) {
		jQuery[ method ] = function( url, data, callback, type ) {

			// Shift arguments if data argument was omitted
			if ( isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = undefined;
			}

			// The url can be an options object (which then must have .url)
			return jQuery.ajax( jQuery.extend( {
				url: url,
				type: method,
				dataType: type,
				data: data,
				success: callback
			}, jQuery.isPlainObject( url ) && url ) );
		};
	} );

	jQuery.ajaxPrefilter( function( s ) {
		var i;
		for ( i in s.headers ) {
			if ( i.toLowerCase() === "content-type" ) {
				s.contentType = s.headers[ i ] || "";
			}
		}
	} );


	jQuery._evalUrl = function( url, options, doc ) {
		return jQuery.ajax( {
			url: url,

			// Make this explicit, since user can override this through ajaxSetup (trac-11264)
			type: "GET",
			dataType: "script",
			cache: true,
			async: false,
			global: false,

			// Only evaluate the response if it is successful (gh-4126)
			// dataFilter is not invoked for failure responses, so using it instead
			// of the default converter is kludgy but it works.
			converters: {
				"text script": function() {}
			},
			dataFilter: function( response ) {
				jQuery.globalEval( response, options, doc );
			}
		} );
	};


	jQuery.fn.extend( {
		wrapAll: function( html ) {
			var wrap;

			if ( this[ 0 ] ) {
				if ( isFunction( html ) ) {
					html = html.call( this[ 0 ] );
				}

				// The elements to wrap the target around
				wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

				if ( this[ 0 ].parentNode ) {
					wrap.insertBefore( this[ 0 ] );
				}

				wrap.map( function() {
					var elem = this;

					while ( elem.firstElementChild ) {
						elem = elem.firstElementChild;
					}

					return elem;
				} ).append( this );
			}

			return this;
		},

		wrapInner: function( html ) {
			if ( isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapInner( html.call( this, i ) );
				} );
			}

			return this.each( function() {
				var self = jQuery( this ),
					contents = self.contents();

				if ( contents.length ) {
					contents.wrapAll( html );

				} else {
					self.append( html );
				}
			} );
		},

		wrap: function( html ) {
			var htmlIsFunction = isFunction( html );

			return this.each( function( i ) {
				jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
			} );
		},

		unwrap: function( selector ) {
			this.parent( selector ).not( "body" ).each( function() {
				jQuery( this ).replaceWith( this.childNodes );
			} );
			return this;
		}
	} );


	jQuery.expr.pseudos.hidden = function( elem ) {
		return !jQuery.expr.pseudos.visible( elem );
	};
	jQuery.expr.pseudos.visible = function( elem ) {
		return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
	};




	jQuery.ajaxSettings.xhr = function() {
		try {
			return new window.XMLHttpRequest();
		} catch ( e ) {}
	};

	var xhrSuccessStatus = {

			// File protocol always yields status code 0, assume 200
			0: 200,

			// Support: IE <=9 only
			// trac-1450: sometimes IE returns 1223 when it should be 204
			1223: 204
		},
		xhrSupported = jQuery.ajaxSettings.xhr();

	support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
	support.ajax = xhrSupported = !!xhrSupported;

	jQuery.ajaxTransport( function( options ) {
		var callback, errorCallback;

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( support.cors || xhrSupported && !options.crossDomain ) {
			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr();

					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {
						xhr.setRequestHeader( i, headers[ i ] );
					}

					// Callback
					callback = function( type ) {
						return function() {
							if ( callback ) {
								callback = errorCallback = xhr.onload =
									xhr.onerror = xhr.onabort = xhr.ontimeout =
										xhr.onreadystatechange = null;

								if ( type === "abort" ) {
									xhr.abort();
								} else if ( type === "error" ) {

									// Support: IE <=9 only
									// On a manual native abort, IE9 throws
									// errors on any property access that is not readyState
									if ( typeof xhr.status !== "number" ) {
										complete( 0, "error" );
									} else {
										complete(

											// File: protocol always yields status 0; see trac-8605, trac-14207
											xhr.status,
											xhr.statusText
										);
									}
								} else {
									complete(
										xhrSuccessStatus[ xhr.status ] || xhr.status,
										xhr.statusText,

										// Support: IE <=9 only
										// IE9 has no XHR2 but throws on binary (trac-11426)
										// For XHR2 non-text, let the caller handle it (gh-2498)
										( xhr.responseType || "text" ) !== "text"  ||
										typeof xhr.responseText !== "string" ?
											{ binary: xhr.response } :
											{ text: xhr.responseText },
										xhr.getAllResponseHeaders()
									);
								}
							}
						};
					};

					// Listen to events
					xhr.onload = callback();
					errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

					// Support: IE 9 only
					// Use onreadystatechange to replace onabort
					// to handle uncaught aborts
					if ( xhr.onabort !== undefined ) {
						xhr.onabort = errorCallback;
					} else {
						xhr.onreadystatechange = function() {

							// Check readyState before timeout as it changes
							if ( xhr.readyState === 4 ) {

								// Allow onerror to be called first,
								// but that will not handle a native abort
								// Also, save errorCallback to a variable
								// as xhr.onerror cannot be accessed
								window.setTimeout( function() {
									if ( callback ) {
										errorCallback();
									}
								} );
							}
						};
					}

					// Create the abort callback
					callback = callback( "abort" );

					try {

						// Do send the request (this may raise an exception)
						xhr.send( options.hasContent && options.data || null );
					} catch ( e ) {

						// trac-14683: Only rethrow if this hasn't been notified as an error yet
						if ( callback ) {
							throw e;
						}
					}
				},

				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
	jQuery.ajaxPrefilter( function( s ) {
		if ( s.crossDomain ) {
			s.contents.script = false;
		}
	} );

	// Install script dataType
	jQuery.ajaxSetup( {
		accepts: {
			script: "text/javascript, application/javascript, " +
				"application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /\b(?:java|ecma)script\b/
		},
		converters: {
			"text script": function( text ) {
				jQuery.globalEval( text );
				return text;
			}
		}
	} );

	// Handle cache's special case and crossDomain
	jQuery.ajaxPrefilter( "script", function( s ) {
		if ( s.cache === undefined ) {
			s.cache = false;
		}
		if ( s.crossDomain ) {
			s.type = "GET";
		}
	} );

	// Bind script tag hack transport
	jQuery.ajaxTransport( "script", function( s ) {

		// This transport only deals with cross domain or forced-by-attrs requests
		if ( s.crossDomain || s.scriptAttrs ) {
			var script, callback;
			return {
				send: function( _, complete ) {
					script = jQuery( "<script>" )
						.attr( s.scriptAttrs || {} )
						.prop( { charset: s.scriptCharset, src: s.url } )
						.on( "load error", callback = function( evt ) {
							script.remove();
							callback = null;
							if ( evt ) {
								complete( evt.type === "error" ? 404 : 200, evt.type );
							}
						} );

					// Use native DOM manipulation to avoid our domManip AJAX trickery
					document.head.appendChild( script[ 0 ] );
				},
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	var oldCallbacks = [],
		rjsonp = /(=)\?(?=&|$)|\?\?/;

	// Default jsonp settings
	jQuery.ajaxSetup( {
		jsonp: "callback",
		jsonpCallback: function() {
			var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce.guid++ ) );
			this[ callback ] = true;
			return callback;
		}
	} );

	// Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

		var callbackName, overwritten, responseContainer,
			jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
				"url" :
				typeof s.data === "string" &&
					( s.contentType || "" )
						.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
					rjsonp.test( s.data ) && "data"
			);

		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
				s.jsonpCallback() :
				s.jsonpCallback;

			// Insert callback into url or form data
			if ( jsonProp ) {
				s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
			} else if ( s.jsonp !== false ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
			}

			// Use data converter to retrieve json after script execution
			s.converters[ "script json" ] = function() {
				if ( !responseContainer ) {
					jQuery.error( callbackName + " was not called" );
				}
				return responseContainer[ 0 ];
			};

			// Force json dataType
			s.dataTypes[ 0 ] = "json";

			// Install callback
			overwritten = window[ callbackName ];
			window[ callbackName ] = function() {
				responseContainer = arguments;
			};

			// Clean-up function (fires after converters)
			jqXHR.always( function() {

				// If previous value didn't exist - remove it
				if ( overwritten === undefined ) {
					jQuery( window ).removeProp( callbackName );

				// Otherwise restore preexisting value
				} else {
					window[ callbackName ] = overwritten;
				}

				// Save back as free
				if ( s[ callbackName ] ) {

					// Make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;

					// Save the callback name for future use
					oldCallbacks.push( callbackName );
				}

				// Call if it was a function and we have a response
				if ( responseContainer && isFunction( overwritten ) ) {
					overwritten( responseContainer[ 0 ] );
				}

				responseContainer = overwritten = undefined;
			} );

			// Delegate to script
			return "script";
		}
	} );




	// Support: Safari 8 only
	// In Safari 8 documents created via document.implementation.createHTMLDocument
	// collapse sibling forms: the second one becomes a child of the first one.
	// Because of that, this security measure has to be disabled in Safari 8.
	// https://bugs.webkit.org/show_bug.cgi?id=137337
	support.createHTMLDocument = ( function() {
		var body = document.implementation.createHTMLDocument( "" ).body;
		body.innerHTML = "<form></form><form></form>";
		return body.childNodes.length === 2;
	} )();


	// Argument "data" should be string of html
	// context (optional): If specified, the fragment will be created in this context,
	// defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML = function( data, context, keepScripts ) {
		if ( typeof data !== "string" ) {
			return [];
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}

		var base, parsed, scripts;

		if ( !context ) {

			// Stop scripts or inline event handlers from being executed immediately
			// by using document.implementation
			if ( support.createHTMLDocument ) {
				context = document.implementation.createHTMLDocument( "" );

				// Set the base href for the created document
				// so any parsed elements with URLs
				// are based on the document's URL (gh-2965)
				base = context.createElement( "base" );
				base.href = document.location.href;
				context.head.appendChild( base );
			} else {
				context = document;
			}
		}

		parsed = rsingleTag.exec( data );
		scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[ 1 ] ) ];
		}

		parsed = buildFragment( [ data ], context, scripts );

		if ( scripts && scripts.length ) {
			jQuery( scripts ).remove();
		}

		return jQuery.merge( [], parsed.childNodes );
	};


	/**
	 * Load a url into a page
	 */
	jQuery.fn.load = function( url, params, callback ) {
		var selector, type, response,
			self = this,
			off = url.indexOf( " " );

		if ( off > -1 ) {
			selector = stripAndCollapse( url.slice( off ) );
			url = url.slice( 0, off );
		}

		// If it's a function
		if ( isFunction( params ) ) {

			// We assume that it's the callback
			callback = params;
			params = undefined;

		// Otherwise, build a param string
		} else if ( params && typeof params === "object" ) {
			type = "POST";
		}

		// If we have elements to modify, make the request
		if ( self.length > 0 ) {
			jQuery.ajax( {
				url: url,

				// If "type" variable is undefined, then "GET" method will be used.
				// Make value of this field explicit since
				// user can override it through ajaxSetup method
				type: type || "GET",
				dataType: "html",
				data: params
			} ).done( function( responseText ) {

				// Save response for use in complete callback
				response = arguments;

				self.html( selector ?

					// If a selector was specified, locate the right elements in a dummy div
					// Exclude scripts to avoid IE 'Permission Denied' errors
					jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

					// Otherwise use the full result
					responseText );

			// If the request succeeds, this function gets "data", "status", "jqXHR"
			// but they are ignored because response was set above.
			// If it fails, this function gets "jqXHR", "status", "error"
			} ).always( callback && function( jqXHR, status ) {
				self.each( function() {
					callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
				} );
			} );
		}

		return this;
	};




	jQuery.expr.pseudos.animated = function( elem ) {
		return jQuery.grep( jQuery.timers, function( fn ) {
			return elem === fn.elem;
		} ).length;
	};




	jQuery.offset = {
		setOffset: function( elem, options, i ) {
			var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
				position = jQuery.css( elem, "position" ),
				curElem = jQuery( elem ),
				props = {};

			// Set position first, in-case top/left are set even on static elem
			if ( position === "static" ) {
				elem.style.position = "relative";
			}

			curOffset = curElem.offset();
			curCSSTop = jQuery.css( elem, "top" );
			curCSSLeft = jQuery.css( elem, "left" );
			calculatePosition = ( position === "absolute" || position === "fixed" ) &&
				( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

			// Need to be able to calculate position if either
			// top or left is auto and position is either absolute or fixed
			if ( calculatePosition ) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;

			} else {
				curTop = parseFloat( curCSSTop ) || 0;
				curLeft = parseFloat( curCSSLeft ) || 0;
			}

			if ( isFunction( options ) ) {

				// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
				options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
			}

			if ( options.top != null ) {
				props.top = ( options.top - curOffset.top ) + curTop;
			}
			if ( options.left != null ) {
				props.left = ( options.left - curOffset.left ) + curLeft;
			}

			if ( "using" in options ) {
				options.using.call( elem, props );

			} else {
				curElem.css( props );
			}
		}
	};

	jQuery.fn.extend( {

		// offset() relates an element's border box to the document origin
		offset: function( options ) {

			// Preserve chaining for setter
			if ( arguments.length ) {
				return options === undefined ?
					this :
					this.each( function( i ) {
						jQuery.offset.setOffset( this, options, i );
					} );
			}

			var rect, win,
				elem = this[ 0 ];

			if ( !elem ) {
				return;
			}

			// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
			// Support: IE <=11 only
			// Running getBoundingClientRect on a
			// disconnected node in IE throws an error
			if ( !elem.getClientRects().length ) {
				return { top: 0, left: 0 };
			}

			// Get document-relative position by adding viewport scroll to viewport-relative gBCR
			rect = elem.getBoundingClientRect();
			win = elem.ownerDocument.defaultView;
			return {
				top: rect.top + win.pageYOffset,
				left: rect.left + win.pageXOffset
			};
		},

		// position() relates an element's margin box to its offset parent's padding box
		// This corresponds to the behavior of CSS absolute positioning
		position: function() {
			if ( !this[ 0 ] ) {
				return;
			}

			var offsetParent, offset, doc,
				elem = this[ 0 ],
				parentOffset = { top: 0, left: 0 };

			// position:fixed elements are offset from the viewport, which itself always has zero offset
			if ( jQuery.css( elem, "position" ) === "fixed" ) {

				// Assume position:fixed implies availability of getBoundingClientRect
				offset = elem.getBoundingClientRect();

			} else {
				offset = this.offset();

				// Account for the *real* offset parent, which can be the document or its root element
				// when a statically positioned element is identified
				doc = elem.ownerDocument;
				offsetParent = elem.offsetParent || doc.documentElement;
				while ( offsetParent &&
					( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
					jQuery.css( offsetParent, "position" ) === "static" ) {

					offsetParent = offsetParent.parentNode;
				}
				if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

					// Incorporate borders into its offset, since they are outside its content origin
					parentOffset = jQuery( offsetParent ).offset();
					parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
					parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
				}
			}

			// Subtract parent offsets and element margins
			return {
				top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
				left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
			};
		},

		// This method will return documentElement in the following cases:
		// 1) For the element inside the iframe without offsetParent, this method will return
		//    documentElement of the parent window
		// 2) For the hidden or detached element
		// 3) For body or html element, i.e. in case of the html node - it will return itself
		//
		// but those exceptions were never presented as a real life use-cases
		// and might be considered as more preferable results.
		//
		// This logic, however, is not guaranteed and can change at any point in the future
		offsetParent: function() {
			return this.map( function() {
				var offsetParent = this.offsetParent;

				while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
					offsetParent = offsetParent.offsetParent;
				}

				return offsetParent || documentElement;
			} );
		}
	} );

	// Create scrollLeft and scrollTop methods
	jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
		var top = "pageYOffset" === prop;

		jQuery.fn[ method ] = function( val ) {
			return access( this, function( elem, method, val ) {

				// Coalesce documents and windows
				var win;
				if ( isWindow( elem ) ) {
					win = elem;
				} else if ( elem.nodeType === 9 ) {
					win = elem.defaultView;
				}

				if ( val === undefined ) {
					return win ? win[ prop ] : elem[ method ];
				}

				if ( win ) {
					win.scrollTo(
						!top ? val : win.pageXOffset,
						top ? val : win.pageYOffset
					);

				} else {
					elem[ method ] = val;
				}
			}, method, val, arguments.length );
		};
	} );

	// Support: Safari <=7 - 9.1, Chrome <=37 - 49
	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
	// getComputedStyle returns percent when specified for top/left/bottom/right;
	// rather than make the css module depend on the offset module, just check for it here
	jQuery.each( [ "top", "left" ], function( _i, prop ) {
		jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
			function( elem, computed ) {
				if ( computed ) {
					computed = curCSS( elem, prop );

					// If curCSS returns percentage, fallback to offset
					return rnumnonpx.test( computed ) ?
						jQuery( elem ).position()[ prop ] + "px" :
						computed;
				}
			}
		);
	} );


	// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
		jQuery.each( {
			padding: "inner" + name,
			content: type,
			"": "outer" + name
		}, function( defaultExtra, funcName ) {

			// Margin is only for outerHeight, outerWidth
			jQuery.fn[ funcName ] = function( margin, value ) {
				var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
					extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

				return access( this, function( elem, type, value ) {
					var doc;

					if ( isWindow( elem ) ) {

						// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
						return funcName.indexOf( "outer" ) === 0 ?
							elem[ "inner" + name ] :
							elem.document.documentElement[ "client" + name ];
					}

					// Get document width or height
					if ( elem.nodeType === 9 ) {
						doc = elem.documentElement;

						// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
						// whichever is greatest
						return Math.max(
							elem.body[ "scroll" + name ], doc[ "scroll" + name ],
							elem.body[ "offset" + name ], doc[ "offset" + name ],
							doc[ "client" + name ]
						);
					}

					return value === undefined ?

						// Get width or height on the element, requesting but not forcing parseFloat
						jQuery.css( elem, type, extra ) :

						// Set width or height on the element
						jQuery.style( elem, type, value, extra );
				}, type, chainable ? margin : undefined, chainable );
			};
		} );
	} );


	jQuery.each( [
		"ajaxStart",
		"ajaxStop",
		"ajaxComplete",
		"ajaxError",
		"ajaxSuccess",
		"ajaxSend"
	], function( _i, type ) {
		jQuery.fn[ type ] = function( fn ) {
			return this.on( type, fn );
		};
	} );




	jQuery.fn.extend( {

		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},

		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {

			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ?
				this.off( selector, "**" ) :
				this.off( types, selector || "**", fn );
		},

		hover: function( fnOver, fnOut ) {
			return this
				.on( "mouseenter", fnOver )
				.on( "mouseleave", fnOut || fnOver );
		}
	} );

	jQuery.each(
		( "blur focus focusin focusout resize scroll click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup contextmenu" ).split( " " ),
		function( _i, name ) {

			// Handle event binding
			jQuery.fn[ name ] = function( data, fn ) {
				return arguments.length > 0 ?
					this.on( name, null, data, fn ) :
					this.trigger( name );
			};
		}
	);




	// Support: Android <=4.0 only
	// Make sure we trim BOM and NBSP
	// Require that the "whitespace run" starts from a non-whitespace
	// to avoid O(N^2) behavior when the engine would try matching "\s+$" at each space position.
	var rtrim = /^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;

	// Bind a function to a context, optionally partially applying any
	// arguments.
	// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
	// However, it is not slated for removal any time soon
	jQuery.proxy = function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	};

	jQuery.holdReady = function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	};
	jQuery.isArray = Array.isArray;
	jQuery.parseJSON = JSON.parse;
	jQuery.nodeName = nodeName;
	jQuery.isFunction = isFunction;
	jQuery.isWindow = isWindow;
	jQuery.camelCase = camelCase;
	jQuery.type = toType;

	jQuery.now = Date.now;

	jQuery.isNumeric = function( obj ) {

		// As of jQuery 3.0, isNumeric is limited to
		// strings and numbers (primitives or objects)
		// that can be coerced to finite numbers (gh-2662)
		var type = jQuery.type( obj );
		return ( type === "number" || type === "string" ) &&

			// parseFloat NaNs numeric-cast false positives ("")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			!isNaN( obj - parseFloat( obj ) );
	};

	jQuery.trim = function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "$1" );
	};




	var

		// Map over jQuery in case of overwrite
		_jQuery = window.jQuery,

		// Map over the $ in case of overwrite
		_$ = window.$;

	jQuery.noConflict = function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	};

	// Expose jQuery and $ identifiers, even in AMD
	// (trac-7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (trac-13566)
	if ( typeof noGlobal === "undefined" ) {
		window.jQuery = window.$ = jQuery;
	}




	return jQuery;
	} ); 
} (jquery));

var jqueryExports = jquery.exports;
var $$1 = /*@__PURE__*/getDefaultExportFromCjs(jqueryExports);

var prefix = "$";

function Map() {}

Map.prototype = map$2.prototype = {
  constructor: Map,
  has: function(key) {
    return (prefix + key) in this;
  },
  get: function(key) {
    return this[prefix + key];
  },
  set: function(key, value) {
    this[prefix + key] = value;
    return this;
  },
  remove: function(key) {
    var property = prefix + key;
    return property in this && delete this[property];
  },
  clear: function() {
    for (var property in this) if (property[0] === prefix) delete this[property];
  },
  keys: function() {
    var keys = [];
    for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
    return keys;
  },
  values: function() {
    var values = [];
    for (var property in this) if (property[0] === prefix) values.push(this[property]);
    return values;
  },
  entries: function() {
    var entries = [];
    for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
    return entries;
  },
  size: function() {
    var size = 0;
    for (var property in this) if (property[0] === prefix) ++size;
    return size;
  },
  empty: function() {
    for (var property in this) if (property[0] === prefix) return false;
    return true;
  },
  each: function(f) {
    for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
  }
};

function map$2(object, f) {
  var map = new Map;

  // Copy constructor.
  if (object instanceof Map) object.each(function(value, key) { map.set(key, value); });

  // Index array by numeric index or specified key function.
  else if (Array.isArray(object)) {
    var i = -1,
        n = object.length,
        o;

    if (f == null) while (++i < n) map.set(i, object[i]);
    else while (++i < n) map.set(f(o = object[i], i, object), o);
  }

  // Convert object to map.
  else if (object) for (var key in object) map.set(key, object[key]);

  return map;
}

function nest() {
  var keys = [],
      sortKeys = [],
      sortValues,
      rollup,
      nest;

  function apply(array, depth, createResult, setResult) {
    if (depth >= keys.length) {
      if (sortValues != null) array.sort(sortValues);
      return rollup != null ? rollup(array) : array;
    }

    var i = -1,
        n = array.length,
        key = keys[depth++],
        keyValue,
        value,
        valuesByKey = map$2(),
        values,
        result = createResult();

    while (++i < n) {
      if (values = valuesByKey.get(keyValue = key(value = array[i]) + "")) {
        values.push(value);
      } else {
        valuesByKey.set(keyValue, [value]);
      }
    }

    valuesByKey.each(function(values, key) {
      setResult(result, key, apply(values, depth, createResult, setResult));
    });

    return result;
  }

  function entries(map, depth) {
    if (++depth > keys.length) return map;
    var array, sortKey = sortKeys[depth - 1];
    if (rollup != null && depth >= keys.length) array = map.entries();
    else array = [], map.each(function(v, k) { array.push({key: k, values: entries(v, depth)}); });
    return sortKey != null ? array.sort(function(a, b) { return sortKey(a.key, b.key); }) : array;
  }

  return nest = {
    object: function(array) { return apply(array, 0, createObject, setObject); },
    map: function(array) { return apply(array, 0, createMap, setMap); },
    entries: function(array) { return entries(apply(array, 0, createMap, setMap), 0); },
    key: function(d) { keys.push(d); return nest; },
    sortKeys: function(order) { sortKeys[keys.length - 1] = order; return nest; },
    sortValues: function(order) { sortValues = order; return nest; },
    rollup: function(f) { rollup = f; return nest; }
  };
}

function createObject() {
  return {};
}

function setObject(object, key, value) {
  object[key] = value;
}

function createMap() {
  return map$2();
}

function setMap(map, key, value) {
  map.set(key, value);
}

function Set$1() {}

var proto = map$2.prototype;

Set$1.prototype = {
  constructor: Set$1,
  has: proto.has,
  add: function(value) {
    value += "";
    this[prefix + value] = value;
    return this;
  },
  remove: proto.remove,
  clear: proto.clear,
  values: proto.keys,
  size: proto.size,
  empty: proto.empty,
  each: proto.each
};

function keys(map) {
  var keys = [];
  for (var key in map) keys.push(key);
  return keys;
}

function initRange(domain, range) {
  switch (arguments.length) {
    case 0: break;
    case 1: this.range(domain); break;
    default: this.range(range).domain(domain); break;
  }
  return this;
}

function initInterpolator(domain, interpolator) {
  switch (arguments.length) {
    case 0: break;
    case 1: this.interpolator(domain); break;
    default: this.interpolator(interpolator).domain(domain); break;
  }
  return this;
}

var array = Array.prototype;

var map$1 = array.map;
var slice$1 = array.slice;

var implicit = {name: "implicit"};

function ordinal() {
  var index = map$2(),
      domain = [],
      range = [],
      unknown = implicit;

  function scale(d) {
    var key = d + "", i = index.get(key);
    if (!i) {
      if (unknown !== implicit) return unknown;
      index.set(key, i = domain.push(d));
    }
    return range[(i - 1) % range.length];
  }

  scale.domain = function(_) {
    if (!arguments.length) return domain.slice();
    domain = [], index = map$2();
    var i = -1, n = _.length, d, key;
    while (++i < n) if (!index.has(key = (d = _[i]) + "")) index.set(key, domain.push(d));
    return scale;
  };

  scale.range = function(_) {
    return arguments.length ? (range = slice$1.call(_), scale) : range.slice();
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.copy = function() {
    return ordinal(domain, range).unknown(unknown);
  };

  initRange.apply(scale, arguments);

  return scale;
}

function band() {
  var scale = ordinal().unknown(undefined),
      domain = scale.domain,
      ordinalRange = scale.range,
      range$1 = [0, 1],
      step,
      bandwidth,
      round = false,
      paddingInner = 0,
      paddingOuter = 0,
      align = 0.5;

  delete scale.unknown;

  function rescale() {
    var n = domain().length,
        reverse = range$1[1] < range$1[0],
        start = range$1[reverse - 0],
        stop = range$1[1 - reverse];
    step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
    if (round) step = Math.floor(step);
    start += (stop - start - step * (n - paddingInner)) * align;
    bandwidth = step * (1 - paddingInner);
    if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
    var values = range(n).map(function(i) { return start + step * i; });
    return ordinalRange(reverse ? values.reverse() : values);
  }

  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };

  scale.range = function(_) {
    return arguments.length ? (range$1 = [+_[0], +_[1]], rescale()) : range$1.slice();
  };

  scale.rangeRound = function(_) {
    return range$1 = [+_[0], +_[1]], round = true, rescale();
  };

  scale.bandwidth = function() {
    return bandwidth;
  };

  scale.step = function() {
    return step;
  };

  scale.round = function(_) {
    return arguments.length ? (round = !!_, rescale()) : round;
  };

  scale.padding = function(_) {
    return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
  };

  scale.paddingInner = function(_) {
    return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
  };

  scale.paddingOuter = function(_) {
    return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
  };

  scale.align = function(_) {
    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
  };

  scale.copy = function() {
    return band(domain(), range$1)
        .round(round)
        .paddingInner(paddingInner)
        .paddingOuter(paddingOuter)
        .align(align);
  };

  return initRange.apply(rescale(), arguments);
}

function define$1(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}

function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

function Color() {}

var darker = 0.7;
var brighter = 1 / darker;

var reI = "\\s*([+-]?\\d+)\\s*",
    reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
    reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
    reHex = /^#([0-9a-f]{3,8})$/,
    reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
    reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
    reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
    reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
    reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
    reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

var named = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

define$1(Color, color, {
  copy: function(channels) {
    return Object.assign(new this.constructor, this, channels);
  },
  displayable: function() {
    return this.rgb().displayable();
  },
  hex: color_formatHex, // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});

function color_formatHex() {
  return this.rgb().formatHex();
}

function color_formatHsl() {
  return hslConvert(this).formatHsl();
}

function color_formatRgb() {
  return this.rgb().formatRgb();
}

function color(format) {
  var m, l;
  format = (format + "").trim().toLowerCase();
  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
      : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
      : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
      : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
      : null) // invalid hex
      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
      : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
      : null;
}

function rgbn(n) {
  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
}

function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}

function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb;
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}

function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}

function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}

define$1(Rgb, rgb, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb: function() {
    return this;
  },
  displayable: function() {
    return (-0.5 <= this.r && this.r < 255.5)
        && (-0.5 <= this.g && this.g < 255.5)
        && (-0.5 <= this.b && this.b < 255.5)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex, // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));

function rgb_formatHex() {
  return "#" + hex(this.r) + hex(this.g) + hex(this.b);
}

function rgb_formatRgb() {
  var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
  return (a === 1 ? "rgb(" : "rgba(")
      + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
      + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
      + Math.max(0, Math.min(255, Math.round(this.b) || 0))
      + (a === 1 ? ")" : ", " + a + ")");
}

function hex(value) {
  value = Math.max(0, Math.min(255, Math.round(value) || 0));
  return (value < 16 ? "0" : "") + value.toString(16);
}

function hsla(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}

function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl;
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;
    else if (g === max) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}

function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}

function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define$1(Hsl, hsl, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = this.h % 360 + (this.h < 0) * 360,
        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
        l = this.l,
        m2 = l + (l < 0.5 ? l : 1 - l) * s,
        m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  displayable: function() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
        && (0 <= this.l && this.l <= 1)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl: function() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "hsl(" : "hsla(")
        + (this.h || 0) + ", "
        + (this.s || 0) * 100 + "%, "
        + (this.l || 0) * 100 + "%"
        + (a === 1 ? ")" : ", " + a + ")");
  }
}));

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60
      : h < 180 ? m2
      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
      : m1) * 255;
}

function basis(t1, v0, v1, v2, v3) {
  var t2 = t1 * t1, t3 = t2 * t1;
  return ((1 - 3 * t1 + 3 * t2 - t3) * v0
      + (4 - 6 * t2 + 3 * t3) * v1
      + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
      + t3 * v3) / 6;
}

function basis$1(values) {
  var n = values.length - 1;
  return function(t) {
    var i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n),
        v1 = values[i],
        v2 = values[i + 1],
        v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
        v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

function constant$3(x) {
  return function() {
    return x;
  };
}

function linear$1(a, d) {
  return function(t) {
    return a + t * d;
  };
}

function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}

function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant$3(isNaN(a) ? b : a);
  };
}

function nogamma(a, b) {
  var d = b - a;
  return d ? linear$1(a, d) : constant$3(isNaN(a) ? b : a);
}

var interpolateRgb = (function rgbGamma(y) {
  var color = gamma(y);

  function rgb$1(start, end) {
    var r = color((start = rgb(start)).r, (end = rgb(end)).r),
        g = color(start.g, end.g),
        b = color(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  rgb$1.gamma = rgbGamma;

  return rgb$1;
})(1);

function rgbSpline(spline) {
  return function(colors) {
    var n = colors.length,
        r = new Array(n),
        g = new Array(n),
        b = new Array(n),
        i, color;
    for (i = 0; i < n; ++i) {
      color = rgb(colors[i]);
      r[i] = color.r || 0;
      g[i] = color.g || 0;
      b[i] = color.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color.opacity = 1;
    return function(t) {
      color.r = r(t);
      color.g = g(t);
      color.b = b(t);
      return color + "";
    };
  };
}

var rgbBasis = rgbSpline(basis$1);

function numberArray(a, b) {
  if (!b) b = [];
  var n = a ? Math.min(b.length, a.length) : 0,
      c = b.slice(),
      i;
  return function(t) {
    for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
    return c;
  };
}

function isNumberArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

function genericArray(a, b) {
  var nb = b ? b.length : 0,
      na = a ? Math.min(nb, a.length) : 0,
      x = new Array(na),
      c = new Array(nb),
      i;

  for (i = 0; i < na; ++i) x[i] = interpolate$1(a[i], b[i]);
  for (; i < nb; ++i) c[i] = b[i];

  return function(t) {
    for (i = 0; i < na; ++i) c[i] = x[i](t);
    return c;
  };
}

function date(a, b) {
  var d = new Date;
  return a = +a, b = +b, function(t) {
    return d.setTime(a * (1 - t) + b * t), d;
  };
}

function interpolateNumber(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}

function object(a, b) {
  var i = {},
      c = {},
      k;

  if (a === null || typeof a !== "object") a = {};
  if (b === null || typeof b !== "object") b = {};

  for (k in b) {
    if (k in a) {
      i[k] = interpolate$1(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }

  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
}

var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
    reB = new RegExp(reA.source, "g");

function zero(b) {
  return function() {
    return b;
  };
}

function one(b) {
  return function(t) {
    return b(t) + "";
  };
}

function interpolateString(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
      am, // current match in a
      bm, // current match in b
      bs, // string preceding current number in b, if any
      i = -1, // index in s
      s = [], // string constants and placeholders
      q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a))
      && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) { // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
      if (s[i]) s[i] += bm; // coalesce with previous string
      else s[++i] = bm;
    } else { // interpolate non-matching numbers
      s[++i] = null;
      q.push({i: i, x: interpolateNumber(am, bm)});
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs; // coalesce with previous string
    else s[++i] = bs;
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? (q[0]
      ? one(q[0].x)
      : zero(b))
      : (b = q.length, function(t) {
          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        });
}

function interpolate$1(a, b) {
  var t = typeof b, c;
  return b == null || t === "boolean" ? constant$3(b)
      : (t === "number" ? interpolateNumber
      : t === "string" ? ((c = color(b)) ? (b = c, interpolateRgb) : interpolateString)
      : b instanceof color ? interpolateRgb
      : b instanceof Date ? date
      : isNumberArray(b) ? numberArray
      : Array.isArray(b) ? genericArray
      : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
      : interpolateNumber)(a, b);
}

function interpolateRound(a, b) {
  return a = +a, b = +b, function(t) {
    return Math.round(a * (1 - t) + b * t);
  };
}

var degrees = 180 / Math.PI;

var identity$4 = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};

function decompose(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX: scaleX,
    scaleY: scaleY
  };
}

var cssNode,
    cssRoot,
    cssView,
    svgNode;

function parseCss(value) {
  if (value === "none") return identity$4;
  if (!cssNode) cssNode = document.createElement("DIV"), cssRoot = document.documentElement, cssView = document.defaultView;
  cssNode.style.transform = value;
  value = cssView.getComputedStyle(cssRoot.appendChild(cssNode), null).getPropertyValue("transform");
  cssRoot.removeChild(cssNode);
  value = value.slice(7, -1).split(",");
  return decompose(+value[0], +value[1], +value[2], +value[3], +value[4], +value[5]);
}

function parseSvg(value) {
  if (value == null) return identity$4;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity$4;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}

function interpolateTransform(parse, pxComma, pxParen, degParen) {

  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }

  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }

  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
      q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }

  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }

  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }

  return function(a, b) {
    var s = [], // string constants and placeholders
        q = []; // number interpolators
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null; // gc
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}

var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

function constant$2(x) {
  return function() {
    return x;
  };
}

function number$1(x) {
  return +x;
}

var unit = [0, 1];

function identity$3(x) {
  return x;
}

function normalize(a, b) {
  return (b -= (a = +a))
      ? function(x) { return (x - a) / b; }
      : constant$2(isNaN(b) ? NaN : 0.5);
}

function clamper(domain) {
  var a = domain[0], b = domain[domain.length - 1], t;
  if (a > b) t = a, a = b, b = t;
  return function(x) { return Math.max(a, Math.min(b, x)); };
}

// normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
// interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
function bimap(domain, range, interpolate) {
  var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
  if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
  else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
  return function(x) { return r0(d0(x)); };
}

function polymap(domain, range, interpolate) {
  var j = Math.min(domain.length, range.length) - 1,
      d = new Array(j),
      r = new Array(j),
      i = -1;

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }

  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate(range[i], range[i + 1]);
  }

  return function(x) {
    var i = bisectRight(domain, x, 1, j) - 1;
    return r[i](d[i](x));
  };
}

function copy$1(source, target) {
  return target
      .domain(source.domain())
      .range(source.range())
      .interpolate(source.interpolate())
      .clamp(source.clamp())
      .unknown(source.unknown());
}

function transformer$1() {
  var domain = unit,
      range = unit,
      interpolate = interpolate$1,
      transform,
      untransform,
      unknown,
      clamp = identity$3,
      piecewise,
      output,
      input;

  function rescale() {
    piecewise = Math.min(domain.length, range.length) > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }

  function scale(x) {
    return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
  }

  scale.invert = function(y) {
    return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
  };

  scale.domain = function(_) {
    return arguments.length ? (domain = map$1.call(_, number$1), clamp === identity$3 || (clamp = clamper(domain)), rescale()) : domain.slice();
  };

  scale.range = function(_) {
    return arguments.length ? (range = slice$1.call(_), rescale()) : range.slice();
  };

  scale.rangeRound = function(_) {
    return range = slice$1.call(_), interpolate = interpolateRound, rescale();
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = _ ? clamper(domain) : identity$3, scale) : clamp !== identity$3;
  };

  scale.interpolate = function(_) {
    return arguments.length ? (interpolate = _, rescale()) : interpolate;
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  return function(t, u) {
    transform = t, untransform = u;
    return rescale();
  };
}

function continuous(transform, untransform) {
  return transformer$1()(transform, untransform);
}

function formatDecimal(x) {
  return Math.abs(x = Math.round(x)) >= 1e21
      ? x.toLocaleString("en").replace(/,/g, "")
      : x.toString(10);
}

// Computes the decimal coefficient and exponent of the specified number x with
// significant digits p, where x is positive and p is in [1, 21] or undefined.
// For example, formatDecimalParts(1.23) returns ["123", 0].
function formatDecimalParts(x, p) {
  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
  var i, coefficient = x.slice(0, i);

  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x.slice(i + 1)
  ];
}

function exponent(x) {
  return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
}

function formatGroup(grouping, thousands) {
  return function(value, width) {
    var i = value.length,
        t = [],
        j = 0,
        g = grouping[0],
        length = 0;

    while (i > 0 && g > 0) {
      if (length + g + 1 > width) g = Math.max(1, width - length);
      t.push(value.substring(i -= g, i + g));
      if ((length += g + 1) > width) break;
      g = grouping[j = (j + 1) % grouping.length];
    }

    return t.reverse().join(thousands);
  };
}

function formatNumerals(numerals) {
  return function(value) {
    return value.replace(/[0-9]/g, function(i) {
      return numerals[+i];
    });
  };
}

// [[fill]align][sign][symbol][0][width][,][.precision][~][type]
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

function formatSpecifier(specifier) {
  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
  var match;
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}

formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

function FormatSpecifier(specifier) {
  this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
  this.align = specifier.align === undefined ? ">" : specifier.align + "";
  this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === undefined ? undefined : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === undefined ? "" : specifier.type + "";
}

FormatSpecifier.prototype.toString = function() {
  return this.fill
      + this.align
      + this.sign
      + this.symbol
      + (this.zero ? "0" : "")
      + (this.width === undefined ? "" : Math.max(1, this.width | 0))
      + (this.comma ? "," : "")
      + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
      + (this.trim ? "~" : "")
      + this.type;
};

// Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
function formatTrim(s) {
  out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
    switch (s[i]) {
      case ".": i0 = i1 = i; break;
      case "0": if (i0 === 0) i0 = i; i1 = i; break;
      default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
    }
  }
  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}

var prefixExponent;

function formatPrefixAuto(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1],
      i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
      n = coefficient.length;
  return i === n ? coefficient
      : i > n ? coefficient + new Array(i - n + 1).join("0")
      : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
      : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
}

function formatRounded(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1];
  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
      : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
      : coefficient + new Array(exponent - coefficient.length + 2).join("0");
}

var formatTypes = {
  "%": function(x, p) { return (x * 100).toFixed(p); },
  "b": function(x) { return Math.round(x).toString(2); },
  "c": function(x) { return x + ""; },
  "d": formatDecimal,
  "e": function(x, p) { return x.toExponential(p); },
  "f": function(x, p) { return x.toFixed(p); },
  "g": function(x, p) { return x.toPrecision(p); },
  "o": function(x) { return Math.round(x).toString(8); },
  "p": function(x, p) { return formatRounded(x * 100, p); },
  "r": formatRounded,
  "s": formatPrefixAuto,
  "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
  "x": function(x) { return Math.round(x).toString(16); }
};

function identity$2(x) {
  return x;
}

var map = Array.prototype.map,
    prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

function formatLocale(locale) {
  var group = locale.grouping === undefined || locale.thousands === undefined ? identity$2 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
      currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
      currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
      decimal = locale.decimal === undefined ? "." : locale.decimal + "",
      numerals = locale.numerals === undefined ? identity$2 : formatNumerals(map.call(locale.numerals, String)),
      percent = locale.percent === undefined ? "%" : locale.percent + "",
      minus = locale.minus === undefined ? "-" : locale.minus + "",
      nan = locale.nan === undefined ? "NaN" : locale.nan + "";

  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);

    var fill = specifier.fill,
        align = specifier.align,
        sign = specifier.sign,
        symbol = specifier.symbol,
        zero = specifier.zero,
        width = specifier.width,
        comma = specifier.comma,
        precision = specifier.precision,
        trim = specifier.trim,
        type = specifier.type;

    // The "n" type is an alias for ",g".
    if (type === "n") comma = true, type = "g";

    // The "" type, and any invalid type, is an alias for ".12~g".
    else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

    // If zero fill is specified, padding goes after sign and before digits.
    if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

    // Compute the prefix and suffix.
    // For SI-prefix, the suffix is lazily computed.
    var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
        suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

    // What format function should we use?
    // Is this an integer type?
    // Can this type generate exponential notation?
    var formatType = formatTypes[type],
        maybeSuffix = /[defgprs%]/.test(type);

    // Set the default precision if not specified,
    // or clamp the specified precision to the supported range.
    // For significant precision, it must be in [1, 21].
    // For fixed precision, it must be in [0, 20].
    precision = precision === undefined ? 6
        : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
        : Math.max(0, Math.min(20, precision));

    function format(value) {
      var valuePrefix = prefix,
          valueSuffix = suffix,
          i, n, c;

      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;

        // Determine the sign. -0 is not less than 0, but 1 / -0 is!
        var valueNegative = value < 0 || 1 / value < 0;

        // Perform the initial formatting.
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

        // Trim insignificant zeros.
        if (trim) value = formatTrim(value);

        // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
        if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

        // Compute the prefix and suffix.
        valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
        valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

        // Break the formatted value into the integer “value” part that can be
        // grouped, and fractional or exponential “suffix” part that is not.
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c = value.charCodeAt(i), 48 > c || c > 57) {
              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }

      // If the fill character is not "0", grouping is applied before padding.
      if (comma && !zero) value = group(value, Infinity);

      // Compute the padding.
      var length = valuePrefix.length + value.length + valueSuffix.length,
          padding = length < width ? new Array(width - length + 1).join(fill) : "";

      // If the fill character is "0", grouping is applied after padding.
      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

      // Reconstruct the final output based on the desired alignment.
      switch (align) {
        case "<": value = valuePrefix + value + valueSuffix + padding; break;
        case "=": value = valuePrefix + padding + value + valueSuffix; break;
        case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
        default: value = padding + valuePrefix + value + valueSuffix; break;
      }

      return numerals(value);
    }

    format.toString = function() {
      return specifier + "";
    };

    return format;
  }

  function formatPrefix(specifier, value) {
    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
        e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
        k = Math.pow(10, -e),
        prefix = prefixes[8 + e / 3];
    return function(value) {
      return f(k * value) + prefix;
    };
  }

  return {
    format: newFormat,
    formatPrefix: formatPrefix
  };
}

var locale;
var format;
var formatPrefix;

defaultLocale({
  decimal: ".",
  thousands: ",",
  grouping: [3],
  currency: ["$", ""],
  minus: "-"
});

function defaultLocale(definition) {
  locale = formatLocale(definition);
  format = locale.format;
  formatPrefix = locale.formatPrefix;
  return locale;
}

function precisionFixed(step) {
  return Math.max(0, -exponent(Math.abs(step)));
}

function precisionPrefix(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
}

function precisionRound(step, max) {
  step = Math.abs(step), max = Math.abs(max) - step;
  return Math.max(0, exponent(max) - exponent(step)) + 1;
}

function tickFormat(start, stop, count, specifier) {
  var step = tickStep(start, stop, count),
      precision;
  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
      return formatPrefix(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return format(specifier);
}

function linearish(scale) {
  var domain = scale.domain;

  scale.ticks = function(count) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
  };

  scale.tickFormat = function(count, specifier) {
    var d = domain();
    return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
  };

  scale.nice = function(count) {
    if (count == null) count = 10;

    var d = domain(),
        i0 = 0,
        i1 = d.length - 1,
        start = d[i0],
        stop = d[i1],
        step;

    if (stop < start) {
      step = start, start = stop, stop = step;
      step = i0, i0 = i1, i1 = step;
    }

    step = tickIncrement(start, stop, count);

    if (step > 0) {
      start = Math.floor(start / step) * step;
      stop = Math.ceil(stop / step) * step;
      step = tickIncrement(start, stop, count);
    } else if (step < 0) {
      start = Math.ceil(start * step) / step;
      stop = Math.floor(stop * step) / step;
      step = tickIncrement(start, stop, count);
    }

    if (step > 0) {
      d[i0] = Math.floor(start / step) * step;
      d[i1] = Math.ceil(stop / step) * step;
      domain(d);
    } else if (step < 0) {
      d[i0] = Math.ceil(start * step) / step;
      d[i1] = Math.floor(stop * step) / step;
      domain(d);
    }

    return scale;
  };

  return scale;
}

function linear() {
  var scale = continuous(identity$3, identity$3);

  scale.copy = function() {
    return copy$1(scale, linear());
  };

  initRange.apply(scale, arguments);

  return linearish(scale);
}

function transformPow(exponent) {
  return function(x) {
    return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
  };
}

function transformSqrt(x) {
  return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
}

function transformSquare(x) {
  return x < 0 ? -x * x : x * x;
}

function powish(transform) {
  var scale = transform(identity$3, identity$3),
      exponent = 1;

  function rescale() {
    return exponent === 1 ? transform(identity$3, identity$3)
        : exponent === 0.5 ? transform(transformSqrt, transformSquare)
        : transform(transformPow(exponent), transformPow(1 / exponent));
  }

  scale.exponent = function(_) {
    return arguments.length ? (exponent = +_, rescale()) : exponent;
  };

  return linearish(scale);
}

function pow() {
  var scale = powish(transformer$1());

  scale.copy = function() {
    return copy$1(scale, pow()).exponent(scale.exponent());
  };

  initRange.apply(scale, arguments);

  return scale;
}

function sqrt$1() {
  return pow.apply(null, arguments).exponent(0.5);
}

function transformer() {
  var x0 = 0,
      x1 = 1,
      t0,
      t1,
      k10,
      transform,
      interpolator = identity$3,
      clamp = false,
      unknown;

  function scale(x) {
    return isNaN(x = +x) ? unknown : interpolator(k10 === 0 ? 0.5 : (x = (transform(x) - t0) * k10, clamp ? Math.max(0, Math.min(1, x)) : x));
  }

  scale.domain = function(_) {
    return arguments.length ? (t0 = transform(x0 = +_[0]), t1 = transform(x1 = +_[1]), k10 = t0 === t1 ? 0 : 1 / (t1 - t0), scale) : [x0, x1];
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, scale) : clamp;
  };

  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  return function(t) {
    transform = t, t0 = t(x0), t1 = t(x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0);
    return scale;
  };
}

function copy(source, target) {
  return target
      .domain(source.domain())
      .interpolator(source.interpolator())
      .clamp(source.clamp())
      .unknown(source.unknown());
}

function sequential() {
  var scale = linearish(transformer()(identity$3));

  scale.copy = function() {
    return copy(scale, sequential());
  };

  return initInterpolator.apply(scale, arguments);
}

var pi$1 = Math.PI,
    tau$1 = 2 * pi$1,
    epsilon$3 = 1e-6,
    tauEpsilon = tau$1 - epsilon$3;

function Path() {
  this._x0 = this._y0 = // start of current subpath
  this._x1 = this._y1 = null; // end of current subpath
  this._ = "";
}

function path() {
  return new Path;
}

Path.prototype = path.prototype = {
  constructor: Path,
  moveTo: function(x, y) {
    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
  },
  closePath: function() {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._ += "Z";
    }
  },
  lineTo: function(x, y) {
    this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  quadraticCurveTo: function(x1, y1, x, y) {
    this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  bezierCurveTo: function(x1, y1, x2, y2, x, y) {
    this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  arcTo: function(x1, y1, x2, y2, r) {
    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
    var x0 = this._x1,
        y0 = this._y1,
        x21 = x2 - x1,
        y21 = y2 - y1,
        x01 = x0 - x1,
        y01 = y0 - y1,
        l01_2 = x01 * x01 + y01 * y01;

    // Is the radius negative? Error.
    if (r < 0) throw new Error("negative radius: " + r);

    // Is this path empty? Move to (x1,y1).
    if (this._x1 === null) {
      this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
    }

    // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
    else if (!(l01_2 > epsilon$3));

    // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
    // Equivalently, is (x1,y1) coincident with (x2,y2)?
    // Or, is the radius zero? Line to (x1,y1).
    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon$3) || !r) {
      this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
    }

    // Otherwise, draw an arc!
    else {
      var x20 = x2 - x0,
          y20 = y2 - y0,
          l21_2 = x21 * x21 + y21 * y21,
          l20_2 = x20 * x20 + y20 * y20,
          l21 = Math.sqrt(l21_2),
          l01 = Math.sqrt(l01_2),
          l = r * Math.tan((pi$1 - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
          t01 = l / l01,
          t21 = l / l21;

      // If the start tangent is not coincident with (x0,y0), line to.
      if (Math.abs(t01 - 1) > epsilon$3) {
        this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
      }

      this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
    }
  },
  arc: function(x, y, r, a0, a1, ccw) {
    x = +x, y = +y, r = +r, ccw = !!ccw;
    var dx = r * Math.cos(a0),
        dy = r * Math.sin(a0),
        x0 = x + dx,
        y0 = y + dy,
        cw = 1 ^ ccw,
        da = ccw ? a0 - a1 : a1 - a0;

    // Is the radius negative? Error.
    if (r < 0) throw new Error("negative radius: " + r);

    // Is this path empty? Move to (x0,y0).
    if (this._x1 === null) {
      this._ += "M" + x0 + "," + y0;
    }

    // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
    else if (Math.abs(this._x1 - x0) > epsilon$3 || Math.abs(this._y1 - y0) > epsilon$3) {
      this._ += "L" + x0 + "," + y0;
    }

    // Is this arc empty? We’re done.
    if (!r) return;

    // Does the angle go the wrong way? Flip the direction.
    if (da < 0) da = da % tau$1 + tau$1;

    // Is this a complete circle? Draw two arcs to complete the circle.
    if (da > tauEpsilon) {
      this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
    }

    // Is this arc non-empty? Draw an arc!
    else if (da > epsilon$3) {
      this._ += "A" + r + "," + r + ",0," + (+(da >= pi$1)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
    }
  },
  rect: function(x, y, w, h) {
    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
  },
  toString: function() {
    return this._;
  }
};

function constant$1(x) {
  return function constant() {
    return x;
  };
}

var abs = Math.abs;
var atan2 = Math.atan2;
var cos = Math.cos;
var max = Math.max;
var min = Math.min;
var sin = Math.sin;
var sqrt = Math.sqrt;

var epsilon$2 = 1e-12;
var pi = Math.PI;
var halfPi = pi / 2;
var tau = 2 * pi;

function acos(x) {
  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
}

function asin(x) {
  return x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x);
}

function arcInnerRadius(d) {
  return d.innerRadius;
}

function arcOuterRadius(d) {
  return d.outerRadius;
}

function arcStartAngle(d) {
  return d.startAngle;
}

function arcEndAngle(d) {
  return d.endAngle;
}

function arcPadAngle(d) {
  return d && d.padAngle; // Note: optional!
}

function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
  var x10 = x1 - x0, y10 = y1 - y0,
      x32 = x3 - x2, y32 = y3 - y2,
      t = y32 * x10 - x32 * y10;
  if (t * t < epsilon$2) return;
  t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;
  return [x0 + t * x10, y0 + t * y10];
}

// Compute perpendicular offset line of length rc.
// http://mathworld.wolfram.com/Circle-LineIntersection.html
function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
  var x01 = x0 - x1,
      y01 = y0 - y1,
      lo = (cw ? rc : -rc) / sqrt(x01 * x01 + y01 * y01),
      ox = lo * y01,
      oy = -lo * x01,
      x11 = x0 + ox,
      y11 = y0 + oy,
      x10 = x1 + ox,
      y10 = y1 + oy,
      x00 = (x11 + x10) / 2,
      y00 = (y11 + y10) / 2,
      dx = x10 - x11,
      dy = y10 - y11,
      d2 = dx * dx + dy * dy,
      r = r1 - rc,
      D = x11 * y10 - x10 * y11,
      d = (dy < 0 ? -1 : 1) * sqrt(max(0, r * r * d2 - D * D)),
      cx0 = (D * dy - dx * d) / d2,
      cy0 = (-D * dx - dy * d) / d2,
      cx1 = (D * dy + dx * d) / d2,
      cy1 = (-D * dx + dy * d) / d2,
      dx0 = cx0 - x00,
      dy0 = cy0 - y00,
      dx1 = cx1 - x00,
      dy1 = cy1 - y00;

  // Pick the closer of the two intersection points.
  // TODO Is there a faster way to determine which intersection to use?
  if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;

  return {
    cx: cx0,
    cy: cy0,
    x01: -ox,
    y01: -oy,
    x11: cx0 * (r1 / r - 1),
    y11: cy0 * (r1 / r - 1)
  };
}

function arc() {
  var innerRadius = arcInnerRadius,
      outerRadius = arcOuterRadius,
      cornerRadius = constant$1(0),
      padRadius = null,
      startAngle = arcStartAngle,
      endAngle = arcEndAngle,
      padAngle = arcPadAngle,
      context = null;

  function arc() {
    var buffer,
        r,
        r0 = +innerRadius.apply(this, arguments),
        r1 = +outerRadius.apply(this, arguments),
        a0 = startAngle.apply(this, arguments) - halfPi,
        a1 = endAngle.apply(this, arguments) - halfPi,
        da = abs(a1 - a0),
        cw = a1 > a0;

    if (!context) context = buffer = path();

    // Ensure that the outer radius is always larger than the inner radius.
    if (r1 < r0) r = r1, r1 = r0, r0 = r;

    // Is it a point?
    if (!(r1 > epsilon$2)) context.moveTo(0, 0);

    // Or is it a circle or annulus?
    else if (da > tau - epsilon$2) {
      context.moveTo(r1 * cos(a0), r1 * sin(a0));
      context.arc(0, 0, r1, a0, a1, !cw);
      if (r0 > epsilon$2) {
        context.moveTo(r0 * cos(a1), r0 * sin(a1));
        context.arc(0, 0, r0, a1, a0, cw);
      }
    }

    // Or is it a circular or annular sector?
    else {
      var a01 = a0,
          a11 = a1,
          a00 = a0,
          a10 = a1,
          da0 = da,
          da1 = da,
          ap = padAngle.apply(this, arguments) / 2,
          rp = (ap > epsilon$2) && (padRadius ? +padRadius.apply(this, arguments) : sqrt(r0 * r0 + r1 * r1)),
          rc = min(abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments)),
          rc0 = rc,
          rc1 = rc,
          t0,
          t1;

      // Apply padding? Note that since r1 ≥ r0, da1 ≥ da0.
      if (rp > epsilon$2) {
        var p0 = asin(rp / r0 * sin(ap)),
            p1 = asin(rp / r1 * sin(ap));
        if ((da0 -= p0 * 2) > epsilon$2) p0 *= (cw ? 1 : -1), a00 += p0, a10 -= p0;
        else da0 = 0, a00 = a10 = (a0 + a1) / 2;
        if ((da1 -= p1 * 2) > epsilon$2) p1 *= (cw ? 1 : -1), a01 += p1, a11 -= p1;
        else da1 = 0, a01 = a11 = (a0 + a1) / 2;
      }

      var x01 = r1 * cos(a01),
          y01 = r1 * sin(a01),
          x10 = r0 * cos(a10),
          y10 = r0 * sin(a10);

      // Apply rounded corners?
      if (rc > epsilon$2) {
        var x11 = r1 * cos(a11),
            y11 = r1 * sin(a11),
            x00 = r0 * cos(a00),
            y00 = r0 * sin(a00),
            oc;

        // Restrict the corner radius according to the sector angle.
        if (da < pi && (oc = intersect(x01, y01, x00, y00, x11, y11, x10, y10))) {
          var ax = x01 - oc[0],
              ay = y01 - oc[1],
              bx = x11 - oc[0],
              by = y11 - oc[1],
              kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by))) / 2),
              lc = sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
          rc0 = min(rc, (r0 - lc) / (kc - 1));
          rc1 = min(rc, (r1 - lc) / (kc + 1));
        }
      }

      // Is the sector collapsed to a line?
      if (!(da1 > epsilon$2)) context.moveTo(x01, y01);

      // Does the sector’s outer ring have rounded corners?
      else if (rc1 > epsilon$2) {
        t0 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw);
        t1 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw);

        context.moveTo(t0.cx + t0.x01, t0.cy + t0.y01);

        // Have the corners merged?
        if (rc1 < rc) context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

        // Otherwise, draw the two corners and the ring.
        else {
          context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
          context.arc(0, 0, r1, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
          context.arc(t1.cx, t1.cy, rc1, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
        }
      }

      // Or is the outer ring just a circular arc?
      else context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw);

      // Is there no inner ring, and it’s a circular sector?
      // Or perhaps it’s an annular sector collapsed due to padding?
      if (!(r0 > epsilon$2) || !(da0 > epsilon$2)) context.lineTo(x10, y10);

      // Does the sector’s inner ring (or point) have rounded corners?
      else if (rc0 > epsilon$2) {
        t0 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw);
        t1 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw);

        context.lineTo(t0.cx + t0.x01, t0.cy + t0.y01);

        // Have the corners merged?
        if (rc0 < rc) context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

        // Otherwise, draw the two corners and the ring.
        else {
          context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
          context.arc(0, 0, r0, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), cw);
          context.arc(t1.cx, t1.cy, rc0, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
        }
      }

      // Or is the inner ring just a circular arc?
      else context.arc(0, 0, r0, a10, a00, cw);
    }

    context.closePath();

    if (buffer) return context = null, buffer + "" || null;
  }

  arc.centroid = function() {
    var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2,
        a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi / 2;
    return [cos(a) * r, sin(a) * r];
  };

  arc.innerRadius = function(_) {
    return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant$1(+_), arc) : innerRadius;
  };

  arc.outerRadius = function(_) {
    return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant$1(+_), arc) : outerRadius;
  };

  arc.cornerRadius = function(_) {
    return arguments.length ? (cornerRadius = typeof _ === "function" ? _ : constant$1(+_), arc) : cornerRadius;
  };

  arc.padRadius = function(_) {
    return arguments.length ? (padRadius = _ == null ? null : typeof _ === "function" ? _ : constant$1(+_), arc) : padRadius;
  };

  arc.startAngle = function(_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$1(+_), arc) : startAngle;
  };

  arc.endAngle = function(_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$1(+_), arc) : endAngle;
  };

  arc.padAngle = function(_) {
    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant$1(+_), arc) : padAngle;
  };

  arc.context = function(_) {
    return arguments.length ? ((context = _ == null ? null : _), arc) : context;
  };

  return arc;
}

function Linear(context) {
  this._context = context;
}

Linear.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; // proceed
      default: this._context.lineTo(x, y); break;
    }
  }
};

function curveLinear(context) {
  return new Linear(context);
}

function x(p) {
  return p[0];
}

function y(p) {
  return p[1];
}

function line() {
  var x$1 = x,
      y$1 = y,
      defined = constant$1(true),
      context = null,
      curve = curveLinear,
      output = null;

  function line(data) {
    var i,
        n = data.length,
        d,
        defined0 = false,
        buffer;

    if (context == null) output = curve(buffer = path());

    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) output.lineStart();
        else output.lineEnd();
      }
      if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
    }

    if (buffer) return output = null, buffer + "" || null;
  }

  line.x = function(_) {
    return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant$1(+_), line) : x$1;
  };

  line.y = function(_) {
    return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant$1(+_), line) : y$1;
  };

  line.defined = function(_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : constant$1(!!_), line) : defined;
  };

  line.curve = function(_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
  };

  line.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
  };

  return line;
}

function area() {
  var x0 = x,
      x1 = null,
      y0 = constant$1(0),
      y1 = y,
      defined = constant$1(true),
      context = null,
      curve = curveLinear,
      output = null;

  function area(data) {
    var i,
        j,
        k,
        n = data.length,
        d,
        defined0 = false,
        buffer,
        x0z = new Array(n),
        y0z = new Array(n);

    if (context == null) output = curve(buffer = path());

    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) {
          j = i;
          output.areaStart();
          output.lineStart();
        } else {
          output.lineEnd();
          output.lineStart();
          for (k = i - 1; k >= j; --k) {
            output.point(x0z[k], y0z[k]);
          }
          output.lineEnd();
          output.areaEnd();
        }
      }
      if (defined0) {
        x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
        output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
      }
    }

    if (buffer) return output = null, buffer + "" || null;
  }

  function arealine() {
    return line().defined(defined).curve(curve).context(context);
  }

  area.x = function(_) {
    return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$1(+_), x1 = null, area) : x0;
  };

  area.x0 = function(_) {
    return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$1(+_), area) : x0;
  };

  area.x1 = function(_) {
    return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : constant$1(+_), area) : x1;
  };

  area.y = function(_) {
    return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$1(+_), y1 = null, area) : y0;
  };

  area.y0 = function(_) {
    return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$1(+_), area) : y0;
  };

  area.y1 = function(_) {
    return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : constant$1(+_), area) : y1;
  };

  area.lineX0 =
  area.lineY0 = function() {
    return arealine().x(x0).y(y0);
  };

  area.lineY1 = function() {
    return arealine().x(x0).y(y1);
  };

  area.lineX1 = function() {
    return arealine().x(x1).y(y0);
  };

  area.defined = function(_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : constant$1(!!_), area) : defined;
  };

  area.curve = function(_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
  };

  area.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
  };

  return area;
}

function descending(a, b) {
  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}

function identity$1(d) {
  return d;
}

function pie() {
  var value = identity$1,
      sortValues = descending,
      sort = null,
      startAngle = constant$1(0),
      endAngle = constant$1(tau),
      padAngle = constant$1(0);

  function pie(data) {
    var i,
        n = data.length,
        j,
        k,
        sum = 0,
        index = new Array(n),
        arcs = new Array(n),
        a0 = +startAngle.apply(this, arguments),
        da = Math.min(tau, Math.max(-tau, endAngle.apply(this, arguments) - a0)),
        a1,
        p = Math.min(Math.abs(da) / n, padAngle.apply(this, arguments)),
        pa = p * (da < 0 ? -1 : 1),
        v;

    for (i = 0; i < n; ++i) {
      if ((v = arcs[index[i] = i] = +value(data[i], i, data)) > 0) {
        sum += v;
      }
    }

    // Optionally sort the arcs by previously-computed values or by data.
    if (sortValues != null) index.sort(function(i, j) { return sortValues(arcs[i], arcs[j]); });
    else if (sort != null) index.sort(function(i, j) { return sort(data[i], data[j]); });

    // Compute the arcs! They are stored in the original data's order.
    for (i = 0, k = sum ? (da - n * pa) / sum : 0; i < n; ++i, a0 = a1) {
      j = index[i], v = arcs[j], a1 = a0 + (v > 0 ? v * k : 0) + pa, arcs[j] = {
        data: data[j],
        index: i,
        value: v,
        startAngle: a0,
        endAngle: a1,
        padAngle: p
      };
    }

    return arcs;
  }

  pie.value = function(_) {
    return arguments.length ? (value = typeof _ === "function" ? _ : constant$1(+_), pie) : value;
  };

  pie.sortValues = function(_) {
    return arguments.length ? (sortValues = _, sort = null, pie) : sortValues;
  };

  pie.sort = function(_) {
    return arguments.length ? (sort = _, sortValues = null, pie) : sort;
  };

  pie.startAngle = function(_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$1(+_), pie) : startAngle;
  };

  pie.endAngle = function(_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$1(+_), pie) : endAngle;
  };

  pie.padAngle = function(_) {
    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant$1(+_), pie) : padAngle;
  };

  return pie;
}

var circle = {
  draw: function(context, size) {
    var r = Math.sqrt(size / pi);
    context.moveTo(r, 0);
    context.arc(0, 0, r, 0, tau);
  }
};

var tan30 = Math.sqrt(1 / 3),
    tan30_2 = tan30 * 2;

var symbolDiamond = {
  draw: function(context, size) {
    var y = Math.sqrt(size / tan30_2),
        x = y * tan30;
    context.moveTo(0, -y);
    context.lineTo(x, 0);
    context.lineTo(0, y);
    context.lineTo(-x, 0);
    context.closePath();
  }
};

function symbol() {
  var type = constant$1(circle),
      size = constant$1(64),
      context = null;

  function symbol() {
    var buffer;
    if (!context) context = buffer = path();
    type.apply(this, arguments).draw(context, +size.apply(this, arguments));
    if (buffer) return context = null, buffer + "" || null;
  }

  symbol.type = function(_) {
    return arguments.length ? (type = typeof _ === "function" ? _ : constant$1(_), symbol) : type;
  };

  symbol.size = function(_) {
    return arguments.length ? (size = typeof _ === "function" ? _ : constant$1(+_), symbol) : size;
  };

  symbol.context = function(_) {
    return arguments.length ? (context = _ == null ? null : _, symbol) : context;
  };

  return symbol;
}

function point(that, x, y) {
  that._context.bezierCurveTo(
    that._x1 + that._k * (that._x2 - that._x0),
    that._y1 + that._k * (that._y2 - that._y0),
    that._x2 + that._k * (that._x1 - x),
    that._y2 + that._k * (that._y1 - y),
    that._x2,
    that._y2
  );
}

function Cardinal(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}

Cardinal.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 =
    this._y0 = this._y1 = this._y2 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2: this._context.lineTo(this._x2, this._y2); break;
      case 3: point(this, this._x1, this._y1); break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; this._x1 = x, this._y1 = y; break;
      case 2: this._point = 3; // proceed
      default: point(this, x, y); break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
  }
};

var curveCardinal = (function custom(tension) {

  function cardinal(context) {
    return new Cardinal(context, tension);
  }

  cardinal.tension = function(tension) {
    return custom(+tension);
  };

  return cardinal;
})(0);

var slice = Array.prototype.slice;

function identity(x) {
  return x;
}

var top$1 = 1,
    right = 2,
    bottom = 3,
    left = 4,
    epsilon$1 = 1e-6;

function translateX(x) {
  return "translate(" + (x + 0.5) + ",0)";
}

function translateY(y) {
  return "translate(0," + (y + 0.5) + ")";
}

function number(scale) {
  return function(d) {
    return +scale(d);
  };
}

function center(scale) {
  var offset = Math.max(0, scale.bandwidth() - 1) / 2; // Adjust for 0.5px offset.
  if (scale.round()) offset = Math.round(offset);
  return function(d) {
    return +scale(d) + offset;
  };
}

function entering() {
  return !this.__axis;
}

function axis(orient, scale) {
  var tickArguments = [],
      tickValues = null,
      tickFormat = null,
      tickSizeInner = 6,
      tickSizeOuter = 6,
      tickPadding = 3,
      k = orient === top$1 || orient === left ? -1 : 1,
      x = orient === left || orient === right ? "x" : "y",
      transform = orient === top$1 || orient === bottom ? translateX : translateY;

  function axis(context) {
    var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
        format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity) : tickFormat,
        spacing = Math.max(tickSizeInner, 0) + tickPadding,
        range = scale.range(),
        range0 = +range[0] + 0.5,
        range1 = +range[range.length - 1] + 0.5,
        position = (scale.bandwidth ? center : number)(scale.copy()),
        selection = context.selection ? context.selection() : context,
        path = selection.selectAll(".domain").data([null]),
        tick = selection.selectAll(".tick").data(values, scale).order(),
        tickExit = tick.exit(),
        tickEnter = tick.enter().append("g").attr("class", "tick"),
        line = tick.select("line"),
        text = tick.select("text");

    path = path.merge(path.enter().insert("path", ".tick")
        .attr("class", "domain")
        .attr("stroke", "currentColor"));

    tick = tick.merge(tickEnter);

    line = line.merge(tickEnter.append("line")
        .attr("stroke", "currentColor")
        .attr(x + "2", k * tickSizeInner));

    text = text.merge(tickEnter.append("text")
        .attr("fill", "currentColor")
        .attr(x, k * spacing)
        .attr("dy", orient === top$1 ? "0em" : orient === bottom ? "0.71em" : "0.32em"));

    if (context !== selection) {
      path = path.transition(context);
      tick = tick.transition(context);
      line = line.transition(context);
      text = text.transition(context);

      tickExit = tickExit.transition(context)
          .attr("opacity", epsilon$1)
          .attr("transform", function(d) { return isFinite(d = position(d)) ? transform(d) : this.getAttribute("transform"); });

      tickEnter
          .attr("opacity", epsilon$1)
          .attr("transform", function(d) { var p = this.parentNode.__axis; return transform(p && isFinite(p = p(d)) ? p : position(d)); });
    }

    tickExit.remove();

    path
        .attr("d", orient === left || orient == right
            ? (tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H0.5V" + range1 + "H" + k * tickSizeOuter : "M0.5," + range0 + "V" + range1)
            : (tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V0.5H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + ",0.5H" + range1));

    tick
        .attr("opacity", 1)
        .attr("transform", function(d) { return transform(position(d)); });

    line
        .attr(x + "2", k * tickSizeInner);

    text
        .attr(x, k * spacing)
        .text(format);

    selection.filter(entering)
        .attr("fill", "none")
        .attr("font-size", 10)
        .attr("font-family", "sans-serif")
        .attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");

    selection
        .each(function() { this.__axis = position; });
  }

  axis.scale = function(_) {
    return arguments.length ? (scale = _, axis) : scale;
  };

  axis.ticks = function() {
    return tickArguments = slice.call(arguments), axis;
  };

  axis.tickArguments = function(_) {
    return arguments.length ? (tickArguments = _ == null ? [] : slice.call(_), axis) : tickArguments.slice();
  };

  axis.tickValues = function(_) {
    return arguments.length ? (tickValues = _ == null ? null : slice.call(_), axis) : tickValues && tickValues.slice();
  };

  axis.tickFormat = function(_) {
    return arguments.length ? (tickFormat = _, axis) : tickFormat;
  };

  axis.tickSize = function(_) {
    return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
  };

  axis.tickSizeInner = function(_) {
    return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
  };

  axis.tickSizeOuter = function(_) {
    return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
  };

  axis.tickPadding = function(_) {
    return arguments.length ? (tickPadding = +_, axis) : tickPadding;
  };

  return axis;
}

function axisTop(scale) {
  return axis(top$1, scale);
}

function axisRight(scale) {
  return axis(right, scale);
}

function axisBottom(scale) {
  return axis(bottom, scale);
}

function axisLeft(scale) {
  return axis(left, scale);
}

var noop = {value: function() {}};

function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}

function Dispatch(_) {
  this._ = _;
}

function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return {type: t, name: name};
  });
}

Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._,
        T = parseTypenames(typename + "", _),
        t,
        i = -1,
        n = T.length;

    // If no callback was specified, return the callback of the given type and name.
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
      return;
    }

    // If a type was specified, set the callback for the given type and name.
    // Otherwise, if a null callback was specified, remove callbacks of the given name.
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
    }

    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};

function get$1(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}

function set$1(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({name: name, value: callback});
  return type;
}

function noevent$1() {
  event.preventDefault();
  event.stopImmediatePropagation();
}

function dragDisable(view) {
  var root = view.document.documentElement,
      selection = select(view).on("dragstart.drag", noevent$1, true);
  if ("onselectstart" in root) {
    selection.on("selectstart.drag", noevent$1, true);
  } else {
    root.__noselect = root.style.MozUserSelect;
    root.style.MozUserSelect = "none";
  }
}

function yesdrag(view, noclick) {
  var root = view.document.documentElement,
      selection = select(view).on("dragstart.drag", null);
  if (noclick) {
    selection.on("click.drag", noevent$1, true);
    setTimeout(function() { selection.on("click.drag", null); }, 0);
  }
  if ("onselectstart" in root) {
    selection.on("selectstart.drag", null);
  } else {
    root.style.MozUserSelect = root.__noselect;
    delete root.__noselect;
  }
}

var frame = 0, // is an animation frame pending?
    timeout$1 = 0, // is a timeout pending?
    interval = 0, // are any timers active?
    pokeDelay = 1000, // how frequently we check for clock skew
    taskHead,
    taskTail,
    clockLast = 0,
    clockNow = 0,
    clockSkew = 0,
    clock = typeof performance === "object" && performance.now ? performance : Date,
    setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}

function clearNow() {
  clockNow = 0;
}

function Timer() {
  this._call =
  this._time =
  this._next = null;
}

Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;
      else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};

function timer(callback, delay, time) {
  var t = new Timer;
  t.restart(callback, delay, time);
  return t;
}

function timerFlush() {
  now(); // Get the current time, if not already set.
  ++frame; // Pretend we’ve set an alarm, if we haven’t already.
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
    t = t._next;
  }
  --frame;
}

function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout$1 = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}

function poke() {
  var now = clock.now(), delay = now - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
}

function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}

function sleep(time) {
  if (frame) return; // Soonest alarm already set, or will be.
  if (timeout$1) timeout$1 = clearTimeout(timeout$1);
  var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
  if (delay > 24) {
    if (time < Infinity) timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}

function timeout(callback, delay, time) {
  var t = new Timer;
  delay = delay == null ? 0 : +delay;
  t.restart(function(elapsed) {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
}

var emptyOn = dispatch("start", "end", "cancel", "interrupt");
var emptyTween = [];

var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;

function schedule(node, name, id, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};
  else if (id in schedules) return;
  create(node, id, {
    name: name,
    index: index, // For context during callback.
    group: group, // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}

function init$2(node, id) {
  var schedule = get(node, id);
  if (schedule.state > CREATED) throw new Error("too late; already scheduled");
  return schedule;
}

function set(node, id) {
  var schedule = get(node, id);
  if (schedule.state > STARTED) throw new Error("too late; already running");
  return schedule;
}

function get(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
  return schedule;
}

function create(node, id, self) {
  var schedules = node.__transition,
      tween;

  // Initialize the self timer when the transition is created.
  // Note the actual delay is not known until the first callback!
  schedules[id] = self;
  self.timer = timer(schedule, 0, self.time);

  function schedule(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start, self.delay, self.time);

    // If the elapsed delay is less than our first sleep, start immediately.
    if (self.delay <= elapsed) start(elapsed - self.delay);
  }

  function start(elapsed) {
    var i, j, n, o;

    // If the state is not SCHEDULED, then we previously errored on start.
    if (self.state !== SCHEDULED) return stop();

    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name) continue;

      // While this element already has a starting transition during this frame,
      // defer starting an interrupting transition until that transition has a
      // chance to tick (and possibly end); see d3/d3-transition#54!
      if (o.state === STARTED) return timeout(start);

      // Interrupt the active transition, if any.
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }

      // Cancel any pre-empted transitions.
      else if (+i < id) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }

    // Defer the first tick to end of the current frame; see d3/d3#1576.
    // Note the transition may be canceled after start and before the first tick!
    // Note this must be scheduled before the start event; see d3/d3-transition#16!
    // Assuming this is successful, subsequent callbacks go straight to tick.
    timeout(function() {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });

    // Dispatch the start event.
    // Note this must be done before the tween are initialized.
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) return; // interrupted
    self.state = STARTED;

    // Initialize the tween, deleting null tween.
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }

  function tick(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
        i = -1,
        n = tween.length;

    while (++i < n) {
      tween[i].call(node, t);
    }

    // Dispatch the end event.
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }

  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id];
    for (var i in schedules) return; // eslint-disable-line no-unused-vars
    delete node.__transition;
  }
}

function interrupt(node, name) {
  var schedules = node.__transition,
      schedule,
      active,
      empty = true,
      i;

  if (!schedules) return;

  name = name == null ? null : name + "";

  for (i in schedules) {
    if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
    active = schedule.state > STARTING && schedule.state < ENDING;
    schedule.state = ENDED;
    schedule.timer.stop();
    schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
    delete schedules[i];
  }

  if (empty) delete node.__transition;
}

function selection_interrupt(name) {
  return this.each(function() {
    interrupt(this, name);
  });
}

function tweenRemove(id, name) {
  var tween0, tween1;
  return function() {
    var schedule = set(this, id),
        tween = schedule.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }

    schedule.tween = tween1;
  };
}

function tweenFunction(id, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error;
  return function() {
    var schedule = set(this, id),
        tween = schedule.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n) tween1.push(t);
    }

    schedule.tween = tween1;
  };
}

function transition_tween(name, value) {
  var id = this._id;

  name += "";

  if (arguments.length < 2) {
    var tween = get(this.node(), id).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }

  return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
}

function tweenValue(transition, name, value) {
  var id = transition._id;

  transition.each(function() {
    var schedule = set(this, id);
    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
  });

  return function(node) {
    return get(node, id).value[name];
  };
}

function interpolate(a, b) {
  var c;
  return (typeof b === "number" ? interpolateNumber
      : b instanceof color ? interpolateRgb
      : (c = color(b)) ? (b = c, interpolateRgb)
      : interpolateString)(a, b);
}

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

function attrConstant(name, interpolate, value1) {
  var string00,
      string1 = value1 + "",
      interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null
        : string0 === string00 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, value1);
  };
}

function attrConstantNS(fullname, interpolate, value1) {
  var string00,
      string1 = value1 + "",
      interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null
        : string0 === string00 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, value1);
  };
}

function attrFunction(name, interpolate, value) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}

function attrFunctionNS(fullname, interpolate, value) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}

function transition_attr(name, value) {
  var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
  return this.attrTween(name, typeof value === "function"
      ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value))
      : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname)
      : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
}

function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}

function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}

function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}

function attrTween(name, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
    return t0;
  }
  tween._value = value;
  return tween;
}

function transition_attrTween(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error;
  var fullname = namespace(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}

function delayFunction(id, value) {
  return function() {
    init$2(this, id).delay = +value.apply(this, arguments);
  };
}

function delayConstant(id, value) {
  return value = +value, function() {
    init$2(this, id).delay = value;
  };
}

function transition_delay(value) {
  var id = this._id;

  return arguments.length
      ? this.each((typeof value === "function"
          ? delayFunction
          : delayConstant)(id, value))
      : get(this.node(), id).delay;
}

function durationFunction(id, value) {
  return function() {
    set(this, id).duration = +value.apply(this, arguments);
  };
}

function durationConstant(id, value) {
  return value = +value, function() {
    set(this, id).duration = value;
  };
}

function transition_duration(value) {
  var id = this._id;

  return arguments.length
      ? this.each((typeof value === "function"
          ? durationFunction
          : durationConstant)(id, value))
      : get(this.node(), id).duration;
}

function easeConstant(id, value) {
  if (typeof value !== "function") throw new Error;
  return function() {
    set(this, id).ease = value;
  };
}

function transition_ease(value) {
  var id = this._id;

  return arguments.length
      ? this.each(easeConstant(id, value))
      : get(this.node(), id).ease;
}

function transition_filter(match) {
  if (typeof match !== "function") match = matcher(match);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new Transition(subgroups, this._parents, this._name, this._id);
}

function transition_merge(transition) {
  if (transition._id !== this._id) throw new Error;

  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new Transition(merges, this._parents, this._name, this._id);
}

function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0) t = t.slice(0, i);
    return !t || t === "start";
  });
}

function onFunction(id, name, listener) {
  var on0, on1, sit = start(name) ? init$2 : set;
  return function() {
    var schedule = sit(this, id),
        on = schedule.on;

    // If this node shared a dispatch with the previous node,
    // just assign the updated shared dispatch and we’re done!
    // Otherwise, copy-on-write.
    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

    schedule.on = on1;
  };
}

function transition_on(name, listener) {
  var id = this._id;

  return arguments.length < 2
      ? get(this.node(), id).on.on(name)
      : this.each(onFunction(id, name, listener));
}

function removeFunction(id) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition) if (+i !== id) return;
    if (parent) parent.removeChild(this);
  };
}

function transition_remove() {
  return this.on("end.remove", removeFunction(this._id));
}

function transition_select(select) {
  var name = this._name,
      id = this._id;

  if (typeof select !== "function") select = selector(select);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule(subgroup[i], name, id, i, subgroup, get(node, id));
      }
    }
  }

  return new Transition(subgroups, this._parents, name, id);
}

function transition_selectAll(select) {
  var name = this._name,
      id = this._id;

  if (typeof select !== "function") select = selectorAll(select);

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) {
          if (child = children[k]) {
            schedule(child, name, id, k, children, inherit);
          }
        }
        subgroups.push(children);
        parents.push(node);
      }
    }
  }

  return new Transition(subgroups, parents, name, id);
}

var Selection = selection.prototype.constructor;

function transition_selection() {
  return new Selection(this._groups, this._parents);
}

function styleNull(name, interpolate) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0 = styleValue(this, name),
        string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, string10 = string1);
  };
}

function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}

function styleConstant(name, interpolate, value1) {
  var string00,
      string1 = value1 + "",
      interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null
        : string0 === string00 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, value1);
  };
}

function styleFunction(name, interpolate, value) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0 = styleValue(this, name),
        value1 = value(this),
        string1 = value1 + "";
    if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}

function styleMaybeRemove(id, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
  return function() {
    var schedule = set(this, id),
        on = schedule.on,
        listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : undefined;

    // If this node shared a dispatch with the previous node,
    // just assign the updated shared dispatch and we’re done!
    // Otherwise, copy-on-write.
    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

    schedule.on = on1;
  };
}

function transition_style(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
  return value == null ? this
      .styleTween(name, styleNull(name, i))
      .on("end.style." + name, styleRemove(name))
    : typeof value === "function" ? this
      .styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value)))
      .each(styleMaybeRemove(this._id, name))
    : this
      .styleTween(name, styleConstant(name, i, value), priority)
      .on("end.style." + name, null);
}

function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}

function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}

function transition_styleTween(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error;
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}

function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}

function textFunction(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}

function transition_text(value) {
  return this.tween("text", typeof value === "function"
      ? textFunction(tweenValue(this, "text", value))
      : textConstant(value == null ? "" : value + ""));
}

function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}

function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}

function transition_textTween(value) {
  var key = "text";
  if (arguments.length < 1) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error;
  return this.tween(key, textTween(value));
}

function transition_transition() {
  var name = this._name,
      id0 = this._id,
      id1 = newId();

  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit = get(node, id0);
        schedule(node, name, id1, i, group, {
          time: inherit.time + inherit.delay + inherit.duration,
          delay: 0,
          duration: inherit.duration,
          ease: inherit.ease
        });
      }
    }
  }

  return new Transition(groups, this._parents, name, id1);
}

function transition_end() {
  var on0, on1, that = this, id = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = {value: reject},
        end = {value: function() { if (--size === 0) resolve(); }};

    that.each(function() {
      var schedule = set(this, id),
          on = schedule.on;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }

      schedule.on = on1;
    });
  });
}

var id = 0;

function Transition(groups, parents, name, id) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id;
}

function newId() {
  return ++id;
}

var selection_prototype = selection.prototype;

Transition.prototype = {
  constructor: Transition,
  select: transition_select,
  selectAll: transition_selectAll,
  filter: transition_filter,
  merge: transition_merge,
  selection: transition_selection,
  transition: transition_transition,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: transition_on,
  attr: transition_attr,
  attrTween: transition_attrTween,
  style: transition_style,
  styleTween: transition_styleTween,
  text: transition_text,
  textTween: transition_textTween,
  remove: transition_remove,
  tween: transition_tween,
  delay: transition_delay,
  duration: transition_duration,
  ease: transition_ease,
  end: transition_end
};

function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}

var defaultTiming = {
  time: null, // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};

function inherit(node, id) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id])) {
    if (!(node = node.parentNode)) {
      return defaultTiming.time = now(), defaultTiming;
    }
  }
  return timing;
}

function selection_transition(name) {
  var id,
      timing;

  if (name instanceof Transition) {
    id = name._id, name = name._name;
  } else {
    id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }

  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, name, id, i, group, timing || inherit(node, id));
      }
    }
  }

  return new Transition(groups, this._parents, name, id);
}

selection.prototype.interrupt = selection_interrupt;
selection.prototype.transition = selection_transition;

function constant(x) {
  return function() {
    return x;
  };
}

function BrushEvent(target, type, selection) {
  this.target = target;
  this.type = type;
  this.selection = selection;
}

function nopropagation() {
  event.stopImmediatePropagation();
}

function noevent() {
  event.preventDefault();
  event.stopImmediatePropagation();
}

var MODE_DRAG = {name: "drag"},
    MODE_SPACE = {name: "space"},
    MODE_HANDLE = {name: "handle"},
    MODE_CENTER = {name: "center"};

function number1(e) {
  return [+e[0], +e[1]];
}

function number2(e) {
  return [number1(e[0]), number1(e[1])];
}

function toucher(identifier) {
  return function(target) {
    return touch(target, event.touches, identifier);
  };
}

var X = {
  name: "x",
  handles: ["w", "e"].map(type),
  input: function(x, e) { return x == null ? null : [[+x[0], e[0][1]], [+x[1], e[1][1]]]; },
  output: function(xy) { return xy && [xy[0][0], xy[1][0]]; }
};

var Y = {
  name: "y",
  handles: ["n", "s"].map(type),
  input: function(y, e) { return y == null ? null : [[e[0][0], +y[0]], [e[1][0], +y[1]]]; },
  output: function(xy) { return xy && [xy[0][1], xy[1][1]]; }
};

var XY = {
  name: "xy",
  handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
  input: function(xy) { return xy == null ? null : number2(xy); },
  output: function(xy) { return xy; }
};

var cursors = {
  overlay: "crosshair",
  selection: "move",
  n: "ns-resize",
  e: "ew-resize",
  s: "ns-resize",
  w: "ew-resize",
  nw: "nwse-resize",
  ne: "nesw-resize",
  se: "nwse-resize",
  sw: "nesw-resize"
};

var flipX = {
  e: "w",
  w: "e",
  nw: "ne",
  ne: "nw",
  se: "sw",
  sw: "se"
};

var flipY = {
  n: "s",
  s: "n",
  nw: "sw",
  ne: "se",
  se: "ne",
  sw: "nw"
};

var signsX = {
  overlay: +1,
  selection: +1,
  n: null,
  e: +1,
  s: null,
  w: -1,
  nw: -1,
  ne: +1,
  se: +1,
  sw: -1
};

var signsY = {
  overlay: +1,
  selection: +1,
  n: -1,
  e: null,
  s: +1,
  w: null,
  nw: -1,
  ne: -1,
  se: +1,
  sw: +1
};

function type(t) {
  return {type: t};
}

// Ignore right-click, since that should open the context menu.
function defaultFilter() {
  return !event.ctrlKey && !event.button;
}

function defaultExtent() {
  var svg = this.ownerSVGElement || this;
  if (svg.hasAttribute("viewBox")) {
    svg = svg.viewBox.baseVal;
    return [[svg.x, svg.y], [svg.x + svg.width, svg.y + svg.height]];
  }
  return [[0, 0], [svg.width.baseVal.value, svg.height.baseVal.value]];
}

function defaultTouchable() {
  return navigator.maxTouchPoints || ("ontouchstart" in this);
}

// Like d3.local, but with the name “__brush” rather than auto-generated.
function local(node) {
  while (!node.__brush) if (!(node = node.parentNode)) return;
  return node.__brush;
}

function empty(extent) {
  return extent[0][0] === extent[1][0]
      || extent[0][1] === extent[1][1];
}

function brushSelection(node) {
  var state = node.__brush;
  return state ? state.dim.output(state.selection) : null;
}

function brushX() {
  return brush$1(X);
}

function brush() {
  return brush$1(XY);
}

function brush$1(dim) {
  var extent = defaultExtent,
      filter = defaultFilter,
      touchable = defaultTouchable,
      keys = true,
      listeners = dispatch("start", "brush", "end"),
      handleSize = 6,
      touchending;

  function brush(group) {
    var overlay = group
        .property("__brush", initialize)
      .selectAll(".overlay")
      .data([type("overlay")]);

    overlay.enter().append("rect")
        .attr("class", "overlay")
        .attr("pointer-events", "all")
        .attr("cursor", cursors.overlay)
      .merge(overlay)
        .each(function() {
          var extent = local(this).extent;
          select(this)
              .attr("x", extent[0][0])
              .attr("y", extent[0][1])
              .attr("width", extent[1][0] - extent[0][0])
              .attr("height", extent[1][1] - extent[0][1]);
        });

    group.selectAll(".selection")
      .data([type("selection")])
      .enter().append("rect")
        .attr("class", "selection")
        .attr("cursor", cursors.selection)
        .attr("fill", "#777")
        .attr("fill-opacity", 0.3)
        .attr("stroke", "#fff")
        .attr("shape-rendering", "crispEdges");

    var handle = group.selectAll(".handle")
      .data(dim.handles, function(d) { return d.type; });

    handle.exit().remove();

    handle.enter().append("rect")
        .attr("class", function(d) { return "handle handle--" + d.type; })
        .attr("cursor", function(d) { return cursors[d.type]; });

    group
        .each(redraw)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mousedown.brush", started)
      .filter(touchable)
        .on("touchstart.brush", started)
        .on("touchmove.brush", touchmoved)
        .on("touchend.brush touchcancel.brush", touchended)
        .style("touch-action", "none")
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  brush.move = function(group, selection) {
    if (group.selection) {
      group
          .on("start.brush", function() { emitter(this, arguments).beforestart().start(); })
          .on("interrupt.brush end.brush", function() { emitter(this, arguments).end(); })
          .tween("brush", function() {
            var that = this,
                state = that.__brush,
                emit = emitter(that, arguments),
                selection0 = state.selection,
                selection1 = dim.input(typeof selection === "function" ? selection.apply(this, arguments) : selection, state.extent),
                i = interpolate$1(selection0, selection1);

            function tween(t) {
              state.selection = t === 1 && selection1 === null ? null : i(t);
              redraw.call(that);
              emit.brush();
            }

            return selection0 !== null && selection1 !== null ? tween : tween(1);
          });
    } else {
      group
          .each(function() {
            var that = this,
                args = arguments,
                state = that.__brush,
                selection1 = dim.input(typeof selection === "function" ? selection.apply(that, args) : selection, state.extent),
                emit = emitter(that, args).beforestart();

            interrupt(that);
            state.selection = selection1 === null ? null : selection1;
            redraw.call(that);
            emit.start().brush().end();
          });
    }
  };

  brush.clear = function(group) {
    brush.move(group, null);
  };

  function redraw() {
    var group = select(this),
        selection = local(this).selection;

    if (selection) {
      group.selectAll(".selection")
          .style("display", null)
          .attr("x", selection[0][0])
          .attr("y", selection[0][1])
          .attr("width", selection[1][0] - selection[0][0])
          .attr("height", selection[1][1] - selection[0][1]);

      group.selectAll(".handle")
          .style("display", null)
          .attr("x", function(d) { return d.type[d.type.length - 1] === "e" ? selection[1][0] - handleSize / 2 : selection[0][0] - handleSize / 2; })
          .attr("y", function(d) { return d.type[0] === "s" ? selection[1][1] - handleSize / 2 : selection[0][1] - handleSize / 2; })
          .attr("width", function(d) { return d.type === "n" || d.type === "s" ? selection[1][0] - selection[0][0] + handleSize : handleSize; })
          .attr("height", function(d) { return d.type === "e" || d.type === "w" ? selection[1][1] - selection[0][1] + handleSize : handleSize; });
    }

    else {
      group.selectAll(".selection,.handle")
          .style("display", "none")
          .attr("x", null)
          .attr("y", null)
          .attr("width", null)
          .attr("height", null);
    }
  }

  function emitter(that, args, clean) {
    var emit = that.__brush.emitter;
    return emit && (!clean || !emit.clean) ? emit : new Emitter(that, args, clean);
  }

  function Emitter(that, args, clean) {
    this.that = that;
    this.args = args;
    this.state = that.__brush;
    this.active = 0;
    this.clean = clean;
  }

  Emitter.prototype = {
    beforestart: function() {
      if (++this.active === 1) this.state.emitter = this, this.starting = true;
      return this;
    },
    start: function() {
      if (this.starting) this.starting = false, this.emit("start");
      else this.emit("brush");
      return this;
    },
    brush: function() {
      this.emit("brush");
      return this;
    },
    end: function() {
      if (--this.active === 0) delete this.state.emitter, this.emit("end");
      return this;
    },
    emit: function(type) {
      customEvent(new BrushEvent(brush, type, dim.output(this.state.selection)), listeners.apply, listeners, [type, this.that, this.args]);
    }
  };

  function started() {
    if (touchending && !event.touches) return;
    if (!filter.apply(this, arguments)) return;

    var that = this,
        type = event.target.__data__.type,
        mode = (keys && event.metaKey ? type = "overlay" : type) === "selection" ? MODE_DRAG : (keys && event.altKey ? MODE_CENTER : MODE_HANDLE),
        signX = dim === Y ? null : signsX[type],
        signY = dim === X ? null : signsY[type],
        state = local(that),
        extent = state.extent,
        selection = state.selection,
        W = extent[0][0], w0, w1,
        N = extent[0][1], n0, n1,
        E = extent[1][0], e0, e1,
        S = extent[1][1], s0, s1,
        dx = 0,
        dy = 0,
        moving,
        shifting = signX && signY && keys && event.shiftKey,
        lockX,
        lockY,
        pointer = event.touches ? toucher(event.changedTouches[0].identifier) : mouse,
        point0 = pointer(that),
        point = point0,
        emit = emitter(that, arguments, true).beforestart();

    if (type === "overlay") {
      if (selection) moving = true;
      state.selection = selection = [
        [w0 = dim === Y ? W : point0[0], n0 = dim === X ? N : point0[1]],
        [e0 = dim === Y ? E : w0, s0 = dim === X ? S : n0]
      ];
    } else {
      w0 = selection[0][0];
      n0 = selection[0][1];
      e0 = selection[1][0];
      s0 = selection[1][1];
    }

    w1 = w0;
    n1 = n0;
    e1 = e0;
    s1 = s0;

    var group = select(that)
        .attr("pointer-events", "none");

    var overlay = group.selectAll(".overlay")
        .attr("cursor", cursors[type]);

    if (event.touches) {
      emit.moved = moved;
      emit.ended = ended;
    } else {
      var view = select(event.view)
          .on("mousemove.brush", moved, true)
          .on("mouseup.brush", ended, true);
      if (keys) view
          .on("keydown.brush", keydowned, true)
          .on("keyup.brush", keyupped, true);

      dragDisable(event.view);
    }

    nopropagation();
    interrupt(that);
    redraw.call(that);
    emit.start();

    function moved() {
      var point1 = pointer(that);
      if (shifting && !lockX && !lockY) {
        if (Math.abs(point1[0] - point[0]) > Math.abs(point1[1] - point[1])) lockY = true;
        else lockX = true;
      }
      point = point1;
      moving = true;
      noevent();
      move();
    }

    function move() {
      var t;

      dx = point[0] - point0[0];
      dy = point[1] - point0[1];

      switch (mode) {
        case MODE_SPACE:
        case MODE_DRAG: {
          if (signX) dx = Math.max(W - w0, Math.min(E - e0, dx)), w1 = w0 + dx, e1 = e0 + dx;
          if (signY) dy = Math.max(N - n0, Math.min(S - s0, dy)), n1 = n0 + dy, s1 = s0 + dy;
          break;
        }
        case MODE_HANDLE: {
          if (signX < 0) dx = Math.max(W - w0, Math.min(E - w0, dx)), w1 = w0 + dx, e1 = e0;
          else if (signX > 0) dx = Math.max(W - e0, Math.min(E - e0, dx)), w1 = w0, e1 = e0 + dx;
          if (signY < 0) dy = Math.max(N - n0, Math.min(S - n0, dy)), n1 = n0 + dy, s1 = s0;
          else if (signY > 0) dy = Math.max(N - s0, Math.min(S - s0, dy)), n1 = n0, s1 = s0 + dy;
          break;
        }
        case MODE_CENTER: {
          if (signX) w1 = Math.max(W, Math.min(E, w0 - dx * signX)), e1 = Math.max(W, Math.min(E, e0 + dx * signX));
          if (signY) n1 = Math.max(N, Math.min(S, n0 - dy * signY)), s1 = Math.max(N, Math.min(S, s0 + dy * signY));
          break;
        }
      }

      if (e1 < w1) {
        signX *= -1;
        t = w0, w0 = e0, e0 = t;
        t = w1, w1 = e1, e1 = t;
        if (type in flipX) overlay.attr("cursor", cursors[type = flipX[type]]);
      }

      if (s1 < n1) {
        signY *= -1;
        t = n0, n0 = s0, s0 = t;
        t = n1, n1 = s1, s1 = t;
        if (type in flipY) overlay.attr("cursor", cursors[type = flipY[type]]);
      }

      if (state.selection) selection = state.selection; // May be set by brush.move!
      if (lockX) w1 = selection[0][0], e1 = selection[1][0];
      if (lockY) n1 = selection[0][1], s1 = selection[1][1];

      if (selection[0][0] !== w1
          || selection[0][1] !== n1
          || selection[1][0] !== e1
          || selection[1][1] !== s1) {
        state.selection = [[w1, n1], [e1, s1]];
        redraw.call(that);
        emit.brush();
      }
    }

    function ended() {
      nopropagation();
      if (event.touches) {
        if (event.touches.length) return;
        if (touchending) clearTimeout(touchending);
        touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
      } else {
        yesdrag(event.view, moving);
        view.on("keydown.brush keyup.brush mousemove.brush mouseup.brush", null);
      }
      group.attr("pointer-events", "all");
      overlay.attr("cursor", cursors.overlay);
      if (state.selection) selection = state.selection; // May be set by brush.move (on start)!
      if (empty(selection)) state.selection = null, redraw.call(that);
      emit.end();
    }

    function keydowned() {
      switch (event.keyCode) {
        case 16: { // SHIFT
          shifting = signX && signY;
          break;
        }
        case 18: { // ALT
          if (mode === MODE_HANDLE) {
            if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX;
            if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY;
            mode = MODE_CENTER;
            move();
          }
          break;
        }
        case 32: { // SPACE; takes priority over ALT
          if (mode === MODE_HANDLE || mode === MODE_CENTER) {
            if (signX < 0) e0 = e1 - dx; else if (signX > 0) w0 = w1 - dx;
            if (signY < 0) s0 = s1 - dy; else if (signY > 0) n0 = n1 - dy;
            mode = MODE_SPACE;
            overlay.attr("cursor", cursors.selection);
            move();
          }
          break;
        }
        default: return;
      }
      noevent();
    }

    function keyupped() {
      switch (event.keyCode) {
        case 16: { // SHIFT
          if (shifting) {
            lockX = lockY = shifting = false;
            move();
          }
          break;
        }
        case 18: { // ALT
          if (mode === MODE_CENTER) {
            if (signX < 0) e0 = e1; else if (signX > 0) w0 = w1;
            if (signY < 0) s0 = s1; else if (signY > 0) n0 = n1;
            mode = MODE_HANDLE;
            move();
          }
          break;
        }
        case 32: { // SPACE
          if (mode === MODE_SPACE) {
            if (event.altKey) {
              if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX;
              if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY;
              mode = MODE_CENTER;
            } else {
              if (signX < 0) e0 = e1; else if (signX > 0) w0 = w1;
              if (signY < 0) s0 = s1; else if (signY > 0) n0 = n1;
              mode = MODE_HANDLE;
            }
            overlay.attr("cursor", cursors[type]);
            move();
          }
          break;
        }
        default: return;
      }
      noevent();
    }
  }

  function touchmoved() {
    emitter(this, arguments).moved();
  }

  function touchended() {
    emitter(this, arguments).ended();
  }

  function initialize() {
    var state = this.__brush || {selection: null};
    state.extent = number2(extent.apply(this, arguments));
    state.dim = dim;
    return state;
  }

  brush.extent = function(_) {
    return arguments.length ? (extent = typeof _ === "function" ? _ : constant(number2(_)), brush) : extent;
  };

  brush.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), brush) : filter;
  };

  brush.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), brush) : touchable;
  };

  brush.handleSize = function(_) {
    return arguments.length ? (handleSize = +_, brush) : handleSize;
  };

  brush.keyModifiers = function(_) {
    return arguments.length ? (keys = !!_, brush) : keys;
  };

  brush.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? brush : value;
  };

  return brush;
}

function defaultSource() {
  return Math.random();
}

((function sourceRandomUniform(source) {
  function randomUniform(min, max) {
    min = min == null ? 0 : +min;
    max = max == null ? 1 : +max;
    if (arguments.length === 1) max = min, min = 0;
    else max -= min;
    return function() {
      return source() * max + min;
    };
  }

  randomUniform.source = sourceRandomUniform;

  return randomUniform;
}))(defaultSource);

var randomNormal = (function sourceRandomNormal(source) {
  function randomNormal(mu, sigma) {
    var x, r;
    mu = mu == null ? 0 : +mu;
    sigma = sigma == null ? 1 : +sigma;
    return function() {
      var y;

      // If available, use the second previously-generated uniform random.
      if (x != null) y = x, x = null;

      // Otherwise, generate a new x and y.
      else do {
        x = source() * 2 - 1;
        y = source() * 2 - 1;
        r = x * x + y * y;
      } while (!r || r > 1);

      return mu + sigma * y * Math.sqrt(-2 * Math.log(r) / r);
    };
  }

  randomNormal.source = sourceRandomNormal;

  return randomNormal;
})(defaultSource);

((function sourceRandomLogNormal(source) {
  function randomLogNormal() {
    var randomNormal$1 = randomNormal.source(source).apply(this, arguments);
    return function() {
      return Math.exp(randomNormal$1());
    };
  }

  randomLogNormal.source = sourceRandomLogNormal;

  return randomLogNormal;
}))(defaultSource);

var irwinHall = (function sourceRandomIrwinHall(source) {
  function randomIrwinHall(n) {
    return function() {
      for (var sum = 0, i = 0; i < n; ++i) sum += source();
      return sum;
    };
  }

  randomIrwinHall.source = sourceRandomIrwinHall;

  return randomIrwinHall;
})(defaultSource);

((function sourceRandomBates(source) {
  function randomBates(n) {
    var randomIrwinHall = irwinHall.source(source)(n);
    return function() {
      return randomIrwinHall() / n;
    };
  }

  randomBates.source = sourceRandomBates;

  return randomBates;
}))(defaultSource);

((function sourceRandomExponential(source) {
  function randomExponential(lambda) {
    return function() {
      return -Math.log(1 - source()) / lambda;
    };
  }

  randomExponential.source = sourceRandomExponential;

  return randomExponential;
}))(defaultSource);

function responseJson(response) {
  if (!response.ok) throw new Error(response.status + " " + response.statusText);
  if (response.status === 204 || response.status === 205) return;
  return response.json();
}

function json(input, init) {
  return fetch(input, init).then(responseJson);
}

function count(node) {
  var sum = 0,
      children = node.children,
      i = children && children.length;
  if (!i) sum = 1;
  else while (--i >= 0) sum += children[i].value;
  node.value = sum;
}

function node_count() {
  return this.eachAfter(count);
}

function node_each(callback) {
  var node = this, current, next = [node], children, i, n;
  do {
    current = next.reverse(), next = [];
    while (node = current.pop()) {
      callback(node), children = node.children;
      if (children) for (i = 0, n = children.length; i < n; ++i) {
        next.push(children[i]);
      }
    }
  } while (next.length);
  return this;
}

function node_eachBefore(callback) {
  var node = this, nodes = [node], children, i;
  while (node = nodes.pop()) {
    callback(node), children = node.children;
    if (children) for (i = children.length - 1; i >= 0; --i) {
      nodes.push(children[i]);
    }
  }
  return this;
}

function node_eachAfter(callback) {
  var node = this, nodes = [node], next = [], children, i, n;
  while (node = nodes.pop()) {
    next.push(node), children = node.children;
    if (children) for (i = 0, n = children.length; i < n; ++i) {
      nodes.push(children[i]);
    }
  }
  while (node = next.pop()) {
    callback(node);
  }
  return this;
}

function node_sum(value) {
  return this.eachAfter(function(node) {
    var sum = +value(node.data) || 0,
        children = node.children,
        i = children && children.length;
    while (--i >= 0) sum += children[i].value;
    node.value = sum;
  });
}

function node_sort(compare) {
  return this.eachBefore(function(node) {
    if (node.children) {
      node.children.sort(compare);
    }
  });
}

function node_path(end) {
  var start = this,
      ancestor = leastCommonAncestor(start, end),
      nodes = [start];
  while (start !== ancestor) {
    start = start.parent;
    nodes.push(start);
  }
  var k = nodes.length;
  while (end !== ancestor) {
    nodes.splice(k, 0, end);
    end = end.parent;
  }
  return nodes;
}

function leastCommonAncestor(a, b) {
  if (a === b) return a;
  var aNodes = a.ancestors(),
      bNodes = b.ancestors(),
      c = null;
  a = aNodes.pop();
  b = bNodes.pop();
  while (a === b) {
    c = a;
    a = aNodes.pop();
    b = bNodes.pop();
  }
  return c;
}

function node_ancestors() {
  var node = this, nodes = [node];
  while (node = node.parent) {
    nodes.push(node);
  }
  return nodes;
}

function node_descendants() {
  var nodes = [];
  this.each(function(node) {
    nodes.push(node);
  });
  return nodes;
}

function node_leaves() {
  var leaves = [];
  this.eachBefore(function(node) {
    if (!node.children) {
      leaves.push(node);
    }
  });
  return leaves;
}

function node_links() {
  var root = this, links = [];
  root.each(function(node) {
    if (node !== root) { // Don’t include the root’s parent, if any.
      links.push({source: node.parent, target: node});
    }
  });
  return links;
}

function hierarchy(data, children) {
  var root = new Node(data),
      valued = +data.value && (root.value = data.value),
      node,
      nodes = [root],
      child,
      childs,
      i,
      n;

  if (children == null) children = defaultChildren;

  while (node = nodes.pop()) {
    if (valued) node.value = +node.data.value;
    if ((childs = children(node.data)) && (n = childs.length)) {
      node.children = new Array(n);
      for (i = n - 1; i >= 0; --i) {
        nodes.push(child = node.children[i] = new Node(childs[i]));
        child.parent = node;
        child.depth = node.depth + 1;
      }
    }
  }

  return root.eachBefore(computeHeight);
}

function node_copy() {
  return hierarchy(this).eachBefore(copyData);
}

function defaultChildren(d) {
  return d.children;
}

function copyData(node) {
  node.data = node.data.data;
}

function computeHeight(node) {
  var height = 0;
  do node.height = height;
  while ((node = node.parent) && (node.height < ++height));
}

function Node(data) {
  this.data = data;
  this.depth =
  this.height = 0;
  this.parent = null;
}

Node.prototype = hierarchy.prototype = {
  constructor: Node,
  count: node_count,
  each: node_each,
  eachAfter: node_eachAfter,
  eachBefore: node_eachBefore,
  sum: node_sum,
  sort: node_sort,
  path: node_path,
  ancestors: node_ancestors,
  descendants: node_descendants,
  leaves: node_leaves,
  links: node_links,
  copy: node_copy
};

function colors(specifier) {
  var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
  while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
  return colors;
}

function ramp(scheme) {
  return rgbBasis(scheme[scheme.length - 1]);
}

var scheme$f = new Array(3).concat(
  "e9a3c9f7f7f7a1d76a",
  "d01c8bf1b6dab8e1864dac26",
  "d01c8bf1b6daf7f7f7b8e1864dac26",
  "c51b7de9a3c9fde0efe6f5d0a1d76a4d9221",
  "c51b7de9a3c9fde0eff7f7f7e6f5d0a1d76a4d9221",
  "c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221",
  "c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221",
  "8e0152c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221276419",
  "8e0152c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221276419"
).map(colors);

var PiYG = ramp(scheme$f);

var scheme$e = new Array(3).concat(
  "998ec3f7f7f7f1a340",
  "5e3c99b2abd2fdb863e66101",
  "5e3c99b2abd2f7f7f7fdb863e66101",
  "542788998ec3d8daebfee0b6f1a340b35806",
  "542788998ec3d8daebf7f7f7fee0b6f1a340b35806",
  "5427888073acb2abd2d8daebfee0b6fdb863e08214b35806",
  "5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b35806",
  "2d004b5427888073acb2abd2d8daebfee0b6fdb863e08214b358067f3b08",
  "2d004b5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b358067f3b08"
).map(colors);

var PuOr = ramp(scheme$e);

var scheme$d = new Array(3).concat(
  "ef8a62f7f7f767a9cf",
  "ca0020f4a58292c5de0571b0",
  "ca0020f4a582f7f7f792c5de0571b0",
  "b2182bef8a62fddbc7d1e5f067a9cf2166ac",
  "b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac",
  "b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac",
  "b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac",
  "67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061",
  "67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061"
).map(colors);

var RdBu = ramp(scheme$d);

var scheme$c = new Array(3).concat(
  "ef8a62ffffff999999",
  "ca0020f4a582bababa404040",
  "ca0020f4a582ffffffbababa404040",
  "b2182bef8a62fddbc7e0e0e09999994d4d4d",
  "b2182bef8a62fddbc7ffffffe0e0e09999994d4d4d",
  "b2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d",
  "b2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d",
  "67001fb2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d1a1a1a",
  "67001fb2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d1a1a1a"
).map(colors);

var RdGy = ramp(scheme$c);

var scheme$b = new Array(3).concat(
  "fc8d59ffffbf91bfdb",
  "d7191cfdae61abd9e92c7bb6",
  "d7191cfdae61ffffbfabd9e92c7bb6",
  "d73027fc8d59fee090e0f3f891bfdb4575b4",
  "d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4",
  "d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4",
  "d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4",
  "a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695",
  "a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695"
).map(colors);

var RdYlBu = ramp(scheme$b);

var scheme$a = new Array(3).concat(
  "e5f5f999d8c92ca25f",
  "edf8fbb2e2e266c2a4238b45",
  "edf8fbb2e2e266c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b"
).map(colors);

var BuGn = ramp(scheme$a);

var scheme$9 = new Array(3).concat(
  "e0f3dba8ddb543a2ca",
  "f0f9e8bae4bc7bccc42b8cbe",
  "f0f9e8bae4bc7bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081"
).map(colors);

var GnBu = ramp(scheme$9);

var scheme$8 = new Array(3).concat(
  "fee8c8fdbb84e34a33",
  "fef0d9fdcc8afc8d59d7301f",
  "fef0d9fdcc8afc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000"
).map(colors);

var OrRd = ramp(scheme$8);

var scheme$7 = new Array(3).concat(
  "ece7f2a6bddb2b8cbe",
  "f1eef6bdc9e174a9cf0570b0",
  "f1eef6bdc9e174a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858"
).map(colors);

var PuBu = ramp(scheme$7);

var scheme$6 = new Array(3).concat(
  "edf8b17fcdbb2c7fb8",
  "ffffcca1dab441b6c4225ea8",
  "ffffcca1dab441b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58"
).map(colors);

var YlGnBu = ramp(scheme$6);

var scheme$5 = new Array(3).concat(
  "deebf79ecae13182bd",
  "eff3ffbdd7e76baed62171b5",
  "eff3ffbdd7e76baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b"
).map(colors);

var Blues = ramp(scheme$5);

var scheme$4 = new Array(3).concat(
  "e5f5e0a1d99b31a354",
  "edf8e9bae4b374c476238b45",
  "edf8e9bae4b374c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b"
).map(colors);

var Greens = ramp(scheme$4);

var scheme$3 = new Array(3).concat(
  "f0f0f0bdbdbd636363",
  "f7f7f7cccccc969696525252",
  "f7f7f7cccccc969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000"
).map(colors);

var Greys = ramp(scheme$3);

var scheme$2 = new Array(3).concat(
  "efedf5bcbddc756bb1",
  "f2f0f7cbc9e29e9ac86a51a3",
  "f2f0f7cbc9e29e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d"
).map(colors);

var Purples = ramp(scheme$2);

var scheme$1 = new Array(3).concat(
  "fee0d2fc9272de2d26",
  "fee5d9fcae91fb6a4acb181d",
  "fee5d9fcae91fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d"
).map(colors);

var Reds = ramp(scheme$1);

var scheme = new Array(3).concat(
  "fee6cefdae6be6550d",
  "feeddefdbe85fd8d3cd94701",
  "feeddefdbe85fd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704"
).map(colors);

var Oranges = ramp(scheme);

function RedBlackTree() {
  this._ = null; // root node
}

function RedBlackNode(node) {
  node.U = // parent node
  node.C = // color - true for red, false for black
  node.L = // left node
  node.R = // right node
  node.P = // previous node
  node.N = null; // next node
}

RedBlackTree.prototype = {
  constructor: RedBlackTree,

  insert: function(after, node) {
    var parent, grandpa, uncle;

    if (after) {
      node.P = after;
      node.N = after.N;
      if (after.N) after.N.P = node;
      after.N = node;
      if (after.R) {
        after = after.R;
        while (after.L) after = after.L;
        after.L = node;
      } else {
        after.R = node;
      }
      parent = after;
    } else if (this._) {
      after = RedBlackFirst(this._);
      node.P = null;
      node.N = after;
      after.P = after.L = node;
      parent = after;
    } else {
      node.P = node.N = null;
      this._ = node;
      parent = null;
    }
    node.L = node.R = null;
    node.U = parent;
    node.C = true;

    after = node;
    while (parent && parent.C) {
      grandpa = parent.U;
      if (parent === grandpa.L) {
        uncle = grandpa.R;
        if (uncle && uncle.C) {
          parent.C = uncle.C = false;
          grandpa.C = true;
          after = grandpa;
        } else {
          if (after === parent.R) {
            RedBlackRotateLeft(this, parent);
            after = parent;
            parent = after.U;
          }
          parent.C = false;
          grandpa.C = true;
          RedBlackRotateRight(this, grandpa);
        }
      } else {
        uncle = grandpa.L;
        if (uncle && uncle.C) {
          parent.C = uncle.C = false;
          grandpa.C = true;
          after = grandpa;
        } else {
          if (after === parent.L) {
            RedBlackRotateRight(this, parent);
            after = parent;
            parent = after.U;
          }
          parent.C = false;
          grandpa.C = true;
          RedBlackRotateLeft(this, grandpa);
        }
      }
      parent = after.U;
    }
    this._.C = false;
  },

  remove: function(node) {
    if (node.N) node.N.P = node.P;
    if (node.P) node.P.N = node.N;
    node.N = node.P = null;

    var parent = node.U,
        sibling,
        left = node.L,
        right = node.R,
        next,
        red;

    if (!left) next = right;
    else if (!right) next = left;
    else next = RedBlackFirst(right);

    if (parent) {
      if (parent.L === node) parent.L = next;
      else parent.R = next;
    } else {
      this._ = next;
    }

    if (left && right) {
      red = next.C;
      next.C = node.C;
      next.L = left;
      left.U = next;
      if (next !== right) {
        parent = next.U;
        next.U = node.U;
        node = next.R;
        parent.L = node;
        next.R = right;
        right.U = next;
      } else {
        next.U = parent;
        parent = next;
        node = next.R;
      }
    } else {
      red = node.C;
      node = next;
    }

    if (node) node.U = parent;
    if (red) return;
    if (node && node.C) { node.C = false; return; }

    do {
      if (node === this._) break;
      if (node === parent.L) {
        sibling = parent.R;
        if (sibling.C) {
          sibling.C = false;
          parent.C = true;
          RedBlackRotateLeft(this, parent);
          sibling = parent.R;
        }
        if ((sibling.L && sibling.L.C)
            || (sibling.R && sibling.R.C)) {
          if (!sibling.R || !sibling.R.C) {
            sibling.L.C = false;
            sibling.C = true;
            RedBlackRotateRight(this, sibling);
            sibling = parent.R;
          }
          sibling.C = parent.C;
          parent.C = sibling.R.C = false;
          RedBlackRotateLeft(this, parent);
          node = this._;
          break;
        }
      } else {
        sibling = parent.L;
        if (sibling.C) {
          sibling.C = false;
          parent.C = true;
          RedBlackRotateRight(this, parent);
          sibling = parent.L;
        }
        if ((sibling.L && sibling.L.C)
          || (sibling.R && sibling.R.C)) {
          if (!sibling.L || !sibling.L.C) {
            sibling.R.C = false;
            sibling.C = true;
            RedBlackRotateLeft(this, sibling);
            sibling = parent.L;
          }
          sibling.C = parent.C;
          parent.C = sibling.L.C = false;
          RedBlackRotateRight(this, parent);
          node = this._;
          break;
        }
      }
      sibling.C = true;
      node = parent;
      parent = parent.U;
    } while (!node.C);

    if (node) node.C = false;
  }
};

function RedBlackRotateLeft(tree, node) {
  var p = node,
      q = node.R,
      parent = p.U;

  if (parent) {
    if (parent.L === p) parent.L = q;
    else parent.R = q;
  } else {
    tree._ = q;
  }

  q.U = parent;
  p.U = q;
  p.R = q.L;
  if (p.R) p.R.U = p;
  q.L = p;
}

function RedBlackRotateRight(tree, node) {
  var p = node,
      q = node.L,
      parent = p.U;

  if (parent) {
    if (parent.L === p) parent.L = q;
    else parent.R = q;
  } else {
    tree._ = q;
  }

  q.U = parent;
  p.U = q;
  p.L = q.R;
  if (p.L) p.L.U = p;
  q.R = p;
}

function RedBlackFirst(node) {
  while (node.L) node = node.L;
  return node;
}

function createEdge(left, right, v0, v1) {
  var edge = [null, null],
      index = edges.push(edge) - 1;
  edge.left = left;
  edge.right = right;
  if (v0) setEdgeEnd(edge, left, right, v0);
  if (v1) setEdgeEnd(edge, right, left, v1);
  cells[left.index].halfedges.push(index);
  cells[right.index].halfedges.push(index);
  return edge;
}

function createBorderEdge(left, v0, v1) {
  var edge = [v0, v1];
  edge.left = left;
  return edge;
}

function setEdgeEnd(edge, left, right, vertex) {
  if (!edge[0] && !edge[1]) {
    edge[0] = vertex;
    edge.left = left;
    edge.right = right;
  } else if (edge.left === right) {
    edge[1] = vertex;
  } else {
    edge[0] = vertex;
  }
}

// Liang–Barsky line clipping.
function clipEdge(edge, x0, y0, x1, y1) {
  var a = edge[0],
      b = edge[1],
      ax = a[0],
      ay = a[1],
      bx = b[0],
      by = b[1],
      t0 = 0,
      t1 = 1,
      dx = bx - ax,
      dy = by - ay,
      r;

  r = x0 - ax;
  if (!dx && r > 0) return;
  r /= dx;
  if (dx < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dx > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }

  r = x1 - ax;
  if (!dx && r < 0) return;
  r /= dx;
  if (dx < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dx > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }

  r = y0 - ay;
  if (!dy && r > 0) return;
  r /= dy;
  if (dy < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dy > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }

  r = y1 - ay;
  if (!dy && r < 0) return;
  r /= dy;
  if (dy < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dy > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }

  if (!(t0 > 0) && !(t1 < 1)) return true; // TODO Better check?

  if (t0 > 0) edge[0] = [ax + t0 * dx, ay + t0 * dy];
  if (t1 < 1) edge[1] = [ax + t1 * dx, ay + t1 * dy];
  return true;
}

function connectEdge(edge, x0, y0, x1, y1) {
  var v1 = edge[1];
  if (v1) return true;

  var v0 = edge[0],
      left = edge.left,
      right = edge.right,
      lx = left[0],
      ly = left[1],
      rx = right[0],
      ry = right[1],
      fx = (lx + rx) / 2,
      fy = (ly + ry) / 2,
      fm,
      fb;

  if (ry === ly) {
    if (fx < x0 || fx >= x1) return;
    if (lx > rx) {
      if (!v0) v0 = [fx, y0];
      else if (v0[1] >= y1) return;
      v1 = [fx, y1];
    } else {
      if (!v0) v0 = [fx, y1];
      else if (v0[1] < y0) return;
      v1 = [fx, y0];
    }
  } else {
    fm = (lx - rx) / (ry - ly);
    fb = fy - fm * fx;
    if (fm < -1 || fm > 1) {
      if (lx > rx) {
        if (!v0) v0 = [(y0 - fb) / fm, y0];
        else if (v0[1] >= y1) return;
        v1 = [(y1 - fb) / fm, y1];
      } else {
        if (!v0) v0 = [(y1 - fb) / fm, y1];
        else if (v0[1] < y0) return;
        v1 = [(y0 - fb) / fm, y0];
      }
    } else {
      if (ly < ry) {
        if (!v0) v0 = [x0, fm * x0 + fb];
        else if (v0[0] >= x1) return;
        v1 = [x1, fm * x1 + fb];
      } else {
        if (!v0) v0 = [x1, fm * x1 + fb];
        else if (v0[0] < x0) return;
        v1 = [x0, fm * x0 + fb];
      }
    }
  }

  edge[0] = v0;
  edge[1] = v1;
  return true;
}

function clipEdges(x0, y0, x1, y1) {
  var i = edges.length,
      edge;

  while (i--) {
    if (!connectEdge(edge = edges[i], x0, y0, x1, y1)
        || !clipEdge(edge, x0, y0, x1, y1)
        || !(Math.abs(edge[0][0] - edge[1][0]) > epsilon
            || Math.abs(edge[0][1] - edge[1][1]) > epsilon)) {
      delete edges[i];
    }
  }
}

function createCell(site) {
  return cells[site.index] = {
    site: site,
    halfedges: []
  };
}

function cellHalfedgeAngle(cell, edge) {
  var site = cell.site,
      va = edge.left,
      vb = edge.right;
  if (site === vb) vb = va, va = site;
  if (vb) return Math.atan2(vb[1] - va[1], vb[0] - va[0]);
  if (site === va) va = edge[1], vb = edge[0];
  else va = edge[0], vb = edge[1];
  return Math.atan2(va[0] - vb[0], vb[1] - va[1]);
}

function cellHalfedgeStart(cell, edge) {
  return edge[+(edge.left !== cell.site)];
}

function cellHalfedgeEnd(cell, edge) {
  return edge[+(edge.left === cell.site)];
}

function sortCellHalfedges() {
  for (var i = 0, n = cells.length, cell, halfedges, j, m; i < n; ++i) {
    if ((cell = cells[i]) && (m = (halfedges = cell.halfedges).length)) {
      var index = new Array(m),
          array = new Array(m);
      for (j = 0; j < m; ++j) index[j] = j, array[j] = cellHalfedgeAngle(cell, edges[halfedges[j]]);
      index.sort(function(i, j) { return array[j] - array[i]; });
      for (j = 0; j < m; ++j) array[j] = halfedges[index[j]];
      for (j = 0; j < m; ++j) halfedges[j] = array[j];
    }
  }
}

function clipCells(x0, y0, x1, y1) {
  var nCells = cells.length,
      iCell,
      cell,
      site,
      iHalfedge,
      halfedges,
      nHalfedges,
      start,
      startX,
      startY,
      end,
      endX,
      endY,
      cover = true;

  for (iCell = 0; iCell < nCells; ++iCell) {
    if (cell = cells[iCell]) {
      site = cell.site;
      halfedges = cell.halfedges;
      iHalfedge = halfedges.length;

      // Remove any dangling clipped edges.
      while (iHalfedge--) {
        if (!edges[halfedges[iHalfedge]]) {
          halfedges.splice(iHalfedge, 1);
        }
      }

      // Insert any border edges as necessary.
      iHalfedge = 0, nHalfedges = halfedges.length;
      while (iHalfedge < nHalfedges) {
        end = cellHalfedgeEnd(cell, edges[halfedges[iHalfedge]]), endX = end[0], endY = end[1];
        start = cellHalfedgeStart(cell, edges[halfedges[++iHalfedge % nHalfedges]]), startX = start[0], startY = start[1];
        if (Math.abs(endX - startX) > epsilon || Math.abs(endY - startY) > epsilon) {
          halfedges.splice(iHalfedge, 0, edges.push(createBorderEdge(site, end,
              Math.abs(endX - x0) < epsilon && y1 - endY > epsilon ? [x0, Math.abs(startX - x0) < epsilon ? startY : y1]
              : Math.abs(endY - y1) < epsilon && x1 - endX > epsilon ? [Math.abs(startY - y1) < epsilon ? startX : x1, y1]
              : Math.abs(endX - x1) < epsilon && endY - y0 > epsilon ? [x1, Math.abs(startX - x1) < epsilon ? startY : y0]
              : Math.abs(endY - y0) < epsilon && endX - x0 > epsilon ? [Math.abs(startY - y0) < epsilon ? startX : x0, y0]
              : null)) - 1);
          ++nHalfedges;
        }
      }

      if (nHalfedges) cover = false;
    }
  }

  // If there weren’t any edges, have the closest site cover the extent.
  // It doesn’t matter which corner of the extent we measure!
  if (cover) {
    var dx, dy, d2, dc = Infinity;

    for (iCell = 0, cover = null; iCell < nCells; ++iCell) {
      if (cell = cells[iCell]) {
        site = cell.site;
        dx = site[0] - x0;
        dy = site[1] - y0;
        d2 = dx * dx + dy * dy;
        if (d2 < dc) dc = d2, cover = cell;
      }
    }

    if (cover) {
      var v00 = [x0, y0], v01 = [x0, y1], v11 = [x1, y1], v10 = [x1, y0];
      cover.halfedges.push(
        edges.push(createBorderEdge(site = cover.site, v00, v01)) - 1,
        edges.push(createBorderEdge(site, v01, v11)) - 1,
        edges.push(createBorderEdge(site, v11, v10)) - 1,
        edges.push(createBorderEdge(site, v10, v00)) - 1
      );
    }
  }

  // Lastly delete any cells with no edges; these were entirely clipped.
  for (iCell = 0; iCell < nCells; ++iCell) {
    if (cell = cells[iCell]) {
      if (!cell.halfedges.length) {
        delete cells[iCell];
      }
    }
  }
}

var circlePool = [];

var firstCircle;

function Circle() {
  RedBlackNode(this);
  this.x =
  this.y =
  this.arc =
  this.site =
  this.cy = null;
}

function attachCircle(arc) {
  var lArc = arc.P,
      rArc = arc.N;

  if (!lArc || !rArc) return;

  var lSite = lArc.site,
      cSite = arc.site,
      rSite = rArc.site;

  if (lSite === rSite) return;

  var bx = cSite[0],
      by = cSite[1],
      ax = lSite[0] - bx,
      ay = lSite[1] - by,
      cx = rSite[0] - bx,
      cy = rSite[1] - by;

  var d = 2 * (ax * cy - ay * cx);
  if (d >= -epsilon2) return;

  var ha = ax * ax + ay * ay,
      hc = cx * cx + cy * cy,
      x = (cy * ha - ay * hc) / d,
      y = (ax * hc - cx * ha) / d;

  var circle = circlePool.pop() || new Circle;
  circle.arc = arc;
  circle.site = cSite;
  circle.x = x + bx;
  circle.y = (circle.cy = y + by) + Math.sqrt(x * x + y * y); // y bottom

  arc.circle = circle;

  var before = null,
      node = circles._;

  while (node) {
    if (circle.y < node.y || (circle.y === node.y && circle.x <= node.x)) {
      if (node.L) node = node.L;
      else { before = node.P; break; }
    } else {
      if (node.R) node = node.R;
      else { before = node; break; }
    }
  }

  circles.insert(before, circle);
  if (!before) firstCircle = circle;
}

function detachCircle(arc) {
  var circle = arc.circle;
  if (circle) {
    if (!circle.P) firstCircle = circle.N;
    circles.remove(circle);
    circlePool.push(circle);
    RedBlackNode(circle);
    arc.circle = null;
  }
}

var beachPool = [];

function Beach() {
  RedBlackNode(this);
  this.edge =
  this.site =
  this.circle = null;
}

function createBeach(site) {
  var beach = beachPool.pop() || new Beach;
  beach.site = site;
  return beach;
}

function detachBeach(beach) {
  detachCircle(beach);
  beaches.remove(beach);
  beachPool.push(beach);
  RedBlackNode(beach);
}

function removeBeach(beach) {
  var circle = beach.circle,
      x = circle.x,
      y = circle.cy,
      vertex = [x, y],
      previous = beach.P,
      next = beach.N,
      disappearing = [beach];

  detachBeach(beach);

  var lArc = previous;
  while (lArc.circle
      && Math.abs(x - lArc.circle.x) < epsilon
      && Math.abs(y - lArc.circle.cy) < epsilon) {
    previous = lArc.P;
    disappearing.unshift(lArc);
    detachBeach(lArc);
    lArc = previous;
  }

  disappearing.unshift(lArc);
  detachCircle(lArc);

  var rArc = next;
  while (rArc.circle
      && Math.abs(x - rArc.circle.x) < epsilon
      && Math.abs(y - rArc.circle.cy) < epsilon) {
    next = rArc.N;
    disappearing.push(rArc);
    detachBeach(rArc);
    rArc = next;
  }

  disappearing.push(rArc);
  detachCircle(rArc);

  var nArcs = disappearing.length,
      iArc;
  for (iArc = 1; iArc < nArcs; ++iArc) {
    rArc = disappearing[iArc];
    lArc = disappearing[iArc - 1];
    setEdgeEnd(rArc.edge, lArc.site, rArc.site, vertex);
  }

  lArc = disappearing[0];
  rArc = disappearing[nArcs - 1];
  rArc.edge = createEdge(lArc.site, rArc.site, null, vertex);

  attachCircle(lArc);
  attachCircle(rArc);
}

function addBeach(site) {
  var x = site[0],
      directrix = site[1],
      lArc,
      rArc,
      dxl,
      dxr,
      node = beaches._;

  while (node) {
    dxl = leftBreakPoint(node, directrix) - x;
    if (dxl > epsilon) node = node.L; else {
      dxr = x - rightBreakPoint(node, directrix);
      if (dxr > epsilon) {
        if (!node.R) {
          lArc = node;
          break;
        }
        node = node.R;
      } else {
        if (dxl > -epsilon) {
          lArc = node.P;
          rArc = node;
        } else if (dxr > -epsilon) {
          lArc = node;
          rArc = node.N;
        } else {
          lArc = rArc = node;
        }
        break;
      }
    }
  }

  createCell(site);
  var newArc = createBeach(site);
  beaches.insert(lArc, newArc);

  if (!lArc && !rArc) return;

  if (lArc === rArc) {
    detachCircle(lArc);
    rArc = createBeach(lArc.site);
    beaches.insert(newArc, rArc);
    newArc.edge = rArc.edge = createEdge(lArc.site, newArc.site);
    attachCircle(lArc);
    attachCircle(rArc);
    return;
  }

  if (!rArc) { // && lArc
    newArc.edge = createEdge(lArc.site, newArc.site);
    return;
  }

  // else lArc !== rArc
  detachCircle(lArc);
  detachCircle(rArc);

  var lSite = lArc.site,
      ax = lSite[0],
      ay = lSite[1],
      bx = site[0] - ax,
      by = site[1] - ay,
      rSite = rArc.site,
      cx = rSite[0] - ax,
      cy = rSite[1] - ay,
      d = 2 * (bx * cy - by * cx),
      hb = bx * bx + by * by,
      hc = cx * cx + cy * cy,
      vertex = [(cy * hb - by * hc) / d + ax, (bx * hc - cx * hb) / d + ay];

  setEdgeEnd(rArc.edge, lSite, rSite, vertex);
  newArc.edge = createEdge(lSite, site, null, vertex);
  rArc.edge = createEdge(site, rSite, null, vertex);
  attachCircle(lArc);
  attachCircle(rArc);
}

function leftBreakPoint(arc, directrix) {
  var site = arc.site,
      rfocx = site[0],
      rfocy = site[1],
      pby2 = rfocy - directrix;

  if (!pby2) return rfocx;

  var lArc = arc.P;
  if (!lArc) return -Infinity;

  site = lArc.site;
  var lfocx = site[0],
      lfocy = site[1],
      plby2 = lfocy - directrix;

  if (!plby2) return lfocx;

  var hl = lfocx - rfocx,
      aby2 = 1 / pby2 - 1 / plby2,
      b = hl / plby2;

  if (aby2) return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;

  return (rfocx + lfocx) / 2;
}

function rightBreakPoint(arc, directrix) {
  var rArc = arc.N;
  if (rArc) return leftBreakPoint(rArc, directrix);
  var site = arc.site;
  return site[1] === directrix ? site[0] : Infinity;
}

var epsilon = 1e-6;
var epsilon2 = 1e-12;
var beaches;
var cells;
var circles;
var edges;

function triangleArea(a, b, c) {
  return (a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]);
}

function lexicographic(a, b) {
  return b[1] - a[1]
      || b[0] - a[0];
}

function Diagram(sites, extent) {
  var site = sites.sort(lexicographic).pop(),
      x,
      y,
      circle;

  edges = [];
  cells = new Array(sites.length);
  beaches = new RedBlackTree;
  circles = new RedBlackTree;

  while (true) {
    circle = firstCircle;
    if (site && (!circle || site[1] < circle.y || (site[1] === circle.y && site[0] < circle.x))) {
      if (site[0] !== x || site[1] !== y) {
        addBeach(site);
        x = site[0], y = site[1];
      }
      site = sites.pop();
    } else if (circle) {
      removeBeach(circle.arc);
    } else {
      break;
    }
  }

  sortCellHalfedges();

  if (extent) {
    var x0 = +extent[0][0],
        y0 = +extent[0][1],
        x1 = +extent[1][0],
        y1 = +extent[1][1];
    clipEdges(x0, y0, x1, y1);
    clipCells(x0, y0, x1, y1);
  }

  this.edges = edges;
  this.cells = cells;

  beaches =
  circles =
  edges =
  cells = null;
}

Diagram.prototype = {
  constructor: Diagram,

  polygons: function() {
    var edges = this.edges;

    return this.cells.map(function(cell) {
      var polygon = cell.halfedges.map(function(i) { return cellHalfedgeStart(cell, edges[i]); });
      polygon.data = cell.site.data;
      return polygon;
    });
  },

  triangles: function() {
    var triangles = [],
        edges = this.edges;

    this.cells.forEach(function(cell, i) {
      if (!(m = (halfedges = cell.halfedges).length)) return;
      var site = cell.site,
          halfedges,
          j = -1,
          m,
          s0,
          e1 = edges[halfedges[m - 1]],
          s1 = e1.left === site ? e1.right : e1.left;

      while (++j < m) {
        s0 = s1;
        e1 = edges[halfedges[j]];
        s1 = e1.left === site ? e1.right : e1.left;
        if (s0 && s1 && i < s0.index && i < s1.index && triangleArea(site, s0, s1) < 0) {
          triangles.push([site.data, s0.data, s1.data]);
        }
      }
    });

    return triangles;
  },

  links: function() {
    return this.edges.filter(function(edge) {
      return edge.right;
    }).map(function(edge) {
      return {
        source: edge.left.data,
        target: edge.right.data
      };
    });
  },

  find: function(x, y, radius) {
    var that = this, i0, i1 = that._found || 0, n = that.cells.length, cell;

    // Use the previously-found cell, or start with an arbitrary one.
    while (!(cell = that.cells[i1])) if (++i1 >= n) return null;
    var dx = x - cell.site[0], dy = y - cell.site[1], d2 = dx * dx + dy * dy;

    // Traverse the half-edges to find a closer cell, if any.
    do {
      cell = that.cells[i0 = i1], i1 = null;
      cell.halfedges.forEach(function(e) {
        var edge = that.edges[e], v = edge.left;
        if ((v === cell.site || !v) && !(v = edge.right)) return;
        var vx = x - v[0], vy = y - v[1], v2 = vx * vx + vy * vy;
        if (v2 < d2) d2 = v2, i1 = v.index;
      });
    } while (i1 !== null);

    that._found = i0;

    return radius == null || d2 <= radius * radius ? cell.site : null;
  }
};

function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}

Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x) {
    return x * this.k + this.x;
  },
  applyY: function(y) {
    return y * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x) {
    return (x - this.x) / this.k;
  },
  invertY: function(y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function(x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function(y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};

Transform.prototype;

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
// reference: https://en.wikipedia.org/wiki/Kernel_(statistics)
// reference: https://en.wikipedia.org/wiki/Kernel_density_estimation
const kernel = {
  epanechnikov: function (u) {
    return Math.abs(u) <= 1 ? 3 / 4 * (1 - u * u) : 0;
  },
  gaussian: function (u) {
    return 1 / Math.sqrt(2 * Math.PI) * Math.exp(-.5 * u * u);
  }
};

// reference: https://github.com/jasondavies/science.js/blob/master/src/stats/bandwidth.js
const kernelBandwidth = {
  // Bandwidth selectors for Gaussian kernels.
  nrd: function (x) {
    let iqr = quantile(x, 0.75) - quantile(x, 0.25);
    let h = iqr / 1.34;
    return 1.06 * Math.min(deviation(x), h) * Math.pow(x.length, -1 / 5);
  }
};

/**
 *
 * @param kernel: the kernel function, such as gaussian
 * @param X: list of bins
 * @param h: the bandwidth, either a numerical value given by the user or calculated using the function kernelBandwidth
 * @returns {Function}: the kernel density estimator
 */
function kernelDensityEstimator(kernel, X, h) {
  return function (V) {
    // console.log("Bandwidth is " + h);
    return X.map(x => [x, mean(V, v => kernel((x - v) / h)) / h]);
  };
}

/**
 * Kernel density estimation using Scott's rule for estimating bandwidth
 * @param {list} V: input values 
 * @param {list} X: points at which to evaluate the distribution 
 * reference: https://github.com/scipy/scipy/blob/master/scipy/stats/kde.py
 */
function kdeScott(V, X = undefined) {
  // assign x if undefined
  if (X === undefined) {
    X = linear().domain(extent(V)).nice().ticks(100); // using d3 scale linear to return evenly spaced ticks, but this may not always return 100 values
  }

  // whitening factor
  const scottsFactor = Math.pow(V.length, -0.2);
  const wFactor = 1 / deviation(V) / scottsFactor;
  const norm = Math.pow(2 * Math.PI, -0.5) * wFactor / V.length;
  return X.map(x => {
    let sum = 0;
    V.forEach(v => {
      sum += Math.exp(-Math.pow((v - x) * wFactor, 2) / 2); //Math.exp: e^x
    });
    return [x, sum * norm];
  });
}

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
// import {select, event} from "d3-selection";
// import transition from 'd3-transition';
class Tooltip {
  constructor(id, verbose = false, offsetX = 30, offsetY = -40, duration = 100) {
    this.id = id;
    this.verbose = verbose;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.duration = duration;
  }
  show(info) {
    if (this.verbose) console.log(info);
    this.edit(info);
    this.move();
    select("#" + this.id).style("display", "inline").transition().duration(this.duration).style("opacity", 1.0);
  }
  hide() {
    select("#" + this.id).transition().duration(this.duration).style("opacity", 0.0);
    this.edit("");
  }
  move(x = event.pageX, y = event.pageY) {
    if (this.verbose) {
      console.log(x);
      console.log(y);
    }
    x = x + this.offsetX; // TODO: get rid of the hard-coded adjustment
    y = y + this.offsetY < 0 ? 10 : y + this.offsetY;
    select("#" + this.id).style("left", `${x}px`).style("top", `${y}px`);
  }
  edit(info) {
    select("#" + this.id).html(info);
  }
}

var FileSaver_min = {exports: {}};

(function (module, exports) {
	(function(a,b){b();})(commonjsGlobal,function(){function b(a,b){return "undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Deprecated: Expected third argument to be a object"),b={autoBom:!b}),b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(a,b,c){var d=new XMLHttpRequest;d.open("GET",a),d.responseType="blob",d.onload=function(){g(d.response,b,c);},d.onerror=function(){console.error("could not download file");},d.send();}function d(a){var b=new XMLHttpRequest;b.open("HEAD",a,!1);try{b.send();}catch(a){}return 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"));}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),a.dispatchEvent(b);}}var f="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof commonjsGlobal&&commonjsGlobal.global===commonjsGlobal?commonjsGlobal:void 0,a=f.navigator&&/Macintosh/.test(navigator.userAgent)&&/AppleWebKit/.test(navigator.userAgent)&&!/Safari/.test(navigator.userAgent),g=f.saveAs||("object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype&&!a?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download",j.download=g,j.rel="noopener","string"==typeof b?(j.href=b,j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b),setTimeout(function(){i.revokeObjectURL(j.href);},4E4),setTimeout(function(){e(j);},0));}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download","string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else {var i=document.createElement("a");i.href=f,i.target="_blank",setTimeout(function(){e(i);});}}:function(b,d,e,g){if(g=g||open("","_blank"),g&&(g.document.title=g.document.body.innerText="downloading..."),"string"==typeof b)return c(b,d,e);var h="application/octet-stream"===b.type,i=/constructor/i.test(f.HTMLElement)||f.safari,j=/CriOS\/[\d]+/.test(navigator.userAgent);if((j||h&&i||a)&&"undefined"!=typeof FileReader){var k=new FileReader;k.onloadend=function(){var a=k.result;a=j?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"),g?g.location.href=a:location=a,g=null;},k.readAsDataURL(b);}else {var l=f.URL||f.webkitURL,m=l.createObjectURL(b);g?g.location=m:location.href=m,g=null,setTimeout(function(){l.revokeObjectURL(m);},4E4);}});f.saveAs=g.saveAs=g,(module.exports=g);});

	
} (FileSaver_min));

var FileSaver_minExports = FileSaver_min.exports;

/**
 * A function for parsing the CSS style sheet and including the style properties in the downloadable SVG.
 * @param dom
 * @returns {Element}
 */
function parseCssStyles(dom) {
  var used = "";
  var sheets = document.styleSheets;
  for (var i = 0; i < sheets.length; i++) {
    // TODO: walk through this block of code

    try {
      if (sheets[i].cssRules == null) continue;
      var rules = sheets[i].cssRules;
      for (var j = 0; j < rules.length; j++) {
        var rule = rules[j];
        if (typeof rule.style != "undefined") {
          var elems;
          // removing any selector text including svg element ID -- dom already selects for that
          var selector = rule.selectorText === undefined ? rule.selectorText : rule.selectorText.replace(`#${dom[0].id} `, "");
          //Some selectors won't work, and most of these don't matter.
          try {
            elems = $$1(dom).find(selector);
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

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
/**
 * Create a toolbar
 * This class uses a lot of jQuery for dom element manipulation
 */

class Toolbar {
  constructor(domId, tooltip = undefined, vertical = false) {
    $$1(`#${domId}`).show(); // if hidden

    // add a new bargroup div to domID with bootstrap button classes
    const btnClasses = vertical ? "btn-group-vertical btn-group-sm" : "btn-group btn-group-sm";
    this.bar = $$1("<div/>").addClass(btnClasses).appendTo(`#${domId}`);
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
  createDownloadSvgButton(id, svgId, outfileName, cloneId, icon = "fa-download") {
    this.createButton(id, icon);
    select(`#${id}`).on("click", () => {
      this.downloadSvg(svgId, outfileName, cloneId);
    }).on("mouseover", () => {
      this.tooltip.show("Download the plot");
    }).on("mouseout", () => {
      this.tooltip.hide();
    });
  }
  createResetButton(id, callback, icon = "fa-expand-arrows-alt") {
    this.createButton(id, icon);
    select(`#${id}`).on("click", callback).on("mouseover", () => {
      this.tooltip.show("Reset the scales");
    }).on("mouseout", () => {
      this.tooltip.hide();
    });
  }

  /**
   * create a button to the toolbar
   * @param id {String} the button's id
   * @param icon {String} a fontawesome icon class
   * Dependencies: Bootstrap, jQuery, Fontawesome
   */
  createButton(id, icon = "fa-download", hover = "need to define", callback = undefined) {
    const $button = $$1("<a/>").attr("id", id).addClass("btn btn-default btn-light btn-sm").appendTo(this.bar);
    if (icon.startsWith("fa-")) $$1("<i/>").addClass(`fa ${icon}`).appendTo($button);else {
      $button.text(icon);
    }
    this.buttons[id] = $button;
    if (id != "foo") {
      select(`#${id}`).on("click", () => {
        if (callback === undefined) alert("need to define the click event");else callback();
      }).on("mouseover", () => {
        this.tooltip.show(hover);
      }).on("mouseout", () => {
        this.tooltip.hide();
      });
    }
    return $button;
  }

  /**
   * attach a tooltip dom with the toolbar
   * @param tooltip {Tooltip}
   */
  attachTooltip(tooltip) {
    this.tooltip = tooltip;
  }

  /**
   * Download SVG obj
   * @param svgId {String} the SVG dom ID
   * @param fileName {String} the output file name
   * @param cloneId {String} the temporary dom ID to copy the SVG to
   * Dependencies: FileSaver
   */
  downloadSvg(svgId, fileName, cloneId) {
    console.log(svgId, fileName, cloneId);
    // let svgObj = $($($(`${"#" +svgId} svg`))[0]); // complicated jQuery to get to the SVG object
    let svgObj = $$1($$1($$1(`${"#" + svgId}`))[0]);
    let $svgCopy = svgObj.clone().attr("version", "1.1").attr("xmlns", "http://www.w3.org/2000/svg");

    // parse and add all the CSS styling used by the SVG
    let styles = parseCssStyles(svgObj.get());
    $svgCopy.prepend(styles);
    $$1("#" + cloneId).html("").hide(); // make sure the copyID is invisible
    let svgHtml = $$1(`#${cloneId}`).append($svgCopy).html();
    let svgBlob = new Blob([svgHtml], {
      type: "image/svg+xml"
    });
    FileSaver_minExports.saveAs(svgBlob, fileName); // this is a FileSaver function....

    // clear the temp download div
    $$1(`#${cloneId}`).html("").hide();
  }
}

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
/*
Input data structure: a list of data object with the following structure:
[
    {
        group: "group1"
        label: "dataset 1",
        values: [a list of numerical values]
     },
     {
        group: "group1"
        label: "dataset 2",
        values: [a list of numerical values]
     },
     {
        group: "group2"
        label: "dataset 3",
        values: [a list of numerical values]
     }
]
*/
class GroupedViolin {
  /**
   * constructor for GroupedViolin
   * @param data {List}: a list of objects with attributes: group: {String}, label: {String}, values: {List} of numerical values, size: integer, optional
   * @param groupInfo {Dictionary}: metadata of the group, indexed by group ID
   */
  constructor(data, groupInfo = {}) {
    this._sanityCheck(data);
    this.data = data;
    this.groupInfo = groupInfo;
    this.toolbar = undefined;
    this.tooltip = undefined;
    // re-organized this.data indexed by groups
    this.groups = nest().key(d => {
      if (d.group === undefined) throw "required attribute does not exist";
      return d.group;
    }).entries(this.data);
  }
  setYDomain(yDomain) {
    if (yDomain === undefined || 0 == yDomain.length) {
      let allV = [];
      this.data.forEach(d => allV = allV.concat(d.values));
      yDomain = extent(allV);
    }
    return yDomain;
  }

  /**
   * Rendering the grouped violin
   * @param {Object} dom: a D3 select object 
   * @param {Number} width 
   * @param {Number} height 
  * @param {Array} xDomain 
  * @param {Array} yDomain 
  * @param {Object} xAxisConfig 
  * @param {Object} subXAxisConfig 
  * @param {Object} yAxisConfig 
  * @param {Object} sizeAxisConfig
  * @param {Boolean} showWhisker 
  * @param {Boolean} showDivider 
  * @param {Boolean} showLegend 
  * @param {Boolean} showOutliers
  * @param {Integer} numPoints: min cutoff of data points to render data as a violin or data points
  * @param {String} vColor: violin color
  * @param {enum} kdeOption: default or kdeScott
  */
  render(dom, width = 500, height = 357, xDomain = undefined, yDomain = undefined, xAxisConfig = {
    show: true,
    angle: 30,
    paddingInner: 0.01,
    paddingOuter: 0.01,
    textAnchor: "start",
    adjustHeight: 0,
    showLabels: true,
    showTicks: true
  }, subXAxisConfig = {
    show: true,
    angle: 0,
    paddingInner: 0,
    paddingOuter: 0,
    sort: false,
    adjustHeight: 5
  }, yAxisConfig = {
    label: "Y label"
  }, sizeAxisConfig = {
    show: false,
    angle: 0,
    adjustHeight: undefined
  }, showWhisker = false, showDivider = false, showLegend = false, showOutliers = false, numPoints = 0,
  // shouldn't this be boolean?
  vColor = undefined, kdeOption = "kdeScott") {
    this.dom = dom;
    this.width = width;
    this.height = height;
    this.config = {
      // configs for axes
      x: xAxisConfig,
      subx: subXAxisConfig,
      y: yAxisConfig,
      size: sizeAxisConfig
    };
    // set the scales
    this.scale = {
      x: band().range([0, this.width]).domain(xDomain || this.groups.map(d => d.key)).paddingOuter(this.config.x.paddingOuter).paddingInner(this.config.x.paddingInner),
      subx: band(),
      y: linear().rangeRound([this.height, 0]).domain(this.setYDomain(yDomain)),
      z: linear() // this is the violin width, the domain and range are determined later individually for each violin
    };
    this.show = {
      whisker: showWhisker,
      outliers: showOutliers,
      divider: showDivider,
      legend: showLegend,
      points: numPoints
    };
    this.kdeOption = kdeOption;
    this.vColor = vColor;
    this.reset();
  }
  update() {
    // for each group, render its violins
    this.groups.forEach(g => {
      g.index = this.scale.x.domain().indexOf(g.key);
      let info = this.groupInfo[g.key]; // optional

      if (info !== undefined) {
        // renders group info such as p-value, group name
        this._renderGroupInfoText(info, g.key);
      }

      // define the sub X axis for the group's violins
      const getSubXDomain = () => {
        if (this.config.subx.sort) {
          g.values.sort((a, b) => {
            if (a.label < b.label) return -1;else if (a.label > b.label) return 1;
            return 0;
          });
        }
        return g.values.map(d => d.label);
      };
      this.scale.subx.domain(getSubXDomain()).range([this.scale.x(g.key), this.scale.x(g.key) + this.scale.x.bandwidth()]);

      // render each group's violins
      g.values.forEach(entry => {
        if (0 == entry.values.length) return; // no further rendering if this group has no entries
        entry.values = entry.values.sort(ascending$1);
        if (this.vColor !== undefined) entry.color = this.vColor; // specify the violins' colors
        g.dom = this._drawViolin(entry, g.index);
      });

      // if indicated, show the size of each entry
      if (this.config.size.show) this._renderSizeAxis(g);

      // if indicated, show the sub-x axis
      if (this.config.subx.show) this._renderSubXAxis(g);
    });
    this._renderXAxis();
    this._renderYAxis();

    // plot mouse events
    this.dom.on("mouseout", () => {
      if (this.tooltip !== undefined) this.tooltip.hide();
    });

    // add group dividers
    if (this.show.divider) this._addGroupDivider();

    // add color legend
    if (this.show.legend) this._addLegend();
  }
  addPlotTitle(dom, title) {
    let x = (this.scale.x.range()[1] - this.scale.x.range()[0] + 1) / 2;
    let y = this.scale.y.range()[1] - 10;
    dom.append("text").attr("class", "violin-title").attr("text-anchor", "middle").attr("transform", `translate(${x}, ${y})`).text(title);
  }

  /**
   * Create the tooltip object
   * @param domId {String} the tooltip's dom ID
   * @returns {Tooltip}
   */
  createTooltip(domId) {
    if ($$1(`#${domId}`).length == 0) $$1("<div/>").attr("id", domId).appendTo($$1("body"));
    this.tooltip = new Tooltip(domId);
    select(`#${domId}`).classed("violin-tooltip", true);
    return this.tooltip;
  }

  /**
   * Create the toolbar panel
   * @param domId {String} the toolbar's dom ID
   * @param tooltip {Tooltip}
   * @returns {Toolbar}
   */

  createToolbar(domId, tooltip) {
    if (tooltip === undefined) tooltip = this.createTooltip(domId);
    this.toolbar = new Toolbar(domId, tooltip);
    return this.toolbar;
  }

  /**
   * Add a brush to the plot
   * @param dom {D3} Dom element
   */
  addBrush(dom) {
    const theBrush = brush();
    theBrush.on("end", () => {
      this.zoom(dom, theBrush);
    });
    dom.append("g").attr("class", "brush").call(theBrush);
  }
  zoom(dom, theBrush) {
    let s = event.selection,
      idelTimeout,
      idelDelay = 350;
    if (theBrush === undefined) {
      this.reset();
    } else if (!s) {
      if (!idelTimeout) return idelTimeout = setTimeout(function () {
        idelTimeout = null;
      }, idelDelay);
      this.reset();
    } else {
      // reset the current scales' domains based on the brushed window
      this.scale.x.domain(this.scale.x.domain().filter((d, i) => {
        const lowBound = Math.floor(s[0][0] / this.scale.x.bandwidth());
        const upperBound = Math.floor(s[1][0] / this.scale.x.bandwidth());
        return i >= lowBound && i <= upperBound;
      })); // TODO: add comments

      const min = Math.floor(this.scale.y.invert(s[1][1]));
      const max = Math.floor(this.scale.y.invert(s[0][1]));
      this.scale.y.domain([min, max]); // todo: debug

      dom.select(".brush").call(theBrush.move, null);
    }

    // zoom
    let t = dom.transition().duration(750);
    dom.select(".axis--x").transition(t).call(this.xAxis);
    dom.select(".axis--y").transition(t).call(this.yAxis);
    this.groups.forEach(gg => {
      let group = gg.key;
      let entries = gg.values;

      // re-define the subx's range
      this.scale.subx.range([this.scale.x(group), this.scale.x(group) + this.scale.x.bandwidth()]);
      entries.forEach(entry => {
        if (0 == entry.values.length) return; // no further rendering if this group has no entries
        this.scale.x.domain().indexOf(group);

        // re-define the scale.z's range
        this.scale.z.range([this.scale.subx(entry.label), this.scale.subx(entry.label) + this.scale.subx.bandwidth()]);

        // re-render the violin
        const g = dom.select(`#violin${gg.index}-${entry.label}`);
        g.select(".violin").transition(t).attr("d", area().x0(d => this.scale.z(d[1])).x1(d => this.scale.z(-d[1])).y(d => this.scale.y(d[0])));

        // re-render the box plot
        // interquartile range
        const q1 = quantile(entry.values, 0.25);
        const q3 = quantile(entry.values, 0.75);
        const z = 0.1;
        g.select(".violin-ir").transition(t).attr("x", this.scale.z(-z)).attr("y", this.scale.y(q3)).attr("width", Math.abs(this.scale.z(-z) - this.scale.z(z))).attr("height", Math.abs(this.scale.y(q3) - this.scale.y(q1)));

        // the median line
        const med = median(entry.values);
        g.select(".violin-median").transition(t).attr("x1", this.scale.z(-z)).attr("x2", this.scale.z(z)).attr("y1", this.scale.y(med)).attr("y2", this.scale.y(med));
      });
    });
  }
  reset() {
    this.dom.selectAll("*").remove();
    this.update();
  }
  updateData(data, reset = false, showOutliers = true) {
    this.data = data;
    this.groups = nest().key(d => {
      if (d.group === undefined) throw "required attribute does not exist";
      return d.group;
    }).entries(this.data);
    this.updateYScale();
    this.updateXScale();
    this.show.outliers = showOutliers;
    if (reset) this.reset();
  }
  updateYScale(yLabel = undefined, yDomain = undefined, reset = false) {
    if (yLabel !== undefined) this.config.y.label = yLabel;
    this.scale.y = linear().rangeRound([this.height, 0]).domain(this.setYDomain(yDomain));
    if (reset) this.reset();
  }
  updateXScale(xDomain = undefined, reset = false) {
    this.scale.x = band().range([0, this.width]).domain(xDomain || this.groups.map(d => d.key)).paddingOuter(this.config.x.paddingOuter).paddingInner(this.config.x.paddingInner);
    if (reset) this.reset();
  }

  /**
   * render the violin and box plots
   * @param dom {D3 DOM}
   * @param entry {Object} with attrs: values, label
   * @param gIndex
   * @private
   */
  _drawViolin(entry, gIndex) {
    const resetZScale = zMax => {
      this.scale.z.domain([-zMax, zMax]).range([this.scale.subx(entry.label), this.scale.subx(entry.label) + this.scale.subx.bandwidth()]);
    };
    const vertices = this._generateVertices(entry.values, this.kdeOption);
    // visual rendering
    const violinG = this.dom.append("g").attr("id", `violin${gIndex}-${entry.label}`).attr("class", "violin-g").datum(entry);
    // violin plot and box can only be drawn when vertices exist and there are no NaN points
    if (entry.values.length > this.show.points && vertices.length && this._validVertices(vertices)) {
      // reset the z scale -- the violin width
      let zMax = max$1(vertices, d => Math.abs(d[1])); // find the abs(value) in vertices
      resetZScale(zMax);

      // statistics of entry.values
      const q1 = quantile(entry.values, 0.25);
      const q3 = quantile(entry.values, 0.75);
      const iqr = Math.abs(q3 - q1);
      const cutoff = extent(entry.values.filter(d => d <= q3 + iqr * 1.5));
      const upper = cutoff[1];
      const lower = cutoff[0];
      const med = median(entry.values);
      this._renderViolinShape(violinG, entry, vertices, med, gIndex % 2 == 0);
      if (entry.showBoxplot === undefined || entry.showBoxplot) this._renderBoxPlot(violinG, entry, lower, upper, q1, q3, med);
      // outliers
      if (this.show.outliers) {
        const outliers = entry.values.filter(d => d < lower || d > upper);
        this._renderDataDots(violinG, {
          values: outliers,
          color: entry.color
        }, 1);
      }
      if (entry.showPoints) {
        this._renderDataDots(violinG, entry, 1);
      }
    } else if (this.show.points > 0) {
      // define the z scale -- the violin width
      let zMax = max$1(entry.values, d => Math.abs(d)); // find the abs(value) in entry.values
      resetZScale(zMax);
      this._renderDataDots(violinG, entry, 1);
    }
    return violinG;
  }
  _renderViolinShape(g, entry, vertices, med, isEvenNumber, oddColor = "#94a8b8", evenColor = "#90c1c1") {
    let violin = area().x0(d => this.scale.z(entry.showHalfViolin == "left" ? 0 : d[1])).x1(d => this.scale.z(entry.showHalfViolin == "right" ? 0 : -d[1])).y(d => this.scale.y(d[0]));
    const getColor = () => {
      if (entry.color !== undefined) return entry.color;
      // alternate the odd and even colors, maybe we don't want this feature
      if (isEvenNumber) return evenColor;
      return oddColor;
    };
    const vPath = g.append("path").datum(vertices).attr("d", violin).classed("violin", true).style("fill", entry.fill ? entry.fill : getColor).style("stroke", entry.stroke ? entry.stroke : getColor);
    // mouse events
    g.on("mouseover", () => {
      vPath.classed("highlighted", true);
      // console.log(entry);
      if (this.tooltip === undefined) console.warn("GroupViolin Warning: tooltip not defined");else {
        this.tooltip.show(entry.group + "<br/>" + entry.label + "<br/>" + "Median: " + med.toPrecision(4) + "<br/>");
      }
    });
    g.on("mouseout", () => {
      vPath.classed("highlighted", false);
    });
  }
  _renderBoxPlot(g, entry, lower, upper, q1, q3, med) {
    // boxplot

    const z = this.scale.z.domain()[1] / 3;
    if (this.show.whisker) {
      // the upper and lower limits of entry.values

      g.append("line") // or dom?
      .classed("whisker", true).attr("x1", this.scale.z(0)).attr("x2", this.scale.z(0)).attr("y1", this.scale.y(upper)).attr("y2", this.scale.y(lower)).style("stroke", "#fff");
    }

    // interquartile range
    g.append("rect").attr("x", entry.showHalfViolin == "right" ? this.scale.z(0) : this.scale.z(-z)).attr("y", this.scale.y(q3)).attr("width", entry.showHalfViolin === undefined ? Math.abs(this.scale.z(-z) - this.scale.z(z)) : Math.abs(this.scale.z(0) - this.scale.z(z))).attr("height", Math.abs(this.scale.y(q3) - this.scale.y(q1))).style("fill", entry.altColor || "#555f66").style("stroke-width", 0.2);

    // median
    g.append("line") // the median line
    .attr("x1", entry.showHalfViolin == "right" ? this.scale.z(0) : this.scale.z(-z)).attr("x2", entry.showHalfViolin == "left" ? this.scale.z(0) : this.scale.z(z)).attr("y1", this.scale.y(med)).attr("y2", this.scale.y(med)).attr("class", "violin-median");
  }
  _renderDataDots(g, entry, r = 2) {
    const z = this.scale.z.domain()[1];
    const jitter = randomNormal(0, z / 4);
    g.append("g").attr("class", "violin-points").selectAll("circle").data(entry.values).enter().append("circle").attr("cx", () => {
      let x = this.scale.z(entry.showHalfViolin == "left" ? -Math.abs(jitter()) : Math.abs(jitter()));
      return x;
    }).attr("cy", d => this.scale.y(d)).attr("fill", entry.color).attr("r", r);
  }
  _sanityCheck(data) {
    const attr = ["group", "label", "values"];
    data.forEach(d => {
      attr.forEach(a => {
        if (d[a] === undefined) throw "GroupedViolin: input data error.";
      });
      // if (0 == d.values.length) throw "Violin: Input data error";
    });
  }
  _addGroupDivider() {
    const groups = this.scale.x.domain();
    const padding = Math.abs(this.scale.x(this.scale.x.domain()[1]) - this.scale.x(this.scale.x.domain()[0]) - this.scale.x.bandwidth());
    const getX = (g, i) => {
      if (i !== groups.length - 1) {
        return this.scale.x(g) + +this.scale.x.bandwidth() + padding / 2;
      } else {
        return 0;
      }
    };
    this.dom.selectAll(".vline").data(groups).enter().append("line").classed("vline", true).attr("x1", getX).attr("x2", getX).attr("y1", this.scale.y.range()[0]).attr("y2", this.scale.y.range()[1]).style("stroke-width", (g, i) => i != groups.length - 1 ? 1 : 0).style("stroke", "rgb(86,98,107)").style("opacity", 0.5);
  }
  _addLegend() {
    const legendG = this.dom.append("g").attr("id", "violinLegend").attr("transform", "translate(0, 0)");
    legendG.append("rect").attr("x", this.scale.x.range()[0]).attr("y", -35).attr("width", 60 * this.groups[0].values.length + 10).attr("height", 24).style("fill", "none").style("stroke", "silver");
    const legends = legendG.selectAll(".violin-legend").data(this.groups[0].values);
    const g = legends.enter().append("g").classed("violin-legend", true);
    const w = 10;
    g.append("rect").attr("x", (d, i) => 5 + 60 * i + this.scale.x.range()[0]).attr("y", -28).attr("width", w).attr("height", w).style("fill", d => d.color);
    g.append("text").attr("class", "violin-legend-text").text(d => d.label).attr("x", (d, i) => 17 + 60 * i + this.scale.x.range()[0]).attr("y", -20);
  }
  _renderGroupInfoText(info, group) {
    const groupInfoDom = this.dom.append("g");
    const groupLabels = groupInfoDom.selectAll(".violin-group-label").data(["pvalue"]);
    groupLabels.enter().append("text") // Code review: consider moving this part to the eQTL dashboard
    .attr("x", 0).attr("y", 0).attr("class", "violin-group-label").attr("text-anchor", "middle").attr("fill", d => {
      return d == "pvalue" && parseFloat(info[d]) <= parseFloat(info["pvalueThreshold"]) ? "orangered" : "SlateGray";
    }).attr("transform", () => {
      let x = this.scale.x(group) + this.scale.x.bandwidth() / 2;
      let y = this.scale.y(this.scale.y.domain()[0]) + 50; // todo: avoid hard-coded values
      return `translate(${x}, ${y})`;
    }).text(d => `${d}: ${parseFloat(parseFloat(info[d]).toPrecision(3)).toExponential()}`);
  }
  _renderXAxis() {
    let buffer = this.config.subx.show ? 55 : 0; // Code review: hard-coded values
    const config = this.config.x;
    if (config.show) {
      this.xAxis = config.direction == "top" ? axisTop(this.scale.x) : axisBottom(this.scale.x);
      if (config.hideLabels) {
        this.Axis = this.xAxis.tickFormat("");
      }
      if (config.hideTicks) {
        this.Axis = this.xAxis.tickSize(0);
      }
      this.dom.append("g").attr("class", "violin-x-axis axis--x").attr("transform", `translate(0, ${config.adjustHeight !== undefined ? config.adjustHeight : this.height + buffer})`).call(this.xAxis) // set tickFormat("") to show tick marks without text labels
      .selectAll("text").attr("text-anchor", config.textAnchor ? config.textAnchor : "start").attr("transform", `rotate(${config.angle}, 0, 10)`);
    }
  }
  _renderYAxis(reset = false) {
    // adds the y Axis
    let buffer = 5;
    this.yAxis = axisLeft(this.scale.y).tickValues(this.scale.y.ticks(5));
    if (reset) this.dom.select(".violin-y-axis").empty().remove();
    this.dom.append("g").attr("class", "violin-y-axis axis--y").attr("transform", `translate(-${buffer}, 0)`).call(this.yAxis);

    // adds the text label for the y axis
    this.dom.append("text").attr("class", "violin-axis-label").attr("text-anchor", "middle").attr("transform", `translate(-${buffer * 2 + select(".violin-y-axis").node().getBBox().width}, ${this.scale.y.range()[0] + (this.scale.y.range()[1] - this.scale.y.range()[0]) / 2}) rotate(-90)`).text(this.config.y.label);
  }
  _renderSizeAxis(g) {
    let sizeMapper = {};
    g.values.forEach(d => sizeMapper[d.label] = `(${d.size || d.values.length})`);
    const sizeScale = band().domain(g.values.map(d => {
      return d.label;
    })).rangeRound([this.scale.x(g.key), this.scale.x(g.key) + this.scale.x.bandwidth()]);
    let sizeAxis = axisBottom(sizeScale).tickFormat(d => {
      return sizeMapper[d];
    });
    const buffer = this.height + 18;
    const config = this.config.size;
    const sizeG = g.dom.append("g").attr("class", "violin-size-axis").attr("transform", `translate(0, ${config.adjustHeight || buffer})`).call(sizeAxis);
    if (config.angle > 0) {
      sizeG.selectAll("text").attr("text-anchor", "start").attr("transform", `rotate(${config.angle}, 2, 10)`);
    }
  }
  _renderSubXAxis(g) {
    const config = this.config.subx;
    const buffer = config.adjustHeight ? config.adjustHeight : 5;
    let subXAxis = axisBottom(this.scale.subx);
    if (config.hideTicks) {
      subXAxis = subXAxis.tickSize(0);
    }
    const subxG = g.dom.append("g").attr("class", "violin-sub-axis").attr("transform", `translate(0, ${this.height + buffer})`).call(subXAxis);
    if (config.angle > 0) {
      subxG.selectAll("text").attr("text-anchor", "start").attr("transform", `rotate(${config.angle}, 2, 10)`);
    }
  }

  /**
   * generate vertices for the violin
   * @param {List} values: object with attribute: values-- a list of numbers
   * @param {enum} kdeOption: default or kdeScott
   * @returns 
   */
  _generateVertices(values, kdeOption) {
    let kde = kernelDensityEstimator(kernel.gaussian, this.scale.y.ticks(100),
    // use up to 100 vertices along the Y axis (to create the violin path)
    kernelBandwidth.nrd(values) // estimate the bandwidth based on the data
    );
    const eDomain = extent(values); // get the max and min in values
    let vertices = kdeOption == "default" ? kde(values) : kdeScott(values);
    vertices = vertices.filter(d => {
      return d[0] >= eDomain[0] && d[0] <= eDomain[1];
    }); // filter the vertices that aren't in the values;
    return vertices;
  }
  _validVertices(vertices) {
    let vals = vertices.reduce((a, b) => a.concat(b), []);
    let invalidVertices = vals.filter(d => isNaN(d));
    return !invalidVertices.length;
  }
}

/* eslint-disable no-prototype-builtins */
/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */

function getGtexUrls() {
  const host = "https://gtexportal.org/api/v2/";
  const datasetId = "gtex_v8";
  return {
    // single-cell expression
    singleCellExpression: host + "expression/singleNucleusGeneExpression?datasetId=gtex_snrnaseq_pilot&gencodeId=",
    singleCellExpressionSummary: host + "expression/singleNucleusGeneExpressionSummary",
    // eqtl Dashboard specific
    dyneqtl: host + "association/dyneqtl",
    snp: host + "dataset/variant?snpId=",
    variantId: host + "dataset/variant?variantId=",
    // transcript, exon, junction expression specific
    exonExp: host + "expression/clusteredMedianExonExpression?gencodeId=",
    transcriptExp: host + "expression/clusteredMedianTranscriptExpression?gencodeId=",
    junctionExp: host + "expression/clusteredMedianJunctionExpression?gencodeId=",
    transcript: host + `reference/transcript?datasetId=${datasetId}&gencodeId=`,
    exon: host + `reference/exon?datasetId=${datasetId}&gencodeId=`,
    geneModel: host + "dataset/collapsedGeneModelExon?gencodeId=",
    geneModelUnfiltered: host + "dataset/fullCollapsedGeneModelExon?gencodeId=",
    // gene expression violin plot specific
    geneExp: host + "expression/geneExpression?gencodeId=",
    // gene expression heat map specific
    medGeneExp: host + "expression/clusteredMedianGeneExpression",
    // top expressed gene expression specific
    topInTissueFiltered: host + "expression/topExpressedGene?filterMtGene=true&tissueSiteDetailId=",
    topInTissue: host + "expression/topExpressedGene?&filterMtGene=false&tissueSiteDetailId=",
    geneId: host + "reference/gene?geneId=",
    // tissue menu specific
    tissue: host + "dataset/tissueSiteDetail",
    // local static files
    sample: "tmpSummaryData/gtex.Sample.csv",
    rnaseqCram: "tmpSummaryData/rnaseq_cram_files_v7_dbGaP_011516.txt",
    wgsCram: "tmpSummaryData/wgs_cram_files_v7_hg38_dbGaP_011516.txt",
    // additional dynamic QTL urls
    dynsqtl: host + "association/dynsqtl",
    // fireCloud
    fcBilling: "https://api.firecloud.org/api/profile/billing",
    fcWorkSpace: "https://api.firecloud.org/api/workspaces",
    fcPortalWorkSpace: "https://portal.firecloud.org/#workspaces"
  };
}

/**
 * parse GTEx dynqtl json
 * @param data {JSON} from GTEx dynamic QTL web services
 * @returns data {JSON} modified data
 * @private
 */
function parseDynQtl(json) {
  // check required json attributes
  ["data", "genotypes", "pValue", "pValueThreshold", "tissueSiteDetailId"].forEach(d => {
    // eslint-disable-next-line no-prototype-builtins
    if (!json.hasOwnProperty(d)) {
      console.error(json);
      throw "Parse Error: Required json attribute is missing: " + d;
    }
  });
  json.expression_values = json.data.map(d => parseFloat(d));
  json.genotypes = json.genotypes.map(d => parseFloat(d));
  json.homoRefExp = json.expression_values.filter((d, i) => {
    return json.genotypes[i] == 0;
  });
  json.homoAltExp = json.expression_values.filter((d, i) => {
    return json.genotypes[i] == 2;
  });
  json.heteroExp = json.expression_values.filter((d, i) => {
    return json.genotypes[i] == 1;
  });

  // generate genotype text labels
  let ref = json.variantId.split(/_/)[2];
  let alt = json.variantId.split(/_/)[3];
  json.het = ref + alt;
  json.ref = ref + ref;
  json.alt = alt + alt;
  return json;
}

/**
 * Parse the genes from GTEx web service
 * @param data {Json}
 * @returns {List} of genes
 */
function parseGenes(data, single = false, geneId = null) {
  if (data.length == 0) {
    alert("No gene is found");
    throw "Fatal Error: gene(s) not found";
  }
  if (single) {
    if (geneId === null) throw "Please provide a gene ID for search results validation";
    if (data.length > 1) {
      // when a single gene ID has multiple matches
      let filtered = data.filter(g => {
        return g.geneSymbolUpper == geneId.toUpperCase() || g.gencodeId == geneId.toUpperCase();
      });
      if (filtered.length > 1) {
        alert("Fatal Error: input gene ID is not unique.");
        throw "Fatal Error: input gene ID is not unique.";
      } else if (filtered.length == 0) {
        alert("No gene is found with " + geneId);
        throw "Fatal Error: gene not found";
      } else {
        data = filtered;
      }
    }
    return data[0];
  } else return data;
}

/**
 * Parse the tissues
 * @param data {Json}
 * @returns {List} of tissues
 */
function parseTissues(json) {
  // sanity check
  ["tissueSiteDetailId", "tissueSiteDetail", "colorHex"].forEach(d => {
    if (!json[0].hasOwnProperty(d)) throw "Parsing Error: required json attr is missing: " + d;
  });
  return json;
}

/**
 * Parse the tissues and return a lookup table indexed by tissueSiteDetailId
 * @param json from web service tissueSiteDetail
 * @returns {*}
 */
function parseTissueDict(json) {
  // const attr = "tissueInfo";
  // if(!json.hasOwnProperty(attr)) throw "Parsing Error: required json attr is missing: " + attr;
  // const tissues = json[attr];
  // TODO: It's a bug in the web service that the json object is not wrapped in a key
  const tissues = json;
  // sanity check
  ["tissueSiteDetailId", "tissueSiteDetail", "colorHex"].forEach(d => {
    if (!tissues[0].hasOwnProperty(d)) throw "Parsing Error: required json attr is missing: " + d;
  });
  return tissues.reduce((arr, d) => {
    arr[d.tissueSiteDetailId] = d;
    return arr;
  }, {});
}

/**
 * Parse the tissue groups
 * @param data {Json}
 * @param forEqtl {Boolean} restrict to eqtl tissues
 * @returns {Dictionary} of lists of tissues indexed by the tissue group name
 */
function parseTissueSites(data, forEqtl = false) {
  // the list of invalid eqtl tissues due to sample size < 70
  // a hard-coded list because the sample size is not easy to retrieve

  let tissues = data;
  const invalidTissues = tissues.filter(t => t.rnaSeqAndGenotypeSampleCount <= 70).map(t => t.tissueSiteDetailId); //["Bladder", "Cervix_Ectocervix", "Cervix_Endocervix", "Fallopian_Tube", "Kidney_Medulla"];

  ["tissueSite", "tissueSiteDetailId", "tissueSiteDetail"].forEach(d => {
    if (!tissues[0].hasOwnProperty(d)) throw `parseTissueSites attr error. ${d} is not found`;
  });
  tissues = forEqtl == false ? tissues : tissues.filter(d => {
    return !invalidTissues.includes(d.tissueSiteDetailId);
  }); // an array of tissueSiteDetailId objects

  // build the tissueGroups lookup dictionary indexed by the tissue group name (i.e. the tissue main site name)
  let tissueGroups = tissues.reduce((arr, d) => {
    let groupName = d.tissueSite;
    let site = {
      id: d.tissueSiteDetailId,
      name: d.tissueSiteDetail
    };
    if (!arr.hasOwnProperty(groupName)) arr[groupName] = []; // initiate an array
    arr[groupName].push(site);
    return arr;
  }, {});

  // modify the tissue groups that have only a single site
  // by replacing the group's name with the single site's name -- resulting a better Alphabetical order of the tissue groups

  Object.keys(tissueGroups).forEach(d => {
    if (tissueGroups[d].length == 1) {
      // a single-site group
      let site = tissueGroups[d][0]; // the single site
      delete tissueGroups[d]; // remove the old group in the dictionary
      tissueGroups[site.name] = [site]; // create a new group with the site's name
    }
  });
  return tissueGroups;
}

/**
 * parse the exons
 * @param data {Json}
 * @param full {Boolean}
 * @returns {List} of exons
 */
function parseModelExons(json) {
  //const attr = full?"fullCollapsedGeneModelExon":"collapsedGeneModelExon";
  /*if(!json.hasOwnProperty(attr)){
      console.error(json);
      throw "Parsing Error: Required json attribute is missing: " + attr;
  }*/
  // sanity check
  ["start", "end"].forEach(d => {
    if (!json[0].hasOwnProperty(d)) throw "Parsing Error: Required json attribute is missing: " + d;
  });
  return json.map(d => {
    d.chromStart = d.start;
    d.chromEnd = d.end;
    return d;
  });
}

/**
 * parse the junctions
 * @param data
 * @returns {List} of junctions
 * // junction annotations are not stored in Mongo
    // so here we use the junction expression web service to parse the junction ID for its genomic location
    // assuming that each tissue has the same junctions,
    // to grab all the known junctions of a gene, we only need to query one tissue
    // here we arbitrarily pick Liver.
 */
function parseJunctions(json) {
  const attr = "medianJunctionExpression";
  if (!json.hasOwnProperty(attr)) throw "Parsing Error: parseJunctions input error. " + attr;
  if (json[attr].length == 0) {
    console.warn("There is no junction entry");
    return [];
  }
  // check required json attributes
  ["tissueSiteDetailId", "junctionId"].forEach(d => {
    // use the first element in the json objects as a test case
    if (!json[attr][0].hasOwnProperty(d)) {
      console.error(json[0]);
      throw "Parsing Error: required junction attribute is missing: " + d;
    }
  });
  return json[attr].filter(d => d.tissueSiteDetailId == "Liver").map(d => {
    let pos = d.junctionId.split("_");
    return {
      chrom: pos[0],
      chromStart: pos[1],
      chromEnd: pos[2],
      junctionId: d.junctionId
    };
  });
}

/**
 * parse transcript isoforms from the GTEx web service: 'reference/transcript?release=v7&gencode_id='
 * @param data {Json}
 * returns a dictionary of transcript exon object lists indexed by transcript IDs -- ENST IDs
 */
function parseExons(json) {
  //const attr = "exon";
  //if(!json.hasOwnProperty(attr)) throw "Parsing Error: required json attribute is missing: exon";
  return json.reduce((a, d) => {
    // check required attributes
    ["transcriptId", "chromosome", "start", "end", "exonNumber", "exonId"].forEach(k => {
      if (!d.hasOwnProperty(k)) {
        console.error(d);
        throw "Parsing Error: required json attribute is missing: " + k;
      }
    });
    if (a[d.transcriptId] === undefined) a[d.transcriptId] = [];
    d.chrom = d.chromosome;
    d.chromStart = d.start;
    d.chromEnd = d.end;
    a[d.transcriptId].push(d);
    return a;
  }, {});
}

/**
 * parse transcript isoforms
 * @param data {Json} from GTEx web service 'reference/transcript?release=v7&gencode_id='
 * returns a list of isoform objects sorted by length in descending order
 */
function parseTranscripts(json) {
  //const attr = "transcript";
  //if(!json.hasOwnProperty(attr)) throw("parseIsoforms input error");

  // check required attributes, use the first transcript as the test case
  ["transcriptId", "start", "end"].forEach(k => {
    if (!json[0].hasOwnProperty(k)) {
      throw "Parsing Error: required json attribute is missing: " + k;
    }
  });
  return json.sort((a, b) => {
    const l1 = Math.abs(a.end - a.start) + 1;
    const l2 = Math.abs(b.end - b.start) + 1;
    return -(l1 - l2); // sort by isoform length in descending order
  });
}

/**
 * parse final (masked) gene model exon expression
 * expression is normalized to reads per kb
 * @param data {JSON} of exon expression web service
 * @param exons {List} of exons with positions
 * @returns {List} of exon objects
 */
function parseExonExpression(data, exons) {
  const exonDict = exons.reduce((a, d) => {
    a[d.exonId] = d;
    return a;
  }, {});
  const attr = "medianExonExpression";
  if (!data.hasOwnProperty(attr)) throw "parseExonExpression input error";
  const exonObjects = data[attr];
  // error-checking
  ["median", "exonId", "tissueSiteDetailId"].forEach(d => {
    if (!exonObjects[0].hasOwnProperty(d)) throw "Fatal Error: parseExonExpression attr not found: " + d;
  });
  // parse GTEx median exon counts
  exonObjects.forEach(d => {
    const exon = exonDict[d.exonId]; // for retrieving exon positions
    // error-checking
    ["end", "start"].forEach(p => {
      if (!exon.hasOwnProperty(p)) throw "Fatal Error: parseExonExpression position attr not found: " + p;
    });
    d.l = exon.end - exon.start + 1;
    d.value = Number(d.median) / d.l;
    d.displayValue = Number(d.median) / d.l;
    d.x = d.exonId;
    d.y = d.tissueSiteDetailId;
    d.id = d.gencodeId;
    d.chromStart = exon.start;
    d.chromEnd = exon.end;
    d.unit = "median " + d.unit + " per base";
    d.tissueId = d.tissueSiteDetailId;
  });
  return exonObjects.sort((a, b) => {
    if (a.chromStart < b.chromStart) return -1;
    if (a.chromStart > b.chromStart) return 1;
    return 0;
  }); // sort by genomic location in ascending order
}

/**
 * Parse junction median read count data
 * @param data {JSON} of the junction expression web service
 * @returns {List} of junction objects
 */
function parseJunctionExpression(data) {
  const attr = "medianJunctionExpression";
  if (!data.hasOwnProperty(attr)) throw "parseJunctionExpression input error";
  const junctions = data[attr];

  // error-checking
  if (junctions === undefined || junctions.length == 0) {
    console.warn("No junction data found");
    return undefined;
  }

  // parse GTEx median junction read counts
  junctions.forEach(d => {
    ["tissueSiteDetailId", "junctionId", "median", "gencodeId"].forEach(k => {
      if (!d.hasOwnProperty(k)) {
        console.error(d);
        throw "Parsingr Error: parseJunctionExpression attr not found: " + k;
      }
    });
    let median = d.median;
    let tissueId = d.tissueSiteDetailId;
    d.tissueId = tissueId;
    d.id = d.gencodeId;
    d.x = d.junctionId;
    d.y = tissueId;
    d.value = Number(median);
    d.displayValue = Number(median);
  });

  // sort by genomic location in ascending order
  return junctions.sort((a, b) => {
    if (a.junctionId > b.junctionId) return 1;else if (a.junctionId < b.junctionId) return -1;
    return 0;
  });
}

/**
 * parse transcript expression
 * @param data
 * @returns {*}
 */
function parseTranscriptExpression(data) {
  const attr = "medianTranscriptExpression";
  if (!data.hasOwnProperty(attr)) throw "Parsing Error: parseTranscriptExpression input error";
  // parse GTEx isoform median TPM
  data[attr].forEach(d => {
    ["median", "transcriptId", "tissueSiteDetailId", "gencodeId"].forEach(k => {
      if (!d.hasOwnProperty(k)) {
        console.error(d);
        throw "Parsing Error: required transcipt attribute is missing: " + k;
      }
    });
    d.value = Number(d.median);
    d.displayValue = Number(d.median);
    d.x = d.transcriptId;
    d.y = d.tissueSiteDetailId;
    d.id = d.gencodeId;
    d.tissueId = d.tissueSiteDetailId;
  });
  return data[attr];
}

/**
 * parse transcript expression, and transpose the matrix
 * @param data
 * @returns {*}
 */
function parseTranscriptExpressionTranspose(data) {
  const attr = "medianTranscriptExpression";
  if (!data.hasOwnProperty(attr)) {
    console.error(data);
    throw "Parsing Error: parseTranscriptExpressionTranspose input error.";
  }
  // parse GTEx isoform median TPM
  data[attr].forEach(d => {
    ["median", "transcriptId", "tissueSiteDetailId", "gencodeId"].forEach(k => {
      if (!d.hasOwnProperty(k)) {
        console.error(d);
        throw "Parsing Error: Required transcript attribute is missing: " + k;
      }
    });
    const median = d.median;
    const tissueId = d.tissueSiteDetailId;
    d.value = Number(median);
    d.displayValue = Number(median);
    d.y = d.transcriptId;
    d.x = tissueId;
    d.id = d.gencodeId;
    d.tissueId = tissueId;
  });
  return data[attr];
}

/**
 * parse median gene expression
 * @param data {Json} with attr medianGeneExpression
 * @returns {*}
 */
function parseMedianExpression(data) {
  const attr = "medianGeneExpression";
  //if(!data.hasOwnProperty(attr)) throw "Parsing Error: required json attribute is missing: " + attr;
  // parse GTEx median gene expression
  // error-checking the required attributes:
  if (data[attr].length == 0) throw "parseMedianExpression finds no data.";
  ["median", "tissueSiteDetailId", "gencodeId"].forEach(d => {
    if (!data[attr][0].hasOwnProperty(d)) {
      console.error(data[attr][0]);
      throw `Parsing Error: required json attribute is missing: ${d}`;
    }
  });
  let results = data[attr];
  results.forEach(function (d) {
    d.value = Number(d.median);
    d.x = d.tissueSiteDetailId;
    d.y = d.gencodeId;
    d.displayValue = Number(d.median);
    d.id = d.gencodeId;
  });
  return results;
}

/**
 * parse the expression data of a gene for a grouped violin plot
 * @param data {JSON} from GTEx gene expression web service
 * @param colors {Dictionary} the violin color for genes
 */
function parseGeneExpressionForViolin(data, useLog = true, colors = undefined) {
  //const attr = "geneExpression";
  //if(!data.hasOwnProperty(attr)) throw "Parsing Error: required json attribute is missing: " + attr;
  data.forEach(d => {
    ["data", "tissueSiteDetailId", "geneSymbol", "gencodeId"].forEach(k => {
      if (!d.hasOwnProperty(k)) {
        console.error(d);
        throw "Parsing Error: required json attribute is missing: " + k;
      }
    });
    d.values = useLog ? d.data.map(dd => {
      return Math.log10(+dd + 1);
    }) : d.data;
    d.group = d.tissueSiteDetailId;
    d.label = d.geneSymbol;
    d.color = colors === undefined ? "#90c1c1" : colors[d.gencodeId];
  });
  return data;
}

async function RetrieveAllPaginatedData(BaseURL, pageSize = 250) {
  let result = [];
  let retrievedData;
  let pageNumber = 0;
  do {
    const requestURL = generateURL(BaseURL, pageNumber, pageSize);
    retrievedData = await fetch(requestURL).then(response => {
      return response.json();
    });
    result = result.concat(retrievedData.data);
    pageNumber += 1;
  } while (pageNumber < retrievedData.paging_info.numberOfPages);
  return result;
}
async function RetrieveOnePage(BaseURL, pageSize, pageNumber) {
  let result = [];
  let retrievedData;
  const requestURL = generateURL(BaseURL, pageNumber, pageSize);
  retrievedData = await fetch(requestURL).then(response => {
    return response.json();
  });
  result = result.concat(retrievedData.data);
  return result;
}
async function RetrieveNonPaginatedData(BaseURL) {
  let retrievedData = await fetch(BaseURL).then(response => {
    return response.json();
  });
  return retrievedData;
}
function generateURL(BaseURL, pageNumber, pageSize = 250) {
  let requestByPage;
  const pages = "page=" + pageNumber;
  if (BaseURL.includes("?")) {
    requestByPage = BaseURL + "&" + pages;
  } else {
    requestByPage = BaseURL + "?" + pages;
  }
  const size = "itemsPerPage=" + pageSize;
  requestByPage = requestByPage + "&" + size;
  return requestByPage;
}

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
// import $ from "jquery";

/**
 * Create the tissue (dataset) dropdown menu using select2
 * NOTE: if using this function, you will need to remove the jquery $ import from webpack,
 * and rely on jquery imported through a script tag on the index.html page.
 * This occurs for the Top Expressed Gene visualization.
 * 
 * @param domId {String} the dom ID of the menu
 * @param url {String} the tissue web service url
 * dependency: select2
 */
function createTissueMenu(domId, url = getGtexUrls().tissue) {
  RetrieveAllPaginatedData(url).then(function (results) {
    let tissues = parseTissues(results);
    tissues.forEach(d => {
      d.id = d.tissueSiteDetailId;
      d.text = d.tissueSiteDetail;
    });
    tissues.sort((a, b) => {
      if (a.tissueSiteDetail < b.tissueSiteDetail) return -1;
      if (a.tissueSiteDetail > b.tissueSiteDetail) return 1;
      return 0;
    });

    // external library dependency: select2
    $(`#${domId}`).select2({
      placeholder: "Select a data set",
      data: tissues
    });
  }).catch(function (err) {
    console.error(err);
  });
}

/**
 * Build the two-level checkbox-style tissue menu
 * dependencies: tissueGroup.css classes
 * @param groups {Dictionary} of lists of tissues indexed by the group name, this is created by gtexDataParser:parseTissueSites()
 * @param domId {String} <div> ID
 * @param forEqtl {Boolean}
 * @param checkAll {Boolean} Whether or not to start all options checked
 * @param sections {Integer} Number of sections to split menu into
 * Dependencies: jQuery, Bootstrap, tissueGroup.css
 * todo: add reset and select all options
 */
function createTissueGroupMenu(groups, domId, forEqtl = false, checkAll = false, sections = 4) {
  const mainClass = "tissue-group-main-level";
  const subClass = "tissue-group-sub-level";
  const lastSiteClass = "last-site";

  // erase everything in domId in case it isn't empty
  select(`#${domId}`).selectAll("*").remove();

  // add check all and reset options
  const $allTissueDiv = $("<div/>").attr("class", "col-xs-12 col-md-12").appendTo($(`#${domId}`));
  if (forEqtl) {
    $(`<label class=${mainClass}>` + "<input type=\"radio\" name=\"allTissues\" value=\"reset\"> Reset " + "</label><br/>").appendTo($allTissueDiv);
  } else {
    $(`<label class=${mainClass}>` + "<input type=\"radio\" name=\"allTissues\" value=\"all\"> All </label> " + `<label class=${mainClass}>` + "<input type=\"radio\" name=\"allTissues\" value=\"reset\"> Reset " + "</label><br/>").appendTo($allTissueDiv);
  }

  // check all or reset events
  $("input[name=\"allTissues\"]").change(function () {
    let val = $(this).val();
    switch (val) {
      case "all":
        {
          $(".tissueGroup").prop("checked", true);
          $(".tissueSubGroup").prop("checked", true);
          break;
        }
      case "reset":
        {
          $(".tissueGroup").prop("checked", false);
          $(".tissueSubGroup").prop("checked", false);
          break;
        }
      // do nothing
    }
  });

  // sort the tissue groups alphabetically
  let groupNames = Object.keys(groups).sort((a, b) => {
    // regular sorting, except that 'Brain' group will always be first
    if (a == "Brain") return -1;
    if (b == "Brain") return 1;
    if (a < b) return -1;
    if (a > b) return 1;
  });

  // determine the total number of rows (main tissue sites and subsites)
  let rows = Object.keys(groups).reduce((a, b) => {
    if (groups[b].length > 1) return a + 1 + groups[b].length;else return a + groups[b].length;
  }, 0);
  let rowsPerSection = Math.ceil(rows / sections);
  let rowsRemain = rows % sections;

  // Bootstrap grid
  const bootstrapGrids = 12;
  let colSize = Math.floor(bootstrapGrids / sections); // for bootstrap grid
  const sectionDoms = range(0, sections).map(d => {
    return $(`<div id="section${d}" class="col-xs-12 col-md-${colSize}">`).appendTo($(`#${domId}`));
  });
  let counter = 0;
  let currSection = 0;
  groupNames.forEach(gname => {
    let sites = groups[gname]; // a list of site objects with attr: name and id
    const gId = gname.replace(/ /g, "_"); // replace the spaces with dashes to create a group <DOM> id
    // figure out which dom section to append this tissue site
    let groupLen = sites.length;
    groupLen = groupLen == 1 ? groupLen : groupLen + 1; // +1 to account for site name
    // move to new section if enough rows are in the current section
    if (counter != 0 && groupLen + counter > rowsPerSection + rowsRemain) {
      counter = 0;
      if (sectionDoms.length != currSection + 1) {
        currSection += 1;
      }
    }
    counter += groupLen;
    let $currentDom = sectionDoms[currSection];
    if ($currentDom === undefined) console.error(`${gname} has no defined session`);
    // create the <label> for the tissue group
    $(`<label class=${mainClass}>` + `<input type="checkbox" id="${gId}" class="tissueGroup"> ` + `<span>${gname}</span>` + "</label><br/>").appendTo($currentDom);

    // tissue sites in the group
    if (sites.length > 1) {
      // sort sites alphabetically
      sites.sort((a, b) => {
        if (a.id > b.id) return 1;
        if (a.id < b.id) return -1;
        return 0;
      }).forEach(function (site, i) {
        let $siteDom = $(`<label class=${subClass}>` + `<input type="checkbox" id="${site.id}" class="tissueSubGroup"> ` + `<span>${site.name}</span>` + "</label><br/>").appendTo($currentDom);
        if (i == sites.length - 1) $siteDom.addClass(lastSiteClass);
        $siteDom.click(function () {
          $("input[name=\"allTissues\"]").prop("checked", false);
        });
      });
    }

    // custom click event for the top-level tissues: toggle the check boxes
    $("#" + gId).click(function () {
      $("input[name=\"allTissues\"]").prop("checked", false);
      if ($("#" + gId).is(":checked")) {
        // when the group is checked, check all its tissues
        sites.forEach(function (site) {
          if ("id" == site.id) return;
          $("#" + site.id).prop("checked", true);
        });
      } else {
        // when the group is unchecked, un-check all its tissues
        sites.forEach(function (site) {
          if ("id" == site.id) return;
          $("#" + site.id).prop("checked", false);
        });
      }
    });
  });
  if (checkAll) {
    $("input[name=\"allTissues\"][value=\"all\"]").prop("checked", true);
    $(".tissueGroup").prop("checked", true);
    $(".tissueSubGroup").prop("checked", true);
  }
}

/**
 * Parse the two-level checkbox-style tissue menu
 * @param groups {Dictionary} of lists of tissues indexed by the group name, this is created by gtexDataParser:parseTissueSites()
 * @param domId {String} <div> ID
 * @param useNames {Boolean} Whether to return tissue ids or tissue names
 * Dependencies: jQuery
 */
function parseTissueGroupMenu(groups, domId, useNames = false) {
  let queryTissues = [];
  $(`#${domId}`).find(":input").each(function () {
    // using jQuery to parse each input item
    if ($(this).is(":checked")) {
      // the jQuery way to fetch a checked tissue
      const id = $(this).attr("id");
      if ($(this).hasClass("tissueGroup")) {
        // this input item is a tissue group
        // check if this tissue group is a single-site group using the tissueGroups dictionary
        // if so, add the single site to the query list
        let groupName = id.replace(/_/g, " "); // first convert the ID back to group name
        if (groups[groupName].length == 1) {
          useNames ? queryTissues.push(groups[groupName][0].name) : queryTissues.push(groups[groupName][0].id);
        }
      } else {
        // this input item is a tissue site
        useNames ? queryTissues.push($($(this).siblings()[0]).text()) : queryTissues.push(id);
      }
    }
  });
  return queryTissues.filter(d => d !== undefined);
}

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */

/**
 * Build the eQTL Dashboard
 * Initiate the dashboard with a search form.
 * 1. Fetch and organize tissue sites into groups.
 * 2. Build the two-level tissue site menu.
 * 3. Bind the search function to the submit button.
 * ToDo: perhaps the dom elements in the form could be accessed without specifying the dom IDs?
 * @param dashboardId {String}: eQTL result <div> ID
 * @param menuId {String} tissue menu <div> ID
 * @param pairId {String} gene-variant <textarea> ID
 * @param submitId {String} form submit button <div> ID
 * @param formId {String} dashboard <form> ID
 * @param messageBoxId {String} message box <div> ID
 * @param urls {Dictionary} of GTEx web service URLs
 */
function build(dashboardId, menuId, pairId, submitId, formId, messageBoxId, urls = getGtexUrls()) {
  RetrieveAllPaginatedData(urls.tissue).then(function (data) {
    // retrieve all tissue (sub)sites
    const forEqtl = true;
    let tissueGroups = parseTissueSites(data, forEqtl);
    createTissueGroupMenu(tissueGroups, menuId, forEqtl);
    $(`#${submitId}`).click(_submit(tissueGroups, dashboardId, menuId, pairId, submitId, formId, messageBoxId, urls));
  }).catch(function (err) {
    console.error(err);
  });
}

/**
 *
 * @param gene {Object} with attr geneSymbol and gencodeId
 * @param variant {Object} with attr variantId and snpId
 * @param mainId {String} the main DIV id
 * @param input {Object} the violin data
 * @param info {Object} the metadata of the groups
 * @private
 */
function _visualize(gene, variant, mainId, input, info) {
  const id = {
    main: mainId,
    tooltip: "eqtlTooltip",
    toolbar: `${mainId}Toolbar`,
    clone: `${mainId}Clone`,
    chart: `${mainId}Chart`,
    svg: `${mainId}Svg`,
    buttons: {
      save: `${mainId}Save`
    }
  };

  // error-checking DOM elements
  if ($(`#${id.main}`).length == 0) throw "Violin Plot Error: the chart DOM doesn't exist";
  if ($(`#${id.tooltip}`).length == 0) $("<div/>").attr("id", id.tooltip).appendTo($("body"));

  // clear previously rendered plot if any
  select(`#${id.main}`).selectAll("*").remove();

  // build the dom elements
  ["toolbar", "chart", "clone"].forEach(d => {
    $("<div/>").attr("id", id[d]).appendTo($(`#${id.main}`));
  });

  // violin plot
  // TODO: code review on the layout, remove hard-coded values and customized code in GroupedViolin.js
  let margin = {
    left: 50,
    top: 50,
    right: 50,
    bottom: 100
  };
  let innerWidth = input.length * 40,
    // set at at least 50 because of the long tissue names
    width = innerWidth + (margin.left + margin.right);
  let innerHeight = 80,
    height = innerHeight + (margin.top + margin.bottom);
  let dom = select(`#${id.chart}`).append("svg").attr("width", width).attr("height", height).attr("id", id.svg).append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

  // render the violin
  let violin = new GroupedViolin(input, info);
  const tooltip = violin.createTooltip(id.tooltip);
  const toolbar = violin.createToolbar(id.toolbar, tooltip);
  toolbar.createDownloadSvgButton(id.buttons.save, id.svg, `${id.main}-save.svg`, id.clone);
  const configs = {
    x: {
      show: false,
      angle: 0,
      paddingInner: 0.01,
      paddingOuter: 0.01
    },
    subx: {
      show: true,
      angle: 0,
      paddingInner: 0,
      paddingOuter: 0,
      sort: false
    },
    y: {
      label: "Norm. Expression"
    },
    size: {
      show: true
    }
  };
  violin.render(dom, innerWidth, innerHeight, undefined, [-3, 3], configs.x, configs.subx, configs.y, configs.size, false, true, false, true, 10);

  // add violin title -- must add after the violin renders, or the violin code removes it
  dom.insert("text", ":first-child").classed("ed-section-title", true).text(`${gene.geneSymbol} (${gene.gencodeId}) and ${variant.snpId || ""} (${variant.variantId})`).attr("x", 0).attr("y", -margin.top + 16);
  _customizeViolinPlot(violin, dom);
  customizeTooltip(violin, gene, variant);
}
/**
 * Customization of the violin plot
 * @param plot {GroupedViolin}
 * @param dom {D3 DOM}
 */
function _customizeViolinPlot(plot, dom) {
  plot.groups.forEach(g => {
    // customize the long tissue name
    const gname = g.key;
    const names = gname.replace(/\(/, " - (").split(/\s*-\s*/);
    const customXlabel = dom.append("g");
    const customLabels = customXlabel.selectAll(".violin-group-label").data(names);
    customLabels.enter().append("text").attr("x", 0).attr("y", 0).attr("class", "violin-group-label").attr("transform", (d, i) => {
      let x = plot.scale.x(gname) + plot.scale.x.bandwidth() / 2;
      let y = plot.scale.y(plot.scale.y.domain()[0]) + 75 + 12 * i; // todo: avoid hard-coded values
      return `translate(${x}, ${y})`;
    }).text(d => d);
  });
  dom.selectAll(".violin-size-axis").classed("violin-size-axis-hide", true).classed("violin-size-axis", false);
}
function customizeTooltip(plot, gene, variant, dashBoard = true, tissue = undefined) {
  let geneSymbol = gene;
  let variantId = variant;
  if (dashBoard) {
    geneSymbol = gene.geneSymbol;
    variantId = variant.variantId;
  }
  plot.dom.selectAll(".violin-g").on("mouseover", (d, i, nodes) => {
    select(nodes[i]).classed("highlighted", true);
    const tooltipData = [`<span class="tooltip-key">Gene</span>: <span class="tooltip-value">${geneSymbol}</span>`, `<span class="tooltip-key">Variant</span>: <span class="tooltip-value">${variantId}</span>`, `<span class="tooltip-key">Tissue</span>: <span class="tooltip-value">${tissue == undefined ? d.group : tissue}</span>`, `<span class="tooltip-key">Genotype</span>: <span class="tooltip-value">${d.label}</span>`, `<span class="tooltip-key">Sample size</span>: <span class="tooltip-value">${d.size}</span>`, `<span class="tooltip-key">Median</span>: <span class="tooltip-value">${median(d.values).toPrecision(4)}</span>`];
    plot.tooltip.show(tooltipData.join("<br/>"));
  });
}

/**
 * Define the submit button's action
 * @param tissueGroups {Dictionary} of lists of tissues indexed by tissue groups
 * @param dashboardId {String} eQTL results <div> ID
 * @param menuId {String} tissue menu <div> ID
 * @param pairId {String} gene-variant <textarea> ID
 * @param submitId {String} submit button <div> ID
 * @param messageBoxId {String} message box <div> ID
 * @param urls {Dictionary} of GTEx web service URLs
 * @param max {Integer} max number of gene-variant entries. The default is set to 30.
 * @private
 * Dependencies: jQuery
 */
function _submit(tissueGroups, dashboardId, menuId, pairId, submitId, formId, messageBoxId, urls = getGtexUrls(), max = 30) {
  return function () {
    // clear the previous dashboard search results if any
    $(`#${dashboardId}`).html("");

    ////// validate tissue inputs and convert them to tissue IDs //////
    let queryTissueIds = parseTissueGroupMenu(tissueGroups, menuId);

    // tissue input error-checking
    if (queryTissueIds.length == 0) {
      alert("Must select at least one tissue.");
      throw "Input error";
    }

    ////// parse the gene-variant input list //////
    let pairs = $(`#${pairId}`).val().split("\n").filter(function (d) {
      return d != "";
    });
    if (pairs.length == 0) {
      alert("Must input at least one gene-variant pair.");
      throw "Input error";
    } else if (pairs.length > max) {
      $(`#${messageBoxId}`).append(`Your input has exceeded the maximum number of allowed entries. Only the first ${max} entries are processed.`);
      console.warn("User input has exceeded the maximum number of allowed entries.");
      pairs = pairs.slice(0, max);
    }

    ////// process each gene-variant pair //////

    // create a tissue name lookup table
    const tissueDict = {};
    Object.keys(tissueGroups).forEach(gname => {
      tissueGroups[gname].forEach(site => {
        tissueDict[site.id] = site.name;
      });
    });

    // for each gene-variant pair
    pairs.forEach(function (pair, i) {
      pair.replace(/ /g, ""); // remove all spaces
      let vid = pair.split(",")[1],
        gid = pair.split(",")[0];

      // retrieve gene and variant info from the web service
      const geneUrl = urls.geneId + gid;
      const variantUrl = vid.toLowerCase().startsWith("rs") ? urls.snp + vid : urls.variantId + vid;
      const promises = [RetrieveAllPaginatedData(geneUrl), RetrieveAllPaginatedData(variantUrl)];
      Promise.all(promises).then(function (args) {
        const gene = _parseGene(args[0], gid);
        const variant = _parseVariant(args[1]);
        if (gene === null) {
          const errorMessage = `Input Error: no gene found for ${gid}. <br/>`;
          $(`#${messageBoxId}`).append(errorMessage);
          throw errorMessage;
        }
        if (variant === null) {
          const errorMessage = `Input Error: no variant found for ${vid} <br/>`;
          $(`#${messageBoxId}`).append(errorMessage);
          throw errorMessage;
        }

        // calculate eQTLs and display the eQTL violin plots
        _renderEqtlPlot(tissueDict, dashboardId, gene, variant, queryTissueIds, i, urls);

        // hide the search form after the eQTL violin plots are reported
        $(`#${formId}`).removeClass("show"); // for bootstrap 4
        $(`#${formId}`).removeClass("in"); // for boostrap 3
      }).catch(function (err) {
        console.error(err);
      });
    });
  };
}

/**
 * Parse GTEx gene web service
 * @param gjson
 * @param id {String} the query gene ID
 * @returns {*} a gene object or null if not found
 * @private
 */
function _parseGene(gjson, id) {
  //const attr = "gene";
  //if(!gjson.hasOwnProperty(attr)) throw "Fatal Error: parse gene error";
  let genes = gjson.filter(d => {
    return d.geneSymbolUpper == id.toUpperCase() || d.gencodeId == id.toUpperCase();
  }); // find the exact match
  if (genes.length == 0) return null;
  return genes[0];
}

/**
 * Parse GTEx variant/snp web service
 * @param vjson
 * @returns {*} a variant object or null
 * @private
 */
function _parseVariant(vjson) {
  //const attr = "variant";
  //if(!vjson.hasOwnProperty(attr)) throw "Fatal Error: parse variant error";
  const variants = vjson;
  if (variants.length == 0) return null;
  return variants[0];
}

/**
 * calculate the eQTLs and fetch expression of genotypes for each gene-variant pair
 * @param tissuDict {Dictionary} tissue name lookup table, indexed by tissue IDs
 * @param dashboardId {String} the dashboard results <div> ID
 * @param gene {Object} a GTEx gene object
 * @param variant {Object} the GTEx variant object
 * @param tissues {List} of query tissue IDs
 * @param i {Integer} the boxplot DIV's index
 * @private
 */
function _renderEqtlPlot(tissueDict, dashboardId, gene, variant, tissues, i, urls = getGtexUrls()) {
  // display gene-variant pair names
  const id = `violinplot${i}`;
  $(`#${dashboardId}`).append(`<div id="${id}" class="col-sm-12"></div>`);

  // parse the genotypes from the variant ID
  let ref = variant.variantId.split(/_/)[2];
  let alt = variant.variantId.split(/_/)[3];
  const het = ref + alt;
  ref = ref + ref;
  alt = alt + alt;
  // d3-queue https://github.com/d3/d3-queue
  let promises = [];

  // queue up all tissue IDs
  tissues.forEach(tId => {
    let urlRoot = urls.dyneqtl;
    let url = `${urlRoot}?variantId=${variant.variantId}&gencodeId=${gene.gencodeId}&tissueSiteDetailId=${tId}`; // use variant ID, gencode ID and tissue ID to query the dyneqtl
    promises.push(_apiCall(url, tId));
  });
  Promise.all(promises).then(function (results) {
    let input = []; // a list of genotype expression objects
    let info = {};
    results.forEach(d => {
      if (d.status == "failed") {
        // if eQTLs aren't available for this query, create an empty space for the layout of the report
        let group = tissueDict[d.tissue]; // group refers to the tissue name, map tissue ID to tissue name
        // genotype expression data
        input = input.concat([{
          group: group,
          label: ref.length > 2 ? "ref" : ref,
          values: [0]
        }, {
          group: group,
          label: het.length > 2 ? "het" : het,
          values: [0]
        }, {
          group: group,
          label: alt.length > 2 ? "alt" : alt,
          values: [0]
        }]);
      } else {
        d = parseDynQtl(d); // reformat eQTL results d
        let group = tissueDict[d.tissueSiteDetailId]; // group is the tissue name, map tissue ID to tissue name

        input = input.concat([{
          group: group,
          label: ref.length > 2 ? "ref" : ref,
          size: d.homoRefExp.length,
          values: d.homoRefExp
        }, {
          group: group,
          label: het.length > 2 ? "het" : het,
          size: d.heteroExp.length,
          values: d.heteroExp
        }, {
          group: group,
          label: alt.length > 2 ? "alt" : alt,
          size: d.homoAltExp.length,
          values: d.homoAltExp
        }]);
        // additional info of the group goes here
        info[group] = {
          "pvalue": d["pValue"] === null ? 1 : parseFloat(d["pValue"]).toPrecision(3),
          "pvalueThreshold": d["pValueThreshold"] === null ? 0 : parseFloat(d["pValueThreshold"]).toPrecision(3)
        };
      }
    });
    _visualize(gene, variant, id, input, info);
  }).catch(function (err) {
    console.error(err);
  });
}
function _apiCall(url, tissue) {
  // reference: http://adampaxton.com/handling-multiple-javascript-promises-even-if-some-fail/
  return new Promise(function (resolve, reject) {
    RetrieveNonPaginatedData(url).then(function (request) {
      resolve(request);
    }).catch(function (err) {
      // report the tissue as failed
      console.error(err);
      const failed = {
        tissue: tissue,
        status: "failed"
      };
      resolve(failed);
    });
  });
}
var EqtlDashboard = {
  build: build
};

/**
 * Copyright © 2015 - 2019 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
function colorChart(shuffle = true) {
  // ref illustrator color themes
  const colors = ["rgb(100,118,120)", "rgb(101,141,145)", "rgb(103,126,82)", "rgb(103,184,222)", "rgb(108,110,88)", "rgb(108,147,128)", "rgb(119,144,182)", "rgb(126,130,122)", "rgb(133,173,186)", "rgb(137,114,91)", "rgb(145,170,157)", "rgb(145,201,232)", "rgb(147,105,66)", "rgb(159,114,116)", "rgb(159,188,191)", "rgb(159,229,194)", "rgb(163,163,171)", "rgb(164,207,190)", "rgb(172,108,130)", "rgb(173,84,114)", "rgb(174,195,222)", "rgb(176,204,153)", "rgb(179,180,150)", "rgb(180,220,237)", "rgb(183,202,121)", "rgb(192,202,85)", "rgb(193,191,193)", "rgb(195,97,136)", "rgb(199,121,102)", "rgb(207,202,76)", "rgb(209,219,189)", "rgb(213,251,255)", "rgb(215,94,56)", "rgb(218,114,126)", "rgb(223,90,73)", "rgb(224,247,217)", "rgb(227,205,164)", "rgb(228,168,185)", "rgb(230,176,152)", "rgb(232,212,175)", "rgb(239,201,76)", "rgb(240,124,108)", "rgb(246,232,177)", "rgb(249,228,173)", "rgb(252,245,191)", "rgb(255,188,103)", "rgb(45,94,110)", "rgb(51,153,204)", "rgb(60,124,145)", "rgb(62,87,145)", "rgb(65,115,120)", "rgb(89,216,229)", "rgb(94,178,153)", "rgb(95,124,134)"];
  if (shuffle) return shuffleColors(colors);
  return colors;
}
function shuffleColors(array) {
  // Fisher-Yates shuffle
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
  return array;
}

/**
 * get a color scheme by name
 * @param name {enum}: BuGn, OrRd....
 * @returns {*}: a continuous interpolator (used with d3.scaleSequential)
 */
function getColorInterpolator(name) {
  // reference: https://github.com/d3/d3-scale-chromatic/blob/master/README.md#sequential-multi-hue

  const interpolators = {
    BuGn: BuGn,
    OrRd: OrRd,
    PuBu: PuBu,
    YlGnBu: YlGnBu,
    Blues: Blues,
    Oranges: Oranges,
    Greens: Greens,
    Purples: Purples,
    Reds: Reds,
    Greys: Greys,
    Grays: Greys,
    // diverging color schemes
    RdBu: RdBu,
    RdGy: RdGy,
    PiYG: PiYG,
    PuOr: PuOr,
    RdYlBu: RdYlBu
  };
  // eslint-disable-next-line no-prototype-builtins
  if (!interpolators.hasOwnProperty(name)) {
    const err = "Unrecognized color: " + name;
    alert(err);
    throw err;
  }
  return interpolators[name];
}

/**
 * reference: https://github.com/d3/d3-scale
 * reference: http://bl.ocks.org/curran/3094b37e63b918bab0a06787e161607b
 * scaleSequential maps the continuous domain to a continuous color scale
 * @param data {List} of numerical data
 * @param colors {String} a color name that is available in getColorInterpolator()
 * @param dmin {Number} minimum domain value
 * @param dmax {Number} maximum domain value
 * @param reverse {Boolean} reverse the color scheme
 */
function setColorScale(data, colors = "YlGnBu", dmin = undefined, dmax = undefined, reverse = false) {
  data = data.filter(d => {
    return isFinite(d);
  });
  dmax = dmax === undefined ? max$1(data) : dmax;
  dmin = dmin === undefined ? min$1(data) : dmin;
  const scale = sequential(getColorInterpolator(colors));
  if (reverse) scale.domain([dmax, dmin]);else scale.domain([dmin, dmax]);
  return scale;
}

/**
 * Draw a color legend bar.
 * Dependencies: expressionMap.css
 * @param title {String}
 * @param dom {object} D3 dom object
 * @param scale {Object} D3 scale of the color
 * @param config {Object} with attr: x, y
 * @param useLog {Boolean}
 * @param ticks {Integer} number of ticks (one-sided)
 * @param base {Integer} log base
 * @param cell {Object} with attributes: h, w
 * @param orientation {enum} h or v, i.e. horizontal or vertical
 * @param diverging {Boolean} whether the color scheme is diverging
 * @param cell
 */
function drawColorLegend(title, dom, scale, config, useLog, ticks = 10, base = 10, cell = {
  h: 10,
  w: 40
}, orientation = "h", diverging = false) {
  let data = [];
  if (diverging) {
    let range = [...Array(ticks + 1).keys()];
    let interval = scale.domain()[1] / ticks;
    data = range.map(d => d * interval);
    data = data.concat(range.filter(d => d != 0).map(d => 0 - d * interval)).sort((a, b) => {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    });
  } else {
    let range = [...Array(ticks + 1).keys()];
    let interval = scale.domain()[1] / ticks;
    data = range.map(d => d * interval);
  }

  // legend groups
  const legends = dom.append("g").attr("transform", `translate(${config.x}, ${config.y})`).selectAll(".legend").data(data);
  const g = legends.enter().append("g").classed("legend", true);
  if (orientation == "h") {
    // legend title
    dom.append("text").attr("class", "color-legend").text(title).attr("x", -10).attr("text-anchor", "end").attr("y", cell.h).attr("transform", `translate(${config.x}, ${config.y})`);

    // the color legend
    g.append("rect").attr("x", (d, i) => cell.w * i).attr("y", 5).attr("width", cell.w).attr("height", cell.h).style("fill", scale);
    g.append("text").attr("class", "color-legend").text(d => useLog ? (Math.pow(base, d) - 1).toPrecision(2) : d.toPrecision(2)) // assuming that raw value had been adjusted by +1 to deal with log transforming zeros
    .attr("x", (d, i) => cell.w * i).attr("y", 0).style("font-size", 10);
  } else {
    // legend title
    dom.append("text").attr("class", "color-legend").text(title).attr("x", 5).attr("text-anchor", "start").attr("y", 0).attr("transform", `translate(${config.x}, ${config.y + cell.h * data.length})rotate(90)`);
    g.append("rect").attr("x", 0).attr("y", (d, i) => cell.h * i).attr("width", cell.w).attr("height", cell.h).style("fill", scale);
    g.append("text").attr("class", "color-legend").text(d => useLog ? (Math.pow(base, d) - 1).toPrecision(2) : d.toPrecision(2)).attr("x", 15).attr("y", (d, i) => cell.h * i + cell.h / 2);
  }
}

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
/**
 * TODO: code review of how to preset parameter values
 * review all the position calculations
 */
class DendroHeatmapConfig {
  /**
   * @param rootW {Number}, this width includes margin left and right, rowTreePanel width and heatmap width.
   * @param leftPanelW {Integer}, set to 0 if there's no left panel
   * @param topPanelH {Integer}, set to 0 if there's no top panel
   * @param margin {Object} with attr: top, right, bottom, left, smaller values than the default are not recommended for the heatmap, top margin should be at least 50
   * @param cellH {Integer}
   * @param adjust {Integer}, adjusted spacing between the heatmap and the dendrogram
   */
  constructor(rootW = window.innerWidth, leftPanelW = 100, topPanelH = 100, margin = {
    top: 50,
    right: 250,
    bottom: 170,
    left: 10
  }, cellH = 12, adjust = 10) {
    this.margin = margin;
    this.rootW = rootW;
    this.leftTreePanel = {
      // the row dendrogram panel
      x: margin.left,
      y: margin.top + topPanelH,
      h: undefined,
      // undefined initially, because it's data-dependent
      w: leftPanelW - adjust,
      id: "leftTree"
    };
    this.cell = {
      w: undefined,
      // to be calculated based on the data and rootW
      h: cellH
    };
    this.topTreePanel = {
      // the column dendrogram panel
      x: margin.left + leftPanelW,
      y: margin.top,
      h: topPanelH - adjust,
      w: this.rootW - (margin.left + leftPanelW + margin.right),
      // hard-coded values?
      id: "topTree"
    };
    this.heatmapPanel = {
      x: margin.left + leftPanelW,
      y: margin.top + topPanelH,
      h: this.leftTreePanel.h,
      w: this.topTreePanel.w,
      id: "heatmap"
    };
    this.legendPanel = {
      // the color legend panel
      x: margin.left + leftPanelW,
      y: 0,
      h: margin.top / 2,
      w: this.topTreePanel.w,
      cell: {
        w: 60
      },
      id: "legend"
    };
  }
  get() {
    return {
      margin: this.margin,
      cell: this.cell,
      w: this.rootW,
      h: this.margin.top + this.topTreePanel.h + this.legendPanel.h + this.margin.bottom,
      // initial height
      panels: {
        top: this.topTreePanel,
        left: this.leftTreePanel,
        main: this.heatmapPanel,
        legend: this.legendPanel
      }
    };
  }
}

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
/**
 * Creates an SVG
 * @param id {String} a DOM element ID that starts with a "#"
 * @param width {Numeric}
 * @param height {Numeric}
 * @param margin {Object} with two attributes: width and height
 * @return {Selection} the d3 selection object of the SVG
 */

function checkDomId$2(id) {
  // test input params
  if (select(`#${id}`).empty()) {
    let error = `Input Error: DOM ID ${id} is not found.`;
    //alert(error);
    console.warn(error);
    throw error;
  }
}

/**
 * Create a Canvas D3 object
 * @param id {String} the parent dom ID
 * @param width {Numeric}: the outer width
 * @param height {Numeric}: the outer height
 * @param margin {Object} with attr: left, top
 * @param canvasId {String}
 * @returns {*}
 */
function createCanvas(id, width, height, margin, canvasId = undefined, position = "absolute") {
  checkDomId$2(id);
  if (canvasId === undefined) canvasId = `${id}-canvas`;
  return select(`#${id}`).append("canvas").attr("id", canvasId).attr("width", width).attr("height", height).style("position", position); // TODO: should the position be user-defined? relative vs absolute
}

/**
 * Create an SVG D3 object
 * @param id {String} the parent dom ID
 * @param width {Numeric}: the outer width
 * @param height {Numeric}: the outer height
 * @param margin {Object} with attr: left, top
 * @param svgId {String}
 * @returns {*}
 */
function createSvg$1(id, width, height, margin, svgId = undefined) {
  checkDomId$2(id);
  if (svgId === undefined) svgId = `${id}-svg`;
  if (margin === undefined) margin = {
    top: 0,
    left: 0
  };
  return select("#" + id).append("svg").attr("width", width).attr("height", height).attr("id", svgId)
  // .style("position", position)
  .append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
}

// Copyright 2011 Jason Davies https://github.com/jasondavies/newick.js

function parseNewick(s) {
  var ancestors = [];
  var tree = {};
  var tokens = s.split(/\s*(;|\(|\)|,|:)\s*/);
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    var subtree = {};
    switch (token) {
      case "(":
        // new branchset
        tree.branchset = [subtree];
        ancestors.push(tree);
        tree = subtree;
        break;
      case ",":
        // another branch
        ancestors[ancestors.length - 1].branchset.push(subtree);
        tree = subtree;
        break;
      case ")":
        // optional name next
        tree = ancestors.pop();
        break;
      case ":":
        // optional length next
        break;
      default:
        var x = tokens[i - 1];
        if (x == ")" || x == "(" || x == ",") {
          tree.name = token;
        } else if (x == ":") {
          tree.length = parseFloat(token);
        }
    }
  }
  return tree;
}

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
/*
    Dendrogram visualizes a text-based Newick tree using D3 V5.

    dependencies:
    d3 v5
    the newick parser: newick.js

    references:
    https://github.com/d3/d3-hierarchy
    https://github.com/jasondavies/newick.js/

    notes on the underlying data structures:
    - it uses parseNewick() to convert the newick tree into the following json:
        {
            branchset:[child node json objects],
            name: "" // internal nodes would have no real labels
        }
       This json structure is the input data of d3.hierarchy()

    - In the d3.hierarchy(), the root node object has the following structure:
        {
            children: [co, co],
            data: {
                branchset: Array(2),
                name: "node name"
            },
            depth: 0,
            height: integer,
            parent: null,
            value: 9
        }
 */

class Dendrogram {
  constructor(newick, orientation = "h") {
    this.newick = newick;
    this.orientation = orientation;
    this.postorder = [];
    this.root = hierarchy(parseNewick(newick), d => d.branchset).sum(d => d.branchset ? 0 : 1).sort((a, b) => a.value - b.value || a.data.length - b.data.length);
    this.leaves = this.root.leaves().sort((a, b) => a.value - b.value || ascending$1(a.data.length, b.data.length));
    this.width = undefined;
    this.height = undefined;
    this.xScale = undefined;
    this.yScale = undefined;
  }
  draw(dom, width, height) {
    this.width = width;
    this.height = height;
    this._setXScale();
    this._setYScale();
    if ("h" == this.orientation) this._drawHTree(dom);else this._drawVTree(dom);
  }

  /////// private methods ///////

  _drawHTree(dom) {
    const setY = node => {
      if (node.children === undefined) {
        // a leaf node
        node.y = this.yScale(node.data.name);
      } else {
        // an internal node
        // the y coordinate of an internal node is the average y from its children
        node.y = node.children.reduce((sum, d) => sum + d.y, 0) / node.children.length;
      }
    };
    const setX = node => {
      node.x = this.xScale(this._getBranchLengthToRoot(node));
    };

    // from the leaf level -> root
    const nodes = this._sortNodesByLevel();
    nodes.forEach(node => {
      setX(node);
      setY(node);
    });
    dom.selectAll(".branch").data(nodes).enter().append("line").attr("x1", d => d.x).attr("x2", d => d.data.length ? d.x - this.xScale(d.data.length) : d.x).attr("y1", d => d.y + this.yScale.bandwidth() / 2).attr("y2", d => d.y + this.yScale.bandwidth() / 2).attr("stroke", "gray").attr("stroke-width", 1);

    // for all internal nodes
    const inodes = this.root.descendants().filter(d => d.height).sort((a, b) => b.height - a.height);
    dom.selectAll(".arm").data(inodes).enter().append("line").attr("x1", d => d.x).attr("x2", d => d.x).attr("y1", d => d.children[0].y + this.yScale.bandwidth() / 2).attr("y2", d => d.children[1].y + this.yScale.bandwidth() / 2).attr("stroke", "gray").attr("stroke-width", 1);
    dom.selectAll(".node").data(inodes).enter().append("circle").attr("cx", d => d.x).attr("cy", d => d.y + this.yScale.bandwidth() / 2).attr("r", 2).attr("fill", "#333").attr("opacity", 0.5).attr("class", "dendrogram-node").on("mouseover", function (d) {
      select(this).attr("r", 3);
      console.log(d.leaves());
    }).on("mouseout", function () {
      select(this).attr("r", 2);
    });

    // axis
    // Add the x Axis
    dom.append("g").attr("class", "dendrogram-axis").attr("transform", "translate(0," + this.height + ")").call(axisBottom(this.xScale).ticks(3)
    // .tickValues([Math.floor(this._getMaxBranchLength()/2), Math.floor(this._getMaxBranchLength())])
    );
  }
  _sortNodesByLevel() {
    // returns a list of nodes ordered by ancestral level, then by branch length
    return this.root.descendants().sort((a, b) => a.height - b.height || ascending$1(a.data.length, b.data.length));
  }
  _drawVTree(dom) {
    const setX = node => {
      if (node.children === undefined) {
        // a leaf node
        node.x = this.xScale(node.data.name);
      } else {
        // an internal node
        // the y coordinate of an internal node is the average y from its children
        node.x = node.children.reduce((sum, d) => sum + d.x, 0) / node.children.length;
      }
    };
    const setY = node => {
      node.y = this.yScale(this._getBranchLengthToRoot(node));
    };
    // from the leaf level -> root
    const nodes = this._sortNodesByLevel();
    nodes.forEach(node => {
      setX(node);
      setY(node);
    });
    dom.selectAll(".branch").data(nodes).enter().append("line").attr("y1", d => d.y).attr("y2", d => d.data.length ? d.y - this.yScale(d.data.length) : d.y).attr("x1", d => d.x + this.xScale.bandwidth() / 2).attr("x2", d => d.x + this.xScale.bandwidth() / 2).attr("stroke", "gray").attr("stroke-width", 1);

    // for all internal nodes
    const inodes = this.root.descendants().filter(d => d.height).sort((a, b) => b.height - a.height);
    dom.selectAll(".arm").data(inodes).enter().append("line").attr("y1", d => d.y).attr("y2", d => d.y).attr("x1", d => d.children[0].x + this.xScale.bandwidth() / 2).attr("x2", d => d.children[1].x + this.xScale.bandwidth() / 2).attr("stroke", "gray").attr("stroke-width", 1);
    dom.selectAll(".node").data(inodes).enter().append("circle").attr("cx", d => d.x + this.xScale.bandwidth() / 2).attr("cy", d => d.y).attr("r", 2).attr("fill", "#333").attr("opacity", 0.5).attr("class", "dendrogram-node").on("mouseover", function (d) {
      select(this).attr("r", 3);
      console.log(d.leaves());
    }).on("mouseout", function () {
      select(this).attr("r", 2);
    });

    // axis
    // Add the x Axis
    dom.append("g")
    // .attr("transform", `translate(${this.width}, 0)`)
    .attr("class", "dendrogram-axis").call(axisLeft(this.yScale).ticks(3)
    // .tickValues([Math.floor(this._getMaxBranchLength()/2), Math.floor(this._getMaxBranchLength())])
    );
  }
  _getBranchLengthToRoot(node) {
    // node: a d3.hierarchy node
    return node.path(this.root).reduce((sum, d) => d.data.length ? sum + d.data.length : sum, 0);
  }
  _getMaxBranchLength() {
    // the assumption here is that all leaf nodes have the same distance to the root.
    let node = this.leaves[0]; // randomly picks a leaf node
    return this._getBranchLengthToRoot(node);
  }
  _assignPostorder(node) {
    // assigns post-order of all leaf nodes
    if (node.children === undefined) {
      // base case
      this.postorder.push(node);
      return;
    } else {
      this._assignPostorder(node.children[0]);
      this._assignPostorder(node.children[1]);
      return;
    }
  }
  _setXScale() {
    if ("h" == this.orientation) {
      this.xScale = linear().domain([0, this._getMaxBranchLength()]).range([0, this.width]);
    } else {
      this._assignPostorder(this.root);
      this.xScale = band().domain(this.postorder.map(d => d.data.name)).range([0, this.width]).padding(.05);
    }
  }
  _setYScale() {
    if ("h" == this.orientation) {
      this._assignPostorder(this.root);
      this.yScale = band().domain(this.postorder.map(d => d.data.name)).range([0, this.height]).padding(.05);
    } else {
      this.yScale = linear().domain([0, this._getMaxBranchLength()]).range([0, this.height]);
    }
  }
}

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
class Heatmap {
  /**
   * constructor
   * @param data {List}, a list of objects with the following attributes: x: the x label, y: the y label
      value: the rendered numerical value (transformed)
      displayValue: display numerical value
   * @param useLog {Boolean} performs log transformation
   * @param colorScheme {String}: recognized terms in Colors:getColorInterpolator
   * @param r {Integer}: cell corner radius
   */
  constructor(data, useLog = true, logBase = 10, colorScheme = "YlGnBu", r = 2, tooltipId = "heatmapTooltip", tooltipCssClass = "heatmap-tooltip") {
    this.data = data;
    this.useLog = useLog;
    this.logBase = logBase;
    this.nullColor = "#e6e6e6"; // TODO: remove hard-coded value. make it a param.
    this.colorScale = undefined;
    this.xList = undefined;
    this.yList = undefined;
    this.xScale = undefined;
    this.yScale = undefined;
    this.r = r;
    this.colorScheme = colorScheme;

    // peripheral features
    /// Tooltip
    /// create the tooltip DIV
    if (select(`#${tooltipId}`).empty()) select("body").append("div").attr("id", tooltipId);
    this.tooltip = new Tooltip(tooltipId);
    select(`#${tooltipId}`).classed(tooltipCssClass, true);
    this.toolbar = undefined;
  }

  /**
   * Create the toolbar panel
   * @param domId {String} the toolbar's dom ID
   * @param tooltip {Tooltip}
   * @returns {Toolbar}
   */

  createToolbar(domId, tooltip) {
    this.toolbar = new Toolbar(domId, tooltip);
    return this.toolbar;
  }

  /**
   * draw color legend for the heat map
   * @param dom {Selection} a d3 selection object
   * @param legendConfig {Object} with attr: x, y
   */

  drawColorLegend(dom, legendConfig = {
    x: 0,
    y: 0
  }, ticks = 5) {
    drawColorLegend(this.data[0].unit || "Value", dom, this.colorScale, legendConfig, this.useLog, ticks, this.logBase);
  }

  /**
   * redraws the heatmap: when the xlist and ylist are changed, redraw the heatmap
   * @param dom {Selection} a d3 selection object
   * @param xList {List} a list of x labels
   * @param yList {List} a list of y labels
   * @param dimensions {Dictionary} {w:Integer, h:integer} with two attributes: w and h
   * @param angle {Integer} for the y text labels
   */
  redraw(dom, xList, yList, dimensions = {
    w: 1000,
    h: 1000
  }, angle = 30) {
    this._setXScale(dimensions.w, xList);
    this._setYScale(dimensions.h, yList);
    this.draw(dom, dimensions, angle);
  }

  /**
   * draws the heatmap
   * @param dom {Selection}
   * @param dimensions {Dictionary} {w:Integer, h:integer} of the heatmap
   * @param angle {Integer} for the y text labels
   * @param useNullColor {Boolean} whether to render null values with the pre-defined null color
   * @param ylabelPlacement {String} left or right
   */

  draw(dom, dimensions = {
    w: 1000,
    h: 600
  }, angle = 30, useNullColor = false, columnLabelPosAdjust = null, dmin = 0, ylabelPlacement = "right") {
    if (this.xList === undefined) this._setXScale(dimensions.w);
    if (this.yList === undefined) this._setYScale(dimensions.h);
    if (this.colorScale === undefined) this._setColorScale(dmin);

    // text labels
    //// data join
    const xLabels = dom.selectAll(".exp-map-xlabel").data(this.xList);

    //// update and transform
    const Y = columnLabelPosAdjust == null ? this.yScale.range()[1] + this.yScale.bandwidth() * 2 : this.yScale.range()[1] + columnLabelPosAdjust;
    const adjust = 5;
    xLabels.attr("transform", d => {
      let x = this.xScale(d) + adjust;
      let y = Y;
      return `translate(${x}, ${y}) rotate(${angle})`;
    });

    //// enters new elements
    xLabels.enter().append("text").attr("class", (d, i) => `exp-map-xlabel x${i}`).attr("x", 0).attr("y", 0).style("text-anchor", "start").style("cursor", "default").style("font-size", this.xScale.bandwidth() > 12 ? 12 : this.xScale.bandwidth()).attr("transform", d => {
      let x = this.xScale(d) + adjust;
      let y = Y;
      return `translate(${x}, ${y}) rotate(${angle})`;
    }).merge(xLabels).text(d => d);

    //// exit -- removes old elements as needed
    xLabels.exit().remove();
    dom.selectAll(".exp-map-ylabel").data(this.yList).enter().append("text").text(d => d).attr("x", ylabelPlacement == "left" ? this.xScale.range()[0] - 5 : this.xScale.range()[1] + 5).attr("y", d => this.yScale(d) + this.yScale.bandwidth() / 2).style("font-size", this.yScale.bandwidth()).attr("class", (d, i) => `exp-map-ylabel y${i}`).attr("text-anchor", ylabelPlacement == "left" ? "end" : "start").style("cursor", "default").on("click", d => {
      alert(`${d} is clicked. To be implemented`);
    }).on("mouseover", function () {
      select(this).classed("normal", false).classed("highlighted", true);
    }).on("mouseout", function () {
      select(this).classed("normal", true).classed("highlighted", false);
    });

    // renders the heatmap cells

    //// data join
    const cells = dom.selectAll(".exp-map-cell").data(this.data, d => d.value);

    //// update old elements
    cells.attr("x", d => this.xScale(d.x)).attr("y", d => this.yScale(d.y)).attr("row", d => `x${this.xList.indexOf(d.x)}`) // TODO: row should be y, column should be x...
    .attr("col", d => `y${this.yList.indexOf(d.y)}`);

    //// enter new elements
    const nullColor = "#ffffff";
    const self = this;
    cells.enter().append("rect").attr("row", d => `x${this.xList.indexOf(d.x)}`).attr("col", d => `y${this.yList.indexOf(d.y)}`).attr("x", d => this.xScale(d.x)).attr("y", d => this.yScale(d.y)).attr("rx", this.r).attr("ry", this.r).attr("class", "exp-map-cell").attr("width", this.xScale.bandwidth()).attr("height", this.yScale.bandwidth()).style("fill", "#eeeeee").on("mouseover", function (d) {
      const selected = select(this); // Note: "this" here refers to the dom element not the object
      self.cellMouseover(d, dom, selected);
    }).on("mouseout", function () {
      self.cellMouseout(dom);
    }).merge(cells).style("fill", d => {
      if (d.color) return d.color;
      if (useNullColor && d.value == 0) console.info(d);
      return useNullColor && (d.value == 0 || d.value === null || d.value === undefined) ? nullColor : this.useLog ? this.colorScale(this._log(d.value)) : this.colorScale(d.value);
    }) // TODO: what if null value isn"t 0?
    .style("stroke", d => {
      if (useNullColor && d.value == 0) return "lightgrey";
      if (d.stroke) return d.stroke;else return "none";
    }).style("stroke", d => {
      if (useNullColor && d.value == 0) return 1;
      if (d.stroke) return 1;else return 0;
    });

    //// exit and remove
    cells.exit().remove();
  }
  cellMouseout(dom) {
    dom.selectAll("*").classed("highlighted", false);
    this.tooltip.hide();
  }

  // note: this is often overriden by a custom visualization
  cellMouseover(d, dom, selected) {
    const rowClass = selected.attr("row");
    const colClass = selected.attr("col");
    dom.selectAll(".exp-map-xlabel").filter(`.${rowClass}`).classed("highlighted", true);
    dom.selectAll(".exp-map-ylabel").filter(`.${colClass}`).classed("highlighted", true);
    selected.classed("highlighted", true);
    const displayValue = d.displayValue === undefined ? parseFloat(d.value.toExponential()).toPrecision(4) : d.displayValue;
    this.tooltip.show(`Column: ${d.x} <br/> Row: ${d.y}<br/> Value: ${displayValue}`);
  }
  _setXScale(width, newList = undefined) {
    if (newList !== undefined) {
      this.xList = newList;
    } else {
      this.xList = nest().key(d => d.x).entries(this.data).map(d => d.key);
    }
    this.xScale = band().domain(this.xList).range([0, width]).padding(.05); // TODO: eliminate hard-coded value
  }
  _setYScale(height, newList) {
    if (newList !== undefined) {
      this.yList = newList;
    } else {
      this.yList = nest().key(d => d.y).entries(this.data).map(d => d.key);
    }
    this.yScale = band().domain(this.yList).range([0, height]).padding(.05); // TODO: eliminate hard-coded value
  }
  _setColorScale(min = 0) {
    let useLog = this.useLog;
    let data = this.data.map(d => useLog ? this._log(d.value) : d.value);
    this.colorScale = setColorScale(data, this.colorScheme, min);
  }
  _log(v) {
    const adjust = 1;
    return Math.log(Number(v + adjust)) / Math.log(this.logBase);
  }
}

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
class DendroHeatmap {
  /**
   * Constructor
   * @param columnTree {String} a newick tree
   * @param rowTree {String} a newick tree
   * @param heatmapData {List} of objects with attributes: x: String, y:String, value:Float, displayValue:Float
   * @param color {String} a color name that's available in Colors.getColorInterpolator
   * @param r {Integer} the degrees of rounded-corners of the heatmap cells
   * @param config {DendroHeatmapConfig}
   * @param useLog {Boolean}
   */
  constructor(columnTree, rowTree, heatmapData, color = "YlGnBu", r = 2, config = new DendroHeatmapConfig(), tooltipId = "dmapTooltip", useLog = true, base = 10, title = "") {
    this.config = config.get();
    //input evaluations
    columnTree = columnTree === undefined || columnTree.startsWith("Not enough data") ? undefined : columnTree;
    rowTree = rowTree === undefined || rowTree.startsWith("Not enough data") ? undefined : rowTree;
    // assign attribute values based on input arguments
    this.data = {
      columnTree: columnTree,
      rowTree: rowTree,
      heatmap: heatmapData,
      external: undefined
    };
    this.objects = {
      columnTree: this.data.columnTree === undefined ? undefined : new Dendrogram(this.data.columnTree, "v"),
      rowTree: this.data.rowTree === undefined ? undefined : new Dendrogram(this.data.rowTree, "h"),
      heatmap: new Heatmap(this.data.heatmap, useLog, base, color, r, tooltipId)
    };
    this.visualComponents = {
      svg: undefined,
      columnTree: undefined,
      rowTree: undefined
    };
    this.title = title;
    this.toolbar = undefined;
    this.tooltip = this.objects.heatmap.tooltip;
  }

  /**
   * Create the toolbar panel
   * @param domId {String} the toolbar's dom ID
   * @param tooltip {Tooltip}
   * @returns {Toolbar}
   */

  createToolbar(domId, tooltip) {
    this.toolbar = new Toolbar(domId, tooltip);
    return this.toolbar;
  }

  /**
   * Render the dendrograms and corresponding heatmap
   * @param domId {String} the parent DOM id of the SVG
   * @param svgId {String} of the SVG
   * @param showColumnTree {Boolean} render the column dendrogram
   * @param showRowTree {Boolean} render the row dendrogram
   * @param legendPos {Enum} where to place the color legend: bottom, top
   * @param ticks {Integer} number of bins of the color legend
   */
  render(domId, svgId, showColumnTree = true, showRowTree = true, legendPos = "top", ticks = 5) {
    this._updateConfig(legendPos);
    this.visualComponents.svg = createSvg$1(domId, this.config.w, this.config.h, this.config.margin, svgId);
    let xlist = undefined,
      ylist = undefined;
    if (showColumnTree && this.objects.columnTree !== undefined) {
      this.visualComponents.columnTree = this._renderTree("column", this.objects.columnTree, this.config.panels.top);
      xlist = this.objects.columnTree.xScale.domain();
    }
    if (showRowTree && this.objects.rowTree !== undefined) {
      this.visualComponents.rowTree = this._renderTree("row", this.objects.rowTree, this.config.panels.left);
      ylist = this.objects.rowTree.yScale.domain();
    }
    if (this.title != "") {
      select(`#${domId}-svg`).append("text").attr("x", 0).attr("y", 20).text(this.title);
    }
    this._renderHeatmap(this.objects.heatmap, xlist, ylist, ticks);
  }

  /**
   * Render a newick tree
   * @param direction {enum} column or row
   * @param tree {Dendrogram} a Dendrogram object
   * @param config {Object} a panel config with attributes: x, y, width and height
   * @private
   */
  _renderTree(direction, tree, config) {
    let svg = this.visualComponents.svg;
    const labelClass = direction == "row" ? ".exp-map-ylabel" : ".exp-map-xlabel";
    const g = svg.append("g").attr("id", config.id).attr("transform", `translate(${config.x}, ${config.y})`);
    tree.draw(g, config.w, config.h);
    const mouseout = function () {
      select(this).attr("r", 2).attr("fill", "#333");
      svg.selectAll(labelClass).classed("highlighted", false);
      svg.selectAll(".leaf-color").classed("highlighted", false);
    };
    const mouseover = function (d) {
      select(this).attr("r", 6).attr("fill", "red");
      let ids = d.leaves().map(node => node.data.name);
      svg.selectAll(labelClass).filter(label => ids.includes(label)).classed("highlighted", true);
      svg.selectAll(".leaf-color").filter(label => ids.includes(label)).classed("highlighted", true);
    };
    g.selectAll(".dendrogram-node").on("mouseover", mouseover).on("mouseout", mouseout);
    return g;
  }

  /**
   * Render the heatmap and color legend
   * @param heatmap {Heatmap} a Heatmap object
   * @param xList {List} a list of x labels
   * @param yList {List} a list of y labels
   * @param ticks {Integer} the number of bins in the color legend
   * @private
   */
  _renderHeatmap(heatmap, xList, yList, ticks = 5) {
    let dom = this.visualComponents.svg;
    const config = this.config.panels.main;
    const g = dom.append("g").attr("id", config.id).attr("transform", `translate(${config.x}, ${config.y})`);
    heatmap.redraw(g, xList, yList, {
      w: config.w,
      h: config.h
    });
    heatmap.drawColorLegend(dom, this.config.panels.legend, ticks);
  }

  /**
   * Adjust the layout dimensions based on the actual data
   * @param legendPos {String} bottom or top
   * @private
   */
  _updateConfig(legendPos) {
    const rows = this.objects.rowTree === undefined ? 1 : this.objects.rowTree.leaves.length;

    // updates the left panel's height based on the data
    this.config.panels.left.h = this.config.cell.h * rows < 20 ? 20 : this.config.cell.h * rows;
    this.config.h += this.config.panels.left.h;
    this.config.panels.main.h = this.config.panels.left.h;
    if (legendPos == "bottom") this.config.panels.legend.y += this.config.panels.main.h + this.config.panels.main.x + 50;
  }
}

/* eslint-disable no-prototype-builtins */
/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */

/**
 * Create the tissue (dataset) dropdown menu using select2
 * @param domId {String} the dom ID of the menu
 * @param url {String} the tissue web service url
 */
function createDatasetMenu(domId, url = getGtexUrls().tissue) {
  createTissueMenu(domId, url); // currently datasets only include GTEx tissues
}

/**
 * Render top expressed genes in a given tissue
 * @param tissueId
 * @param domId {String} the dendroheatmap's DIV ID
 * @param toolbarId {String} the tool bar DOM ID
 * @param infoId {String} the message box DOM ID
 * @param urls {Dictionary} of GTEx web services urls
 * @param filterGenes {Boolean} turn on the filter of special categories of genes (e.g. mitochondrial genes)
 */
function launchTopExpressed(tissueId, heatmapRootId, violinRootId, urls = getGtexUrls(), filterGenes = true) {
  // getting the top expressed genes in tissueId
  const url = filterGenes ? urls.topInTissueFiltered : urls.topInTissue;
  const $filterInfoDiv = $$1("#filterInfo").length == 0 ? $$1("<div/>").attr("id", "filterInfo").appendTo("#messageBox") : $$1("#filterInfo");
  if (filterGenes) $filterInfoDiv.html("Mitochondrial genes are excluded.<br/>");else $filterInfoDiv.html("Mitochondrial genes are included.<br/>");
  RetrieveOnePage(url + tissueId, 50, 0).then(function (results) {
    // top 50 expressed genes in tissueId
    const topGeneList = results.map(d => {
      if (!d.hasOwnProperty("gencodeId")) {
        console.error(d);
        throw "Parse Error: required json attribute is missing: gencodeId";
      }
      return d.gencodeId;
    });
    const callback = function () {
      _styleSelectedTissue(tissueId);
    };
    searchById(heatmapRootId, violinRootId, topGeneList, undefined, urls, filterGenes, callback, tissueId);
  }).catch(function (err) {
    console.error(err);
  });
}
function launch$3(formId, menuId, submitId, heatmapRootId, violinRootId, urls = getGtexUrls(), callback = undefined) {
  RetrieveAllPaginatedData(urls.tissue).then(function (data) {
    // retrieve all tissue (sub)sites
    const forEqtl = false;
    let tissueGroups = parseTissueSites(data, forEqtl);
    createTissueGroupMenu(tissueGroups, menuId);
    $$1(`#${submitId}`).click(function () {
      // if callback is provided
      if (callback !== undefined) callback();

      // hide the search form after the eQTL violin plots are reported
      $$1(`#${formId}`).removeClass("show"); // for bootstrap 4
      $$1(`#${formId}`).removeClass("in"); // for boostrap 3

      // get the input list of genes
      let glist = $$1("#genes").val().replace(/ /g, "").replace(/\n/g, "").toUpperCase().split(",").filter(d => d != "");
      if (glist.length == 0) {
        alert("Input Error: At least one gene must be provided.");
        throw "Gene input error";
      }
      // get the input tissue list
      let queryTissueIds = parseTissueGroupMenu(tissueGroups, menuId);
      // tissue input error-checking
      if (queryTissueIds.length == 0) {
        alert("Input Error: At least one tissue must be selected.");
        throw "Tissue input error";
      }

      // search
      ////////// NEXT //////////
      searchById(heatmapRootId, violinRootId, glist, queryTissueIds, urls);
    });
  }).catch(function (err) {
    console.error(err);
  });
}
/**
 * Search Gene Expression by ID
 * @param heatmapRootId {String}
 * @param violinRootId {String}
 * @param glist {List} of genes
 * @param tlist {List} of tissues
 * @param urls
 * @param filterGenes {Boolean} or undefined when it isn't applicable
 * @param callback
 * @param qTissue {String}: only applicable for the search of top expressed genes in the qTissue
 */
function searchById(heatmapRootId, violinRootId, glist, tlist = undefined, urls = getGtexUrls(), filterGenes = undefined, callback = undefined, qTissue = undefined) {
  $$1("#spinner").show();
  $$1(`#${heatmapRootId}`).empty(); // clear the root DOM content
  $$1(`#${violinRootId}`).empty(); // clear the root DOM content

  const MAX = 100;
  const $message = $$1("<div/><br/>").attr("class", "col-xs-12 col-md-12").css("color", "firebrick").appendTo(`#${heatmapRootId}`);
  let message = "";
  if (glist.length > MAX) {
    message = `Warning: Too many genes. Input list truncated to the first ${MAX}. <br/>`;
    glist = glist.slice(0, MAX);
  }
  const promises = [RetrieveAllPaginatedData(urls.tissue), RetrieveAllPaginatedData(urls.geneId + glist.join("&geneId="))];
  Promise.all(promises).then(function (args) {
    const tissues = parseTissues(args[0]);
    // genes
    const genes = parseGenes(args[1]);
    // error-checking
    message += _validateGenes$1(heatmapRootId, genes, glist);

    // get median expression data and clusters of the input genes in all tissues
    const gQuery = genes.map(g => g.gencodeId).join("&gencodeId=");
    const tQuery = tlist === undefined ? undefined : tlist.join("&tissueSiteDetailId=");
    const fetchUrl = tQuery === undefined ? urls.medGeneExp + "?gencodeId=" + gQuery : urls.medGeneExp + "?gencodeId=" + gQuery + "&tissueSiteDetailId=" + tQuery;
    RetrieveNonPaginatedData(fetchUrl).then(function (eData) {
      $$1("#spinner").hide();
      const dataMessage = _validateExpressionData(eData);
      if (dataMessage !== undefined) {
        $message.html(message + dataMessage);
      } else {
        $message.html(message);
        /***** render the DendroHeatmap *****/
        const expression = parseMedianExpression(eData); // the parser determines the orientations of the heatmap
        const ids = {
          root: heatmapRootId,
          violin: violinRootId,
          svg: `${heatmapRootId}-svg`,
          tooltip: "heatmapTooltip",
          toolbar: "heatmapToolbar",
          clone: "heatmapClone",
          buttons: {
            save: "heatmapSave",
            filter: "heatmapFilter",
            sort: "heatmapSortTissue",
            cluster: "heatmapClusterTissue"
          }
        };
        /***** build dom components *****/
        ["toolbar", "clone"].forEach(key => {
          $$1("<div/>").attr("id", ids[key]).appendTo($$1(`#${ids.root}`));
        });

        /***** heatmap rendering *****/
        const maxCellW = 25;
        const minCellW = 25;
        let cellW = tlist === undefined ? Math.ceil(window.innerWidth / tissues.length) : Math.ceil(window.innerWidth / tlist.length);
        cellW = cellW > maxCellW ? maxCellW : cellW < minCellW ? minCellW : cellW; // this ensures a reasonable cellW
        let dmapMargin = {
          top: 50,
          right: 250,
          bottom: 170,
          left: 10
        };
        let leftPanelW = 100;
        let rootW = tlist === undefined ? cellW * tissues.length + leftPanelW + dmapMargin.right + dmapMargin.left : cellW * tlist.length + leftPanelW + dmapMargin.right + dmapMargin.left;
        const config = new DendroHeatmapConfig(rootW, leftPanelW, 100, dmapMargin, 12, 10);
        const dmap = new DendroHeatmap(eData.clusters.tissue, eData.clusters.gene, expression, "YlGnBu", 2, config, ids.tooltip);
        if (genes.length < 3) {
          // too few genes to cluster
          dmap.render(ids.root, ids.svg, true, false);
        } else {
          dmap.render(ids.root, ids.svg);
        }

        // construct handy data lookup tables
        const tissueDict = tissues.reduce((a, d) => {
          if (!d.hasOwnProperty("tissueSiteDetailId")) throw "tissue has not attr tissueSiteDetailId";
          a[d.tissueSiteDetailId] = d;
          return a;
        }, {});
        const geneDict = dmap.data.heatmap.reduce((a, d) => {
          if (!d.hasOwnProperty("gencodeId")) throw "gene has no attr gencodeId";
          a[d.gencodeId] = {
            geneSymbol: d.geneSymbol,
            color: undefined
          };
          return a;
        }, {});

        /***** customization for GTEx expression heatmap *****/

        // change row and column labels
        // Change row labels to tissue names //
        select("#" + dmap.config.panels.main.id).selectAll(".exp-map-xlabel").text(d => tissueDict[d] === undefined ? d : tissueDict[d].tissueSiteDetail);
        select("#" + dmap.config.panels.main.id).selectAll(".exp-map-ylabel").text(d => geneDict[d] === undefined ? d : geneDict[d].geneSymbol);

        // Add tissue color boxes //
        _addTissueColors(dmap, tissueDict);

        // Add a toolbar
        _addToolBar(dmap, ids, tissueDict, urls, filterGenes, qTissue);

        // mouse events
        _customizeMouseEvents(dmap, tissueDict, geneDict, urls);
        if (callback != undefined) callback();
      }
    }).catch(function (err) {
      console.error(err);
    });
  }).catch(function (err) {
    console.error(err);
  });
}
function _validateExpressionData(data) {
  const attr = "medianGeneExpression";
  if (!data.hasOwnProperty(attr)) throw "expression data json format error.";
  if (data.length == 0) return "No expression data found.";
  return undefined;
}
function _validateGenes$1(domId, genes, input) {
  let message = "";
  if (genes.length == 0) message = "Fatal Error: the gene list is empty.<br/>";else {
    if (genes.length < input.length) {
      let allIds = [];
      genes.forEach(g => {
        // compile a list of all known IDs
        allIds.push(g.gencodeId);
        allIds.push(g.geneSymbolUpper);
      });
      let missingGenes = input.filter(g => !allIds.includes(g.toLowerCase()) && !allIds.includes(g.toUpperCase()));
      if (missingGenes.length > 0) message = `Warning: Not all genes are found: ${missingGenes.join(",")}<br/>`;
    }
  }
  return message;
}

/**
 * For top expressed query, highlight the query tissue label
 * @param tissueId {String} the tissue ID
 * Dependencies: expressMap.css
 */
function _styleSelectedTissue(tissueId) {
  selectAll(".exp-map-xlabel").filter(d => d == tissueId).classed("query", true);
}

/**
 * Adds GTEx tissue colors to the tissue labels (column names of the heatmap)
 * @param dmap {DendroHeatmap}
 * @param tissueDict {Dictionary} of GTEx tissue objects indexed by tissue_id
 */
function _addTissueColors(dmap, tissueDict) {
  const id = dmap.config.panels.main.id;
  const heatmap = dmap.objects.heatmap;
  let cells = select(`#${id}`).selectAll(".exp-map-xcolor").data(heatmap.xList);
  let leaves = select(`#${id}`).selectAll(".leaf-color").data(heatmap.xList);

  // update
  cells.attr("x", d => heatmap.xScale(d)).attr("y", heatmap.yScale.range()[1] + 5);
  leaves.attr("x", d => heatmap.xScale(d)).attr("y", heatmap.yScale.range()[0] - 10);

  // create new elements
  cells.enter().append("rect").attr("x", d => heatmap.xScale(d)).attr("y", heatmap.yScale.range()[1] + 5).attr("width", heatmap.xScale.bandwidth()).attr("height", heatmap.yScale.bandwidth() * 0.5).classed("exp-map-xcolor", true).merge(cells).style("fill", d => tissueDict[d] === undefined ? "#000000" : `#${tissueDict[d].colorHex}`);

  // exit and remove
  cells.exit().remove();
  if (dmap.objects.heatmap.yScale.domain().length > 15) {
    leaves.enter().append("rect").attr("x", d => heatmap.xScale(d)).attr("y", heatmap.yScale.range()[0] - 10).attr("width", heatmap.xScale.bandwidth()).attr("height", heatmap.yScale.bandwidth() * 0.5).classed("leaf-color", true).merge(leaves).style("fill", d => tissueDict[d] === undefined ? "#000000" : `#${tissueDict[d].colorHex}`);
    leaves.exit().remove();
  }
}

/**
 * Customize the dendropHeatmap mouse events
 * dependencies: CSS classes from expressMap.css
 * @param dmap {DendroHeatmap}
 * @param tissueDict {Dictionary}: tissue objects indexed by tissue_id, with attr: tissue_name
 * @param geneDict {Dictionary}: gene objects indexed by gencode ID, with attr: geneSymbol
 */
function _customizeMouseEvents(dmap, tissueDict, geneDict, urls = getGtexUrls()) {
  const svg = dmap.visualComponents.svg;
  const tooltip = dmap.tooltip;
  dmap.data.external = [];
  const cellMouseover = function (d) {
    const selected = select(this);
    dmap.objects.heatmap.cellMouseover(d, svg, selected); // call the default heatmap mouse over event first
    let tissue = tissueDict[d.x] === undefined ? d.x : tissueDict[d.x].tissueSiteDetail;
    let gene = geneDict[d.y] === undefined ? d.y : geneDict[d.y].geneSymbol;
    const tooltipData = [`<span class="tooltip-key">Tissue</span>: <span class="tooltip-value">${tissue}</span>`, `<span class="tooltip-key">Gene</span>: <span class="tooltip-value">${gene}</span>`, `<span class="tooltip-key">Median TPM</span>: <span class="tooltip-value">${parseFloat(d.displayValue.toExponential()).toPrecision(4)}</span>`];
    tooltip.show(tooltipData.join("<br/>"));
  };
  const cellMouseout = function () {
    svg.selectAll("*").classed("highlighted", false);
    tooltip.hide();
  };

  // gene boxplot prep: assign a colorIndex to each gene
  const colors = colorChart();
  keys(geneDict).forEach((d, i) => {
    geneDict[d].color = colors[i];
  });
  const ylabelClick = function (d) {
    let s = select(this);
    let action = "";

    // toggles click/unclick events
    // if the DOM has the class "clicked", then unclick it
    if (s.classed("clicked")) {
      s.classed("clicked", false);
      action = "delete";
    } else {
      // else click it
      // selectAll(".clicked").classed("clicked", false); // first clears all clicked labels if any
      s.classed("clicked", true); // click this DOM element
      action = "add";
    }
    _renderViolinPlot(action, d, geneDict, tissueDict, dmap, urls);
  };
  svg.selectAll(".exp-map-cell").on("mouseover", cellMouseover).on("mouseout", cellMouseout);
  svg.selectAll(".exp-map-ylabel").style("cursor", "pointer").on("click", ylabelClick);
}

/**
 * renders the gene expression violin plot
 * @param action {ENUM} add, new, or delete
 * @param gene {String} gencode ID
 * @param geneDict {Dictionary} gencode ID => gene object with attribute: index
 * @param tissueDict {Dictionary} tissue objects indexed by tissue ID
 * @param dmap {DendroHeatmap}
 */
function _renderViolinPlot(action, gene, geneDict, tissueDict, dmap, urls = getGtexUrls()) {
  // action
  switch (action) {
    case "delete":
      {
        dmap.data.external = dmap.data.external.filter(d => d.gencodeId != gene);
        _renderViolinHelper(dmap.data.external, dmap, tissueDict);
        break;
      }
    case "add":
      {
        const url = urls.geneExp + gene;
        const colors = {};
        colors[gene] = geneDict[gene].color;
        const tlist = dmap.objects.heatmap.xScale.domain();
        RetrieveAllPaginatedData(url).then(function (d) {
          if (dmap.data.external === undefined) dmap.data.external = [];
          dmap.data.external = dmap.data.external.concat(parseGeneExpressionForViolin(d, true, colors)).filter(d => {
            // filtering the tissues that aren't selected
            return tlist.indexOf(d.group) > -1;
          });
          _renderViolinHelper(dmap.data.external, dmap, tissueDict);
        }).catch(function (err) {
          console.error(err);
        });
        break;
      }
    default:
      {
        console.warn("action not understood.");
        break;
      }
  }
}
function _renderViolinHelper(data, dmap, tissueDict) {
  // plot configurations
  const id = {
    root: "violinRoot",
    // the root <div> ID
    tooltip: "violinTooltip",
    toolbar: "violinToolbar",
    clone: "violinClone",
    chart: "violinPlot",
    svg: "violinSvg",
    buttons: {
      save: "violinSave"
    }
  };

  // error-checking the required DOM elements
  const rootId = `#${id.root}`;
  const tooltipId = `#${id.tooltip}`;
  if ($$1(rootId).length == 0) throw "Violin Plot Error: rootId does not exist.";
  if ($$1(tooltipId).length == 0) $$1("<div/>").attr("id", id.tooltip).appendTo($$1("body")); // create it if not already present on the demo document

  // clear previously rendered plot
  select(rootId).selectAll("*").remove();

  // rebuild the dom components within the root div
  ["toolbar", "chart", "clone"].forEach(key => {
    $$1("<div/>").attr("id", id[key]).appendTo($$1(rootId));
  });

  // check if there's no expression data, if so, hide the plot and return
  const done = () => {
    select(rootId).style("opacity", 0.0);
    return;
  };
  if (data.length == 0) done();

  // data transformation
  let tissueOrder = dmap.objects.heatmap.xScale.domain().map(d => {
    return {
      id: d,
      name: tissueDict[d].tissueSiteDetail
    };
  }); // tissueOrder is a list of tissue objects {id:display name} in the same order as the x axis of the heat map.
  const genes = data.reduce((arr, d) => {
    arr[d.label] = 1;
    return arr;
  }, {});
  const gCounts = Object.keys(genes).length;
  //// if there's no more genes, hide the plot and return
  if (gCounts == 0) done();

  // render the violin
  const violin = new GroupedViolin(data);
  const tooltip = violin.createTooltip(id.tooltip);
  const toolbar = violin.createToolbar(id.toolbar, tooltip);
  toolbar.createDownloadSvgButton(id.buttons.save, id.svg, `${id.root}-save.svg`, id.clone);

  //// set margins and dimensions
  select(rootId).style("opacity", 1.0); // makes the violin plot section visible
  const margin = _setViolinPlotMargins$1(50, 50, 150, dmap.config.panels.main.x);
  let width = 20 * Object.keys(genes).length * tissueOrder.length;
  width = width < dmap.config.panels.main.w ? dmap.config.panels.main.w : width;
  const dim = _setViolinPlotDimensions$1(width, 150, margin);
  const dom = select(`#${id.chart}`).append("svg").attr("width", dim.outerWidth).attr("height", dim.outerHeight).attr("id", id.svg).append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

  //// configuring the plot
  const showDivider = gCounts == 1 ? false : true;
  const xConfig = {
    show: true,
    angle: 30,
    paddingOuter: 0.01,
    paddingInner: 0.3,
    textAnchor: "start",
    adjustHeight: dim.height,
    hideLabels: false,
    hideTicks: false
  };
  const subXConfig = {
    show: false
  };
  const yConfig = {
    label: "log10(TPM+1)"
  };
  violin.render(dom, dim.width, dim.height, tissueOrder.map(d => d.id), [], xConfig, subXConfig, yConfig, undefined, true, showDivider, true, true, 0, undefined, "kdeScott");

  // plot customization: 
  //// check and adjust the svg width
  const violinLegendW = Number(dom.select("#violinLegend").select("rect").attr("width"));
  let svgW = Number(select(`#${id.chart}`).select("svg").attr("width"));
  svgW = svgW < violinLegendW + 150 ? violinLegendW + 150 : svgW;
  select(`#${id.chart}`).select("svg").attr("width", svgW);
  _addViolinTissueColorBand$1(violin, dom, tissueDict, "bottom");
  _changeViolinXLabel(dom, tissueDict);
  _changeViolinTooltip(violin, tissueDict);
}

/**
 * Set the margins of the violin plot
 * @param top {Integer}
 * @param right {Integer}
 * @param bottom {integer}
 * @param left {Integer}
 * @returns {{top: number, right: number, bottom: number, left: number}}
 * @private
 */
function _setViolinPlotMargins$1(top = 50, right = 50, bottom = 50, left = 50) {
  return {
    top: top,
    right: right,
    bottom: bottom,
    left: left
  };
}

/**
 * Set the dimensions of the violin plot
 * @param width {Integer}
 * @param height {Integer}
 * @param margin {Object} with attr: top, right, bottom, left
 * @returns {{width: number, height: number, outerWidth: number, outerHeight: number}}
 * @private
 */
function _setViolinPlotDimensions$1(width = 1200, height = 250, margin = undefined) {
  return {
    width: width,
    height: height,
    outerWidth: width + (margin.left + margin.right),
    outerHeight: height + (margin.top + margin.bottom)
  };
}

/**
 * Moves the x-axis down
 * @param dom {svg} SVG to be modified
 * @private
 */
function _moveXAxis$1(dom) {
  const xAxis = dom.select(".violin-x-axis");
  xAxis.attr("transform", `${xAxis.attr("transform")} translate(0, 3)`);
}
function _addViolinTissueColorBand$1(plot, dom, tissueDict, loc = "top") {
  _moveXAxis$1(dom);

  // moving x-axis text down to make space for color band
  const xAxisText = dom.selectAll(".violin-x-axis text");
  xAxisText.attr("transform", `translate(0, 8) ${xAxisText.attr("transform")}`);

  ///// add tissue colors
  const tissueG = dom.append("g");
  tissueG.selectAll(".tcolor").data(plot.scale.x.domain()).enter().append("rect").classed("tcolor", true).attr("x", g => plot.scale.x(g)).attr("y", loc == "top" ? plot.scale.y.range()[1] : plot.scale.y.range()[0]).attr("transform", "translate(0, 14)").attr("width", plot.scale.x.bandwidth()).attr("height", 5).style("stroke-width", 0).style("fill", g => `#${tissueDict[g].colorHex}`).style("opacity", 0.7);
}
function _changeViolinXLabel(dom, tissueDict) {
  /***** Change row labels to tissue names *****/
  dom.select(".violin-x-axis").selectAll("text").text(d => tissueDict[d] === undefined ? d : tissueDict[d].tissueSiteDetail);
}
function _changeViolinTooltip(violin, tissueDict) {
  violin.dom.selectAll(".violin-g").on("mouseover", d => {
    const tooltipData = [`<span class="tooltip-key">Tissue</span>: <span class="tooltip-value">${tissueDict[d.tissueSiteDetailId].tissueSiteDetail}</span>`, `<span class="tooltip-key">Gene</span>: <span class="tooltip-value">${d.geneSymbol}</span>`, `<span class="tooltip-key">Median TPM</span>: <span class="tooltip-value">${median(d.data).toPrecision(4)}</span>`];
    violin.tooltip.show(tooltipData.join("<br/>"));
  });
}

/**
 * Add the toolbar
 * @param dmap {DendroHeatmap}
 * @param ids {Dictionary} of dom IDs with buttons
 * @param tissueDict {Dictionary} of tissue objects indexed by tissue ID
 * @param urls {Dictionary} of GTEx web service URLs
 * @param filterGenes {Boolean}
 * @param qTissue {String} of user-defined query tissues
 * @private
 */
function _addToolBar(dmap, ids, tissueDict, urls = getGtexUrls(), filterGenes = undefined, qTissue = undefined) {
  let toolbar = dmap.createToolbar(ids.toolbar, dmap.tooltip);
  toolbar.createDownloadSvgButton(ids.buttons.save, ids.svg, `${ids.root}-save.svg`, ids.clone);
  const __addFilter = () => {
    // so far this is only applicable for topExpressed gene heatmap
    const id = ids.buttons.filter;
    toolbar.createButton(id, "fa-filter");
    select(`#${id}`).on("click", function () {
      // toggle the applied filter
      launchTopExpressed(qTissue, ids.root, ids.violin, urls, !filterGenes);
    }).on("mouseover", function () {
      if (filterGenes) toolbar.tooltip.show("Include Mitochondrial Genes");else toolbar.tooltip.show("Exclude Mitochondrial Genes");
    }).on("mouseout", function () {
      toolbar.tooltip.hide();
    });
  };
  const __addSortTissues = () => {
    const id = ids.buttons.sort;
    toolbar.createButton(id, "fa-sort-alpha-down");
    select(`#${id}`).on("click", function () {
      // hides the tissue dendrogram
      select("#" + dmap.config.panels.top.id).style("display", "None");
      // sort tissues
      let xlist = dmap.objects.heatmap.xList.sort();
      _sortTissues(xlist, dmap, tissueDict);
    }).on("mouseover", function () {
      toolbar.tooltip.show("Sort Tissues Alphabetically");
    }).on("mouseout", function () {
      toolbar.tooltip.hide();
    });
  };
  const __addClusterTissues = () => {
    const id = ids.buttons.cluster;
    toolbar.createButton(id, "fa-code-branch");
    select(`#${id}`).on("click", function () {
      select("#" + dmap.config.panels.top.id).style("display", "Block"); // shows the tissue dendrogram
      let xlist = dmap.objects.columnTree.xScale.domain();
      _sortTissues(xlist, dmap, tissueDict);
    }).on("mouseover", function () {
      toolbar.tooltip.show("Cluster Tissues");
    }).on("mouseout", function () {
      toolbar.tooltip.hide();
    });
  };
  if (filterGenes !== undefined) __addFilter();
  __addSortTissues();
  __addClusterTissues();
}

/**
 * update the heatmap based on the order of the xlist
 * dependencies: CSS classes from expressMap.css
 * @param xlist {Heatmap XList}
 * @param dmap {DendroHeatmap}
 * @param tissueDict {Dictionary} of tissue objects indexed by tissue ID with attr, tissue_name
 */
function _sortTissues(xlist, dmap, tissueDict) {
  // check if there's a query tissue, e.g. top-expressed heatmap

  let qId = undefined;
  const qTissue = select(".exp-map-xlabel.query");
  if (!qTissue.empty()) qId = qTissue.datum();

  // update the heatmap
  const dom = select("#" + dmap.config.panels.main.id);
  const dimensions = dmap.config.panels.main;
  dmap.objects.heatmap.redraw(dom, xlist, dmap.objects.heatmap.yList, dimensions);

  // change the tissue display text to tissue names
  selectAll(".exp-map-xlabel").text(d => tissueDict[d] === undefined ? d : tissueDict[d].tissueSiteDetail).classed("query", false);
  _addTissueColors(dmap, tissueDict);

  // style the query tissue if found
  if (qId !== undefined) _styleSelectedTissue(qId);

  // hide the violin plot
  select("#violinRoot").style("opacity", 0.0);

  // deselect genes
  selectAll(".exp-map-ylabel").classed("clicked", false);
  dmap.data.external = undefined;
}
var ExpressionMap = {
  createDatasetMenu: createDatasetMenu,
  launchTopExpressed: launchTopExpressed,
  launch: launch$3,
  searchById: searchById
};

/* eslint-disable no-prototype-builtins */
/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
function _evaluateDomIds(rootId, tooltipRootId) {
  const ids = {
    root: rootId,
    spinner: "spinner",
    svg: `${rootId}-svg`,
    tooltip: tooltipRootId,
    toolbar: `${rootId}-toolbar`,
    clone: `${rootId}-svg-clone`,
    // for user download
    buttons: {
      download: `${rootId}-download`,
      plotOptions: `${rootId}-option-modal`,
      filter: `${rootId}-filter`,
      // plot option buttons
      ascAlphaSort: `${rootId}-asc-alphasort`,
      descAlphaSort: `${rootId}-desc-alphasort`,
      ascSort: `${rootId}-asc-sort`,
      descSort: `${rootId}-desc-sort`,
      logScale: `${rootId}-log-scale`,
      linearScale: `${rootId}-linear-scale`,
      noDiff: `${rootId}-no-diff`,
      sexDiff: `${rootId}-sex-diff`,
      outliersOn: `${rootId}-outliers-on`,
      outliersOff: `${rootId}-outliers-off`
    },
    plotOptionGroups: {
      scale: `${rootId}-option-scale`,
      sort: `${rootId}-option-sort`,
      differentiation: `${rootId}-option-differentiation`,
      outliers: `${rootId}-option-outlier`
    },
    plotSorts: {
      ascAlphaSort: "asc-alphasort",
      descAlphaSort: "desc-alphasort",
      ascSort: "asc-sort",
      descSort: "desc-sort"
    },
    tissueFilter: `${rootId}-filter-modal`
  };
  if ($$1(`#${ids.root}`).length == 0) throw "Violin Plot Error: rootId does not exist.";
  // create DOM components if not already present
  if ($$1(`#${ids.tooltip}`).length == 0) $$1("<div/>").attr("id", ids.tooltip).appendTo($$1("body"));
  if ($$1(`#${ids.toolbar}`).length == 0) $$1("<div/>").attr("id", ids.toolbar).appendTo($$1(`#${ids.root}`));
  if ($$1(`#${ids.root} #${ids.spinner}`).length == 0) $$1("<span><i id=\"spinner\" class=\"fas fa-sync fa-spin\"></i></span>").appendTo($$1(`#${ids.root}`));else $$1(`#${ids.root} #${ids.spinner}`).show();
  if ($$1(`#${ids.clone}`).length == 0) $$1("<div/>").attr("id", ids.clone).appendTo($$1(`#${ids.root}`));
  return ids;
}
function _handlingNoData(ids, gencodeId) {
  $$1(`#${ids.toolbar}`).remove();
  $$1(`<div id="gene-exp-vplot">No gene expression data found for ${gencodeId}</div>`).appendTo(`#${ids.root}`);
  $$1(`#${ids.root} #${ids.spinner}`).hide();
}
function launch$2(rootId, tooltipRootId, gencodeId, plotTitle = "Gene Expression Violin Plot", urls = getGtexUrls(), margins = _setViolinPlotMargins(50, 75, 250, 60), dimensions = {
  w: window.innerWidth * 0.8,
  h: 250
}) {
  const promises = [urls.tissue, urls.geneExp + gencodeId, urls.geneExp + gencodeId + "&attributeSubset=sex"];
  const ids = _evaluateDomIds(rootId, tooltipRootId);
  Promise.all([RetrieveAllPaginatedData(promises[0]), RetrieveAllPaginatedData(promises[1])]).then(function (args) {
    const tissues = parseTissues(args[0]);
    const tissueDict = {};
    const tissueIdNameMap = {};
    const groupColorDict = {
      female: "#e67f7b",
      male: "#70bcd2"
    };
    tissues.forEach(x => {
      tissueIdNameMap[x.tissueSiteDetailId] = x.tissueSiteDetail;
      tissueDict[x.tissueSiteDetail] = x;
      groupColorDict[x.tissueSiteDetailId] = `#${x.colorHex}`;
    });
    const violinPlotData = _parseGeneExpressionForViolin(args[1], tissueIdNameMap, groupColorDict, false);
    if (!violinPlotData.length) {
      _handlingNoData(ids, gencodeId);
      return;
    } else {
      let violinPlot = new GroupedViolin(violinPlotData); // why not just create a subclass of GroupedViolin...
      let tooltip = violinPlot.createTooltip(ids.tooltip);

      // adding properties to keep track of sorting and filtering specifically for this plot
      violinPlot.sortData = violinPlot.data; // sort any differentiated data by the aggregate data, too
      violinPlot.allData = violinPlot.data;
      violinPlot.gencodeId = gencodeId;
      violinPlot.tIdNameMap = tissueIdNameMap;
      violinPlot.groupColorDict = groupColorDict;
      violinPlot.tissueDict = tissueDict;
      violinPlot.geneJson = {
        allData: args[1],
        subsetData: undefined
      };
      violinPlot.promises = promises;
      violinPlot.unit = ` ${violinPlotData[0].unit}`;
      // default plot options
      violinPlot.gpConfig = {
        subset: false,
        scale: "linear",
        sort: ids.plotSorts.ascAlphaSort,
        showOutliers: true,
        title: plotTitle
      };
      _drawViolinPlot(violinPlot, margins, dimensions, ids);
      _addToolbar$1(violinPlot, tooltip, ids);
      _createTissueFilter(violinPlot, ids.tissueFilter, ids, args[0]);
      $$1(`#${ids.root} #${ids.spinner}`).hide();
    }
  });
}

/**
 * Set the margins of the violin plot
 * @param top {Integer}
 * @param right {Integer}
 * @param bottom {integer}
 * @param left {Integer}
 * @returns {{top: number, right: number, bottom: number, left: number}}
 * @private
 */
function _setViolinPlotMargins(top = 50, right = 50, bottom = 50, left = 50) {
  return {
    top: top,
    right: right,
    bottom: bottom,
    left: left
  };
}

/**
 * Set the dimensions of the violin plot
 * @param width {Integer}
 * @param height {Integer}
 * @param margin {Object} with attr: top, right, bottom, left
 * @returns {{width: number, height: number, outerWidth: number, outerHeight: number}}
 * @private

 */
function _setViolinPlotDimensions(width = 1200, height = 250, margin = _setViolinPlotMargins()) {
  return {
    width: width,
    height: height,
    outerWidth: width + (margin.left + margin.right),
    outerHeight: height + (margin.top + margin.bottom)
  };
}

/**
 * Adds toolbar allowing the user to control different plot options
 * @param vplot {GroupedViolin} Violin plot object to add toolbar to
 * @param tooltip {Tooltip} Violin plot tooltip
 * @param ids {Dictionary} Dictionary of IDs relevant to the plot
 * @private
 */
function _addToolbar$1(vplot, tooltip, ids) {
  let toolbar = vplot.createToolbar(ids.toolbar, tooltip);
  toolbar.createDownloadSvgButton(ids.buttons.download, ids.svg, "gene-exp-plot.svg", ids.clone);

  // adding bootstrap classes to toolbar
  $$1(`#${ids.toolbar}`).addClass("row");
  $$1(`#${ids.toolbar} .btn-group`).addClass("col-xs-12 col-lg-1 text-nowrap").css("display", "flex");
  $$1("<div></div>").appendTo(`#${ids.toolbar}`).attr("id", `${ids.toolbar}-plot-options`).attr("class", "col-lg-11 text-nowrap");
  let plotOptions = $$1(`#${ids.toolbar}-plot-options`);

  // subsetting options
  $$1("<div/>").appendTo(plotOptions).attr("id", ids.plotOptionGroups.differentiation).attr("class", "col-lg-2 col-xl-2");
  $$1("<span/>").appendTo(`#${ids.plotOptionGroups.differentiation}`).attr("class", `${ids.root}-option-label`).html("Subset");
  $$1("<div/>").appendTo(`#${ids.plotOptionGroups.differentiation}`).attr("class", "btn-group btn-group-sm");
  let subsetButtonGroup = $$1(`#${ids.plotOptionGroups.differentiation} .btn-group`);
  $$1(`<button class="btn btn-default" id="${ids.buttons.noDiff}">None</button>`).appendTo(subsetButtonGroup);
  $$1(`<button class="btn btn-default" id="${ids.buttons.sexDiff}">Sex</button>`).appendTo(subsetButtonGroup);

  // scale options
  $$1("<div/>").appendTo(plotOptions).attr("id", ids.plotOptionGroups.scale).attr("class", "col-lg-2 col-xl-2");
  $$1("<span/>").appendTo(`#${ids.plotOptionGroups.scale}`).attr("class", `${ids.root}-option-label`).html("Scale");
  $$1("<div/>").appendTo(`#${ids.plotOptionGroups.scale}`).attr("class", "btn-group btn-group-sm");
  let scaleButtonGroup = $$1(`#${ids.plotOptionGroups.scale} .btn-group`);
  $$1(`<button class="btn btn-default" id="${ids.buttons.logScale}">Log</button>`).appendTo(scaleButtonGroup);
  $$1(`<button class="btn btn-default" id="${ids.buttons.linearScale}">Linear</button>`).appendTo(scaleButtonGroup);

  // sort options -- tissue name sorts
  $$1("<div/>").appendTo(plotOptions).attr("class", `${ids.plotOptionGroups.sort} col-lg-2 col-xl-2`).attr("id", "vplot-alpha-sorts");
  $$1("<span/>").appendTo(`.${ids.plotOptionGroups.sort}#vplot-alpha-sorts`).attr("class", `${ids.root}-option-label`).html("Tissue Sort");
  $$1("<div/>").appendTo(`.${ids.plotOptionGroups.sort}#vplot-alpha-sorts`).attr("class", "btn-group btn-group-sm").attr("id", `${ids.plotOptionGroups.sort}-alpha`);
  let alphaSortButtonGroup = $$1(`#${ids.plotOptionGroups.sort}-alpha.btn-group`);
  $$1(`<button class="btn btn-default fa fa-caret-up" id="${ids.buttons.ascAlphaSort}"></button>`).appendTo(alphaSortButtonGroup);
  $$1(`<button class="btn btn-default fa fa-caret-down" id="${ids.buttons.descAlphaSort}"></button>`).appendTo(alphaSortButtonGroup);

  // sort options -- median sorts
  $$1("<div/>").appendTo(plotOptions).attr("class", `${ids.plotOptionGroups.sort} col-lg-2 col-xl-2`).attr("id", "vplot-num-sorts");
  $$1("<span/>").appendTo(`.${ids.plotOptionGroups.sort}#vplot-num-sorts`).attr("class", `${ids.root}-option-label`).html("Median Sort");
  $$1("<div/>").appendTo(`.${ids.plotOptionGroups.sort}#vplot-num-sorts`).attr("class", "btn-group btn-group-sm").attr("id", `${ids.plotOptionGroups.sort}-num`);
  let numSortButtonGroup = $$1(`#${ids.plotOptionGroups.sort}-num.btn-group`);
  $$1(`<button class="btn btn-default fa fa-caret-up" id="${ids.buttons.ascSort}"></button>`).appendTo(numSortButtonGroup);
  $$1(`<button class="btn btn-default fa fa-caret-down" id="${ids.buttons.descSort}"></button>`).appendTo(numSortButtonGroup);

  // outlier display options
  $$1("<div/>").appendTo(plotOptions).attr("id", ids.plotOptionGroups.outliers).attr("class", "col-lg-2 col-xl-2");
  $$1("<span/>").appendTo(`#${ids.plotOptionGroups.outliers}`).attr("class", `${ids.root}-option-label`).html("Outliers");
  $$1("<div/>").appendTo(`#${ids.plotOptionGroups.outliers}`).attr("class", "btn-group btn-group-sm");
  let outliersButtonGroup = $$1(`#${ids.plotOptionGroups.outliers} .btn-group`);
  $$1(`<button class="btn btn-default" id="${ids.buttons.outliersOn}">On</button>`).appendTo(outliersButtonGroup);
  $$1(`<button class="btn btn-default" id="${ids.buttons.outliersOff}">Off</button>`).appendTo(outliersButtonGroup);
  selectAll(`#${ids.plotOptionsModal} .modal-body button`).classed("active", false);

  // plot defaults
  selectAll(`#${ids.buttons.ascAlphaSort},
               #${ids.buttons.linearScale},
               #${ids.buttons.noDiff},
               #${ids.buttons.outliersOn}`).classed("active", true);

  // filter
  const hover = "Filter Tissues";
  const noopCallback = () => {};
  toolbar.createButton(ids.buttons.filter, "fa-filter", hover, noopCallback);
  $$1(`#${ids.buttons.filter}`).attr("data-toggle", "modal").attr("data-target", "#gene-expr-vplot-filter-modal");

  // sort events
  $$1(`.${ids.plotOptionGroups.sort} button`).on("click", function (e) {
    let btn = select(this);
    if (btn.classed("active")) return;
    selectAll(`.${ids.plotOptionGroups.sort} button`).classed("active", false);
    btn.classed("active", true);
    vplot.gpConfig.sort = e.target.id.replace(`${ids.root}-`, "");
    _redrawViolinPlot(vplot, ids);
  });

  // scale events
  $$1(`#${ids.plotOptionGroups.scale} button`).on("click", function (e) {
    let btn = select(this);
    if (btn.classed("active")) return;
    selectAll(`#${ids.plotOptionGroups.scale} button`).classed("active", false);
    btn.classed("active", true);
    vplot.gpConfig.scale = e.target.id == ids.buttons.logScale ? "log" : "linear";
    _redrawViolinPlot(vplot, ids);
  });

  // outlier display events
  $$1(`#${ids.plotOptionGroups.outliers} button`).on("click", function (e) {
    let btn = select(this);
    if (btn.classed("active")) return;
    selectAll(`#${ids.plotOptionGroups.outliers} button`).classed("active", false);
    btn.classed("active", true);
    vplot.gpConfig.showOutliers = e.target.id == ids.buttons.outliersOn;
    _updateOutlierDisplay(vplot, ids);
  });

  // differentiation events
  $$1(`#${ids.plotOptionGroups.differentiation} button`).on("click", function (e) {
    let btn = select(this);
    if (btn.classed("active")) return;
    selectAll(`#${ids.plotOptionGroups.differentiation} button`).classed("active", false);
    btn.classed("active", true);
    vplot.gpConfig.subset = e.target.id == ids.buttons.sexDiff;
    _redrawViolinPlot(vplot, ids);
  });
}

/**
 * Calculates values for violin plot in specified scale
 * @param data
 * @param useLog {Boolean}
 * @private
 */
function _calcViolinPlotValues(data, useLog = true) {
  data.forEach(d => {
    d.values = useLog ? d.data.map(dd => {
      return Math.log10(+dd + 1);
    }) : d.data;
    d.values.sort(ascending$1);
    // median needed for sorting
    d.median = median(d.values);
  });
}

/**
 * parse the expression data of a gene for a grouped violin plot
 * @param data {JSON} from GTEx gene expression web service
 * @param colors {Dictionary} the violin color for genes
 * @param IdNameMap {Dictionary} mapping of tissueIds to tissue names
 * @param useLog {Boolean} whether or not to calculate values in log
 * @private
 */

function _parseGeneExpressionForViolin(data, idNameMap = undefined, colors = undefined, useLog = true) {
  data.forEach(d => {
    ["data", "tissueSiteDetailId", "geneSymbol", "gencodeId"].forEach(k => {
      if (!d.hasOwnProperty(k)) {
        console.error(d);
        throw "Parse Error: required json attribute is missing: " + k;
      }
    });
    d.group = idNameMap === undefined ? d.tissueSiteDetailId : idNameMap[d.tissueSiteDetailId];
    d.label = d.subsetGroup === undefined ? d.geneSymbol : d.subsetGroup;
    d.color = colors === undefined ? "#90c1c1" : d.subsetGroup === null ? colors[d.tissueSiteDetailId] : colors[d.subsetGroup];
  });
  _calcViolinPlotValues(data, useLog);
  return data;
}

/**
 * populates tissue filter modal with tissues
 * @param  vplot {GroupedViolin} violin plot object being modified
 * @param  domId {String} ID of modal whose body is to be populated
 * @param  ids {Dictionary} Dictionary of IDs relevant to plot
 * @param  tissues {Array} Array of tissues returned from GTEx tissueSiteDetail API
 * @private
 */
function _createTissueFilter(vplot, domId, ids, tissues) {
  const tissueGroups = parseTissueSites(tissues);
  createTissueGroupMenu(tissueGroups, `${domId}-body`, false, true, 3);
  _addTissueFilterEvent(vplot, domId, ids, tissueGroups);
}

/**
 * filters tissues displayed in the plot
 * @param vplot {GroupedViolin} violin plot object being modified
 * @param domId {String} modal ID
 * @param ids {Dictionary} Dictionary of IDs relevant to plot
 * @param tissues {Dictionary} Dictionary of tissue groups
 * @private
 */
function _addTissueFilterEvent(vplot, domId, ids, tissues) {
  const action = () => {
    let checkedTissues = parseTissueGroupMenu(tissues, `${domId}-body`, true);
    _filterTissues(vplot, ids, checkedTissues);
  };
  select(`#${domId}-button`).on("click", action);
  select(`#${domId}-close`).on("click", action);
}

/**
 * Filters view to only specified tissues
 * @param vplot {GroupedViolin} violin plot object to be modified
 * @param ids {Dictionary} Dictionary of IDs relevant to plot
 * @param tissues {Array} List of tissues to filter down to
 * @private
 */
function _filterTissues(vplot, ids, tissues) {
  let filteredData = vplot.allData.filter(x => tissues.includes(x.group));
  vplot.data = filteredData;
  _redrawViolinPlot(vplot, ids);
}

/**
 * Moves the x-axis down
 * @param dom {svg} SVG to be modified
 * @private
 */
function _moveXAxis(dom) {
  const xAxis = dom.select(".violin-x-axis");
  xAxis.attr("transform", `${xAxis.attr("transform")} translate(0, 3)`);
}

/**
 * Adds tissue color to the plot
 * @param plot {GroupedViolin} violin plot object to be modified
 * @param dom {d3 Selection} d3 selection of the svg to modify
 * @param tissueDict {Dictionary} Dictionary of tissues containing color info
 * @param loc {String} "top" || "bottom"; specified where to display the colors
 * @private
 */
function _addViolinTissueColorBand(plot, dom, tissueDict, loc = "top") {
  _moveXAxis(dom);

  // moving x-axis text down to make space for color band
  const xAxisText = dom.selectAll(".violin-x-axis text");
  xAxisText.attr("transform", `translate(0, 8) ${xAxisText.attr("transform")}`);

  // add tissue colors
  const tissueG = dom.append("g");
  tissueG.selectAll(".tcolor").data(plot.scale.x.domain()).enter().append("rect").classed("tcolor", true).attr("x", g => plot.scale.x(g)).attr("y", loc == "top" ? plot.scale.y.range()[1] : plot.scale.y.range()[0]).attr("transform", "translate(0, 14)").attr("width", plot.scale.x.bandwidth()).attr("height", 5).style("stroke-width", 0).style("fill", g => `#${tissueDict[g].colorHex}`).style("opacity", 0.9);
}

/**
 * Customizes the tooltip specifically for this plot
 * @param vplot {GroupedViolin}
 * @private
 */
function _customizeTooltip$2(vplot) {
  let violinGs = vplot.dom.selectAll(".violin-g");
  violinGs.on("mouseover", (d, i, nodes) => {
    let med = vplot.gpConfig.scale == "log" ? Math.pow(10, d.median) - 1 : d.median;
    let vPath = select(nodes[i]).select("path");
    vPath.classed("highlighted", true);
    let tooltipData;
    if (!vplot.gpConfig.subset) {
      tooltipData = [`<span class="tooltip-key">Tissue</span>: <span class="tooltip-value">${d.group}</span>`, `<span class="tooltip-key">Sample size</span>: <span class="tooltip-value">${d.values.length}</span>`, `<span class="tooltip-key">Median${vplot.unit}</span>: <span class="tooltip-value">${med.toPrecision(4)}</span>`];
    } else {
      tooltipData = [`<span class="tooltip-key">Tissue</span>: <span class="tooltip-value">${d.group}</span>`, `<span class="tooltip-key">Group</span>: <span class="tooltip-value">${d.label}</span>`, `<span class="tooltip-key">Sample size</span>: <span class="tooltip-value">${d.values.length}</span>`, `<span class="tooltip-key">Median${vplot.unit}</span>: <span class="tooltip-value">${med.toPrecision(4)}</span>`];
    }
    vplot.tooltip.show(tooltipData.join("<br/>"));
  });
}

/**
 * Draws the initial rendering of the violin plot
 * @param vplot {GroupedViolin}
 * @param margins {Object} Contains plot top, right, bottom and left margin information
 * @param dimensions {Object} Contains plot width and height information
 * @param ids {Dictionary} Dictionary of IDs relevant to plot
 * @private
 */
function _drawViolinPlot(vplot, margins, dimensions, ids) {
  const margin = margins;
  const dim = _setViolinPlotDimensions(dimensions.w, dimensions.h, margin);
  const svg = select(`#${ids.root}`).append("svg").attr("id", ids.svg).attr("width", dim.outerWidth).attr("height", dim.outerHeight).append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
  const width = dim.width;
  const height = dim.height;
  const xAxis = {
    show: true,
    angle: 35,
    paddingInner: 0.2,
    paddingOuter: 0
  };
  const subXAxis = {
    show: false,
    angle: 0,
    paddingInner: 0,
    paddingOuter: 0,
    sort: true
  };
  const yAxis = {
    label: "TPM"
  };
  const sizeAxis = {
    show: false
  };
  const xDomain = _sortData(vplot.gpConfig.sort, vplot.sortData, ids);
  const yDomain = [];
  const showWhisker = false;
  const showDivider = false;
  const showLegend = true;
  const showOutliers = true;
  vplot.render(svg, width, height, xDomain, yDomain, xAxis, subXAxis, yAxis, sizeAxis, showWhisker, showDivider, showLegend, showOutliers, 0, undefined, "kdeScott");
  _customizePlot$1(vplot, ids);
}

/**
 * Adds peripheral details to violin plot post-initial rendering.
 * @param vplot {GroupedViolin}
 * @param ids {Dictionary} Dictionary of IDs relevant to plot
 * @private
 */
function _customizePlot$1(vplot, ids) {
  let svg = select(`#${ids.svg} g`);
  if (vplot.gpConfig.title !== undefined) vplot.addPlotTitle(svg, vplot.gpConfig.title);
  _updateOutlierDisplay(vplot, ids);
  if (!vplot.gpConfig.subset) {
    select(`#${ids.svg} #violinLegend`).remove();
    _moveXAxis(svg);
  } else {
    _addViolinTissueColorBand(vplot, svg, vplot.tissueDict, "bottom");
  }
  _customizeTooltip$2(vplot);
}

/**
 * Determines whether or not to display outliers on the plot
 * @param vplot {GroupedViolin}
 * @param ids {Dictionary} Dictionary of IDs relevant to plot
 * @private
 */
function _updateOutlierDisplay(vplot, ids) {
  selectAll(`#${ids.svg} path.violin`).classed("outlined", !vplot.gpConfig.showOutliers);
  $$1(`#${ids.svg} .violin-points`).toggle(vplot.gpConfig.showOutliers);
}

/**
 *
 * @param sortMethod {String} asc-alphasort' || 'desc-alphasort' || 'asc-sort' || 'desc-sort'
 * @param data {Object} data to be sorted
 * @param ids {Dictionary} dictionary of IDs relevant to plot
 * @private
 */
function _sortData(sortMethod, data, ids) {
  switch (sortMethod) {
    case ids.plotSorts.ascAlphaSort:
      data.sort((a, b) => {
        if (a.group < b.group) return -1;else if (a.group > b.group) return 1;else return 0;
      });
      break;
    case ids.plotSorts.descAlphaSort:
      data.sort((a, b) => {
        if (a.group < b.group) return 1;else if (a.group > b.group) return -1;else return 0;
      });
      break;
    case ids.plotSorts.ascSort:
      data.sort((a, b) => {
        return a.median - b.median;
      });
      break;
    case ids.plotSorts.descSort:
      data.sort((a, b) => {
        return b.median - a.median;
      });
      break;
  }
  let xDomain = data.map(d => d.group);
  return xDomain;
}

/**
 * Redraws plot after a display option has been updated
 * @param vplot {GroupedViolin} Contains plot display configurations in vplot.gpConfig
 * @param ids {Dictionary} dictionary of IDs relevant to plot
 * @private
 */
function _redrawViolinPlot(vplot, ids) {
  // subsetting and sorting

  const callback = () => {
    let newData = vplot.gpConfig.subset ? vplot.geneJson.subsetData : vplot.geneJson.allData;
    const violinPlotData = _parseGeneExpressionForViolin(newData, vplot.tIdNameMap, vplot.groupColorDict, vplot.gpConfig.scale == "log");
    let filteredTissues = vplot.data.map(d => d.group);
    vplot.allData = violinPlotData.map(d => d);
    let filteredData = violinPlotData.filter(d => filteredTissues.indexOf(d.group) != -1);
    let sortData = vplot.sortData.filter(d => filteredTissues.includes(d.group));
    let xDomain = _sortData(vplot.gpConfig.sort, sortData, ids);

    // scaling
    _calcViolinPlotValues(filteredData, vplot.gpConfig.scale == "log");
    _calcViolinPlotValues(vplot.allData, vplot.gpConfig.scale == "log");
    let yScaleLabel = vplot.gpConfig.scale == "log" ? "log10(TPM+1)" : "TPM";
    vplot.updateData(filteredData);
    vplot.updateXScale(xDomain);
    vplot.updateYScale(yScaleLabel);
    vplot.reset();
    _customizePlot$1(vplot, ids);
  };

  // fetch data subset by sex in the background
  if (vplot.gpConfig.subset) {
    if (vplot.geneJson.subsetData === undefined) {
      RetrieveAllPaginatedData(vplot.promises[2]).then(results => {
        vplot.geneJson.subsetData = results;
        callback();
      });
    } else {
      callback();
    }
  } else {
    callback();
  }
}
var ExpressionViolinPlot = {
  launch: launch$2
};

function launch$1(rootId, tooltipId, gencodeId, dimension = {
  w: window.innerWidth * 0.7,
  h: 250
}, margin = {
  top: 50,
  right: 50,
  bottom: 150,
  left: 100
}, url = getGtexUrls()) {
  // assign default plot options
  let options = {
    showAll: true,
    // show all data
    splitViolin: false,
    // show both filtered and unfiltered data in two half violins
    byTissue: false // group by tissue
  };

  // API call
  let dataUrl = url.singleCellExpression + gencodeId + "&excludeDataArray=False";
  // let dataUrl = "data/ccl21.data.json";
  Promise.all([RetrieveAllPaginatedData(dataUrl), RetrieveAllPaginatedData(url.tissue)]).then(args => {
    // data parsing
    let tissueRaw = args[1];
    let tIdNameMapper = _createTIDNameMap(tissueRaw);
    let raw = args[0];
    let dataT = _parseAPI(raw, tIdNameMapper, true, true, false, true);
    let dataC = _parseAPI(raw, tIdNameMapper, false, true, false, true);
    let nonzeroDataT = _parseAPI(raw, tIdNameMapper, true, false);
    let nonzeroDataC = _parseAPI(raw, tIdNameMapper, false, false);
    if (dataT.length == 0) {
      console.error("This gene has no data");
      throw "This gene has no expression data";
    }
    let data = !options.splitViolin ? options.byTissue ? dataT : dataC : options.byTissue ? dataT.concat(nonzeroDataT) : dataC.concat(nonzeroDataC);

    // set up: instantiate the plot object, assign DOM IDs, create a tooltip div, add the plot toolbar
    let plot = new GroupedViolin(data);
    const ids = _assignIDs(rootId, tooltipId); // assign DOM IDs
    plot.createTooltip(ids.tooltip);
    _addToolbar(plot, ids);

    // plot rendering
    _render$2(plot, margin, dimension, ids);
    _customizePlot(plot, options);

    // UI: define plot update triggered by rendering options, and create buttons for them
    let update = () => {
      _updatePlot(plot, options, dataT, dataC, nonzeroDataT, nonzeroDataC);
    };
    _createButtons(plot, options, ids, update);
  });
}

/**
 * Render the violin plot
 * @param {GroupedViolin} plot 
 * @param {Dictionary} margin with attr: top, right, bottom, left
 * @param {Dictionary} dimension with attr: width and height
 * @param {Dictionary} id
 */
function _render$2(plot, margin, dimension, id, demo, showZero, showOutliers = true) {
  dimension.outerWidth = dimension.width + margin.left + margin.right;
  dimension.outerHeight = dimension.height + margin.top + margin.bottom;
  let svg = _createSvg$3(id, margin, dimension);
  let sortedX = plot.data.map(d => d.group).sort(ascending$1);
  const xDomain = _customizeXDomain(sortedX);
  const yDomain = [];
  const xAxis = {
    show: !showZero,
    angle: -90,
    paddingOuter: 0,
    paddingInner: 0.2,
    textAnchor: "start",
    adjustHeight: 0,
    hideLabels: false,
    hideTicks: true,
    direction: "top",
    addGroupGap: true
  };
  const subXAxis = {
    show: false
  };
  const yAxis = {
    // label: "ln(CP10K+1)"
    label: "ln(counts per 10k + 1)"
  };
  const sizeAxis = {
    show: false,
    angle: 0,
    adjustHeight: 0
  };
  const showWhisker = false;
  const showDivider = false;
  const showLegend = false;
  const minDataPoints = 25;
  plot.render(svg, dimension.width, dimension.height, xDomain, yDomain, xAxis, subXAxis, yAxis, sizeAxis, showWhisker, showDivider, showLegend, showOutliers, minDataPoints, undefined, "kdeScott");
}
function _customizeXDomain(sortedX) {
  // customizing xDomain to provide intergroup gap
  let xDomain = [];
  let previousX = "start";
  sortedX.forEach(d => {
    let x = d.split(":")[0];
    let isSame = previousX === x;
    if (!isSame) {
      xDomain.push(x + "-extra");
      // xDomain.push(x+"-v2-extra");
      xDomain.push(x); //flanking the group with spacer
    }
    xDomain.push(d);
    previousX = x;
  });
  return xDomain;
}
function _customizePlot(plot, options) {
  let buffer = options.byTissue ? 30 : 30;
  let angle = options.byTissue ? 0 : 45;
  // customization

  _addSuperGroupLabels(plot, buffer, angle);
  _customizeXAxis(plot, options);
  _customizeTooltip$1(plot, options);
}
function _addSuperGroupLabels(plot, buffer = 60, angle = -45, orientation = "bottom") {
  let nested = nest().key(d => d.superGroup).rollup(v => {
    v.sort((a, b) => {
      if (a.group < b.group) return -1;
      if (a.group > b.group) return 1;
      return 0;
    });
    let midX = (plot.scale.x(v[v.length - 1].group) - plot.scale.x(v[0].group) + 1) / 2; // figuring out where the center X position  is for each super group
    let firstElement = v[0].group;
    let lastElement = v[v.length - 1].group;
    return {
      superGroup: v[0].superGroup,
      midX: midX,
      firstElement: firstElement,
      lastElement: lastElement
    };
  }).entries(plot.data);
  let superGroupMetaData = nested.map(n => n.value);
  let firstElements = superGroupMetaData.map(n => n.firstElement);
  superGroupMetaData.map(n => n.lastElement);
  // create a new axis for the super group
  let axis = axisTop(plot.scale.x).tickSize(0);
  let color = "#bacad6";
  const axisG = plot.dom.append("g").attr("transform", orientation == "bottom" ? `translate(0, ${plot.height})` : "translate(0, 0)").call(axis);
  axisG.select("path").style("stroke", color).style("stroke-width", 0.5);
  axisG.append("line").attr("x1", 0).attr("x2", plot.width).attr("y1", plot.height).attr("y2", plot.height).style("stroke-width", 0.5).style("stroke", color);
  const ticks = axisG.selectAll(".tick");
  ticks.select("line").attr("class", "grid").attr("x1", -plot.scale.x.step()).attr("x2", -plot.scale.x.step()).attr("y1", 0).attr("y2", -(plot.height + buffer)).attr("stroke", color).attr("stroke-width", d => {
    return firstElements.indexOf(d) >= 0 ? 1 : 0;
  });
  ticks.select("text").remove();
}
function _customizeXAxis(plot, options, mode = 2) {
  if (mode == 0 || mode == 2) {
    // add bubbles along the axis to encode nonzero cell proportion
    let rScale = sqrt$1().domain([0, 20000]).range([1, plot.scale.x.step() / 2 > 8 ? 8 : plot.scale.x.step() / 2]);

    // sample size bubbles
    //// text label
    plot.dom.append("text").attr("x", 0).attr("y", -25).style("text-anchor", "end").style("font-size", "10px").text("Total cells");

    //// bubble size legend
    plot.dom.selectAll(".bubble").data([1000, 2000, 5000, 10000]).enter().append("circle").attr("cx", -10).attr("cy", (d, i) => -50 - 10 * i).attr("r", d => rScale(d)).style("fill", "rgba(148, 119, 91, 0.8)").style("stroke-width", 0).classed("bubble", true);
    plot.dom.selectAll(".bLabel").data(["1e3", "", "", "1e4"]).enter().append("text").attr("x", -20).attr("y", (d, i) => -48 - 10 * i).style("text-anchor", "end").style("font-size", "10px").text(d => d);
    plot.dom.select(".violin-x-axis").selectAll(".tick").append("circle").attr("cx", 0).attr("cy", -25).attr("r", d => {
      let v = d.split(":")[3]; // sample size (cells)
      return rScale(v);
    }).style("fill", "rgba(148, 119, 91, 0.8)").style("stroke-width", 0);
  }
  if (mode == 1 || mode == 2) {
    // add pie charts
    const pie$1 = pie().padAngle(0.005).sort(null).value(d => d);
    const arc$1 = () => {
      const radius = plot.scale.x.step() / 2 > 8 ? 8 : plot.scale.x.step() / 2;
      return arc().innerRadius(radius * 0.0).outerRadius(radius - 1);
    };
    plot.dom.append("text").attr("x", 0).attr("y", -10).style("text-anchor", "end").style("font-size", "10px").text("Cell fraction");
    const color = "rgba(0, 152, 199, 0.6)";
    plot.dom.select(".violin-x-axis").selectAll(".tick").each(function (d) {
      // console.log(d);
      let total = +d.split(":")[3];
      let p = +d.split(":")[2];
      if (isNaN(p)) return;
      // p = p<2?2:+(d.split(":")[2]);
      let arcs = pie$1([p, total - p]);
      select(this).selectAll("path").data(arcs).join("path").attr("d", arc$1()).style("stroke-width", 0.5).style("stroke", color).style("fill", d => d.value == p ? color : "white").attr("transform", "translate(0, -10)");
    }).style("cursor", "default").on("mouseover", function (d) {
      let label = d.split(":");
      if (label[1] === undefined) return;
      select(this).select("text").style("font-size", "10px");
      let tooltipData = [`<span class="tooltip-key">${options.byTissue ? "Cell type" : "Tissue"}</span>: <span class="tooltip-value">${label[1]}</span>`, `<span class="tooltip-key">${options.byTissue ? "Tissue" : "Cell type"}</span>: <span class="tooltip-value">${label[0]}</span>`, `<span class="tooltip-key">Sample size</span>: <span class="tooltip-value">${label[3]} cells</span>`, `<span class="tooltip-key">Detected in cells</span>: <span class="tooltip-value">${label[2]} (${(100 * label[2] / label[3]).toFixed(2)}%)</span>`];
      plot.tooltip.show(tooltipData.join("<br/>"));
    }).on("mouseout", function (d) {
      let label = d.split(":");
      if (label[1] === undefined) return;
      select(this).select("text").style("font-size", "8px");
    });
  }
  // text label    
  plot.dom.select(".violin-x-axis").selectAll("text").style("font-size", d => {
    let label = d.split(":")[1];
    return label === undefined ? "7px" : "8px";
  }).style("fill", d => {
    let label = d.split(":")[1];
    return label === undefined ? "#666666" : "#222222";
  }).style("font-weight", d => {
    let label = d.split(":")[1];
    return label === undefined ? "bold" : "normal";
  }).attr("transform", `rotate(${plot.config.x.angle}, -15, -20)`).text(d => {
    let label = d.split(":");
    let clean = label[1] === undefined ? label[0].toUpperCase() : label[1];
    return clean.endsWith("-EXTRA") ? "" : clean;
  }); // clean up X labels, note that the cleanup step should be done after the bubbles are rendered will get rid of the percent nonzero info    
}

/**
 * 
 * @param {String} id 
 * @param {Dictionary} margin with attr: top, right, bottom, left
 * @param {Dictionary} dimension with attr: outerWidth and outerHeight
 */
function _createSvg$3(id, margin, dimension) {
  return select(`#${id.root}`).append("svg").attr("id", id.svg).attr("width", dimension.outerWidth).attr("height", dimension.outerHeight).append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
}
function _createTIDNameMap(raw) {
  const tissueIdNameMap = {};
  raw.forEach(t => {
    tissueIdNameMap[t.tissueSiteDetailId] = t.tissueSiteDetail;
  });
  return tissueIdNameMap;
}
function _parseAPI(raw, tIdNameMapper, byTissue = true, showZero = true, showSize = false, showBoxplot = true) {
  let data = [];
  raw.forEach(tissueObj => {
    tissueObj.cellTypes.forEach(cellTypeObj => {
      let values = showZero ? cellTypeObj.data.concat(new Array(cellTypeObj.numZeros).fill(0)) : cellTypeObj.data;
      let totalCells = showZero ? values.length : +cellTypeObj.numZeros + values.length;
      let percent = (100 * (cellTypeObj.count / totalCells)).toFixed(2);
      let tissue = tIdNameMapper[tissueObj.tissueSiteDetailId];
      let maxDomain = showZero ? 5000 : 2500;
      let cTheme = showZero ? Greys : GnBu;
      let cScale = sequential(cTheme).domain([100, maxDomain]);
      let group = byTissue ? [tissue, cellTypeObj.cellType, cellTypeObj.count, totalCells].join(":") : [cellTypeObj.cellType, tissue, cellTypeObj.count, totalCells].join(":");
      data.push({
        color: showSize ? cScale(values.length) : showZero ? "rgb(148, 119, 91)" : "rgb(0, 152, 199)",
        label: "",
        group: group,
        superGroup: byTissue ? tissue : cellTypeObj.cellType,
        // is this used?
        gencodeId: tissueObj.gencodeId,
        values: values,
        nonzero: percent,
        unit: tissueObj.unit,
        datasetId: tissueObj.datasetId,
        median: median(values),
        total: totalCells,
        showHalfViolin: undefined,
        showBoxplot: showBoxplot,
        showPoints: false,
        // stroke: !showZero?"#357eb5":undefined,
        // fill: !showZero?"#ffffff":undefined,
        // debugging purposes
        nonzeroMedian: cellTypeObj.data.length == 0 ? null : median(cellTypeObj.data)
      });
    });
  });
  return data;
}

/**
 * Customizes the tooltip specifically for this plot
 * @param vplot {GroupedViolin}
 * @private
 */
function _customizeTooltip$1(vplot, options) {
  let violinGs = vplot.dom.selectAll(".violin-g");
  violinGs.on("mouseover", (d, i, nodes) => {
    let vPath = select(nodes[i]).select("path");
    vPath.classed("highlighted", true);
    let expressed = d.values.filter(v => v > 0).length;
    let tooltipData = [`<span class="tooltip-key">${options.byTissue ? "Tissue" : "Cell type"}</span>: <span class="tooltip-value">${d.group.split(":")[0]}</span>`, `<span class="tooltip-key">${options.byTissue ? "Cell type" : "Tissue"}</span>: <span class="tooltip-value">${d.group.split(":")[1]}</span>`, `<span class="tooltip-key">Total cells</span>: <span class="tooltip-value">${d.total}</span>`, `<span class="tooltip-key">Detected in cells</span>: <span class="tooltip-value">${expressed} (${d.nonzero}%)</span>`, `<span class="tooltip-key">Median (${d.unit})</span>: <span class="tooltip-value">${d.median.toPrecision(4)}</span>`];
    vplot.tooltip.show(tooltipData.join("<br/>"));
  });
}

/**
 * Assign DOM IDs
 * @param {String} rootId 
 * @param {String} tooltipId 
 * @returns 
 */
function _assignIDs(rootId, tooltipId) {
  let id = {
    root: rootId,
    tooltip: tooltipId,
    svg: `${rootId}-svg`,
    clone: `${rootId}-svg-clone`,
    toolbar: `${rootId}-toolbar`,
    buttons: {
      save: `${rootId}-btn-save`,
      all: `${rootId}-btn-all`,
      nonzero: `${rootId}-btn-nonzero`,
      byTissue: `${rootId}-btn-by-tissue`,
      byCell: `${rootId}-btn-by-cell`,
      splitViolin: `${rootId}-btn-split-violin`
    }
  };
  return id;
}

/**
 * Adding the toolbar UI
 * @param {GroupedViolin} plot 
 * @param {Object} id 
 */
function _addToolbar(plot, id) {
  if ($$1(`#${id.toolbar}`).length == 0) $$1("<div/>").attr("id", id.toolbar).appendTo($$1(`#${id.root}`));
  if ($$1(`#${id.clone}`).length == 0) $$1("<div/>").attr("id", id.clone).appendTo($$1(`#${id.root}`));
  plot.createToolbar(id.toolbar, plot.tooltip);
}
function _updatePlot(plot, options, dataT, dataC, nonzeroDataT, nonzeroDataC) {
  let data = [];
  if (options.splitViolin) {
    if (options.byTissue) {
      dataT.forEach(d => {
        d.showHalfViolin = "left";
        d.showBoxplot = false;
      });
      nonzeroDataT.forEach(d => d.showHalfViolin = "right");
      data = dataT.concat(nonzeroDataT);
    } else {
      dataC.forEach(d => {
        d.showHalfViolin = "left";
        d.showBoxplot = false;
      });
      nonzeroDataC.forEach(d => d.showHalfViolin = "right");
      data = dataC.concat(nonzeroDataC);
    }
  } else {
    if (options.showAll && options.byTissue) data = dataT;else if (!options.showAll && options.byTissue) data = nonzeroDataT;else if (options.showAll && !options.byTissue) data = dataC;else data = nonzeroDataC;
    data.forEach(d => {
      d.showHalfViolin = undefined;
      d.showBoxplot = true;
    });
  }
  plot.updateData(data, false, !options.splitViolin);
  const xDomain = _customizeXDomain(plot.data.map(d => d.group).sort(ascending$1));
  plot.updateXScale(xDomain, true);
  _customizePlot(plot, options);
}
function _createButtons(plot, options, ids, callback) {
  // create toolbar buttons and assign callback definitions
  let showAll = () => {
    options.showAll = true;
    options.splitViolin = false;
    callback();
    _updateButtons(options, ids);
  };
  let showNonZero = () => {
    options.showAll = false;
    options.splitViolin = false;
    callback();
    _updateButtons(options, ids);
  };
  let groupByTissue = () => {
    options.byTissue = true;
    callback();
    _updateButtons(options, ids);
  };
  let groupByCell = () => {
    options.byTissue = false;
    callback();
    _updateButtons(options, ids);
  };
  let splitViolin = () => {
    options.showAll = false;
    options.splitViolin = !options.splitViolin;
    callback();
    _updateButtons(options, ids);
  };
  // the appearing order of the buttons is determined as the order they are created
  plot.toolbar.createButton(ids.buttons.all, "All", "All cells", showAll);
  plot.toolbar.createButton(ids.buttons.nonzero, "Nonzero", "Expressing cells only", showNonZero);
  plot.toolbar.createButton(ids.buttons.splitViolin, "Split", "All vs expressing cells", splitViolin);
  plot.toolbar.createButton(ids.buttons.byCell, "C", "Group violins by cell type", groupByCell);
  plot.toolbar.createButton(ids.buttons.byTissue, "T", "Group violins by tissue", groupByTissue);
  // plot.toolbar.createButton(ids.buttons.filter, "fa-filter", "Filter options");
  plot.toolbar.createDownloadSvgButton(ids.buttons.save, ids.svg, `${ids.root}-save.svg`, ids.clone);
  _updateButtons(options, ids);
}
function _updateButtons(options, ids) {
  // update UI button styling based on the current selected options
  select(`#${ids.buttons.all}`).classed("highlight active", options.showAll && !options.splitViolin);
  select(`#${ids.buttons.nonzero}`).classed("highlight active", !options.showAll && !options.splitViolin);
  select(`#${ids.buttons.byTissue}`).classed("highlight active", options.byTissue);
  select(`#${ids.buttons.byCell}`).classed("highlight active", !options.byTissue);
  select(`#${ids.buttons.splitViolin}`).classed("highlight active", options.splitViolin);
}
var SingleCellExpressionViolinPlot = {
  launch: launch$1
};

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
function launchBulkTissueViolinPlot(rootId, tooltipRootId, gencodeId, plotTitle = "Bulk Tissue Gene Expression Violin Plot", urls = getGtexUrls(), margins = {
  top: 50,
  right: 50,
  bottom: 150,
  left: 100
}, dimensions = {
  w: window.innerWidth * 0.8,
  h: 250
}) {
  launch$2(rootId, tooltipRootId, gencodeId, plotTitle, urls, margins, dimensions);
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
function launchSingleCellViolinPlot(rootId, tooltipRootId, gencodeId, dimension = {
  width: window.innerWidth * 0.9,
  height: 150
}, margin = {
  top: 180,
  right: 0,
  bottom: 20,
  left: 80
}, url = getGtexUrls()) {
  launch$1(rootId, tooltipRootId, gencodeId, dimension, margin, url);
}
var GeneExpressionViolinPlot = {
  launchBulkTissueViolinPlot,
  launchSingleCellViolinPlot
};

/**
 * Generate a list of x*y data objects with random values
 * The data object has this structure: {x: xlabel, y: ylabel, value: some value, displayValue: some value}
 * @param par
 * @returns {Array}
 */
function generateRandomMatrix(par = {
  x: 20,
  y: 20,
  scaleFactor: 1,
  diverging: false,
  bubble: false
}) {
  let X = range(1, par.x + 1); // generates a 1-based list.
  let Y = range(1, par.y + 1);
  let data = [];
  X.forEach(x => {
    x = "x" + x.toString();
    Y.forEach(y => {
      y = "y" + y.toString();
      let v = Math.random() * par.scaleFactor;
      v = par.diverging && Math.random() < 0.5 ? -v : v; // randomly assigning negative and positive values
      data.push({
        x: x,
        y: y,
        value: v,
        displayValue: parseFloat(v.toExponential()).toPrecision(3),
        r: par.bubble ? Math.random() * 30 : undefined // only relevant to bubble map
      });
    });
  });
  return data;
}

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
/*
This class defines a gene model (or isoform), rendering the exons and junctions of a given gene. The model is rendered based on
genomic positions, regardless of the strand and transcriptional direction.

TODO: simplify isoform structure rendering?
 */

class GeneModel {
  /**
   * constructor
   * @param gene {Object} with attributes: strand, transcriptId, geneSymbol
   * @param exons {List} of exon objects with attributes: chrom, chromStart, chromEnd, length, exonNumber, exonId
   * @param exonsCurated {List} of exon objects in the final gene model. This is pretty specific to GTEx. If this list isn't available for your data, then just pass in the same exon list again.
   * @param junctions {List} of junction objects with attributes: chrom, chromStart, chromEnd, junctionId
   * @param isIsoform {Boolean}
   * @param maxIntronLength {Integer} the maximum length of intron. Intron rendering is capped at this value
   * @param minExonWidth {Integer} the minimum width (pixels) of the exon rectangle.
   */

  /** NOTE: the exonNumber in exons & exonsCurated don't refer to the same exons (at least this is the case in GTEx)
   *  To ensure correct exon mapping of the curated gene model to the original model, here we use genomic position.
   */
  constructor(gene, exons, exonsCurated, junctions, isIsoform = false, maxIntronLength = 1000, minExonWidth = 0) {
    this.gene = gene;
    this.exons = exons;
    if (this.gene.strand == "+") this.exons.sort((a, b) => {
      return Number(a.exonNumber) - Number(b.exonNumber);
    });else this.exons.sort((a, b) => {
      return Number(b.exonNumber) - Number(a.exonNumber);
    });
    this.exonsCurated = exonsCurated.sort((a, b) => {
      return Number(a.exonNumber) - Number(b.exonNumber);
    });
    this.junctions = junctions.sort((a, b) => {
      if (a.junctionId < b.junctionId) return -1;
      if (a.junctionId > b.junctionId) return 1;
      return 0;
    }); // sorted by junction ID
    this.isIsoform = isIsoform;
    this.maxIntronLength = maxIntronLength;

    // hard-coded for now
    this.intronLength = 0; // fixed fake intron length in base pairs, obsolete?
    this.minExonWidth = minExonWidth; // minimum exon width in pixels
    this.nullColor = "#DDDDDD";
  }
  changeTextlabel(dom, label) {
    dom.selectAll("#modelInfo").text(label);
  }

  /**
   *
   * @param dom {Object} of D3
   * @param jdata {List} of junction expression objects
   * @param edata {List} of exon expression objects
   * @param jscale {D3 scale} of colors of junction data
   * @param escale {D3 scale} of colors of exon data
   */
  addData(dom, jdata, edata, jscale, escale) {
    if (jdata !== undefined) {
      dom.selectAll(".junc").style("fill", d => {
        const v = jdata.filter(z => z.junctionId == d.junctionId)[0];
        const jcolor = v.value == 0 ? this.nullColor : jscale(v.value);
        dom.selectAll(".junc-curve").filter(`.junc${d.junctionId}`).style("stroke", jcolor);
        return jcolor;
      });
    }
    dom.selectAll(".exon-curated").style("fill", d => {
      const v = edata.filter(z => z.exonId == d.exonId)[0];
      if (v === undefined) throw `${d.exonId} has no data`;
      const ecolor = v.value == 0 ? this.nullColor : escale(v.value);
      return ecolor;
    });
  }

  /**
   * render the SVG of the gene model
   * @param dom: an SVG dom object
   * @param config
    */
  render(dom, config) {
    this.setXscale(config.w);

    /* Note: exon.x, exon.w are in pixels for visual rendering */
    /* Note: exon.length is in base pairs */
    // calculating x and w for each exon
    const exonY = config.h / 2; // TODO: remove hard-coded values
    this.exons.forEach((d, i) => {
      if (i == 0) {
        d.x = 0;
      } else {
        d.x = this.exons[i - 1].x + this.exons[i - 1].w + this.xScale(d.intronLength > this.maxIntronLength ? this.maxIntronLength : d.intronLength);
      }
      d.w = this.xScale(d.length) < this.minExonWidth ? this.minExonWidth : this.xScale(d.length);
    });

    // calculaing x and w of the rectangle for each curated exon on the final gene model
    this.exonsCurated.forEach((d, i) => {
      // first, map each final curated exon to the original full gene model--find the original exon
      // find the original exon
      d.oriExon = this._findExon(d.chromStart) || this._findExon(d.chromEnd);
      if (d.oriExon === undefined) {
        // if not found
        console.warn(`${this.gene.transcriptId}-${d.exonId} can't map to full gene model`);
        return; // ignore unmappable exons, this happens at times (why?)
      }

      // calculate for x
      if (Number(d.oriExon.chromStart) == Number(d.chromStart)) d.x = d.oriExon.x;else {
        // if this exon doesn't start from the oriExon start pos
        const dist = Number(d.chromStart) - Number(d.oriExon.chromStart) + 1;
        d.x = d.oriExon.x + this.xScale(dist);
      }

      // calculate for w
      if (d.length === undefined) d.length = Number(d.chromEnd) - Number(d.chromStart) + 1;
      d.w = this.xScale(d.length) < this.minExonWidth ? this.minExonWidth : this.xScale(d.length);
    });
    if (!this.isIsoform) {
      // NOTE: do not alter the rendering order of visual components.
      // if this is a gene model, not an isoform
      // calculating positions for each junction
      this.junctions = this.junctions.filter(d => {
        // first filter unmapped junctions
        d.startExon = this._findExon(d.chromStart);
        d.endExon = this._findExon(d.chromEnd);
        return d.startExon !== undefined && d.endExon !== undefined;
      });
      this.junctions.sort((a, b) => {
        // first sort by chromStart
        if (+a.chromStart < +b.chromStart) return -1;
        if (+a.chromStart > +b.chromStart) return 1;

        // then sort by chromEnd:
        if (+a.chromEnd < +b.chromEnd) return -1;
        if (+a.chromEnd > +b.chromEnd) return 1;
        return 0;
      });
      this.junctions.forEach((d, i) => {
        // d.startExon = this._findExon(d.chromStart);
        // d.endExon = this._findExon(d.chromEnd);
        d.displayName = `Junction ${i + 1}`;

        // d.displayName = `Exon ${d.startExon.exonNumber} - ${d.endExon.exonNumber}`;
        // if (d.startExon.exonNumber == d.endExon.exonNumber) {
        //     console.warn(d.junctionId + " is in Exon: " +d.startExon.chromStart + " - " + d.startExon.chromEnd );
        // } // what is happening

        // d.filtered = false;

        // calculate for positions
        const dist = Number(d.chromStart) - Number(d.startExon.chromStart) + 1;
        const dist2 = Number(d.chromEnd) - Number(d.endExon.chromStart) + 1;
        d.startX = d.startExon.x + this.xScale(dist);
        d.endX = d.endExon.x + this.xScale(dist2);
        d.cx = d.startX + (d.endX - d.startX + 1) / 2; // junction is rendered at the midpoint between startX and endX
        d.cy = exonY - 15 * (Math.abs(Number(d.endExon.exonNumber) - Number(d.startExon.exonNumber)) + 0.5);
        if (d.cy < 0) d.cy = 0;
      });

      // handling edge case: overlapping junctions, add jitter
      // a.reduce((r,k)=>{r[k]=1+r[k]||1;return r},{})
      const counts = this.junctions.reduce((r, d) => {
        r[d.displayName] = 1 + r[d.displayName] || 1;
        return r;
      }, {});
      this.junctions.forEach(d => {
        // jitter
        if (counts[d.displayName] > 1) {
          // overlapping junctions
          // d.cx += Math.random()*20;
          d.cy -= Math.random() * 15;
        }
      });

      /***** render junctions */
      const curve = line().x(d => d.x).y(d => d.y).curve(curveCardinal);
      this.junctions.forEach((d, i) => {
        dom.append("path").datum([{
          x: d.startX,
          y: exonY
        }, {
          x: d.cx,
          y: d.cy
        }, {
          x: d.endX,
          y: exonY
        }]) // the input points to draw the curve
        .attr("class", `junc-curve junc${d.junctionId}`).attr("d", curve).style("stroke", "#92bcc9");
      });
      const juncDots = dom.selectAll(".junc").data(this.junctions);

      // updating elements
      juncDots.attr("cx", d => d.cx);
      juncDots.attr("cy", d => d.cy); // TODO: remove hard-coded values

      // entering new elements
      juncDots.enter().append("circle").attr("class", d => `junc junc${d.junctionId}`).attr("cx", d => d.cx).attr("cy", d => d.cy).merge(juncDots).attr("r", 4).style("fill", "rgb(86, 98, 107)");

      /***** rendering full gene model exons */
      const exonRects = dom.selectAll(".exon").data(this.exons);

      // updating elements
      exonRects.attr("x", d => d.x);
      exonRects.attr("y", exonY);

      // entering new elements
      exonRects.enter().append("rect").attr("class", d => `exon exon${d.exonNumber}`).attr("y", exonY).attr("rx", 2).attr("ry", 2).attr("width", d => d.w).attr("height", 15) // TODO: remove hard-coded values
      .attr("x", d => d.x).merge(exonRects).style("cursor", "default");

      // model info text label
      dom.append("text").attr("id", "modelInfo") // TODO: no hard-coded value
      .attr("text-anchor", "end").attr("x", this.xScale(0)).attr("y", exonY - 10).style("font-size", 12).text("Gene Model");
    } else {
      // if this is an isoform, render the intron line
      dom.append("line").attr("x1", this.exonsCurated[0].x).attr("x2", this.exonsCurated[this.exonsCurated.length - 1].x).attr("y1", exonY + 15 / 2).attr("y2", exonY + 15 / 2).classed("intron", true);
    }

    /***** rendering curated exons on the final gene model or isoform exons */
    const exonRects2 = dom.selectAll(".exon-curated").data(this.exonsCurated);

    // updating elements
    exonRects2.attr("x", d => d.x);
    exonRects2.attr("y", exonY);

    // entering new elements
    exonRects2.enter().append("rect").attr("class", d => this.isIsoform ? "exon-curated" : `exon-curated exon-curated${d.exonNumber}`).attr("y", exonY).attr("width", d => d.w).attr("height", 15) // TODO: remove hard-coded values
    .attr("x", d => d.x).merge(exonRects2).style("fill", "#eee").style("cursor", "default");

    /***** rendering text labels */
    if (config.labelOn == "left" || config.labelOn == "both") {
      dom.append("text").attr("id", "modelLabel") // TODO: no hard-coded value
      .attr("text-anchor", "end").attr("x", this.xScale.range()[0] - 5).attr("y", exonY + 7.5).style("font-size", "9px").text(this.gene.transcriptId === undefined ? `${this.gene.geneSymbol}` : this.gene.transcriptId);
    }
    if (config.labelOn == "right" || config.labelOn == "both") {
      dom.append("text").attr("id", "modelLabelRight") // TODO: no hard-coded value
      .attr("text-anchor", "start").attr("x", this.xScale.range()[1] + 50).attr("y", exonY + 7.5).style("font-size", "9px").text(this.gene.transcriptId === undefined ? `${this.gene.geneSymbol}` : this.gene.transcriptId);
    }
  }
  setXscale(w) {
    // concept explained:
    // assuming the canvas width is fixed
    // the task is how to render all exons + fixed-width introns within the canvas
    // first find the largest exon,
    // then set the x scale of the canvas to accommodate max(exon length)*exon counts,
    // this ensures that there's always space for rendering introns
    // the fixed intron width is calculated as such:
    // ((max(exon length) * exon counts) - total exon length)/(exon counts - 1)

    this.exons.sort((a, b) => {
      if (Number(a.chromStart) < Number(b.chromStart)) return -1;
      if (Number(a.chromStart) > Number(b.chromStart)) return 1;
      return 0;
    });
    let sum = 0;
    this.exons.forEach((d, i) => {
      d.length = Number(d.chromEnd) - Number(d.chromStart) + 1;
      if (i == 0) {
        // the first exon
        sum += d.length;
      } else {
        let nb = this.exons[i - 1]; // the upstream neighbor exon
        d.intronLength = Number(d.chromStart) - Number(nb.chromEnd) + 1;
        sum += d.length + (d.intronLength > this.maxIntronLength ? this.maxIntronLength : d.intronLength);
      }
    });
    const domain = [0, sum];
    const range = [0, w];
    this.xScale = linear().domain(domain).range(range);
  }
  setXscaleFixIntron(w) {
    // concept explained:
    // assuming the canvas width is fixed
    // the task is how to render all exons + fixed-width introns within the canvas
    // first find the largest exon,
    // then set the x scale of the canvas to accommodate max(exon length)*exon counts,
    // this ensures that there's always space for rendering introns
    // the fixed intron width is calculated as such:
    // ((max(exon length) * exon counts) - total exon length)/(exon counts - 1)

    this.exons.forEach(d => {
      d.length = Number(d.chromEnd) - Number(d.chromStart) + 1;
    });
    const maxExonLength = max$1(this.exons, d => d.length);
    const domain = [0, maxExonLength * this.exons.length];
    const range = [0, w];
    this.xScale = linear().domain(domain).range(range);

    // fixed intron width
    const minLength = this.xScale.invert(this.minExonWidth); // the minimum exon length that maps to minimum exon width (pixels) using xScale
    const totalExonLength = sum(this.exons, d => d.length > minLength ? d.length : minLength); // if an exon is shorter than min length, use min length
    this.intronLength = (maxExonLength * this.exons.length - totalExonLength) / (this.exons.length - 1); // caluclate the fixed intron length
  }

  /**
   * For a given position, find the exon
   * @param pos {Integer}: a genomic position
   * @private
   */
  _findExon(pos) {
    pos = Number(pos);
    const results = this.exons.filter(d => {
      return Number(d.chromStart) - 1 <= pos && Number(d.chromEnd) + 1 >= pos;
    });
    if (results.length == 1) return results[0];else if (results.length == 0) {
      console.warn("No exon found for: " + pos);
      return undefined;
    } else {
      console.warn("More than one exons found for: " + pos);
      return undefined;
    }
  }
}

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
/*
This class is a viewer of transcriptional isoforms, each is render as a track
 */

class IsoformTrackViewer {
  /**
   *
   * @param isoforms {List} of isoform objects with attr: transcriptId, start, end
   * @param isoformExons {Dictionary} of lists of isoform exons indexed by isoform ID (transcriptId)
   * @param modelExons {List} of reference exons...
   * @param config
   */
  constructor(isoforms, isoformExons, modelExons, config) {
    this.isoforms = isoforms;
    this.isoformExons = isoformExons;
    this.modelExons = modelExons;
    this.visualDom = undefined;
    this.config = config;
    this.nullColor = "#DDDDDD";
  }
  showData(data, colorScale, barScale, dataLabel, sort = true) {
    if (sort) {
      data.sort((a, b) => {
        return -(a.displayValue - b.displayValue);
      }); // first sort the expression data
      const ids = data.map(d => d.transcriptId);
      this.sortTracks(ids);
    }
    data.forEach(d => {
      const isoform = this.visualDom.select(`#${d.transcriptId.replace(".", "_")}`);
      isoform.selectAll(".exon-curated").style("fill", d.value == 0 ? this.nullColor : colorScale(d.value));
    });

    // render the lollipop graph
    this.visualDom.select(".lollipopGraph").remove();
    const lollipopGraph = this.visualDom.append("g").classed("lollipopGraph", true).attr("transform", "translate(-100, 13)"); // TODO: remove hard-coded values

    const lollipops = lollipopGraph.selectAll(".lollipop").data(data);
    const g = lollipops.enter().append("g").classed("lollipop", true);
    g.append("line").attr("x1", 0).attr("y1", d => this.yScale(d.transcriptId)).attr("y2", d => this.yScale(d.transcriptId)).style("stroke", d => d.value == 0 ? this.nullColor : colorScale(d.value)).style("stroke-width", 2).transition().duration(1000).attr("x2", d => d.value == 0 ? 0 : barScale(d.value));
    g.append("circle").attr("cx", 0).attr("cy", d => this.yScale(d.transcriptId)).attr("r", 5).style("fill", d => d.value == 0 ? this.nullColor : colorScale(d.value)).transition().duration(1000).attr("cx", d => barScale(d.value));

    // add the axes
    lollipopGraph.append("g").attr("class", "lollipop-axis").attr("transform", `translate(0,-${this.yScale.bandwidth() / 2})`).call(axisTop(barScale).ticks(3));
    lollipopGraph.append("text").attr("id", "lolliLabel").attr("x", 0).attr("y", -40).attr("text-anchor", "end").style("font-size", 9).text("TPM"); // TODO: this should be a user-defined text

    lollipopGraph.append("g").attr("class", "lollipop-axis").attr("transform", `translate(0,-${this.yScale.bandwidth() / 2})`).call(axisRight(this.yScale).tickValues([]) // show no ticks
    );

    // data label
    lollipopGraph.append("text").attr("id", "lolliLabel").attr("x", 10).attr("y", -20).text(`Transcript Expression in ${dataLabel}`).attr("text-anchor", "start").style("font-size", "12px");
  }
  sortTracks(ylist) {
    this.setYscale(this.config.h, ylist);
    this.render(true);
  }
  render(redraw = false, dom = undefined, labelOn = "left", duration = 1000) {
    if (dom === undefined && this.visualDom === undefined) throw "Fatal Error: must provide a dom element";
    if (dom === undefined) dom = this.visualDom;else this.visualDom = dom;
    if (this.yScale === undefined) this.setYscale(this.config.h);
    const isoTracks = dom.selectAll(".isotrack").data(this.isoforms.map(d => d.transcriptId));

    // update old isoform tracks, if any
    isoTracks.transition().duration(duration).attr("transform", d => {
      return `translate(0, ${this.yScale(d)})`;
    });

    // update new tracks
    isoTracks.enter().append("g").attr("id", d => d.replace(".", "_")).attr("class", "isotrack").attr("transform", d => {
      return `translate(0, 0)`;
    })

    // .merge(isoTracks)
    .transition().duration(duration / 2).attr("transform", d => {
      return `translate(0, ${this.yScale(d)})`;
    });
    if (redraw) return;
    this._renderModels(this.config.w, labelOn);
  }
  _renderModels(w, labelOn = "left") {
    this.isoforms.forEach(isoform => {
      let reference = this.modelExons === undefined || this.modelExons === null ? this.isoformExons[isoform.transcriptId] : this.modelExons;
      const model = new GeneModel(isoform, reference, this.isoformExons[isoform.transcriptId], [], true);
      const isoformG = select(`#${isoform.transcriptId.replace(".", "_")}`);
      model.render(isoformG, {
        w: w,
        h: this.yScale.bandwidth(),
        labelOn: labelOn
      });
    });
  }
  setYscale(h, ylist = undefined) {
    if (ylist === undefined) ylist = this.isoforms.map(d => d.transcriptId);
    this.yScale = band().domain(ylist).range([0, h]).padding(.05);
  }
}

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */

class HalfMap {
  /**
   * HalfMap is a special heatmap designed for a symmetrical matrix
   * @param data {Object} TODO: describe the data structure
   * @param cutoff
   * @param useLog
   * @param logBase
   * @param colorScheme
   * @param tooltipId
   */
  constructor(data, cutoff = 0.0, useLog = true, logBase = 10, colorScheme = "Greys", colorScaleDomain = [0, 1]) {
    this.data = this._unique(data); // remove redundancy
    this.dataDict = {};
    this.cutoff = cutoff;
    this.filteredData = this._filter(this.data, this.cutoff);
    this.dataDict = this._generateDataDict(this.filteredData);
    this.useLog = useLog;
    this.logBase = logBase;
    this.colorScheme = colorScheme;

    // color scale normally doesn't change with the same data set
    // therefore can be defined at instantiation
    this.colorScale = this._setColorScale(colorScaleDomain);

    // the following scales could change depending on the user defined dimensions
    // therefore they are undefined at instantiation
    this.xScale = undefined;
    this.yScale = undefined;
    this.labelScale = undefined;
    this.svg = undefined;
    this.canvas = undefined;
    this.config = undefined;

    // peripheral features
    this.tooltip = undefined;
  }
  saveSvgObj(svg) {
    this.svg = svg;
  }
  saveCanvasObj(canvas) {
    this.canvas = canvas;
  }
  saveConfig(config) {
    this.config = config;
  }
  addTooltip(parentId) {
    if (select(`#${parentId}`).empty()) throw "DOM ID is missing: " + parentId;
    let tooltipId = parentId + "-tooltip";
    if (select(`#${tooltipId}`).empty()) select(`#${parentId}`).append("div").attr("id", tooltipId);
    this.tooltip = new Tooltip(tooltipId, false, 40, 0);
    select(`#${tooltipId}`).classed("half-map-tooltip", true);
  }
  redraw(xDomain, yDomain, range = undefined, colorScaleDomain = [0, 1], showLabels = false, labelAngle = undefined) {
    if (range !== undefined) this.config.w = Math.abs(range[1] - range[0]);
    this.draw(this.canvas, this.svg, this.config, colorScaleDomain, showLabels, labelAngle, xDomain, yDomain);
  }
  draw(canvas, svg, dimensions = {
    w: 600,
    top: 20,
    left: 20
  }, colorScaleDomain = [0, 1], showLabels = false, labelAngle = 90, xScaleDomain = undefined, yScaleDomain = undefined) {
    this._drawCanvas(canvas, dimensions, colorScaleDomain, xScaleDomain, yScaleDomain);
    let drawCells = false;
    this.drawSvg(svg, dimensions, drawCells, showLabels, labelAngle, colorScaleDomain, xScaleDomain, yScaleDomain);
  }
  drawColorLegend(dom, legendConfig = {
    x: 0,
    y: 0
  }, ticks = 5, unit = "", colorScaleDomain = [0, 1]) {
    if (this.colorScale === undefined) this._setColorScale(colorScaleDomain);
    drawColorLegend(unit, dom, this.colorScale, legendConfig, this.useLog, ticks, this.logBase, {
      h: 20,
      w: 10
    }, "v");
  }

  // private methods
  _log(v) {
    const adjust = 1;
    return Math.log(Number(v + adjust)) / Math.log(this.logBase);
  }
  _drawCanvas(canvas, dimensions = {
    w: 600,
    top: 20,
    left: 20
  }, colorScaleDomain = [0, 1], xScaleDomain = undefined, yScaleDomain = undefined) {
    this._setScales(dimensions, colorScaleDomain, xScaleDomain, yScaleDomain);
    let context = canvas.node().getContext("2d");

    // transform the canvas
    context.save();
    context.rotate(Math.PI * (-45 / 180)); // rotate counterclockwise (negative) 45 degrees

    context.clearRect(-dimensions.w, -dimensions.w, dimensions.w * 2, dimensions.w * 2);
    // LD canvas rendering from GEV old code
    this.filteredData.forEach(d => {
      let x = this.xScale(d.x);
      let y = this.yScale(d.y);
      if (x === undefined || y === undefined) return;
      d.color = d.value == 0 ? "#fff" : this.useLog ? this.colorScale(this._log(d.value)) : this.colorScale(d.value);
      context.fillStyle = this.colorScale(d.value);
      context.fillRect(x, y, this.xScale.bandwidth(), this.yScale.bandwidth());
      // uncomment the following for debugging
      // context.textAlign = "left";
      // context.fillStyle = "white";
      // context.font = "10px Open Sans";
      // context.fillText(d.x, x+10, y+10);
      // context.fillText(d.y, x+10, y+30);
    });
    context.restore();
  }
  drawSvg(svg, dimensions, drawCells = true, showLabels = true, labelAngle = 90, colorScaleDomain = [0, 1], xScaleDomain, yScaleDomain = undefined) {
    if (drawCells) {
      // usually this is not rendered when the canvas is done
      this._setScales(dimensions, colorScaleDomain, xScaleDomain, yScaleDomain);
      let mapG = svg.append("g").attr("clip-path", "url(#clip)");
      let cells = mapG.selectAll(".half-map-cell").data(this.filteredData);

      // add new rects
      cells.enter().append("rect").attr("class", "half-map-cell").attr("row", d => `y${this.yScale.domain().indexOf(d.y)}`).attr("column", d => `x${this.xScale.domain().indexOf(d.x)}`).attr("width", this.xScale.bandwidth()).attr("height", this.yScale.bandwidth()).attr("x", d => this.xScale(d.x)).attr("y", d => this.yScale(d.y)).attr("transform", "rotate(-45)").merge(cells).style("fill", d => d.value == 0 ? "#fff" : this.useLog ? this.colorScale(this._log(d.value)) : this.colorScale(d.value));
    }
    if (showLabels) {
      this._setLabelScale(dimensions);
      svg.selectAll().data(this.labelScale.domain()).enter().append("text").attr("class", (d, i) => `half-map-label l${i}`).attr("x", 0).attr("y", 0).attr("text-anchor", "start").style("cursor", "none").attr("transform", d => {
        let x = this.labelScale(d) - this.labelScale.step() / 2;
        let y = -5;
        return `translate(${x}, ${y}) rotate(-${labelAngle})`;
      }).text(d => d);
    }
    let cursor = svg.append("rect").attr("class", "half-map-cursor").attr("x", 0).attr("y", 0).attr("width", this.xScale.bandwidth()).attr("height", this.yScale.bandwidth()).style("stroke", "#d2111b").style("stroke-width", "1px").style("fill", "none").style("display", "none");
    svg.on("mouseout", () => {
      cursor.style("display", "none");
      this.tooltip.hide();
      svg.selectAll(".half-map-label").classed("highlighted", false);
    });
    select(svg.node().parentNode).style("cursor", "none").style("position", "absolute").on("mousemove", () => {
      let pos = mouse(svg.node()); // retrieve the mouse position relative to the SVG element
      let x = pos[0];
      let y = pos[1];

      // find the colliding cell's coordinates (before transformation)
      let radian = Math.PI * (45 / 180); // the radian at 45 degree angle
      // let x2 = x*Math.cos(radian) - y*Math.sin(radian) - this.xScale.bandwidth()/2;
      // let y2 = x*Math.sin(radian) + y*Math.cos(radian) - this.yScale.bandwidth()/2;
      let x2 = x * Math.cos(radian) - y * Math.sin(radian);
      let y2 = x * Math.sin(radian) + y * Math.cos(radian);
      if (x < 0 || y < 0 || x2 < 0 || y2 < 0) {
        this.tooltip.hide();
        cursor.style("display", "none");
        return;
      }
      let i = Math.floor(x2 / this.xScale.step());
      let j = Math.floor(y2 / this.yScale.step());
      // show tooltip
      let col = this.xScale.domain()[i];
      let row = this.yScale.domain()[j];
      let cell = this.dataDict[col + row];
      // console.log([x, y, x2, y2, i, j, col, row]); // debugging
      if (cell !== undefined) {
        cursor.attr("transform", `translate(${x},${y}) rotate(-45)`);
        cursor.style("display", "block");
        const tooltipData = [`<span class="tooltip-key">Variant 1</span>: <span class="tooltip-value">${col}</span>`, `<span class="tooltip-key">Variant 2</span>: <span class="tooltip-value">${row}</span>`, `<span class="tooltip-key">LD Value</span>: <span class="tooltip-value">${cell.displayValue}</span>`];
        this.tooltip.show(tooltipData.join("<br/>"));
        if (showLabels) {
          svg.selectAll(".half-map-label").classed("highlighted", false); // clear previous highlighted labels
          svg.select(`.l${i}`).classed("highlighted", true);
          svg.select(`.l${j}`).classed("highlighted", true);
        }
      } else {
        this.tooltip.hide();
        cursor.style("display", "none");
      }
    });
  }
  _unique(data) {
    // first sort the data based on the x, y alphabetical order
    data.sort((a, b) => {
      if (a.x < b.x) return -1;
      if (a.x > b.x) return 1;else {
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
        return 0;
      }
    });
    let pairs = {};
    return data.filter(d => {
      // check redundant data
      let p = d.x + d.y;
      let p2 = d.y + d.x;
      if (pairs.hasOwnProperty(p) || pairs.hasOwnProperty(p2)) return false;
      pairs[p] = true;
      return true;
    });
  }
  /**
   * Filter redundant data in a symmetrical matrix
   * @param data
   * @param cutoff {Number} filter data by this minimum value
   * @returns {*}
   * @private
   */
  _filter(data, cutoff) {
    return data.filter(d => {
      if (d.value < cutoff) return false;
      return true;
    });
  }

  /**
   * Generate a data dictionary indexed by x and y, for fast data look up
   * @param data {List}: a list of objects with attributes x and y
   * @private
   */
  _generateDataDict(data) {
    let dict = {};
    data.forEach(d => {
      dict[d.x + d.y] = d;
      dict[d.y + d.x] = d;
    });
    return dict;
  }
  _setScales(dimensions = {
    w: 600,
    top: 20,
    left: 20
  }, colorScaleDomain = [0, 1], xScaleDomain, yScaleDomain) {
    if (xScaleDomain || this.xScale === undefined) this._setXScale(dimensions, xScaleDomain);
    if (yScaleDomain || this.yScale === undefined) this._setYScale(dimensions, yScaleDomain);
    if (this.colorScale === undefined) this._setColorScale(colorScaleDomain);
  }
  _setXScale(dim = {
    w: 600
  }, xList = undefined) {
    if (xList === undefined) {
      xList = nest().key(d => d.x) // group this.data by d.x
      .entries(this.data).map(d => d.key) // then return the unique list of d.x
      .sort((a, b) => {
        return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
      });
    }
    this.xScale = band() // reference: https://github.com/d3/d3-scale#scaleBand
    .domain(xList) // perhaps it isn't necessary to store xList, it could be retrieved by xScale.domain
    .range([0, dim.w / Math.sqrt(2)]).padding(.05); // temporarily hard-coded value
  }
  _setYScale(dim = {
    w: 600
  }, yList) {
    // use d3 nest data structure to find the unique list of y labels
    // reference: https://github.com/d3/d3-collection#nests
    if (yList === undefined) {
      yList = nest().key(d => d.y) // group this.data by d.x
      .entries(this.data).map(d => d.key) // then return the unique list of d.x
      .sort((a, b) => {
        return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
      });
    }
    this.yScale = band() // reference: https://github.com/d3/d3-scale#scaleBand
    .domain(yList) // perhaps it isn't necessary to store xList, it could be retrieved by xScale.domain
    .range([0, dim.w / Math.sqrt(2)]).padding(.05); // temporarily hard-coded value
  }
  _setLabelScale(dim = {
    w: 600
  }) {
    if (this.xScale === undefined) this._setXScale();
    let xList = this.xScale.domain(); // TODO: this assumes that the half map is symmetrical
    this.labelScale = band().domain(xList).range([0, dim.w]).padding(.05);
  }
  _setColorScale(domain) {
    let useLog = this.useLog;
    let data = domain === undefined ? this.data.map(d => useLog ? this._log(d.value) : d.value) : domain;
    this.colorScale = setColorScale(data, this.colorScheme);
  }
}

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */

const demoData = {
  heatmap: generateRandomMatrix({
    x: 50,
    y: 10,
    scaleFactor: 1000
  }),
  dendroHeatmap: {
    rowTree: "(((TP53:0.17,SLK:0.17):1.18,NDRG4:1.34):1.33,ACTN3:2.67);",
    colTree: "(((Adipose Visceral Omentum:0.06,Adipose Subcutaneous:0.06):0.00,Bladder:0.06):0.16,Adrenal Gland:0.22);",
    heatmap: [{
      "y": "SLK",
      "value": 35.505,
      "x": "Adipose Subcutaneous",
      "unit": "TPM"
    }, {
      "y": "SLK",
      "value": 29.28,
      "x": "Adipose Visceral Omentum",
      "unit": "TPM"
    }, {
      "y": "SLK",
      "value": 17.405,
      "x": "Adrenal Gland",
      "unit": "TPM"
    }, {
      "y": "SLK",
      "value": 53.29,
      "x": "Bladder",
      "unit": "TPM"
    }, {
      "y": "NDRG4",
      "value": 12.035,
      "x": "Adipose Subcutaneous",
      "unit": "TPM"
    }, {
      "y": "NDRG4",
      "value": 6.531000000000001,
      "x": "Adipose Visceral Omentum",
      "unit": "TPM"
    }, {
      "y": "NDRG4",
      "value": 134.8,
      "x": "Adrenal Gland",
      "unit": "TPM"
    }, {
      "y": "NDRG4",
      "value": 7.1160000000000005,
      "x": "Bladder",
      "unit": "TPM"
    }, {
      "y": "TP53",
      "value": 29.935,
      "x": "Adipose Subcutaneous",
      "unit": "TPM"
    }, {
      "y": "TP53",
      "value": 23.55,
      "x": "Adipose Visceral Omentum",
      "unit": "TPM"
    }, {
      "y": "TP53",
      "value": 18.515,
      "x": "Adrenal Gland",
      "unit": "TPM"
    }, {
      "y": "TP53",
      "value": 40.51,
      "x": "Bladder",
      "unit": "TPM"
    }, {
      "y": "ACTN3",
      "value": 0.33145,
      "x": "Adipose Subcutaneous",
      "unit": "TPM"
    }, {
      "y": "ACTN3",
      "value": 0.3317,
      "x": "Adipose Visceral Omentum",
      "unit": "TPM"
    }, {
      "y": "ACTN3",
      "value": 0.100005,
      "x": "Adrenal Gland",
      "unit": "TPM"
    }, {
      "y": "ACTN3",
      "value": 0.48100000000000004,
      "x": "Bladder",
      "unit": "TPM"
    }]
  },
  groupedViolinPlot: [{
    group: "Group 1",
    label: "Gene 1",
    values: range(0, 2000).map(randomNormal(2, 1))
  }, {
    group: "Group 1",
    label: "Gene 2",
    values: range(0, 2000).map(randomNormal(5, 1))
  }, {
    group: "Group 1",
    label: "Gene 3",
    values: range(0, 2000).map(randomNormal(10, 1))
  }, {
    group: "Group 2",
    label: "Gene 1",
    values: range(0, 2000).map(randomNormal(5, 1))
  }, {
    group: "Group 2",
    label: "Gene 2",
    values: range(0, 2000).map(randomNormal(3, 1))
  }, {
    group: "Group 2",
    label: "Gene 3",
    values: range(0, 2000).map(randomNormal(1, 1))
  }, {
    group: "Group 3",
    label: "Gene 1",
    values: range(0, 2000).map(randomNormal(2, 1))
  }, {
    group: "Group 3",
    label: "Gene 2",
    values: range(0, 2000).map(randomNormal(3, 1))
  }, {
    group: "Group 3",
    label: "Gene 3",
    values: range(0, 2000).map(randomNormal(5, 1))
  }],
  transcriptTracks: {
    "exons": {
      "ENST00000311595.9": [{
        "chrom": "17",
        "chromEnd": 77071172,
        "exonId": "ENSE00002713933.1",
        "exonNumber": "1",
        "chromStart": 77071151,
        "strand": "+"
      }, {
        "chrom": "17",
        "chromEnd": 77073579,
        "exonId": "ENSE00003672628.1",
        "exonNumber": "2",
        "chromStart": 77073512,
        "strand": "+"
      }, {
        "chrom": "17",
        "chromEnd": 77073946,
        "exonId": "ENSE00003475281.1",
        "exonNumber": "3",
        "chromStart": 77073745,
        "strand": "+"
      }, {
        "chrom": "17",
        "chromEnd": 77075719,
        "exonId": "ENSE00001111713.1",
        "exonNumber": "4",
        "chromStart": 77075571,
        "strand": "+"
      }, {
        "chrom": "17",
        "chromEnd": 77076446,
        "exonId": "ENSE00003651250.1",
        "exonNumber": "5",
        "chromStart": 77076289,
        "strand": "+"
      }, {
        "chrom": "17",
        "chromEnd": 77077155,
        "exonId": "ENSE00003607773.1",
        "exonNumber": "6",
        "chromStart": 77077007,
        "strand": "+"
      }, {
        "chrom": "17",
        "chromEnd": 77078612,
        "exonId": "ENSE00002720924.1",
        "exonNumber": "7",
        "chromStart": 77077980,
        "strand": "+"
      }]
    },
    "transcripts": [{
      "chromosome": "17",
      "end": 77078612,
      "gencodeId": "ENSG00000167280.12",
      "geneSymbol": "ENGASE",
      "start": 77071151,
      "strand": "+",
      "transcriptId": "ENST00000311595.9"
    }]
  },
  bubbleMap: generateRandomMatrix({
    x: 50,
    y: 10,
    scaleFactor: 1,
    diverging: true,
    bubble: true
  }),
  ldPlot: generateRandomMatrix({
    x: 2,
    y: 2,
    scaleFactor: 1
  })
};
({
  groupedViolinByDataset: [{
    group: "GTEx",
    label: "Amygdala",
    values: range(0, 2000).map(randomNormal(2, 3)),
    color: "#a8cbea"
  }, {
    group: "GTEx",
    label: "Cerebellum",
    values: range(0, 1248).map(randomNormal(5, 1)),
    color: "#a8cbea"
  }, {
    group: "GTEx",
    label: "Cortex",
    values: range(0, 1568).map(randomNormal(10, 2)),
    color: "#a8cbea"
  }, {
    group: "Kids First",
    label: "Amygdala",
    values: range(0, 1264).map(randomNormal(2, 1)),
    color: "#a597a1"
  }, {
    group: "Kids First",
    label: "Cerebellum",
    values: range(0, 975).map(randomNormal(3, 2)),
    color: "#a597a1"
  }, {
    group: "Kids First",
    label: "Cortex",
    values: range(0, 467).map(randomNormal(5, 4)),
    color: "#a597a1"
  }],
  groupedViolinByTissue: [{
    label: "GTEx",
    group: "Amygdala",
    values: range(0, 2000).map(randomNormal(2, 3)),
    color: "#a8cbea"
  }, {
    label: "GTEx",
    group: "Cerebellum",
    values: range(0, 1248).map(randomNormal(5, 1)),
    color: "#a8cbea"
  }, {
    label: "GTEx",
    group: "Cortex",
    values: range(0, 1568).map(randomNormal(10, 2)),
    color: "#a8cbea"
  }, {
    label: "Kids First",
    group: "Amygdala",
    values: range(0, 1264).map(randomNormal(2, 1)),
    color: "#a597a1"
  }, {
    label: "Kids First",
    group: "Cerebellum",
    values: range(0, 975).map(randomNormal(3, 2)),
    color: "#a597a1"
  }, {
    label: "Kids First",
    group: "Cortex",
    values: range(0, 467).map(randomNormal(5, 4)),
    color: "#a597a1"
  }],
  groupedViolinBySex: [{
    label: "GTEx (F)",
    group: "Amygdala",
    values: range(0, 978).map(randomNormal(3, 5)),
    color: "#e67f7b"
  }, {
    label: "GTEx (M)",
    group: "Amygdala",
    values: range(0, 834).map(randomNormal(1, 1)),
    color: "#70bcd2"
  }, {
    label: "GTEx (F)",
    group: "Cerebellum",
    values: range(0, 745).map(randomNormal(5, 4)),
    color: "#e67f7b"
  }, {
    label: "GTEx (M)",
    group: "Cerebellum",
    values: range(0, 812).map(randomNormal(5, 2)),
    color: "#70bcd2"
  }, {
    label: "GTEx (F)",
    group: "Cortex",
    values: range(0, 632).map(randomNormal(10, 3)),
    color: "#e67f7b"
  }, {
    label: "GTEx (M)",
    group: "Cortex",
    values: range(0, 431).map(randomNormal(1, 1)),
    color: "#70bcd2"
  }, {
    label: "Kids First (F)",
    group: "Amygdala",
    values: range(0, 1264).map(randomNormal(2, 1)),
    color: "#e67f7b"
  }, {
    label: "Kids First (M)",
    group: "Amygdala",
    values: range(0, 1264).map(randomNormal(2, 3)),
    color: "#70bcd2"
  }, {
    label: "Kids First (F)",
    group: "Cerebellum",
    values: range(0, 975).map(randomNormal(3, 4)),
    color: "#e67f7b"
  }, {
    label: "Kids First (M)",
    group: "Cerebellum",
    values: range(0, 975).map(randomNormal(3, 1)),
    color: "#70bcd2"
  }, {
    label: "Kids First (F)",
    group: "Cortex",
    values: range(0, 467).map(randomNormal(5, 1)),
    color: "#e67f7b"
  }, {
    label: "Kids First (M)",
    group: "Cortex",
    values: range(0, 467).map(randomNormal(3, 2)),
    color: "#70bcd2"
  }]
});
const ldPlotDemoConfig = {
  id: "gtexVizLdPlot",
  data: demoData.ldPlot,
  cutoff: 0.0,
  width: 1000,
  // outer width
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
function ldPlot(par = ldPlotDemoConfig) {
  let margin = {
    left: par.marginLeft,
    top: par.showLabels ? par.marginTop + par.labelHeight : par.marginTop,
    right: par.marginRight,
    bottom: par.marginBottom
  };
  let inWidth = par.width - (par.marginLeft + par.marginRight);
  let inHeight = par.width - (par.marginTop + par.marginBottom);
  inWidth = inWidth > inHeight ? inHeight : inWidth; // adjust the dimensions based on the minimum required space
  let ldCanvas = new HalfMap(par.data, par.cutoff, par.useLog, par.logBase, par.colorScheme);
  ldCanvas.addTooltip(par.id);
  let canvas = createCanvas(par.id, par.width, par.width);
  let svg = createSvg$1(par.id, par.width, par.width, margin, undefined);
  ldCanvas.draw(canvas, svg, {
    w: inWidth,
    top: margin.top,
    left: margin.left
  }, [0, 1], par.showLabels, par.labelAngle);
  ldCanvas.drawColorLegend(svg, {
    x: 0,
    y: 100
  }, 10, "Value");
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
function transcriptTracks(par = transcriptTracksConfig) {
  let margin = {
    top: par.marginTop,
    right: par.marginRight,
    bottom: par.marginBottom,
    left: par.marginLeft
  };
  let inWidth = par.width - (par.marginLeft + par.marginRight);
  let inHeight = par.height - (par.marginTop + par.marginBottom);

  // test input params
  checkDomId$2(par.id);

  // create the SVG
  let svg = createSvg$1(par.id, par.width, par.height, margin);

  // render the transcripts
  `${par.id}Tooltip`;
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
  width: 1200,
  // outer width
  height: 300,
  // outer height
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
function heatmap(par = heatmapDemoConfig, svg = undefined) {
  let margin = {
    top: par.marginTop,
    right: par.marginRight,
    bottom: par.marginBottom,
    left: par.marginLeft
  };
  let inWidth = par.width - (par.marginLeft + par.marginRight + par.rowLabelWidth);
  let inHeight = par.height - (par.marginTop + par.marginBottom + par.columnLabelHeight);

  // test input params
  checkDomId$2(par.id);

  // create the SVG
  if (svg === undefined) svg = createSvg$1(par.id, par.width, par.height, margin);

  // render the heatmap
  let tooltipId = `${par.id}Tooltip`;
  let h = new Heatmap(par.data, par.useLog, par.logBase, par.colorScheme, par.cornerRadius, tooltipId);
  h.draw(svg, {
    w: inWidth,
    h: inHeight
  }, par.columnLabelAngle, false, par.columnLabelPosAdjust);
  h.drawColorLegend(svg, {
    x: 20,
    y: -20
  }, 10);
  return h;
}
const dendroHeatmapDemoConfig = {
  id: "gtexVizDendroHeatmap",
  data: demoData.dendroHeatmap,
  useLog: true,
  logBase: 10,
  width: 600,
  // outer width
  height: 300,
  // outer height
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
function dendroHeatmap(par = dendroHeatmapDemoConfig) {
  let margin = {
    top: par.marginTop,
    right: par.marginRight + par.rowLabelWidth,
    bottom: par.marginBottom + par.columnLabelHeight,
    left: par.marginLeft
  };

  // test input params
  checkDomId$2(par.id);
  par.width - (par.marginLeft + par.marginRight + par.rowLabelWidth);
  par.height - (par.marginTop + par.marginBottom + par.columnLabelHeight);
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
  margin: {
    top: 50,
    right: 20,
    bottom: 100,
    left: 100
  },
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
  showLegend: false
};
function groupedViolinPlot(par = violinDemoConfig) {
  // test input params
  checkDomId$2(par.id);
  let inWidth = par.width - (par.margin.left + par.margin.right);
  let inHeight = par.height - (par.margin.top + par.margin.bottom);
  `${par.id}Svg`;
  let tooltipId = `${par.id}Tooltip`;

  // create the SVG
  let svg = createSvg$1(par.id, par.width, par.height, par.margin);
  const gViolin = new GroupedViolin(par.data);
  gViolin.render(svg, inWidth, inHeight, undefined, [], par.xAxis, par.subXAxis, par.yAxis, par.sizeAxis, par.showWhisker, par.showDivider, par.showLegend, par.showOutliers, par.numPoints, par.vColor);
  svg.selectAll(".violin-size-axis").classed("violin-size-axis-hide", true).classed("violin-size-axis", false);
  gViolin.createTooltip(tooltipId);
  return svg;
}
var GTExViz = {
  heatmap,
  dendroHeatmap,
  groupedViolinPlot,
  transcriptTracks,
  // bubblemap,
  ldPlot
};

/**
 * Render a scatter plot
 * @param {List} data: a list of data objects: {x: num, y: num, color (optional): color in hex or rgb}
 * @param {String} domId: the ID of the root DOM element
 * @param {Object} config
 * @returns the root SVG D3 object
 */
function renderScatterPlot(domId, config = {
  width: 550,
  height: 500,
  margin: {
    top: 50,
    right: 100,
    bottom: 75,
    left: 75
  },
  xLabel: "X label",
  yLabel: "Y label",
  title: "Plot title",
  colorLegend: [{
    label: "Foo",
    color: "rgba(0, 0, 0, 0.3)"
  }]
}, data) {
  // If data is not provided, generate some random data for a demo
  if (data === undefined) data = getRandomPoints(500);

  // Set all config
  const finalizeConfig = () => {
    config.innerWidth = config.width - (config.margin.left + config.margin.right);
    config.innerHeight = config.height - (config.margin.top + config.margin.bottom);
  };
  finalizeConfig();

  // Create scales and axes
  const scale = {
    x: linear().range([0, config.innerWidth]).domain(extent(data, d => d.x)),
    y: linear().range([config.innerHeight, 0]).domain(extent(data, d => d.y))
  };
  const axis = {
    x: axisBottom().scale(scale.x),
    y: axisLeft().scale(scale.y)
  };

  // Render
  // create the root D3 select object
  const rootG = createSvg(domId, config.width, config.height, undefined, config.margin);

  // rendering Axes
  const renderAxes = () => {
    const buffer = 5;
    // x axis
    rootG.append("g").attr("class", "scatter-plot-x-axis").attr("transform", `translate(0, ${config.innerHeight})`).call(axis.x.ticks(5));
    rootG.append("text").attr("class", "scatter-plot-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${scale.x.range()[0] + (scale.x.range()[1] - scale.x.range()[0]) / 2}, ${scale.y.range()[0] + 50})`).text(config.xLabel);
    // y axis
    rootG.append("g").attr("class", "scatter-plot-y-axis").call(axis.y.ticks(5));
    rootG.append("text").attr("class", "scatter-plot-axis-label").attr("text-anchor", "middle").attr("transform", `translate(-${buffer * 2 + select(".scatter-plot-y-axis").node().getBBox().width}, ${scale.y.range()[0] + (scale.y.range()[1] - scale.y.range()[0]) / 2}) rotate(-90)`).text(config.yLabel);
  };
  renderAxes();

  // render plot title
  const renderTitleAndColorLegend = () => {
    rootG.append("text").attr("class", "scatter-plot-title").attr("text-anchor", "middle").attr("transform", `translate(${scale.x.range()[0] + (scale.x.range()[1] - scale.x.range()[0]) / 2}, -30)`).text(config.title);
    let legendG = rootG.append("g").attr("transform", `translate(${scale.x.range()[1] + 20}, 30)`);
    legendG.append("rect").attr("x", 0).attr("y", 0).attr("rx", 3).attr("ry", 3).attr("width", config.margin.right - 30).attr("height", 20 * config.colorLegend.length).style("stroke", "#ced1d5").style("stroke-width", 1).style("fill", "none");
    let legendItems = legendG.selectAll(".legend").data(config.colorLegend).enter().append("g");
    legendItems.append("circle").attr("cy", (d, i) => 10 + 20 * i).attr("cx", 10).attr("r", 2.5).style("fill", d => d.color);
    legendItems.append("text").attr("class", "scatter-plot-legend-text").attr("x", 18).attr("y", (d, i) => 14 + 20 * i).text(d => d.label);
  };
  renderTitleAndColorLegend();

  // render data points
  const renderPoints = () => {
    rootG.selectAll(".point").data(data).enter().append("circle").attr("class", "point").attr("r", 3.5).attr("cy", d => scale.y(d.y)).attr("cx", d => scale.x(d.x)).style("fill", d => {
      return d.color === undefined ? "rgba(0, 0, 0, 0.3)" : d.color;
    });
  };
  renderPoints();
  return {
    svg: rootG,
    scale: scale
  };
}

/**
 * Get a list of points of {x:random number, y:random number}
 * @param {Integer} n: number of points 
 * @param {Object} x: {mu: mean value, sigma: standard deviation}, 
 * @param {Object} y: {mu: mean value, sigma: sd}
 */
function getRandomPoints(n, x = {
  mu: 0,
  sigma: 1
}, y = {
  mu: 0,
  sigma: 1
}) {
  let points = range(0, n).map(d => {
    let pX = randomNormal(x.mu, x.sigma)();
    let pY = randomNormal(y.mu, y.sigma)();
    return {
      x: pX,
      y: pY
    };
  });
  let allX = points.map(d => d.x);
  let allY = points.map(d => d.y);
  console.info(mean(allX), extent(allX));
  console.info(mean(allY), extent(allY));
  return points;
}

/**
 * Create an SVG and an inner <g> object
 * @param id {String} the parent dom ID
 * @param width {Numeric}: the outer width
 * @param height {Numeric}: the outer height
 * @param svgId {String}
 * @param margin {Object} with attr: left, top
 * @returns {*}
 */
function createSvg(id, width, height, svgId = undefined, margin = {
  left: 0,
  top: 0
}) {
  checkDomId$1(id);
  if (svgId === undefined) svgId = `${id}-svg`;
  if (margin === undefined) margin = {
    top: 0,
    left: 0
  };
  return select("#" + id).append("svg").attr("width", width).attr("height", height).attr("id", svgId).append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
}

/**
 * Check if DOM ID exist
 * @param {String} id 
 */
function checkDomId$1(id) {
  if (select(`#${id}`).empty()) {
    let error = `Input Error: DOM ID ${id} is not found.`;
    console.warn(error);
    throw error;
  }
}

const subsetColors = {
  "0": "rgba(73, 199, 112, 0.7)",
  "1": "rgba(255, 128, 0, 0.7)",
  "2": "rgba(20, 179, 236, 0.7)"
};

/**
 * Render the GTEx ieQTL data
 * @param {String} url: GTEx ieQTL web service URL
 * @param {String} domId: the ID of the root DOM element
 * @param {Object} config: plot config
 */
function render$3(url, domId, config = {
  width: 550,
  height: 500,
  margin: {
    top: 50,
    right: 100,
    bottom: 75,
    left: 75
  },
  yLabel: "normalized expression",
  xLabel: "enrichment score",
  title: "ieQTL scatter plot",
  colorLabels: ["ref", "het", "alt"]
}) {
  // prepare color legend objects in to plot config
  const finalizeConfig = () => {
    config.colorLegend = config.colorLabels.map((d, i) => {
      return {
        label: d,
        color: subsetColors[i.toString()]
      };
    });
  };
  finalizeConfig();

  // ping the web service of interaction eQTL for data
  json(url, {
    credentials: "include"
  }).then(function (raw) {
    const data = parseIeqtlData(raw);
    const plot = renderScatterPlot(domId, config, data);
    const lineData = parseRegressionData(raw);
    renderRegressionLine(plot, lineData);
  }).catch(function (err) {
    console.error(err);
  });
}

/**
 * Rendering regression lines on the scatter plot
 * @param {Object} plot: {svg: D3 select object, scale: {x: x scale, y: y scale}} 
 * @param {Object} data: data from parseRegressionData
 */
function renderRegressionLine(plot, data) {
  const scale = plot.scale;
  const lineDef = line().x(d => scale.x(d.x)).y(d => scale.y(d.y));
  data.forEach(l => {
    plot.svg.append("path").datum(l.points).attr("fill", "none").style("stroke-width", 2).style("stroke", l.color).attr("d", lineDef);
  });
}

/**
 * Parse GTEx ieQTL web service json to get the regression data
 * @param {Json} input 
 */
function parseRegressionData(input) {
  let attr = "regressionCoord";
  if (!input.hasOwnProperty(attr)) throw "Fatal Error: required attribute is missing.";
  return Object.keys(input[attr]).map(d => {
    let vals = input[attr][d];
    return {
      subset: d,
      color: subsetColors[d],
      points: [{
        x: vals[0],
        y: vals[2]
      }, {
        x: vals[1],
        y: vals[3]
      }]
    };
  });
}

/**
 * Parse GTEx ieQTL web service json to get the data for the scatter plot
 * @param {Json} input
 * Assumption: the lists of x, y, and genotypes are in the same order 
 * @returns {List} of data objects {x:Num, y: Num, color: in hexadecimal or rgb, subset: data subgroup}
 */

function parseIeqtlData(input) {
  const yAttr = "data";
  const xAttr = "enrichmentScores";
  const subset = "genotypes";
  if (!input.hasOwnProperty(yAttr) || !input.hasOwnProperty(xAttr) || !input.hasOwnProperty(subset)) throw "Data structure error. Required attribute(s) not found.";

  // pre-defined genotype colors
  // parse data
  let data = input[subset].map((d, i) => {
    return {
      x: parseFloat(input[xAttr][i]),
      y: parseFloat(input[yAttr][i]),
      color: subsetColors[d],
      subset: d // genotype
    };
  });
  return data;
}
var IqtlScatterPlot = {
  render: render$3
};

/**
 * Copyright © 2015 - 2019 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */

class MiniGenomeBrowser {
  /**
   * Rendering the genomic features in a 1D plot
   * @param data {LIST} a list of gene objects with attributes: pos, start, end, strand, featureLabel, and featureType
   * @param center {Integer} the center position
   * @param window {Integer} the position range (one-side)
   */
  constructor(data, center, window = 1e6) {
    this.data = data;
    this.center = center;
    this.window = window;
    this.scale = undefined;
    this.tooltip = undefined;
  }

  /**
   * Set the scale
   * @param {Numeric} width 
   */
  setScale(width) {
    let range = [0, Math.ceil(width)];
    let domain = [this.center - this.window, this.center + this.window];
    this.scale = linear()
    // .rangeRound(range)
    .range(range).domain(domain);
  }

  /**
   * Rendering function
   * @param {d3 object} dom 
   * @param {*} width 
   * @param {*} height 
   * @param {*} showWidth 
   * @param {*} trackLabel 
   * @param {*} bgColor 
   * @param {*} featureColor 
   * @param {*} useColorValue 
   * @param {*} maxColorValue 
   */
  render(dom, width = 1500, height = 200, showWidth = false, trackLabel = "Track", bgColor = "#ffffff", featureColor = "#ababab", useColorValue = false, maxColorValue = undefined) {
    this.dom = dom;
    this.setScale(width);
    if (useColorValue) {
      this.colorScale = setColorScale(this.data.map(d => d.colorValue), "Greys", 0, maxColorValue);
      const maxValue = maxColorValue === undefined ? this.data.map(d => d.colorValue) : maxColorValue;
      this.maxColor = this.colorScale(maxValue);
    }
    let browser = this.dom.append("g");

    // genome browser background rectangle
    let backboneHeight = 10;
    browser.append("rect").attr("x", 0).attr("y", height / 2).attr("rx", 4).attr("width", width).attr("height", backboneHeight).style("fill", bgColor).style("stroke", "#ababab").style("stroke-width", 1);

    // genome features
    // NOTE: d.pos is used when showWidth is false, d.pos is independent to the strand that the feature is on, applicable for rendering TSS sites, variants.
    // NOTE: d.start and d.end are used when showWidth is true.
    let featureG = browser.append("g");
    featureG.selectAll(".minibrowser-feature").data(this.data.filter(d => {
      return this.scale(d.pos) > 0 && this.scale(d.pos) < width;
    })).enter().append("rect").attr("class", "minibrowser-feature").attr("x", d => {
      if (showWidth) return this.scale(d.start);
      return this.scale(d.pos);
    }).attr("y", height / 2).attr("width", d => {
      if (showWidth) {
        let w = Math.abs(this.scale(d.start) - this.scale(d.end) + 1) || 1;
        return w;
      }
      return 1;
    }).attr("height", backboneHeight).style("fill", d => {
      if (d.pos == this.center) return "red";
      if (useColorValue) {
        if (!isFinite(d.colorValue)) return this.maxColor;
        return this.colorScale(d.colorValue);
      }
      return featureColor;
    });

    // track label
    browser.append("text").attr("x", -10).attr("y", height / 2 + 5).style("font-size", "9px").style("text-anchor", "end").text(trackLabel);
  }

  /**
   * A class method that adds a genomic position axis
   * And has the functionality to add a zoom brush for the genome browser 
   * @param {*} dom 
   * @param {*} scale 
   * @param {Number} yPos where to render the scale
   * @param {Boolean} addBrush 
   * @param {Function} callback: the callback function for the zoom brush
   * @param {object} brushConfig 
   * @param {numerical} brushCenter 
   * @param {enum} direction: bottom or top
   */
  static renderAxis(dom, scale, yPos, addBrush = true, callback = null, brushConfig = {
    w: 50,
    h: 20
  }, brushCenter = 0, direction = "bottom") {
    let axis = direction == "bottom" ? axisBottom(scale) : axisTop(scale);
    const interval = (scale.domain()[1] - scale.domain()[0]) / 10;
    let myTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(d => scale.domain()[0] + interval * d);
    axis.tickValues(myTicks); // TODO: provide more options to customize the axis--location and the number of ticks
    // console.log(myTicks)
    const axisG = dom.append("g");
    // console.log(scale.domain());
    // console.log(scale.range())
    axisG.attr("id", "miniBrowserAxis").attr("transform", `translate(0,${yPos})`).call(axis).selectAll("text");
    if (addBrush) {
      const brushEvent = () => {
        let selection = event.selection; // event is a d3-selection object
        let leftPos = selection[0];
        let rightPos = selection[1];
        let brushLeftBound = Math.round(scale.invert(selection[0])); // selection provides the position in pixel, use the scale to invert that to chromosome position
        let brushRightBound = Math.round(scale.invert(selection[1]));
        if (callback !== null) callback(leftPos, rightPos, brushLeftBound, brushRightBound);
      };
      let brush = brushX().extent([[0, -brushConfig.h], [scale.range()[1], 0]]).on("start brush end", brushEvent);
      axisG.append("g").attr("id", "miniBrowserBrush").attr("class", "brush").call(brush).call(brush.move, [scale(brushCenter) - brushConfig.w, scale(brushCenter) + brushConfig.w]);
      return brush;
    } else {
      return;
    }
  }
}

/**
 * Copyright © 2015 - 2019 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */

class DataMap {
  constructor(data, colorScheme = "Reds") {
    this.data = data;
    this.colorScheme = colorScheme;
    this.xScale = undefined;
    this.yScale = undefined;
    this.ghScale = {}; // group hScales indexed by group
    this.cScale = undefined;
    this.tooltip = undefined;
  }
  addTooltip(parentId, tooltipCssClass = "bar-map-tooltip") {
    // error-checking
    if (select(`#${parentId}`).empty()) throw "DOM ID is missing: " + parentId;
    let parent = select(`#${parentId}`);
    let tooltipId = parentId + "-tooltip";
    if (select(`#${tooltipId}`).empty()) parent.append("div").attr("id", tooltipId);
    this.tooltip = new Tooltip(tooltipId);
    select(`#${tooltipId}`).classed(tooltipCssClass, true);
  }
  renderWithNewXDomain(dom, domain, mapType, renderAxis = false) {
    this.xScale.domain(domain);
    let bw = this.xScale.bandwidth();
    if (renderAxis) this._renderXAxis(dom);
    if (mapType == "barmap") {
      dom.selectAll(".bar-row").selectAll("rect").attr("x", d => this.xScale(d.x) || 0).attr("width", d => this.xScale(d.x) === undefined ? 0 : bw);
    } else {
      this._setRScale();
      dom.selectAll(".map-bubble").attr("cx", d => this.xScale(d.x) + this.xScale.bandwidth() / 2 || 0).attr("r", d => this.xScale(d.x) === undefined ? 0 : this.rScale(d.r));
      dom.selectAll(".map-grid-vline").attr("x1", d => this.xScale(d) + this.xScale.bandwidth() / 2 || 0).attr("x2", d => this.xScale(d) + this.xScale.bandwidth() / 2 || 0).attr("stroke-width", d => this.xScale(d) >= 0 ? 0 : 0.3);
    }
  }

  /**
   * Render and define the visualization
   * @param {D3} dom 
   * @param {Object{w,h,top,left}?} dimensions 
   * @param {String} type barmap or bubblemap 
   * @param {Boolean} setGroupHScale 
   * @param {Function} tooltipCallback 
   */
  drawSvg(dom, dimensions = {
    w: 1000,
    h: 600,
    top: 0,
    left: 0
  }, type = "barmap", setGroupHScale = false, tooltipCallback = undefined, showGrids = false, bubbleDomain = [0, 50]) {
    if (tooltipCallback !== undefined) this.tooltipCallback = tooltipCallback;
    if (this.xScale === undefined || this.yScale === undefined || this.cScale === undefined) this.setScales(dimensions);
    this._renderAxes(dom);
    let clipped = this._createClipPath(dom, dimensions);
    if (type == "barmap") {
      this.renderBars(dom, clipped, setGroupHScale);
    } else if (type == "bubbleNoClip") {
      this.renderBubbles(dom, bubbleDomain, showGrids, tooltipCallback);
    } else {
      this.renderBubbles(clipped, bubbleDomain, showGrids, tooltipCallback);
    }
  }
  setScales(dimensions, xlist = undefined, ylist = undefined) {
    this._setXScale(dimensions, xlist);
    this._setYScale(dimensions, ylist);
    this._setCScale();
  }
  _createClipPath(dom, dim) {
    dom.classed("data-area", true);
    dom.append("defs").append("clipPath") // defines a clip path
    .attr("id", "data-map-clip").append("rect").attr("width", dim.w).attr("height", dim.h * 2) // weird fix: add a factor to fix some cropping in the clip path
    .attr("fill", "none").attr("stroke", "silver");
    return dom.append("g") // renders the clip path
    .attr("clip-path", "url(#data-map-clip)").classed("clippedArea", true);
  }

  /**
   * Set X scale to a scale band
   * reference: https://github.com/d3/d3-scale#scaleBand
   * @param dim
   * @param xlist {List} of x. optional. User-defined list of x.
   */
  _setXScale(dim = {
    w: 1000,
    left: 20
  }, xlist = undefined, padding = 0.05) {
    // param error checking
    const createErrorMessage = (v, message) => {
      console.error(`This value is invalid: ${v}`);
      throw message;
    };
    if (isNaN(dim.w)) createErrorMessage(dim.w, "ValueError");
    if (isNaN(dim.left)) createErrorMessage(dim.left, "ValueError");
    if (xlist === undefined) {
      let xset = new Set(this.data.map(d => d.x));
      xlist = [...xset].sort((a, b) => {
        return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
      });
    }
    this.xScale = band().domain(xlist).range([dim.left, dim.left + dim.w]).padding(padding);
  }

  /**
   * Set Y scale to a scale band
   * reference: https://github.com/d3/d3-scale#scaleBand
   * @param dim
   * @param xlist {List} of x. optional. User-defined list of x.
   */
  _setYScale(dim = {
    h: 600,
    top: 20
  }, ylist = undefined, padding = 0.3) {
    if (ylist === undefined) {
      let yset = new Set(this.data.map(d => d.y));
      ylist = [...yset];
    }
    ylist.sort((a, b) => {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    });
    this.yScale = band().domain(ylist).range([dim.top, dim.top + dim.h]).padding(padding);
  }
  _setCScale(domain = [-0.5, 0, 0.5]) {
    this.cScale = linear().domain(domain).range(["#129cff", "#ffffff", "#f53956"]);
  }

  // _setRScale(dMax, dMin){
  _setRScale(dMin = 0, dMax = 5) {
    if (dMin === undefined) dMin = min$1(this.data.map(d => d.r));
    if (dMax === undefined) dMax = max$1(this.data.map(d => d.r));
    this.rScale = sqrt$1().domain([dMin, dMax]).range([0, max$1([this.xScale.bandwidth(), this.yScale.bandwidth()]) / 2]);
    return this.rScale;
  }
  _renderAxes(g) {
    this._renderXAxis(g);
    this._renderYAxis(g);
  }
  _renderXAxis(g) {
    let axis = axisBottom(this.xScale).tickSize(0); // show no tick marks
    g.select(".bar-map-x-axis").remove(); // remove previously rendered X axis;
    let Y = this.yScale.range()[1];
    if (Y === undefined || isNaN(Y)) {
      console.error(`This value must be defined: ${Y}`);
      throw "Value Error";
    }
    g.append("g").attr("class", "bar-map-x-axis").attr("transform", `translate(0, ${Y})`).call(axis).selectAll("text").attr("y", 0).attr("x", 9).attr("class", "bar-map-x-label").attr("dy", ".35em").attr("transform", "rotate(90)").style("text-anchor", "start");
  }
  _renderYAxis(g) {
    let axis = axisLeft(this.yScale).tickSize(0);
    g.append("g").attr("class", "bar-map-y-axis").call(axis).selectAll("text").attr("class", "bar-map-y-label");
  }
  renderBubbles(g, domain = [0, 10], showGrids = false, tooltipCallback) {
    let rScale = this._setRScale(domain[0], domain[1]);
    let cScale = this.cScale;
    g.selectAll(".data-bar").remove(); // make sure it's clean g
    selectAll(".h-axis").remove();
    let gridG = g.append("g");
    let bubbleG = g.append("g");
    let yDomain = new Set(this.yScale.domain());
    let xDomain = new Set(this.xScale.domain());
    const radius = {
      x: this.xScale.bandwidth() / 2,
      y: this.yScale.bandwidth() / 2
    };
    if (showGrids) {
      // TODO: code refactoring
      gridG.selectAll(".map-grid-hline").data(this.yScale.domain()).enter().append("line").classed("map-grid-hline", true).attr("x1", this.xScale.range()[0] + radius.x).attr("x2", this.xScale.range()[1] + radius.x).attr("y1", d => this.yScale(d) + radius.y).attr("y2", d => this.yScale(d) + radius.y).style("stroke", "lightgrey").style("stroke-width", 0.3);
      gridG.selectAll(".map-grid-vline").data(this.xScale.domain()).enter().append("line").classed("map-grid-vline", true).attr("x1", d => this.xScale(d) + radius.x).attr("x2", d => this.xScale(d) + radius.x).attr("y1", this.yScale.range()[0] + radius.y).attr("y2", this.yScale.range()[1] - radius.y).style("stroke", "lightgrey").style("stroke-width", 0.3);
    }
    let bubbles = bubbleG.selectAll(".map-bubble").data(this.data.filter(d => yDomain.has(d.y) && xDomain.has(d.x))).enter().append("circle").classed("map-bubble", true).attr("cx", d => this.xScale(d.x) + radius.x).attr("cy", d => this.yScale(d.y) + radius.y) // the attr r is originally for radius...
    .attr("r", d => {
      return rScale(d.r) < 1 ? 1 : rScale(d.r);
    }).attr("fill", d => {
      if (isNaN(d.value)) return "darkgrey";
      return cScale(d.value);
    }).attr("opacity", 0.95).attr("stroke", "#aaaaaa").attr("cursor", "pointer");
    let tooltip = this.tooltip;
    if (tooltipCallback === undefined) {
      if (this.tooltipCallback !== undefined) tooltipCallback = this.tooltipCallback;else {
        tooltipCallback = d => {
          const tooltipData = [`<span class="tooltip-key">Row</span>: <span class="tooltip-value">${d.y}</span>`, `<span class="tooltip-key">Column</span>: <span class="tooltip-value">${d.x}</span>`, `<span class="tooltip-key">Color value</span>: <span class="tooltip-value">${d.value.toPrecision(5)}</span>`, `<span class="tooltip-key">Bubble size</span>: <span class="tooltip-value">${d.r.toPrecision(5)}</span>`];
          return tooltipData.join("<br/>");
        };
      }
    }
    bubbles.on("mouseover", function (d) {
      tooltip.show(tooltipCallback(d));
      select(this).classed("hover", true);
    }).on("mouseout", function () {
      tooltip.hide();
      select(this).classed("hover", false);
    });
  }
  renderBars(g, clipped, groupHScale = false, tooltipCallback = undefined) {
    clipped.selectAll(".map-bubble").remove(); // make sure it's clean g
    g.selectAll(".map-grid-hline").remove();
    g.selectAll(".map-grid-vline").remove();
    g.selectAll(".h-axis").remove(); // remove existing h-axis components
    let cScale = this.cScale;
    let nest_data = nest().key(d => d.y).entries(this.data);
    let grouped_data = nest().key(d => d.dataType).entries(this.data);
    let groups = grouped_data.reduce((arr, d) => {
      arr[d.key] = 0;
      return arr;
    }, {});
    Object.keys(groups).forEach(k => {
      let dMax = max$1(grouped_data.filter(g => g.key == k)[0].values.map(d => d.r));
      this.ghScale[k] = linear().rangeRound([0, -this.yScale.bandwidth()]).domain([0, dMax]);
    });
    let rows = new Set(this.yScale.domain()); // yScale.domain() controls what rows to render
    nest_data.forEach(row => {
      if (!rows.has(row.key)) return; // if the yScale domain does not have this row, then skip this row
      let hScale = undefined;
      if (groupHScale) {
        // use a global scale
        let type = row.values[0].dataType;
        hScale = this.ghScale[type];
      } else {
        let dMax = max$1(row.values, d => d.r); // find the maximum value for each row
        hScale = linear().rangeRound([0, -this.yScale.bandwidth()]).domain([0, dMax]);
      }
      let rowG = clipped.append("g").classed("bar-row", true);

      // add a row baseline to help visual alignment
      rowG.append("line").attr("class", row.key.split(/-|\s/)[0]).attr("x1", this.xScale.range()[0]).attr("x2", this.xScale.range()[1]).attr("y1", 0).attr("y2", 0).attr("transform", `translate(0, ${this.yScale(row.key) + this.yScale.bandwidth()})`).style("stroke", "#efefef");
      let hAxis = axisRight(hScale).ticks(2);
      g.append("g").attr("class", "h-axis").attr("transform", `translate(${this.xScale.range()[1] + 3}, ${this.yScale(row.key) + this.yScale.bandwidth()})`).call(hAxis).selectAll("text").attr("font-size", 6);
      let bars = rowG.selectAll(".data-bar").data(row.values).enter().append("rect").attr("class", "data-bar").attr("rx", 2).attr("x", d => this.xScale(d.x) || 0).attr("y", d => this.yScale(d.y) + this.yScale.bandwidth() + hScale(d.r)) // the attr r is originally for radius...
      .attr("width", d => this.xScale(d.x) === undefined ? 0 : this.xScale.bandwidth()).attr("height", d => {
        return Math.abs(hScale(d.r));
      }).attr("fill", d => {
        if (isNaN(d.value)) return "darkgrey";
        return cScale(d.value);
      }).attr("stroke", "#aaaaaa");
      let tooltip = this.tooltip;
      if (tooltipCallback === undefined) {
        if (this.tooltipCallback !== undefined) tooltipCallback = this.tooltipCallback;else {
          tooltipCallback = d => {
            const tooltipData = [`<span class="tooltip-key">Row</span>: <span class="tooltip-value">${d.y}</span>`, `<span class="tooltip-key">Column</span>: <span class="tooltip-value">${d.x}</span>`, `<span class="tooltip-key">Value</span>: <span class="tooltip-value">${d.value}</span>`, `<span class="tooltip-key">Height</span>: <span class="tooltip-value">${d.r}</span>`];
            return tooltipData.join("<br/>");
          };
        }
      }
      bars.on("mouseover", function (d) {
        tooltip.show(tooltipCallback(d));
        select(this).classed("hover", true);
      }).on("mouseout", function () {
        tooltip.hide();
        select(this).classed("hover", false);
      });
    });
  }
  drawBubbleLegend(dom, title = "bubble legend", config = {
    x: 0,
    y: 0
  }, data = [5, 10, 20, 40, 80], cell = 20, orientation) {
    // legend groups
    dom.select("#dataMap-bubble-legend").remove(); // make sure there is no redundant rendering
    dom.selectAll(".bubble-legend").remove();
    const legends = dom.append("g").attr("id", "dataMap-bubble-legend").attr("transform", `translate(${config.x}, ${config.y})`).selectAll(".legend").data(data);
    const g = legends.enter().append("g").classed("legend", true);
    if (orientation == "h") {
      // a horizontal bubble strip
      dom.append("text").attr("class", "bubble-legend color-legend").text(title).attr("x", 0).attr("text-anchor", "end").attr("y", -5).attr("transform", `translate(${config.x}, ${config.y})`);
      g.append("circle").attr("cx", (d, i) => cell * i).attr("cy", 0).attr("r", d => this.rScale(d) < 0 ? 1 : this.rScale(d)).style("fill", "#ababab");
      g.append("text").attr("class", "color-legend").text(d => d).attr("x", (d, i) => cell * i - 10).attr("y", 20);
    } else {
      // a vertical bubble strip
      dom.append("text").attr("class", "bubble-legend color-legend").text(title).attr("x", 5).attr("text-anchor", "start").attr("y", 0).attr("transform", `translate(${config.x}, ${config.y + cell * data.length})`);
      g.append("circle").attr("cx", 0).attr("cy", (d, i) => cell * i).attr("r", d => this.rScale(d) < 0 ? 0 : this.rScale(d)).style("fill", "#ababab");
      g.append("text").attr("class", "color-legend").text(d => d).attr("x", 10).attr("y", (d, i) => cell * i + 5);
    }
  }
  drawColorLegend(dom, title = "color legend", config = {
    x: 0,
    y: 0
  }, cell = {
    w: 30,
    h: 5
  }, data = [-1, -0.5, -0.25, 0, 0.25, 0.5, 1], orientation = "v") {
    // legend groups
    const legends = dom.append("g").attr("transform", `translate(${config.x}, ${config.y})`).selectAll(".legend").data(data);
    const g = legends.enter().append("g").classed("legend", true);
    if (orientation == "h") {
      // a horizontal color strip
      dom.append("text").attr("class", "color-legend").text(title).attr("x", 0).attr("text-anchor", "end").attr("y", -5).attr("transform", `translate(${config.x}, ${config.y})`);
      g.append("rect").attr("x", (d, i) => cell.w * i).attr("y", 0).attr("rx", 2).attr("width", cell.w).attr("height", cell.h).style("fill", d => this.cScale(d));
      g.append("text").attr("class", "color-legend").text(d => d).attr("x", (d, i) => cell.w * i).attr("y", cell.h + 15);
    } else {
      // a vertical color strip
      dom.append("text").attr("class", "color-legend").text(title).attr("x", 5).attr("text-anchor", "start").attr("y", 0).attr("transform", `translate(${config.x}, ${config.y + cell.h * (data.length + 1)})`);
      g.append("rect").attr("x", 0).attr("y", (d, i) => cell.h * i).attr("width", cell.w).attr("height", cell.h).style("fill", d => this.cScale(d));
      g.append("text").attr("class", "color-legend").text(d => d).attr("x", 10).attr("y", (d, i) => cell.h * i + cell.h / 2);
    }
  }
}

function tissueTable() {
  let hash = {};
  tissues.forEach(t => {
    hash[t.tissueSiteDetailId] = t;
  });
  return hash;
}
const tissues = [{
  "colorHex": "FF6600",
  "colorRgb": "255,102,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 15607,
  "expressedGeneCount": 28830,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 581,
  "rnaSeqSampleCount": 663,
  "sGeneCount": 5113,
  "samplingSite": "Subcutaneous tissue beneath the leg's skin sample.",
  "tissueSite": "Adipose Tissue",
  "tissueSiteDetail": "Adipose - Subcutaneous",
  "tissueSiteDetailAbbr": "ADPSBQ",
  "tissueSiteDetailId": "Adipose_Subcutaneous",
  "uberonId": "0002190"
}, {
  "colorHex": "FFAA00",
  "colorRgb": "255,170,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 12482,
  "expressedGeneCount": 28881,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 469,
  "rnaSeqSampleCount": 541,
  "sGeneCount": 4210,
  "samplingSite": "Adipose tissue on the large fold of parietal peritoneum that hangs down from the greater curvature of the stomach, passing in front of the small intestines.",
  "tissueSite": "Adipose Tissue",
  "tissueSiteDetail": "Adipose - Visceral (Omentum)",
  "tissueSiteDetailAbbr": "ADPVSC",
  "tissueSiteDetailId": "Adipose_Visceral_Omentum",
  "uberonId": "0010414"
}, {
  "colorHex": "33DD33",
  "colorRgb": "51,221,51",
  "datasetId": "gtex_v8",
  "eGeneCount": 8123,
  "expressedGeneCount": 28235,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 233,
  "rnaSeqSampleCount": 258,
  "sGeneCount": 2369,
  "samplingSite": "Left, followed by the right if necessary for sufficient aliquots.",
  "tissueSite": "Adrenal Gland",
  "tissueSiteDetail": "Adrenal Gland",
  "tissueSiteDetailAbbr": "ADRNLG",
  "tissueSiteDetailId": "Adrenal_Gland",
  "uberonId": "0002369"
}, {
  "colorHex": "FF5555",
  "colorRgb": "255,85,85",
  "datasetId": "gtex_v8",
  "eGeneCount": 12493,
  "expressedGeneCount": 28025,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 387,
  "rnaSeqSampleCount": 432,
  "sGeneCount": 3740,
  "samplingSite": "Ascending aorta or other thoracic regions (nonatherosclerotic).",
  "tissueSite": "Blood Vessel",
  "tissueSiteDetail": "Artery - Aorta",
  "tissueSiteDetailAbbr": "ARTAORT",
  "tissueSiteDetailId": "Artery_Aorta",
  "uberonId": "0001496"
}, {
  "colorHex": "FFAA99",
  "colorRgb": "255,170,153",
  "datasetId": "gtex_v8",
  "eGeneCount": 6296,
  "expressedGeneCount": 28462,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 213,
  "rnaSeqSampleCount": 240,
  "sGeneCount": 2140,
  "samplingSite": "Left and right, noncalcific regions only.",
  "tissueSite": "Blood Vessel",
  "tissueSiteDetail": "Artery - Coronary",
  "tissueSiteDetailAbbr": "ARTCRN",
  "tissueSiteDetailId": "Artery_Coronary",
  "uberonId": "0001621"
}, {
  "colorHex": "FF0000",
  "colorRgb": "255,0,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 15008,
  "expressedGeneCount": 27217,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 584,
  "rnaSeqSampleCount": 663,
  "sGeneCount": 4791,
  "samplingSite": "Left Tibial. Peripheral tibial artery from gastrocnemius region",
  "tissueSite": "Blood Vessel",
  "tissueSiteDetail": "Artery - Tibial",
  "tissueSiteDetailAbbr": "ARTTBL",
  "tissueSiteDetailId": "Artery_Tibial",
  "uberonId": "0007610"
}, {
  "colorHex": "AA0000",
  "colorRgb": "170,0,0",
  "datasetId": "gtex_v8",
  "eGeneCount": null,
  "expressedGeneCount": 28949,
  "hasEGenes": false,
  "hasSGenes": false,
  "rnaSeqAndGenotypeSampleCount": 21,
  "rnaSeqSampleCount": 21,
  "sGeneCount": null,
  "samplingSite": "Central posterior urinary bladder, trimming from the outer wall if necessary.",
  "tissueSite": "Bladder",
  "tissueSiteDetail": "Bladder",
  "tissueSiteDetailAbbr": "BLDDER",
  "tissueSiteDetailId": "Bladder",
  "uberonId": "0001255"
}, {
  "colorHex": "EEEE00",
  "colorRgb": "238,238,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 3726,
  "expressedGeneCount": 28196,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 129,
  "rnaSeqSampleCount": 152,
  "sGeneCount": 892,
  "samplingSite": "Amygdala (sampled at Miami Brain Bank and preserved as fresh frozen tissue).",
  "tissueSite": "Brain",
  "tissueSiteDetail": "Brain - Amygdala",
  "tissueSiteDetailAbbr": "BRNAMY",
  "tissueSiteDetailId": "Brain_Amygdala",
  "uberonId": "0001876"
}, {
  "colorHex": "EEEE00",
  "colorRgb": "238,238,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 5640,
  "expressedGeneCount": 28921,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 147,
  "rnaSeqSampleCount": 176,
  "sGeneCount": 1238,
  "samplingSite": "Anterior cingulate cortex (sampled at Miami Brain Bank and preserved as fresh frozen tissue).",
  "tissueSite": "Brain",
  "tissueSiteDetail": "Brain - Anterior cingulate cortex (BA24)",
  "tissueSiteDetailAbbr": "BRNACC",
  "tissueSiteDetailId": "Brain_Anterior_cingulate_cortex_BA24",
  "uberonId": "0009835"
}, {
  "colorHex": "EEEE00",
  "colorRgb": "238,238,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 8362,
  "expressedGeneCount": 29230,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 194,
  "rnaSeqSampleCount": 246,
  "sGeneCount": 1809,
  "samplingSite": "Caudate (sampled at Miami Brain Bank and preserved as fresh frozen tissue).",
  "tissueSite": "Brain",
  "tissueSiteDetail": "Brain - Caudate (basal ganglia)",
  "tissueSiteDetailAbbr": "BRNCDT",
  "tissueSiteDetailId": "Brain_Caudate_basal_ganglia",
  "uberonId": "0001873"
}, {
  "colorHex": "EEEE00",
  "colorRgb": "238,238,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 10027,
  "expressedGeneCount": 29538,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 175,
  "rnaSeqSampleCount": 215,
  "sGeneCount": 2397,
  "samplingSite": "Cerebellar hemisphere (sampled at Miami Brain Bank and preserved as fresh frozen tissue).",
  "tissueSite": "Brain",
  "tissueSiteDetail": "Brain - Cerebellar Hemisphere",
  "tissueSiteDetailAbbr": "BRNCHB",
  "tissueSiteDetailId": "Brain_Cerebellar_Hemisphere",
  "uberonId": "0002037"
}, {
  "colorHex": "EEEE00",
  "colorRgb": "238,238,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 11240,
  "expressedGeneCount": 30106,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 209,
  "rnaSeqSampleCount": 241,
  "sGeneCount": 2786,
  "samplingSite": "Right cerebellum (sampled at donor collection site and preserved in PAXgene fixative).",
  "tissueSite": "Brain",
  "tissueSiteDetail": "Brain - Cerebellum",
  "tissueSiteDetailAbbr": "BRNCHA",
  "tissueSiteDetailId": "Brain_Cerebellum",
  "uberonId": "0002037"
}, {
  "colorHex": "EEEE00",
  "colorRgb": "238,238,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 9082,
  "expressedGeneCount": 29560,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 205,
  "rnaSeqSampleCount": 255,
  "sGeneCount": 2048,
  "samplingSite": "Right cerebral frontal pole cortex (sampled at donor collection site and preserved in PAXgene fixative).",
  "tissueSite": "Brain",
  "tissueSiteDetail": "Brain - Cortex",
  "tissueSiteDetailAbbr": "BRNCTXA",
  "tissueSiteDetailId": "Brain_Cortex",
  "uberonId": "0001870"
}, {
  "colorHex": "EEEE00",
  "colorRgb": "238,238,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 7335,
  "expressedGeneCount": 29132,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 175,
  "rnaSeqSampleCount": 209,
  "sGeneCount": 1684,
  "samplingSite": "Right cerebral frontal pole cortex (sampled at Miami Brain Bank and preserved as fresh frozen tissue).",
  "tissueSite": "Brain",
  "tissueSiteDetail": "Brain - Frontal Cortex (BA9)",
  "tissueSiteDetailAbbr": "BRNCTXB",
  "tissueSiteDetailId": "Brain_Frontal_Cortex_BA9",
  "uberonId": "0009834"
}, {
  "colorHex": "EEEE00",
  "colorRgb": "238,238,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 5517,
  "expressedGeneCount": 28625,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 165,
  "rnaSeqSampleCount": 197,
  "sGeneCount": 1185,
  "samplingSite": "Hippocampus (sampled at Miami Brain Bank and preserved as fresh frozen tissue).",
  "tissueSite": "Brain",
  "tissueSiteDetail": "Brain - Hippocampus",
  "tissueSiteDetailAbbr": "BRNHPP",
  "tissueSiteDetailId": "Brain_Hippocampus",
  "uberonId": "0001954"
}, {
  "colorHex": "EEEE00",
  "colorRgb": "238,238,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 5499,
  "expressedGeneCount": 29502,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 170,
  "rnaSeqSampleCount": 202,
  "sGeneCount": 1414,
  "samplingSite": "Hypothalamus (sampled at Miami Brain Bank and preserved as fresh frozen tissue).",
  "tissueSite": "Brain",
  "tissueSiteDetail": "Brain - Hypothalamus",
  "tissueSiteDetailAbbr": "BRNHPT",
  "tissueSiteDetailId": "Brain_Hypothalamus",
  "uberonId": "0001898"
}, {
  "colorHex": "EEEE00",
  "colorRgb": "238,238,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 8198,
  "expressedGeneCount": 29339,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 202,
  "rnaSeqSampleCount": 246,
  "sGeneCount": 1881,
  "samplingSite": "Nucleus accumbens basal ganglia (sampled at Miami Brain Bank and preserved as fresh frozen tissue).",
  "tissueSite": "Brain",
  "tissueSiteDetail": "Brain - Nucleus accumbens (basal ganglia)",
  "tissueSiteDetailAbbr": "BRNNCC",
  "tissueSiteDetailId": "Brain_Nucleus_accumbens_basal_ganglia",
  "uberonId": "0001882"
}, {
  "colorHex": "EEEE00",
  "colorRgb": "238,238,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 6902,
  "expressedGeneCount": 28335,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 170,
  "rnaSeqSampleCount": 205,
  "sGeneCount": 1350,
  "samplingSite": "Putamen basal ganglia (sampled at Miami Brain Bank and preserved as fresh frozen tissue).",
  "tissueSite": "Brain",
  "tissueSiteDetail": "Brain - Putamen (basal ganglia)",
  "tissueSiteDetailAbbr": "BRNPTM",
  "tissueSiteDetailId": "Brain_Putamen_basal_ganglia",
  "uberonId": "0001874"
}, {
  "colorHex": "EEEE00",
  "colorRgb": "238,238,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 4483,
  "expressedGeneCount": 28352,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 126,
  "rnaSeqSampleCount": 159,
  "sGeneCount": 1144,
  "samplingSite": "Spinal cord (sampled at Miami Brain Bank and preserved as fresh frozen tissue).",
  "tissueSite": "Brain",
  "tissueSiteDetail": "Brain - Spinal cord (cervical c-1)",
  "tissueSiteDetailAbbr": "BRNSPC",
  "tissueSiteDetailId": "Brain_Spinal_cord_cervical_c-1",
  "uberonId": "0006469"
}, {
  "colorHex": "EEEE00",
  "colorRgb": "238,238,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 3301,
  "expressedGeneCount": 28050,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 114,
  "rnaSeqSampleCount": 139,
  "sGeneCount": 814,
  "samplingSite": "Substantia nigra (sampled at Miami Brain Bank and preserved as fresh frozen tissue).",
  "tissueSite": "Brain",
  "tissueSiteDetail": "Brain - Substantia nigra",
  "tissueSiteDetailAbbr": "BRNSNG",
  "tissueSiteDetailId": "Brain_Substantia_nigra",
  "uberonId": "0002038"
}, {
  "colorHex": "33CCCC",
  "colorRgb": "51,204,204",
  "datasetId": "gtex_v8",
  "eGeneCount": 10872,
  "expressedGeneCount": 29615,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 396,
  "rnaSeqSampleCount": 459,
  "sGeneCount": 4124,
  "samplingSite": "Central breast subareolar region of the right breast, 1-2 cm under the skin surface of nipple region.",
  "tissueSite": "Breast",
  "tissueSiteDetail": "Breast - Mammary Tissue",
  "tissueSiteDetailAbbr": "BREAST",
  "tissueSiteDetailId": "Breast_Mammary_Tissue",
  "uberonId": "0008367"
}, {
  "colorHex": "CC66FF",
  "colorRgb": "204,102,255",
  "datasetId": "gtex_v8",
  "eGeneCount": 4934,
  "expressedGeneCount": 27840,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 147,
  "rnaSeqSampleCount": 174,
  "sGeneCount": 2360,
  "samplingSite": "Transformed lymphocytes.",
  "tissueSite": "Blood Vessel",
  "tissueSiteDetail": "Cells - EBV-transformed lymphocytes",
  "tissueSiteDetailAbbr": "LCL",
  "tissueSiteDetailId": "Cells_EBV-transformed_lymphocytes",
  "uberonId": "EFO_0000572"
}, {
  "colorHex": "AAEEFF",
  "colorRgb": "170,238,255",
  "datasetId": "gtex_v8",
  "eGeneCount": 15219,
  "expressedGeneCount": 26297,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 483,
  "rnaSeqSampleCount": 504,
  "sGeneCount": 4586,
  "samplingSite": "Cultured primary fibroblasts.",
  "tissueSite": "Skin",
  "tissueSiteDetail": "Cells - Cultured fibroblasts",
  "tissueSiteDetailAbbr": "FIBRBLS",
  "tissueSiteDetailId": "Cells_Cultured_fibroblasts",
  "uberonId": "EFO_0002009"
}, {
  "colorHex": "FFCCCC",
  "colorRgb": "255,204,204",
  "datasetId": "gtex_v8",
  "eGeneCount": null,
  "expressedGeneCount": 29691,
  "hasEGenes": false,
  "hasSGenes": false,
  "rnaSeqAndGenotypeSampleCount": 9,
  "rnaSeqSampleCount": 9,
  "sGeneCount": null,
  "samplingSite": "Ectocervix (squamous) from uterus. Bivalve uterus along the endocervical canal to open uterus and cervix from external os to fundus.",
  "tissueSite": "Cervix Uteri",
  "tissueSiteDetail": "Cervix - Ectocervix",
  "tissueSiteDetailAbbr": "CVXECT",
  "tissueSiteDetailId": "Cervix_Ectocervix",
  "uberonId": "0012249"
}, {
  "colorHex": "CCAADD",
  "colorRgb": "204,170,221",
  "datasetId": "gtex_v8",
  "eGeneCount": null,
  "expressedGeneCount": 30559,
  "hasEGenes": false,
  "hasSGenes": false,
  "rnaSeqAndGenotypeSampleCount": 10,
  "rnaSeqSampleCount": 10,
  "sGeneCount": null,
  "samplingSite": "Endocervix (glandular) from uterus. Bivalve uterus along the endocervical canal to open uterus and cervix from external os to fundus.",
  "tissueSite": "Cervix Uteri",
  "tissueSiteDetail": "Cervix - Endocervix",
  "tissueSiteDetailAbbr": "CVSEND",
  "tissueSiteDetailId": "Cervix_Endocervix",
  "uberonId": "0000458"
}, {
  "colorHex": "EEBB77",
  "colorRgb": "238,187,119",
  "datasetId": "gtex_v8",
  "eGeneCount": 10550,
  "expressedGeneCount": 28454,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 318,
  "rnaSeqSampleCount": 373,
  "sGeneCount": 3269,
  "samplingSite": "Sigmoid colon, Obtain muscularis only; discard mucosa.",
  "tissueSite": "Colon",
  "tissueSiteDetail": "Colon - Sigmoid",
  "tissueSiteDetailAbbr": "CLNSGM",
  "tissueSiteDetailId": "Colon_Sigmoid",
  "uberonId": "0001159"
}, {
  "colorHex": "CC9955",
  "colorRgb": "204,153,85",
  "datasetId": "gtex_v8",
  "eGeneCount": 11686,
  "expressedGeneCount": 29574,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 368,
  "rnaSeqSampleCount": 406,
  "sGeneCount": 3459,
  "samplingSite": "Transverse, Full thickness: mucosa and muscularis",
  "tissueSite": "Colon",
  "tissueSiteDetail": "Colon - Transverse",
  "tissueSiteDetailAbbr": "CLNTRN",
  "tissueSiteDetailId": "Colon_Transverse",
  "uberonId": "0001157"
}, {
  "colorHex": "8B7355",
  "colorRgb": "139,115,85",
  "datasetId": "gtex_v8",
  "eGeneCount": 10534,
  "expressedGeneCount": 28219,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 330,
  "rnaSeqSampleCount": 375,
  "sGeneCount": 3286,
  "samplingSite": "Muscularis propria in the lowest portion of the esophagus just proximal to the stomach.",
  "tissueSite": "Esophagus",
  "tissueSiteDetail": "Esophagus - Gastroesophageal Junction",
  "tissueSiteDetailAbbr": "ESPGEJ",
  "tissueSiteDetailId": "Esophagus_Gastroesophageal_Junction",
  "uberonId": "0004550"
}, {
  "colorHex": "552200",
  "colorRgb": "85,34,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 14675,
  "expressedGeneCount": 28332,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 497,
  "rnaSeqSampleCount": 555,
  "sGeneCount": 3986,
  "samplingSite": "Squamous region (distal/lower third), at least 4 cm above gastroesophageal junction.",
  "tissueSite": "Esophagus",
  "tissueSiteDetail": "Esophagus - Mucosa",
  "tissueSiteDetailAbbr": "ESPMCS",
  "tissueSiteDetailId": "Esophagus_Mucosa",
  "uberonId": "0006920"
}, {
  "colorHex": "BB9988",
  "colorRgb": "187,153,136",
  "datasetId": "gtex_v8",
  "eGeneCount": 14110,
  "expressedGeneCount": 27982,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 465,
  "rnaSeqSampleCount": 515,
  "sGeneCount": 4088,
  "samplingSite": "Squamous region (distal/lower third), at least 4 cm above gastroesophageal junction.",
  "tissueSite": "Esophagus",
  "tissueSiteDetail": "Esophagus - Muscularis",
  "tissueSiteDetailAbbr": "ESPMSL",
  "tissueSiteDetailId": "Esophagus_Muscularis",
  "uberonId": "0004648"
}, {
  "colorHex": "FFCCCC",
  "colorRgb": "255,204,204",
  "datasetId": "gtex_v8",
  "eGeneCount": null,
  "expressedGeneCount": 29861,
  "hasEGenes": false,
  "hasSGenes": false,
  "rnaSeqAndGenotypeSampleCount": 8,
  "rnaSeqSampleCount": 9,
  "sGeneCount": null,
  "samplingSite": "Left (and right if needed for sufficient aliquots) starting at, and to include, fimbriated end.",
  "tissueSite": "Fallopian Tube",
  "tissueSiteDetail": "Fallopian Tube",
  "tissueSiteDetailAbbr": "FLLPNT",
  "tissueSiteDetailId": "Fallopian_Tube",
  "uberonId": "0003889"
}, {
  "colorHex": "9900FF",
  "colorRgb": "153,0,255",
  "datasetId": "gtex_v8",
  "eGeneCount": 10991,
  "expressedGeneCount": 27818,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 372,
  "rnaSeqSampleCount": 429,
  "sGeneCount": 3055,
  "samplingSite": "Right atrial appendage, tip (if fatty or discolored, take more proximally)",
  "tissueSite": "Heart",
  "tissueSiteDetail": "Heart - Atrial Appendage",
  "tissueSiteDetailAbbr": "HRTAA",
  "tissueSiteDetailId": "Heart_Atrial_Appendage",
  "uberonId": "0006631"
}, {
  "colorHex": "660099",
  "colorRgb": "102,0,153",
  "datasetId": "gtex_v8",
  "eGeneCount": 9642,
  "expressedGeneCount": 26037,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 386,
  "rnaSeqSampleCount": 432,
  "sGeneCount": 2357,
  "samplingSite": "Anterior left ventricle, 1 cm above apex and 1 cm from left anterior descending coronary artery.",
  "tissueSite": "Heart",
  "tissueSiteDetail": "Heart - Left Ventricle",
  "tissueSiteDetailAbbr": "HRTLV",
  "tissueSiteDetailId": "Heart_Left_Ventricle",
  "uberonId": "0006566"
}, {
  "colorHex": "22FFDD",
  "colorRgb": "34,255,221",
  "datasetId": "gtex_v8",
  "eGeneCount": 1260,
  "expressedGeneCount": 29263,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 73,
  "rnaSeqSampleCount": 85,
  "sGeneCount": 547,
  "samplingSite": "Left kidney cortex.",
  "tissueSite": "Kidney",
  "tissueSiteDetail": "Kidney - Cortex",
  "tissueSiteDetailAbbr": "KDNCTX",
  "tissueSiteDetailId": "Kidney_Cortex",
  "uberonId": "0001225"
}, {
  "colorHex": "33FFC2",
  "colorRgb": "51,255,194",
  "datasetId": "gtex_v8",
  "eGeneCount": null,
  "expressedGeneCount": 31935,
  "hasEGenes": false,
  "hasSGenes": false,
  "rnaSeqAndGenotypeSampleCount": 4,
  "rnaSeqSampleCount": 4,
  "sGeneCount": null,
  "samplingSite": "Left kidney medulla adjacent to Cortex.",
  "tissueSite": "Kidney",
  "tissueSiteDetail": "Kidney - Medulla",
  "tissueSiteDetailAbbr": "KDNMDL",
  "tissueSiteDetailId": "Kidney_Medulla",
  "uberonId": "0001293"
}, {
  "colorHex": "AABB66",
  "colorRgb": "170,187,102",
  "datasetId": "gtex_v8",
  "eGeneCount": 5734,
  "expressedGeneCount": 26560,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 208,
  "rnaSeqSampleCount": 226,
  "sGeneCount": 1485,
  "samplingSite": "Central right lobe, 1 cm below capsule.",
  "tissueSite": "Liver",
  "tissueSiteDetail": "Liver",
  "tissueSiteDetailAbbr": "LIVER",
  "tissueSiteDetailId": "Liver",
  "uberonId": "0001114"
}, {
  "colorHex": "99FF00",
  "colorRgb": "153,255,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 14113,
  "expressedGeneCount": 30049,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 515,
  "rnaSeqSampleCount": 578,
  "sGeneCount": 4774,
  "samplingSite": "Inferior segment of left upper lobe, 1 cm below the pleural surface.",
  "tissueSite": "Lung",
  "tissueSiteDetail": "Lung",
  "tissueSiteDetailAbbr": "LUNG",
  "tissueSiteDetailId": "Lung",
  "uberonId": "0008952"
}, {
  "colorHex": "99BB88",
  "colorRgb": "153,187,136",
  "datasetId": "gtex_v8",
  "eGeneCount": 4836,
  "expressedGeneCount": 30270,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 144,
  "rnaSeqSampleCount": 162,
  "sGeneCount": 1648,
  "samplingSite": "Inner surface of lower lip.",
  "tissueSite": "Salivary Gland",
  "tissueSiteDetail": "Minor Salivary Gland",
  "tissueSiteDetailAbbr": "SLVRYG",
  "tissueSiteDetailId": "Minor_Salivary_Gland",
  "uberonId": "0006330"
}, {
  "colorHex": "AAAAFF",
  "colorRgb": "170,170,255",
  "datasetId": "gtex_v8",
  "eGeneCount": 13532,
  "expressedGeneCount": 25586,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 706,
  "rnaSeqSampleCount": 803,
  "sGeneCount": 4056,
  "samplingSite": "The gastrocnemius muscle, 2 cm below the patella.",
  "tissueSite": "Muscle",
  "tissueSiteDetail": "Muscle - Skeletal",
  "tissueSiteDetailAbbr": "MSCLSK",
  "tissueSiteDetailId": "Muscle_Skeletal",
  "uberonId": "0011907"
}, {
  "colorHex": "FFD700",
  "colorRgb": "255,215,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 17285,
  "expressedGeneCount": 30082,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 532,
  "rnaSeqSampleCount": 619,
  "sGeneCount": 5297,
  "samplingSite": "Left tibial. Peripheral tibial nerve from gastrocnemius region",
  "tissueSite": "Nerve",
  "tissueSiteDetail": "Nerve - Tibial",
  "tissueSiteDetailAbbr": "NERVET",
  "tissueSiteDetailId": "Nerve_Tibial",
  "uberonId": "0001323"
}, {
  "colorHex": "FFAAFF",
  "colorRgb": "255,170,255",
  "datasetId": "gtex_v8",
  "eGeneCount": 5542,
  "expressedGeneCount": 29523,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 167,
  "rnaSeqSampleCount": 180,
  "sGeneCount": 1998,
  "samplingSite": "Most normal regions of the left ovary (and right if necessary to obt    ain sufficient aliquots).",
  "tissueSite": "Ovary",
  "tissueSiteDetail": "Ovary",
  "tissueSiteDetailAbbr": "OVARY",
  "tissueSiteDetailId": "Ovary",
  "uberonId": "0000992"
}, {
  "colorHex": "995522",
  "colorRgb": "153,85,34",
  "datasetId": "gtex_v8",
  "eGeneCount": 9660,
  "expressedGeneCount": 27435,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 305,
  "rnaSeqSampleCount": 328,
  "sGeneCount": 2250,
  "samplingSite": "Mid-portion (not tail).",
  "tissueSite": "Pancreas",
  "tissueSiteDetail": "Pancreas",
  "tissueSiteDetailAbbr": "PNCREAS",
  "tissueSiteDetailId": "Pancreas",
  "uberonId": "0001150"
}, {
  "colorHex": "AAFF99",
  "colorRgb": "170,255,153",
  "datasetId": "gtex_v8",
  "eGeneCount": 9146,
  "expressedGeneCount": 31187,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 237,
  "rnaSeqSampleCount": 283,
  "sGeneCount": 2901,
  "samplingSite": "Entire pituitary gland.",
  "tissueSite": "Pituitary",
  "tissueSiteDetail": "Pituitary",
  "tissueSiteDetailAbbr": "PTTARY",
  "tissueSiteDetailId": "Pituitary",
  "uberonId": "0000007"
}, {
  "colorHex": "DDDDDD",
  "colorRgb": "221,221,221",
  "datasetId": "gtex_v8",
  "eGeneCount": 7356,
  "expressedGeneCount": 30385,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 221,
  "rnaSeqSampleCount": 245,
  "sGeneCount": 2463,
  "samplingSite": "Non-nodular region of representative region.",
  "tissueSite": "Prostate",
  "tissueSiteDetail": "Prostate",
  "tissueSiteDetailAbbr": "PRSTTE",
  "tissueSiteDetailId": "Prostate",
  "uberonId": "0002367"
}, {
  "colorHex": "0000FF",
  "colorRgb": "0,0,255",
  "datasetId": "gtex_v8",
  "eGeneCount": 15483,
  "expressedGeneCount": 29686,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 517,
  "rnaSeqSampleCount": 604,
  "sGeneCount": 4652,
  "samplingSite": "Extension of the abdominal incision to the suprapubic area avoiding pubic hair. ",
  "tissueSite": "Skin",
  "tissueSiteDetail": "Skin - Not Sun Exposed (Suprapubic)",
  "tissueSiteDetailAbbr": "SKINNS",
  "tissueSiteDetailId": "Skin_Not_Sun_Exposed_Suprapubic",
  "uberonId": "0036149"
}, {
  "colorHex": "7777FF",
  "colorRgb": "119,119,255",
  "datasetId": "gtex_v8",
  "eGeneCount": 16967,
  "expressedGeneCount": 29629,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 605,
  "rnaSeqSampleCount": 701,
  "sGeneCount": 5134,
  "samplingSite": "Left or right leg 2 cm below patella on medial side.",
  "tissueSite": "Skin",
  "tissueSiteDetail": "Skin - Sun Exposed (Lower leg)",
  "tissueSiteDetailAbbr": "SKINS",
  "tissueSiteDetailId": "Skin_Sun_Exposed_Lower_leg",
  "uberonId": "0004264"
}, {
  "colorHex": "555522",
  "colorRgb": "85,85,34",
  "datasetId": "gtex_v8",
  "eGeneCount": 6681,
  "expressedGeneCount": 30321,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 174,
  "rnaSeqSampleCount": 187,
  "sGeneCount": 2084,
  "samplingSite": "Thickened mucosa corresponding to lymphoid nodules (Peyer Patches) just proximal to the ileocecal valve in the most distal part of the small intestine.",
  "tissueSite": "Small Intestine",
  "tissueSiteDetail": "Small Intestine - Terminal Ileum",
  "tissueSiteDetailAbbr": "SNTTRM",
  "tissueSiteDetailId": "Small_Intestine_Terminal_Ileum",
  "uberonId": "0001211"
}, {
  "colorHex": "778855",
  "colorRgb": "119,136,85",
  "datasetId": "gtex_v8",
  "eGeneCount": 10783,
  "expressedGeneCount": 29856,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 227,
  "rnaSeqSampleCount": 241,
  "sGeneCount": 2837,
  "samplingSite": "Central region, 5 mm below capsule.",
  "tissueSite": "Spleen",
  "tissueSiteDetail": "Spleen",
  "tissueSiteDetailAbbr": "SPLEEN",
  "tissueSiteDetailId": "Spleen",
  "uberonId": "0002106"
}, {
  "colorHex": "FFDD99",
  "colorRgb": "255,221,153",
  "datasetId": "gtex_v8",
  "eGeneCount": 8771,
  "expressedGeneCount": 28254,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 324,
  "rnaSeqSampleCount": 359,
  "sGeneCount": 2638,
  "samplingSite": "Body (Gently rinse mucosa with normal saline before aliquot preparation)",
  "tissueSite": "Stomach",
  "tissueSiteDetail": "Stomach",
  "tissueSiteDetailAbbr": "STMACH",
  "tissueSiteDetailId": "Stomach",
  "uberonId": "0000945"
}, {
  "colorHex": "AAAAAA",
  "colorRgb": "170,170,170",
  "datasetId": "gtex_v8",
  "eGeneCount": 18795,
  "expressedGeneCount": 40180,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 322,
  "rnaSeqSampleCount": 361,
  "sGeneCount": 8626,
  "samplingSite": "Left testis (and right testis if necessary to obtain sufficient tissue for aliquots).",
  "tissueSite": "Testis",
  "tissueSiteDetail": "Testis",
  "tissueSiteDetailAbbr": "TESTIS",
  "tissueSiteDetailId": "Testis",
  "uberonId": "0000473"
}, {
  "colorHex": "006600",
  "colorRgb": "0,102,0",
  "datasetId": "gtex_v8",
  "eGeneCount": 17684,
  "expressedGeneCount": 30166,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 574,
  "rnaSeqSampleCount": 653,
  "sGeneCount": 5358,
  "samplingSite": "Most grossly non-nodular normal regions from either side (whichever side is observed to be more normal).",
  "tissueSite": "Thyroid",
  "tissueSiteDetail": "Thyroid",
  "tissueSiteDetailAbbr": "THYROID",
  "tissueSiteDetailId": "Thyroid",
  "uberonId": "0002046"
}, {
  "colorHex": "FF66FF",
  "colorRgb": "255,102,255",
  "datasetId": "gtex_v8",
  "eGeneCount": 3577,
  "expressedGeneCount": 29192,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 129,
  "rnaSeqSampleCount": 142,
  "sGeneCount": 1524,
  "samplingSite": "Corpus. Bivalve uterus along endocervical canal to fundus.",
  "tissueSite": "Uterus",
  "tissueSiteDetail": "Uterus",
  "tissueSiteDetailAbbr": "UTERUS",
  "tissueSiteDetailId": "Uterus",
  "uberonId": "0000995"
}, {
  "colorHex": "FF5599",
  "colorRgb": "255,85,153",
  "datasetId": "gtex_v8",
  "eGeneCount": 3730,
  "expressedGeneCount": 29727,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 141,
  "rnaSeqSampleCount": 156,
  "sGeneCount": 1460,
  "samplingSite": "Anterior.",
  "tissueSite": "Vagina",
  "tissueSiteDetail": "Vagina",
  "tissueSiteDetailAbbr": "VAGINA",
  "tissueSiteDetailId": "Vagina",
  "uberonId": "0000996"
}, {
  "colorHex": "FF00BB",
  "colorRgb": "255,0,187",
  "datasetId": "gtex_v8",
  "eGeneCount": 12360,
  "expressedGeneCount": 24144,
  "hasEGenes": true,
  "hasSGenes": true,
  "rnaSeqAndGenotypeSampleCount": 670,
  "rnaSeqSampleCount": 755,
  "sGeneCount": 3013,
  "samplingSite": "Femoral vein; subclavian vein and heart are other possible sites.",
  "tissueSite": "Blood",
  "tissueSiteDetail": "Whole Blood",
  "tissueSiteDetailAbbr": "WHLBLD",
  "tissueSiteDetailId": "Whole_Blood",
  "uberonId": "0013756"
}];

class Point {
  /**
   * Point can be instantiated with no property defined initially.
   * @param {Object?} coord {x:Any?, y:Any?, z:Any?}
   * @param {Number?} v 
   * @param {Number?} r 
   */
  constructor(coord = {
    x: undefined,
    y: undefined,
    z: undefined
  }, v = undefined, r = undefined) {
    this.setCoord(coord);
    this.setValue(v);
    this.setR(r);
  }

  // computed properties and aliases
  get displayValue() {
    return this.v.toPrecision(3);
  }
  get value() {
    return this.v;
  }

  // setters
  setCoord(coord = {
    x: undefined,
    y: undefined,
    z: undefined
  }) {
    this.x = coord.x;
    this.y = coord.y;
    this.z = coord.z;
  }
  setValue(v) {
    this.v = v;
  }
  setR(r) {
    this.r = r;
  }
}

class Variant extends Point {
  /**
   * 
   * @param {String} varId GTEx variant ID
   * @param {String?} chr 
   * @param {Number} pos 
   */
  constructor(varId, chr = undefined, pos = undefined) {
    super();
    this.varId = varId;
    this.chr = chr;
    this.pos = parseInt(pos);
    this.rsId = undefined;
    if (this.chr === undefined) this.setGenomicPosition();
  }
  get variantId() {
    return this.varId;
  }
  get chromosome() {
    return this.chr;
  }
  get colorValue() {
    return this.v;
  }
  setRsId(id) {
    this.rsId = id;
  }
  setGenomicPosition() {
    this.pos = parseInt(this.varId.split("_")[1]);
    this.chr = this.varId.split("_")[0];
  }
}

class QTL extends Variant {
  /**
    * 
    * @param {String} variantId GTEx variant ID 
    * @param {String} gencodeId Gencode ID
    * @param {String} phenotypeId GTEx phenotype ID -- will only exist for sQTLs
    * @param {String} tissueId GTEx tissue ID 
    * @param {Number} pvalue 
    * @param {Number} nes 
    * @param {String} type 
    */
  constructor(varId, gencodeId, phenotypeId, tissueId, pvalue, nes, type) {
    super(varId);
    this.gencodeId = gencodeId;
    this.phenotypeId = phenotypeId;
    this.tissueId = tissueId;
    this.tissueSiteDetailAbbr = tissueTable()[this.tissueId].tissueSiteDetailAbbr;
    this.pValue = pvalue;
    this.nes = nes;
    this.type = type;

    // plot properties
    this.setCoord({
      x: this.varId,
      y: this.type + "-" + this.tissueSiteDetailAbbr
    });
    this.setR(-Math.log10(parseFloat(this.pValue.toPrecision(3))));
    this.setValue(parseFloat(this.nes.toPrecision(3)));
  }
  get tissueSiteDetailId() {
    return this.tissueId;
  }
  setGeneSymbol(s) {
    this.geneSymbol = s;
  }
}

class Feature {
  constructor(label, type) {
    this.label = label;
    this.type = type;
  }
  get featureLabel() {
    return this.label;
  }
  get featureType() {
    return this.type;
  }
}

class Gene extends Feature {
  /**
   * 
   * @param {String} gencodeId GTEx variant ID
   * @param {String} chr 
   * @param {String} strand
   * @param {Number} start
   * @param {Number} end
   * @param {String?} type: gene type
   * @param {String?} symbol: gene symbol
   */
  constructor(gencodeId, chr, strand, start, end, type = undefined, symbol = undefined) {
    super(symbol, type);
    this.gencodeId = gencodeId;
    this.id = gencodeId.split(".")[0].toLowerCase(); // remove gencodeId version otherwise it can't be a DOM ID
    this.chr = chr;
    this.start = start;
    this.end = end;
    this.type = type;
    this.symbol = symbol;
    this.strand = strand;
    this.tss = this.strand == "+" ? this.start : this.end;
  }

  // computed properties

  // aliases 
  get chromosome() {
    return this.chr;
  }
  get pos() {
    return this.tss;
  }
  get geneSymbol() {
    return this.symbol;
  }
}

/* eslint-disable no-prototype-builtins */

/**
 * This module is to support GTEx LocusBrowser by
 * parsing and transforming from GTEx webservices
 * to the data modals that GTEx LocusBrowser supports.
 */
const host = "https://gtexportal.org/api/v2/";
const serviceUrls = {
  tissueInfo: host + "dataset/tissueSiteDetail",
  funcAnno: host + "dataset/functionalAnnotation?datasetId=gtex_v8",
  // gene-centric
  queryGene: host + "reference/gene?gencodeVersion=v26&genomeBuild=GRCh38%2Fhg38&geneId=",
  geneModel: host + "dataset/collapsedGeneModelExon?datasetId=gtex_v8&gencodeId=",
  eqtls: host + "association/singleTissueEqtl?datasetId=gtex_v8&gencodeId=",
  sqtls: host + "association/singleTissueSqtl?datasetId=gtex_v8&gencodeId=",
  ld: host + "dataset/ld?datasetId=gtex_v8&gencodeId=",
  independentEqtl: host + "association/independentEqtl?gencodeId=",
  genes: host + "reference/neighborGene?",
  geneInfo: host + "reference/gene?geneId=",
  fineMapping: host + "association/fineMapping?gencodeId=",
  // variant-centric
  variantEqtls: host + "association/singleTissueEqtl?tissueSiteDetailId=",
  variantSqtls: host + "association/singleTissueSqtl?variantId=",
  gwasCats: host + "reference/gwasCatalogByLocation",
  ldByVariant: host + "dataset/ldByVariant?variantId=",
  variantByLocation: host + "dataset/variantByLocation?sortBy=pos&sortDirection=asc"
};
const annoCatDict = {
  enhancer: "rgb(193, 39, 45)",
  promoter: "rgb(237, 28, 36)",
  open_chromatin_region: "rgb(247, 147, 30)",
  promoter_flanking_region: "rgb(241, 90, 36)",
  CTCF_binding_site: "rgb(255, 221, 13)",
  TF_binding_site: "rgb(252, 238, 33)",
  "3_prime_UTR_variant": "rgb(140, 198, 63)",
  "5_prime_UTR_variant": "rgb(57, 181, 74)",
  frameshift_variant: "rgb(102, 45, 145)",
  intron_variant: "rgb(179, 179, 179)",
  missense_variant: "rgb(255, 143, 241)",
  non_coding_transcript_exon_variant: "rgb(153, 134, 117)",
  splice_acceptor_variant: "rgb(41, 171, 226)",
  splice_donor_variant: "rgb(0, 113, 188)",
  splice_region_variant: "rgb(46, 49, 146)",
  stop_gained: "rgb(255, 0, 255)",
  synonymous_variant: "rgb(255, 211, 206)"
};

/**
 * Parse tissue info
 * @param {Json} obj from the tissue info web service 
 * @returns {Dictionary} of tissue objects indexed by tissueSiteDetailId
 */
function parseTissueInfo(obj) {
  // data error-echecking
  const tissues = obj;
  ["rnaSeqAndGenotypeSampleCount", "tissueSiteDetailId"].forEach(d => {
    _checkRequiredAttribute(tissues[0], d);
  });

  // parse
  let tissueMap = {};
  tissues.forEach(t => {
    tissueMap[t.tissueSiteDetailAbbr] = t;
  });
  return tissueMap;
}

/**
 * Erro-checking the gene with the query string
 * @param {JSON} obj 
 * @param {String} queryString: gencodeId or gene symbol
 * @returns {Gene} a Gene object
 */
function checkGene(obj, queryString) {
  // data error-checking
  // const attr = "gene";
  // _checkRequiredAttribute(obj, attr);

  // find one unique matching gene
  let gene = undefined;
  if (obj.length > 1) {
    // the value of obj[attr] is a list
    console.warn("More than one matching entities to " + queryString);
    gene = _findBestMatchedGene(obj, queryString);
  } else {
    gene = obj[0];
  }

  // check required attributes
  ["tss", "chromosome", "strand", "gencodeId"].forEach(d => {
    _checkRequiredAttribute(gene, d);
  });
  return new Gene(gene.gencodeId, gene.chromosome, gene.strand, gene.start, gene.end, gene.geneType, gene.geneSymbol);
}

/**
 * Find the best matching gene from the list by gene symbol
 * @param glist {List} of gene objects
 * @param queryString
 * @returns {a gene object}
 * @private
 */
function _findBestMatchedGene(glist, queryString) {
  const attr = "geneSymbolUpper";
  _checkRequiredAttribute(glist[0], attr);

  // find the best match
  let results = glist.filter(d => d[attr] == queryString.toUpperCase());
  if (results.length === 1) return results[0];else {
    alert("Error: More than one gene match to this search. ");
    throw "No matching gene found";
  }
}

/**
 * Filter neighbor genes by gene type
 * Currently, this function returns only protein coding genes and lincRNAs
 * @param obj {Json} the GTEx neighborGene service with a list of genes
 * @return {Gene[]} a list of Gene objects
 */
function findNeighborGenes(obj) {
  // error-checking
  // const attr = "neighborGene";
  //_checkRequiredAttribute(obj, attr);

  // filtering by gene type
  _checkRequiredAttribute(obj[0], "geneType");
  let genes = obj.filter(d => {
    return d.geneType == "protein coding" || d.geneType == "lincRNA";
  });

  // parsing and transforming data to support Locus Browser
  return genes.map(d => {
    return new Gene(d.gencodeId, d.chromosome, d.strand, d.start, d.end, d.geneType, d.geneSymbol);
  });
}

/**
 * Get variant functional annotations
 * @param {Json} obj 
 */
function getVariantFunctionalAnnotations(obj, gene = undefined) {
  const regCatSet = new Set([
  // these are regulatory annotations
  "enhancer", "promoter", "open_chromatin_region", "promoter_flanking_region", "CTCF_binding_site", "TF_binding_site"]);

  // data structure error-checking
  const attr = "functionalAnnotation";
  _checkRequiredAttribute(obj, attr);
  ["chromosome", "pos"].forEach(d => {
    _checkRequiredAttribute(obj[0], d);
  });
  let funcAnnoDict = {}; // a dict of lists--lists of annotation categories indexed by variant ID

  const variantKeyMap = {
    "3PrimeUtrVariant": "3_prime_UTR_variant",
    "5PrimeUtrVariant": "5_prime_UTR_variant",
    "ctcfBindingSite": "CTCF_binding_site",
    "enhancer": "enhancer",
    "frameshiftVariant": "frameshift_variant",
    "intronVariant": "intron_variant",
    "missenseVariant": "missense_variant",
    "nonCodingTranscriptExonVariant": "non_coding_transcript_exon_variant",
    "openChromatinRegion": "open_chromatin_region",
    "promoter": "promoter",
    "promoterFlankingRegion": "promoter_flanking_region",
    "spliceAcceptorVariant": "splice_acceptor_variant",
    "spliceDonorVariant": "splice_donor_variant",
    "spliceRegionVariant": "splice_region_variant",
    "stopGained": "stop_gained",
    "synonymous_variant": "synonymouse_variant",
    "tfBindingSite": "TF_binding_site"
  };
  obj.forEach(d => {
    // find annotation categories of this variant
    let cats = Object.keys(d).filter(k => {
      if (d[k] == true && variantKeyMap.hasOwnProperty(k)) {
        let colorKey = variantKeyMap[k];
        // this is a functional annotation attribute
        if (gene !== undefined && !(d.pos <= gene.end && d.pos >= gene.start)) {
          // if the position is outside the gene transcript region
          // filter the annotation based on whether it's a regulatory category
          return regCatSet.has(colorKey);
        } else {
          return true;
        }
      }
    }).map(k => {
      return variantKeyMap[k];
    });
    // if there's one or more categories, then store in the dictionary
    if (cats.length > 0) funcAnnoDict[d.variantId] = cats;
  });
  return funcAnnoDict;
}

/**
 * Get the gene's collapsed gene model structure
 * @param obj {Json} from GTEx collapsed gene model web service
 * @returns {List} of exon objects
 */
function getGeneModel(obj) {
  // data structure error-checking
  // const attr = "collapsedGeneModelExon";
  // _checkRequiredAttribute(obj, attr);
  if (obj.length == 0) {
    console.warn("This gene has no collapsed gene model information.");
    return [];
  }
  ["start", "exonId"].forEach(d => {
    _checkRequiredAttribute(obj[0], d);
  });

  // transform data for the visualization
  return obj.map(d => {
    d.pos = d.start;
    d.featureLabel = d.exonId;
    return d;
  });
}

/**
 * Get QTL track data
 * Collapse QTL data and report the best p-value for each variant
 * @param obj {Json} from GTEx QTL web service
 * @returns {List} of best p-value QTL at each locus
 */
function getQtlTrackData(obj, attr = "singleTissueEqtl") {
  // data structure error-checking
  // _checkRequiredAttribute(obj, attr);
  let data = obj;
  if (data.length == 0) return [];
  ["variantId", "pos", "pValue"].forEach(d => {
    _checkRequiredAttribute(data[0], d);
  });

  // aggregate
  const collapse = (arr, d) => {
    if (arr.hasOwnProperty(d.variantId)) {
      if (arr[d.variantId].pValue > d.pValue) arr[d.variantId] = d;
    } else {
      arr[d.variantId] = d;
    }
    return arr;
  };
  let bestPvalueQtlDict = data.reduce(collapse, {});

  // transform data for the visualization
  let qtlFeatures = Object.values(bestPvalueQtlDict).map(d => {
    d.chr = d.chromosome;
    d.start = d.pos;
    d.end = d.pos;
    d.featureType = "variant";
    d.featureLabel = d.snpId || d.variantId;
    d.colorValue = -Math.log10(d.pValue);
    return d;
  });
  return qtlFeatures.sort((a, b) => {
    return parseInt(a.pos) - parseInt(b.pos);
  });
}

/**
 * Parse data objects for bubble heat map or data map
 * @param {Object[]} obj 
 * @param {String?} attr 
 * @param {String?} dType 
 * @returns QTL[] a list of QTL objects
 */
function getQtlMapData(obj, attr = "singleTissueEqtl", dType = "eQTL") {
  // data structure error-checking
  // _checkRequiredAttribute(obj, attr);
  let data = obj;
  if (data === undefined) throw `Data parsing error: ${obj} ${attr}`;
  if (data.length == 0) return [];
  ["variantId", "tissueSiteDetailId", "nes", "pValue"].forEach(d => {
    _checkRequiredAttribute(data[0], d);
  });

  // data transformation for the visualization

  return data.map(d => {
    const qtl = new QTL(d.variantId, d.gencodeId, d.phenotypeId, d.tissueSiteDetailId, d.pValue, d.nes, dType);
    qtl.setGeneSymbol(d.geneSymbol);
    qtl.setRsId(d.snpId);
    return qtl;
  });
}

/**
 * @param obj {List} of independent eQTLs of the gene
 * @returns {List} of filtered independent eQTLs
 */
function getEqtlIndieData(obj, attr = "independentEqtl") {
  // data structure error-checking
  _checkRequiredAttribute(obj, attr);
  const data = obj;
  if (data.length == 0) return [];
  ["gencodeId", "variantId", "rank", "tissueSiteDetailId"].forEach(d => {
    _checkRequiredAttribute(data[0], d);
  });

  // generate a freq table, for filtering the results based on a cutoff (i.e. at least 2 observed independent events)
  const dict = data.reduce((arr, d) => {
    const key = d.tissueSiteDetailId;
    if (!arr.hasOwnProperty(key)) arr[key] = 0;
    arr[key] += 1;
    return arr;
  }, {});
  return data.map(d => {
    d.tissueId = d.tissueSiteDetailId;
    d.x = d.variantId;
    d.y = "eQTL-" + d.tissueId;
    d.rank = parseInt(d.rank);
    return d;
  }).filter(d => {
    // filter the data based on the frequency table
    const key = d.tissueSiteDetailId;
    return dict[key] >= 2; // requires a gene to be observed more than once in a tissue
  });
}

/**
 * Get the gene set from a data set
 * @param {Object} obj dataset from which to generate a gene list
 * @param {String?} dataAttr the attribute to use from each data element object
 * @param {String?} attr the attr in the obj where data is stored
 */
function getSet(obj, dataAttr = "gencodeId") {
  // data structure error-checking
  let data = obj;
  if (data === undefined) throw `Data parsing error: ${obj}`;
  if (data.length == 0) return [];
  [dataAttr].forEach(d => {
    _checkRequiredAttribute(data[0], d);
  });
  let items = data.map(d => d[dataAttr]);
  return new Set([...items]);
}
/**
 * 
 * @param {Object[]} data a data set 
 * @param {number} pos the query position
 * @param {String?} dataAttr the attribute to calculate distance
 * @param {String?} attr the attribute in the dataset object to access the data
 */
function getClosest(data, pos, dataAttr = "tss") {
  // data structure error-checking

  const minDist = min$1(data, g => Math.abs(g[dataAttr] - pos));
  return data.filter(g => {
    return Math.abs(g[dataAttr] - pos) == minDist;
  })[0];
}

/*
* Currently not in-use
* @returns {Set} of indies sQTLs indexed by gencode
 */
// function getSqtlIndieData(obj){
//     const firstElement = obj[0];
//     ["spliceId", "variantId", "tissueId"].forEach((d)=>{_checkRequiredAttribute(firstElement, d)});
//
//     // generate a freq table
//     const dict = obj.reduce((arr, d)=>{
//         const gencodeId = d.spliceId.split(":")[4];
//         const key = gencodeId+"|"+d.tissueId;
//         if (!arr.hasOwnProperty(key)) arr[key] = 0;
//         arr[key] += 1;
//         return arr
//     }, {});
//
//     return new Set(obj
//         .filter((d)=>{ // filter the data based on the frequency table
//             const gencodeId = d.spliceId.split(":")[4];
//             const key = gencodeId+"|"+d.tissueId;
//             return dict[key] >= 2; // requires a gene to be observed more than once in a tissue
//         })
//         .map((d)=>{
//             const gencodeId = d.spliceId.split(":")[4];
//             return [gencodeId, d.variantId, d.tissueId].join("|")
//         })
//     );
//
// }

function _checkRequiredAttribute(obj, attr, debug = false) {
  if (debug) console.info(obj);
  if (obj.hasOwnProperty(attr) === undefined) {
    console.error(obj);
    throw "Data Parsing Error: required attribute not found." + attr;
  }
}

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */

function render$2(par, featureId, variantId, tissueId, groupName = undefined, qtlType = "eqtl", urls = getGtexUrls()) {
  let queryUrl = "";
  if (qtlType.toLowerCase() == "sqtl") queryUrl = urls.dynsqtl + `?variantId=${variantId}&phenotypeId=${featureId}&tissueSiteDetailId=${tissueId}`;else queryUrl = urls.dyneqtl + `?variantId=${variantId}&gencodeId=${featureId}&tissueSiteDetailId=${tissueId}`;
  const promises = [RetrieveAllPaginatedData(urls.geneId + featureId), RetrieveNonPaginatedData(queryUrl), RetrieveAllPaginatedData(urls.tissue)];
  Promise.all(promises).then(function (args) {
    //for sqtl: the feature ID is a phenotpye ID. There won't be any return from the geneSearch function
    let geneSymbol = args[0].length == 1 ? args[0][0].geneSymbol : featureId;
    let json = args[1];
    let data = parseDynQtl(json);
    let group = groupName || data.tissueSiteDetailId;
    let tissueDict = parseTissueDict(args[2]);
    let tissueSiteDetail = tissueDict[data.tissueSiteDetailId]["tissueSiteDetail"];
    // construct the dynEqtl data for the three genotypes: ref, het, alt
    par.data = [{
      group: group,
      label: data.ref.length > 2 ? "ref" : data.ref,
      size: data.homoRefExp.length,
      values: data.homoRefExp
    }, {
      group: group,
      label: data.het.length > 2 ? "het" : data.het,
      size: data.heteroExp.length,
      values: data.heteroExp
    }, {
      group: group,
      label: data.alt.length > 2 ? "alt" : data.alt,
      size: data.homoAltExp.length,
      values: data.homoAltExp
    }];
    par.numPoints = 10;
    let info = {};
    info[group] = {
      "pvalue": data["pValue"] === null ? 1 : parseFloat(data["pValue"]).toPrecision(3),
      "pvalueThreshold": data["pValueThreshold"] === null ? 0 : parseFloat(data["pValueThreshold"]).toPrecision(3)
    };
    let violin = new GroupedViolin(par.data, info);
    let inWidth = par.width - (par.margin.left + par.margin.right);
    let inHeight = par.height - (par.margin.top + par.margin.bottom);
    let tooltipId = `${par.id}Tooltip`;

    // create the SVG
    let svg = createSvg$1(par.id, par.width, par.height, par.margin);
    violin.render(svg, inWidth, inHeight, undefined, [], par.xAxis, par.subXAxis, par.yAxis, par.sizeAxis, par.showWhisker, par.showDivider, par.showLegend, par.showOutliers, par.numPoints, par.vColor);
    svg.selectAll(".violin-size-axis").classed("violin-size-axis-hide", true).classed("violin-size-axis", false);
    violin.createTooltip(tooltipId);
    customizeTooltip(violin, geneSymbol, variantId, false, tissueSiteDetail);
    return svg;
  });
}
var QtlViolinPlot = {
  render: render$2
};

/*!
 * jQuery UI Widget 1.13.2
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Widget
//>>group: Core
//>>description: Provides a factory for creating stateful widgets with a common API.
//>>docs: http://api.jqueryui.com/jQuery.widget/
//>>demos: http://jqueryui.com/widget/

( function( factory ) {

	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {

var widgetUuid = 0;
var widgetHasOwnProperty = Array.prototype.hasOwnProperty;
var widgetSlice = Array.prototype.slice;

$.cleanData = ( function( orig ) {
	return function( elems ) {
		var events, elem, i;
		for ( i = 0; ( elem = elems[ i ] ) != null; i++ ) {

			// Only trigger remove when necessary to save time
			events = $._data( elem, "events" );
			if ( events && events.remove ) {
				$( elem ).triggerHandler( "remove" );
			}
		}
		orig( elems );
	};
} )( $.cleanData );

$.widget = function( name, base, prototype ) {
	var existingConstructor, constructor, basePrototype;

	// ProxiedPrototype allows the provided prototype to remain unmodified
	// so that it can be used as a mixin for multiple widgets (#8876)
	var proxiedPrototype = {};

	var namespace = name.split( "." )[ 0 ];
	name = name.split( "." )[ 1 ];
	var fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	if ( Array.isArray( prototype ) ) {
		prototype = $.extend.apply( null, [ {} ].concat( prototype ) );
	}

	// Create selector for plugin
	$.expr.pseudos[ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {

		// Allow instantiation without "new" keyword
		if ( !this || !this._createWidget ) {
			return new constructor( options, element );
		}

		// Allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	// Extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,

		// Copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),

		// Track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	} );

	basePrototype = new base();

	// We need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( typeof value !== "function" ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = ( function() {
			function _super() {
				return base.prototype[ prop ].apply( this, arguments );
			}

			function _superApply( args ) {
				return base.prototype[ prop ].apply( this, args );
			}

			return function() {
				var __super = this._super;
				var __superApply = this._superApply;
				var returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		} )();
	} );
	constructor.prototype = $.widget.extend( basePrototype, {

		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? ( basePrototype.widgetEventPrefix || name ) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	} );

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// Redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor,
				child._proto );
		} );

		// Remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );

	return constructor;
};

$.widget.extend = function( target ) {
	var input = widgetSlice.call( arguments, 1 );
	var inputIndex = 0;
	var inputLength = input.length;
	var key;
	var value;

	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( widgetHasOwnProperty.call( input[ inputIndex ], key ) && value !== undefined ) {

				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :

						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );

				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string";
		var args = widgetSlice.call( arguments, 1 );
		var returnValue = this;

		if ( isMethodCall ) {

			// If this is an empty collection, we need to have the instance method
			// return undefined instead of the jQuery instance
			if ( !this.length && options === "instance" ) {
				returnValue = undefined;
			} else {
				this.each( function() {
					var methodValue;
					var instance = $.data( this, fullName );

					if ( options === "instance" ) {
						returnValue = instance;
						return false;
					}

					if ( !instance ) {
						return $.error( "cannot call methods on " + name +
							" prior to initialization; " +
							"attempted to call method '" + options + "'" );
					}

					if ( typeof instance[ options ] !== "function" ||
						options.charAt( 0 ) === "_" ) {
						return $.error( "no such method '" + options + "' for " + name +
							" widget instance" );
					}

					methodValue = instance[ options ].apply( instance, args );

					if ( methodValue !== instance && methodValue !== undefined ) {
						returnValue = methodValue && methodValue.jquery ?
							returnValue.pushStack( methodValue.get() ) :
							methodValue;
						return false;
					}
				} );
			}
		} else {

			// Allow multiple hashes to be passed on init
			if ( args.length ) {
				options = $.widget.extend.apply( null, [ options ].concat( args ) );
			}

			this.each( function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} );
					if ( instance._init ) {
						instance._init();
					}
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			} );
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",

	options: {
		classes: {},
		disabled: false,

		// Callbacks
		create: null
	},

	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = widgetUuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();
		this.classesElementLookup = {};

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			} );
			this.document = $( element.style ?

				// Element within the document
				element.ownerDocument :

				// Element is window or document
				element.document || element );
			this.window = $( this.document[ 0 ].defaultView || this.document[ 0 ].parentWindow );
		}

		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this._create();

		if ( this.options.disabled ) {
			this._setOptionDisabled( this.options.disabled );
		}

		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},

	_getCreateOptions: function() {
		return {};
	},

	_getCreateEventData: $.noop,

	_create: $.noop,

	_init: $.noop,

	destroy: function() {
		var that = this;

		this._destroy();
		$.each( this.classesElementLookup, function( key, value ) {
			that._removeClass( value, key );
		} );

		// We can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.off( this.eventNamespace )
			.removeData( this.widgetFullName );
		this.widget()
			.off( this.eventNamespace )
			.removeAttr( "aria-disabled" );

		// Clean up events and states
		this.bindings.off( this.eventNamespace );
	},

	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;
		var parts;
		var curOption;
		var i;

		if ( arguments.length === 0 ) {

			// Don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {

			// Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},

	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},

	_setOption: function( key, value ) {
		if ( key === "classes" ) {
			this._setOptionClasses( value );
		}

		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this._setOptionDisabled( value );
		}

		return this;
	},

	_setOptionClasses: function( value ) {
		var classKey, elements, currentElements;

		for ( classKey in value ) {
			currentElements = this.classesElementLookup[ classKey ];
			if ( value[ classKey ] === this.options.classes[ classKey ] ||
					!currentElements ||
					!currentElements.length ) {
				continue;
			}

			// We are doing this to create a new jQuery object because the _removeClass() call
			// on the next line is going to destroy the reference to the current elements being
			// tracked. We need to save a copy of this collection so that we can add the new classes
			// below.
			elements = $( currentElements.get() );
			this._removeClass( currentElements, classKey );

			// We don't use _addClass() here, because that uses this.options.classes
			// for generating the string of classes. We want to use the value passed in from
			// _setOption(), this is the new value of the classes option which was passed to
			// _setOption(). We pass this value directly to _classes().
			elements.addClass( this._classes( {
				element: elements,
				keys: classKey,
				classes: value,
				add: true
			} ) );
		}
	},

	_setOptionDisabled: function( value ) {
		this._toggleClass( this.widget(), this.widgetFullName + "-disabled", null, !!value );

		// If the widget is becoming disabled, then nothing is interactive
		if ( value ) {
			this._removeClass( this.hoverable, null, "ui-state-hover" );
			this._removeClass( this.focusable, null, "ui-state-focus" );
		}
	},

	enable: function() {
		return this._setOptions( { disabled: false } );
	},

	disable: function() {
		return this._setOptions( { disabled: true } );
	},

	_classes: function( options ) {
		var full = [];
		var that = this;

		options = $.extend( {
			element: this.element,
			classes: this.options.classes || {}
		}, options );

		function bindRemoveEvent() {
			var nodesToBind = [];

			options.element.each( function( _, element ) {
				var isTracked = $.map( that.classesElementLookup, function( elements ) {
					return elements;
				} )
					.some( function( elements ) {
						return elements.is( element );
					} );

				if ( !isTracked ) {
					nodesToBind.push( element );
				}
			} );

			that._on( $( nodesToBind ), {
				remove: "_untrackClassesElement"
			} );
		}

		function processClassString( classes, checkOption ) {
			var current, i;
			for ( i = 0; i < classes.length; i++ ) {
				current = that.classesElementLookup[ classes[ i ] ] || $();
				if ( options.add ) {
					bindRemoveEvent();
					current = $( $.uniqueSort( current.get().concat( options.element.get() ) ) );
				} else {
					current = $( current.not( options.element ).get() );
				}
				that.classesElementLookup[ classes[ i ] ] = current;
				full.push( classes[ i ] );
				if ( checkOption && options.classes[ classes[ i ] ] ) {
					full.push( options.classes[ classes[ i ] ] );
				}
			}
		}

		if ( options.keys ) {
			processClassString( options.keys.match( /\S+/g ) || [], true );
		}
		if ( options.extra ) {
			processClassString( options.extra.match( /\S+/g ) || [] );
		}

		return full.join( " " );
	},

	_untrackClassesElement: function( event ) {
		var that = this;
		$.each( that.classesElementLookup, function( key, value ) {
			if ( $.inArray( event.target, value ) !== -1 ) {
				that.classesElementLookup[ key ] = $( value.not( event.target ).get() );
			}
		} );

		this._off( $( event.target ) );
	},

	_removeClass: function( element, keys, extra ) {
		return this._toggleClass( element, keys, extra, false );
	},

	_addClass: function( element, keys, extra ) {
		return this._toggleClass( element, keys, extra, true );
	},

	_toggleClass: function( element, keys, extra, add ) {
		add = ( typeof add === "boolean" ) ? add : extra;
		var shift = ( typeof element === "string" || element === null ),
			options = {
				extra: shift ? keys : extra,
				keys: shift ? element : keys,
				element: shift ? this.element : element,
				add: add
			};
		options.element.toggleClass( this._classes( options ), add );
		return this;
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement;
		var instance = this;

		// No suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// No element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {

				// Allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
						$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// Copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^([\w:-]*)\s*(.*)$/ );
			var eventName = match[ 1 ] + instance.eventNamespace;
			var selector = match[ 2 ];

			if ( selector ) {
				delegateElement.on( eventName, selector, handlerProxy );
			} else {
				element.on( eventName, handlerProxy );
			}
		} );
	},

	_off: function( element, eventName ) {
		eventName = ( eventName || "" ).split( " " ).join( this.eventNamespace + " " ) +
			this.eventNamespace;
		element.off( eventName );

		// Clear the stack to avoid memory leaks (#10056)
		this.bindings = $( this.bindings.not( element ).get() );
		this.focusable = $( this.focusable.not( element ).get() );
		this.hoverable = $( this.hoverable.not( element ).get() );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				this._addClass( $( event.currentTarget ), null, "ui-state-hover" );
			},
			mouseleave: function( event ) {
				this._removeClass( $( event.currentTarget ), null, "ui-state-hover" );
			}
		} );
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				this._addClass( $( event.currentTarget ), null, "ui-state-focus" );
			},
			focusout: function( event ) {
				this._removeClass( $( event.currentTarget ), null, "ui-state-focus" );
			}
		} );
	},

	_trigger: function( type, event, data ) {
		var prop, orig;
		var callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();

		// The original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// Copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( typeof callback === "function" &&
			callback.apply( this.element[ 0 ], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}

		var hasOptions;
		var effectName = !options ?
			method :
			options === true || typeof options === "number" ?
				defaultEffect :
				options.effect || defaultEffect;

		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		} else if ( options === true ) {
			options = {};
		}

		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;

		if ( options.delay ) {
			element.delay( options.delay );
		}

		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue( function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			} );
		}
	};
} );

return $.widget;

} );

/**
 * Create a dialog popup window for the eQTL violin plots
 * @param parentDivId {String} where to create the dialog
 * @param dialogDivId {String}
 * @param title {String} the title of the dialog window
 * Dependencies: jQuery
 */
function createDialog(parentDivId, dialogDivId, title) {
  // jquery UI dialog
  checkDomId(parentDivId);
  let parent = $$1(`#${parentDivId}`);
  let dialog = $$1("<div/>").attr("id", dialogDivId).attr("title", title).appendTo(parent);
  let clearDiv = $$1("<div/>").html("Clear All").appendTo(dialog);
  let contentDiv = $$1("<div/>").attr("id", `${dialogDivId}-content`).appendTo(dialog);
  dialog.dialog({
    title: title,
    autoOpen: false
  });
  clearDiv.click(function () {
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
function addPlotToDialog(dialogDivId, data, urls) {
  // add a new plot div to the dialog content
  let plot = $$1("<div/>").attr("class", "violin-dialog").css("float", "left").css("margin", "20px").appendTo(`#${dialogDivId}-content`);
  let plotHeader = $$1("<div/>").appendTo(plot);

  // add a close button of the plot
  $$1("<i/>").attr("class", "fa fa-window-close").css("margin-right", "2px").click(function () {
    plot.remove();
  }).appendTo(plotHeader);
  let plotTitle = `${data.y}<br/><span style="font-size: 12px">${data.geneSymbol}: ${data.gencodeId}<br/>${data.x}<br/></span>`;
  if (data.type == "sQTL") {
    plotTitle += `<span style="font-size: 12px">${data.phenotypeId.replace(":" + data.gencodeId, "")}</span><br/>`;
  } else {
    plotTitle += "<br/>";
  }
  $$1("<span/>").attr("class", "title").html(plotTitle).appendTo(plotHeader);

  // add the violin plot
  let id = "dEqtl" + Date.now().toString(); // random ID generator
  $$1("<div/>").attr("id", id).appendTo(plot);
  renderViolinPlot(id, data, urls);
  return plot;
}
function renderViolinPlot(id, data, urls) {
  let config = {
    id: id,
    data: undefined,
    // this would be assigned by the eqtl violin function
    width: 250,
    height: 200,
    margin: {
      left: 50,
      right: 20,
      top: 20,
      bottom: 50
    },
    showDivider: false,
    xAxis: {
      show: false,
      angle: 0,
      paddingInner: 0.01,
      paddingOuter: 0.01,
      textAnchor: "start",
      adjustHeight: 0,
      showLabels: false,
      showTicks: false
    },
    yAxis: {
      label: data.type == "eQTL" ? "Norm. Expression" : "Norm. Intron-Excision Ratio"
    },
    showWhisker: false,
    showLegend: false,
    showSampleSize: true,
    vColor: data.type == "sQTL" ? "#a4dced" : "#a9e4cc"
  };
  let featureId = data.type == "eQTL" ? data.gencodeId : data.phenotypeId;
  render$2(config, featureId, data.variantId, data.tissueSiteDetailId, data.y, data.type, urls);
}

/**
 * Check if DOM ID exist
 * @param {String} id 
 */
function checkDomId(id) {
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
function renderTissueMenu(tissues, id, clearBtnId = "modal-clear-tissues-btn", selectAllBtnId = "modal-all-tissues-btn") {
  select(`#${id}`).selectAll("*").remove(); // clear previously rendered menu

  let form = document.getElementById(id);
  tissues.forEach(d => {
    let item = document.createElement("input");
    item.type = "checkbox";
    item.value = d.tissueSiteDetailAbbr;
    item.name = "tissueSite";
    item.checked = true;
    let label = document.createElement("label");
    label.innerHTML = `${d.tissueSiteDetail} (${d.tissueSiteDetailAbbr}) `; // display tissue name
    label.classList.add("tissue-menu-item");
    form.appendChild(item);
    form.appendChild(label);
    form.appendChild(document.createElement("br"));
  });
  select(`#${clearBtnId}`).on("click", () => {
    let tissueSiteInputs = document.getElementsByName("tissueSite");
    tissueSiteInputs.forEach(d => {
      d.checked = false;
    });
  });
  select(`#${selectAllBtnId}`).on("click", () => {
    let tissueSiteInputs = document.getElementsByName("tissueSite");
    tissueSiteInputs.forEach(d => {
      d.checked = true;
    });
  });
}

/* eslint-disable no-prototype-builtins */

/**
 * Customize QTL tooltip
 * @param {QTL} d 
 */
const customizeQTLTooltip = d => {
  const tissue = tissues.find(t => t.tissueSiteDetailId == d.tissueId);
  const tissueDisplayName = tissue !== undefined ? tissue.tissueSiteDetail : d.tissueId;
  const tooltipData = [`<span class="tooltip-key">QTL type</span>: <span class="tooltip-value">${d.type}</span>`, `<span class="tooltip-key">Tissue</span>: <span class="tooltip-value">${tissueDisplayName}</span>`, `<span class="tooltip-key">Variant</span>: <span class="tooltip-value">${d.x}</span>`, `<span class="tooltip-key">RS Id</span>: <span class="tooltip-value">${d.rsId}</span>`, `<span class="tooltip-key">NES</span>: <span class="tooltip-value">${d.value}</span>`, `<span class="tooltip-key">-log10(p-val)</span>: <span class="tooltip-value">${d.r.toPrecision(3)}</span>`];
  return tooltipData.join("<br/>");
};

/**
 * Customize the barmap or bubblemap row text labels
 * @param bmap {DataMap}
 * @private
 */
function customizeMapRowLabels(bmap, tissueMap) {
  bmap.svg.selectAll(".bubble-map-ylabel").remove();
  bmap.svg.select(".bar-map-y-axis").remove();
  bmap.svg.select(".custom-map-y-axis").selectAll("*").remove();
  bmap.svg.select(".custom-map-y-axis").remove();
  let axis = axisLeft(bmap.yScale).tickSize(0);
  let axisG = bmap.svg.append("g").attr("class", "custom-map-y-axis").attr("transform", "translate(-2, 0)").call(axis);

  // modifying tissue names
  let typeCounts = {};
  bmap.yScale.domain().forEach(d => {
    let temp = d.split("-");
    let dType = temp[0];
    if (!typeCounts.hasOwnProperty(dType)) typeCounts[dType] = 0;
    typeCounts[dType]++;
  });
  const allTypes = Object.keys(typeCounts).sort((a, b) => {
    return a - b;
  });

  // render QTL type background and labels
  bmap.svg.selectAll(".type-bar").remove();
  let typeG = bmap.svg.selectAll(".type-bar").data(allTypes).enter().append("g").attr("class", "type-bar");
  typeG.append("rect").attr("x", 0).attr("y", 2).attr("class", d => d).attr("stroke", "white").attr("width", 10).attr("height", d => bmap.yScale.step() * typeCounts[d]).attr("transform", (d, i) => {
    const Y = i == 0 ? 0 : bmap.yScale.step() * typeCounts[allTypes[i - 1]];
    return `translate(-100, ${Y})`;
  });
  typeG.append("line").attr("x1", -100).attr("x2", 100).attr("y1", 2).attr("y2", 2).attr("stroke-width", 1).attr("class", d => d).attr("transform", (d, i) => {
    const Y = i == 0 ? 0 : bmap.yScale.step() * typeCounts[allTypes[i - 1]];
    return `translate(-100, ${Y})`;
  });
  const shift = 15;
  typeG.append("text").attr("x", 0).attr("y", 2).attr("class", d => d).text(d => typeCounts[d] == undefined ? "" : d).style("text-anchor", "end").style("font-size", 12).attr("transform", (d, i) => {
    const Y = i == 0 ? shift : bmap.yScale.step() * typeCounts[allTypes[i - 1]] + shift;
    return `translate(-105, ${Y})`;
  });

  // render QTL tissue text labels
  axisG.select("path").remove();
  axisG.selectAll("text").attr("class", "custom-map-y-label").attr("fill", "#111111").style("cursor", "pointer").text(d => {
    let temp = d.split("-");
    let dType = temp[0];
    const tissueId = d.replace(`${dType}-`, ""); // tissueId is tissue abbr

    let sampleSize = 0;
    if (!tissueMap.hasOwnProperty(tissueId)) {
      console.error(`Unrecognized ${tissueId}`);
    }
    if (tissueMap[tissueId].hasOwnProperty("eqtlSampleSummary")) {
      sampleSize = tissueMap[tissueId].eqtlSampleSummary.totalCount;
    }
    return `${tissueId} (${sampleSize})`;
  }).on("mouseover", function (d) {
    let temp = d.split("-");
    let dType = temp[0];
    const tissueId = d.replace(`${dType}-`, "");
    const tooltipData = [`<span class="tooltip-key">Tissue</span>: <span class="tooltip-value">${tissueMap[tissueId].tissueSiteDetail}</span>`, `<span class="tooltip-key">QTL type</span>: <span class="tooltip-value">${dType}</span>`, `<span class="tooltip-key">Sample size</span>: <span class="tooltip-value">${tissueMap[tissueId].eqtlSampleSummary.totalCount}</span>`];
    bmap.tooltip.show(tooltipData.join("<br/>"));
    select(this).style("font-weight", "bold");
  }).on("mouseout", function () {
    bmap.tooltip.hide();
    select(this).style("font-weight", "normal");
  });

  // change row line color based on the data type
  bmap.svg.selectAll(".bar-row").select("line").style("stroke", function () {
    let c = select(this).attr("class");
    if (c == "GWAS") return "#651b23";
    if (c == "sQTL") return "#0a3e7b";
    return "#bdbdbd";
  }).style("stroke-width", 0.5);
}

/* eslint-disable no-prototype-builtins */
/**
 * Copyright © 2015 - 2019 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */

// the data structure is predefined here for par.data
let data = {
  locusData: {
    gwasImputed: undefined,
    eqtl: undefined,
    sqtl: undefined
  },
  track: {
    // genome browser tracks
    tss: undefined,
    geneModel: undefined,
    eqtl: undefined,
    sqtl: undefined,
    // the following tracks are from H3K27Ac
    enhancerBrain: undefined,
    enhancerHeart: undefined,
    enhancerLung: undefined,
    enhancerSkeletalMuscle: undefined
  },
  queryGene: undefined,
  genes: undefined,
  gwasToGene: undefined,
  functionAnnotationDict: undefined,
  ld: [],
  tissueMap: {}
};
let vizComponents = {
  svg: undefined,
  lastTrack: undefined,
  ldMap: undefined
};
const dataUrls = serviceUrls;
const functionAnnotationKeys = annoCatDict;

/**
 * 
 * @param {String} geneId 
 * @param {Object} par 
 * @param {Function} callback: callback function to execute external tasks (and the required parameter is the gene ID)
 */
function init$1(geneId, par = DefaultConfig) {
  // get data from web services and set the values in par.data
  _showSpinner(par);
  select("#locus-browser-error").text(""); // erase any previous error messages
  _fetchData(par, geneId); // this function fetches data and then calls _render() to render the plot
  if (par.callback !== undefined) par.callback(geneId); // runs additional parallele callback function if it's specified in par.callback
}

/**
 * Fetch data by calling GTEx web services, and execute the callback function
 * @param {DefaultConfig} par 
 * @param {String} geneId 
 * @param {Function} callback: that callback function should take two parameters: par and geneId
 */
function _fetchData(par, geneId) {
  ////// first find the query gene
  RetrieveAllPaginatedData(par.urls.queryGene + geneId).then(geneJson => {
    const theGene = checkGene(geneJson, geneId);
    ////// then fetch neiboring genes within the defined genomic range
    RetrieveAllPaginatedData(`${par.urls.genes}pos=${theGene.tss}&chromosome=${theGene.chromosome}&bp_window=${par.genomicWindow}`).then(nbJson => {
      // create promises for all other data
      const promises = ["geneModel", "tissueInfo", "funcAnno", "eqtls", "sqtls", "independentEqtl", "ld"].map(d => {
        if (d == "tissueInfo") {
          return RetrieveAllPaginatedData(par.urls[d]);
        }
        if (d == "funcAnno") {
          return RetrieveAllPaginatedData(par.urls[d] + `&chromosome=${theGene.chromosome}&start=${theGene.tss - 1e6}&end=${theGene.tss + 1e6}`, 10000);
        }
        const url = par.urls[d] + theGene.gencodeId;
        if (d == "ld") {
          return RetrieveAllPaginatedData(url, 10000);
        }
        return RetrieveAllPaginatedData(url, 1000);
      });

      ////// then get all other data
      Promise.all(promises).then(args => {
        par.data.queryGene = theGene;
        par.data.genes = findNeighborGenes(nbJson);
        par.data.tissueMap = parseTissueInfo(args[1]);
        par.data.functionAnnotationDict = getVariantFunctionalAnnotations(args[2], theGene);
        par.data.locusData = {
          eqtl: getQtlMapData(args[3], "singleTissueEqtl", "eQTL"),
          sqtl: getQtlMapData(args[4], "singleTissueSqtl", "sQTL")
        };
        par.data.indies = {
          eqtl: getEqtlIndieData(args[5])
        };
        par.data.track = {
          tss: par.data.genes,
          geneModel: getGeneModel(args[0]),
          eqtl: getQtlTrackData(args[3], "singleTissueEqtl"),
          sqtl: getQtlTrackData(args[4], "singleTissueSqtl")
        };
        par.data.ld = _ldMapDataParserHelper(args[6]);
        par.data.qtlMap = [].concat(par.data.locusData.eqtl).concat(par.data.locusData.sqtl);

        // hide the spinner
        _hideSpinner(par);

        // execute the callback function
        _render$1(par, geneId);
      });
    });
  }).catch(e => {
    console.error(e);
    _hideSpinner(par);
    select("#locus-browser-error").text(`${geneId.toUpperCase()} cannot be rendered.`);
    select(".show-if-success").style("opacity", 0);
    select("#locus-browser-toolbar").style("opacity", 0);
  });
}

/**
 * Render function
 * @param par {Object} visualization config with required attributes
 */
function _render$1(par = DefaultConfig, geneId) {
  // rendering visualizations
  _calculateDimensions(par);
  par.viz.svg = _createSvg$2(par.id, par.width, par.height, {
    left: 0,
    top: 0
  }, undefined);
  par.viz.bmap = undefined;
  _renderGeneVisualComponents(par);
  if (par.data.track.geneModel.length == 0) {
    // this gene has no gene model, indicating that the gene was not included in the data analysis.
    // no more rendering to proceed
    select("#gene-model-track").append("text") // TODO: remove hard-coded DOM ID reference
    .attr("x", 0).attr("y", 50).attr("fill", "red").text(`${geneId} is not included in the QTL analysis.`);
    return;
  }
  par.viz.lastTrack = _renderVariantTracks(par); // it's important to keep track of the last track on the mini genome, because that's where the brush is implemented
  _renderQtlMapWithLD(par);

  // rendering DOM components
  _renderGeneInfo(par);
  _setUIEvents(geneId, par);
  _renderDataFilterModal(par);
  _bindVariantSearchForm(par);
}
function _bindVariantSearchForm(par) {
  $$1("#variantInput").keypress(function (e) {
    if (e.keyCode == 13) {
      // bind the enter key
      e.preventDefault(); // Note: prevent the default behavior of the enter key, which is refreshing the page
      const queryVariants = $$1("#variantInput").val();
      _locateVariants(queryVariants, par);
    }
  });
}

/**
 * Locate user-speficied variants in LocusBrowser
 * @param {String} vInput a comma-separated list of variant IDs, rs IDs, and or positions
 * @param {Object} par the plot's config object
 */
function _locateVariants(vInput, par) {
  const vInputSet = new Set(vInput.replace(/\s/g, "").toUpperCase().split(","));
  const flag = {};
  [...vInputSet].forEach(v => {
    flag[v] = false;
  });
  const foundVar = {};
  par.viz.bmap.data.filter(d => {
    let found = false;
    if (vInputSet.has(d.variantId.toUpperCase())) {
      found = true;
      flag[d.variantId.toUpperCase()] = true;
    } else if (vInputSet.has(`${d.chromosome.toUpperCase()}_${d.pos}`)) {
      found = true;
      flag[`${d.chromosome.toUpperCase()}_${d.pos}`] = true;
    } else if (d.rsId !== null && vInputSet.has(d.rsId.toUpperCase())) {
      found = true;
      flag[d.rsId.toUpperCase()] = true;
    }
    return found;
  }).forEach(d => {
    foundVar[d.variantId] = {
      "variantId": d.variantId,
      "pos": d.pos,
      "chr": d.chromosome,
      "rsId": d.snpId
    };
  });

  // report variants that aren't found
  const notFound = Object.keys(flag).filter(v => flag[v] == false);
  if (notFound.length > 0) $$1("#locus-browser-error").text(`Variants not found: ${notFound.join(", ")}`);

  // render found variants
  par.selectedVariants = Object.values(foundVar);
  _renderFoundVariants(par);
}

/**
 * Render the symbols and highlight text labels of user-specified variants when found in the QTL data
 * @param {Object} par LocusBrowser's plot config object 
 */
function _renderFoundVariants(par) {
  const foundVar = par.selectedVariants;
  if (foundVar === undefined) return; // do nothing when there's no selected variants

  // clear any previously rendered markers 
  selectAll(".found-variant").remove();
  selectAll(".found-variant-2").remove();

  // render the variant markers
  par.viz.lastTrack.dom.selectAll(".found-variant").data(foundVar) // find unique positions
  .enter().append("path").attr("d", symbol().type(symbolDiamond).size(36)).attr("class", "found-variant").attr("transform", d => `translate(${par.viz.lastTrack.scale(d.pos)}, 25)`).attr("fill", "#dcc30c").attr("stroke", "white");
  par.viz.bmap.svg.selectAll(".found-variant").data(foundVar).enter().append("path").attr("d", symbol().type(symbolDiamond)).attr("class", "found-variant").attr("transform", d => `translate(${par.viz.bmap.xScale(d.variantId) + par.viz.bmap.xScale.bandwidth() / 2 || 0}, -20)`).attr("fill", d => par.viz.bmap.xScale(d.variantId) ? "#dcc30c" : "white").attr("stroke", "white").style("cursor", "pointer").on("mouseover", function (d) {
    const tooltipData = [`<span class="tooltip-key">Variant Id</span>: <span class="tooltip-value">${d.variantId}</span>`, `<span class="tooltip-key">RS Id</span>: <span class="tooltip-value">${d.rsId}</span>`];
    par.viz.bmap.tooltip.show(tooltipData.join("<br/>"));
  }).on("mouseout", function () {
    par.viz.bmap.tooltip.hide();
  });
  par.viz.bmap.svg.selectAll(".found-variant-2").data(foundVar).enter().append("path").attr("d", symbol().type(symbolDiamond)).attr("class", "found-variant-2").attr("transform", d => `translate(${par.viz.bmap.xScale(d.variantId) + par.viz.bmap.xScale.bandwidth() / 2 || 0}, ${par.viz.bmap.yScale.range()[1]})`).attr("fill", d => par.viz.bmap.xScale(d.variantId) ? "#dcc30c" : "white").attr("stroke", "white").style("cursor", "pointer").on("mouseover", function (d) {
    const tooltipData = [`<span class="tooltip-key">Variant Id</span>: <span class="tooltip-value">${d.variantId}</span>`, `<span class="tooltip-key">RS Id</span>: <span class="tooltip-value">${d.rsId}</span>`];
    par.viz.bmap.tooltip.show(tooltipData.join("<br/>"));
  }).on("mouseout", function () {
    par.viz.bmap.tooltip.hide();
  });
}
function _showSpinner(par) {
  select(`#${par.spinnerId}`).style("opacity", 1);
}
function _hideSpinner(par) {
  select(`#${par.spinnerId}`).style("opacity", 0);
}
function _renderGeneInfo(par) {
  select(".show-if-success").style("opacity", 100);
  let panel = select(`#${par.infoId}`);
  let gene = par.data.queryGene;
  let data = par.data;
  panel.selectAll("*").remove(); // clear any previous contents

  panel.append("div").text(`Query Gene: ${gene.geneSymbol} (${gene.gencodeId}), ${gene.description}`);
  panel.append("div").text(`Gene Location: ${gene.chromosome}:${gene.start} - ${gene.end} (${gene.strand})`);
  panel.append("div").text(`Total eQTLs: ${data.locusData.eqtl.length}`);
  panel.append("div").text(`Total sQTLs: ${data.locusData.sqtl.length}`);
}

/**
 * Create an SVG D3 object
 * @param id {String} the parent dom ID
 * @param width {Numeric}: the outer width
 * @param height {Numeric}: the outer height
 * @param margin {Object} with attr: left, top
 * @param svgId {String}
 * @returns {*}
 * @private
 */
function _createSvg$2(id, width, height, margin, svgId = undefined) {
  checkDomId$2(id);
  if (svgId === undefined) svgId = `${id}-svg`;
  if (margin === undefined) margin = {
    top: 0,
    left: 0
  };
  let dom = select("#" + id).append("svg").attr("width", width).attr("height", height).attr("id", svgId).append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
  return dom;
}

/**
 * Define the click event of the QTL map -- generate the QTL violin plots
 */
function _setQtlClickEvent(par) {
  const dialogDivId = "qtl-violin-dialog";
  const qtlClickEvent = d => {
    $$1(`#${dialogDivId}`).dialog("open");
    addPlotToDialog(dialogDivId, d, par.urls);
  };
  par.viz.bmap.svg.selectAll(".data-bar").on("click", qtlClickEvent);
  par.viz.bmap.svg.selectAll(".map-bubble").on("click", qtlClickEvent);
}

/**
 * Define UI mouse events
 * @param geneId
 * @param par
 */
function _setUIEvents(geneId, par) {
  // create violin plot dialog window
  createDialog("qtl-violin-div", "qtl-violin-dialog", "QTL Violin Plot Dialog");

  // show the toolbar
  select("#locus-browser-toolbar").style("opacity", 100).style("display", "block");

  // Visualization click events
  // Toolbar
  select("#show-v-id").on("click", () => {
    par.panels.qtlMap.showColumnLabel = !par.panels.qtlMap.showColumnLabel;
    if (par.panels.qtlMap.showColumnLabel) {
      select("#" + par.id).select("svg").attr("height", par.height + 80);
      select("#show-v-id").text("Hide Variant ID");
    } // make room for text labels
    else {
      select("#" + par.id).select("svg").attr("height", par.height);
      select("#show-v-id").text("Show Variant ID");
    }
    _customizeMapColumnLabels(par);
  });
  select("#change-qtl-map").on("click", () => {
    if (par.panels.qtlMap.mapType == "barmap") {
      par.panels.qtlMap.mapType = "bubblemap";
      selectAll(".bar-row").remove();
      select("#change-qtl-map").text("Use Bar Map");
    } else {
      par.panels.qtlMap.mapType = "barmap";
      select("#change-qtl-map").text("Use Bubble Map");
    }
    _changeQtlMapType(par);
  });

  // modal related UI events
  const dataTypeFilter = () => {
    let dataTypeInputs = document.getElementsByName("dataType");
    let dataTypes = [];
    dataTypeInputs.forEach(d => {
      if (d.checked) dataTypes.push(d.value);
    });
    return dataTypes;
  };
  const tissueSiteFilter = () => {
    let tissueSiteInputs = document.getElementsByName("tissueSite");
    let sites = [];
    tissueSiteInputs.forEach(d => {
      if (d.checked) sites.push(d.value);
    });
    return sites;
  };
  const filter = () => {
    let bmap = par.viz.bmap;
    let oldDomain = new Set(bmap.fullYDomain);
    let dataTypes = dataTypeFilter();
    let sites = tissueSiteFilter();
    // let newDomain = [bmap.yScale.domain()[0]]; // always include the GWAS data
    let newDomain = [];
    dataTypes.forEach(d => {
      sites.forEach(s => {
        let item = `${d}-${s}`;
        if (oldDomain.has(item)) newDomain.push(item); // check if the dataType in a tissue site is available in the full data set
      });
    });
    // optimize visualization dimensions for the filtered data
    let oldInHeight = bmap.yScale.range()[1];
    let newInHeight = newDomain.length * par.panels.qtlMap.rowHeight;
    par.height = par.height + (newInHeight - oldInHeight);
    if (par.panels.qtlMap.showColumnLabel) {
      select("#" + par.id).select("svg").attr("height", par.height + 80);
    } else {
      select("#" + par.id).select("svg").attr("height", par.height);
    }
    bmap.yScale.domain(newDomain) // reset the yScale domain
    .range([bmap.yScale.range()[0], newInHeight]);
    _rerender(par);
  };
  select("#modal-close-btn").on("click", filter);
  select("#modal-filter-btn").on("click", filter);
  select("#zoom-plus").on("click", () => {
    par.genomicWindow = par.genomicWindow <= 5e4 ? 5e4 : par.genomicWindow / 2;
    _rerender(par);
  });
  select("#zoom-minus").on("click", () => {
    par.genomicWindow = par.genomicWindow >= 1e6 ? 1e6 : par.genomicWindow * 2;
    _rerender(par);
  });
  select("#zoom-reset").on("click", () => {
    par.genomicWindow = 1e6;
    _rerender(par);
  });
  _reportCurrentWindow(par);
}

/**
 * Generate a tissue menu based off of the QTL data
 * @param {*} par 
 */
function _renderDataFilterModal(par) {
  // data modal
  select("#tissue-menu").selectAll("*").remove(); // clear previously rendered menu
  // get the unique list of tissues
  let tissueSet = new Set(par.viz.bmap.yScale.domain().map(d => {
    return d.replace("eQTL-", "").replace("sQTL-", "");
  }).filter((d, i, self) => {
    return !d.startsWith("GWAS") && self.indexOf(d) === i;
  }));
  let tissues$1 = tissues.filter(t => tissueSet.has(t.tissueSiteDetailAbbr));
  renderTissueMenu(tissues$1, "tissue-menu");
}

/**
 * Find all neighbor genes of the query gene
 * Only searching for coding and lincRNA genes are
 * @param data {List} of gene objects
 * @param par {Object} of the viz config with required attributes: dataFilters.genes, data.queryGene, genomicWindow...
 * @returns {List} of neighbor gene objects (including the query gene itself
 * @private
 */

function _findNeighbors(data, par) {
  const geneFilter = (d, gene, window) => {
    const lower = gene.tss - window; // lower bound
    const upper = gene.tss + window;
    if (d.chromosome == gene.chromosome && d.tss >= lower && d.tss <= upper) {
      return d.type == "protein coding" || d.type == "lincRNA";
    } else {
      return false;
    }
  };
  // fetch neighbor genes including the query gene itself
  let genes = data.filter(d => {
    // all genes within the genomic view range
    return geneFilter(d, par.data.queryGene, par.genomicWindow);
  }); // genes are filtered by gene types defined in the config object
  genes.sort((a, b) => {
    return parseInt(a.tss - parseInt(b.tss));
  });
  return genes;
}

/**
 * Calculate and sum the height of the root SVG based on the individual visual panels
 * Calculate and determine the Y position of each individual visual panel in the root SVG
 * @param par
 */
function _calculateDimensions(par = DefaultConfig) {
  par.height = Object.keys(par.panels).reduce((total, panelKey) => {
    let p = par.panels[panelKey];
    // simultaneously calculate the panel's yPos
    p.yPos = total;
    return total + p.height; // summing the height
  }, 0);
}

/**
 * Re-render the visualization when the genomic window range is changed
 * @param par {Object} visualization config
 */
function _rerender(par) {
  // clear all visualizations
  Object.keys(par.panels).forEach(k => {
    let panel = par.panels[k];
    select(`#${panel.id}`).remove();
  });
  select(`#${par.ld.id}`).selectAll("*").remove();
  _reportCurrentWindow(par);
  _renderGeneVisualComponents(par);
  par.viz.lastTrack = _renderVariantTracks(par);
  _renderQtlMapWithLD(par);
}
function _reportCurrentWindow(par) {
  select("#zoom-size").text(`Current window: ${(2 * par.genomicWindow / 1000).toLocaleString()} kb`);
}

/**
 * Render the visual components related to genes: GWAS trait heatmap, gene position track
 * @param par {Object} the configuration object of the overall visualization
 */
function _renderGeneVisualComponents(par = DefaultConfig) {
  // render the gene map as a heat map
  // const heatmapViz = _renderGeneHeatmap(par);
  let geneLabelScale = _renderNeighborGenes(par);

  // render gene related genomic tracks
  const tssTrackViz = _renderGeneTracks(par);

  //// visual customization: draw connecting lines between the gene heatmap column labels and tss positions on the tss track
  _customizeGene2TssTrackLines(par, geneLabelScale, tssTrackViz);
}

/**
 * Adding connecting lines from gene text labels to the TSS track in the mini genome
 * @param {*} par 
 * @param {ScaleBand} geneMapScale 
 * @param {MiniGenomeBrowser} tssTrack 
 */
function _customizeGene2TssTrackLines(par, geneMapScale, tssTrack) {
  let geneMapPanel = par.panels.geneMap;
  let tssPanel = par.panels.tssTrack;
  let xAdjust = geneMapPanel.margin.left - tssPanel.margin.left + 2;
  let yAdjust = tssPanel.margin.top;
  let trackHeight = tssPanel.height - (tssPanel.margin.top + tssPanel.margin.bottom);
  let gene = par.data.queryGene;
  const _getStrokeColor = d => {
    // color the query gene in red
    // color all other genes in grey
    return d.geneSymbol == gene.geneSymbol ? "red" : "#cccccc";
  };
  const _getStrokeWidth = (d, i) => {
    return d.geneSymbol == gene.geneSymbol ? 2 : (i + 1) % 10 == 0 ? 1 : 0.5;
  };
  let genesInWindow = _findNeighbors(par.data.track.tss, par);
  // error-checking
  if (genesInWindow.length == 0) console.error("Data error: now genes in window " + par.data.track.tss);
  tssTrack.svg.selectAll(".connect").remove();
  tssTrack.svg.selectAll(".connect").data(genesInWindow).enter().append("line").attr("class", d => `connect ${d.geneSymbol}`).attr("x1", d => geneMapScale(d.geneSymbol) + xAdjust).attr("x2", d => tssTrack.scale(d.tss)).attr("y1", trackHeight / 2 - yAdjust).attr("y2", trackHeight / 2).style("stroke", _getStrokeColor).style("stroke-width", _getStrokeWidth);

  // vertical connecting line
  tssTrack.svg.selectAll(".connect2").data(genesInWindow).enter().append("line").attr("class", d => `connect2 ${d.geneSymbol}`).attr("x1", d => geneMapScale(d.geneSymbol) + xAdjust).attr("x2", d => geneMapScale(d.geneSymbol) + xAdjust).attr("y1", trackHeight / 2 - yAdjust).attr("y2", trackHeight / 2 - geneMapPanel.margin.bottom - tssPanel.margin.top).attr("stroke", _getStrokeColor).attr("stroke-width", _getStrokeWidth);
}

/**
 * Render gene based genomic tracks: tss, exon
 * @param par {Object} the viz CONFIG
 * @returns {MiniGenomeBrowser} of the tss track
 */
function _renderGeneTracks(par = DefaultConfig) {
  // tss track
  let tssTrack = par.panels.tssTrack;
  const tssTrackViz = _renderFeatureTrack(par, tssTrack, par.data.track.tss, false);

  // gene model (exon) track
  let exonTrack = par.panels.geneModelTrack;
  _renderFeatureTrack(par, exonTrack, par.data.track.geneModel, true);
  return tssTrackViz; // why?
}
function _renderQtlIndies(par) {
  const bmap = par.viz.bmap;
  // const gencodeId = par.data.queryGene.gencodeId;
  bmap.svg.select("#qtl-indies").selectAll("*").remove();
  bmap.svg.select("#qtl-indies").remove();
  let indieG = bmap.svg.append("g").attr("id", "qtl-indies");
  const drawI = d => {
    let iSymbol = indieG.append("g").attr("x", 0).attr("y", 0).style("cursor", "pointer").attr("transform", `translate(${bmap.xScale(d.x) + bmap.xScale.bandwidth() / 2}, ${bmap.yScale(d.y) + bmap.yScale.step() - 10})`);
    iSymbol.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 5).attr("stroke", "black").attr("fill", "none");
    iSymbol.append("text").attr("x", -3).attr("y", 3).text(d.rank).style("fill", "blank").style("font-size", "10px").style("font-weight", "bold");
    iSymbol.on("mouseover", function () {
      const tooltipData = [`<span class="tooltip-key">Independent eQTL</span>: <span class="tooltip-value">${d.tissueId}</span>`, `<span class="tooltip-key">Variant Id</span>: <span class="tooltip-value">${d.variantId}</span>`, `<span class="tooltip-key">Rank</span>: <span class="tooltip-value">${d.rank}</span>`];
      par.viz.bmap.tooltip.show(tooltipData.join("<br/>"));
      select(this).select("circle").style("stroke-width", 2);
    });
    iSymbol.on("mouseout", function () {
      bmap.tooltip.hide();
      select(this).select("circle").style("stroke-width", 1);
    });
  };
  par.data.indies.eqtl.forEach(d => {
    if (bmap.xScale(d.x) && bmap.yScale(d.y)) drawI(d);
  });
}

/**
 * Rendering QTL map of loci and their LD map with an interactive brush for zoom
 * @param par {Plot config object}
 */
function _renderQtlMapWithLD(par = DefaultConfig) {
  let bmap = _instantiateQtlDataMap(par);
  if (par.viz.bmap !== undefined) {
    bmap.yScale = par.viz.bmap.yScale; // use customized data
  }
  // initial rendering components
  let dim = {
    w: Math.abs(bmap.xScale.range()[1] - bmap.xScale.range()[0]),
    h: Math.abs(bmap.yScale.range()[1] - bmap.yScale.range()[0]),
    top: 0,
    left: 0
  };
  bmap.drawSvg(bmap.svg, dim, par.panels.qtlMap.mapType, false, customizeQTLTooltip, true); // initial rendering of the QTL heat map
  bmap.drawColorLegend(bmap.svg, "Normalized Effect Size (NES)", {
    x: 0,
    y: -60
  }, {
    w: 30,
    h: 5
  }, [-1, -0.5, -0.2, 0, 0.2, 0.5, 1], "h");
  if (par.panels.qtlMap.mapType == "bubblemap") {
    let dataMax = Math.floor(bmap.rScale.domain()[1]);
    bmap.drawBubbleLegend(bmap.svg, "-log10(p-value)", {
      x: 500,
      y: -60
    }, [dataMax, dataMax / 2, dataMax / 4, dataMax / 8].map(d => parseInt(d)).reverse(), 40, "h"); // TODO: remove hard-coded values
  } // TODO: code review and refactoring
  par.viz.bmap = bmap;
  _setQtlClickEvent(par);
  par.viz.ldMap = _renderLdMap(par, bmap.xScale.domain()); // the rendering function returns a callback function for updating the LD map
  _renderGeneStartEndMarkers(bmap); // initial rendering of the tss and tes markers
  _brush(par); // initiate and call the brush
}
function _instantiateQtlDataMap(par = DefaultConfig) {
  let qtlMapPanel = par.panels.qtlMap; // get panel config
  let qtlMapData = par.data.qtlMap; // get QTL data
  let bmapInWidth = qtlMapPanel.width - (qtlMapPanel.margin.left + qtlMapPanel.margin.right); // calculate the inner width

  // adjust heights based on QTL data
  let ylist = [...new Set(qtlMapData.map(d => d.y))];
  const adjustH = () => {
    let oldInHeight = qtlMapPanel.height - (qtlMapPanel.margin.top + qtlMapPanel.margin.bottom);
    let newInHeight = ylist.length * qtlMapPanel.rowHeight;
    qtlMapPanel.height = newInHeight + (qtlMapPanel.margin.top + qtlMapPanel.margin.bottom);
    return newInHeight - oldInHeight;
  };
  par.height = par.height + adjustH();

  // update SVG's <svg> height
  if (par.panels.qtlMap.showColumnLabel) select("#" + par.id).select("svg").attr("height", par.height + 80);else select(`#${par.id}-svg`).attr("height", par.height);

  // rendering the map
  //// remove existing DOM with the same panel ID
  //// Note par.viz.svg is not <svg>, it is a <g>
  par.viz.svg.select("#" + qtlMapPanel.id).remove();

  //// instantiate the object
  let bmap = new DataMap(qtlMapData, qtlMapPanel.colorScheme);

  //// create the root <g> for the map
  bmap.svg = par.viz.svg.append("g").attr("id", qtlMapPanel.id).attr("class", "focus").attr("transform", `translate(${qtlMapPanel.margin.left}, ${qtlMapPanel.margin.top + qtlMapPanel.yPos})`);
  bmap.setScales({
    w: bmapInWidth,
    h: ylist.length * qtlMapPanel.rowHeight,
    top: 0,
    left: 0
  }, undefined, ylist); // hard setting for the color value range
  bmap.addTooltip("locus-browser", "locus-browser");
  bmap.fullXDomain = bmap.xScale.domain(); // save initial x domain since the active x list might change
  bmap.fullYDomain = bmap.yScale.domain(); // save the initial y domain since the active y list might change

  //-- TSS and TES markers
  let gene = par.data.queryGene;
  _findVariantsClosestToGeneStartEnd(gene, bmap); // NOTE: bmap.fullXDomain is required in this function and bmap.tss, bmap.tes are created and assigned by this function

  return bmap;
}
function _changeQtlMapType(par) {
  let bmap = par.viz.bmap;
  let currentZoomDomain = bmap.xScale.domain();
  bmap.xScale.domain(bmap.fullXDomain);
  if (par.panels.qtlMap.mapType == "barmap") {
    bmap.renderBars(bmap.svg, bmap.svg.select(".clippedArea"), false);
    bmap.svg.select("#dataMap-bubble-legend").remove(); // make sure there is no redundant rendering
    bmap.svg.selectAll(".bubble-legend").remove();
  } else {
    bmap.renderBubbles(bmap.svg.select(".clippedArea"), [0, 10], true);
    let dataMax = Math.floor(bmap.rScale.domain()[1]);
    bmap.drawBubbleLegend(bmap.svg, "-log10(p-value)", {
      x: 500,
      y: -60
    }, [dataMax, dataMax / 2, dataMax / 4, dataMax / 8].map(d => parseInt(d)).reverse(), 40, "h"); // TODO: remove hard-coded values
  }
  bmap.renderWithNewXDomain(bmap.svg, currentZoomDomain, par.panels.qtlMap.mapType);
  const brushRange = brushSelection(select("#miniBrowserBrush").node()); // figure out the current brush range
  select("#miniBrowserBrush").call(par.brush.move, brushRange); // trigger the brush event
  _setQtlClickEvent(par);
}
function _customizeMapColumnLabels(par) {
  let bmap = par.viz.bmap;
  bmap.svg.selectAll(".bubble-map-xlabel").remove(); // remove default xlabels of the bubble map
  bmap.svg.selectAll(".bar-map-x-axis").remove(); // remove default xlabels of the bubble map
  bmap.svg.selectAll(".custom-map-x-axis").remove(); // remove default xlabels of the bubble map

  let axis = axisBottom(bmap.xScale).tickSize(0);
  let Y = bmap.yScale.range()[1] + 2 * bmap.yScale.step();
  let axisG = bmap.svg.append("g").attr("class", "custom-map-x-axis").attr("transform", `translate(${-bmap.xScale.bandwidth() / 2}, ${Y})`).call(axis);
  axisG.select("path").remove(); // remove the axis line

  if (par.panels.qtlMap.showColumnLabel) {
    let foundVar = {};
    if (par.selectedVariants !== undefined) {
      par.selectedVariants.forEach(v => {
        foundVar[v.variantId] = v;
      });
    }
    axisG.selectAll("text").attr("y", -bmap.xScale.bandwidth() / 2) // due to 90 degrees rotation, y controls the actual horizontal position
    .attr("x", 0).attr("class", (d, i) => `custom-map-x-label x${i}`).attr("dy", ".35em").attr("transform", "rotate(90)").style("fill", d => foundVar.hasOwnProperty(d) ? "red" : "black").style("text-anchor", "start").text(d => {
      d = d.replace("chr", "");
      let t = d.split("_");
      return t.splice(0, 2).join("_");
    });
  } else {
    axisG.selectAll("text").remove();
  }

  // add variant functional annotation categories
  axisG.selectAll(".tick").append("rect").attr("class", "anno-box").attr("x", 0) // relative to its parent <g>
  .attr("y", -bmap.yScale.bandwidth() * 2) // position is relative to its parent <g>
  .attr("rx", 2).attr("width", bmap.xScale.bandwidth()).attr("height", bmap.yScale.bandwidth() * 0.75).style("fill", d => {
    if (par.data.functionAnnotationDict === undefined) return "none";
    let cats = par.data.functionAnnotationDict[d]; // cats is a list
    if (cats === undefined) return "#ffffff";
    return cats.length == 1 ? functionAnnotationKeys[cats[0]] : "black";
  }).style("opacity", 0.5).style("stroke", "#eeeeee").style("stoke-width", 1).on("mouseover", function (d) {
    let cats = par.data.functionAnnotationDict[d];
    if (cats !== undefined) {
      const tooltipData = [`<span class="tooltip-key">Variant Id</span>: <span class="tooltip-value">${d}</span>`, `<span class="tooltip-key">Annotations</span>: <span class="tooltip-value">${cats.join(", ").replace(/_d/g, "")}</span>`];
      bmap.tooltip.show(tooltipData.join("<br/>"));
      select(this).style("stroke", "#f53956");
    }
  }).on("mouseout", function () {
    bmap.tooltip.hide();
    select(this).style("stroke", "#eeeeee");
  });
  axisG.append("text").attr("class", "anno-row-label").attr("x", -5).attr("y", -bmap.yScale.bandwidth() * 2 + bmap.yScale.bandwidth() / 2).style("fill", "black").style("text-anchor", "end").text("Functional Annotations");
}

/**
 * render variant related genomic tracks
 * @param par
 * @param maxColorValue {Number} set the maximum color value for the color scale to color code the features on the track
 * @returns {MiniGenomeBrowser}
 */
function _renderVariantTracks(par = DefaultConfig, maxColorValue = 30) {
  let eqtlPanel = par.panels.eqtlTrack;
  let sqtlPanel = par.panels.sqtlTrack;

  // QTL tracks rendering
  _renderFeatureTrack(par, eqtlPanel, par.data.track.eqtl, false, true, maxColorValue);
  const sqtlTrackViz = _renderFeatureTrack(par, sqtlPanel, par.data.track.sqtl, false, true, maxColorValue);
  return sqtlTrackViz;
}

/**
 * Create the brush on the genomic tracks
 * @param par
 * @private
 */
function _brush(par) {
  let gene = par.data.queryGene;
  let bmap = par.viz.bmap;
  let ldMap = par.viz.ldMap;
  let trackViz = par.viz.lastTrack;
  const qtlMapPanel = par.panels.qtlMap;
  const brushPanel = par.panels.sqtlTrack; // TODO: the genomic track that the brush is on may not be the sqtl track

  // Define the brush events in a callback function: 
  // redraw all visualizations that are affected by the change of the zoom 
  // callback function parameters: left and right are screen coordinates, xA and xB are genomic coordinates
  const callback = (left, right, xA, xB) => {
    // re-define the x scale's domain() based on the brush 
    let focusDomain = bmap.fullXDomain.filter(d => {
      let pos = parseInt(d.split("_")[1]);
      return pos >= xA && pos <= xB;
    });
    bmap.renderWithNewXDomain(bmap.svg, focusDomain, qtlMapPanel.mapType);
    _renderGeneStartEndMarkers(bmap); // rerender the gene's TSS and TES markers on the bubble map
    customizeMapRowLabels(bmap, par.data.tissueMap); // rerender the rows text labels
    _customizeMapColumnLabels(par); // rerender the columns text labels
    _renderQtlIndies(par); // rerender the QTLs independent variants
    _renderFoundVariants(par); // rerender found variant markers if any
    // rerender the corresponding LD
    ldMap.svg.selectAll("*").remove();
    ldMap.redraw(focusDomain, focusDomain, bmap.xScale.range()); // range makes sure that the plot dimensions are consistent

    // redraw the connecting lines between the edges of the brush window to the edges of the bubble map
    selectAll(".brushLine").remove();
    select(".brush").append("line").classed("brushLine", true).attr("x1", left).attr("x2", bmap.xScale.range()[0] + qtlMapPanel.margin.left - brushPanel.margin.left).attr("y1", 5).attr("y2", par.panels.qtlMap.margin.top - 20).style("stroke-width", 1).style("stroke", "#ababab");
    select(".brush").append("line").classed("brushLine", true).attr("x1", right).attr("x2", bmap.xScale.range()[1] + qtlMapPanel.margin.left - brushPanel.margin.left).attr("y1", 5).attr("y2", par.panels.qtlMap.margin.top - 20).style("stroke-width", 1).style("stroke", "#ababab");
  };
  let brushConfig = {
    w: par.width / 10,
    // a fraction of the viz's width
    h: 20
  };

  // Create the view brush:
  // A brush is added as the X axis is rendered and appended to the last track of the mini genome browser
  let addBrush = true;
  const brush = MiniGenomeBrowser.renderAxis(trackViz.dom, trackViz.scale, brushPanel.height + 30, addBrush, callback, brushConfig, gene.tss);
  par.brush = brush;
}

/**
 * LD map parser
 * This parser may change again when the data is queried from the web service
 * @param data {Object} raw LD data
 * @param bmap {DataMap}
 * @param par {config object}
 * @private
 */
function _ldMapDataParserHelper(data) {
  let ldData = data.map(d => {
    let vars = d[0].split(",");
    return {
      x: vars[0],
      y: vars[1],
      value: Number(d[1]),
      displayValue: Number(d[1]).toPrecision(3)
    };
  });
  const vList = {};
  ldData.forEach(d => {
    vList[d.x] = true;
    vList[d.y] = true;
  });
  return ldData.concat(Object.keys(vList).map(v => {
    return {
      x: v,
      y: v,
      value: 1,
      displayValue: "1"
    };
  }));
}

/**
 * Render the LD halfmap
 * @param config {Locus Browser Config}
 * @param domain {List} domain for the scales
 * @returns {Halfmap} LD map object
 * @private
 */
function _renderLdMap(par, domain) {
  let config = par.ld;
  let data = par.data.ld;
  let ldMap = new HalfMap(data, config.cutoff, false, undefined, config.colorScheme, [0, 1]);
  ldMap.addTooltip("locus-browser");

  // LD heat map is rendered in canvas for performance optimization
  let ldCanvas = select(`#${config.id}`).append("canvas").attr("id", config.id + "-ld-canvas").attr("width", config.width).attr("height", config.width).style("position", "absolute");
  let ldContext = ldCanvas.node().getContext("2d");
  ldContext.translate(config.margin.left, config.margin.top);

  // SVG is used to render the cursor's rectangle
  let ldSvg = _createSvg$2(config.id, config.width, config.width, {
    top: config.margin.top,
    left: config.margin.left
  });
  ldSvg.attr("class", "ld").attr("id", "ldG");

  // render the color legend in the parent node of the ld svg
  const ldSvgParent = select(ldSvg.node().parentNode);
  ldMap.drawColorLegend(ldSvgParent, {
    x: config.margin.left,
    y: 100
  }, 10, "LD");

  // draw the ld map
  const drawConfig = {
    w: config.width - (config.margin.left + config.margin.right),
    top: 0,
    left: 0
  };
  ldMap.draw(ldCanvas, ldSvg, drawConfig, [0, 1], false, undefined, domain, domain);
  ldMap.saveSvgObj(ldSvg);
  ldMap.saveCanvasObj(ldCanvas);
  ldMap.saveConfig(drawConfig);
  return ldMap;
}

/**
 * Render the neighboring gene list
 * @param {Object} par the viz config 
 */

function _renderNeighborGenes(par = DefaultConfig) {
  // data
  par.data.genes = par.data.genes.sort((a, b) => {
    return a.tss - b.tss; // TSS
  });
  let nb = par.data.genes.map(d => d.geneSymbol);

  // visual properties
  let panel = par.panels.geneMap;
  let svg = par.viz.svg;

  // calculate panel dimensions
  let inWidth = panel.width - (panel.margin.left + panel.margin.right);
  if (inWidth == 0) throw "The inner height and width of the GWAS heatmap panel must be positive values. Check the height and margin configuration of this panel";

  // create panel <g> root element
  let mapG = svg.append("g").attr("id", panel.id).attr("transform", `translate(${panel.margin.left}, ${panel.margin.top})`);

  // set the scale
  let scale = band().domain(nb).range([0, inWidth]).padding(.05);

  // render
  let gene = par.data.queryGene;
  mapG.selectAll(".exp-map-xlabel").data(nb).enter().append("text").attr("class", "exp-map-xlabel").attr("x", 0).attr("y", 0).style("text-anchor", "start").style("cursor", "default").style("font-size", d => {
    return d == gene.geneSymbol ? 14 : scale.bandwidth() > 10 ? 10 : scale.bandwidth();
  }).attr("transform", d => {
    let x = scale(d) + 5;
    let y = 0;
    return `translate(${x}, ${y}) rotate(90)`;
  }).text(d => d);

  // CUSTOMIZATION: highlight the anchor gene
  mapG.selectAll(".exp-map-xlabel").attr("fill", d => d == gene.geneSymbol ? "red" : "#cccccc").style("cursor", "pointer").on("mouseover", function (d) {
    select(this).attr("fill", d == gene.geneSymbol ? "red" : "#000000");
    selectAll(`.${d}`).style("stroke", "#000000");
  }).on("mouseout", function (d) {
    let c = d == gene.geneSymbol ? "red" : "#cccccc";
    select(this).attr("fill", c);
    selectAll(`.${d}`).style("stroke", c);
  }).on("click", d => {
    // clear all visual panels
    select(`#${par.infoId}`).selectAll("*").remove(); // clear any previous contents
    select(`#${par.id}`).selectAll("*").remove();
    select(`#${par.ld.id}`).selectAll("*").remove();
    $$1("#geneInput").val(d);
    $$1("#variantInput").val("");

    // render data of the new gene
    init$1(d, par);
  });
  return scale;
}

/**
 * Render the Gene Heatmap
 * @param par {Object} the viz DefaultConfig
 * @returns {Heatmap}
 * Currently not in use
 */
// function _renderGeneHeatmap(par=DefaultConfig){
//     // data
//     let gene = par.data.queryGene;
//     let data = par.data.gwasToGene;

//     // visual properties
//     let panel = par.panels.geneMap;
//     let svg = par.viz.svg;

//     // calculate panel dimensions
//     let inWidth = panel.width - (panel.margin.left + panel.margin.right);
//     let inHeight = panel.height - (panel.margin.top + panel.margin.bottom);
//     if (inWidth * inHeight <= 0) throw "The inner height and width of the GWAS heatmap panel must be positive values. Check the height and margin configuration of this panel"

//     // create panel <g> root element
//     let mapG = svg.append("g")
//         .attr("id", panel.id)
//         .attr("transform", `translate(${panel.margin.left}, ${panel.margin.top})`);

//     // instantiate a Heatmap object
//     let tooltipId = "locus-browser-tooltip";
//     let hViz = new Heatmap(data, panel.useLog, 10, panel.colorScheme, panel.cornerRadius, tooltipId, tooltipId);

//     // render
//     hViz.draw(mapG, {w:inWidth, h:inHeight}, panel.columnLabel.angle, false, panel.columnLabel.adjust);
//     hViz.drawColorLegend(mapG, {x: 20, y:-20}, 5);

//     // CUSTOMIZATION: highlight the anchor gene
//     mapG.selectAll(".exp-map-xlabel")
//         .attr("fill", (d)=>d==gene.geneSymbol?"red":"#dddddd")
//         .style("cursor", "pointer")
//         .on("click", (d)=>{
//             // clear all visual panels
//             select(`#${par.infoId}`).selectAll("*").remove(); // clear any previous contents
//             select(`#${par.id}`).selectAll("*").remove();
//             select(`#${par.ld.id}`).selectAll("*").remove();
//             init(d, par); // render data of the new gene
//         });
//     hViz.svg = mapG;
//     return hViz
// }

/**
 * Render a feature track
 * @param par {Plot Config}
 * @param panel {Object} of the panel, by default, it's defined in CONFIG
 * @param data {List} panel's data
 * @param showWidth {Boolean} render the feature's width
 * @param useColorScale {Boolean} whether the color of the features should use a color scale
 * @param maxColorValue {Numnber} defines the maximum color value when useColorScale is true
 * @returns {MiniGenomeBrowser}
 */
function _renderFeatureTrack(par = DefaultConfig.panels, panel = DefaultConfig.panels.tssTrack, data, showWidth, useColorScale = false, maxColorValue = undefined) {
  let centerPos = par.data.queryGene.tss;
  let svg = par.viz.svg;
  let window = par.genomicWindow;

  // preparation for the plot
  let inWidth = panel.width - (panel.margin.left + panel.margin.right);
  let inHeight = panel.height - (panel.margin.top + panel.margin.bottom);
  let trackG = svg.append("g").attr("id", panel.id).attr("transform", `translate(${panel.margin.left}, ${panel.margin.top + panel.yPos})`);
  let featureViz = new MiniGenomeBrowser(data, centerPos, window);
  featureViz.render(trackG, inWidth, inHeight, showWidth, panel.label, panel.color.background, panel.color.feature, useColorScale, maxColorValue);
  featureViz.svg = trackG;
  return featureViz;
}

/**
 * Find the closest left-side variant of the gene start and end sites (tss and tes)
 * This function creates two new attributes, tss and tes, for bmap
 * @param gene {Object} that has attributes start and end
 * @param bmap {DataMap}
 */
function _findVariantsClosestToGeneStartEnd(gene, bmap) {
  let tss = gene.strand == "+" ? gene.start : gene.end;
  let tes = gene.strand == "+" ? gene.end : gene.start;
  let variants = bmap.fullXDomain;
  const findLeftSideNearestNeighborVariant = site => {
    return variants.filter((d, i) => {
      // if the variant position is the site position
      let pos = parseFloat(d.split("_")[1]); // assumption: the variant ID has the genomic location
      if (pos === site) return true;

      // else find where the site is located
      // first, get the neighbor variant
      if (variants[i + 1] === undefined) return false;
      let next = parseFloat(variants[i + 1].split("_")[1]) || undefined;
      return (pos - site) * (next - site) < 0; // rationale: the value would be < 0 when the site is located between two variants.
    });
  };
  let tssVariant = findLeftSideNearestNeighborVariant(tss);
  let tesVariant = findLeftSideNearestNeighborVariant(tes);
  bmap.tss = tssVariant[0]; // bmap.tss stores the closest left-side variant of the start site
  bmap.tes = tesVariant[0]; // bmap.tes stores the closest left-side variant of the end site
}

/**
 * Render the TSS and TES of the Gene if applicable
 * @param bmap {DataMap}
 * @param bmapSvg {D3} the SVG object of the bubble map
 */
function _renderGeneStartEndMarkers(bmap) {
  // rendering TSS
  let dom = bmap.svg;
  if (select("#siteMarkers").empty()) {
    let g = dom.append("g").attr("id", "siteMarkers");
    if (bmap.tss && bmap.xScale(bmap.tss)) {
      let tssMarker = g.append("g").attr("id", "tssMarker").attr("transform", () => {
        const X = bmap.xScale(bmap.tss) + bmap.xScale.bandwidth();
        return `translate(${X}, -10)`;
      });
      tssMarker.append("line").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", bmap.yScale.range()[1]).style("stroke", "#94a8b8").style("stroke-width", 2);
      tssMarker.append("text").text("TSS").attr("x", -bmap.xScale.bandwidth() / 2).attr("y", -2).attr("text-anchor", "center").style("font-size", "12px");
    }
    if (bmap.tes && bmap.xScale(bmap.tes)) {
      let tesMarker = g.append("g").attr("id", "tesMarker").attr("transform", () => {
        const X = bmap.xScale(bmap.tes) + bmap.xScale.bandwidth();
        return `translate(${X}, -10)`;
      });
      tesMarker.append("line").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", bmap.yScale.range()[1]).style("stroke", "#748797").style("stroke-width", 2);
      tesMarker.append("text").text("TES").attr("x", -bmap.xScale.bandwidth() / 2).attr("y", -2).attr("text-anchor", "center").style("font-size", "12px");
    }
  } else {
    if (bmap.xScale(bmap.tss)) {
      select("#tssMarker").attr("transform", () => {
        const X = bmap.xScale(bmap.tss) + bmap.xScale.bandwidth();
        return `translate(${X}, -10)`;
      }).attr("visibility", "visible");
    } else {
      select("#tssMarker").attr("visibility", "hidden");
    }
    if (bmap.xScale(bmap.tes)) {
      select("#tesMarker").attr("transform", () => {
        const X = bmap.xScale(bmap.tes) + bmap.xScale.bandwidth();
        return `translate(${X}, -10)`;
      }).attr("visibility", "visible");
    } else {
      select("#tesMarker").attr("visibility", "hidden");
    }
  }
}

/*********************/
const GlobalWidth$1 = window.innerWidth;
const DefaultConfig = {
  id: "locus-browser",
  ldId: "ld-browser",
  width: GlobalWidth$1,
  height: null,
  // should be dynamically calculated
  genomicWindow: 1e6,
  data: data,
  urls: dataUrls,
  panels: {
    geneMap: {
      id: "gene-map",
      data: null,
      useLog: true,
      logBase: null,
      margin: {
        top: 0,
        // provide enough space for the color legend
        right: 100,
        // provide enough space for the row labels
        bottom: 0,
        // provide enough space for the column labels
        left: 80
      },
      width: GlobalWidth$1,
      height: 100,
      // outer height: this includes top and bottom margins + inner height
      colorScheme: "YlGnBu",
      cornerRadius: 2,
      columnLabel: {
        angle: 90,
        adjust: 10
      },
      rowLabel: {
        width: 100
      }
    },
    tssTrack: {
      id: "tss-track",
      label: "TSS location",
      data: null,
      yPos: null,
      // where the panel should be placed to be calculated based on the panel layout
      margin: {
        top: 50,
        right: 50,
        bottom: 0,
        left: 80
      },
      width: GlobalWidth$1,
      height: 70,
      // outer height=inner height + top margin + bottom margin
      color: {
        background: "#ffffff",
        feature: "#ababab"
      }
    },
    geneModelTrack: {
      id: "gene-model-track",
      label: "Gene model",
      yPos: null,
      margin: {
        top: 0,
        right: 50,
        bottom: 10,
        left: 80
      },
      width: GlobalWidth$1,
      height: 30,
      color: {
        background: "#ffffff",
        feature: "#910807"
      }
    },
    eqtlTrack: {
      id: "eqtl-track",
      label: "eQTL summary",
      data: null,
      yPos: null,
      margin: {
        top: 0,
        right: 50,
        bottom: 0,
        left: 80
      },
      width: GlobalWidth$1,
      height: 20,
      // outer height. outer height=inner height + top margin + bottom margin.
      color: {
        background: "#ffffff",
        feature: "#ababab"
      }
    },
    sqtlTrack: {
      id: "sqtl-track",
      label: "sQTL summary",
      data: null,
      yPos: null,
      margin: {
        top: 0,
        right: 50,
        bottom: 0,
        left: 80
      },
      width: GlobalWidth$1,
      height: 20,
      // outer height. outer height=inner height + top margin + bottom margin.
      color: {
        background: "#ffffff",
        feature: "#ababab"
      }
    },
    qtlMap: {
      id: "qtl-map",
      // the bubble heat map of QTLs
      width: GlobalWidth$1,
      data: null,
      yPos: null,
      margin: {
        top: 100,
        // provide space for the genome position scale
        right: 100,
        bottom: 120,
        // provide space for the column labels
        left: 200
      },
      height: 500,
      colorScheme: "RdBu",
      colorScaleDomain: [-1, 1],
      useLog: false,
      logBase: null,
      label: {
        column: {
          show: true,
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
      }
    }
  },
  ld: {
    // LD configuration is separate from the panels because it's in its own DIV and is rendered using canvas.
    id: "ld-browser",
    data: [],
    cutoff: 0.1,
    width: GlobalWidth$1,
    margin: {
      top: 10,
      right: 100,
      bottom: 0,
      left: 200
    },
    colorScheme: "Greys"
  }
};
var LocusBrowser = {
  init: init$1,
  createSvg: _createSvg$2,
  data: data,
  dataUrls: dataUrls,
  vizComponents: vizComponents
};

/* eslint-disable no-prototype-builtins */
/**
 * Copyright © 2015 - 2019 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
const GlobalWidth = window.innerWidth;
let visConfig = {
  "eGeneBrowserTrack": {
    trans: {
      x: 0,
      y: -20
    },
    id: "egene-browser-track"
  },
  "variantBrowserTrack": {
    trans: {
      x: 0,
      y: 20
    },
    // translation
    id: "variant-browser-track"
  },
  "ldHeatmap": {
    trans: {
      x: 0,
      y: 80
    },
    id: "ld-heatmap"
  },
  "gwasHeatmap": {
    trans: {
      x: 0,
      y: 100
    },
    id: "gwas-heatmap"
  },
  "funcAnnoHeatmap": {
    trans: {
      x: 0,
      y: 110
    },
    id: "func-anno-heatmap"
  },
  "qtlBubbleMap": {
    trans: {
      x: 0,
      y: 145
    },
    rowH: undefined,
    genes: [],
    filters: {
      tissue: undefined,
      // type: new Set(["eQTL", "sQTL"])
      type: new Set(["eQTL"])
    },
    opacity: 1,
    showFineMap: false
  },
  "tissueMap": {}
};
function setShowFineMapConfig(show) {
  visConfig.qtlBubbleMap.showFineMap = show;
}
function setDimBubbleConfig(value) {
  visConfig.qtlBubbleMap.opacity = value;
}

/**
 * Render LocusBrowserVC
 * @param {String} domId the parent DOM ID for the plot 
 * @param {Variant} variant the query variant 
 * @param {Object[]} variants of variant objects 
 * @param {Object[]} ldBlock of variant objects in the query variant's ldBlock
 * @param {Gene[]} eGenes (and sGenes) of the query variant
 * @param {List[]} args plot data: args[0]: functional annotation, args[1]: GWAS categories, args[2]: eQTLs
 * @param {Object} url API endpoints
 */
function render$1(domId, variant, variants, ldBlock, eGenes, args, url) {
  // preparation steps
  $$1(`#${domId}`).empty();
  _resetQTLConfig();
  const funcAnno = args[0]; // functional annotation data
  const gwasCat = args[1]; // GWAS categories
  visConfig.tissueMap = parseTissueInfo(args[2]);
  /***** data transformation */
  const vlist = _parseVariants(variant, variants, ldBlock);
  const closestEGene = getClosest(eGenes, variant.pos);

  /***** viz rendering */
  // create the parent SVG D3 object
  const svg = _createSvg$1(domId, GlobalWidth, 1500, {
    left: 180,
    top: 80
  });

  // mini browser
  const mgb = _renderMiniGenomeBrowser(svg, vlist, variant.pos, visConfig.variantBrowserTrack.trans, visConfig.variantBrowserTrack.id); // this renders the variants on a genome browser

  // eGenes
  const adjustY = () => {
    // adjust and update all bubble map plots' Y position
    let Y = visConfig.qtlBubbleMap.trans.y;
    visConfig.qtlBubbleMap.genes.forEach((g, i) => {
      const plotId = g.id + "-qtl";
      if (i > 0) {
        let previous = visConfig.qtlBubbleMap.genes[i - 1];
        Y += previous.bubbleMapH + 30;
      }
      select(`#${plotId}`).attr("transform", `translate(${visConfig.qtlBubbleMap.trans.x}, ${Y})`);
    });
  };
  const updateBubbleMapConfig = (d, h) => {
    // d is a Gene object
    d.bubbleMapH = h; // store the bubble map height of the gene
    visConfig.qtlBubbleMap.genes.push(d);
    // adjust root svg height to accommodate new data
    const root = select(`#${domId}-svg`);
    const oldH = parseInt(root.attr("height"));
    root.attr("height", d.bubbleMapH + oldH);
    adjustY();
  };
  const eGeneBrowserTrackClickEvent = function (d) {
    // d is a Gene object
    const gId = d.id + "-qtl";
    const found = visConfig.qtlBubbleMap.genes.map((g, i) => {
      g.index = i;
      return g;
    }).filter(g => {
      return g.gencodeId == d.gencodeId;
    });

    // click event is dependent on whether the gene QTL map is in view
    if (found.length > 0) {
      // if so, remove the gene
      visConfig.qtlBubbleMap.genes.splice(found[0].index, 1);
      select(`#${gId}`).remove();
      // change the gene label styling on the mini genome browser
      select(this).select("text").attr("font-size", 8); // TODO: use class to toggle the styling
      select(this).select("text").attr("fill", "DarkSlateGray");

      // adjust the SVG height
      const root = select(`#${domId}-svg`); // Note: the variable svg is a <g> in the root 
      const oldH = parseInt(root.attr("height"));
      root.attr("height", oldH - d.bubbleMapH);
      adjustY();
    } else {
      // if not, show the gene
      // passing in updateBubbleMapConfig as a callback as a way to handle ajax call
      let callback = updateBubbleMapConfig;
      _renderQTLBubbleMap(url, domId, svg, vlist, variant, d, callback, visConfig.qtlBubbleMap.trans, gId, visConfig.qtlBubbleMap.rowH, false, visConfig.qtlBubbleMap.opacity, visConfig.qtlBubbleMap.showFineMap);
      select(this).select("text").attr("font-size", 12);
      select(this).select("text").attr("fill", "#178A7F");
    }
  };
  _renderEGenesBrowserTrack(svg, variant.pos, mgb, eGenes, closestEGene.gencodeId, eGeneBrowserTrackClickEvent, visConfig.eGeneBrowserTrack.trans, visConfig.eGeneBrowserTrack.id);

  // LD 1D heatmap
  const ldhp = _renderLDHeatMap(svg, vlist, variant.varId, visConfig.ldHeatmap.trans, visConfig.ldHeatmap.id);
  _customizeLD(svg, vlist, variant.varId, mgb, ldhp);

  // GWAS catalog 1D heatmap
  _renderGWASHeatMap(svg, vlist, variant, gwasCat, visConfig.gwasHeatmap.trans, visConfig.gwasHeatmap.id);

  // Functional annotation 1D heatmap
  _renderFuncAnnoHeatMap(svg, vlist, variant.varId, funcAnno, visConfig.funcAnnoHeatmap.trans, visConfig.funcAnnoHeatmap.id);

  // QTL
  visConfig.qtlBubbleMap.rowH = Math.ceil(ldhp.xScale.bandwidth()) < 10 ? 10 : Math.ceil(ldhp.xScale.bandwidth()); // set the row height the same has the column width, so that the bubbles are circles
  select(`#${closestEGene.id}`).dispatch("click");

  // data filtering events
  _defineTissueFiltering();
}
function _resetQTLConfig() {
  visConfig.qtlBubbleMap.rowH = undefined;
  visConfig.qtlBubbleMap.genes = [];
}
function _defineTissueFiltering() {
  // modal related UI events
  const dataTypeFilter = () => {
    let dataTypeInputs = document.getElementsByName("dataType");
    let dataTypes = [];
    dataTypeInputs.forEach(d => {
      if (d.checked) dataTypes.push(d.value);
    });
    visConfig.qtlBubbleMap.filters.type = new Set(dataTypes);
  };
  const tissueSiteFilter = () => {
    let tissueSiteInputs = document.getElementsByName("tissueSite");
    let sites = [];
    tissueSiteInputs.forEach(d => {
      if (d.checked) sites.push(d.value);
    });
    visConfig.qtlBubbleMap.filters.tissue = new Set(sites);
  };
  const filter = () => {
    const genes = visConfig.qtlBubbleMap.genes.map(g => g);
    dataTypeFilter();
    tissueSiteFilter();
    // delete all QTL maps in view
    genes.forEach(g => {
      select(`#${g.id}`).dispatch("click"); // delete
    });

    // re-render all QTL maps in view
    genes.forEach(g => {
      select(`#${g.id}`).dispatch("click"); // re-render
    });
  };
  select("#modal-close-btn").on("click", filter);
  select("#modal-filter-btn").on("click", filter);
}

/**
 * Parse the query variant's ID to generate a LD lookup table
 * @param {Object} qVariant 
 * @param {Object[]} ld a list of variants in the qVariant's LD with attributes: snpId1, snpId2, rSquared
 * @returns {Object} LD lookup table indexed by variant ID
 */
function _parseLD(qVariant, ld) {
  let newList = ld.map(d => {
    return {
      varId: d[0],
      rSquared: parseFloat(d[1])
    };
  });
  // build the look up table
  let ldBlockLookup = {};
  newList.forEach(d => {
    ldBlockLookup[d.varId] = d;
  });
  return ldBlockLookup;
}

/**
 * Parse the variants and returns a new list of Variant objects
 * @param {Variant} qVariant the query variant with attributes: varId, chromosome, pos
 * @param {Object[]} vars a list of variants to render
 * @param {Object[]} ldBlock a list of LD variants in the query variant's LD 
 * @returns {Variant[]} a list of Variant objects
 */
function _parseVariants(qVariant, vars, ldBlock) {
  let ldLookup = _parseLD(qVariant, ldBlock);
  let newList = vars.map(d => {
    let varId = d.varId || d.variantId;
    let pos = d.pos || d.varId.split("_")[1];
    let chromosome = d.chromosome || d.varId.split("_")[0];
    let v = new Variant(varId, chromosome, pos);

    // assign variant plot value to the LD r-squared
    let value = v.varId == qVariant.varId ? 1 : ldLookup.hasOwnProperty(v.varId) ? ldLookup[v.varId].rSquared : 0;
    v.setValue(value);

    // x and y attributes for visualization--the LD 1D heat map
    v.setCoord({
      x: varId,
      y: "LD"
    });
    return v;
  }).sort((a, b) => {
    return a.pos - b.pos;
  });
  return newList;
}

/**
 * Customize the LD 1D heatmap
 *  - Add connecting lines from the mini genome browser to the LD 1D heatmap
 *  - Highlight the query variant in red
 * @param {D3 svg object} svg the parent D3 object for this plot
 * @param {Variant[]} vlist of variant objects 
 * @param {String} varId the query variant ID
 * @param {MiniGenomeBrowser} mgb 
 * @param {Heatmap} hp the LD 1D heatmap object
 */
function _customizeLD(svg, vlist, varId, mgb, hp) {
  const g = svg.append("g").attr("id", "ld-line").attr("transform", "translate(0, 80)");
  g.selectAll(".connect").data(vlist).enter().append("line").attr("class", "connect").attr("x1", d => mgb.scale(d.pos)) // use the MiniGenomeBrowser object's position scale
  .attr("x2", d => hp.xScale(d.varId)).attr("y2", 0).attr("y1", -25).style("stroke", d => {
    return d.varId == varId ? "red" : d.value == 0 ? "#cccccc" : hp.colorScale(d.value);
  }).style("stroke-width", d => {
    return d.varId == varId ? 1 : 0.3;
  });
  svg.selectAll(".minibrowser-feature").style("fill", d => d.varId == varId ? "red" : d.value == 0 ? "#cccccc" : hp.colorScale(d.value));
}

/**
 * Render a mini genome browser
 * @param {D3 selection} svg D3 selection 
 * @param {Variant[]} vlist a list of variants
 * @param {Number} pos the query variant's position
 * @param {Object{x:Number,y:Number}?} trans translate the viz to {x:xpos, y:ypos}
 * @param {String?} id the <g> ID for the mini genome browser
 * @returns MiniGenomeBrowser
 * @private
 */
function _renderMiniGenomeBrowser(svg, vlist, pos, trans = {
  x: 0,
  y: 20
}, id = "variant-browser-track") {
  const window = Math.ceil(max$1(vlist.map(d => {
    return Math.abs(d.pos - pos);
  })) / 1000) * 1000; // adjust the window to make it symmetrical on both sides (i.e. centering at the query position)
  let g = svg.append("g").attr("id", id).attr("transform", `translate(${trans.x}, ${trans.y})`);
  let miniGenomeBrowser = new MiniGenomeBrowser(vlist, pos, window);
  miniGenomeBrowser.render(g, GlobalWidth * 0.85, 50, false, "Variants", "#ffffff", "steelblue");
  MiniGenomeBrowser.renderAxis(g, miniGenomeBrowser.scale, 20, false, null, {
    w: 100,
    h: 20
  }, pos, "top");
  g.select("#miniBrowserAxis").selectAll("text").text(d => {
    return ((parseInt(d) - pos) / 1000).toString() + "k";
  });
  return miniGenomeBrowser;
}

/**
 * Render the query variant's LD block in a 1D heat map
 * @param {D3 selection} svg D3 selection
 * @param {Variant[]} vlist a list of variant objects
 * @param {String} variant query variant ID 
 * @param {Object{x:Number, y:Number}?} trans
 * @param {String} id
 * @returns Heatmap
 */
function _renderLDHeatMap(svg, vlist, varId, trans, id) {
  let heatMap = new Heatmap(vlist, false, 1, "Blues");
  let g = svg.append("g").attr("id", id).attr("transform", `translate(${trans.x}, ${trans.y})`);
  heatMap.draw(g, {
    w: GlobalWidth * 0.85,
    h: 10
  }, 90, true, 0, 0, "left");

  // add click event
  g.selectAll(".exp-map-cell").on("mouseover", function (d) {
    select(this).style("stroke", "cyan").style("stroke-width", 1).style("cursor", "pointer");
    const tooltipData = ["<span class=\"tooltip-head\">LD</span>", `<span class="tooltip-key">Variant</span>: <span class="tooltip-value">${d.x}</span>`, `<span class="tooltip-key">R-squared</span>: <span class="tooltip-value">${d.displayValue}</span>`, "<span>Click the cell to recenter the visualization</span>"];
    heatMap.tooltip.show(tooltipData.join("<br/>"));
  }).on("mouseout", function () {
    select(this).style("stroke", "none").style("cursor", "auto");
    heatMap.tooltip.hide();
  }).on("click", d => {
    LocusBrowserVC.init(d.x);
  });
  // highlight the query variant

  g.selectAll(".exp-map-cell").filter(d => d.x == varId).style("stroke", "red").style("stroke-width", 1);
  g.selectAll(".exp-map-xlabel").remove();
  return heatMap;
}

/**
 * Render the 1D GWAS catelog heat map
 * @param {D3 selection} svg 
 * @param {Variant[]} vlist 
 * @param {Variant} variant 
 * @param {Object[]} data: GWAS catelog data
 * @param {Object{x:Number, y:Number}?} trans
 * @param {String} id
 */
function _renderGWASHeatMap(svg, vlist, variant, data, trans = {
  x: 0,
  y: 100
}, id = "gwas-heatmap") {
  let posSet = new Set(vlist.map(d => d.pos));
  let gwasCatDict = {};

  // Filter the GWAS catalog based on vlist
  data.filter(d => {
    return d.chromosome == variant.chromosome && posSet.has(parseInt(d.start));
  }).forEach(d => {
    if (!gwasCatDict.hasOwnProperty(d.start)) gwasCatDict[d.start] = new Set();
    gwasCatDict[d.start].add(d["phenotype"]);
  });
  const gwasList = vlist.map(d => {
    return {
      x: d.varId,
      y: "GWAS catalog",
      value: 0,
      displayValue: !gwasCatDict.hasOwnProperty(d.pos) ? "" : [...gwasCatDict[d.pos]].join(","),
      color: !gwasCatDict.hasOwnProperty(d.pos) ? "white" : "steelblue",
      stroke: "lightgrey"
    };
  });

  // TODO: code refactoring
  const gwasMap = new Heatmap(gwasList, false);
  let g = svg.append("g").attr("id", id).attr("transform", `translate(${trans.x}, ${trans.y})`);
  gwasMap.draw(g, {
    w: GlobalWidth * 0.85,
    h: 10
  }, 90, false, 0, 0, "left");

  // add click event
  g.selectAll(".exp-map-cell").on("mouseover", function (d) {
    select(this).style("stroke", "cyan");
    const displayValue = d.displayValue == "" ? "NA" : d.displayValue;
    const tooltipData = ["<span class=\"tooltip-head\">GWAS Catalog</span>", `<span class="tooltip-key">Variant</span>: <span class="tooltip-value">${d.x}</span>`, `<span class="tooltip-key">Catalogs</span>: <span class="tooltip-value">${displayValue}</span>`];
    gwasMap.tooltip.show(tooltipData.join("<br/>"));
  }).on("mouseout", function () {
    select(this).style("stroke", "lightgrey");
    gwasMap.tooltip.hide();
  });
  g.selectAll(".exp-map-cell").style("opacity", 0.5).filter(d => d.x == variant.varId).style("stroke", "red").style("stroke-width", 1);
  g.selectAll(".exp-map-xlabel").remove();
  return gwasMap;
}

/**
 * Render the functional annotation 1D heat map
 * @param {D3 selection} svg 
 * @param {Variant[]} vlist 
 * @param {String} varId 
 * @param {Object[]} data Functional Annotation
 * @param {Object{x:Number, y:Number}?} trans
 * @param {String} id
 * @returns Heatmap: functional annotation
 */
function _renderFuncAnnoHeatMap(svg, vlist, varId, data, trans = {
  x: 0,
  y: 110
}, id = "fa-heatmap") {
  const funcAnnoDict = getVariantFunctionalAnnotations(data);
  const funcList = vlist.map(d => {
    const cats = funcAnnoDict[d.varId] == undefined ? [] : funcAnnoDict[d.varId];
    return {
      x: d.x,
      y: "Func Annot",
      value: 0,
      displayValue: cats.join(","),
      color: cats.length == 0 ? "white" : cats.length == 1 ? annoCatDict[cats[0]] : "black",
      stroke: "lightgrey"
    };
  });
  const funcMap = new Heatmap(funcList, false);
  let g = svg.append("g").attr("id", id).attr("transform", `translate(${trans.x}, ${trans.y})`);
  funcMap.draw(g, {
    w: GlobalWidth * 0.85,
    h: 10
  }, 90, false, 0, 0, "left");

  // add click event
  g.selectAll(".exp-map-cell").on("mouseover", function (d) {
    select(this).style("stroke", "cyan");
    const displayValue = d.displayValue == "" ? "NA" : d.displayValue;
    const tooltipData = ["<span class=\"tooltip-head\">Functional Annotations</span>", `<span class="tooltip-key">Variant</span>: <span class="tooltip-value">${d.x}</span>`, `<span class="tooltip-key">Functions</span>: <span class="tooltip-value">${displayValue}</span>`];
    funcMap.tooltip.show(tooltipData.join("<br/>"));
  }).on("mouseout", function () {
    select(this).style("stroke", "lightgrey");
    funcMap.tooltip.hide();
  });
  g.selectAll(".exp-map-cell").style("opacity", 0.5).filter(d => d.x == varId).style("stroke", "red").style("stroke-width", 1);
  g.selectAll(".exp-map-xlabel").remove();
  return funcMap;
}

/**
 * 
 * @param {D3 selection} svg 
 * @param {Variant[]} vlist 
 * @param {Variant} variant
 * @param {Gene} gene
 * @param {Function} callback: function to run after ajax
 * @param {Object{x:Number, y:Number}?} trans
 * @param {String} id
 * @param {Number} cellH cell height
 * @param {Boolean} showXLab
 * @param {Number} opacity
 * @param {Boolean} showFineMap
 */
function _renderQTLBubbleMap(url, domId, svg, vlist, variant, gene, callback, trans = {
  x: 0,
  y: 145
}, id = "eqtl-bubble-map", cellH = 12, showXLab = false, opacity = 1, showFineMap = false) {
  let g = svg.append("g").attr("id", id).attr("class", "qtl-map").attr("transform", `translate(${trans.x}, ${trans.y})`);
  const renderMap = (geneLabel, dataset, dapg) => {
    const qtlMap = new DataMap(dataset, "RdBu");
    qtlMap.addTooltip(domId, `${domId}-tooltip`);
    const calculateH = () => {
      const tSet = new Set(dataset.map(d => d.y));
      let H = cellH * tSet.size;
      return H;
    };
    const dim = {
      w: GlobalWidth * 0.85,
      h: calculateH(),
      top: 0,
      left: 0
    };
    qtlMap.setScales(dim, vlist.map(d => d.varId), undefined);
    qtlMap.drawSvg(g, dim, "bubbleNoClip", false, customizeQTLTooltip, true, [0, 15]);

    // customization
    g.selectAll(".map-bubble").attr("opacity", opacity);

    // fine-mapping markers
    let fmap = g.selectAll(".fine-map").data(dapg).enter().filter(d => qtlMap.yScale("eQTL-" + d.y) !== undefined && qtlMap.xScale(d.varId) !== undefined).append("g").classed("fine-map", true).style("display", showFineMap ? "block" : "none");
    const fmapSetColors = ["#1e1d1f", "#ebbf23", "#3698d1", "#a1b3cd", "#c8cda1", "#cda1bb", "#b7a1cd", "#5eccb0", "#d1bf36"]; //Note: limited number of colors!

    const rx = qtlMap.xScale.bandwidth() / 2;
    const ry = qtlMap.yScale.bandwidth() / 2;
    const r = rx > ry ? ry : rx;
    fmap.append("circle").attr("cx", d => qtlMap.xScale(d.varId) + rx || 0).attr("cy", d => qtlMap.yScale("eQTL-" + d.y) + ry || 0).attr("r", r).attr("stroke", d => fmapSetColors[parseInt(d.setId) - 1]).attr("stroke-width", d => r * d.value < 0.5 ? 0.5 : r * d.value).attr("fill", "none");
    g.append("text").text(geneLabel + " QTLs").attr("x", 0).attr("y", -2).style("text-anchor", "end").style("font-size", 16);
    g.selectAll(".map-grid-vline").filter(d => d == variant.varId).style("stroke-width", qtlMap.xScale.bandwidth()).style("stroke", "#f5f5f5");
    if (showXLab) {
      g.selectAll(".bar-map-x-label").filter(d => d == variant.varId).style("font-weight", 800).style("z-index", 1000).style("opacity", 0.5);
    } else {
      g.selectAll(".bar-map-x-label").remove();
    }
    qtlMap.svg = g;
    customizeMapRowLabels(qtlMap, visConfig.tissueMap);
    return dim.h;
  };

  // render QTL bubble map of the closest gene
  const eqtlUrl = url.geneEqtl(gene.gencodeId);
  const sqtlUrl = url.geneSqtl(gene.gencodeId);
  const fineMapUrl = url.fineMap(gene.gencodeId);
  const promises = [RetrieveAllPaginatedData(eqtlUrl, 1000), RetrieveAllPaginatedData(sqtlUrl, 1000), RetrieveAllPaginatedData(fineMapUrl, 1000)];
  Promise.all(promises).then(args => {
    let qtls = [];
    if (visConfig.qtlBubbleMap.filters.type.has("eQTL")) {
      const eqtls = getQtlMapData(args[0]);
      qtls = qtls.concat(eqtls);
    }
    if (visConfig.qtlBubbleMap.filters.type.has("sQTL")) {
      const sqtls = getQtlMapData(args[1], "singleTissueSqtl", "sQTL");
      qtls = qtls.concat(sqtls);
    }

    // tissue filtering
    if (visConfig.qtlBubbleMap.filters.tissue !== undefined) {
      qtls = qtls.filter(q => {
        let check = q.tissueSiteDetailAbbr;
        return visConfig.qtlBubbleMap.filters.tissue.has(check);
      });
    }

    // fine-mapping data
    const parseFineMap = data => {
      const tissueTable$1 = tissueTable();
      return data.map(d => {
        return {
          tissueId: d.tissueSiteDetailId,
          varId: d.variantId,
          prop: d.pip,
          setId: d.setId,
          setSize: d.setSize,
          x: d.variantId,
          y: tissueTable$1[d.tissueSiteDetailId].tissueSiteDetailAbbr,
          value: d.pip
        };
      });
    };
    const fMap = parseFineMap(args[2]);
    const h = renderMap(gene.geneSymbol, qtls, fMap);
    callback(gene, h);
  });
}

/**
 * Render eGenes and sGenes on the mini genome browser
 * @param {D3 selection} svg 
 * @param {Number} pos of the query variant 
 * @param {MiniGenomeBrowser} miniGenomeBrowserTrack of the LD
 * @param {Gene[]} eGenes 
 * @param {String} gencodeId to be highlighted
 * @param {Function} click 
 * @param {Object{x:Number, y:Number}?} trans
 * @param {String?} id
 */
function _renderEGenesBrowserTrack(svg, pos, miniGenomeBrowser, eGenes, gencodeId, click, trans = {
  x: 0,
  y: -20
}, id = "egene-browser-track") {
  // render the egenes as a mini browser track
  const window = miniGenomeBrowser.window;
  let egeneG = svg.append("g").attr("id", id).attr("transform", `translate(${trans.x}, ${trans.y})`);
  let miniEgeneTrack = new MiniGenomeBrowser(eGenes, pos, window); // this is how a new track is created
  miniEgeneTrack.setScale(GlobalWidth * 0.85);

  // customized visualization
  const geneLabelG = egeneG.selectAll(".egene-post").data(eGenes).enter().filter(d => miniEgeneTrack.scale(d.pos) > 0) // render only if genes are within the view window
  .append("g").attr("id", d => d.id);
  geneLabelG.append("rect").attr("x", d => miniEgeneTrack.scale(d.pos)).attr("y", (d, i) => d.gencodeId == gencodeId ? 0 : i % 2 == 0 ? 25 : 15).attr("height", (d, i) => d.gencodeId == gencodeId ? 60 : i % 2 == 0 ? 35 : 45).attr("width", 0.5).style("stroke", "DarkSlateGray").style("stroke-width", 0.3);
  geneLabelG.append("text").attr("class", "egene-label").attr("x", 0).attr("y", d => d.gencodeId == gencodeId ? -25 : 0).attr("transform", (d, i) => `translate(${miniEgeneTrack.scale(d.pos)}, ${i % 2 == 0 ? 20 : 10})`).text(d => d.geneSymbol).attr("font-size", d => d.gencodeId == gencodeId ? 12 : 8).attr("fill", d => d.gencodeId == gencodeId ? "#178A7F" : "DarkSlateGray");
  geneLabelG.style("cursor", "pointer").on("click", click);
}

/**
 * Create an SVG D3 object
 * @param id {String} the parent dom ID
 * @param width {Number}: the outer width
 * @param height {Number}: the outer height
 * @param margin {Object} the margin object with attr: left, top
 * @param svgId {String=} [svgId=undefined]: the SVG DOM ID
 * @returns a new D3 selection object
 * @private
 */
function _createSvg$1(id, width, height, margin, svgId = undefined) {
  checkDomId$2(id);
  if (svgId === undefined) svgId = `${id}-svg`;
  if (margin === undefined) margin = {
    top: 0,
    left: 0
  };
  let dom = select("#" + id).append("svg").attr("width", width).attr("height", height).attr("id", svgId).append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
  return dom;
}

/**
 * ToDo
 * bug fixing: eqtl file doesn't include all the eqtl data for all variants rendered in the browser
 * web services: eventually when the web services are available, move the data source code to LocusBrowserDataUtils.js
 */

// plot default settings, which can be overriden by users on the fly using demo()
let ViewWindow = 1e4;
let MODE = "LD";
let LDThreshold = 0.2;

// data files and URLs

let URL = {
  variantByLocation: (chr, start, end) => {
    return `${serviceUrls.variantByLocation}&chromosome=${chr}&start=${start}&end=${end}`;
  },
  ld: id => {
    return serviceUrls.ldByVariant + id;
  },
  // for a given variant, fetch its LD data
  variantEqtl: id => {
    let base_url = serviceUrls.variantEqtls;
    let all_tissues = "Adipose_Subcutaneous,Adipose_Visceral_Omentum,Adrenal_Gland,Artery_Aorta," + "Artery_Coronary,Artery_Tibial,Bladder,Brain_Amygdala,Brain_Anterior_cingulate_cortex_BA24," + "Brain_Caudate_basal_ganglia,Brain_Cerebellar_Hemisphere,Brain_Cerebellum,Brain_Cortex," + "Brain_Frontal_Cortex_BA9,Brain_Hippocampus,Brain_Hypothalamus,Brain_Nucleus_accumbens_basal_ganglia," + "Brain_Putamen_basal_ganglia,Brain_Spinal_cord_cervical_c-1,Brain_Substantia_nigra,Breast_Mammary_Tissue," + "Cells_EBV-transformed_lymphocytes,Cells_Cultured_fibroblasts,Cervix_Ectocervix,Cervix_Endocervix," + "Colon_Sigmoid,Colon_Transverse,Esophagus_Gastroesophageal_Junction,Esophagus_Mucosa,Esophagus_Muscularis," + "Fallopian_Tube,Heart_Atrial_Appendage,Heart_Left_Ventricle,Kidney_Cortex,Kidney_Medulla,Liver,Lung," + "Minor_Salivary_Gland,Muscle_Skeletal,Nerve_Tibial,Ovary,Pancreas,Pituitary,Prostate," + "Skin_Not_Sun_Exposed_Suprapubic,Skin_Sun_Exposed_Lower_leg,Small_Intestine_Terminal_Ileum," + "Spleen,Stomach,Testis,Thyroid,Uterus,Vagina,Whole_Blood";
    all_tissues = all_tissues.split(",");
    let url = base_url + all_tissues.join("&tissueSiteDetailId=");
    url = url + "&variantId=";
    return url + id;
  },
  // for a given variant, fetch its eQTLs
  variantSqtl: id => {
    return serviceUrls.variantSqtls + id;
  },
  // for a given variant, fetch its sQTLs
  funcAnnoGtex: (chr, hExtent) => {
    const funcAnnoUrlRoot = serviceUrls.funcAnno;
    return funcAnnoUrlRoot + `&chromosome=${chr}&start=${hExtent[0]}&end=${hExtent[1]}`;
  },
  // for a given genomic window, fetch functional annotations of variants
  gwasCat: (chr, hExtent) => {
    const gwasCatUrlRoot = serviceUrls.gwasCats;
    return gwasCatUrlRoot + `?chromosome=${chr}&start=${hExtent[0]}&end=${hExtent[1]}`;
  },
  tissueInfo: serviceUrls.tissueInfo,
  geneEqtl: id => {
    return serviceUrls.eqtls + id;
  },
  geneSqtl: id => {
    return serviceUrls.sqtls + id;
  },
  fineMap: id => {
    return serviceUrls.fineMapping + id;
  }
};

/**
 * Demo LocusBrowserVC
 * @param {String?} queryId 
 * @param {String?} domId 
 * @param {enum?} mode: For setting the default genomic window: LD: use the query variant's LD, WIN: use a fix window size centered at the query variant
 */
function init(queryId = "chr11_65592772_G_A_b38", domId = "locus-browser", mode = MODE, url = undefined) {
  // show the spinner and erase previous visualization
  select("#locus-browser-spinner").style("display", "block");
  select(`#${domId}`).select("svg").remove();
  select("#q-variant").text("");
  select("#heatmapTooltip").style("opacity", 0);
  if (url !== undefined) {
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
  const variant = new Variant(queryId); // parse and build a variant object for the query variant  
  const maxWindow = 1e6;
  const promises = [
  // tsv(ldFile(variant.varId)),
  RetrieveAllPaginatedData(URL.ld(variant.varId), 1000), RetrieveAllPaginatedData(URL.variantByLocation(variant.chromosome, variant.pos - maxWindow < 0 ? 0 : variant.pos - maxWindow, variant.pos + maxWindow), 10000)];
  Promise.all(promises).then(args => {
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
function switchMode(domId, mode, variant, variants, ld) {
  if (ld.length == 0) mode = "WIN"; // when a query variant has no LD, then switch to mode WIN
  let hExtent = [];
  let hood = []; // a list of variants in the "variant hood", which will be displayed in the browser
  let modeValue = mode == "LD" ? LDThreshold : ViewWindow;
  switch (mode) {
    case "LD":
      {
        let ldSet = new Set([variant.pos]);
        ld.filter(d => {
          return d[1] >= modeValue;
        }).forEach(d => {
          d[0] = d[0].replace(",", "").replace(variant.varId, "");
          let v = new Variant(d[0]);
          let pos = v.pos;
          ldSet.add(Math.abs(pos)); // how could this value be negative??
        });
        hExtent = extent([...ldSet]);
        hood = variants.filter(v => {
          let pos = parseInt(v.pos);
          return ldSet.has(pos);
        });
        break;
      }
    case "WIN":
      {
        hExtent = [variant.pos - modeValue, variant.pos + modeValue];
        hood = variants.filter(v => {
          let pos = parseInt(v.pos);
          return pos >= hExtent[0] && pos <= hExtent[1];
        });
        break;
      }
    default:
      {
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
function _render(domId, variant, vlist, ldBlock, hExtent) {
  const funcAnnoUrl = URL.funcAnnoGtex(variant.chromosome, hExtent);
  const eqtlUrl = URL.variantEqtl(variant.varId);
  const sqtlUrl = URL.variantSqtl(variant.varId);
  const gwasUrl = URL.gwasCat(variant.chromosome, hExtent);
  const promises = [RetrieveAllPaginatedData(eqtlUrl, 1000), RetrieveAllPaginatedData(sqtlUrl, 1000), RetrieveAllPaginatedData(funcAnnoUrl),
  // tsv(gwasCatFile), 
  RetrieveAllPaginatedData(gwasUrl), RetrieveAllPaginatedData(URL.tissueInfo)];
  Promise.all(promises).then(args => {
    // find all genes associated with the variant
    const geneSet = getSet(args.shift(), "gencodeId"); // egenes of the query variant
    const geneSet2 = getSet(args.shift(), "gencodeId"); // sgenes
    geneSet2.forEach(g => {
      if (!geneSet.has(g)) geneSet.add(g); // combine geneSet and geneSet2
    });
    const gids = [...geneSet].join("&geneId=");
    if ([...geneSet].length != 0) {
      RetrieveAllPaginatedData(`${serviceUrls.geneInfo}${gids}`).then(geneJson => {
        let genes = geneJson.map(g => {
          let gene = new Gene(g.gencodeId, g.chromosome, g.strand, parseInt(g.start), parseInt(g.end), g.geneType, g.geneSymbol);
          return gene;
        });
        render$1(domId, variant, vlist, ldBlock, genes, args, URL);
      });
    }
  });
}
function bindUIEvents(queryId, domId, variant, variants, ld) {
  updateViewerStatus(queryId);
  bindViewModeButtons(domId, variant, variants, ld);
  bindSliderEvents(domId, variant, variants, ld);
  bindFineMappingSwitch();
  bindQTLViewSwitch();
  buildTissueMenu();
}
function updateViewerStatus(queryId) {
  $$1("#q-variant").text(queryId);
}
function buildTissueMenu() {
  // build the tissue menu
  // get the unique list of tissues
  let tissues$1 = tissues.filter(t => t.hasEGenes || t.hasSGenes);
  let formId = "tissue-menu";
  // Note: this tissue menu is fixed number of tissues. It's all GTEx tissues with sGenes/eGenes
  // do not regenerate this tissue menu
  // this way the tissue menu filtering remains even after changing view or variant
  if ($$1(`#${formId} input`).length == 0) renderTissueMenu(tissues$1, formId);
}
function bindViewModeButtons(domId, variant, variants, ld) {
  // can't figure out how to unbind anonymnous function events using vanilla javascript
  $$1("#ld-mode").unbind().on("click", function () {
    let mode = "LD";
    $$1("#ld-mode").addClass("active");
    $$1("#win-mode").removeClass("active");
    $$1("#ld-cutoff-ui").show();
    $$1("#win-size-ui").hide();
    switchMode(domId, mode, variant, variants, ld);
  });
  $$1("#win-mode").unbind().on("click", function () {
    let mode = "WIN";
    $$1("#win-mode").addClass("active");
    $$1("#ld-mode").removeClass("active");
    $$1("#win-size-ui").show();
    $$1("#ld-cutoff-ui").hide();
    switchMode(domId, mode, variant, variants, ld);
  });
}
function bindFineMappingSwitch() {
  $$1("#fine-mapping-off").unbind().on("click", function () {
    $$1("#fine-mapping-off").addClass("active");
    $$1("#fine-mapping-on").removeClass("active");
    $$1(".fine-map").hide();
    setShowFineMapConfig(false);
  });
  $$1("#fine-mapping-on").unbind().on("click", function () {
    $$1("#fine-mapping-on").addClass("active");
    $$1("#fine-mapping-off").removeClass("active");
    $$1(".fine-map").show();
    setShowFineMapConfig(true);
  });
}
function bindQTLViewSwitch() {
  $$1("#qtl-view-off").unbind().on("click", function () {
    let opacity = 0.1;
    $$1("#qtl-view-off").addClass("active");
    $$1("#qtl-view-on").removeClass("active");
    selectAll(".map-bubble").style("opacity", opacity);
    setDimBubbleConfig(opacity);
  });
  $$1("#qtl-view-on").unbind().on("click", function () {
    let opacity = 1;
    $$1("#qtl-view-on").addClass("active");
    $$1("#qtl-view-off").removeClass("active");
    selectAll(".map-bubble").style("opacity", opacity);
    setDimBubbleConfig(opacity);
  });
}
function bindSliderEvents(domId, variant, variants, ld) {
  $$1("#ld-slider").unbind().mouseup(function () {
    switchMode(domId, "LD", variant, variants, ld);
  });
  $$1("#ld-slider").on("input", function () {
    const v = $$1(this).val();
    $$1("#ld-cutoff").val(v);
    LDThreshold = parseFloat(v);
  });
  $$1("#ld-cutoff").unbind().keypress(function (event) {
    let keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode == "13") {
      const v = $$1(this).val();
      $$1("#ld-slider").val(v);
      LDThreshold = parseFloat(v);
      switchMode(domId, "LD", variant, variants, ld);
    }
  });
  $$1("#win-slider").unbind().mouseup(function () {
    switchMode(domId, "WIN", variant, variants, ld);
  });
  $$1("#win-slider").on("input", function () {
    const v = $$1(this).val();
    $$1("#win-size").val(v);
    ViewWindow = parseFloat(v) * 1000;
  });
  $$1("#win-size").unbind().keypress(function (event) {
    let keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode == "13") {
      const v = $$1(this).val();
      $$1("#win-slider").val(v);
      ViewWindow = parseFloat(v) * 1000;
      switchMode(domId, "WIN", variant, variants, ld);
    }
  });
}
var LocusBrowserVC$1 = {
  init
};

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */
/*
Input data structure: a list of data object with the following structure:
// todo
*/
const lightgrey = "#e2e2e2";
const mediumgrey = "rgb(200,200,200)";
const ochre = "rgba(148, 119, 91, 0.8)";
class AnyPointMatrix {
  constructor(data, summary, rootId, tooltipId, legendId, type, axis, point, dimension = {
    width: select(`#${rootId}`).node().clientWidth,
    height: select(`#${rootId}`).node().clientHeight
  }, padding = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  }) {
    this._sanityCheck(data); // check data for all necessary attributes 
    this.data = data;
    this.summary = summary; // this should be optional? 
    this.rootId = rootId;
    this.tooltipId = tooltipId;
    this.legendId = legendId;
    this.type = type;
    this.axis = axis;
    this.point = point;
    this.dimension = dimension; // if height is not defined, height will be maxRadius * yDomain.length.
    this.padding = padding;
    this._updateDimensions();
    this._createScales(); // where does height get defined?
    this._createTooltip(this.tooltipId);
    this._createLegend(this.rootId, this.legendId, this.type, this.scale);
  }
  /** 
   * check data for x, y, and point attributes 
   * @param data formatted via config with: x, y, point, and groupInfo_ (parsed data)
   */
  _sanityCheck(data) {
    const attr = ["x", "y", "point"];
    let pt;
    switch (this.type) {
      case "DotPoint":
        pt = ["radius", "color"];
      case "AsterPoint":
        pt = ["innerRadius", "outerRadius", "arcLength", "color"];
    }
    data.forEach(d => {
      attr.forEach(a => {
        if (d[a] === undefined) throw "GroupedMatrix: input data error.";
        if (d[a] == "point") {
          pt.forEach(p => {
            if (a[p] === undefined) throw "GroupedMatrix: input POINT error.";
          });
        }
      });
    });
  }
  /**
   * TODO: calculate height based on number of y-values * maxRadius
   */
  _updateDimensions() {
    this.dimension.innerWidth = this.dimension.width - this.padding.left - this.padding.right;
    this.dimension.innerHeight = this.dimension.height - this.padding.top - this.padding.bottom;
  }
  _createScales() {
    let xDomain = this.data.map(d => d.x).filter((v, i, a) => a.indexOf(v) === i);
    const xGroupDomain = this.data.map(d => d.groupInfo_[`${this.axis.x[0]}`]).filter((v, i, a) => a.indexOf(v) === i);
    xDomain = xDomain.concat(xGroupDomain).sort(ascending$1); // customized for grouped x-axis layout and display
    let yDomain = this.data.map(d => d.y).filter((v, i, a) => a.indexOf(v) === i);
    yDomain = yDomain.sort(function (a, b) {
      return ascending$1(a, b);
    });
    let maxRadius = this.dimension.innerWidth / xDomain.length / 1.85;
    if (maxRadius >= 10) {
      maxRadius = 10;
      this.dimension.innerWidth = maxRadius * 2 * xDomain.length;
    }
    let height = maxRadius * 4 * yDomain.length;
    if (height <= 80) {
      height = 80;
    }
    this.dimension.height = height + this.padding.top + this.padding.bottom;
    this.dimension.innerHeight = height;
    const _createSummaryScale = d => {
      let numCells = [];
      this.summary.forEach(d => {
        numCells.push(d.numCells);
      });
      return {
        radius: sqrt$1().domain(extent(numCells)).range([2, maxRadius]),
        color: ochre
      };
    };
    const _createPointScales = d => {
      const colorInterp = Reds;
      const expressionExtent = [0, 6];
      const percentExtent = [0, 100];
      switch (this.type) {
        case "AsterPoint":
          return {
            outerRadius: sqrt$1().domain(extent(expressionExtent)).range([2, maxRadius]),
            color: sequential().domain(extent(expressionExtent)).interpolator(colorInterp)
          };
        case "DotPoint":
          return {
            // radius: d3.scaleSqrt().domain(d3.extent(this.data.map(d => d.point.radius))).range([2, maxRadius]),
            radius: sqrt$1().domain(percentExtent).range([2, maxRadius]),
            color: sequential().domain(expressionExtent).interpolator(colorInterp)
          };
      }
    };
    this.scale = {
      x: band().domain(xDomain).range([0, this.dimension.innerWidth]),
      y: band().domain(yDomain).rangeRound([this.dimension.innerHeight, 0]).padding([1]),
      point: _createPointScales(),
      summary: _createSummaryScale(),
      maxRadius: maxRadius
    };
  }
  /**
  * Create the tooltip object
  * @param domId {String} the tooltip's dom ID
  * @returns {Tooltip}
  */
  _createTooltip(domId) {
    if ($(`#${domId}`).length == 0) $("<div/>").attr("id", domId).appendTo($("body"));
    this.tooltip = new Tooltip(domId);
    select(`#${domId}`).classed("apm-tooltip", true);
    return this.tooltip;
  }
  _createLegend(rootId, legendId, type, scale) {
    select(`#${rootId}-svg`).append("g").attr("transform", "translate(0, 20)").attr("id", legendId);
    const summaryRadiusLegend = function (id, scale) {
      const width = 150;
      const height = 60;
      const padding = {
        top: 20,
        right: 20,
        bottom: 10,
        left: 20
      };
      const innerWidth = width - padding.left - padding.right;
      const innerHeight = height - padding.top - padding.bottom;
      const dom = select("#" + id).append("g").attr("id", "radius-legend").attr("transform", `translate(${padding.left}, ${padding.top})`);
      var data = [scale.radius.domain()[0], (scale.radius.domain()[1] / 2).toPrecision(1), scale.radius.domain()[1].toPrecision(1)];
      var xScale = band().domain(data).range([0, innerWidth]);
      dom.selectAll("g").data(data).enter().append("g").attr("transform", d => {
        return `translate(${Math.floor(xScale(d))}, ${0})`;
      }).each(function (d) {
        select(this).append("circle").attr("cx", 0).attr("cy", innerHeight / 2).attr("r", scale.radius(d)).attr("fill", scale.color);
        select(this).append("text").attr("x", 0).attr("y", innerHeight).attr("dy", 10).html(d => {
          if (d >= 1000) {
            return format(",.1s")(d);
          } else {
            return d;
          }
        }).attr("text-anchor", "middle").attr("fill", "black").attr("class", "apm-legend-axis-tick");
      });
      dom.append("text").text("Total cells").attr("x", innerWidth / 2).attr("dy", 10).attr("y", innerHeight + padding.top).attr("text-anchor", "middle").attr("class", "apm-legend-axis-label");
      dom.append("text").text("Area").attr("x", innerWidth / 2).attr("y", -6).attr("text-anchor", "middle").attr("class", "apm-legend-title");
    };
    const dotColorLegend = function (id, scale) {
      const width = 200;
      const height = 60;
      const padding = {
        top: 20,
        right: 20,
        bottom: 10,
        left: 20
      };
      const innerWidth = width - padding.left - padding.right;
      const innerHeight = height - padding.top - padding.bottom;
      const dom = select("#" + id).append("g").attr("id", "color-legend").attr("transform", `translate(${padding.left + 350}, ${padding.top})`);
      function range(start, end, step = 1) {
        const len = Math.floor((end - start) / step) + 1;
        return Array(len).fill().map((_, idx) => start + idx * step);
      }
      var data = range(scale.domain()[0], scale.domain()[1], 1);
      var xScale = band().domain(data).range([0, innerWidth]);
      dom.selectAll("g").data(data).enter().append("g").attr("transform", d => {
        return `translate(${Math.floor(xScale(d))}, ${0})`;
      }).each(function (d) {
        select(this).append("rect").attr("x", 0).attr("y", 0).attr("height", innerHeight - 10).attr("width", d => {
          return innerWidth / data.length;
        }).attr("fill", d => {
          if (d == 0) {
            return lightgrey;
          } else {
            return scale(d);
          }
        });
        select(this).append("text").attr("x", innerWidth / data.length / 2).attr("y", innerHeight).attr("dy", 10).html(d).attr("text-anchor", "middle").attr("fill", "black").attr("class", "apm-legend-axis-tick");
      });
      dom.append("text").text("Expression (ln(counts per 10k + 1))").attr("x", innerWidth / 2).attr("dy", 10).attr("y", innerHeight + padding.top).attr("text-anchor", "middle").attr("class", "apm-legend-axis-label");
      dom.append("text").text("Color").attr("x", innerWidth / 2).attr("y", -6).attr("text-anchor", "middle").attr("class", "apm-legend-title");
    };
    const dotRadiusLegend = function (id, scale) {
      const width = 200;
      const height = 60;
      const padding = {
        top: 20,
        right: 20,
        bottom: 10,
        left: 20
      };
      const innerWidth = width - padding.left - padding.right;
      const innerHeight = height - padding.top - padding.bottom;
      const dom = select("#" + id).append("g").attr("id", "radius-legend").attr("transform", `translate(${padding.left + 150}, ${padding.top})`);
      function range(start, end, step = 1) {
        const len = Math.floor((end - start) / step) + 1;
        return Array(len).fill().map((_, idx) => start + idx * step);
      }
      var data = range(scale.domain()[0], scale.domain()[1], 20);
      var xScale = band().domain(data).range([0, innerWidth]);
      dom.selectAll("g").data(data).enter().append("g").attr("transform", d => {
        return `translate(${Math.floor(xScale(d))}, ${0})`;
      }).each(function (d) {
        select(this).append("circle").attr("cx", 0).attr("cy", innerHeight / 2).attr("r", scale(d)).attr("stroke", mediumgrey).attr("fill", "none");
        select(this).append("text").attr("x", 0).attr("y", innerHeight).attr("dy", 10).html(d).attr("text-anchor", "middle").attr("fill", "black").attr("class", "apm-legend-axis-tick");
      });
      dom.append("text").text("Detected in cells (%)").attr("x", innerWidth / 2).attr("dy", 10).attr("y", innerHeight + padding.top).attr("text-anchor", "middle").attr("class", "apm-legend-axis-label");
      dom.append("text").text("Area").attr("x", innerWidth / 2).attr("y", -6).attr("text-anchor", "middle").attr("class", "apm-legend-title");
    };
    const asterColorRadiusLegend = function (id, cScale, rScale) {
      const width = 200;
      const height = 60;
      const padding = {
        top: 20,
        right: 20,
        bottom: 10,
        left: 20
      };
      const innerWidth = width - padding.left - padding.right;
      const innerHeight = height - padding.top - padding.bottom;
      const dom = select("#" + id).append("g").attr("id", "aster-legend").attr("transform", `translate(${padding.left + 150}, ${padding.top})`);
      function range(start, end, step = 1) {
        const len = Math.floor((end - start) / step) + 1;
        return Array(len).fill().map((_, idx) => start + idx * step);
      }
      var data = range(cScale.domain()[0], cScale.domain()[1], 1);
      var xScale = band().domain(data).range([0, innerWidth]);
      dom.selectAll("g").data(data).enter().append("g").attr("transform", d => {
        return `translate(${Math.floor(xScale(d))}, ${0})`;
      }).each(function (d) {
        select(this).append("circle").attr("cx", 0).attr("cy", innerHeight / 2).attr("r", rScale(d)).attr("fill", () => {
          if (d == 0) {
            return lightgrey;
          } else {
            return cScale(d);
          }
        });
        select(this).append("text").attr("x", 0).attr("y", innerHeight).attr("dy", 10).html(d).attr("text-anchor", "middle").attr("class", "apm-legend-axis-tick");
      });
      dom.append("text").text("Expression (ln(counts per 10k + 1))").attr("x", innerWidth / 2).attr("dy", 10).attr("y", innerHeight + padding.top).attr("text-anchor", "middle").attr("class", "apm-legend-axis-label");
      dom.append("text").text("Area & Color").attr("x", innerWidth / 2).attr("y", -6).attr("text-anchor", "middle").attr("class", "apm-legend-title");
    };
    const asterArcLegend = function (id) {
      const height = 60;
      const padding = {
        top: 20,
        right: 20,
        bottom: 10,
        left: 20
      };
      const innerHeight = height - padding.top - padding.bottom;
      const dom = select("#" + id).append("g").attr("id", "aster-arc-legend").attr("transform", `translate(${padding.left + 350}, ${padding.top})`);
      const outerRadiusScale = sqrt$1().domain([0, 6]).range([2, 20]);
      const data = [{
        arcLength: .3,
        outerRadius: 5,
        color: 5
      }, {
        arcLength: .7,
        outerRadius: 1.5,
        color: 1.5
      }];
      var pie$1 = pie().sort(null).value(function (e) {
        return e.arcLength;
      });
      var arc$1 = arc().innerRadius(0).outerRadius(function (e) {
        return outerRadiusScale(e.data.outerRadius);
      });
      var path = dom.selectAll(".apm-asterpoint").data(pie$1(data).sort(function (a, b) {
        return ascending$1(a.data.outerRadius, b.data.outerRadius);
      }));
      path.enter().append("g").attr("transform", `translate(${0}, ${innerHeight})`).each(function (d, i) {
        select(this).append("path").attr("transform", `translate(${0}, ${0})`).attr("fill", "none").attr("stroke", function () {
          if (i == 1) {
            return "rgb(80,80,80)";
          } else {
            return mediumgrey;
          }
        }).attr("d", arc$1);
        select(this).append("text").attr("transform", function () {
          if (i == 0) {
            return `translate(${arc$1.centroid(d)[0]},${arc$1.centroid(d)[1] + 24})`;
          } else {
            return `translate(${arc$1.centroid(d)[0] + 12},${arc$1.centroid(d)[1]})`;
          }
        }).html(function () {
          if (i == 1) {
            return "Detected in cells (%)";
          } else {
            return "All cells";
          }
        }).attr("text-anchor", "start").attr("class", "apm-legend-axis-label");
      });
      dom.append("text").text("Arc").attr("x", 0).attr("y", -6).attr("text-anchor", "start").attr("class", "apm-legend-title");
    };
    summaryRadiusLegend(`${legendId}`, scale.summary);
    if (type == "DotPoint") {
      dotColorLegend(`${legendId}`, scale.point.color);
      dotRadiusLegend(`${legendId}`, scale.point.radius);
    } else {
      asterColorRadiusLegend(`${legendId}`, scale.point.color, scale.point.outerRadius);
      asterArcLegend(`${legendId}`);
    }
  }
  render() {
    var svg;
    if (!document.getElementById(`${this.rootId}-svg`)) {
      svg = _createSvg(this.rootId, this.padding, this.dimension);
    } else {
      svg = select(`#${this.rootId}-svg-g`);
    }
    /** remove axes and points on each render. should just remove the whole svg/group? */
    selectAll(`#${this.legendId}`).remove();
    selectAll(".apm-points").remove();
    selectAll(".apm-x-axis").remove();
    selectAll(".apm-y-axis").remove();
    this._createLegend(this.rootId, this.legendId, this.type, this.scale);
    const renderAsterPoint = (dom, d, scale) => {
      var pie$1 = pie().sort(null).value(function (e) {
        return e.arcLength;
      });
      var arc$1 = arc().innerRadius(0).outerRadius(function (e) {
        return scale.outerRadius(e.data.outerRadius); // d3.pie stores original attrs in .data attr
      });
      var path = select(`#_${dom}`).selectAll(".apm-asterpoint").data(pie$1(d).sort(function (a, b) {
        return ascending$1(a.data.outerRadius, b.data.outerRadius);
      }));
      path.enter().append("path").attr("class", "apm-asterpoint").attr("fill", function (e) {
        if (e.data.color <= 0) {
          return lightgrey;
        } else {
          return scale.color(e.data.color); // d3.pie stores original attrs in .data attr
        }
      }).attr("stroke", function (e) {
        if (e.data.color == 0) {
          return lightgrey;
        } else {
          return scale.color(e.data.color); // d3.pie stores original attrs in .data attr
        }
      }).attr("d", arc$1);
      path.exit().remove();
    };
    const renderDotPoint = (dom, d, scale) => {
      let circle = select(`#_${dom}`).selectAll(".apm-dotpoint").data([d]);
      circle.enter().append("circle").attr("class", "apm-dotpoint").attr("r", scale.radius(d.radius)).attr("cx", 0).attr("cy", 0).attr("fill", function () {
        if (d.color <= 0) {
          return lightgrey;
        } else {
          return scale.color(d.color);
        }
      });
      circle.exit().remove();
    };

    // adds the y Axis
    this.yAxis = axisLeft(this.scale.y);
    let yAxisG = svg.append("g").attr("class", "apm-y-axis axis--y").call(this.yAxis);
    const yLabelMap = map$2();
    this.data.forEach(function (each) {
      yLabelMap.set(each.y, each.groupInfo_.geneSymbol);
    });
    /** custom y-axis tick text */
    yAxisG.selectAll(".tick text").html(d => {
      return yLabelMap.get(d);
    });
    /**
     * adds a custom grouped x-axis.. need to restructure config input for defining a grouped/non-grouped x-axis. 
     * that would require modifications in other places for parsings dataPrefixes
     */
    _createGroupedXAxis(svg, this.data, this.summary, this.dimension, this.scale, this.axis);
    let points = svg.append("g").attr("class", "apm-points");
    let point = points.selectAll(".apm-point").data(this.data);
    point.enter().append("g").attr("class", "apm-point").attr("id", (d, i) => `_${i}`) // give unique id for selecting dom for rendering points
    .attr("transform", d => {
      let x = this.scale.x(d.x);
      let y = this.scale.y(d.y);
      return `translate(${x}, ${y})`;
    }).each((d, i) => {
      switch (this.type) {
        case "DotPoint":
          renderDotPoint(i, d.point, this.scale.point);
          break;
        case "AsterPoint":
          renderAsterPoint(i, d.point, this.scale.point);
          break;
      }
    });
    point.exit().remove();

    // plot mouse events
    svg.on("mouseout", () => {
      this.tooltip.hide();
    });
  }
}
function _createSvg(id, padding, dimension) {
  const root = select(`#${id}`);
  if (root.empty()) {
    console.error(`Element with id ${id} not found`);
    throw `Element with id ${id} not found`;
  }
  // create svg
  return root.append("svg").attr("id", `${id}-svg`).attr("width", dimension.width).attr("height", dimension.height).append("g").attr("id", `${id}-svg-g`).attr("transform", `translate(${padding.left}, ${padding.top})`);
}
function _createGroupedXAxis(svg, data, summary, dimension, scale, axis) {
  /**
   * creates custom circles for x-axis. should refactor this as a custom option?
   */
  let map = map$2();
  summary.forEach(d => {
    map.set(`${d[`${axis.x[0]}`]}*${d[`${axis.x[1]}`]}`, d.numCells);
  });

  /**
   * @returns axisData formatted as list of objs with x, y, label, depth. formatted for input to rendering
   */
  const createAxisData = function () {
    /** creates a nested object for a grouped axis */
    let group = nest().key(d => d.groupInfo_[`${axis.x[0]}`]).key(d => d.groupInfo_[`${axis.x[1]}`]).entries(data);
    /** creates a data object for each axis tick, formatted for rendering */
    let axisObj = [];
    group.forEach(d => {
      axisObj.push({
        label: d.key,
        x: d.key,
        y: 0,
        depth: 0
      });
      d.values.forEach(e => {
        axisObj.push({
          label: e.key,
          x: `${d.key}*${e.key}`,
          y: 0,
          depth: 1
        });
      });
    });
    return axisObj;
  };
  const axisData = createAxisData();
  let xAxisG = svg.append("g").attr("class", "apm-x-axis axis--x") // append a group for all axis elements to append
  .attr("transform", function (d) {
    return `translate(0,${-scale.maxRadius * 2})`;
  });
  xAxisG.append("text").text("Total cells").attr("class", "apm-axis-title").attr("x", -10).attr("dy", 14).attr("y", 0).attr("text-anchor", "end");
  let xAxis = xAxisG.selectAll(".tick").data(axisData.filter((v, i, a) => a.indexOf(v) === i)).enter();
  xAxis.append("g").attr("class", "tick").attr("transform", function (d) {
    return `translate(${scale.x(d.x)},0)`;
  }).each(function (d) {
    /** adds mouseover for depth>0 */
    select(this).filter(d => d.depth > 0).on("mouseover", e => {
      select(this).classed("active", true);
    }).on("mouseleave", e => {
      select(this).classed("active", false);
    });
    /** add text for ticks */
    select(this).append("text").attr("class", d => {
      if (d.depth == 0) {
        return "group-label";
      } else {
        return "label";
      }
    }).attr("dy", 2).attr("transform", function (d) {
      return `translate(0, 0)rotate(-90)`;
    }).html(function (d) {
      return d.label;
    }).style("font-size", () => {
      let fontsize = scale.maxRadius * 2;
      if (fontsize >= 12) {
        fontsize = 12;
      }
      if (d.depth == 0) {
        return fontsize * .8;
      } else {
        return fontsize;
      }
    });

    /** add ticks for xGroup */
    select(this).append("line").attr("class", d => {
      if (d.depth == 0) {
        return "group-line";
      } else {
        return "line";
      }
    }).attr("x1", 0).attr("x2", 0).attr("y1", scale.maxRadius).attr("y2", dimension.innerHeight).attr("stroke", lightgrey).attr("stroke-width", .75);

    /** adds circles for numCells  */
    select(this).filter(d => d.depth > 0).append("circle").attr("cx", 0).attr("cy", scale.maxRadius + 2).attr("r", d => scale.summary.radius(map.get(d.x))).attr("fill", ochre);
  });
  xAxis.exit().remove();
}

function launch(config, geneInput, url = getGtexUrls()) {
  // get the input list of genes
  if (geneInput == "") {
    alert("Input Error: At least one gene must be provided.");
    throw "Gene input error";
  }
  const MAX = 100;
  // message for geneInput errors
  let message = "";
  if (geneInput.length > MAX) {
    message = `Warning: Too many genes. Input list truncated to the first ${MAX}. <br/>`;
    geneInput = geneInput.slice(0, MAX);
  }
  let genes = url.geneId + geneInput.join("&geneId=");
  let dataUrl = url.singleCellExpression;
  let metadataUrl = url.singleCellExpressionSummary;
  const promises = [RetrieveAllPaginatedData(genes), dataUrl, RetrieveAllPaginatedData(metadataUrl)];
  Promise.all(promises).then(args => {
    // should I just load genes here? 
    // genes
    const genes = parseGenes(args[0]);
    // error-checking
    message += _validateGenes(genes, geneInput);
    // get list of gencodeIds
    const gQuery = genes.map(g => g.gencodeId).join("&gencodeId=");
    // get singleCellData for each querried gencodeId
    let fetchData = args[1] + gQuery + "&includeDataArray=False";
    RetrieveAllPaginatedData(fetchData).then(function (fData) {
      $$1("#geneQueryMessage").html(message);
      const data = _parseSingleCellAPINew(fData);
      const summary = _parseSummaryAPI(args[2]);
      if (data.length == 0) {
        console.error("This gene has no data");
      } else {
        _launch(data, summary, config);
        _controller(data, summary, config);
      }
    }).catch(function (err) {
      console.error(err);
    });
  }).catch(function (err) {
    console.error(err);
  });
}
function _validateGenes(genes, input) {
  let message = "";
  if (genes.length == 0) message = "Fatal Error: the gene list is empty.<br/>";else {
    if (genes.length < input.length) {
      let allIds = [];
      genes.forEach(g => {
        // compile a list of all known IDs
        allIds.push(g.gencodeId);
        allIds.push(g.geneSymbolUpper);
      });
      let missingGenes = input.filter(g => !allIds.includes(g.toLowerCase()) && !allIds.includes(g.toUpperCase()));
      if (missingGenes.length > 0) message = `Warning: Not all genes are found: ${missingGenes.join(",")}<br/>`;
    }
  }
  return message;
}
function _controller(data, summary, config) {
  let summaryStatistic = "mean";
  let summaryData = "AllCells";
  $$1("#single-cell-multi-gene-apm-type-DotPoint").on("click", () => {
    $$1("#single-cell-multi-gene-apm-type-DotPoint").addClass("active");
    $$1("#single-cell-multi-gene-apm-type-AsterPoint").removeClass("active");
    $$1("#single-cell-multi-gene-apm-point-summary-data").removeClass("hidden");
    config.type = "DotPoint";
    _launch(data, summary, config);
  });
  $$1("#single-cell-multi-gene-apm-type-AsterPoint").on("click", () => {
    $$1("#single-cell-multi-gene-apm-type-AsterPoint").addClass("active");
    $$1("#single-cell-multi-gene-apm-type-DotPoint").removeClass("active");
    $$1("#single-cell-multi-gene-apm-point-summary-data").addClass("hidden");
    config.type = "AsterPoint";
    _launch(data, summary, config);
  });
  $$1("#single-cell-multi-gene-apm-point-Mean").on("click", () => {
    $$1("#single-cell-multi-gene-apm-point-Mean").addClass("active");
    $$1("#single-cell-multi-gene-apm-point-Median").removeClass("active");
    summaryStatistic = "mean";
    config.points.DotPoint.color = `${summaryStatistic}${summaryData}`;
    config.points.AsterPoint.color = summaryStatistic;
    config.points.AsterPoint.outerRadius = summaryStatistic;
    _launch(data, summary, config);
  });
  $$1("#single-cell-multi-gene-apm-point-Median").on("click", () => {
    $$1("#single-cell-multi-gene-apm-point-Median").addClass("active");
    $$1("#single-cell-multi-gene-apm-point-Mean").removeClass("active");
    summaryStatistic = "median";
    config.points.DotPoint.color = `${summaryStatistic}${summaryData}`;
    config.points.AsterPoint.color = summaryStatistic;
    config.points.AsterPoint.outerRadius = summaryStatistic;
    _launch(data, summary, config);
  });
  $$1("#single-cell-multi-gene-apm-axis-x-Tissue").on("click", () => {
    $$1("#single-cell-multi-gene-apm-axis-x-Tissue").addClass("active");
    $$1("#single-cell-multi-gene-apm-axis-x-CellType").removeClass("active");
    config.axis.x = ["tissue", "cellType"];
    _launch(data, summary, config);
  });
  $$1("#single-cell-multi-gene-apm-axis-x-CellType").on("click", () => {
    $$1("#single-cell-multi-gene-apm-axis-x-Tissue").removeClass("active");
    $$1("#single-cell-multi-gene-apm-axis-x-CellType").addClass("active");
    config.axis.x = ["cellType", "tissue"];
    _launch(data, summary, config);
  });
  $$1("#single-cell-multi-gene-apm-point-AllCells").on("click", () => {
    $$1("#single-cell-multi-gene-apm-point-DetectedInCells").removeClass("active");
    $$1("#single-cell-multi-gene-apm-point-AllCells").addClass("active");
    summaryData = "AllCells";
    config.points.DotPoint.color = `${summaryStatistic}${summaryData}`;
    console.log("config.points.DotPoint.color", config.points.DotPoint.color);
    _launch(data, summary, config);
  });
  $$1("#single-cell-multi-gene-apm-point-DetectedInCells").on("click", () => {
    $$1("#single-cell-multi-gene-apm-point-AllCells").removeClass("active");
    $$1("#single-cell-multi-gene-apm-point-DetectedInCells").addClass("active");
    summaryData = "DetectedInCells";
    config.points.DotPoint.color = `${summaryStatistic}${summaryData}`;
    console.log("config.points.DotPoint.color", config.points.DotPoint.color);
    _launch(data, summary, config);
  });
  $$1("#single-cell-multi-gene-apm-download").on("click", () => {
    const cloneId = config.rootId + "-clone";
    const svgId = config.rootId + "-svg";
    if ($$1(`#${cloneId}`).length == 0) $$1("<div/>").attr("id", cloneId).appendTo($$1(`#${config.rootId}`));
    const toolbar = new Toolbar(config.rootId);
    toolbar.downloadSvg(svgId, "single-cell-multi-gene-matrix.svg", cloneId);
    // alert("downloading");
  });
}
/**
 * 1. create the plot data
 * 2. initiate AnyPointMatrix
 * 3. render plot
 * @param {*} data parsed single cell data
 * @param {*} summary parsed summary data for total num cells
 * @param {*} config axis: {x, y}, type: "", point: {}, 
 */
function _launch(data, summary, config) {
  config.point = config.points[config.type];
  const apmData = createApmData(data, config.axis, config.point, config.type); // attrs: x, y, point, groupInfo_
  const plot = new AnyPointMatrix(apmData, summary, config.rootId, config.tooltipId, config.legendId, config.type, config.axis, config.point, config.dimension, config.padding);
  plot.render();
  _customizeTooltip(plot);
}
function createApmData(data, axis, point, type) {
  /**
   * @param data list of objs with parsed single cell data
   * @param axis obj with x: [dataPrefix, dataPrefix], y: dataPrefix
   * @param point obj within config.points selected by key based on config.type. 
   *              Can be: radius, color OR innerRadius, outerRadius, arcLength, color
   * @param type string that determines which key to choose from config.points. Can be: AsterPoint or DotPoint 
   */
  data = data.map(d => {
    return {
      x: `${d[`${axis.x[0]}`]}*${d[`${axis.x[1]}`]}`,
      y: d[`${axis.y}`],
      type: type,
      groupInfo_: d
    };
  });
  const formatAsterData = d => {
    // refactor: input array of keys for arcs: [medianWithoutZeros, medianWithZeros]..but how to get percent of each dynamically?
    let data = [{
      mean: +d.meanDetectedInCells,
      median: +d.medianDetectedInCells,
      percent: +d.percentDetectedInCells / 100
    }, {
      mean: +d.meanAllCells,
      median: +d.medianAllCells,
      percent: 1 - +d.percentDetectedInCells / 100
    }];
    return data;
  };
  data.forEach(d => {
    switch (type) {
      // add a default case
      case "AsterPoint":
        // eslint-disable-next-line no-case-declarations
        const asterData = formatAsterData(d.groupInfo_); // define constant called formatAsterData
        d.point = createAsterPoint(asterData, point.innerRadius, point.outerRadius, point.arcLength, point.color);
        break;
      case "DotPoint":
        d.point = createDotPoint(d.groupInfo_, point.radius, point.color);
        break;
    }
  });
  return data;
}
function createAsterPoint(data, innerRadius, outerRadius, arcLength, color) {
  const point = data.map(d => {
    return {
      innerRadius: +d[`${innerRadius}`] || innerRadius,
      // not functional in config!
      outerRadius: +d[`${outerRadius}`],
      color: +d[`${color}`],
      arcLength: +d[`${arcLength}`]
    };
  });
  return point;
}
function createDotPoint(d, radius, color) {
  const point = {
    radius: +d[`${radius}`],
    color: +d[`${color}`]
  };
  return point;
}
function _parseSingleCellAPINew(raw) {
  let data = [];
  raw.forEach(tissueObj => {
    tissueObj.cellTypes.forEach(cellTypeObj => {
      let total = cellTypeObj.count + cellTypeObj.numZeros;
      let percent = +(100 * (cellTypeObj.count / total)).toFixed(2);
      let tissue = tissueObj.tissueSiteDetailId;
      data.push({
        label: "",
        tissue: tissue,
        cellType: cellTypeObj.cellType,
        gencodeId: tissueObj.gencodeId,
        geneSymbol: tissueObj.geneSymbol,
        gene: {
          gencodeId: tissueObj.gencodeId,
          geneSymbol: tissueObj.geneSymbol
        },
        datasetId: tissueObj.datasetId,
        medianAllCells: cellTypeObj.medianWithZeros,
        meanAllCells: cellTypeObj.meanWithZeros,
        medianDetectedInCells: cellTypeObj.medianWithoutZeros,
        meanDetectedInCells: cellTypeObj.meanWithoutZeros,
        percentDetectedInCells: percent,
        numWithoutZeros: cellTypeObj.count,
        numWithZeros: total,
        unit: tissueObj.unit
      });
    });
  });
  return data;
}
function _parseSummaryAPI(raw) {
  raw.forEach(d => {
    d.tissue = d.tissueSiteDetailId;
    delete d.tissueSiteDetailId;
    // map.set(d.tissueSiteDetailId, d.numCells)
  });
  return raw;
}
/**
 * Customizes the tooltip specifically for this plot
 * @param plot {AnyPointMatrix}
 * @private
 */
function _customizeTooltip(plot) {
  let points = selectAll(".apm-point");
  points.on("mouseover", (d, i, nodes) => {
    plot.tooltip.show(`<span class="tooltip-key">Gene: </span><span class="tooltip-value">${d.groupInfo_.geneSymbol}</span><br>
            <span class="tooltip-key">Tissue: </span><span class="tooltip-value">${d.groupInfo_.tissue}</span><br>
            <span class="tooltip-key">Cell type: </span><span class="tooltip-value">${d.groupInfo_.cellType}</span><br>
            <span class="tooltip-key">Total cells: </span><span class="tooltip-value">${d.groupInfo_.numWithZeros}</span></br>
            <span class="tooltip-key">Detected in cells: </span><span class="tooltip-value">${d.groupInfo_.percentDetectedInCells}%</span></br>
            <span class="tooltip-key">Unit: </span><span class="tooltip-value">log cp10k</span>
            <hr>
            <span class="tooltip-head">All cells</span><br>

            <span class="tooltip-key">Mean: </span><span class="tooltip-value">${d.groupInfo_.meanAllCells.toPrecision(4)}</span><br>
            <span class="tooltip-key">Median: </span><span class="tooltip-value">${d.groupInfo_.medianAllCells.toPrecision(4)}</span></br>
            <hr>
            <span class="tooltip-head">Detected in cells</span><br>
       
            <span class="tooltip-key">Mean: </span><span class="tooltip-value">${d.groupInfo_.meanDetectedInCells.toPrecision(4)}</span></br>
            <span class="tooltip-key">Median: </span><span class="tooltip-value">${d.groupInfo_.medianDetectedInCells.toPrecision(4)}`);
    select(".apm-x-axis").selectAll(".tick") // using custom axis
    .filter(function (e) {
      return e.x == d.x;
    }).classed("active", true);
    select(".apm-y-axis").selectAll(".tick") // using d3 axis
    .filter(function (e) {
      return e == d.y;
    }).classed("active", true);
    select(nodes[i]).classed("active-point", true);
  }).on("mouseleave", (d, i, nodes) => {
    select(".apm-x-axis").selectAll(".tick").filter(function (e) {
      return e.x == d.x;
    }).classed("active", false);
    select(".apm-y-axis").selectAll(".tick") // using d3 axis
    .filter(function (e) {
      return e == d.y;
    }).classed("active", false);
    select(nodes[i]).classed("active-point", false);
  });
}
var SingleCellMultiGeneAPM = {
  launch
};

/**
 * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.
 * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)
 */

/**
 * Render expression heatmap, gene model, and isoform tracks
 * @param type {enum} isoform, exon, junction
 * @param geneId {String} a gene name or gencode ID
 * @param rootId {String} the DOM ID of the SVG
 * @param urls {Object} of the GTEx web service urls with attr: geneId, tissue, geneModelUnfiltered, geneModel, junctionExp, exonExp
 */
function render(type, geneId, rootId, urls = getGtexUrls()) {
  RetrieveAllPaginatedData(urls.geneId + geneId) // query the gene by geneId--gene name or gencode ID with or without versioning
  .then(function (data) {
    // get the gene object and its gencode Id
    const gene = parseGenes(data, true, geneId);
    const gencodeId = gene.gencodeId;

    // build the promises
    const promises = [RetrieveAllPaginatedData(urls.tissue), RetrieveAllPaginatedData(urls.geneModelUnfiltered + gencodeId), RetrieveAllPaginatedData(urls.geneModel + gencodeId), RetrieveAllPaginatedData(urls.transcript + gencodeId), RetrieveNonPaginatedData(urls.junctionExp + gencodeId), RetrieveNonPaginatedData(urls.exonExp + gencodeId), RetrieveNonPaginatedData(urls.transcriptExp + gencodeId), RetrieveAllPaginatedData(urls.exon + gencodeId)];
    Promise.all(promises).then(function (args) {
      const tissues = parseTissues(args[0]),
        exons = parseModelExons(args[1]),
        // exons of the full gene model
        exonsCurated = parseModelExons(args[2]),
        // exons of the curated final gene model
        isoforms = parseTranscripts(args[3]),
        // by default, the parser sorts the isoforms in descending order by length
        isoformExons = parseExons(args[7]),
        // exons of the individual isoforms
        junctions = parseJunctions(args[4]),
        junctionExpress = parseJunctionExpression(args[4]),
        exonExpress = parseExonExpression(args[5], exonsCurated);
      let isoformExpress = parseTranscriptExpression(args[6]);

      // error checking
      let exonColorScale, isoformColorScale, junctionColorScale; // in log
      if (junctions.length >= 0) {
        // scenario1: not a single-exon gene
        if (junctionExpress !== undefined) {
          junctionColorScale = setColorScale(junctionExpress.map(d => Math.log10(d.value + 1)), "Reds", 0);
        }
      }

      // define all the color scales
      exonColorScale = setColorScale(exonExpress.map(d => Math.log2(d.value + 1)), "Blues", 0);
      isoformColorScale = setColorScale(isoformExpress.map(d => Math.log10(d.value + 1)), "Purples", 0);

      // heat map
      let dmap = undefined;
      const ids = {
        root: rootId,
        svg: `${rootId}-svg`,
        tooltip: `${rootId}-isoformTooltip`,
        toolbar: `${rootId}-isoformToolbar`,
        clone: `${rootId}-isoformClone`,
        buttons: {
          save: `${rootId}-isoformSave`
        }
      };
      // build the dom components
      ["toolbar", "clone"].forEach(key => {
        $("<div/>").attr("id", ids[key]).appendTo($(`#${ids.root}`));
      });
      const svgTitle = `${gene.geneSymbol}: ${gene.gencodeId} ${gene.description}`;
      const width = $(`#${rootId}`).innerWidth() || window.innerWidth;
      switch (type) {
        case "isoformTransposed":
          {
            const dmapConfig = new DendroHeatmapConfig(width, 150, 100, {
              top: 60,
              right: 350,
              bottom: 200,
              left: 50
            }, 12, 10);
            // TODO: move cluster data parsing to gtexDataParser.js
            ["tissue", "transcript"].forEach(k => {
              if (!args[6].clusters.hasOwnProperty(k)) {
                console.error(args[6].clusters);
                throw "Parse Error: Required cluster attribute is missing: " + k;
              }
            });
            let tissueTree = args[6].clusters.tissue;
            let isoformTree = args[6].clusters.transcript;
            let isoformExpressT = parseTranscriptExpressionTranspose(args[6]);
            dmap = new DendroHeatmap(tissueTree, isoformTree, isoformExpressT, "Purples", 5, dmapConfig, ids.tooltip, true, 10, `Isoform Expression of ${svgTitle}`);
            dmap.render(ids.root, ids.svg, true, true, top, 5);
            if (!isoformTree.startsWith("Not enough data")) {
              const orders = dmap.objects.rowTree.yScale.domain(); // the leaf order of the isoform dendrogram
              isoforms.sort((a, b) => {
                if (orders.indexOf(a.transcriptId) < orders.indexOf(b.transcriptId)) return -1;
                if (orders.indexOf(a.transcriptId) > orders.indexOf(b.transcriptId)) return 1;
                return 0;
              });
            }
            break;
          }
        case "junction":
          {
            if (junctions.length == 0) {
              $(`#${rootId}`).text("This gene has no junctions available.");
              break;
            }
            const dmapConfig = new DendroHeatmapConfig(width, 150, 0, {
              top: 60,
              right: 350,
              bottom: 200,
              left: 50
            }, 12, 10);
            let tissueTree = args[4].clusters.tissue;
            dmap = new DendroHeatmap(undefined, tissueTree, junctionExpress, "Reds", 5, dmapConfig, ids.tooltip, true, 10, `Junction Expression of ${svgTitle}`);
            dmap.render(ids.root, ids.svg, false, true, top, 5);
            break;
          }
        case "exon":
          {
            const dmapConfig = new DendroHeatmapConfig(width, 150, 0, {
              top: 60,
              right: 350,
              bottom: 200,
              left: 50
            }, 12, 10);
            let tissueTree = args[5].clusters.tissue;
            dmap = new DendroHeatmap(undefined, tissueTree, exonExpress, "Blues", 5, dmapConfig, ids.tooltip, true, 2, `Exon Expression of ${svgTitle}`);
            dmap.render(ids.root, ids.svg, false, true, top, 5);
            break;
          }
        default:
          {
            throw "Input type is not recognized";
          }
      }
      $("#spinner").hide();

      // TODO: code review

      // define the gene model and isoform tracks layout dimensions
      const yAdjust = type.startsWith("isoform") ? 60 : 80; // vertical space between the heatmap and gene model/isoform tracks
      const modelConfig = {
        x: dmap.config.panels.main.x,
        y: dmap.config.panels.main.h + dmap.config.panels.main.y + yAdjust,
        // TODO: remove hard-coded values
        w: dmap.config.panels.main.w,
        h: 100
      };
      const exonH = 20; // TODO: remove hard-coded values
      const isoTrackViewerConfig = {
        x: modelConfig.x,
        y: modelConfig.y + modelConfig.h,
        w: modelConfig.w,
        h: exonH * isoforms.length,
        labelOn: "left"
      };

      // extend the SVG height to accommondate the gene model and isoform tracks
      let h = +select(`#${ids.svg}`).attr("height"); // get the current height
      let adjust = h + modelConfig.h + isoTrackViewerConfig.h;
      if (!type.startsWith("isoform")) adjust = adjust < 1200 ? 1200 : adjust;
      select(`#${ids.svg}`).attr("height", adjust); // set minimum height to 1200 for color legends // TODO: code review, remove hard-coded values

      // render the gene model
      const geneModel = new GeneModel(gene, exons, exonsCurated, junctions);
      const modelG = dmap.visualComponents.svg.append("g").attr("id", "geneModel") // TODO: remove hard-coded id
      .attr("transform", `translate(${modelConfig.x}, ${modelConfig.y})`);
      if (!type.startsWith("isoform")) geneModel.render(modelG, modelConfig); // gene model is not rendered when the page is in isoform view mode

      // render isoform tracks, ignoring intron lengths
      const isoformTrackViewer = new IsoformTrackViewer(isoforms, isoformExons, exons, isoTrackViewerConfig);
      const trackViewerG = dmap.visualComponents.svg.append("g").attr("transform", `translate(${isoTrackViewerConfig.x}, ${isoTrackViewerConfig.y})`);
      const labelOn = type.startsWith("isoform") ? "both" : "left";
      isoformTrackViewer.render(false, trackViewerG, labelOn);

      // customization
      if (!type.startsWith("isoform")) _addColorLegendsForGeneModel(dmap, junctionColorScale, exonColorScale);
      _createToolbar(dmap, ids);
      switch (type) {
        case "isoformTransposed":
          {
            _customizeIsoformTransposedMap(tissues, dmap, isoformTrackViewer, junctionColorScale, exonColorScale, isoformColorScale, junctionExpress, exonExpress, isoformExpress);
            _customizeIsoformTracks(dmap);
            break;
          }
        case "junction":
          {
            if (junctions.length == 0) break;
            _customizeHeatMap(tissues, geneModel, dmap, isoformTrackViewer, junctionColorScale, exonColorScale, isoformColorScale, junctionExpress, exonExpress, isoformExpress);
            _customizeJunctionMap(tissues, geneModel, dmap);
            _customizeGeneModel(tissues, geneModel, dmap);
            _customizeIsoformTracks(dmap);
            break;
          }
        case "exon":
          {
            _customizeHeatMap(tissues, geneModel, dmap, isoformTrackViewer, junctionColorScale, exonColorScale, isoformColorScale, junctionExpress, exonExpress, isoformExpress);
            _customizeExonMap(tissues, geneModel, dmap);
            _customizeGeneModel(tissues, geneModel, dmap);
            _customizeIsoformTracks(dmap);
            break;
          }
        default:
          {
            throw "unrecognized type";
          }
      }
    }).catch(function (err) {
      console.error(err);
      $("#spinner").hide();
    });
  }).catch(function (err) {
    console.error(err);
    $("#spinner").hide();
  });
}

/**
 * Create the SVG toolbar
 * @param dmap {DendroHeatmap}
 * @param ids {Dictionary} of DOM IDs with buttons
 * @private
 */
function _createToolbar(dmap, ids) {
  let toolbar = dmap.createToolbar(ids.toolbar, dmap.tooltip);
  toolbar.createDownloadSvgButton(ids.buttons.save, ids.svg, `${ids.root}-save.svg`, ids.clone);
}

/**
 * customizing the heatmap
 * dependencies: CSS classes from expressMap.css, junctionMap.css
 * @param tissues {List} of GTEx tissue objects with attr: colorHex, tissueSiteDetailId, tissueSiteDetail
 * @param geneModel {GeneModel} of the collapsed gene model
 * @param dmap {Object} of DendroHeatmap
 * @param isoTrackViewer {IsoformTrackViewer}
 * @param junctionScale
 * @param exonScale
 * @param isoformScale
 * @param junctionData {List} of junction expression data objects
 * @param exonData {List} of exon expression data objects
 * @param isoformData {List} of isoform expression data objects
 * @private
 */
function _customizeHeatMap(tissues, geneModel, dmap, isoTrackViewer, junctionScale, exonScale, isoformScale, junctionData, exonData, isoformData) {
  const mapSvg = dmap.visualComponents.svg;
  const tissueDict = tissues.reduce((arr, d) => {
    arr[d.tissueSiteDetailId] = d;
    return arr;
  }, {});

  // replace tissue ID with tissue site detail
  mapSvg.selectAll(".exp-map-ylabel").text(d => tissueDict[d] !== undefined ? tissueDict[d].tissueSiteDetail : d).style("cursor", "pointer").attr("x", dmap.objects.heatmap.xScale.range()[1] + 15); // make room for tissue color boxes

  // add tissue bands
  mapSvg.select("#heatmap").selectAll(".exp-map-ycolor").data(dmap.objects.heatmap.yScale.domain()).enter().append("rect").attr("x", dmap.objects.heatmap.xScale.range()[1] + 5).attr("y", d => dmap.objects.heatmap.yScale(d)).attr("width", 5).attr("height", dmap.objects.heatmap.yScale.bandwidth()).classed("exp-map-ycolor", true).style("fill", d => `#${tissueDict[d].colorHex}`);
  if (dmap.objects.heatmap.xScale.domain().length > 15) {
    // Add an extra tissue color band if the number of columns are larger than 15
    mapSvg.select("#heatmap").selectAll(".leaf-color").data(dmap.objects.heatmap.yScale.domain()).enter().append("rect").attr("x", dmap.objects.heatmap.xScale.range()[0] - 5).attr("y", d => dmap.objects.heatmap.yScale(d)).attr("width", 5).attr("height", dmap.objects.heatmap.yScale.bandwidth()).classed("leaf-color", true).style("fill", d => `#${tissueDict[d].colorHex}`);
  }

  // define tissue label mouse events
  mapSvg.selectAll(".exp-map-ylabel").on("mouseover", function () {
    select(this).classed("highlighted", true);
  }).on("click", function (d) {
    mapSvg.selectAll(".exp-map-ylabel").classed("clicked", false);
    select(this).classed("clicked", true);
    const tissue = d;
    let j;
    if (junctionData !== undefined) j = junctionData.filter(j => j.tissueSiteDetailId == tissue); // junction data
    const ex = exonData.filter(e => e.tissueSiteDetailId == tissue); // exon data
    // geneModel.changeTextlabel(mapSvg.select("#geneModel"), tissueDict[tissue].tissueSiteDetail);
    geneModel.addData(mapSvg.select("#geneModel"), j, ex, junctionScale, exonScale);

    // isoforms update
    const isoBarScale = linear().domain([min$1(isoformData.map(d => d.value)), max$1(isoformData.map(d => d.value))]).range([0, -100]);
    const isoData = isoformData.filter(iso => iso.tissueSiteDetailId == tissue);
    isoTrackViewer.showData(isoData, isoformScale, isoBarScale, tissueDict[tissue].tissueSiteDetail);
  });
}

/**
 *
 * @param tissues {List} of the GTEx tissue objects with attr: tissueSiteDetail
 * @param dmap {Object} of DendroHeatmap
 * @param isoTrackViewer {IsoTrackViewer}
 * @param junctionScale
 * @param exonScale
 * @param isoformScale
 * @param junctionData {List} of junction expression data objects
 * @param exonData {List} of exon expression data objects
 * @param isoformData {List} of isoform expression data objects
 * @private
 */
function _customizeIsoformTransposedMap(tissues, dmap, isoTrackViewer, junctionScale, exonScale, isoformScale, junctionData, exonData, isoformData) {
  const mapSvg = dmap.visualComponents.svg;
  const tissueDict = tissues.reduce((arr, d) => {
    arr[d.tissueSiteDetailId] = d;
    return arr;
  }, {});
  const tooltip = dmap.tooltip;

  //replace tissue site detail ID with tissue site detail
  mapSvg.selectAll(".exp-map-xlabel").text(d => tissueDict[d] !== undefined ? tissueDict[d].tissueSiteDetail : d).style("cursor", "pointer");

  // add tissue bands
  mapSvg.select("#heatmap").selectAll(".exp-map-xcolor").data(dmap.objects.heatmap.xScale.domain()).enter().append("rect").attr("x", d => dmap.objects.heatmap.xScale(d)).attr("y", dmap.objects.heatmap.yScale.range()[1] + 5).attr("width", dmap.objects.heatmap.xScale.bandwidth()).attr("height", 5).classed("exp-map-xcolor", true).style("fill", d => `#${tissueDict[d].colorHex}`);
  if (dmap.objects.heatmap.yScale.domain().length > 15) {
    // when there are more than 15 isoforms, add another tissue color bands under the dendrogram's leaf nodes
    mapSvg.select("#heatmap").selectAll(".leaf-color").data(dmap.objects.heatmap.xScale.domain()).enter().append("rect").attr("x", d => dmap.objects.heatmap.xScale(d)).attr("y", dmap.objects.heatmap.yScale.range()[0] - 10).attr("width", dmap.objects.heatmap.xScale.bandwidth()).attr("height", 5).classed("leaf-color", true).style("fill", d => `#${tissueDict[d].colorHex}`);
  }

  // define tissue label mouse events
  mapSvg.selectAll(".exp-map-xlabel").on("mouseover", function () {
    select(this).classed("highlighted", true);
  }).on("mouseout", function () {
    select(this).classed("highlighted", false);
  }).on("click", function (d) {
    mapSvg.selectAll(".exp-map-xlabel").classed("clicked", false);
    select(this).classed("clicked", true);
    const tissue = d;
    if (junctionData !== undefined) junctionData.filter(j => j.tissueSiteDetailId == tissue); // junction data
    exonData.filter(e => e.tissueSiteDetailId == tissue); // exon data

    // isoforms update

    const isoBarScale = linear().domain([min$1(isoformData.map(d => d.value)), max$1(isoformData.map(d => d.value))]).range([0, -100]);
    const isoData = isoformData.filter(iso => iso.tissueSiteDetailId == tissue);
    const sort = false;
    isoTrackViewer.showData(isoData, isoformScale, isoBarScale, tissueDict[tissue].tissueSiteDetail, sort);
  });

  // define the isoform heatmap cells' mouse events
  // note: to reference the element inside the function (e.g. d3.select(this)) here we must use a normal anonymous function.
  mapSvg.selectAll(".exp-map-cell").on("mouseover", function (d) {
    const selected = select(this); // 'this' refers to the d3 DOM object
    dmap.objects.heatmap.cellMouseover(d, mapSvg, selected);
    const tissue = tissueDict[d.x] === undefined ? d.x : tissueDict[d.x].tissueSiteDetail; // get tissue name or ID
    const value = parseFloat(d.displayValue.toExponential()).toPrecision(3);
    const tooltipData = [`<span class="tooltip-key">Tissue</span>: <span class="tooltip-value">${tissue}</span>`, `<span class="tooltip-key">Isoform</span>: <span class="tooltip-value">${d.transcriptId}</span>`, `<span class="tooltip-key">${d.unit.charAt(0).toUpperCase() + d.unit.slice(1)}</span>: <span class="tooltip-value">${value}</span>`];
    tooltip.show(tooltipData.join("<br/>"));

    // highlight the isoform track
    const id = d.transcriptId.replace(".", "_"); // dot is not an allowable character, so it has been replaced with an underscore
    mapSvg.select(`#${id}`).selectAll(".exon-curated").classed("highlighted", true); // TODO: perhaps change the confusing class name
    mapSvg.select(`#${id}`).selectAll(".intron").classed("highlighted", true);
  }).on("mouseout", function (d) {
    mapSvg.selectAll("*").classed("highlighted", false);
    tooltip.hide();
  });

  // isoform labels
  mapSvg.selectAll(".exp-map-ylabel").on("mouseover", function (d) {
    select(this).classed("highlighted", true);

    // highlight the isoform track
    const id = d.replace(".", "_"); // dot is not an allowable character, so it has been replaced with an underscore
    mapSvg.select(`#${id}`).selectAll(".exon-curated").classed("highlighted", true); // TODO: perhaps change the confusing class name
    mapSvg.select(`#${id}`).selectAll(".intron").classed("highlighted", true);
  }).on("mouseout", function () {
    select(this).classed("highlighted", false);
    mapSvg.selectAll(".exon-curated").classed("highlighted", false);
    mapSvg.selectAll(".intron").classed("highlighted", false);
  }).on("click", function () {
    // no action implemented
  });
}

/**
 * customizing the exon heat map
 * @param tissues {List} of the GTEx tissue objects with attr: tissueSiteDetail
 * @param geneModel {GeneModel}
 * @param dmap {DendroHeatmap}

 * @private
 */
function _customizeExonMap(tissues, geneModel, dmap) {
  const mapSvg = dmap.visualComponents.svg;
  const tooltip = dmap.tooltip;
  const tissueDict = tissues.reduce((arr, d) => {
    arr[d.tissueSiteDetailId] = d;
    return arr;
  }, {});

  // define the exon heatmap cells' mouse events
  // note: to reference the element inside the function (e.g. d3.select(this)) here we must use a normal anonymous function.
  mapSvg.selectAll(".exp-map-cell").on("mouseover", function (d) {
    const selected = select(this); // 'this' refers to the d3 DOM object
    dmap.objects.heatmap.cellMouseover(d, mapSvg, selected);
    const tissue = tissueDict[d.y] === undefined ? d.x : tissueDict[d.y].tissueSiteDetail; // get tissue name or ID
    const value = parseFloat(d.displayValue.toExponential()).toPrecision(3);
    const tooltipData = [`<span class="tooltip-key">Tissue</span>: <span class="tooltip-value">${tissue}</span>`, `<span class="tooltip-key">Exon</span>: <span class="tooltip-value">${d.exonId}</span>`, `<span class="tooltip-key">Start</span>: <span class="tooltip-value">${d.chromStart}</span>`, `<span class="tooltip-key">End</span>: <span class="tooltip-value">${d.chromEnd}</span>`, `<span class="tooltip-key">Exon length</span>: <span class="tooltip-value">${Number(d.chromEnd) - Number(d.chromStart) + 1} bp</span>`, `<span class="tooltip-key">${d.unit.charAt(0).toUpperCase() + d.unit.slice(1)}</span>: <span class="tooltip-value">${value}</span>`];
    tooltip.show(tooltipData.join("<br/>"));

    // highlight the exon on the gene model
    const exonNumber = d.exonId.split("_")[1];
    mapSvg.selectAll(`.exon-curated${exonNumber}`).classed("highlighted", true);
  }).on("mouseout", function (d) {
    mapSvg.selectAll("*").classed("highlighted", false);
    tooltip.hide();
  });

  // exon labels
  mapSvg.selectAll(".exp-map-xlabel").each(function (d) {
    // simplified the exon label
    const exonNumber = d.split("_")[1];
    select(this).text(`Exon ${exonNumber}`);
  }).on("mouseover", function (d) {
    select(this).classed("highlighted", true);

    // highlight the exon on the gene model
    const exonNumber = d.split("_")[1];
    mapSvg.selectAll(`.exon-curated${exonNumber}`).classed("highlighted", true);
  }).on("mouseout", function () {
    select(this).classed("highlighted", false);
    mapSvg.selectAll(".exon-curated").classed("highlighted", false);
  });
}

/**
 * customizing the junction heat map
 * @param tissues {List} of the GTEx tissue objects with attr: tissueSiteDetail
 * @param geneModel {GeneModel}
 * @param dmap {DendroHeatmap}
 * @private
 */
function _customizeJunctionMap(tissues, geneModel, dmap) {
  const mapSvg = dmap.visualComponents.svg;
  const tooltip = dmap.tooltip;
  const tissueDict = tissues.reduce((arr, d) => {
    arr[d.tissueSiteDetailId] = d;
    return arr;
  }, {});

  // define the junction heatmap cells' mouse events
  mapSvg.selectAll(".exp-map-cell").on("mouseover", function (d) {
    const selected = select(this);
    dmap.objects.heatmap.cellMouseover(d, mapSvg, selected);
    const tissue = tissueDict[d.y] === undefined ? d.x : tissueDict[d.y].tissueSiteDetail; // get tissue name or ID
    const junc = geneModel.junctions.filter(j => j.junctionId == d.x && !j.filtered)[0]; // get the junction display name
    const value = parseFloat(d.displayValue.toExponential()).toPrecision(3);
    const tooltipData = [`<span class="tooltip-key">Tissue</span>: <span class="tooltip-value">${tissue}</span>`, `<span class="tooltip-key">Junction</span>: <span class="tooltip-value">${junc.displayName}</span>`, `<span class="tooltip-key">Start</span>: <span class="tooltip-value">${junc.chromStart}</span>`, `<span class="tooltip-key">End</span>: <span class="tooltip-value">${junc.chromEnd}</span>`, `<span class="tooltip-key">Exon length</span>: <span class="tooltip-value">${Number(junc.chromEnd) - Number(junc.chromStart) + 1} bp</span>`, `<span class="tooltip-key">${d.unit.charAt(0).toUpperCase() + d.unit.slice(1)}</span>: <span class="tooltip-value">${value}</span>`];
    tooltip.show(tooltipData.join("<br/>"));

    // highlight the junction and its exons on the gene model
    mapSvg.selectAll(`.junc${junc.junctionId}`).classed("highlighted", true);
    if (junc !== undefined) {
      mapSvg.selectAll(`.exon${junc.startExon.exonNumber}`).classed("highlighted", true);
      mapSvg.selectAll(`.exon${junc.endExon.exonNumber}`).classed("highlighted", true);
    }
  }).on("mouseout", function (d) {
    mapSvg.selectAll("*").classed("highlighted", false);
    tooltip.hide();
  });

  // junction labels
  mapSvg.selectAll(".exp-map-xlabel").each(function () {
    // add junction ID as the dom id
    const xlabel = select(this);
    const jId = xlabel.text();
    xlabel.attr("id", `${jId}`);
    xlabel.classed(`junc${jId}`, true);

    // and then change the text to startExon-endExon format
    const junc = geneModel.junctions.filter(d => d.junctionId == `${jId}` && !d.filtered)[0];
    if (junc !== undefined) xlabel.text(junc.displayName);
  }).on("mouseover", function () {
    const jId = select(this).attr("id");
    select(this).classed("highlighted", true);

    // highlight the junction and its exons on the gene model
    mapSvg.selectAll(`.junc${jId}`).classed("highlighted", true);
    const junc = geneModel.junctions.filter(d => d.junctionId == jId && !d.filtered)[0];
    if (junc !== undefined) {
      mapSvg.selectAll(`.exon${junc.startExon.exonNumber}`).classed("highlighted", true);
      mapSvg.selectAll(`.exon${junc.endExon.exonNumber}`).classed("highlighted", true);
    }
  }).on("mouseout", function () {
    select(this).classed("highlighted", false);
    selectAll(".junc").classed("highlighted", false);
    selectAll(".junc-curve").classed("highlighted", false);
    mapSvg.selectAll(".exon").classed("highlighted", false);
  });
}
function _customizeGeneModel(tissues, geneModel, dmap) {
  const mapSvg = dmap.visualComponents.svg;
  const tooltip = dmap.tooltip;
  const model = mapSvg.select("#geneModel");
  tissues.reduce((arr, d) => {
    arr[d.tissueSiteDetailId] = d;
    return arr;
  }, {});
  // mouse events on the gene model
  mapSvg.selectAll(".junc").on("mouseover", function (d) {
    selectAll(`.junc${d.junctionId}`).classed("highlighted", true);
    const tooltipData = [`<span class="tooltip-head">${d.displayName}</span>`, `<span class="tooltip-key">ID</span>: <span class="tooltip-value">${d.junctionId}</span>`, `<span class="tooltip-key">Junction length</span>: <span class="tooltip-value">${Number(d.chromEnd) - Number(d.chromStart) + 1} bp</span>`];
    tooltip.show(tooltipData.join("<br/>"));
    if (d.startExon !== undefined) {
      model.selectAll(".exon").filter(`.exon${d.startExon.exonNumber}`).classed("highlighted", true);
      model.selectAll(".exon").filter(`.exon${d.endExon.exonNumber}`).classed("highlighted", true);
    }

    // on the junction heat map, label the xlabel
    model.select(`.junc${d.junctionId}`).classed("highlighted", true).classed("normal", false);
  }).on("mouseout", function (d) {
    selectAll(`.junc${d.junctionId}`).classed("highlighted", false);
    model.selectAll(".exon").classed("highlighted", false);
    model.selectAll(".xLabel").classed("highlighted", false).classed("normal", true);
    tooltip.hide();
  });
  model.selectAll(".exon-curated").on("mouseover", function (d) {
    select(this).classed("highlighted", true);
    const tooltipData = [`<span class="tooltip-head">Exon ${d.exonNumber}</span>`, `<span class="tooltip-key">Start</span>: <span class="tooltip-value">${d.chromStart}</span>`, `<span class="tooltip-key">End</span>: <span class="tooltip-value">${d.chromEnd}</span>`, `<span class="tooltip-key">Exon length</span>: <span class="tooltip-value">${Number(d.chromEnd) - Number(d.chromStart) + 1} bp</span>`];
    tooltip.show(tooltipData.join("<br/>"));
  }).on("mouseout", function (d) {
    select(this).classed("highlighted", false);
    tooltip.hide();
  });
}
function _customizeIsoformTracks(dmap) {
  const mapSvg = dmap.visualComponents.svg;
  const tooltip = dmap.tooltip;
  mapSvg.selectAll(".isotrack").selectAll(".exon-curated").on("mouseover", function (d) {
    select(this).classed("highlighted", true);
    const tooltipData = [`<span class="tooltip-head">Exon ${d.exonNumber}</span>`, `<span class="tooltip-key">Start</span>: <span class="tooltip-value">${d.chromStart}</span>`, `<span class="tooltip-key">End</span>: <span class="tooltip-value">${d.chromEnd}</span>`, `<span class="tooltip-key">Exon length</span>: <span class="tooltip-value">${Number(d.chromEnd) - Number(d.chromStart) + 1} bp</span>`];
    tooltip.show(tooltipData.join("<br/>"));
  }).on("mouseout", function () {
    select(this).classed("highlighted", false);
    mapSvg.selectAll(".exon-curated").classed("highlighted", false);
    tooltip.hide();
  });
}
function _addColorLegendsForGeneModel(dmap, junctionScale, exonScale) {
  const mapSvg = dmap.visualComponents.svg;
  let X = dmap.objects.heatmap.xScale.range()[1] + 50;
  const Y = 30;
  const inc = 50;
  drawColorLegend("Exon read counts per base", mapSvg.select("#geneModel"), exonScale, {
    x: X,
    y: Y
  }, true, 5, 2, {
    h: 20,
    w: 10
  }, "v");
  X = X + inc;
  if (junctionScale !== undefined) drawColorLegend("Junction read counts", mapSvg.select("#geneModel"), junctionScale, {
    x: X,
    y: Y
  }, true, 5, 10, {
    h: 20,
    w: 10
  }, "v");
}
var TranscriptBrowser = {
  render: render
};

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z$9 = "div.boxplot-tooltip {\n   min-width: 100px;\n   display: none;\n   background-color : rgba(32, 53, 73, 0.95);\n   padding: 10px;\n   text-align:left;\n   color: #ffffff;\n   position:absolute;\n   font-size:12px;\n   z-index:4000;\n   border-radius:5px;\n}";
styleInject(css_248z$9);

var css_248z$8 = "/**\n * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.\n * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)\n */\ntext.color-legend {\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n    font-size: 10px;\n}\n\ntext.bubble-map-xlabel {\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n    /*font-size: 10px;*/\n}\ntext.bubble-map-xlabel.highlighted {\n    font-weight: 400;\n    /*font-size: 12px;*/\n    text-decoration: underline;\n}\ntext.bubble-map-xlabel.query {\n    font-weight: 600;\n    /*font-size:11px;*/\n    fill: #d2111b;\n}\n\ntext.bubble-map-ylabel {\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n    /*font-size: 10px;*/\n}\ntext.bubble-map-ylabel.highlighted {\n    font-weight: 400;\n    /*font-size: 12px;*/\n    text-decoration: underline;\n}\ntext.bubble-map-ylabel.clicked, text.bubble-map-xlabel.clicked {\n    fill: #D25C43;\n}\n\ncircle.bubble-map-cell {\n    stroke-width:0px;\n}\ncircle.bubble-map-cell.highlighted {\n    stroke: #D25C43;\n    stroke-width:2px;\n}\n\nrect.mini-marker {\n    fill: none;\n}\n\nrect.mini-marker.highlighted {\n    fill: #D25C43;\n}\n\ndiv.bubblemap-tooltip {\n   min-width: 100px;\n   display: none;\n   background-color : rgba(32, 53, 73, 0.95);\n   padding: 10px;\n   text-align:left;\n   color: #ffffff;\n   position:absolute;\n   font-size:12px;\n   z-index:4000;\n   border-radius:5px;\n}\n\nrect.track.highlighted {\n    stroke: #D25C43;\n}\n\n/* eQTL box plot stuff */\n.closePlot {\n   cursor:pointer;\n   float:right;\n}\n\n.bbMap-canvas {\n    margin-top: 30px;\n    margin-left: 250px;\n}\n\n.bbMap-dialog .title {\n   text-align: center;\n   font-size: 12px;\n\n}\n\n/*#bbMap-dialog text.plotviz-label {*/\n   /*font-size: 12px;*/\n/*}*/\n\n/*#bbMap-dialog .plotviz-left-axis g.tick text {*/\n   /*font-size: 11px;*/\n/*}*/\n\n#bbMap-dialog {\n   font-size: 11px;\n}\n\n.violin-axis-label {\n    font-size: 10px;\n}\n\n.bbMap-clear {\n   color: #999;\n   font-size: 10px;\n   text-decoration: underline;\n   cursor: pointer;\n}\n\n/* jquery UI customization */\n.ui-dialog .ui-dialog-titlebar {\n   padding: 0.1em 0.2em;\n}\n\n.ui-dialog-content {\n   width: 100% !important; /* this is an important overwrite that ensures that the ui-dialog-content's width remains 100% of the ui-dialog after a resizing event */\n}\n\n.ui-widget-header {\n   border: 0px;\n}\n.ui-dialog {\n    z-index:2000;\n}\n\n\n\n";
styleInject(css_248z$8);

var css_248z$7 = "/**\n * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.\n * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)\n */\n.dendrogram-axis line, .dendrogram-axis path{\n  fill: none;\n  stroke: #a9a9a9;\n  shape-rendering: crispEdges;\n}\n\n.dendrogram-axis text {\n    fill: #a9a9a9;\n}\n\n.leaf-color {\n    stroke-width: 0;\n}\n\n.leaf-color.highlighted {\n    stroke-width: 1px;\n    stroke: #555f66;\n}";
styleInject(css_248z$7);

var css_248z$6 = "/**\n * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.\n * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)\n */\n.ed-section-title {\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n    font-size: 15px;\n}";
styleInject(css_248z$6);

var css_248z$5 = "/**\n * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.\n * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)\n */\ntext.color-legend {\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n    font-size: 10px;\n}\n\ntext.exp-map-xlabel {\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n    font-size: 10px;\n}\ntext.exp-map-xlabel.highlighted {\n    font-weight: 400;\n    font-size: 12px;\n    text-decoration: underline;\n}\ntext.exp-map-xlabel.query {\n    font-weight: 600;\n    font-size:11px;\n    fill: #d2111b;\n}\n\n\ntext.exp-map-ylabel {\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n    font-size: 10px;\n}\ntext.exp-map-ylabel.highlighted {\n    font-weight: 400;\n    font-size: 12px;\n    text-decoration: underline;\n}\ntext.exp-map-ylabel.clicked, text.exp-map-xlabel.clicked {\n    fill: #D25C43;\n}\n\nrect.exp-map-cell {\n    stroke-width:0px;\n}\nrect.exp-map-cell.highlighted {\n    stroke: #D25C43;\n    stroke-width:2px;\n}\n\ndiv.heatmap-tooltip {\n   min-width: 100px;\n   display: none;\n   background-color : rgba(32, 53, 73, 0.95);\n   padding: 10px;\n   text-align:left;\n   color: #ffffff;\n   position:absolute;\n   font-size:12px;\n   z-index:4000;\n   border-radius:5px;\n}\n\n\n\n";
styleInject(css_248z$5);

var css_248z$4 = "#gene-expr-vplot-toolbar-plot-options {\n    display: inline-flex;\n}\n\n#gene-expr-vplot-toolbar-plot-options label {\n    margin-bottom: 0;\n}\n\n#gene-expr-vplot-toolbar {\n    border-bottom: 1px solid #e2e2e2;\n    border-top: 1px solid #e2e2e2;\n    padding: 5px 0px 5px 0px;\n}\n\n.gene-expr-vplot-option-label {\n    padding-right: 5px;\n    font-size: 15px;\n    font-variant: all-small-caps;\n    font-weight: 500;\n}\n\n#gene-expr-vplot-svg .violin-x-axis line, #gene-expr-vplot-svg .violin-y-axis line, #gene-expr-vplot-svg  .violin-x-axis path, #gene-expr-vplot-svg  .violin-y-axis path{\n    stroke: Black;\n}\n\n#gene-expr-vplot-svg .violin-x-axis text, #gene-expr-vplot-svg  .violin-y-axis text, #gene-expr-vplot-svg  .violin-axis-label {\n    fill: Black;\n    font-size: 11.5px;\n    font-weight: 500;\n}\n\n#gene-expr-vplot-svg text.violin-axis-label {\n    font-size: 12px;\n}\n\n#gene-expr-vplot-svg text.violin-legend-text {\n    font-size: 11.5px;\n    fill: Black;\n    font-weight: 500;\n}\n\n#gene-expr-vplot-svg path.violin.outlined {\n    stroke-width: 1.2px;\n    stroke: rgba(170, 170, 170, 0.9);\n}\n\n#gene-expr-vplot-svg path.violin.highlighted {\n    stroke-width: 2px;\n    stroke: rgba(85, 95, 102, 1);\n}\n\n#gene-expr-vplot-svg path.violin.highlighted.outlined {\n    stroke-width: 2px;\n    stroke: rgba(85, 95, 102, 1);\n}\n";
styleInject(css_248z$4);

var css_248z$3 = "/**\n * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.\n * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)\n */\ntext.color-legend {\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n    font-size: 10px;\n}\n\ntext.half-map-label {\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n    font-size: 10px;\n}\ntext.half-map-label.highlighted {\n    font-weight: 400;\n    font-size: 12px;\n    text-decoration: underline;\n}\n\ndiv.half-map-tooltip {\n   min-width: 100px;\n   display: none;\n   background-color : rgba(32, 53, 73, 0.95);\n   padding: 10px;\n   text-align:left;\n   color: #ffffff;\n   position:absolute;\n   font-size:12px;\n   z-index:4000;\n   border-radius:5px;\n}\n\n\n\n";
styleInject(css_248z$3);

var css_248z$2 = "/**\n * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.\n * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)\n */\n/*#iso-menu.a {*/\n    /*color: #239db8*/\n/*}*/\n/*#isomenu.item {*/\n    /*!*color: #239db8 !important;*!*/\n    /*cursor: pointer;*/\n/*}*/\n\n.nav-link{\n    cursor: pointer;\n}\n.junc {\n    /*cursor: pointer;*/\n}\n\n.junc.highlighted {\n    stroke: rgb(201, 2, 13);\n    stroke-width: 5px;\n}\n\n.junc-curve {\n    stroke-width: 1px;\n    fill: none;\n}\n\n.junc-curve.highlighted {\n    stroke: rgb(239, 59, 44);\n    stroke-width: 2px;\n    fill: none;\n}\n\n.intron {\n    stroke: rgb(85, 95, 102);\n    stroke-width: 1px;\n    /*stroke-dasharray: 10,5;*/\n}\n\n.exon {\n    stroke: rgb(75, 134, 153);\n    fill: none;\n    stroke-width: 1px;\n    stroke-dasharray: 0.9;\n}\n\n.exon.highlighted {\n    stroke: rgb(239, 59, 44);\n    stroke-width: 5px;\n    fill: none;\n    stroke-dasharray: none;\n}\n\n.exon-curated {\n    cursor: pointer;\n    stroke-width: 2px;\n    stroke: rgb(85, 95, 102);\n}\n\n.exon-curated.highlighted, .intron.highlighted{\n    stroke: rgb(210, 17, 27);\n    stroke-width: 2px;\n}\n\n/*temporary solution*/\n#modelLabel, #lolliLabel {\n    font-family: \"Open Sans\", \"Helvetica\", sans-serif;\n    font-size: 9px;\n}\n#modelInfo {\n    font-family: \"Open Sans\", \"Helvetica\", sans-serif;\n}\n\n.lollipop-axis line, .lollipop-axis path{\n  fill: none;\n  stroke: #a9a9a9;\n  shape-rendering: crispEdges;\n}\n\n.lollipop-axis text {\n    fill: #a9a9a9;\n}\n\n";
styleInject(css_248z$2);

var css_248z$1 = "/**\n * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.\n * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)\n */\n.tissue-group-main-level {\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n    margin:0;\n    padding:0;\n    font-size: 12px;\n}\n.tissue-group-sub-level {\n    margin: 0 0 0 16px;\n    padding: 0;\n    font-size: 9px;\n}\n.last-site {\n    margin-bottom: 10px;\n}\n";
styleInject(css_248z$1);

var css_248z = "/**\n * Copyright © 2015 - 2018 The Broad Institute, Inc. All rights reserved.\n * Licensed under the BSD 3-clause license (https://github.com/broadinstitute/gtex-viz/blob/master/LICENSE.md)\n */\n.violin-x-axis line, .violin-y-axis line, .violin-x-axis path, .violin-y-axis path{\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n    fill: none;\n    stroke: Silver;\n    stroke-width: 1px;\n    shape-rendering: crispEdges;\n}\n\n.violin-x-axis text, .violin-y-axis text, .violin-x-axis-hide text {\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n    fill: #2a718b;\n}\n\n.violin-size-axis text {\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n    fill: #239db8;\n    font-size: 8px;\n}\n\n.violin-size-axis-hide text {\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n    fill: #239db8;\n    font-size: 11px;\n}\n\n.violin-x-axis-hide line, .violin-x-axis-hide path{\n    fill: none;\n    stroke: Silver;\n    stroke-width: 0;\n    shape-rendering: crispEdges;\n}\n\n.violin-size-axis-hide line, .violin-size-axis-hide path{\n    fill: none;\n    stroke: Silver;\n    stroke-width: 0;\n    shape-rendering: crispEdges;\n}\n\n.violin-sub-axis line, .violin-sub-axis path{\n    stroke-width: 1px;\n    stroke: Silver;\n    shape-rendering: crispEdges;\n}\n\n.violin-sub-axis-hide line, .violin-sub-axis-hide path{\n    stroke-width: 0;\n    stroke: Silver;\n    shape-rendering: crispEdges;\n}\n\n.violin-sub-axis text, .violin-sub-axis-hide text {\n    fill: SlateGray;\n    font-size: 12px;\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n\n}\n\n.violin-axis-label {\n    fill: SlateGray;\n    font-size: 12px;\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n}\n.violin-group-label {\n    font-size: 12px;\n    text-anchor: middle;\n}\n\ndiv.violin-tooltip {\n   min-width: 50px;\n   display: none;\n   background-color : rgba(32, 53, 73, 0.95);\n   padding: 10px;\n   text-align:left;\n   color: #ffffff;\n   position:absolute;\n   font-size:12px;\n   z-index:4000;\n   border-radius:5px;\n}\n\npath.violin.highlighted {\n    stroke-width: 2px;\n    stroke: #555f66;\n}\n\nline.violin-median {\n    stroke-width: 2px;\n    stroke: #fff;\n}\n\nrect.violin-ir {\n    fill: #555f66;\n    stroke-width: 0;\n}\n\ntext.violin-legend-text {\n    fill: SlateGray;\n    font-size: 9px;\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n\n}\n\n.violin-outliers circle {\n    stroke: #aaaaaa;\n    fill: none;\n}\n\n.violin-points circle {\n    stroke: #aaaaaa;\n    fill: #aaaaaa;\n}\n\n.violin-title {\n    font-size: 16px;\n    font-family: \"Open Sans\", \"Helvetica\", \"Arial\", sans-serif;\n}\n\n\n\n\n";
styleInject(css_248z);

exports.EqtlDashboard = EqtlDashboard;
exports.ExpressionMap = ExpressionMap;
exports.ExpressionViolinPlot = ExpressionViolinPlot;
exports.GTExViz = GTExViz;
exports.GeneExpressionViolinPlot = GeneExpressionViolinPlot;
exports.IqtlScatterPlot = IqtlScatterPlot;
exports.LocusBrowser = LocusBrowser;
exports.LocusBrowserVC = LocusBrowserVC$1;
exports.QtlViolinPlot = QtlViolinPlot;
exports.SingleCellExpressionViolinPlot = SingleCellExpressionViolinPlot;
exports.SingleCellMultiGeneAPM = SingleCellMultiGeneAPM;
exports.TranscriptBrowser = TranscriptBrowser;
