function Database() {
  this._enabled = FirebaseUtil.isFirebaseEnabled();
  if (this._enabled) {
    var configFirebase = configApplication.firebase;
    FirebaseUtil.initialize(configFirebase.initializingParameters);
    var da = configFirebase.databaseAccount;
    this._authenticateForFirebase(da.email, da.password);

    this._refMoveBooks       = firebase.database().ref(FIREBASE_KEY_MOVEBOOKS);
    this._refMoveBookHeaders = firebase.database().ref(FIREBASE_KEY_MOVEBOOK_HEADERS);
    this._cursorForFirebase = 1;
  }
}

const FIREBASE_KEY_MOVEBOOKS        = 'data/moveBooks';
const FIREBASE_KEY_MOVEBOOK_HEADERS = 'data/moveBookNames';

Database.prototype = {

  _authenticateForFirebase : function(email, password) {
    FirebaseUtil.authenticate(email, password, function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert('Login to Firebase failed by "' + errorCode + '"\n' + errorMessage);
    });
  },

  writeMoveBook : function(moveBookInHash) {
    database.promiseToReadMoveBookHeaders().then(function(headers) {
      var names = Object.values(headers).map(function(obj) { return obj.name; });
      if (names.indexOf(moveBookInHash.name) >= 0 && moveBookInHash.firebaseKey === null) {
        alert('同じ名前の記録帳があります。上書きできません。');
      } else {
        var obj = Object.assign({}, moveBookInHash);
        var ref = this._refMoveBooks.push();
        var key = ref.key;
        ref.set(obj);
        delete obj.moveSets;
        var updates = {};
        updates[key] = obj;
        this._refMoveBookHeaders.update(updates);
      }
    }).catch(function(reason) {
      alert('Failed to read from Firebase: ' + reason);
    });
  },

  promiseToReadMoveBook : function(key) {
    var refMoveBook = this._refMoveBooks.child(key);
    var promiseMoveBooks = refMoveBook.once('value');
    this._cursorForFirebase++;
    return new Promise(function(resolve, reject) {
      promiseMoveBooks.then(function(snapshot) {
        resolve(snapshot.val());
      });
    });
  },

  promiseToReadMoveBookHeaders : function() {
    var refMoveBookHeaders = this._refMoveBookHeaders.orderByKey();
    var promiseMoveBookHeaders = refMoveBookHeaders.once('value');
    return new Promise(function(resolve, reject) {
      promiseMoveBookHeaders.then(function(snapshot) {
        resolve(snapshot.val());
      });
    });
  },

  get enabled () {
    return this._enabled;
  }
};
