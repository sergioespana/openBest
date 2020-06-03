
// function to create the range slider
function createbarrating(root,minimum,maximum,step,value,type) {
 
  var newDiv = document.createElement("div"); 
  newDiv.classList.add("sliding-unit");
  var bar = document.createElement("input");
  bar.type = "range";
  bar.class = "slider";
  bar.min = minimum; 
  bar.max = maximum;
  bar.step = step;
  bar.value = value;
  bar.classList.add("range");
  if (type == "readOnly"){
    bar.disabled = true;
    bar.classList.add("disabled");
  }
 
  bar.oninput = function(){
    selected.innerText = this.value;
  }
  //make scale visible if needed
  bar.onfocus = function(){
    div.style.display = "flex";
  }
  //make scale invisible if no longer needed
  bar.onblur = function(){
    div.style.display = "none";
  }

  var selected = document.createElement("p");
  selected.innerText = value;
  selected.classList.add("selectedval");

  var amountOfSteps = maximum/step;
  var div = document.createElement("DIV");
  div.classList.add("sliderticks");
  div.style.display = "none";

  var newp = document.createElement("p");
  div.appendChild(newp);
  newp.innerText = 0;
  if (type != "readOnly"){
  //conditions for drawing the ticks, its linked tot the amount of steps to prevent to many ticks.
  if (amountOfSteps <= 10){
    makeTicks(amountOfSteps,1,maximum,div);
  }
  else if(amountOfSteps <=20){
    makeTicks(amountOfSteps,2,maximum,div);
  }
  else if(amountOfSteps <=40){
    makeTicks(amountOfSteps,4,maximum,div);
  }
  else if(amountOfSteps == 50){
    makeTicks(amountOfSteps,10,maximum,div);
  }
  else if(amountOfSteps == 100) {
    makeTicks(amountOfSteps,20,maximum,div);
  }
  else {
    makeTicks(amountOfSteps,30,maximum,div);
  }
}

  newDiv.appendChild(bar);
  newDiv.appendChild(selected);
  
  if (bar.readOnly == false){
    newDiv.appendChild(div);
  }
  root.appendChild(newDiv);
  return bar;
}

function getAvg(l1) {
  const total = l1.reduce((acc, c) => acc + c, 0);
  return total / l1.length;
}

function makeTicks(amountOfSteps,factor,maximum,div){
  for (step of Array.from(Array(amountOfSteps/factor).keys())){
    var newp = document.createElement("p");
    newp.innerText = (step+1)/amountOfSteps*maximum*factor;
    div.appendChild(newp);
  }
}



