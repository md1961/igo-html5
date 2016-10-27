var FirebaseUtil = {

  isFirebaseEnabled : function() {
    return typeof firebase !== 'undefined';
  },

  initialize : function(parameters) {
    firebase.initializeApp(parameters);
  },

  authenticate : function(email, password, failCallback) {
    firebase.auth().signInWithEmailAndPassword(email, password).catch(failCallback);
  },
};
