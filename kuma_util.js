var KumaUtil = {

  nextInArray: function(_element, _array) {
    var index = _array.indexOf(_element);
    if (index < 0) {
      return null;
    }
    return _array[index >= _array.length - 1 ? 0 : index + 1];
  },

  zeroLeftPad: function(x, numTotalChars) {
    return ('0' + x).substr(-numTotalChars);
  },
};

