// ########################
// General script for the tool
// ########################

// Create firestore (database) object
var db = firebase.firestore();

var administrators = ['stefanvanderpijl@gmail.com']

// userEmail is used to match the email of the current user to the database of users
var userEmail;
var userName;
// userPath and dName are used to determine the domain of the current user
var userPath;
var userRole;
var hasAcessed;
var userDocID;
var dName;
// domainjson is the domain model of the domain of the user retrieved from the db
var domainjson;

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
$(document).ready(function () {
  domainName = document.getElementById("domain-name");

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      userEmail = user.email;
      userName = user.displayName;
      let usercard = document.getElementById("user-card");
      let admincard = document.getElementById("administrator-card");
      let admintext = document.getElementById("admin-text");
      checkUser(
        async function () {
          if (hasAcessed == "false") {

            let newusermodal = document.getElementById("new-user-modal");
            let accept = document.getElementById("accept-btn")
            let decline = document.getElementById("decline-btn");

            newusermodal.style.display = 'block';
            accept.onclick = function () {
              newusermodal.style.display = "none";
              extractJSON(domainjson, 0, '');
              userpath = findPath(collectionPaths, 'users') + '/'
              db.collection(userpath).doc(userDocID).update({
                hasaccessed: "true"
              })
            }
            decline.onclick = function () {
              logOut()
            }
          }

          // Checking if this person an administrator
          if (dName) {
            await db.collection(`${dName[0]}`).doc(`${dName[1]}`).onSnapshot(function (doc) {
              // Setting the domain name
              domainName.innerHTML = doc.data().name;
              // check if person is administrator
              if (userRole === 'administrator' || administrators.includes(userEmail)) {

               
                let usermanagement = document.getElementById("administrator-card_");
                if (usermanagement) {
                  usermanagement.style.display = "inline-block";
                  usermanagement.setAttribute('class', 'col-lg-6 mb-4');
                }
              }
              if (administrators.includes(userEmail)) {

                let admincard = document.getElementById("administrator-card");
                let usercard = document.getElementById("user-card");

                if (admincard) {
                  admincard.style.display = "inline-block";
                  usercard.setAttribute('class', 'col-lg-6 mb-4');
                }
              }
            });


            

            // If dName is null, then the user belongs to no domain
            // Otherwise, display the user actions
            if (dName && usercard) {
              domainInstantiated = true;
              usercard.style.display = "inline-block";
            }
            if (dName) {
              let menuItemBP = document.getElementById("menu-bp-item");
              //  let menuItemToc = document.getElementById("menu-toc-item");
              menuItemBP.style.display = "inline";
              //  menuItemToc.style.display = "inline";
    
            }
          }
          let developercard = document.getElementById("developer-card");
          if (developers.includes(userEmail) && dName && developercard) {

            developercard.style.display = "inline-block";
          }

          // If the user belongs to no domain
          if (!(dName)) {
            domainInstantiated = false;
            if (admincard || admintext) {
              admincard.style.display = "inline-block";
              admintext.textContent = "You are currently not assigned to any domain. Create a domain here.";
            }


            if (window.location.pathname == '/bestpractices.html/?') {
              
              let selectedbpid_ = urlParams.get('BPid')
              let qr_ = urlParams.get('QR')
              console.log(selectedbpid_)
              await delay()
              window.location.replace("/index.html");
            }

            // If the user belongs to no domain, refer to the index page
            if (window.location.pathname == '/bestpractices.html') { //|| window.location.pathname == '/toc.html') {
              window.location.replace("/index.html");
            }
          }
        });
    }
  });

});
async function checkUser(callback) {
  // A collection group query is used to search across the WHOLE DATABASE for the "email" field in a "users" subcollection
  // Regardless of the domain
  // This collection group index is manually created in the Firebase console
  // all users...
  await db.collectionGroup('users').get().then(async function (snapshot) {
    snapshot.docs.forEach(doc => {
      let localemail = String(userEmail).valueOf().replaceAll(" ", "")
      let serveremail = String(doc.data().email).valueOf().replaceAll(" ", "")
      if (localemail === serveremail) {
        userPath   = doc.ref.parent.path
        userRole   = doc.data().role
        hasAcessed = doc.data().hasaccessed
        userDocID  = doc.id
      }
    });
    //new authorization
    //if a user exists, get the path to the domain and retrieve the domain model string and replace the reference string with the model string. Hence overwriting the static model with a dynamic model fitting the users domain.
    if (userPath) {
      dName = userPath.split("/");;
      let domain = userPath.split("/")[0];
      let domainstate = userPath.split("/")[1];
      let domainmodel = await db.collection(domain).doc(domainstate).get();
      domainjson = domainmodel.data().model;
      addactivity(userEmail, userRole ,'Open page','page',window.location.pathname, getcurrentDateTime())
    }
    else {
      //user does not exist yet...
    }
  })
  
  callback();
}

function delay() {
  return new Promise(resolve => setTimeout(resolve, 600));
}


function waitFordomainjson_app() {
  //if domain is already loaded:
  if (typeof domainjson !== "undefined") {
    return new Promise(resolve => setTimeout(resolve, 1));
  }
  //else wait and try again:
  else {
    setTimeout(waitFordomainjson_app, 250);
  }
}



// Finds the collectionpath that corresponds to a wildcard filter
function findPath(array, filter) {
  var result = array.filter(function (item) {
    return typeof item == 'string' && item.indexOf(filter) > -1;
  });
  // The first item is 
  return result[0];
}


function getcurrentDateTime() {
  var date = new Date();
  return (date.toUTCString());
}

async function awaitdomainJSON(){
  if (typeof domainjson === "undefined"){
         await delay();
         awaitdomainJSON();
      }
  else{
      return new Promise((resolve)=>{
          resolve();})
  }
 
}


