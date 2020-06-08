var db = firebase.firestore();
//function which calls all essential functions in this file
//it gets the ratings and their ratinginfo from the database and draws the aggregates and a ratinginput
async function startupRatings(Bpid){ 

[ratinglist,ratinginfo] = await getratings(BPid);
//transpose the ratings so that every item in the array contains scores belonging to one dimension
let transposedScores    = await Promise.resolve(transposeScores(ratinglist));
//transpose the ratinginfo so that every item in the array contains all info on one rating dimension
let transposedInfo      = await Promise.resolve(transposeInfo(ratinginfo));

//set up rating section skeleton
[topOfratingSegment,ratinginputlocation,individualratinglocation] = setUpRatingSection(transposedInfo,document.getElementById('ratingsection'));
//create total rating aggregation to be placed on top of the rating section to allow for quick identification of the score
createTotalAggregation(topOfratingSegment,transposedScores,transposedInfo);
//create rating input based on ratingdocument
createRatingInput(ratinginputlocation,Bpid,transposedInfo);
//create rating aggregations based on scores and ratingdocument
createRatingAggregation(transposedScores,transposedInfo);
//draw all individual ratings
createAllRatings(individualratinglocation,ratinglist,transposedInfo,Bpid);
}



function setUpRatingSection(transposedInfo,root){
    var ratingAggregationTop = document.createElement('div');
    ratingAggregationTop.id  = "ratingaggregation";
    root.appendChild(ratingAggregationTop);
    //if there is more than one rating dimension
    if (lengte(transposedInfo) > 1){
 
    var ratingCollapsible = document.createElement('button');
    ratingCollapsible.classList.add('btn','btn-light','btn-icon-split');
    ratingCollapsible.style.justifyContent = 'left';

    ratingCollapsible.addEventListener("click",function(){togglevisibility(detailwrapper); changeicon(iconinstantiation)});
    ratingCollapsible.style.width = '100%';
    ratingCollapsible.style.display = 'flex';

    var icon = document.createElement('span');
    icon.classList.add('icon','text-gray-600');

    var iconinstantiation = document.createElement('i');
    iconinstantiation.classList.add('fa','fa-plus');
    icon.appendChild(iconinstantiation);

    var dimname = document.createElement('p');
    dimname.innerText          = "Give your rating!";
    dimname.style.width        = '25%';
    dimname.style.marginLeft   = '10%';
    dimname.style.marginRight  = 'auto';
    dimname.style.textAlign    = 'initial'
    dimname.style.marginBottom = 'auto';
    dimname.style.marginTop    = 'auto';

    ratingCollapsible.appendChild(dimname);
    ratingCollapsible.appendChild(icon);
    
    var detailwrapper = document.createElement('div');
    detailwrapper.id = 'ratinginput';
    detailwrapper.style.display = "none";

    root.appendChild(ratingCollapsible);
    root.appendChild(detailwrapper);

    var buttonbar  = document.createElement('div');
    buttonbar.classList.add('buttonbar');

    var individualRatings = document.createElement('button');
    individualRatings.classList.add('btn','btn-light');
    individualRatings.style.marginRight = '10px';
    individualRatings.innerText         = 'Individual ratings';
    individualRatings.selected          = true;
    individualRatings.addEventListener('click', function (){makeinvisible('Aggregated-ratings','Individual-ratings')});
    buttonbar.appendChild(individualRatings);

    var aggregatedRatings = document.createElement('button');
    aggregatedRatings.classList.add('btn','btn-light');
    aggregatedRatings.innerText = "Aggregated ratings";
    aggregatedRatings.addEventListener('click', function (){makeinvisible('Individual-ratings','Aggregated-ratings')});
    buttonbar.appendChild(aggregatedRatings);
    
    root.appendChild(buttonbar);

    var individualRatingsContainer = document.createElement('div');
    individualRatingsContainer.id = "Individual-ratings";
    root.appendChild(individualRatingsContainer);

    var aggregatedRatingsContainer = document.createElement('div');
    aggregatedRatingsContainer.id = "Aggregated-ratings";
    aggregatedRatingsContainer.style.display = 'none';
    root.appendChild(aggregatedRatingsContainer);

    return [ratingAggregationTop,detailwrapper,individualRatingsContainer];
    }
    else{
        return [ratingAggregationTop,ratingAggregationTop,ratingAggregationTop];
    }

}









//function to create the rating input to be used by the user.
function createRatingInput(root,BPid,list){
    var ratingcontainer = document.createElement("div");
    ratingcontainer.classList.add("wrapper");
    
    var ratinglabel = document.createElement('p');
    ratinglabel.innerText = "Scores (required)";
    ratinglabel.style.marginBottom = '0px';
    ratinglabel.style.marginLeft   =  '10%';
    ratingcontainer.appendChild(ratinglabel);

    var ratingdimensions = [];
    for (mechanism of list){
        var rating = createRating(ratingcontainer,mechanism[0],mechanism[1],mechanism[2],mechanism[3],mechanism[4],mechanism[5],mechanism[6]);
        ratingdimensions.push(rating);
    }
    //textlabel 'Explaination (optional)'
    var textlabel = document.createElement('p');
    textlabel.innerText = "Explaination (optional)";
    textlabel.style.marginBottom = '0px';
    textlabel.style.marginLeft   =  '10%';
    ratingcontainer.appendChild(textlabel);

    //create text input area
    textinput = createTextArea();
    //create submitbutton
    submitbutton = document.createElement("button");
    submitbutton.innerText = "Submit";
    submitbutton.style.marginLeft = '75%';
    submitbutton.style.width = '15%';
    submitbutton.style.marginRight = 'auto';
    submitbutton.classList.add("btn","btn-light");
    submitbutton.addEventListener("click",function () {
        submitrating(BPid,collectrating(ratingdimensions),textinput.value);
        alert("Your review has been posted! refresh this page to see its impact on the ratings average score");
    })
    ratingcontainer.appendChild(textinput);
    ratingcontainer.appendChild(submitbutton);
    root.appendChild(ratingcontainer);
}
function removeRating(BPid,RatingID,RatingContainer){
    startstring = "/domain/domainstate/bestpractices/"
    endstring   = "/ratings"
    totalstring  = startstring.concat(BPid,endstring);
    db.collection(totalstring).doc(RatingID).delete();
    if (RatingContainer){
    removeElement(RatingContainer);
    }
}
//function for submitting a rating to the database
function submitrating(BPid,scores,text){
    startstring = "/domain/domainstate/bestpractices/";
    endstring   = "/ratings";       
    doelstring = startstring.concat(BPid,endstring);
    db.collection(doelstring).add({ //write rating to db
            date       :   getcurrentDateTime(),
            author     : getUserName(),
            img        :    getUserImage(),
            email      :  getUserEmail(),
            rating     :  scores,
            ratingtext :  text
        })

}
//function to retrieve all ratings and the ratingdocument from the database
async function getratings(BPid) {
    var ratinglist = [];
    var ratinginfo = [];
    let startstring = "/domain/domainstate/bestpractices/"
    let endstring   = "/ratings"
    let doelstring = startstring.concat(BPid,endstring);    
    let now =  getcurrentDateTime();
     // Getting a reference to all documents in the comment sub-collection for a best practice
    let documents = await db.collection(doelstring).get();
    // Each document that matches the query is cycled through
    documents.docs.forEach((doc) => {
        // for every rating get de relevant info     
        if (doc.id != "ratingdocument"){
            rating_date   = getTimeDifference(now,doc.data().date);
            rating_author = doc.data().author; 
            rating_img    = doc.data().img; 
            rating_score  = doc.data().rating;
            rating_email  = doc.data().email;
            rating_id     = doc.id;
            text          = doc.data().ratingtext;
            ratinglist.push([rating_author,rating_date,rating_score,rating_img,rating_email,rating_id,text]);
        }
        // get rating information on the dimensions
        else {
            rating_type             = doc.data().ratingtype;
            rating_scale            = doc.data().Scale;
            rating_dimensions       = doc.data().dimensions;
            rating_dimensions_descr = doc.data().Dimension_descr;
            rating_stepsize         = doc.data().stepsize;
            ratinginfo.push([rating_type,rating_dimensions,rating_scale,rating_stepsize,rating_dimensions_descr]);
        
        }
    })
    return [ratinglist,ratinginfo[0]];
}
//function for creating ther fitting aggregation per dimension (links to ratingaggregationswitch)
async function createRatingAggregation(scorelist,ratingdimensions){
    for (var i=0; i < (lengte(ratingdimensions)); i++){
        let ratingdimension       = await ratingdimensions[i]
        let ratingdimension_type  = await ratingdimension[0];
        let ratingdimension_name  = await ratingdimension[1];
        let ratingdimension_scale = await ratingdimension[2];
        let ratingdimension_step  = await ratingdimension[4];
        if (lengte(scorelist) > 0 ){
            var scores = await scorelist[i].map(numStr => parseInt(numStr));}
        else {
            var scores = []}
        //call the fitting method for aggregation
        ratingaggregationswitch(scores,ratingdimension_name,ratingdimension_type,ratingdimension_scale,ratingdimension_step);   
    }
}
//function for selecting the fitting aggregation per dimension
async function ratingaggregationswitch(scores,ratingdimension_name,ratingdimension_type,ratingdimension_scale,ratingdimension_step){
    switch (ratingdimension_type){
        case 'stars':
            displayAggregation(document.getElementById("Aggregated-ratings"),scores,ratingdimension_name,ratingdimension_scale,ratingdimension_step,'stars');
        break;
        case 'slider':
            displayAggregation(document.getElementById("Aggregated-ratings"),scores,ratingdimension_name,ratingdimension_scale,ratingdimension_step,'slider');
        break;
        case 'binstars':
            displayAggregation(document.getElementById("Aggregated-ratings"),scores,ratingdimension_name,ratingdimension_scale,ratingdimension_step,'binstars');
    }
}
//function for extracting the ratings per dimention from the varying rating mechanisms.
function collectrating(listOfDimensions){
    var scorelist = [];
    var score = 0
    for (dimension of listOfDimensions){
        //get score
       switch (dimension.getAttribute("name")){
           case "stars":
              score = dimension.getAttribute("data-rating");
            break;
            case "slider":
              score = dimension.value;
            case "binstars":
              score = dimension.getAttribute("data-rating");
            break;
       }
       scorelist.push(score);
    }
    return scorelist;
}
//function to create any rating mechanism in 1 dimension
//this function calls the main functions of each mechanism which is based in their respective JavaScript files
//this function is called for each dimension which is listed in the rating document.
//root      -> element below which the rating mechanism should be pasted
//name      -> name of the rating mechanism e.g. binary stars, stars
//dimension -> name of the dimension e.g. reproducibility
//scale     -> scale of the rating this can be the amount of stars or the max of the slider
//type      -> readonly or input
//value     -> default value or calculated value from aggregating function
function createRating(root,name,dimension,scale,type,step,value,descr){
    
    var container = document.createElement("div");
    container.classList.add("ratingcontainer");
    container.style.marginLeft = '10%';

    var info = document.createElement("div");
    info.classList.add("far", "fa-question-circle","questionicon","couponcode");
  
    var tt = document.createElement("span");
    tt.classList.add("coupontooltip");
    info.appendChild(tt);
    tt.innerHTML = descr;
    
    var label = document.createElement("p");
    label.innerText = dimension;
    label.classList.add("label");
    
    container.appendChild(label);
    container.appendChild(info);
    
    switch(name){
        //dislikelike
        case "dislikelike":
            createLikeDislikeRating(container,null,null,null);
        break;
        //like
        case "like":
            console.log("this one is still to be implemented");
        break;
        //eBay
        case "eBay":
            var ratingmech = createEbayRating(container);
        break;
        //stars
        case "stars":
            var ratingmech = createStarRating(container,scale,value);
        break;
        //slider
        case "slider":
            var ratingmech = createbarrating(container,0,scale,step,0,type);
        break;
        //binstars
        case "binstars":
            var ratingmech = createBinaryStarRating(container,scale,scale,'input',0,3);
        break;
    }
    root.appendChild(container);
    return ratingmech;
}
//function to draw all ratings recorded in the database
//this function calls drawRating to draw all ratings
function createAllRatings(root,ratinglist,transposedInfo,BPid){
    for (rating of ratinglist){
        let name    = rating[0];
        let date    = rating[1];
        let score   = rating[2];
        let img     = rating[3];
        let email   = rating[4]
        let id      = rating[5];
        let text    = rating[6];
        drawRating(name,date,score,img,id,BPid, issame(email),root,transposedInfo,text);
    }
}
//function to draw one instance of a rating, this rating has the same interface as the comments from comment.js
function drawRating(name,date,text,img,ratingid,BP_id,issame,root,dimensioninfo,ratingtext){
  
   // rating wrapper e.g. the wrapper for all the comments contents
   var rating_wrapper = document.createElement("DIV");  
   rating_wrapper.id = ratingid;
   rating_wrapper.classList.add("comment_wrapper");

   //picture wrapper
   var picture_wrapper = document.createElement("DIV");
   picture_wrapper.classList.add("picture_wrapper");

   //content wrapper
   var content_wrapper = document.createElement("DIV");
   content_wrapper.classList.add("content");

   //topbar wrapper, wrapper for the meta info and toolbar
   var topbar_wrapper = document.createElement("DIV");
   topbar_wrapper.classList.add("topbar");

   //meta info wrapper, name, date, etc.
   var meta_info_wrapper = document.createElement("DIV");
   meta_info_wrapper.classList.add("meta_info");

   //toolbar wrapper, delete, edit, flag, etc.
   var toolbar_wrapper = document.createElement("DIV");
   toolbar_wrapper.classList.add("toolbar_wrapper");

   //toolbar wrapper for comment utilities under the comment text, confirm edit, cancel edit, show entire comment.
   var bottomtoolbar_wrapper = document.createElement("DIV");
   bottomtoolbar_wrapper.classList.add("bottomtoolbar");

   //picture
   var picture = document.createElement("img");
   picture.src = img;
   picture.classList.add("picture");
   picture_wrapper.appendChild(picture);//plak de afbeelding in de picture wrapping

   //author name
   var name_text = document.createElement("p");
   name_text.classList.add("name");
   name_text.innerText = name;

   //comment date, e.g. 5 minutes ago...
   var date_posted_text = document.createElement("p");
   date_posted_text.classList.add("date_poster");
   date_posted_text.innerText = date;
      
//    the comment text itself
   var comment_text = document.createElement("p");
   comment_text.innerText = ratingtext;
     
   //allow a user to flag a rating if rating in not from current logged in user
   if (issame == "false"){
    //flagging component
    var flag_comment = document.createElement("i");
    flag_comment.classList.add("far","fa-flag","flag_button","dropbtn");
    flag_comment.addEventListener("mouseover",function(){changeflag(flag_comment);})
    flag_comment.addEventListener("mouseleave",function(){changeflag(flag_comment);})
    toolbar_wrapper.appendChild(flag_comment);}

    //if current user is the same as the rater he can remove or edit the rating
    if (issame == "true"){
        // //editing component
        // var edit_comment = document.createElement("i");
        // edit_comment.classList.add("far","fa-edit","edit_button");
        // //on click toggle editable content, if comment_text is editable place focus on the comment_text and show the entire comment.
        // edit_comment.addEventListener("click", function (){ editComment(see_more,comment_text,confirm_edit,cancel_edit,edit_comment);})
        // toolbar_wrapper.appendChild(edit_comment);

        //remove comment component
        var remove_comment = document.createElement("i");
        remove_comment.classList.add("fa","fa-trash","remove_button");
        toolbar_wrapper.appendChild(remove_comment);
        remove_comment.addEventListener("click", function(){
        // ask for confirmation that a user indeed wants to delete his comments
            if (confirm("Are you sure you want to delete this rating?")== true){
                removeRating(BP_id,ratingid,rating_wrapper);
            }
        }); 
   }

   //add comment author and date to the meta info wrapper
   meta_info_wrapper.appendChild(name_text);
   meta_info_wrapper.appendChild(date_posted_text);

   //add meta info and the toolbar to the topbar
   topbar_wrapper.appendChild(meta_info_wrapper);
   topbar_wrapper.appendChild(toolbar_wrapper);

   //add topbar in the content wrapper
   content_wrapper.appendChild(topbar_wrapper); 
   //paste the comment text into the content wrapper

   createUserRatingDisplay(content_wrapper,text,dimensioninfo);

   if (ratingtext){
   content_wrapper.appendChild(comment_text);
   }
   //paste picture wrapper in the comment wrapper
   rating_wrapper.appendChild(picture_wrapper); 
   //paste content into the comment wrapper
   rating_wrapper.appendChild(content_wrapper); 
   // createLikeDislikeRating(content_wrapper,4,3);//create dislikelike
   root.appendChild(rating_wrapper);
}
//function to get occurences of ratings 
function organizelist(arr,max,stepsize,type) {
    var a = [], b = [], prev,pos = [],neg = [];
    arr.sort();
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            a.push(arr[i]);
            b.push(1);
            if (type == "binstar"){
                if (arr[i] > 0){
                    pos.push(arr[i]);
                }
                else if(arr[i] <0){
                    neg.push(arr[i]);
                }

            }
        } else {
            b[b.length-1]++;
        }
        prev = arr[i];
    }
    const zip = (arr1, arr2) => arr1.map((k, i) => [k, arr2[i]]);
    incompleteList = zip(a, b); // create frequence tuple list of the array
        
        if (type != "binstar"){
            for (n of numbersBetweenAandBwithFactorC(1,max,stepsize)){ // add the individual tuples with no occurences withing the arrays range (include a (2,0) tuple if 2 never occurs in the array)
                if (! a.includes(n)){
                    incompleteList.push([n,0]);
                }   
            }
        }
        else{
            for (n of numbersBetweenAandBwithFactorC(-max,max,1)){ // add the individual tuples with no occurences withing the arrays range (include a (2,0) tuple if 2 never occurs in the array)
                if (! a.includes(n) && n != 0){
                    incompleteList.push([n,0]);
                }
            }
    }
    const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
    if (type != 'binstar'){
        return  [incompleteList.sort(Comparator),max,Math.round(arrAvg(arr)*10)/10];
    }
    else{
        return  [incompleteList.sort(Comparator),max,Math.round(arrAvg(arr)*10)/10,Math.round(arrAvg(pos)*10)/10,lengte(pos),Math.round(arrAvg(neg)*10)/10,lengte(neg)];   
    }
}
//function for displaying the readOnly mechanisms in the individual user reviews
function createUserRatingDisplay(root,scores,dimension){
    var ratingCollapsible = document.createElement('button');
    ratingCollapsible.classList.add('btn','btn-light','btn-icon-split');
    ratingCollapsible.style.justifyContent = 'left';

    ratingCollapsible.addEventListener("click",function(){togglevisibility(detailwrapper); changeicon(iconinstantiation)});
    ratingCollapsible.style.width = '100%';
    ratingCollapsible.style.display = 'flex';

    var icon = document.createElement('span');
    icon.classList.add('icon','text-gray-600');

    var iconinstantiation = document.createElement('i');
    iconinstantiation.classList.add('fa','fa-plus');

    var dimname = document.createElement('p');
    dimname.innerText = "Average score";
    dimname.style.width = '25%';
    dimname.style.textAlign = 'initial'
    dimname.style.marginBottom = 'auto';
    dimname.style.marginTop = 'auto';

    ratingCollapsible.appendChild(dimname);
    
    var detailwrapper = document.createElement('div');
    detailwrapper.style.display = "none";

    var list = [];
    var type = [];
    for (i in scores){
        let score         = scores[i];
        let dimensionsub  = dimension[i];
        let maxval        = dimensionsub[2];
        type.push(dimensionsub[0]);
        //get percentage of score. this indicates a quality
        list.push(score/maxval);
    }
    const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
    switch (type[0]){
        
        case 'slider':
            createbarrating(ratingCollapsible,0,100,1,arrAvg(list)*100,"readOnly");
            var ratingavg = document.createElement('p');
            ratingavg.innerText = Math.round(arrAvg(list)*100*10)/10 + ' / ' + 100 ;
            ratingavg.style.width  = '25%';
            ratingavg.style.marginRight  = 'auto';
            ratingavg.style.marginBottom = 'auto';
            ratingavg.style.marginTop    = 'auto';
            ratingCollapsible.appendChild(ratingavg);
            break;
        case 'stars':
            starRatingResult(ratingCollapsible,arrAvg(list)*100,5);
            var ratingavg = document.createElement('p');
            // below the amount of stars on 1 decimal is calculated
            ratingavg.innerText = Math.round((arrAvg(list)*5)*10)/10 + ' / ' + 5 ;
            ratingavg.style.width  = '25%';
            ratingavg.style.marginRight = 'auto';
            ratingavg.style.marginBottom = 'auto';
            ratingavg.style.marginTop    = 'auto';
            ratingCollapsible.appendChild(ratingavg);
            break;
        case 'binstars':
            let score = (arrAvg(list));
            console.log(list, arrAvg(list));
            if (arrAvg(list) > 0){
                let binstar = createBinaryStarRating(ratingCollapsible,5,5,"readOnly",0, score*5);
                binstar.style.marginRight = 'auto';
            }
            else {
                let binstar = createBinaryStarRating(ratingCollapsible,5,5,"readOnly",score*5,0);
                binstar.style.marginRight = 'auto';
            }
            break;
    }
    icon.appendChild(iconinstantiation);
    ratingCollapsible.appendChild(icon);

    
   for (i in scores){
    let score         = scores[i];
    let dimensionsub  = dimension[i];
    let ratingtype    = dimensionsub[0];
    let dimensionname = dimensionsub[1];
    let maxval        = dimensionsub[2];
    let step          = dimensionsub[4];

    var div = document.createElement('div');
    div.style.display = 'flex';

    var dimensionlabel = document.createElement('p');
    dimensionlabel.innerText = dimensionname;
    dimensionlabel.style.marginBottom = 'auto';
    dimensionlabel.style.marginTop    = 'auto';
    dimensionlabel.style.width        = '25%';
    div.appendChild(dimensionlabel);

    switch (ratingtype){
        case 'slider':
            createbarrating(div,0,maxval,step,score,"readOnly");
            var ratingavg = document.createElement('p');
            ratingavg.innerText = score + ' / ' + maxval ;
            ratingavg.style.width        = '25%';
            ratingavg.style.textAlign    = 'center';
            ratingavg.style.marginBottom = 'auto';
            ratingavg.style.marginTop    = 'auto';
            div.appendChild(ratingavg);
            break;
        case 'stars':
            createStarRating(div,maxval,score,"readOnly");
            break;
        case 'binstars':
            if (score > 0){
                createBinaryStarRating(div,maxval,maxval,"readOnly", 0, score);
            }
            else {
                createBinaryStarRating(div,maxval,maxval,"readOnly", score, 0);
            }
            break;
        }
        detailwrapper.appendChild(div);
    }
   
    root.appendChild(ratingCollapsible);
    root.appendChild(detailwrapper); 
}
function displayAggregation(root,listofscores,dimension,scale,step,type){
    if (lengte(listofscores) > 0){

        if (type == 'binstars'){
            var [scorelist,max,avg,pAVG,pAmt,nAvg,nAmt] = organizelist(listofscores,scale,step,"binstar");
        }
        else{
            var [scorelist,max,avg] = organizelist(listofscores,scale,step);
        }
        }
    else {
        scorelist = [];
        max       = 0;
        avg       = 0;
    }
    
        var ratingCollapsible = document.createElement('button');
        ratingCollapsible.classList.add('btn','btn-light','btn-icon-split');
        ratingCollapsible.style.justifyContent = 'left';
    
        ratingCollapsible.addEventListener("click",function(){togglevisibility(detailwrapper); changeicon(iconinstantiation)});
        ratingCollapsible.style.width = '100%';
        ratingCollapsible.style.display = 'flex';
    
        var icon = document.createElement('span');
        icon.classList.add('icon','text-gray-600');
    
        var iconinstantiation = document.createElement('i');
        iconinstantiation.classList.add('fa','fa-plus');
    
        var dimname = document.createElement('p');
        dimname.innerText = dimension;
        dimname.style.width = '25%';
        dimname.style.marginBottom = 'auto';
        dimname.style.marginTop    = 'auto';
        ratingCollapsible.appendChild(dimname);
        if (type == 'slider'){
            createbarrating(ratingCollapsible,0,max,step,Math.round(avg),"readOnly");
        }
        else if(type == 'stars'){
            starRatingResult(ratingCollapsible,((avg/max)*100),max);
        }
        else if(type == 'binstars'){
           let binstar = createBinaryStarRating(ratingCollapsible,max,max,"readOnlyAgg", nAvg, pAVG);
           binstar.style.marginRight = 'auto';
        }

        var ratingavg = document.createElement('p');
        ratingavg.innerText = avg + ' / ' + max ;
        ratingavg.style.width  = '20%';
        ratingavg.style.marginBottom = 'auto';
        ratingavg.style.marginTop    = 'auto';
        ratingavg.style.marginRight  = 'auto';
        if (type != 'binstars'){
        ratingCollapsible.appendChild(ratingavg);
        }

        icon.appendChild(iconinstantiation);
        ratingCollapsible.appendChild(icon);
        var detailwrapper = document.createElement('div');
        detailwrapper.style.display = "none";
    
        ratingdecr = document.createElement('p');
        ratingdecr.innerText = avg + " average based on " + lengte(listofscores) + " ratings";
        ratingdecr.style.marginBottom = '0px';
        ratingdecr.style.marginTop    = '10px';
        ratingdecr.classList.add('toptext');
    
        detailwrapper.appendChild(ratingdecr);
        if (lengte(scorelist) > 0){
        var topbar = document.createElement('div');
        topbar.style.display = "flex";
        topbar.style.marginBottom = "10px";
        var t1 = document.createElement('p');
        t1.innerText = "Score";
        t1.style.marginBottom = '0px';
        t1.style.width = '10%';
        t1.style.textAlign = 'center';
        var t2 = document.createElement('p');
        t2.innerText = "Percentage";
        t2.style.marginBottom = '0px';
        t2.style.width = '75%';
        t2.style.textAlign = 'center';
        var t3 = document.createElement('p');
        t3.innerText = "Amount";
        t3.style.marginBottom = '0px';
        t3.style.width = '15%';
        t3.style.textAlign = 'center';
        topbar.appendChild(t1);
        topbar.appendChild(t2);
        topbar.appendChild(t3);
        detailwrapper.appendChild(topbar);
        }
    
    
        for (score of scorelist){
            var containerwrapper = document.createElement('div');
            containerwrapper.style.display = "flex";
            containerwrapper.style.marginBottom = '5px';
        
            var scoretext = document.createElement('p');
            scoretext.classList.add("scoretext");
            scoretext.innerText = score[0];// rating score
            scoretext.style.width = '10%';
            scoretext.style.textAlign = 'center';
            
            var barwrapper = document.createElement("div");
            barwrapper.style.width = '75%';
            barwrapper.style.border = '1px solid black';
            var bar        = document.createElement("div");
            var percent = (score[1]/lengte(listofscores))*100;// calculate the percentage of the occurences of a certain score compared to the amount of scores.
    
            bar.style.width = percent + '%';
            bar.style.height = '100%';
            bar.style.background = 'rgb(69, 145, 72)';
    
            var frequencytext = document.createElement('p');
            frequencytext.innerText = score[1] + ' (' + Math.round(percent) + '%)';// rating frequency and percentage
            frequencytext.classList.add("scoretext");
            frequencytext.style.width = '15%';
            frequencytext.style.textAlign = 'center';
    
            containerwrapper.appendChild(scoretext);
            barwrapper.appendChild(bar);
            containerwrapper.appendChild(barwrapper);
            containerwrapper.appendChild(frequencytext);
            detailwrapper.appendChild(containerwrapper);
        }
        root.appendChild(ratingCollapsible);
        root.appendChild(detailwrapper);
        return detailwrapper;

}


function displayBinstarAggregation(){}
function displayLikeDislikeReview(){}
function displayeBayReview(){}

// supporting function for getting an array from all numbers between lowEnd and highEnd
function numbersBetweenAandB(lowEnd,highEnd){
    var list = [];
    for (var i = lowEnd; i <= highEnd; i++) {
        list.push(i);
    }
    return list;
}
// supporting function for getting an array from all numbers between lowEnd and highEnd with interval factor
function numbersBetweenAandBwithFactorC(lowEnd,highEnd,factor){
    var list = [];
    for (var i = lowEnd; i <= highEnd; i++) {
        if (((i/factor) - Math.floor(i/factor)) == 0){
            list.push(i);
        }
    }
    return list;
}
// supporting function for transposing the array of arrays of the ratinginfo
// [['sustainability','savings','fun'] , [1,2,3]] -> [['sustainability',1],['savings',2],['fun',3]]
function transposeInfo(list){
    let returnlist  = [];
    let types       = list[0];
    let ratingdim   = list[1];
    let ratingscale = list[2];
    let stepsize    = list[3];
    let descr       = list[4];
    
    for (i of numbersBetweenAandB(0,lengte(types)-1)){
        let listitem = [types[i],ratingdim[i],ratingscale[i],'input',stepsize[i],1,descr[i]];
        returnlist.push(listitem);
    }
    return returnlist;
}
//function to extract the scores from tatings and transpose them so they are grouped by dimension
function transposeScores(list){
    var scorelength           = 0;
    var definitivescorelist   = [];
    var intermediatescorelist = [];
    //extract all ratings
    for (rating of list){
        intermediatescorelist.push(rating[2]);
        scorelength = lengte(rating[2]);
    }
    //transpose the ratings to group the ratings by dimension
    for (i of numbersBetweenAandB(0,scorelength-1)){
        var iList = [];
        for (score of intermediatescorelist){
            iList.push(score[i]);
        }
        definitivescorelist.push(iList)
    }
    return definitivescorelist;
}
// helper function to transpose an array of arrays
// similar to transposeInfo but this function is more abstract and can be used on all arrays
function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
}
// function for removing all rating related items
function remove_rating_elements(){
    myNodes = [document.getElementById('ratingsection')];
    for (myNode of myNodes){
        while(myNode.hasChildNodes()){
            myNode.removeChild(myNode.firstChild);
        }
    }
}
//supporting function for ordering a list of tuples on its 1st element 
function Comparator(a, b) {
    if (a[0] > b[0]) return -1;
    if (a[0] < b[0]) return 1;
    return 0;
}
//supporting function for toggling the visibility of an element. Used in display aggregation functions
function togglevisibility(e) {
    if (e.style.display === "none") {
      e.style.display = "block";
    } else {
      e.style.display = "none";
    }
}
//supporting function for changing the plus icon to a minus icon once the collapsible is opened
function changeicon(e){
    e.classList.toggle("fa-plus");
    e.classList.toggle("fa-minus");
}
//supporting for creating a textinput area
function createTextArea(){
   var textarea = document.createElement('textarea');
   textarea.type = "field";
   textarea.classList.add("form-control","bg-light","border-0","small");
   textarea.style.marginTop = '0px';
   textarea.style.marginBottom = '15px';
   textarea.style.height       = 'auto';
   textarea.style.width        = '80%';
   textarea.style.margin       = 'auto';
   return textarea;
}
//function for creating the total aggregation of a BP's rating to allow for quick insight into the ratings without looking into individual ratings or aggregations within the dimensions
function createTotalAggregation(root,transposedScores,transposedInfo){
    const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
    
    var dimensionScores = [];
    var type            = null;
    var lengte_          =  0;
    //parse all scores and extract the average score per dimension
    dimensionAvglist = []
    for (dimension of transposedScores){
        dimensionScorelist = [];
        for (score of dimension){
            score = parseInt(score);
            dimensionScorelist.push(score);
        }
        lengte_ = dimensionScorelist.length;
        dimensionAvglist.push(arrAvg(dimensionScorelist));
    }
    //extract the dimension info per dimension
    //calculate % with the use of dimensionmax and avgdimension
    for (i in transposedInfo){
        dimension         = transposedInfo[i];
        type              = dimension[0];
        let dimensionname = dimension[1];
        let dimensionmax  = dimension[2];
        let dimensionavg  = dimensionAvglist[i];
        if (type == 'slider' || type == 'stars'){
        score    = (dimensionavg/dimensionmax)*100;
        }
        if (type == 'binstars'){
        score    = dimensionavg;
        }
        if (type == 'dislikelike'){
        score   = dimensionavg;
        }

        dimensionScores.push([score,dimensionavg,dimensionname]);
    }
    var scores = dimensionScores.map(function(x) {
        return x[0];
    });

    var wrapper       = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.border  = '1px solid black';
    wrapper.style.marginTop = '10px';
    wrapper.style.marginBottom = '10px';

    var label         = document.createElement('p');
    label.innerText   = "Overall rating";
    label.style.marginBottom = 'auto';
    label.style.width = '30%';
    label.style.marginTop    = 'auto';
    label.style.textAlign = 'center';

    var avglabel      = document.createElement('p');
    avglabel.style.marginBottom = 'auto';
    avglabel.style.marginTop    = 'auto';
    avglabel.style.width = '20%';
    avglabel.style.textAlign = 'center';
    wrapper.appendChild(label);

    var amtlabel = document.createElement('p');
    amtlabel.innerText = lengte_ + ' ratings';
    amtlabel.style.marginBottom = 'auto';
    amtlabel.style.marginTop    = 'auto';
    amtlabel.style.width = '20%';
    amtlabel.style.textAlign = 'center';

    if (type == 'slider'){
        createbarrating(wrapper,0,100,1,arrAvg(scores),"readOnly");
        avglabel.innerText = Math.round(arrAvg(scores)) + ' / ' + 100;
        wrapper.appendChild(avglabel);
    }
    else if(type == 'stars'){
        starRatingResult(wrapper,arrAvg(scores),5);
        avglabel.innerText = (Math.round(arrAvg(scores))/100*5) + ' / ' + 5;
        wrapper.appendChild(avglabel);
    }
    else if(type == 'binstars'){
        if (arrAvg(scores)> 0){
        mech = createBinaryStarRating(wrapper,5,5,"readOnlyAgg", 0, Math.round(arrAvg(scores)));
        }
        else{
        mech = createBinaryStarRating(wrapper,5,5,"readOnlyAgg",Math.round(arrAvg(scores)), 0);
        }
        mech.style.marginRight = 'auto';
    }
    wrapper.appendChild(amtlabel);
    
 
    root.appendChild(wrapper);

}
