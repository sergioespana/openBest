

// //function to create the likedislikerating
// function createLikeDislikeRating (root,likes,dislikes,userrating){

//   var DislikeLikeWrapper = document.createElement("DIV");
//   DislikeLikeWrapper.classList.add("dislike-like");

//   var DislikeLikeUnit    = document.createElement("DIV");
//   DislikeLikeUnit.classList.add("liking-unit");

//   var DislikeLikeOptions = document.createElement("DIV");
//   DislikeLikeOptions.setAttribute('data-rating', 0);
//   DislikeLikeOptions.classList.add("liking-options");

//   var likingOptionUp   = document.createElement("i");
//   likingOptionUp.classList.add("far", "fa-thumbs-up","pos");

//   var likingOptionDown = document.createElement("i");
//   likingOptionDown.classList.add("far","fa-thumbs-down","neg");

//   if (likes != null  || dislikes != null){

//   var amountLikes = document.createElement("p");
//   amountLikes.innerText = likes;
//   amountLikes.classList.add("pos");

//   var amountDislikes = document.createElement("p");
//   amountDislikes.innerText = dislikes;
//   amountDislikes.classList.add("neg");
//   }

//   DislikeLikeOptions.appendChild(likingOptionUp);

//   if (likes != null  || dislikes != null){
//     DislikeLikeOptions.appendChild(amountLikes);
//     }

//   DislikeLikeOptions.appendChild(likingOptionDown);
//   if (likes != null  || dislikes != null){
//     DislikeLikeOptions.appendChild(amountDislikes);
//     }
  
//   DislikeLikeUnit.appendChild(DislikeLikeOptions);
//   DislikeLikeWrapper.appendChild(DislikeLikeUnit);
//   root.appendChild(DislikeLikeWrapper);

//   likingOptionUp.addEventListener("click",   function(){changeColor_like("green",likingOptionUp,likingOptionDown,DislikeLikeOptions,amountDislikes,amountLikes)});  
//   likingOptionDown.addEventListener("click", function(){changeColor_like("red",likingOptionUp,likingOptionDown,DislikeLikeOptions,amountDislikes,amountLikes)});
//   return DislikeLikeWrapper;
   
// }

// function changeColor_like(colour,itempos,itemneg,options,amountDislikes,amountLikes) {  
//   var scPos = amountLikes.innerText;
//   var scNeg = amountDislikes.innerText;
//   switch(colour){
//       case "red":  
//           removetags_like(itempos,scPos,amountLikes);//remove 'rated' tags from the other option
//           fliptags_like(itemneg,options);// switch tags from checked to not checked and vice versa for this option
//           if (itemneg.classList.contains('checked')){
//             amountDislikes.innerText = parseInt(scNeg) + 1;
//           }
//           else {amountDislikes.innerText = parseInt(scNeg) - 1;}
//           break;
//       case "green":
//           console.log("green");
//           removetags_like(itemneg,scNeg,amountDislikes);//remove 'checked' tags from the other option
//           fliptags_like(itempos,options);// switch tags from checked to not checked and vice versa for this option
//           if (itempos.classList.contains('checked')){
//             amountLikes.innerText = parseInt(scPos) + 1;
//           }
//           else {amountLikes.innerText = parseInt(scPos) - 1;}
//           break;
//     }
// }

// //this function flips the tags from checked to non checked and if none is selected the rating equals 0 which means that no rating is given
// function fliptags_like(item,options){
//   if (item.classList.contains('checked')){
//     item.classList.remove('checked');
//     options.setAttribute('data-rating', 0); 
//   }
//   else{  
//   item.classList.add('checked');
//   }
// }

// //method to remove the tags of the other options to ensure mutual exclusion between the options
// function removetags_like(item,score,scoredigit){
//   if (item.classList.contains('checked')){
//   item.classList.remove('checked');
//   scoredigit.innerText = score - 1;
//   }

// }


function createLike(root){
  var likingOptionUp   = document.createElement("i");
  likingOptionUp.classList.add("far", "fa-thumbs-up","pos","checked");
  root.appendChild(likingOptionUp);

}
function createDislike(root){
  var likingOptionDown = document.createElement("i");
  likingOptionDown.classList.add("far","fa-thumbs-down","neg","checked");
  root.appendChild(likingOptionDown);

}



//function to create the likedislikerating
function createLikeDislikeRating (root,likes,dislikes,userrating,type){

  var DislikeLikeWrapper = document.createElement("DIV");
  DislikeLikeWrapper.classList.add("dislike-like");

  var DislikeLikeUnit    = document.createElement("DIV");
  DislikeLikeUnit.classList.add("liking-unit");

  var DislikeLikeOptions = document.createElement("DIV");
  DislikeLikeOptions.setAttribute('data-rating', 0);
  DislikeLikeOptions.setAttribute('name','dislikelike');
  DislikeLikeOptions.classList.add("liking-options");

  var likingOptionUp   = document.createElement("i");
  likingOptionUp.classList.add("far", "fa-thumbs-up","pos");

  var likingOptionDown = document.createElement("i");
  likingOptionDown.classList.add("far","fa-thumbs-down","neg");


  DislikeLikeOptions.appendChild(likingOptionUp);
  DislikeLikeOptions.appendChild(likingOptionDown);

  
  DislikeLikeUnit.appendChild(DislikeLikeOptions);
  DislikeLikeWrapper.appendChild(DislikeLikeUnit);
  root.appendChild(DislikeLikeWrapper);
  if (type != 'readOnly'){
  likingOptionUp.addEventListener("click",   function(){changeColor_like("green",likingOptionUp,likingOptionDown,DislikeLikeOptions)});  
  likingOptionDown.addEventListener("click", function(){changeColor_like("red",likingOptionUp,likingOptionDown,DislikeLikeOptions)});
  }
  return DislikeLikeOptions;
   
}

function changeColor_like(colour,itempos,itemneg,options) {  
  switch(colour){
      case "red":  
          removetags_like(itempos);//remove 'rated' tags from the other option
          fliptags_like(itemneg,options);// switch tags from checked to not checked and vice versa for this option
          if (itemneg.classList.contains('checked')){
            options.setAttribute('data-rating', -1);
          }
          else {
            
          }
          break;
      case "green":
          removetags_like(itemneg);//remove 'checked' tags from the other option
          fliptags_like(itempos,options);// switch tags from checked to not checked and vice versa for this option
          if (itempos.classList.contains('checked')){
            options.setAttribute('data-rating', +1);
          }
          else {
          }
          break;
    }
}

//this function flips the tags from checked to non checked and if none is selected the rating equals 0 which means that no rating is given
function fliptags_like(item,options){
  if (item.classList.contains('checked')){
    item.classList.remove('checked');
    options.setAttribute('data-rating', 0); 
  }
  else{  
   item.classList.add('checked');
  }
}

//method to remove the tags of the other options to ensure mutual exclusion between the options
function removetags_like(item,score,scoredigit){
  if (item.classList.contains('checked')){
  item.classList.remove('checked');
  }
}