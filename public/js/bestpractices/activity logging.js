// ########################
// Measures activity
// ########################

var db = firebase.firestore();
let activityloc


async function addactivity(useremail, action, bpid,date) {
    extractJSON(domainjson, 0, '');

    activityloc = await findPath(collectionPaths, 'activitylogs') + '/'
    await db.collection(activityloc).add({
        "2user": useremail,
        "3action": action,
        "4bpid": bpid,
        "5date": date,
        
    }).then(docRef => {
        console.log('activity logged', useremail, action, bpid, date);
    })

}


