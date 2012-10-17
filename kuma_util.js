var Kuma = {

  nextInArray: function(_element, _array) {
    index = _array.indexOf(_element);
    if (index < 0) {
      return null;
    }
    return _array[index >= _array.length - 1 ? 0 : index + 1];
  }
};

