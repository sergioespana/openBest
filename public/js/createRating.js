loc  = document.getElementById("ratingsection");

loc1  = document.getElementById("ratinginput");
createRatingInput(loc1);

function getRating(){}

function createRatingInput(root){
    ratingcontainer = document.createElement("div");
    ratingcontainer.classList.add("ratingwrapper");
    createRating(ratingcontainer,"binstars","Sustainability",5,"input",1,1,"this dimension describes blablabla a high score indicates blablabla");
    createRating(ratingcontainer,"slider","Applicability",10,"input",5,5,"this dimension describes blablabla a high score indicates blablabla");
    createRating(ratingcontainer,"slider","Applicability",100,"input",2,1,"this dimension describes blablabla a high score indicates blablabla");
    createRating(ratingcontainer,"stars","Ease of use",5,"input",1,1,"this dimension describes blablabla a high score indicates blablabla");
    createRating(ratingcontainer,"eBay","Fun",null,"input",null,null,"this dimension describes blablabla a high score indicates blablabla");

    root.appendChild(ratingcontainer);
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
            createEbayRating(container);
        break;
        //stars
        case "stars":
            createStarRating(container,scale);
        break;
        //slider
        case "slider":
            createbarrating(container,0,scale,step,value,type,dimension,descr);
        break;
        //binstars
        case "binstars":
            createBinaryStarRating(container,scale,scale);
        break;
    }
    root.appendChild(container);
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

 