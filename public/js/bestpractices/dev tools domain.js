// ########################
// Populates the domain following the structure defined for the  PwC, take note that this means that it only works for that domain
// ########################
// "Greenoffice UU/domainstate"
// To be able to see the dev tools please change the email adress in auth.js to your own emailadress.

var db = firebase.firestore();
let domainstate


window.onload = function () {
    waitFordomainjson_domain()
}

async function waitFordomainjson_domain() {
    //if domain is already loaded:
    if (typeof domainjson !== "undefined") {
        // First initialization of datatable before BPs are retrieved from database
        extractJSON(domainjson, 0, '');
        domainstate = await findPath(documentPaths, 'domainstate') + '/'
    }
    //else wait and try again:
    else {
        setTimeout(waitFordomainjson_domain, 250);
    }
}



var tbl = document.createElement('table');
let tbody = document.createElement('tbody');

tbl.appendChild(tbody);

var popbutton1 = document.createElement("a");
popbutton1.type = "button";
popbutton1.addEventListener("click", async function () { await addAuthors() });
popbutton1.setAttribute('class', 'btn btn-light btn-icon-split');
popbutton1.appendChild(createspan('Populate Authors'))
popbutton1.style.marginRight = '10px';

var popbutton2 = document.createElement("a");
popbutton2.type = "button";
popbutton2.addEventListener("click", async function () {});
popbutton2.setAttribute('class', 'btn btn-light btn-icon-split');
popbutton2.appendChild(createspan('Populate Themes'));
popbutton2.style.marginRight = '10px';


var popbutton3 = document.createElement("a");
popbutton3.type = "button";
popbutton3.addEventListener("click", async function () { await addUsers() });
popbutton3.setAttribute('class', 'btn btn-light btn-icon-split');
popbutton3.appendChild(createspan('Populate Users'));
popbutton3.style.marginRight = '10px';

var popbutton4 = document.createElement("a");
popbutton4.type = "button";
popbutton4.addEventListener("click", async function () { await addBPs(); });
popbutton4.setAttribute('class', 'btn btn-light btn-icon-split');
popbutton4.appendChild(createspan('Populate best practices'))
popbutton4.style.marginRight = '10px';

var fileselec = document.createElement("INPUT");
fileselec.type = "file";
fileselec.id = "fileUpload";
fileselec.style.display = "none";

var fileseleclabel = document.createElement("label")
fileseleclabel.setAttribute('for', 'fileUpload');
fileseleclabel.style.display = 'inline-block'
fileseleclabel.setAttribute('class', 'btn btn-light btn-icon-split');
fileseleclabel.appendChild(createspan('Upload Excel'))
fileseleclabel.style.marginRight = '10px';


var probutton = document.createElement("a");
probutton.type = "button";
probutton.addEventListener("click", function () { UploadProcess() });
probutton.setAttribute('class', 'btn btn-light btn-icon-split');
probutton.appendChild(createspan('Upload'))
probutton.style.marginRight = '10px';


let row_1 = document.createElement('tr');
let row_1_data_1 = document.createElement('td');
row_1_data_1.appendChild(popbutton1);
let row_1_data_2 = document.createElement('td');
row_1_data_2.appendChild(popbutton2);
let row_1_data_3 = document.createElement('td');
row_1_data_3.appendChild(popbutton3);

row_1.appendChild(row_1_data_1);
row_1.appendChild(row_1_data_2);
row_1.appendChild(row_1_data_3);
tbody.appendChild(row_1);


// Creating and adding data to third row of the table
let row_2 = document.createElement('tr');
let row_2_data_1 = document.createElement('td');
row_2_data_1.appendChild(fileselec);
row_2_data_1.appendChild(fileseleclabel);

let row_2_data_2 = document.createElement('td');
row_2_data_2.appendChild(probutton);
let row_2_data_3 = document.createElement('td');
row_2_data_3.appendChild(popbutton4);

row_2.appendChild(row_2_data_1);
row_2.appendChild(row_2_data_2);
row_2.appendChild(row_2_data_3);
tbody.appendChild(row_2);

var bestpractices = [];

function UploadProcess() {
    //Reference the FileUpload element.
    var fileUpload = document.getElementById("fileUpload");
    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();
            //For Browsers other than IE.
            if (reader.readAsBinaryString) {
                reader.onload = function (e) {
                    bestpractices = GetTableFromExcel(e.target.result);
                };
                reader.readAsBinaryString(fileUpload.files[0]);
            } else {
                //For IE Browser.
                reader.onload = function (e) {
                    var data = "";
                    var bytes = new Uint8Array(e.target.result);
                    for (var i = 0; i < bytes.byteLength; i++) {
                        data += String.fromCharCode(bytes[i]);
                    }
                    bestpractices = GetTableFromExcel(data);
                };
                reader.readAsArrayBuffer(fileUpload.files[0]);
            }
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid Excel file.");
    }
};

function GetTableFromExcel(data) {
    //Read the Excel File data in binary
    var workbook = XLSX.read(data, {
        type: 'binary'
    });
    //get the name of First Sheet.
    var Sheet = workbook.SheetNames[0];
    //Read all rows from First Sheet into an JSON array.
    return excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[Sheet]);
};


async function addAuthors() {
    let doelstring = domainstate + 'authors' + '/';
    let list = [
    ]
    for (authorname of list) {
        //write author to db
        await db.collection(doelstring).add({
            name: authorname,
            relationship: []
        }).then(docRef => {
            console.log('author', authorname, ' is added under ID ', docRef.id);
        })
    }
}

async function addUsers() {
    let doelstring = domainstate + 'users' + '/';
    let list = []
    for (username of list) {
        //write author to db
        await db.collection(doelstring).add({
            name: username,
            relationship: []
        }).then(docRef => {
            console.log('user', username, ' is added under ID ', docRef.id);
        })
    }
}



async function addAuthor(authorname) {
    let doelstring = domainstate + 'authors' + '/';
    let author = null;
    //write author to db
    await db.collection(doelstring).add({
        name: authorname,
        relationship: []
    }).then(docRef => {
        console.log('author is added under ID ', docRef.id);
        author = docRef.id;

    })
    return (author);

}

async function findAuthor(authorname) {
    let doelstring = domainstate + 'authors' + '/';
    let author = null;
    await db.collection(doelstring).where("name", '==', authorname).get().then(docRef => {
        if (docRef.docs.length >= 1) {
            author = docRef.docs[0].id;
        }
        else {
            author = 'none found';
        }
    })
    return author
}

async function updateAuthor(authorid, bpid) {
    let doelstring = domainstate + 'authors' + '/';
    await db.collection(doelstring).doc(authorid).update({
        relationship: [{
            name: 'Written by',
            related: db.doc(domainstate + 'bestpractices/' + bpid),
            self: db.doc(domainstate + 'authors/' + authorid)
        }
        ]
    });
}

async function updateBP(authorids, bpid) {
    let doelstring = domainstate + 'bestpractices' + '/';
    for (authorid of authorids) {
        let currentDoc = await db.collection(doelstring).doc(bpid).get();
        for (let [key, value] of Object.entries(currentDoc.data())) {
            if (key.replace(/[0-9]/g, '') == 'author') {
                let currentRefArray = value;
                currentRefArray.push({ name: 'Written by', self: db.doc(domainstate + 'bestpractices/' + bpid), related: db.doc(domainstate + 'authors/' + authorid) });
                db.collection(doelstring).doc(bpid).set({ '14author': currentRefArray }, { merge: true });
            }
        }
    }
}



async function addBPs() {
    let doelstring = domainstate + 'bestpractices' + '/';
    for (Bp of bestpractices) {
        console.log(Bp);
        let authors = Bp.Written.split(',');
        let authorids = [];
        for (author of authors) {
            let output = await (findAuthor(author));

            if (output != 'none found') {
                authorids.push(output);
                console.log('author found');
            }

            if (output == 'none found') {
                let authorid = await (addAuthor(author));
                authorids.push(authorid);
                console.log('author added', authorid);
            }
        }

        await db.collection(doelstring).add({
            '10title': Bp.Title,
            '11university': Bp.University,
            '12image': Bp.Image,
            '13author': [],
            '14date': Bp.Date,
            "15introduction": Bp.Introduction,
            "16process": Bp.Process,
            "17outcome": Bp.Outcome,
            "18conclusion": Bp.Conclusion,
            "19learnmore": Bp.Learnmore,
            created: "true",
        }).then(docRef => {
            //Assign the relation between the bp and the author on the authors side
            for (authorid of authorids) {
                updateAuthor(authorid, docRef.id);
            }

            //Create standard BP subcollections
            let path = doelstring + docRef.id + '/';
            createCommentDocs(path);
            createRatingDocs(path);


            //Assign the relation between the bp and the author,theme and dimension on the bp side
            updateBP(authorids, docRef.id);

            console.log('BP is added under ID ', docRef.id);

        })
    }

}

async function createCommentDocs(path) {
    let data = {
        "displayfeature": false,
        "author": "string",
        "date": "string",
        "email": "string",
        "img": "string",
        "level": "int",
        "parent": "string",
        "text": "string"
    }
    await db.collection(path + 'comments').doc('commentdocument').set(data);
}

async function createRatingDocs(path) {
    let data = {
        "ratingtype": ["stars"],
        "dimension": ["Effort"],
        "dimensiondescription": ["Effort describes the effort required for applying the Best Practice"],
        "scale": [5],
        "stepsize": [1]
    }
    await db.collection(path + 'ratings').doc('ratingdocument').set(data);
}

function createspan(text){
    span = document.createElement('span')
    span.innerText = text
    span.setAttribute('class', 'text')
    return span
}


