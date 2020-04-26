document.getElementById('option-negative').addEventListener("click", function(){changeColor("red")});  
document.getElementById('option-positive').addEventListener("click", function(){changeColor("green")});
document.getElementById('option-neutral').addEventListener("click", function(){changeColor("orange")}); 

function changeColor(colour) {
  var itemneg  = document.getElementById('option-negative');
  var itempos  = document.getElementById('option-positive');
  var itemneut = document.getElementById('option-neutral');
    switch(colour){
      
      case "red":
          removetags(itempos);
          removetags(itemneut);
          fliptags(itemneg);
          break;
      case "green":
          removetags(itemneg);
          removetags(itemneut);
          fliptags(itempos);
          break;
      case "orange":
          removetags(itemneg);
          removetags(itempos);
          fliptags(itemneut);
          break;
    }
}


function fliptags(item){
  if (item.classList.contains('checked')){
    item.classList.remove('checked');
  }
  else{  
  item.className += ' checked';
  }
}

function removetags(item){
  item.classList.remove('checked');
}