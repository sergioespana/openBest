// ########################
// General script for the tool
// ########################

// Create firestore (database) object
var db = firebase.firestore();

// userEmail is used to match the email of the current user to the database of users
var userEmail;
var userName;
// userPath and dName are used to determine the domain of the current user
var userPath;
var dName;

// Variable that stores if a domain has been instantiated
var domainInstantiated;

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
      userName = user.displayName;
      let usercard = document.getElementById("user-card");
      let admincard = document.getElementById("administrator-card");
      let admintext = document.getElementById("admin-text");

      checkUser(function() {

        // Checking if this person is the administrator
        if(dName){
          db.collection(`${dName[0]}`).doc(`${dName[1]}`)
            .onSnapshot(function(doc) {
              // Setting the domain name
              domainName.innerHTML = doc.data().name;

              if(doc.data().administrator == userEmail){
                let admincard = document.getElementById("administrator-card");
                let usercard = document.getElementById("user-card");

                if(admincard){
                  admincard.style.display = "inline-block";
                  usercard.setAttribute('class', 'col-lg-6 mb-4');
                }
              }
            });

            // If dName is null, then the user belongs to no domain
            // Otherwise, display the user actions
            if(dName && usercard){
              domainInstantiated = true;
              usercard.style.display = "inline-block";
            }
          }

          // If the user belongs to no domain
          if(!(dName)){
            domainInstantiated = false;
            admincard.style.display = "inline-block";
            admintext.textContent = "You are currently not assigned to any domain. Create a domain here.";
          }
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
      });
    })

  await delay();
  callback();
}

function delay() {
  return new Promise(resolve => setTimeout(resolve, 600));
}


// Finds the collectionpath that corresponds to a wildcard filter
function findPath(array, filter) {
  var result = array.filter(function(item){
    return typeof item == 'string' && item.indexOf(filter) > -1;            
  });
  // The first item is 
  return result[0];
}