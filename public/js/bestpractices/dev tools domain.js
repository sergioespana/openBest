// ########################
// Populates the domain following the structure defined for the  PwC, take note that this means that it only works for that domain
// ########################
// "Stichting Code Sociale Ondernemingen/domainstate"
// To be able to see the dev tools please change the email adress in auth.js to your own emailadress.

var db = firebase.firestore();
let domainstate = 'Stichting Code Sociale Ondernemingen/domainstate/'

var tbl = document.createElement('table');
let thead = document.createElement('thead');
thead.innerText = "Dev Tools";
let tbody = document.createElement('tbody');

tbl.appendChild(thead);
tbl.appendChild(tbody);

var popbutton1 = document.createElement("INPUT");
popbutton1.type = "button";
popbutton1.value = "Populate Authors";
popbutton1.addEventListener("click", async function () { await addAuthors() });


var popbutton2 = document.createElement("INPUT");
popbutton2.type = "button";
popbutton2.value = "Populate Themes";
popbutton2.addEventListener("click", async function () { 
    await addthemes() 
    await addsustainabilitydimensions()

});


var popbutton3 = document.createElement("INPUT");
popbutton3.type = "button";
popbutton3.value = "Populate users";
popbutton3.addEventListener("click", async function () { await addUsers()});

var popbutton4 = document.createElement("INPUT");
popbutton4.type = "button";
popbutton4.value = "Populate best practices";
popbutton4.addEventListener("click", async function () { await addBPs(); });

var fileselec = document.createElement("INPUT");
fileselec.type = "file";
fileselec.id = "fileUpload";

var probutton = document.createElement("INPUT");
probutton.type = "button";
probutton.value = "upload";
probutton.addEventListener("click", function () { UploadProcess() });


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
                    console.log(bestpractices);
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
                    console.log(bestpractices);
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
        'Sergio España',
        'Yannick Dogterom', 'Jan Corné Vink', 'Damian den Ouden',
        'B.C.G. Knüppe', 'F.S. Slijkhuis', 'S.A.M. Verwijmeren',
        'Derek Vlaanderen', 'Wouter Westerkamp', 'Evan Wille',
        'Max Herbermann', 'Lowie van Bijsterveld', 'Tommy Versteeg',
        'Rik Adegeest', 'Domenico Essoussi', 'Thijmen Zonneveld'
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
    let list = [
      
    ]

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
    for (authorid of authorids){
        await db.collection(doelstring).doc(bpid).update({
            '14author':[
            {
               name: 'Written by',
               related: db.doc(domainstate + 'authors/' + authorid),
               self: db.doc(domainstate + 'bestpractices/' + bpid)
            }

            ]

        })
    }
}

async function addBPs() {
    let doelstring = domainstate + 'bestpractices' + '/';
    for (Bp of bestpractices) {
        let authors = Bp.Written.split(',');
        let authorids = [];
        for (author of authors){
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
            '11theme': [Bp.Theme],
            '12sustainability dimension': [Bp.Sustainabilitydimension],
            '13image': Bp.Image,
            '14author': [{
                name: Bp.Written,
                related: 'pathrelated',
                self: 'pathself'
            }],
            '15date': Bp.Date,
            '16effort': Bp.Effort,
            '17timeframe': Bp.Timeframe,
            '18audience': Bp.Audience,
            '19quote': Bp.Quote,
            '20description': Bp.Description,
            '21treatment': Bp.Treatment,
            '22takeaway': Bp.Takeaway,

            created: "true",

        }).then(docRef => {
            //Assign the relation between the bp and the author on the authors side
            for (authorid of authorids){
            updateAuthor(authorid, docRef.id);
            }
            //Assign the relation between the bp and the author,theme and dimension on the bp side
            updateBP(authorids, docRef.id);

           
            //Create standard BP subcollections
            let path = doelstring + docRef.id + '/';
            createCommentDocs(path);
            createRatingDocs(path);
            createExampleDocs(path);

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

async function createExampleDocs(path) {
    let data = {
        "displayfeature": true,
        "2name": "string",
        "3description": "text"
    }
    await db.collection(path + 'example').doc('exampledocument').set(data);
}



