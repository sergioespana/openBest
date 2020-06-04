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
            <a style=\"margin-top: 20px\" id=\"add-attribute\" class=\"btn btn-light btn-icon-split\" btn-counter=\""+c+"\" parent-counter=\""+pc+"\">\
                <span class=\"text\">\
                <i class=\"fas fa-plus\"></i>\
                </span>\
                <span class=\"text\">Add attribute</span>\
            </a>\
        </div>\
        <a style=\"margin-top: 20px\" id=\"add-sub-concept\" class=\"btn btn-light btn-icon-split\" btn-counter=\""+c+"\" parent-counter=\""+pc+"\">\
            <span class=\"text\">\
            <i class=\"fas fa-plus\"></i>\
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
    addConceptFunction(counter, counter);

    // Adding the HTML to the new-concept div
    $('.new-concept').append(addConceptHTML);

    // Counter is increased for every added concept
    counter++;
})


// Adding an attribute
$(".new-concept").on('click', 'a', function(event){

    if($(this).attr('id') == 'add-attribute'){

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

        $(attributeAddHTML).insertBefore($(this));
    }
})

// Adding a sub-concept
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

        $(addConceptHTML).insertBefore($(this));
    }
})


// Removing an input row for an attribute
$(".new-concept").on('click', '.attrDelete', function(event){
    // The row in which the clicked delete button is located
    let attrRow = $(this).parent().parent()[0];
    $(attrRow).remove();
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
    let problemSolutionString = "\
    \"problems\": \{\
        \"problemdocument\": \{\
            \"01grouptitle\": \""+probGroupTitle+"\",\
            \"02groupdesc\": \""+probGroupDesc+"\",\
            \"1displayfeature\": true,\
            \"2name\": \"string\",\
            \"3description\": \"text\",\
            \"solutions\": \{\
                \"solutiondocument\": \{\
                    \"01grouptitle\": \""+solGroupTitle+"\",\
                    \"02groupdesc\": \""+solGroupDesc+"\",\
                    \"1displayfeature\": true,\
                    \"2name\": \"string\",\
                    \"3description\": \"text\"\
                \}\
            \}\
        \}\
    \}\
    "

    JSONmodel += problemSolutionString

    // // Adding solutions > this is a FIXED subcollection
    // let solutionString = "\
    // \"solutions\": \{\
    //     \"solutiondocument\": \{\
    //         \"01grouptitle\": \""+solGroupTitle+"\",\
    //         \"02groupdesc\": \""+solGroupDesc+"\",\
    //         \"1displayfeature\": true,\
    //         \"2name\": \"string\",\
    //         \"3description\": \"text\"\
    //     \}\
    // \}\
    // "

    //JSONmodel += solutionString


    // Adding a new concept as a subcollection

    // Creating an array of counters that for each attribute-add row
    let counterArray = [];
    $('.attribute-add').each(function(){
        // Only adding counters lower than 100 to the array, everything higher than 100 is a subconcept
        if($(this).attr("counter") < 100){
            counterArray.push($(this).attr("counter"));
        }
    });


    // Calling the function on the first element
    for(let c = 0; c < 1; c++){
        // The last counter element in the array
        let finalcounter = counterArray[counterArray.length - 1];

        // Storing the counters that have been checked already
        let checkedCounters = [];

        JSONmodel += ",";
        addNonNested(finalcounter, checkedCounters, counterArray[c], counterArray);
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


// Adds the level 1 (non-nested concepts)
function addNonNested(fc, cc, c, ca){
    // If the checkedcounter array DOES NOT includes the current counter
    if(!(cc.includes(c))){
        console.log("adding concept " + c)

        // This function will handle the addition of sub-concepts for THAT concept
        addConcepts(c, 0, fc, 0, cc, ca);
    }
    else{
        // Check which elements of ca (non-nested level 1 elements) has not been checked yet
        let notChecked = [];
        for(let x = 0; x < ca.length; x++){
            if(!(cc.includes(ca[x]))){
                notChecked.push(ca[x]);
            }
        }

        // If all elements have been checked, log the model
        if(notChecked.length == 0){
            console.log("all elements have been checked, three brackets are added and model is logged")

            JSONmodel += "}}}";
            console.log(JSONmodel)
        }
        // If not, call addConcepts with the first element of the notChecked array
        else{
            console.log("not all elements have been added")
            console.log("comma is added")
            console.log("adding concepts for " + notChecked[0])

            JSONmodel += ",";
            addConcepts(notChecked[0], 0, fc, "0", cc, ca);
        }
    }
}


function addConcepts(c, subConceptCount, finalcounter, previousCount, checked, cArray) {

    // ###########
    // ADDING THE INFO TO THE JSON MODEL FOR THE CURRENT COUNTER
    // ###########

    // If the counter has not been checked yet
    if(!(checked.includes(c))){
        // Adding this counter to the checked array
        checked.push(c);

        $(`[counter='${c}']`).filter('.conceptdiv').each(function(index){

            console.log("data is added for " + c)
            
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
            $(`[counter='${c}']`).find('select').filter(`[counter='${c}']`).each(function(){
            if($(this).attr('counter')){
                if($(this).children("option:selected").val() == "Document reference"){
                    let test = [{name: "test", self: "document reference", related: "document reference"}]
                    
                    //console.log()
                    attrTypes.push(test);
                }
                else{
                    attrTypes.push($(this).children("option:selected").val());
                }
            }
            });
            // Addding the attribute name to an array
            // Search for all input fields within the attribute-add div that has the counter attribute with the current counter value
            $(`[counter='${c}']`).find('input').filter(`[counter='${c}']`).each(function(){
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
        })
    }

    // CHECKING IF THERE ARE SUB-CONCEPTS
    // Subconcepts found
    if($(`[counter='${c}']`).find(`[parent-counter='${c}']`).filter('div').length != 0){

        // Three options
        // ## 1) This element has subconcepts that have not been checked > add these subconcepts
        // ## 2) This element has subconcepts, these are all added, but the current concept has no parent-counter (is a level 0 concept) > call addNonNested
        // ## 3) This element has subconcepts, these are added > call addConcepts for the previous concept

        // Finding the child elements
        let results = $(`[counter='${c}']`).find(`[parent-counter='${c}']`).filter('div');
        
        // Getting the first element that has not been checked/added yet
        let childCounters = [];
        results.each(function() {
            if(!(checked.includes($(this).attr('counter')))){
                childCounters.push($(this).attr('counter'));
            }
        });

        let newChildCounter = childCounters[0];

        // Option 1: The found child has not been checked/added already > call addConcepts for this child element
        if(newChildCounter && !(checked.includes(newChildCounter))){
            console.log("found child " + newChildCounter +  " has not been added yet")

            console.log("adding a comma")
            JSONmodel += ",";

            subConceptCount ++;
    
            // Storing the counters that have been checked already
            checked.push(c);

            // Calling addConcepts for the new child, with the current counter (c) as previousCount
            addConcepts(newChildCounter, subConceptCount, finalcounter, c, checked, cArray)
        }
        // Option 2: All found children have been added, and the current element is a level 0 concept
        else if(!(newChildCounter) && c < 100){
            console.log("all found children have been added and we are at level 0")
            console.log(c)
            // If this non-nested element had children, two extra brackets should be added
            if($(`[counter='${c}']`).find(`[parent-counter='${c}']`).filter('div').length != 0){
                console.log($(`[counter='${c}']`).find(`[parent-counter='${c}']`).filter('div'))

                console.log("adding two brackets")
                // Adding two brackets to close off this level 0 concept
                JSONmodel += "}}";
            }
            addNonNested(finalcounter, checked, "0", cArray);
        }
        // Option 3: All found children have been added, but the current element is a nested element
        else{
            console.log("all found children have been added and this is a nested element")
            console.log("adding two brackets")
            JSONmodel +=  "}}";
            // The previousCount for the previous element
            let previousPreviousCount = $(`[counter='${previousCount}']`).filter('div').attr('parent-counter');
            // Calling addConcepts for the previous element
            addConcepts(previousCount, subConceptCount, finalcounter, previousPreviousCount, checked, cArray)
        }
    }
    // No subconcepts found
    else{
        console.log("no subconcepts found")
        console.log("adding two brackets")

        checked.push(c);

        JSONmodel += "}}";

        // If the current element is a level 0 concept, we can call the addNonNested function
        if(c < 100){
            addNonNested(finalcounter, checked, "0", cArray);
        }
        // Otherwise, check if the previous element still has children to be added
        else{
            // Getting the previousCount for the previous element
            let previousPreviousCount = $(`[counter='${previousCount}']`).filter('div').attr('parent-counter').toString();

            // Calling addConcepts for the previous element
            addConcepts(previousCount.toString(), subConceptCount, finalcounter, previousPreviousCount, checked, cArray)
        }
    }
}


// Removing (sub-)concepts
$(".new-concept").on('click', '.deleteConcept', function(event){
    $(this).parent().parent().parent()[0].remove();
});


// Closing the modal
dslspan.onclick = function() {
    dslmodal.style.display = "none";
}