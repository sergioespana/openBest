document.getElementById('linking-option-up').addEventListener("click", function(){changeColor_like("green")});  
document.getElementById('linking-option-down').addEventListener("click", function(){changeColor_like("red")});

function changeColor_like(colour) {
  var itemneg  = document.getElementById('linking-option-down');
  var itempos  = document.getElementById('linking-option-up');
  
    switch(colour){
      case "red":
          removetags_like(itempos);//remove 'rated' tags from the other option
          fliptags_like(itemneg);// switch tags from checked to not checked and vice versa for this option
          if (itemneg.classList.contains('checked')){
          document.querySelector('.liking-options').setAttribute('data-rating', -1);
          }
          break;
      case "green":
          removetags_like(itemneg);//remove 'checked' tags from the other option
          fliptags_like(itempos);// switch tags from checked to not checked and vice versa for this option
          if (itempos.classList.contains('checked')){
          document.querySelector('.liking-options').setAttribute('data-rating', 1);  
          }
          break;
    }
}

//this function flips the tags from checked to non checked and if none is selected the rating equals 0 which means that no rating is given
function fliptags_like(item){
  if (item.classList.contains('checked')){
    item.classList.remove('checked');
    document.querySelector('.liking-options').setAttribute('data-rating', 0); 
  }
  else{  
  item.className += ' checked';
  }
}

//method to remove the tags of the other options to ensure mutual exclusion between the options
function removetags_like(item){
  item.classList.remove('checked');
}