// This file contains the functions that are used to let the user join the conference domain this reduces the difficulty of adding users beforehand
var applybutton = document.getElementById("add-user-btn2");

applybutton.addEventListener("click", async function () {
  await addUserRCIS();
  await addauthorRCIS(); 
  await addactivityRCIS(userEmail, getcurrentDateTime());
  await delay(50);
  alert('Your have been admitted to the RCIS group, this page will now refresh automatically');
  location.reload();
})


// these are adapted functions from add-user and add-author. they are temporary.
async function addUserRCIS() {
  userpath = '/RCIS/domainstate/users/'
  //check if there is already an account for this user
  await db.collection(userpath).where('email', '==', userEmail.toLowerCase()).get().then(snapshot => {
      amt = snapshot.size;
  })
  //if no account exists, create one
  if (amt == 0) {
    await  db.collection(userpath).add({
          email: userEmail,
          name: userName,
          role: 'user',
          hasaccessed: 'false'
      })
  }
}

// function for adding an author
async function addauthorRCIS() {
  authorpath = '/RCIS/domainstate/authors/'
  //check if there is already an account for this user
  await db.collection(authorpath).where('email', '==', userEmail.toLowerCase()).get().then(snapshot => {
      amt = snapshot.size;
  })
  // if no account exists, create one
  if (amt == 0) {
   await   db.collection(authorpath).add({
          email: userEmail,
          name: userName,
          relationship: []
      })
  }   
}

async function addactivityRCIS(useremail, date) {
    let activityloc = "/RCIS/domainstate/activitylogs/"
    await db.collection(activityloc).add({
        "2user": useremail,
        "3userrole": 'user',
        "4action": 'Apply for domain via button',
        "5entitytype": 'domain',
        "6entityid": 'RCIS',
        "7date": date,

    }).then(docRef => {
        console.log('activity logged', useremail, 'user', 'apply for domain via button', 'domain', 'RCIS', date);
    })
}
