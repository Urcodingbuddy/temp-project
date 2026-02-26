// Extend Array prototype
if (!Array.prototype.first) {
  Array.prototype.first = function () {
    return this.length > 0 ? this[0] : undefined;
  };
}

if (!Array.prototype.last) {
  Array.prototype.last = function () {
    return this[this.length - 1];
  };
}

if (!Array.prototype.isEmpty) {
  Array.prototype.isEmpty = function () {
    return this.length <= 0;
  };
}

// Extend String prototype
if (!String.prototype.isEmpty) {
  String.prototype.isEmpty = function () {
    return this.trim().length <= 0;
  };
}

if (!String.prototype.replaceField) {
  String.prototype.replaceField = function (field) {
    return this.replace(/\${field}/, field);
  };
}

if (!String.prototype.replaceFieldLength) {
  String.prototype.replaceFieldLength = function (field, len) {
    const newString = this.replace(/\${field}/, field);
    return newString.replace(/\${length}/, len.toString());
  };
}

if (!String.prototype.replaceActionField) {
  String.prototype.replaceActionField = function (action, field) {
    const newString = this.replace(/\${action}/, action);
    return newString.replace(/\${field}/, field);
  };
}

if (!String.prototype.replaceField1And2) {
  String.prototype.replaceField1And2 = function (field1, field2) {
    const newString = this.replace(/\${field1}/, field1);
    return newString.replace(/\${field2}/, field2);
  };
}

if (!String.prototype.removeUnderScore) {
  String.prototype.removeUnderScore = function () {
    return this.replace(/_/g, ' ');
  };
}
