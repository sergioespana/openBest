
function createPositiveOption(root){
  var optionPositive = document.createElement("SPAN");
  optionPositive.classList.add("far", "fa-smile","eBay-option","pos","checked");
  optionPositive.style.fontSize = '160%';
  optionPositive.style.marginBottom = 'auto';
  optionPositive.style.marginTop = 'auto';
  root.appendChild(optionPositive);
}
function createNegativeOption(root){
  var optionNegative = document.createElement("SPAN");
  optionNegative.classList.add("far","fa-frown","eBay-option","neg","checked");
  optionNegative.style.fontSize = '160%';  
  optionNegative.style.marginBottom = 'auto';
  optionNegative.style.marginTop = 'auto';
  root.appendChild(optionNegative);

}
function createNeutralOption(root){
  var optionNeutral  = document.createElement("SPAN");
  optionNeutral.classList.add("far","fa-meh","eBay-option","neut","checked");
  optionNeutral.style.fontSize = '160%';
  optionNeutral.style.marginBottom = 'auto';
  optionNeutral.style.marginTop = 'auto';
  root.appendChild(optionNeutral);

}

//this function creates the input for the eBay rating system.
function createEbayRating(root,type){
  var eBayWrapper    = document.createElement("DIV");
  eBayWrapper.classList.add("eBay-rating");
  eBayWrapper.setAttribute("data-rating",0);
  eBayWrapper.setAttribute("name","eBay");

  var eBayUnit       = document.createElement("DIV");
  eBayUnit.classList.add("eBay-unit");

  var eBayOptions    = document.createElement("DIV");
  eBayOptions.classList.add("eBay-options");

  var optionPositive = document.createElement("SPAN");
  optionPositive.classList.add("far", "fa-smile");

  var optionNeutral  = document.createElement("SPAN");
  optionNeutral.classList.add("far","fa-meh");
 
  var optionNegative = document.createElement("SPAN");
  optionNegative.classList.add("far","fa-frown");


  if (type != 'readOnly'){
    optionNeutral.classList.add("checked");
    optionNeutral.classList.add("eBay-option","neut");
    optionPositive.classList.add("eBay-option","pos");
    optionNegative.classList.add("eBay-option","neg");
    }
  eBayOptions.appendChild(optionNegative);
  eBayOptions.appendChild(optionNeutral);
  eBayOptions.appendChild(optionPositive);
  eBayUnit.appendChild(eBayOptions);
  eBayWrapper.appendChild(eBayUnit);
  root.appendChild(eBayWrapper);
  if (type != 'readOnly'){
  optionNegative.addEventListener("click", function(){changeColor("red",optionNegative,optionPositive,optionNeutral,eBayWrapper)});  
  optionPositive.addEventListener("click", function(){changeColor("green",optionNegative,optionPositive,optionNeutral,eBayWrapper)});
  optionNeutral.addEventListener("click",  function(){changeColor("orange",optionNegative,optionPositive,optionNeutral,eBayWrapper)}); 
  }
  return eBayWrapper;
}


//this function ensures mutual exclusion and colours the selected option
function changeColor(colour,itemneg,itempos,itemneut,eBayWrapper) {
    switch(colour){
      case "red":
          removetags(itempos);
          removetags(itemneut);
          fliptags(itemneg,eBayWrapper);
          break;
      case "green":
          removetags(itemneg);
          removetags(itemneut);
          fliptags(itempos,eBayWrapper);
          break;
      case "orange":
          removetags(itemneg);
          removetags(itempos);
          fliptags(itemneut,eBayWrapper);
          break;
    }
}

//this helper function ensures that an option can be deselected without selecting an alternative option
function fliptags(item,eBayWrapper){
  if (item.classList.contains('checked')){
    item.classList.remove('checked');
    eBayWrapper.setAttribute('data-rating', null);
  }
  else{  
    item.classList.add('checked');
    if (item.classList.contains("pos"))      {eBayWrapper.setAttribute('data-rating', 1);}
    else if (item.classList.contains("neut")){eBayWrapper.setAttribute('data-rating', 0);}
    else if (item.classList.contains("neg")) {eBayWrapper.setAttribute('data-rating', -1);}    
  }
}

//this helper function unchecks other options
function removetags(item){
  item.classList.remove('checked');
}