
function createLike(root){
  var likingOptionUp   = document.createElement("i");
  likingOptionUp.classList.add("far", "fa-thumbs-up","pos",'liking-options','checked');
  root.appendChild(likingOptionUp);
}

function createDislike(root){
  var likingOptionDown = document.createElement("i");
  likingOptionDown.classList.add("far","fa-thumbs-down","neg",'liking-options','checked','fa-flip-horizontal');
  root.appendChild(likingOptionDown);
}

//function to create the likedislikerating
function createLikeDislikeRating (root){

  var DislikeLikeWrapper = document.createElement("DIV");
  DislikeLikeWrapper.classList.add("dislike-like");

  var DislikeLikeUnit    = document.createElement("DIV");
  DislikeLikeUnit.classList.add("liking-unit");

  var DislikeLikeOptions = document.createElement("DIV");
  DislikeLikeOptions.setAttribute('data-rating', null);
  DislikeLikeOptions.setAttribute('name','dislikelike');
  DislikeLikeOptions.classList.add("liking-options");

  var likingOptionUp   = document.createElement("i");
  likingOptionUp.classList.add("far", "fa-thumbs-up","pos");

  var likingOptionDown = document.createElement("i");
  likingOptionDown.classList.add("far","fa-thumbs-down","neg",'fa-flip-horizontal');

  DislikeLikeOptions.appendChild(likingOptionUp);
  DislikeLikeOptions.appendChild(likingOptionDown);

  
  DislikeLikeUnit.appendChild(DislikeLikeOptions);
  DislikeLikeWrapper.appendChild(DislikeLikeUnit);
  root.appendChild(DislikeLikeWrapper);
  
  likingOptionUp.addEventListener("click",   function(){changeColor_Dislikelike("green",likingOptionUp,likingOptionDown,DislikeLikeOptions)});  
  likingOptionDown.addEventListener("click", function(){changeColor_Dislikelike("red",likingOptionUp,likingOptionDown,DislikeLikeOptions)});
  
  return DislikeLikeOptions;
   
}

function changeColor_Dislikelike(colour,itempos,itemneg,options) {  
  switch(colour){
      case "red":  
          removetags_like(itempos);//remove 'rated' tags from the other option
          fliptags_like(itemneg,options);// switch tags from checked to not checked and vice versa for this option
          if (itemneg.classList.contains('checked')){
            options.setAttribute('data-rating', -1);
          }
          break;
      case "green":
          removetags_like(itemneg);//remove 'checked' tags from the other option
          fliptags_like(itempos,options);// switch tags from checked to not checked and vice versa for this option
          if (itempos.classList.contains('checked')){
            options.setAttribute('data-rating', +1);
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
function removetags_like(item){
  if (item.classList.contains('checked')){
  item.classList.remove('checked');
  }
}

function createlikeRating (root){

  var LikeWrapper = document.createElement("DIV");
  LikeWrapper.classList.add("dislike-like");

  var LikeUnit    = document.createElement("DIV");
  LikeUnit.classList.add("liking-unit");

  var LikeOptions = document.createElement("DIV");
  LikeOptions.setAttribute('data-rating', null);
  LikeOptions.setAttribute('name','dislikelike');
  LikeOptions.classList.add("liking-options");

  var likingOptionUp   = document.createElement("i");
  likingOptionUp.classList.add("far", "fa-thumbs-up","pos");

  LikeOptions.appendChild(likingOptionUp);

  
  LikeUnit.appendChild(LikeOptions);
  LikeWrapper.appendChild(LikeUnit);
  root.appendChild(LikeWrapper);
  
  likingOptionUp.addEventListener("click",   function(){changeColor_like("green",likingOptionUp,LikeOptions)});  
  
  return LikeOptions;
   
}

function changeColor_like(colour,itempos,options) {  
  switch(colour){
      case "green":
          fliptags_like(itempos,options);// switch tags from checked to not checked and vice versa for this option
          if (itempos.classList.contains('checked'))
          {
            options.setAttribute('data-rating', 1);
          }
          else {
            options.setAttribute('data-rating', 0);
          }
          break;
    }
}
