// ONLY RELEVANT FOR THE LOGIN PAGE

// Authentication constant
const auth = firebase.auth();

// Current user logged in
var user = firebase.auth().currentUser;

auth.onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    window.location.replace("../index");
  } else {
    // No user is signed in.
  }
});

// Sign up or log in
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(result => {
  })
}