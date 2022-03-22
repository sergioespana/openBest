// ########################
// Creates a modal for entering users and storing them
// ########################

// Create firestore (database) object
var db = firebase.firestore();

const Userform = document.querySelector('#user-entry-form');

let userpath

// The modal and button to display it
var usermodal = document.getElementById("user-modal");
var userbtn = document.getElementById("add-user-btn");
// Span elements closes the modal
var userspan = document.getElementById("user-close");
// name
let namespan = document.getElementById("input-user-name");
// email
let emailspan = document.getElementById("input-user-email");
// role
let rolespan = document.getElementById("role");
// choice (also create author account for user..)
let choicespan = document.getElementById("makeauthor");


// ############################################





// displaying the modal
if (userbtn) {
    userbtn.onclick = function () {
        usermodal.style.display = "block";
    }
}

// check if form is complete and if so add user.
// add author iff the administrator selected make author also
document.getElementById("store-user-btn").addEventListener("click", async function () {
    let values = [emailspan.value.toLowerCase(), namespan.value, rolespan.value]
    if (values.includes('')) { alert('Please fill in all fields') }
    else {
        addUser()
        if (choicespan.value == "affirmative") {
            addauthor_()
        }

    }
})

// Closing the modal
userspan.onclick = function () {
    usermodal.style.display = "none";
}

// function for adding a user
async function addUser() {
    extractJSON(domainjson, 0, '');
    userpath = findPath(collectionPaths, 'users') + '/';
    //check if there is already an account for this user
    await db.collection(userpath).where('email', '==', emailspan.value.toLowerCase()).get().then(snapshot => {
        amt = snapshot.size;
    })
    // if no account exists, create one
    if (amt == 0) {
        db.collection(userpath).add({
            email: emailspan.value.toLowerCase(),
            name: namespan.value,
            role: rolespan.value,
            hasaccessed: 'false'
        }).then(
            alert('User added'),
            addactivity(userEmail, userRole, 'add user', 'user', 'not recorded', getcurrentDateTime())
        )
    }
    // else show that there is already an account for this user
    else {
        alert('There is already a user associated with that emailadress');
    }
}

// function for adding an author
async function addauthor_() {
    extractJSON(domainjson, 0, '');
    authorpath = findPath(collectionPaths, 'authors') + '/';
    //check if there is already an account for this user
    await db.collection(authorpath).where('email', '==', emailspan.value.toLowerCase()).get().then(snapshot => {
        amt = snapshot.size;
    })
    // if no account exists, create one
    if (amt == 0) {
        db.collection(authorpath).add({
            email: emailspan.value.toLowerCase(),
            name: namespan.value,
            relationship: []
        }).then(
            console.log('author posted'),
            alert('Author added'),
            addactivity(userEmail, userRole, 'add author', 'author', 'not recorded', getcurrentDateTime())
        )
    }
    // else show that there is already an account for this user
    else {
        alert('There is already an author associated with that emailadress');
    }
}


