

//this function creates the input for the eBay rating system.
function createEbayRating(root){
  var eBayWrapper    = document.createElement("DIV");
  eBayWrapper.classList.add("eBay-rating");

  var eBayUnit       = document.createElement("DIV");
  eBayUnit.classList.add("eBay-unit");

  var eBayOptions    = document.createElement("DIV");
  eBayOptions.classList.add("eBay-options");

  var optionPositive = document.createElement("SPAN");
  optionPositive.classList.add("far", "fa-smile","eBay-option","pos");

  var optionNeutral  = document.createElement("SPAN");
  optionNeutral.classList.add("far","fa-meh","eBay-option","neut");

  var optionNegative = document.createElement("SPAN");
  optionNegative.classList.add("far","fa-frown","eBay-option","neg");

  eBayOptions.appendChild(optionNegative);
  eBayOptions.appendChild(optionNeutral);
  eBayOptions.appendChild(optionPositive);
  eBayUnit.appendChild(eBayOptions);
  eBayWrapper.appendChild(eBayUnit);
  root.appendChild(eBayWrapper);
  optionNegative.addEventListener("click", function(){changeColor("red",optionNegative,optionPositive,optionNeutral)});  
  optionPositive.addEventListener("click", function(){changeColor("green",optionNegative,optionPositive,optionNeutral)});
  optionNeutral.addEventListener("click",  function(){changeColor("orange",optionNegative,optionPositive,optionNeutral)}); 
}


//this function ensures mutual exclusion and colours the selected option
function changeColor(colour,itemneg,itempos,itemneut) {
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

//this helper function ensures that an option can be deselected without selecting an alternative option
function fliptags(item){
  if (item.classList.contains('checked')){
    item.classList.remove('checked');
  }
  else{  
  item.classList.add('checked');
  }
}

//this helper function unchecks other options
function removetags(item){
  item.classList.remove('checked');
}