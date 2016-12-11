function Database() {
  this._enabled = FirebaseUtil.isFirebaseEnabled();
  if (this._enabled) {
    var configFirebase = configApplication.firebase;
    FirebaseUtil.initialize(configFirebase.initializingParameters);
    var da = configFirebase.databaseAccount;
    this._authenticateForFirebase(da.email, da.password);

    this._refMoveBooks     = firebase.database().ref(FIREBASE_KEY_MOVEBOOKS);
    this._refMoveBookNames = firebase.database().ref(FIREBASE_KEY_MOVEBOOK_NAMES);
    this._cursorForFirebase = 1;
  }
}

const FIREBASE_KEY_MOVEBOOKS      = 'data/moveBooks';
const FIREBASE_KEY_MOVEBOOK_NAMES = 'data/moveBookNames';

Database.prototype = {

  _authenticateForFirebase : function(email, password) {
    FirebaseUtil.authenticate(email, password, function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert('Login to Firebase failed by "' + errorCode + '"\n' + errorMessage);
    });
  },

  writeMoveBook : function(moveBookInHash) {
    var obj = Object.assign({}, moveBookInHash);
    var ref = this._refMoveBooks.push();
    var key = ref.key;
    ref.set(obj);
    delete obj.moveSets;
    var updates = {};
    updates[key] = obj;
    this._refMoveBookNames.update(updates);
  },

  promiseToReadMoveBook : function() {
    var refLastMoveBook = this._refMoveBooks.orderByKey().limitToLast(this._cursorForFirebase);
    var promiseMoveBooks = refLastMoveBook.once('value');
    this._cursorForFirebase++;
    return new Promise(function(resolve, reject) {
      promiseMoveBooks.then(function(snapshot) {
        var objMoveBook = snapshot.val();
        if (Array.isArray(objMoveBook)) {
          objMoveBook = objMoveBook[0];
        }
        resolve(Object.values(objMoveBook)[0]);
      });
    });
  },

  get enabled () {
    return this._enabled;
  }
};
