// ########################
// Populates the domain following the structure defined for the ECG group, take note that this means that it only works for that domain
// ########################
// "Economy for the common good/domainstate"


var db               = firebase.firestore();

let place = document.getElementById("popbut");

let tbl = document.createElement('table');
let thead = document.createElement('thead');
thead.innerText = "Dev Tools";
thead.style.textAlign = "center";
let tbody = document.createElement('tbody');

tbl.appendChild(thead);
tbl.appendChild(tbody);


var popbutton1   = document.createElement("INPUT"); 
popbutton1.type  = "button";
popbutton1.value = "Populate Authors";
popbutton1.style.margin = "auto";
popbutton1.style.display = "block";
popbutton1.addEventListener("click", async function(){await addAuthors()});


var popbutton2   = document.createElement("INPUT"); 
popbutton2.type  = "button";
popbutton2.value = "Populate ECG Themes";
popbutton2.style.margin = "auto";
popbutton2.style.display = "block";
popbutton2.addEventListener("click", async function(){await addECGthemes()});


var popbutton3   = document.createElement("INPUT"); 
popbutton3.type  = "button";
popbutton3.value = "Populate best practices";
popbutton3.style.margin = "auto";
popbutton3.style.display = "block";
popbutton3.addEventListener("click", async function(){await addBPs();});

var fileselec   = document.createElement("INPUT"); 
fileselec.type = "file";
fileselec.id = "fileUpload";
fileselec.style.margin = "auto";
fileselec.style.display = "block";

var probutton   = document.createElement("INPUT"); 
probutton.type  = "button";
probutton.value = "upload";
probutton.style.marginRight = "auto";
probutton.style.display = "block";
probutton.addEventListener("click", function(){UploadProcess()});


let row_1 = document.createElement('tr');
let row_1_data_1 = document.createElement('td');
row_1_data_1.appendChild(popbutton1);
let row_1_data_2 = document.createElement('td');
row_1_data_2.appendChild(popbutton2);

row_1.appendChild(row_1_data_1);
row_1.appendChild(row_1_data_2);
tbody.appendChild(row_1);


// Creating and adding data to third row of the table
let row_2 = document.createElement('tr');
let row_2_data_1 = document.createElement('td');
row_2_data_1.appendChild(popbutton3);
let row_2_data_2 = document.createElement('td');
row_2_data_2.appendChild(fileselec);
let row_2_data_3 = document.createElement('td');
row_2_data_3.appendChild(probutton);

row_2.appendChild(row_2_data_1);
row_2.appendChild(row_2_data_2);
row_2.appendChild(row_2_data_3);
tbody.appendChild(row_2);

place.append(tbl)


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


async function addAuthors(){
    let doelstring =  "Economy for the common good/domainstate/" + 'authors' + '/';
    let list = [
            "Bausinger",
            "Blattwerk Gartengestaltung GmbH",
            "Buch7",
            "CulumNATURA",
            "Elobau",
            "EMChiemgau",
            "FAHNENGÄRTNER",
            "Grüne Erde",
            "Märkisches Landbrot",
            "Munich’s Pools",
            "Municipality of Mäder",
            "Nellie Nashorn (Rhino) ",
            "Ökofrost",
            "Randegger Ottilienquelle",
            "Samaritan Foundation",
            "SONNENTOR",
            "Soulbottles",
            "Taifun-Tofu GmbH",
            "verlag GmbH",
            "Voelkel"
            ]

    for (authorname of list){
        //write author to db
      await db.collection(doelstring).add({ 
                name: authorname,
                relationship: []
        }).then(docRef => {
            console.log('author is added under ID ', docRef.id);
        })
    }
}

async function addECGthemes(){
    let doelstring =  "Economy for the common good/domainstate/" + 'ECGThemes' + '/';
    let list = [
        "A1 Human dignity in the supply chain",
        "A2 Solidarity and social justice in the supply chain",
        "A3 Environmental sustainability in the supply chain",
        "A4 Transparency and co-determination in the supply chain",
        "B1 Ethical position in relation to financial resources",
        "B2 Social position in relation to financial resources",
        "B3 Use of funds in relation to social and environmental impacts",
        "B4 Ownership and co-determination",
        "C1 Human dignity in the workplace and working environment",
        "C2 Self-determined working arrangements",
        "C3 Environmentally-friendly behaviour of staff",
        "C4 Co-determination and transparency within the organisation",
        "D1 Ethical customer relations",
        "D2 Cooperation and solidarity with other companies",
        "D3 Impact on the environment of the use and disposal of products and services",
        "C4 Co-determination and transparency within the organisation",
        "D1 Ethical customer relations",
        "D2 Cooperation and solidarity with other companies",
        "D3 Impact on the environment of the use and disposal of products and services",
        "D4 Customer participation and product transparency",
        "E1 The purpose of products and services and their effect on society",
        "E2 Contribution to society",
        "E3 Reduction of environmental impact",
        "E4 Transparency and co-determination"
    ]
    for (theme of list){
        //write author to db
      let  data = {name: theme,
                relationship: []}
      await db.collection(doelstring).doc(theme).set(data);
      console.log('theme is added under ID ', theme);
                
    }
}

//snapshot.toString().toString();

async function addAuthor(authorname){
    let doelstring =  "Economy for the common good/domainstate/" + 'authors' + '/';
    let author     = null;
    //write author to db
      await db.collection(doelstring).add({ 
                name: authorname,
                relationship: []
        }).then(docRef => {
            console.log('author is added under ID ', docRef.id);
            author = docRef.id;
           
        })
        return(author);
    
}

async function findAuthor(authorname) {
    let doelstring =  "Economy for the common good/domainstate/" + 'authors' + '/';
    let author     = null ;
    await db.collection(doelstring).where("name", '==' , authorname).get().then(docRef => {
            if (docRef.docs.length >= 1)
            {
               author = docRef.docs[0].id;
            }
            else {
                author = 'none found';         
            }
        })
        return author
}

async function updateAuthor(authorid, bpid){
    let doelstring =  "Economy for the common good/domainstate/" + 'authors' + '/';
    await db.collection(doelstring).doc(authorid).update({
        relationship: [{
            name : 'Written by', 
            related : db.doc('/Economy for the common good/domainstate/bestpractices/' + bpid), 
            self : db.doc('/Economy for the common good/domainstate/authors/' + authorid)},

            {
                name : 'Reviewed by', 
                related : db.doc('/Economy for the common good/domainstate/bestpractices/' + bpid), 
                self : db.doc('/Economy for the common good/domainstate/authors/' + authorid)}
        ]
    });
}


async function updateTheme(themename,bpid){
    let themeid = await(findTheme(themename));
    let doelstring =  "Economy for the common good/domainstate/" + 'ECGThemes' + '/';
    await db.collection(doelstring).doc(themeid).update({
        'relationship': [{
                    name : 'Adresses', 
                    related : db.doc('/Economy for the common good/domainstate/bestpractices/' + bpid), 
                    self : db.doc('/Economy for the common good/domainstate/ECGThemes/' + themeid)},
                   ]
    });

}

async function findTheme(themename) {
    let doelstring =  "Economy for the common good/domainstate/" + 'ECGThemes' + '/';
    let themeid    = null ;
    await db.collection(doelstring).where("name", '==' , themename).get().then(docRef => {
            if (docRef.docs.length >= 1)
            {
               themeid = docRef.docs[0].id;
            }
           
        })
        return themeid
}


async function updateBP(authorid,themename, bpid){
    let doelstring =  "Economy for the common good/domainstate/" + 'bestpractices' + '/';
    let themeid = await (findTheme(themename));
    await db.collection(doelstring).doc(bpid).update({
        '12ECGTheme': [{
            name: 'Adresses',
            related: db.doc('/Economy for the common good/domainstate/ECGThemes/' + themeid),
            self: db.doc('/Economy for the common good/domainstate/bestpractices/' + bpid)
        }],
        '14author': [{
            name : 'Adresses', 
            related : db.doc('/Economy for the common good/domainstate/ECGThemes/' + themeid), 
            self : db.doc('/Economy for the common good/domainstate/bestpractices/' + bpid)},
                    {
            name : 'Written by', 
            related : db.doc('/Economy for the common good/domainstate/authors/' + authorid), 
            self : db.doc('/Economy for the common good/domainstate/bestpractices/' + bpid)},
                    {   
            name : 'Reviewed by', 
            related : db.doc('/Economy for the common good/domainstate/authors/' + authorid), 
            self : db.doc('/Economy for the common good/domainstate/bestpractices/' + bpid)}
                    ]         
    });
}

async function addBPs(){
    let doelstring =  "Economy for the common good/domainstate/" + 'bestpractices' + '/';
    for (Bp of bestpractices){
        let author = await(findAuthor(Bp.Written));
        if (author != 'none found'){
            authorid = author;
            console.log('author found');
        }

        if (author == 'none found') {
           authorid = await(addAuthor(Bp.Written));
            console.log('author added', authorid);    
       }
  
        await db.collection(doelstring).add({ 
                '10title' : Bp.Title,
                '11categories' : [Bp.Categories],
                '12ECGTheme': [{
                    name: Bp.Adresses,
                    related: 'pathrelated',
                    self: 'pathself'
                }],
                '13image': Bp.Image,
                '14author': [{
                   name: Bp.Written,
                   related:  'pathrelated',
                   self: 'pathself'
                }],
                '17date': Bp.Date,
                '18effort': Bp.Effort,
                '19timeframe': Bp.Timeframe,
                '20audience': Bp.Audience,
                '21description': Bp.Description,
                '22solution': Bp.Solution,
                '23problem': Bp.Problem,
                 created: "true",

        }).then(docRef => {
            console.log('BP is added under ID ', docRef.id);

            updateAuthor(authorid, docRef.id);
            updateTheme(Bp.Adresses,docRef.id);
            updateBP(authorid,Bp.Adresses, docRef.id);

            let path = doelstring + docRef.id + '/';
            createCommentDocs(path);
            createRatingDocs(path);
            createExampleDocs(path);

            console.log('done', docRef.id);

        })
    }
    
}
async function createCommentDocs(path){
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

async function createRatingDocs(path){
    let data = {
        "ratingtype":["stars"],
        "dimension":["Effort"],
        "dimensiondescription":["Effort describes the effort required to put into the bladibla"],
        "scale":[5],
        "stepsize":[1]
    }
    await db.collection(path + 'ratings').doc('ratingdocument').set(data);
}
    
async function createExampleDocs(path){
    let data = {
        "displayfeature": true,
        "2name": "string",
        "3description": "text"
    }
    await db.collection(path + 'example').doc('exampledocument').set(data);

}



