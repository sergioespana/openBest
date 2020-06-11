
function createLike(root){
  var likingOptionUp   = document.createElement("i");
  likingOptionUp.classList.add("far", "fa-thumbs-up","pos",'liking-options','checked');
  root.appendChild(likingOptionUp);
}

function createDislike(root){
  var likingOptionDown = document.createElement("i");
  likingOptionDown.classList.add("far","fa-thumbs-down","neg",'liking-options','checked');
  root.appendChild(likingOptionDown);
}

//function to create the likedislikerating
function createLikeDislikeRating (root,type){

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
  likingOptionDown.classList.add("far","fa-thumbs-down","neg");

  DislikeLikeOptions.appendChild(likingOptionUp);
  DislikeLikeOptions.appendChild(likingOptionDown);

  
  DislikeLikeUnit.appendChild(DislikeLikeOptions);
  DislikeLikeWrapper.appendChild(DislikeLikeUnit);
  root.appendChild(DislikeLikeWrapper);
  
  likingOptionUp.addEventListener("click",   function(){changeColor_like("green",likingOptionUp,likingOptionDown,DislikeLikeOptions)});  
  likingOptionDown.addEventListener("click", function(){changeColor_like("red",likingOptionUp,likingOptionDown,DislikeLikeOptions)});
  
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
function removetags_like(item){
  if (item.classList.contains('checked')){
  item.classList.remove('checked');
  }
}