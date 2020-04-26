var db = firebase.firestore();

function getcomments(BPid) {
    startstring = "/domain/domainstate/bestpractices/"
    endstring   = "/comments"
    doelstring = startstring.concat(BPid,endstring);
    now =  getcurrentDateTime();
     // Getting a reference to all documents in the comment sub-collection for bp1
     db.collection(doelstring)
         .get().then((snapshot) => {
             // Each document that matches the query is cycled through
             snapshot.docs.forEach(doc => {
                comment_date = getTimeDifference(now,doc.data().date);
                comment_author = doc.data().author; 
                comment_img = doc.data().img; 
                comment_text = doc.data().text;
                draw_comment(comment_author,comment_date,comment_text,comment_img);
             })
     })
   }

    function pushcomment(BPid,comment_date,comment_author,comment_img,comment_text){
        startstring = "/domain/domainstate/bestpractices/";
        endstring   = "/comments";       
        doelstring = startstring.concat(BPid,endstring);
        db.collection(doelstring).add({
                date: comment_date,
                author: comment_author,
                img: comment_img,
                text: comment_text  
            })
        }
        
  function getTimeDifference(now,then){
      date_now = Date.parse(now);
      date_then = Date.parse(then);
      difference_seconds = Math.floor((date_now-date_then)/1000); 
      difference_minutes = Math.floor(difference_seconds/60);
      difference_hours   = Math.floor(difference_minutes/60);
      difference_days    = Math.floor(difference_hours/24);
      difference_weeks   = Math.floor(difference_days/7);
      difference_months  = Math.floor(difference_days/30);
      difference_years   = Math.floor((date_now-date_then)/(3.1556926 * 10^10)); 
      stam = " ago";
      var grootte = null;
    if (difference_seconds < 5){return ("just now");}
    else if (difference_seconds >= 5 && difference_seconds <= 59)
    {   grootte = " seconds";
        string = difference_seconds + grootte + stam;
        return (string);}
    else if (difference_minutes >= 1 && difference_minutes <= 59){
        if(difference_minutes == 1){grootte = " minute";}
        else{grootte = " minutes";}
        string = difference_minutes + grootte + stam;
        return (string);}
    else if (difference_hours >= 1 && difference_hours <= 23){
        if (difference_hours == 1){grootte = " hour";}
        else{grootte = " hours";}
        string = difference_hours + grootte + stam;
        return (string);}
    else if (difference_days >= 1 && difference_days <= 6){
        if(difference_days == 1){grootte = " day";}
        else{grootte = " days";}
        string = difference_days + grootte + stam;
        return (string);}
    else if (difference_weeks >= 1 && difference_weeks <= 4 && difference_months <= 1){
        if (difference_weeks == 1){ grootte = " week";}
        else {grootte = " weeks";}
        string = difference_weeks + grootte + stam;
        return (string);}
    else if (difference_weeks >= 1 && difference_weeks <= 11 || difference_months > 1){
        if (difference_months == 1){grootte = " month";}
        else {grootte = " months";}
        string = difference_months + grootte + stam;
        return (string);}
    else if (difference_years >= 1){
        if (difference_years == 1){grootte = " year";}
        else{grootte = " years";}
        string = difference_years + grootte + stam;
        return (string);}
    }
  
    

    