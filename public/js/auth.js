// Authentication constant
const auth = firebase.auth();

// Current user logged in
var user = firebase.auth().currentUser;

auth.onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    //Update user name and photo
    document.getElementById("username").innerHTML = user.displayName;
    document.getElementById("profilepicture").src = user.photoURL;
    hideLoadScreen();
    //for the dev tools
    //change email to domain administrator if needed
    if (user.email == 'stefanvanderpijl@gmail.com'){
      let place = document.getElementById("popbut");
      // make sure we are on the index page, thats where the dev tools should be displayed.
      if(place){
      place.append(tbl)
      }
      

    }
  } else {
    // No user is signed in.
    window.location.replace("../login.html");
  }
});

// Hiding the load screen if the user is logged in and page finished loading
function hideLoadScreen() {
  var loadscreen = document.getElementById("loadscreen");
  loadscreen.style.display = "none";
}

// Sign up or log in
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth().signInWithPopup(provider).then(result => {
    console.log(result)
  })
}

// Log out
function logOut() {
  firebase.auth().signOut();
}