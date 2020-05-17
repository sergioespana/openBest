// ########################
// Creates the JSON model 
// ########################

// Create firestore (database) object
var db = firebase.firestore();


// ############################################


var dslmodal = document.getElementById("model-modal");
var dslbtn = document.getElementById("create-model-btn");
// span elements closes the modal
var dslspan = document.getElementsByClassName("close")[1];
// Counts the amount of concept instances
var counter = 0;
var subcounter = 100;
// The JSON model
var JSONmodel;

var addConceptHTML;

function addConceptFunction(c, pc) {

    // HTML blob for adding a new concept
    addConceptHTML = "\
    <div counter=\""+c+"\" parent-counter=\""+pc+"\" class=\"conceptdiv\" style=\"border-style: solid; border-color: #f8f9fc; padding: 20px; margin-top: 15px\">\
        <div class=\"row\">\
            <div class=\"col-lg-11\">\
                <div style=\"margin-top: 40px\" class=\"font-weight-bold text-success text-uppercase\">New concept</div>\
            </div>\
            <div class=\"col-lg-1\"><span class=\"deleteConcept\"><i style=\"margin-top: 40px; float: right\" class=\"fas fa-times\"></i></span></div>\
        </div>\
        <br>\
        <label>Group title</label>\
        <input class=\"new-group-title-"+c+" form-control bg-light border-0 small\" type=\"value\" placeholder=\"e.g. Example\"></input>\
        <br>\
        <label>Group description</label>\
        <input class=\"new-group-description-"+c+" form-control bg-light border-0 small\" type=\"value\" placeholder=\"e.g. Describe an example here\"></input>\
        <br>\
            <input id=\"required-checkbox\" class=\"bg-light border-0 small\" type=\"checkbox\" name=\"required\" value=\"Required\"></input>\
            <label for=\"required\">This is a required concept</label>\
        <br>\
        <div class=\"row\">\
            <div class=\"col-md-6\">\
            <label>Attribute name</label>\
            </div>\
            <div class=\"col-md-6\">\
            <label>Attribute type</label>\
            </div>\
        </div>\
        <div class=\"attribute-add\" counter=\""+c+"\">\
            <div number=\"1\" class=\"row\">\
            <div class=\"col-md-6\">\
                <input counter=\""+c+"\" class=\"form-control bg-light border-0 small\" type=\"value\" placeholder=\"e.g. Description\"></input>\
            </div>\
            <div class=\"col-md-6\">\
                <select counter=\""+c+"\" class=\"form-control bg-light border-0 small\">\
                <option>String</option>\
                <option>Text</option>\
                <option>Document reference</option>\
                </select>\
                <input counter=\""+c+"\" id=\"array-checkbox\" class=\"bg-light border-0 small\" type=\"checkbox\" name=\"array\" value=\"Array\"></input>\
                <label for=\"array\">Multiple</label>\
            </div>\
            </div>\
        </div>\
        <a style=\"margin-top: 20px\" id=\"add-attribute\" class=\"btn btn-light btn-icon-split\" btn-counter=\""+c+"\" parent-counter=\""+pc+"\">\
            <span class=\"icon text-gray-600\">\
            <i class=\"fas fa-arrow-right\"></i>\
            </span>\
            <span class=\"text\">Add attribute</span>\
        </a>\
        <a style=\"margin-top: 20px\" id=\"add-sub-concept\" class=\"btn btn-light btn-icon-split\" btn-counter=\""+c+"\" parent-counter=\""+pc+"\">\
            <span class=\"icon text-gray-600\">\
            <i class=\"fas fa-arrow-right\"></i>\
            </span>\
            <span class=\"text\">Add sub-concept</span>\
        </a>\
    </div>\
    " 
}




// displaying the modal
if(dslbtn){
    dslbtn.onclick = function() {
    dslmodal.style.display = "block";
    }
}


document.getElementById("add-concept").addEventListener("click", function(){

    // Making sure addConceptHTML is available
    // parentcounter is set at 0 for every new concept
    addConceptFunction(counter, 0);

    // Adding the HTML to the new-concept div
    $('.new-concept').append(addConceptHTML);

    // Counter is increased for every added concept
    counter++;
})


// Adding an attribute or sub-concept
$(".new-concept").on('click', 'a', function(event){

    // When a sub-concept is added, the parentcounter attribute should be filled in
    subcounter++;
    parentcounter = $(this).attr('btn-counter');
    addConceptFunction(subcounter, parentcounter);

    // Adding a sub-concept
    if($(this).attr('id') == 'add-sub-concept'){
        let btncounter = $(this).attr('btn-counter');
        
        // The parent concept of the newly added sub-concept
        let parentConcept = $('.new-concept').find('.attribute-add').filter('[counter='+`${btncounter}`+']');

        $(addConceptHTML).insertAfter(parentConcept);
    }
    else{
        let btncounter = $(this).attr('btn-counter');

        // HTML blob in which user can add a new attribute
        let attributeAddHTML = "\
        <div class=\"row\"\>\
            <div class=\"col-md-6\"\>\
                <input counter=\""+btncounter+"\" class=\"form-control bg-light border-0 small\" type=\"value\"></input\>\
            </div\>\
            <div class=\"col-md-5\"\>\
                <select counter=\""+btncounter+"\" class=\"form-control bg-light border-0 small\"\>\
                    <option>String</option\>\
                    <option>Text</option\>\
                    <option>Document reference</option\>\
                </select\>\
                <input counter=\""+btncounter+"\" id=\"array-checkbox\" class=\"bg-light border-0 small\" type=\"checkbox\" name=\"array\" value=\"Array\"></input\>\
                <label for=\"array\">Multiple</label\>\
            </div\>\
            <div class=\"col-md-1\"\>\
                <a class=\"attrDelete btn btn-light btn-icon-split\"\>\
                    <span class=\"icon text-gray-600\"\>\
                        <i class=\"fas fa-times\"></i\>\
                    </span\>\
                </a\>\
            </div\>\
        </div>"
        

        // The counter of the "Add attribute" button that was pressed
        let attrCounter = $(this).attr("btn-counter");
        // The div to which the new row should be appended
        let attributeAdd = $(this).closest("div").find(`[counter='${attrCounter}']`).filter('.attribute-add');

        $(attributeAdd).append(attributeAddHTML);
    }
})


// Removing an input row for an attribute
$(".new-concept").on('click', '.attrDelete', function(event){
    // The row in which the clicked delete button is located
    let attrRow = $(this).parent().parent()[0];
    attrRow.remove(attrRow);
});


// Creating the JSON model
document.getElementById("dsl-create").addEventListener("click", async function(){

    // Emptying the JSON model
    JSONmodel = "";

    // Information filled in by user
    let domainName = document.getElementById('input-domain-name').value;
    let bpGroupTitle = document.getElementById('bp-group-title').value;
    let bpGroupDesc = document.getElementById('bp-group-description').value;
    let probGroupTitle = document.getElementById('prob-group-title').value;
    let probGroupDesc = document.getElementById('prob-group-description').value;
    let solGroupTitle = document.getElementById('sol-group-title').value;
    let solGroupDesc = document.getElementById('sol-group-description').value;

    // The initial JSON model (as string). After this, variable data can be appended.
    JSONmodel += "\
    \{\""+domainName.replace(' ', '')+"\": \{\
        \"domainstate\": \{\
            \"displayfeature\": false\,\
            \"model\": \"string\",\
            \"name\": \""+domainName+"\",\
            \"administrator\": \""+userEmail+"\",\
            \"bestpractices\": \{\
                \"bpdocument\": \{\
                    \"01grouptitle\": \""+bpGroupTitle+"\",\
                    \"02groupdesc\": \""+bpGroupDesc+"\",\
                    \"1displayfeature\": true,\
                    \"2title\": \"string\",\
                    \"3description\": \"text\",\
                    \"4author\": [\"document reference\"\],\
                    \"5categories\": [\"string\"\],\
                    \"6date\": \"string\"\
        "


    // Adding comments > this is a RECOMMENDED subcollection
    let commentsCheckbox = document.getElementById("comments-checkbox");
    // Adding ratings > this is a RECOMMENDED subcollection
    let ratingsCheckbox = document.getElementById("ratings-checkbox");

    // Both are checked
    if(commentsCheckbox.checked && ratingsCheckbox.checked){
        let commentsRatingsString = "\
        ,\"comments\": \{\
            \"commentdocument\": \{\
                \"01grouptitle\": \"comments title\",\
                \"02groupdesc\": \"comments description\",\
                \"1displayfeature\": false\
            \}\
        \},\
        \"ratings\": \{\
            \"ratingdocument\": \{\
                \"01grouptitle\": \"ratings title\",\
                \"02groupdesc\": \"ratings description\",\
                \"1displayfeature\": false\
            \}\
        \}\
        \}\
        \},"

        JSONmodel += commentsRatingsString
    }
    else if(ratingsCheckbox.checked && !(commentsCheckbox.checked)){
        let ratingsString = "\
        ,\"ratings\": \{\
            \"ratingdocument\": \{\
                \"01grouptitle\": \"ratings title\",\
                \"02groupdesc\": \"ratings description\",\
                \"1displayfeature\": false\
            \}\
        \}\
        \}\
        \},"

        JSONmodel += ratingsString
    }
    else if(!(ratingsCheckbox.checked) && commentsCheckbox.checked){
        let commentsString = "\
        ,\"comments\": \{\
            \"commentdocument\": \{\
                \"01grouptitle\": \"comments title\",\
                \"02groupdesc\": \"ratings description\",\
                \"1displayfeature\": false\
            \}\
        \}\
        \}\
        \},"

        JSONmodel += commentsString
    }
    // If none of the subcollections are checked, we need to close bestpractices
    else{
        JSONmodel += "\
        \}\
        \}\
        ,"
    }


    // Adding problems > this is a FIXED subcollection
    let problemString = "\
    \"problems\": \{\
        \"problemdocument\": \{\
            \"01grouptitle\": \""+probGroupTitle+"\",\
            \"02groupdesc\": \""+probGroupDesc+"\",\
            \"1displayfeature\": true,\
            \"2name\": \"string\",\
            \"3description\": \"text\"\
        \}\
    \},\
    "

    JSONmodel += problemString

    // Adding solutions > this is a FIXED subcollection
    let solutionString = "\
    \"solutions\": \{\
        \"solutiondocument\": \{\
            \"01grouptitle\": \""+solGroupTitle+"\",\
            \"02groupdesc\": \""+solGroupDesc+"\",\
            \"1displayfeature\": true,\
            \"2name\": \"string\",\
            \"3description\": \"text\"\
        \}\
    \}\
    "

    JSONmodel += solutionString


    // Adding a new concept as a subcollection

    // Creating an array of counters that for each attribute-add row
    let counterArray = [];
    $('.attribute-add').each(function(){
        // Only adding counters lower than 100 to the array, everything higher than 100 is a subconcept
        if($(this).attr("counter") < 100){
            counterArray.push($(this).attr("counter"));
        }
    });


    // Iterating over the counterarray to find the info for each attribute-add row
    // For each new concept, we add info to the JSONmodel
    for(let c = 0; c < counterArray.length; c++){

        // Before the first concept is added, we should append a comma to the JSONmodel
        if(c == 0){
            JSONmodel += ","
        }

        // The last counter element in the array
        let finalcounter = counterArray[counterArray.length - 1];

        // Calling the function for every concept on level 1
        // This function will handle the addition of sub-concepts for THAT concept
        addConcepts(counterArray[c], counterArray.length, 0, finalcounter);

        // If no more non-nested concepts need to be added, add closing brackets and log the model
        if(c == counterArray.length - 1){
            JSONmodel += "}}}";
            console.log(JSONmodel)
        }
        // If there are more non-nested concepts to be added, add a comma
        else{
            JSONmodel += ",";
        }
    }

    // If no other concepts are added by the user
    if(counterArray.length == 0){
        JSONmodel += "\
        \}\
        \}\
        \}\
        "
    
        console.log(JSONmodel);
    }

})


function addConcepts(c, clength, subConceptCount, finalcounter) {

    // ###########
    // ADDING THE INFO TO THE JSON MODEL FOR THE CURRENT COUNTER
    // ###########

    $(`[counter='${c}']`).filter('.conceptdiv').each(function(index){
        
        let newGroupTitle = document.getElementsByClassName('new-group-title-'+c)[0].value;
        let newGroupDesc = document.getElementsByClassName('new-group-description-'+c)[0].value;

        let newConceptString = "\
        \""+newGroupTitle.replace(' ', '')+"\": \{\
            \"newdocument\": \{\
                \"01grouptitle\": \""+newGroupTitle+"\",\
                \"02groupdesc\": \""+newGroupDesc+"\",\
        "
    
        JSONmodel += newConceptString

        //Storing the attribute contents of the additional concepts
        let attrNames = [];
        let attrTypes = [];
        let checkedArrays = [];

        // Adding the attribute type to an array
        $(`[counter='${c}']`).find('select').each(function(){
        if($(this).attr('counter')){
            attrTypes.push($(this).children("option:selected").val());
        }
        });
        // Addding the attribute name to an array
        // Search for all input fields within the attribute-add div that has the counter attribute with the current counter value
        $(`[counter='${c}']`).find('input').each(function(){
            if($(this).attr('counter')){
                if($(this).attr("id") != "array-checkbox"){
                    attrNames.push($(this).val());
                }
                // Adding the checkbox information to an array
                if($(this).attr("id") == "array-checkbox"){
                    if($(this)[0].checked){
                        checkedArrays.push("checked");
                    }
                    else{
                        checkedArrays.push("unchecked");
                    }
                }
            }
        });

        // Iterating over the filled in attributes
        for(let attr = 0; attr < attrNames.length; attr++){
            
            // Adding 2 because the first two attributes are the group title and description
            let number = (attr+2).toString();

            // The last attribute to be added needs to have extra curly brackets to correctly close this model section
            if(attr == attrNames.length - 1){
                // If this attribute is an ARRAY, add the square brackets
                if(checkedArrays[attr] == "checked"){
                    // But if there are subconcepts to be found
                    // Subconcepts are closed off later

                    let addAttrString = "\
                    \""+number+attrNames[attr]+"\": [\""+attrTypes[attr]+"\"]\
                    "

                    JSONmodel += addAttrString;
                }

                // Don't add square brackets for REGULAR ATTRIBUTES
                else{
                    let addAttrString = "\
                    \""+number+attrNames[attr]+"\": \""+attrTypes[attr]+"\"\
                    "
            
                    JSONmodel += addAttrString;
                }
            }
            // If other attributes still need to be added
            else{
                // Add square brackets for arrays
                if(checkedArrays[attr] == "checked"){
                    let addAttrString = "\
                    \""+number+attrNames[attr]+"\": [\""+attrTypes[attr]+"\"],\
                    "
            
                    JSONmodel += addAttrString;
                }
                else{
                    let addAttrString = "\
                    \""+number+attrNames[attr]+"\": \""+attrTypes[attr]+"\",\
                    "
            
                    JSONmodel += addAttrString;
                }
            }
        }

        // // Adding a comma after each added concept except the final one
        // if(c < clength - 1){
        //     JSONmodel += ",";
        // }

    })

    // CHECKING IF THERE ARE SUB-CONCEPTS
    // Subconcepts found
    if($(`[counter='${c}']`).find(`[parent-counter='${c}']`).filter('div').length != 0){
        JSONmodel += ",";

        // Reiterating the addConcepts function for this subconcept
        let subconcept = $(`[counter='${c}']`).find(`[parent-counter='${c}']`).filter('div');
        subConceptCount ++;
        addConcepts($(subconcept).attr('counter'), 0, subConceptCount, finalcounter);
    }
    // No further subconcepts found
    else{
        // For each added subconcept, two closing brackets should be added to close the concept
        for(let scc = 0; scc < subConceptCount + 1; scc++){
            JSONmodel += "}}";
        }
    }
}


// Removing (sub-)concepts
$(".new-concept").on('click', '.deleteConcept', function(event){
    $('.new-concept')[0].remove($(this).parent().parent().parent()[0]);
});


// Closing the modal
dslspan.onclick = function() {
    dslmodal.style.display = "none";
}