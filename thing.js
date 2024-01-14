let elem = document.getElementById("greenBar");
let stepValue = 0;
let incrementValue = 10;

function move() {
  if (stepValue >= 100) {
    stepValue = 0;
  }
  
  stepValue += incrementValue;
  elem.style.width = stepValue + "%";
  elem.innerHTML = stepValue + "%";
}
