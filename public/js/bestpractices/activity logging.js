// ########################
// Measures activity
// ########################

var db = firebase.firestore();
let activityloc

async function addactivity(useremail, userrole ,action, entitytype, entityid, date) {
    extractJSON(domainjson, 0, '');
    let activityloc = await findPath(collectionPaths, 'activitylogs') + '/'
    await db.collection(activityloc).add({
        "2user": useremail,
        "3userrole": userrole,
        "4action": action,
        "5entitytype": entitytype,
        "6entityid": entityid,
        "7date": date,

    }).then(docRef => {
        console.log('activity logged', useremail, userrole, action, entitytype, entityid, date);
    })
}

if (document.getElementById('popbut')) {
    var downloadbutton = document.createElement("a");
    downloadbutton.type = "button";
    downloadbutton.addEventListener("click", async function () { await CreateExcel() });
    downloadbutton.setAttribute('class', 'btn btn-light btn-icon-split');
    downloadbutton.appendChild(createspan('Download usage logs'));
    downloadbutton.style.marginRight = '10px';
    document.getElementById('popbut').appendChild(downloadbutton);


    var bpdownloadbutton = document.createElement("a");
    bpdownloadbutton.type = "button";
    bpdownloadbutton.addEventListener("click", async function () { await CreateBPExcel() });
    bpdownloadbutton.setAttribute('class', 'btn btn-light btn-icon-split');
    bpdownloadbutton.appendChild(createspan('Download bp logs'));
    bpdownloadbutton.style.marginRight = '10px';
    document.getElementById('popbut').appendChild(bpdownloadbutton)


}

async function CreateExcel() {
    extractJSON(domainjson, 0, '');
    let activityloc = await findPath(collectionPaths, 'activitylogs') + '/'
    let csvContent = "data:text/csv;charset=utf-8,";
    let rows = [];
    await db.collection(activityloc).get().then(async function (snapshot) {
        snapshot.docs.forEach(doc =>{
            rows.push( Object.assign({"id" : doc.id}, doc.data()));
        })
    })
    let csvString = "data:text/csv;charset=utf-8," + [
        [
            "ID",
            "user",
            "userrole",
            "action",
            "entitytype",
            "entityid",
            "day",
            "date"
        ],
        ...rows.map(item => [
            item["id"],
            item["2user"],
            item["3userrole"],
            item["4action"],
            item["5entitytype"],
            item["6entityid"],
            item["7date"]
        ])
    ]
        .map(e => e.join(","))
        .join("\n");

    var encodedUri = encodeURI(csvString);
    window.open(encodedUri);
}



async function CreateBPExcel() {
    extractJSON(domainjson, 0, '');
    let activityloc = await findPath(collectionPaths, 'bestpractices') + '/'
    let csvContent = "data:text/csv;charset=utf-8,";
    let rows = [];
    await db.collection(activityloc).get().then(async function (snapshot) {
        snapshot.docs.forEach(doc =>{
            rows.push( Object.assign({"id" : doc.id}, doc.data()));
        })
    })
    let csvString = "data:text/csv;charset=utf-8," + [
        [
            "ID",
            "Title"
       
        ],
        ...rows.map(item => [
            item["id"],
            item["10title"]
        ])
    ]
        .map(e => e.join(","))
        .join("\n");

    var encodedUri = encodeURI(csvString);
    window.open(encodedUri);
}

