// ########################
// General script for the tool
// ########################

// Create firestore (database) object
var db = firebase.firestore();

// userEmail is used to match the email of the current user to the database of users
var userEmail;
// userPath and dName are used to determine the domain of the current user
var userPath;
var dName;

// ############################################


function toggleMenu() {
    var x = document.getElementById("dropdown-content");
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
}

// Finding the domain for the currently logged in user
$(document).ready(function() {
  domainName = document.getElementById("domain-name");

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      userEmail = user.email;

      checkUser(function() {

        // Checking if this person is the administrator
        db.collection(`${dName[0]}`).doc(`${dName[1]}`)
          .onSnapshot(function(doc) {
            if(doc.data().administrator == userEmail){
              console.log("administrator")

              let createInstanceBtn = document.getElementById("create-instance-btn");
        
              if(createInstanceBtn){
                createInstanceBtn.style.display = "inline-block";
              }
            }
          });
      });
      
    }
  });
  
});


async function checkUser(callback) {
  // A collection group query is used to search across the WHOLE DATABASE for the "email" field in a "users" subcollection
  // Regardless of the domain
  // This collection group index is manually created in the Firebase console
  db.collectionGroup('users')
    .where('email', '==', userEmail)
    .get().then(function (snapshot) {
      snapshot.docs.forEach(doc => {
        // The path to the users group of the currently logged in user
        userPath = doc.ref.parent.path;
        dName = userPath.split("/");

        // Setting the domain name display
        domainName.innerHTML = dName[0];
      });
    })

  await delay();
  callback();
}

function delay() {
  return new Promise(resolve => setTimeout(resolve, 600));
}