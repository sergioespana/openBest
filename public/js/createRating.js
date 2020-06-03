var db = firebase.firestore();
loc  = document.getElementById("ratingsection");
//testlist = [["binstars","Sustainability",5,"input",1,1,"this dimension describes blablabla a high score indicates blablabla"],["slider","Applicability",10,"input",5,5,"this dimension describes blablabla a high score indicates blablabla"],["slider","Applicability",100,"input",2,1,"this dimension describes blablabla a high score indicates blablabla"],["stars","Ease of use",5,"input",1,1,"this dimension describes blablabla a high score indicates blablabla"]];


function getRating(){}

loc1  = document.getElementById("ratinginput");
//createRatingInput(loc1,Bpid,testlist);

//function to create the rating input to be used by the user.
function createRatingInput(root,BPid,list){
    ratingcontainer = document.createElement("div");
    ratingcontainer.classList.add("ratingwrapper");
    var ratingdimensions = [];
    for (mechanism of list){
        var rating = createRating(ratingcontainer,mechanism[0],mechanism[1],mechanism[2],mechanism[3],mechanism[4],mechanism[5],mechanism[6]);
        ratingdimensions.push(rating);
    }
    submitbutton = document.createElement("button");
    submitbutton.innerText = "Submit";
    submitbutton.classList.add("btn","btn-light");
    submitbutton.addEventListener("click",function(){submitrating(BPid,collectrating(ratingdimensions))})
    ratingcontainer.appendChild(submitbutton);
    root.appendChild(ratingcontainer);
}

function submitrating(BPid,scores){
    startstring = "/domain/domainstate/bestpractices/";
    endstring   = "/ratings";       
    doelstring = startstring.concat(BPid,endstring);
    db.collection(doelstring).add({ //write rating to db
            date:   getcurrentDateTime(),
            author: getUserName(),
            img:    getUserImage(),
            email:  getUserEmail(),
            rating:  scores
        })

}
ratinglist = [];
ratinginfo = [];

function addtoRatinglist(sublist){
    ratinglist.push(sublist);
}

function addtoRatingInfolist(sublist){
    ratinginfo.push(sublist);
}
async function getratings(BPid) {
    startstring = "/domain/domainstate/bestpractices/"
    endstring   = "/ratings"
    doelstring = startstring.concat(BPid,endstring);    
    now =  getcurrentDateTime();
     // Getting a reference to all documents in the comment sub-collection for a best practice
    db.collection(doelstring).get().then(
        async function (snapshot) {
             // Each document that matches the query is cycled through
           await Promise.resolve(snapshot.docs.forEach)(
            async function (doc) {
                 // for every rating get de relevant info
               
                if (doc.id != "ratingdocument"){
                    rating_date   = getTimeDifference(now,doc.data().date);
                    rating_author = doc.data().author; 
                    rating_img    = doc.data().img; 
                    rating_score  = doc.data().rating;
                    rating_email  = doc.data().email;
                   await Promise.resolve(addtoRatinglist([rating_author,rating_date,rating_score,rating_img]));
                }
                // get rating information on the dimensions
                else {
                    rating_type             = doc.data().ratingtype;
                    rating_scale            = doc.data().Scale;
                    rating_dimensions       = doc.data().dimensions;
                    rating_dimensions_descr = doc.data().Dimension_descr;
                    rating_stepsize         = doc.data().stepsize;
                 await Promise.resolve(addtoRatingInfolist([rating_type,rating_dimensions,rating_scale,rating_stepsize,rating_dimensions_descr]));
                }
             })
            // createRatingInput(loc1,BPid,transposeInfo(ratinginfo));
            // createRatingAggregation(transposeRatings(ratinglist),transposeInfo(ratinginfo));
            console.log(ratinginfo,ratinglist);  
     })
     console.log(ratinginfo,ratinglist);
    await Promise.resolve((ratinginfo,ratinglist));
    return[ratinginfo,ratinglist];
}


async function createRatingAggregation(scorelist,ratingdimensions){
    for (i=0; i < (lengte(ratingdimensions)-1); i++){
        var ratingdimension = ratingdimensions[i]
        var ratingdimension_type = ratingdimension[0];
        var ratingdimension_name = ratingdimension[1];
        var scores               = scorelist[i];
        scores                   = scores.map(numStr => parseInt(numStr));
        scores = [1,1,1,1,2,2,2,3,4,4,5];
        //call the fitting method for aggregation
        await Promise.resolve(ratingswitch(scores,ratingdimension_name,ratingdimension_type));
        
    }

}


async function ratingswitch(scores,ratingdimension_name,ratingdimension_type){
    switch (ratingdimension_type){
        case 'stars':

            console.log("fuck");
            await Promise.resolve(displayStarAggregation(document.getElementById("Aggregated-ratings"),scores,ratingdimension_name));
           console.log("this");
           return ("yes");
          //  await displayStarAggregation(document.getElementById("Aggregated-ratings"),[1,2,3,4,5,3,3,2,3,3],ratingdimension_name);
          //  await displayStarAggregation(document.getElementById("Aggregated-ratings"),[1,2,3,4,5,3,3,2,3,3],"ratingdimension_name");
        break;
    }

}

displayStarAggregation(document.getElementById("Aggregated-ratings"),[1,1,1,1,2,2,2,3,4,4,5],"Sustainability");

//stupid();





function stupid(){
    var slist = [[1,2,3,3,3,2,2,1,1,2,3,4,5,6,7,8],[1,2,3,4,3,3,3,3,2,1,1,2,3],[1,1,1,1,2,2,3,4,4,4,4,4,4,4]];
    var dlist = ["derp","fuck","ellende"];
    
    for (i = 0; i < 3; i++){
        displayStarAggregation(document.getElementById("Aggregated-ratings"),slist[i],dlist[i]);
    }
}


//get the scores from the ratings information and group them by dimension.
function transposeRatings(list){
    var intermediatescorelist = [];
    var scorelength = 0;
    var definitivescorelist = [];
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




//function for extracting the ratings per dimention from the rating mechanisms.
function collectrating(listOfDimensions){
    var scorelist = [];
    for (dimension of listOfDimensions){
        //get score
       switch (dimension.getAttribute("name")){
           case "stars":
              var score = dimension.getAttribute("data-rating");
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
function createRating(root,name,dimension,scale,type,value,step,descr){
    
    var container = document.createElement("div");
    container.classList.add("ratingcontainer");

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
            var ratingmech = createStarRating(container,scale,3);
        break;
        //slider
        case "slider":
            var ratingmech = createbarrating(container,0,scale,step,value,type);
        break;
        //binstars
        case "binstars":
            var ratingmech = createBinaryStarRating(container,scale,scale);
        break;
    }
    root.appendChild(container);
    return ratingmech;
}

function drawRating(){}

function drawAVGRating(){}


drawRating("testman testerson","5-3-2020","dit is een rating zonder mechanisme","https://i.ytimg.com/vi/5FdEzwgOmtY/maxresdefault.jpg","123","no","yess",loc);

function drawRating(name,date,text,img,ratingid,BP_id,issame,root){

   // comment wrapper e.g. the wrapper for all the comments contents
   var comment_wrapper = document.createElement("DIV");
   //determine the width of the comment based on its level (indent)   
   comment_wrapper.id = ratingid;
   comment_wrapper.classList.add("comment_wrapper");

   /////////////////////////////////////////////////////////////////

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
      
   //the comment text itself
   var comment_text = document.createElement("p");
   comment_text.innerText = text;
  
   //allow a user to flag a comment if comment in not from current logged in user
   if (issame == "false"){
    //flagging component
    var flag_comment = document.createElement("i");
    flag_comment.classList.add("far","fa-flag","flag_button","dropbtn");
    flag_comment.addEventListener("mouseover",function(){changeflag(flag_comment);})
    flag_comment.addEventListener("mouseleave",function(){changeflag(flag_comment);})
    toolbar_wrapper.appendChild(flag_comment);}

    //if current user is the same as the comment writer he can remove or edit the comment
    if (issame == "true"){
        //editing component
        var edit_comment = document.createElement("i");
        edit_comment.classList.add("far","fa-edit","edit_button");
        //on click toggle editable content, if comment_text is editable place focus on the comment_text and show the entire comment.
        edit_comment.addEventListener("click", function (){ editComment(see_more,comment_text,confirm_edit,cancel_edit,edit_comment);})
        toolbar_wrapper.appendChild(edit_comment);

        //remove comment component
        var remove_comment = document.createElement("i");
        remove_comment.classList.add("fa","fa-trash","remove_button");
        toolbar_wrapper.appendChild(remove_comment);
        remove_comment.addEventListener("click", function(){
        // removeallChildren(level,commentid,BP_id);
        // ask for confirmation that a user indeed wants to delete his comments
            if (confirm("Are you sure you want to delete this rating? please note that reactions to this comment will also be lost")== true){
                removeComment(commentid,BP_id,comment_wrapper);
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
   content_wrapper.appendChild(comment_text);
   //paste picture wrapper in the comment wrapper
   comment_wrapper.appendChild(picture_wrapper); 
   //paste content into the comment wrapper
   comment_wrapper.appendChild(content_wrapper); 
    createLikeDislikeRating(content_wrapper,4,3);//create dislikelike
    root.appendChild(comment_wrapper);
 }

 //function to get occurences of ratings 
 function organizelist(arr) {
    var a = [], b = [], prev;
    arr.sort();
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            a.push(arr[i]);
            b.push(1);
        } else {
            b[b.length-1]++;
        }
        prev = arr[i];
    }
    const zip = (arr1, arr2) => arr1.map((k, i) => [k, arr2[i]]);
    incompleteList = zip(a, b); // create frequence tuple list of the array
    for (n of numbersBetweenAandB(1,Math.max(...arr))){ // add the individual tuples with no occurences withing the arrays range (include a (2,0) tuple if 2 never occurs in the array)
        if (! a.includes(n)){
            incompleteList.push([n,0]);
        }
    }
    const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length
    console.log(incompleteList.sort(Comparator));
    return  [incompleteList.sort(Comparator),Math.max(...arr),Math.round(arrAvg(arr)*10)/10];
}

//supporting function for ordering a list of tuples on its 1st element 
function Comparator(a, b) {
    if (a[0] > b[0]) return -1;
    if (a[0] < b[0]) return 1;
    return 0;
  }

 function displayStarAggregation(root,listofscores,dimension){
    var [scorelist,max,avg] = organizelist(listofscores);
    ratingCollapsible = document.createElement('button');
    ratingCollapsible.classList.add("rules","collapsible");
    ratingCollapsible.innerText = dimension;
    ratingCollapsible.style.display = 'flex';
    ratingCollapsible.style.background = '#a2a0a0';
    createStarRating(ratingCollapsible,max,Math.round(avg),"readOnly");
    ratingavg = document.createElement('p');
    ratingavg.innerText = avg + ' / ' + max ;
    ratingavg.marginBottom = '0px';

    ratingCollapsible.appendChild(ratingavg);

    detailwrapper = document.createElement('div');
    detailwrapper.classList.add("sub","collapsiblecontent");

    ratingdecr = document.createElement('p');
    ratingdecr.innerText = avg + " average based on " + lengte(listofscores) + " ratings";
    ratingdecr.classList.add('toptext');

    detailwrapper.appendChild(ratingdecr);

    for (score of scorelist){
        var containerwrapper = document.createElement('div');
        containerwrapper.style.display = "flex";
        containerwrapper.style.marginBottom = "10px";
        var scoretext = document.createElement('p');
        scoretext.classList.add("scoretext");
        scoretext.innerText = score[0];// rating score
        scoretext.style.width = '10%';
        scoretext.style.textAlign = 'center';
        
        var barwrapper = document.createElement("div");
        barwrapper.style.width = '80%';
        barwrapper.style.border = '1px solid black';
        var bar        = document.createElement("div");
        var percent = (score[1]/lengte(listofscores))*100;// calculate the percentage of the occurences of a certain score compared to the amount of scores.

        bar.style.width = percent + '%';
        bar.style.height = '100%';
        bar.style.background = 'green';

        var frequencytext = document.createElement('p');
        frequencytext.innerText = score[1];// rating frequency
        frequencytext.classList.add("scoretext");
        frequencytext.style.width = '10%';
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

 function displaySliderAggregation(){}

 function displayBinstarAggregation(){}

 function displayLikeDislikeReview(){}

 function displayeBayReview(){}

 function numbersBetweenAandB(lowEnd,highEnd){
    var list = [];
    for (var i = lowEnd; i <= highEnd; i++) {
        list.push(i);
    }
    return list;
 }

function transposeInfo(list){
    obj = list[0];
    var returnlist = [];
    var types = obj[0];
    var ratingdim = obj[1];
    var ratingscale = obj[2];
    var stepsize = obj[3];
    var descr = obj[4];
    for (i of numbersBetweenAandB(0,lengte(types)-1)){
        var listitem = [types[i],ratingdim[i],ratingscale[i],'input',stepsize[i],1,descr[i]];
        returnlist.push(listitem);
    }
    return returnlist;
}