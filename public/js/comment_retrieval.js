var db               = firebase.firestore();
var amountOfComments = 0;

async function fetchcomments(Bpid){ 
    //fetch all the comments from the database
    let comments = await getcomments(BPid);
    //organize them on argumentational level
    splitlist(comments);
    //recursively draw them
    caller();
}

//function for collecting the comments from the database
async function getcomments(BPid) {
    let commentlist = [];
    let startstring = findPath(collectionPaths, 'bestpractices') + '/';
    let endstring   = "/comments"
    let doelstring  = startstring.concat(BPid,endstring);    
    let now         =  getcurrentDateTime();
    // Getting a reference to all documents in the comment sub-collection for a best practice
    let bpCom       = await db.collection(doelstring).orderBy("date").get();
    // Each document that matches the query is cycled through 
    for(doc of bpCom.docs){  
        // for every comment get the relevant info
        let comment    = new Object();
        comment.author = doc.data().author; 
        comment.date   = getTimeDifference(now,doc.data().date);
        comment.text   = doc.data().text;
        comment.img    = doc.data().img; 
        comment.id     = doc.id; 
        comment.email  = doc.data().email;
        comment.level  = doc.data().level;
        comment.parent = doc.data().parent;
        comment.BPid   = BPid;
        comment.issame = issame(comment.email);
        commentlist.push(comment);
    }
    return commentlist;
}

// splits the list gotten from the database into levels so that not the complete list schould be gone over looking for childs of a comment on a certain level
function splitlist(list){
    //each list corresponds to a level of argument, head corresponds to the base level meaning no parent comments.
    head   = [];
    first  = [];
    second = [];
    third  = [];
    fourth = [];
    for (comment of list){
        switch(comment.level){
            case 0:
                comment.thread = "main";
                head.push(comment);
                break;
            case 1:
                comment.thread = "not main"
                first.push(comment);
                break;
            case 2:
                comment.thread = "not main"
                second.push(comment);
                break;
            case 3:
                comment.thread = "not main"
                third.push(comment);
                break;
            case 4:
                comment.thread = "not main"
                fourth.push(comment);
                break;
        }  
    }
}

// function for finding out if a comment has child comments
function checkChildren(messageID,level){
   let hasChildren = getLevelList(level+1).map(x => x.parent).includes(messageID);
   return hasChildren;  
}
// function for getting the amount of comments where its parent comment is the comment with messageID
function amountOfChildren(messageID,level){
    let amountofchildren = getLevelList(level+1).map(x => x.parent).filter(x => x == messageID).length;
    return amountofchildren;
}
// supporting function for getting the corresponding list based on a level
function getLevelList(level){
    switch(level){
        case 0:
            return head;
        case 1:
            return first;
        case 2:
            return second;
        case 3:
            return third;
        case 4:
            return fourth;
    }
}

// these functions uses draw_comment_db to translate and draw all comments of all levels.
// caller calls the recursive function for the first level and the resursive continues over the next iterations.
function caller(){
    recursive(0,null);
}

function recursive (level,parent){
   var comments = getLevelList(level);
        for (comment of comments){
            if (level == 0 || comment.parent == parent) {
                if(level == 0){display = "flex"}
                if(level > 0){display = "none"}
                draw_comment(comment,checkChildren(comment.id,level),amountOfChildren(comment.id,level),display);
                higherCounter();
                recursive(level+1,comment.id);
            }
            if (level >= 4 && comment.parent == parent ){
                draw_comment(comment,"none","none","none");
                higherCounter();
            }
        }
}

// highers the total comment counter
function higherCounter(){
    amountOfComments += 1;
    document.getElementById("comment_counter").innerText = amountOfComments + " comments";
}
// lowers the total counter
function lowerCounter(){
    amountOfComments -= 1;  
    document.getElementById("comment_counter").innerText = amountOfComments + " comments";
}

// remove one comment from the database and remove it from the screeen, last lower the counter.
function removeComment(id,BPid,comment_element){
        let startstring = findPath(collectionPaths, 'bestpractices') + '/';
        let endstring   = "/comments"
        let doelstring  = startstring.concat(BPid,endstring);
        db.collection(doelstring).doc(id).delete();
        if (comment_element){
            removeElement(comment_element);
        }
        lowerCounter();  
}

// push comment to the database and draw it on the screen using its ID once it has been pushed.
function pushcomment(comment){
        let startstring = findPath(collectionPaths, 'bestpractices') + '/';
        let endstring   = "/comments";       
        let doelstring  = startstring.concat(BPid,endstring);
        //write comment to db
        db.collection(doelstring).add({ 
                date:   comment.date,
                author: comment.author,
                img:    comment.img,
                text:   comment.text, 
                email:  comment.email,
                level:  comment.level,
                parent: comment.parent
            }).then(docRef => {
                //add to local representation of database
                //add id
                comment.id = docRef.id;
                //add just now indication
                comment.date = "just now"
                add_comment_db_repr(comment);
                //draw comment locally
                draw_comment(comment,checkChildren(comment.id,comment.level),amountOfChildren(comment.id,comment.level),"flex");
                higherCounter();             
            })
}  

// get time difference for the "posted .... ago" statement.    
function getTimeDifference(now,then){
     var date_now           = Date.parse(now);
     var date_then          = Date.parse(then);
     var difference_seconds = Math.floor((date_now-date_then)/1000); 
     var difference_minutes = Math.floor(difference_seconds/60);
     var difference_hours   = Math.floor(difference_minutes/60);
     var difference_days    = Math.floor(difference_hours/24);
     var difference_weeks   = Math.floor(difference_days/7);
     var difference_months  = Math.floor(difference_days/30);
     var difference_years   = Math.floor((date_now-date_then)/(3.1556926 * 10^10)); 
     var stem               = " ago";
    var grootte        = null;
    if (difference_seconds < 5){return ("just now");}
    else if (difference_seconds >= 5 && difference_seconds <= 59)
    {   grootte = " seconds";
        string = difference_seconds + grootte + stem;
        return (string);}
    else if (difference_minutes >= 1 && difference_minutes <= 59){
        if(difference_minutes == 1){grootte = " minute";}
        else{grootte = " minutes";}
        string = difference_minutes + grootte + stem;
        return (string);}
    else if (difference_hours >= 1 && difference_hours <= 23){
        if (difference_hours == 1){grootte = " hour";}
        else{grootte = " hours";}
        string = difference_hours + grootte + stem;
        return (string);}
    else if (difference_days >= 1 && difference_days <= 6){
        if(difference_days == 1){grootte = " day";}
        else{grootte = " days";}
        string = difference_days + grootte + stem;
        return (string);}
    else if (difference_weeks >= 1 && difference_weeks <= 4 && difference_months <= 1){
        if (difference_weeks == 1){ grootte = " week";}
        else {grootte = " weeks";}
        string = difference_weeks + grootte + stem;
        return (string);}
    else if (difference_weeks >= 1 && difference_weeks <= 11 || difference_months > 1){
        if (difference_months == 1){grootte = " month";}
        else {grootte = " months";}
        string = difference_months + grootte + stem;
        return (string);}
    else if (difference_years >= 1){
        if (difference_years == 1){grootte = " year";}
        else{grootte = " years";}
        string = difference_years + grootte + stem;
        return (string);}
}
// function to check if the current logged in user is the same as the one who made the comment.
function issame (email){
    var currentuser = getUserEmail();
    if (currentuser == email){return "true";}
    else{return "false";}
}
//function to add comments to the local list of comments to display them
function add_comment_db_repr(comment){
    switch (comment.level){
        case 0:
            head.push([comment]);
            break;
        case 1:
            first.push([comment]);
            document.getElementById("answers" + comment.parent).style.display = "block";
            break;
        case 2:
            second.push([comment]);
            document.getElementById("answers" + comment.parent).style.display = "block";
            break;
        case 3:
            third.push([comment]);
            document.getElementById("answers" + comment.parent).style.display = "block";
            break;
        case 4:
            fourth.push([comment]);
            document.getElementById("answers" + comment.parent).style.display = "block";
            break;
    }
}

function editCommentDB(newcommenttext,BPid,id){
    startstring = findPath(collectionPaths, 'bestpractices') + '/';
    tussenstring   = "/comments/"
    let doelstring     = startstring.concat(BPid,tussenstring);
    db.collection(doelstring).doc(id).update({
        text:   newcommenttext
    });
}