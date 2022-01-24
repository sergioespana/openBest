// ########################
// Populates the domain following the structure defined for the ECG group, take note that this means that it only works for that domain
// ########################
// "Economy for the common good/domainstate"

let place = document.getElementById("popbut");
var popbutton   = document.createElement("INPUT"); 
popbutton.type  = "button";
popbutton.value = "Populate";
popbutton.style.marginRight = "15px";
popbutton.addEventListener("click", function(){addelements()});
place.append(popbutton);

var fileselec   = document.createElement("INPUT"); 
fileselec.type = "file";
fileselec.id = "fileUpload";
place.append(fileselec);

var probutton   = document.createElement("INPUT"); 
probutton.type  = "button";
probutton.value = "upload";
probutton.style.marginRight = "15px";
probutton.addEventListener("click", function(){UploadProcess()});
place.append(probutton);

var myTable_   = document.createElement("table"); 
myTable_.id = "ExcelTable";
place.append(myTable_);

async function addelements(){
    //await addAuthors();
    //await addECGthemes();
    await addBPs();
}

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
    let list = ["Sergio","Stefan","Vijanti","Milo","Alexander"]
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
      await db.collection(doelstring).add({ 
                name: theme,
                relationship: []
        }).then(docRef => {
            console.log('theme is added under ID ', docRef.id);
        })
    }
    
}

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
        relationship: [{name = 'Written by', related = ('Economy for the common good/domainstate/bestpractices/' + bpid), self = ('Economy for the common good/domainstate/authors/' + authorid)}]
    })
}
async function updateBP(authorid, bpid){
    let doelstring =  "Economy for the common good/domainstate/" + 'bestpractices' + '/';
    await db.collection(doelstring).doc(bpid).update({
        author: [{name = 'Written by', related = ('Economy for the common good/domainstate/authors/' + authorid), self = ('Economy for the common good/domainstate/bestpractices/' + bpid)}]
    })
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
                effort: Bp.Effort,
                timeframe: Bp.Timeframe,
                audience: Bp.Audience,
                description: Bp.Description,
                solution: Bp.Solution,
                problem: Bp.Problem,
                title: Bp.Title,
                categories: [Bp.Categories],
                ECGTheme: [{
                    name: Bp.Adresses,
                    related: 'path1',
                    self: 'path1self'
                    }],
                image: Bp.Image,
                author: [{
                   name: Bp.Written,
                   related:  authorid,
                   self: 'path2self'
                }],
                date: Bp.Date,
                created: "true"

        }).then(docRef => {
            console.log('BP is added under ID ', docRef.id);
            updateAuthor(authorid, docRef.id);
            updateBP(authorid,docRef.id);
            console.log('done', docRef.id);

        })
    }
    
}