var HtmlUtil = {

  createElementOption : function(label, value) {
    if (typeof value === 'undefined') {
      value = label;
    }
    var option = document.createElement('option');
    option.setAttribute('value', value);
    option.innerText = label;
    return option;
  },

  removeAllChildren : function(_element) {
    while (_element.firstChild) {
      _element.removeChild(_element.firstChild);
    }
  },
};
