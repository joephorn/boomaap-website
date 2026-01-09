const images = [
  "assets/beeld1.jpg",
  "assets/beeld2.jpg",
  "assets/beeld3.jpg",
  "assets/beeld4.jpg",
  "assets/beeld5.jpg"
];

const stage = document.getElementById("poc1-stage");
const layerA = document.createElement("div");
const layerB = document.createElement("div");

layerA.className = "layer is-active";
layerB.className = "layer";

stage.appendChild(layerA);
stage.appendChild(layerB);

const layers = [layerA, layerB];
const total = images.length;
let current = 0;
let active = 0;

const setIndex = (index) => {
  if (index === current) {
    return;
  }

  current = index;
  const next = active === 0 ? 1 : 0;
  layers[next].style.backgroundImage = `url("${images[index]}")`;
  layers[next].classList.add("is-active");
  layers[active].classList.remove("is-active");
  active = next;
};

const getIndexForX = (x, width) => {
  const clamped = Math.min(Math.max(0, x), width - 1);
  return Math.min(total - 1, Math.floor(clamped / (width / total)));
};

const onMove = (event) => {
  const rect = stage.getBoundingClientRect();
  const index = getIndexForX(event.clientX - rect.left, rect.width);
  setIndex(index);
};

layerA.style.backgroundImage = `url("${images[0]}")`;
stage.addEventListener("pointermove", onMove);
