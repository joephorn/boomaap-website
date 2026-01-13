const images = [
  "assets/beeld1.jpg",
  "assets/beeld2.jpg",
  "assets/beeld3.jpg",
  "assets/beeld4.jpg",
  "assets/beeld5.jpg"
];

const stage = document.getElementById("carousel-stage");

const preloadImages = (sources) => {
  sources.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};

const createLayer = () => {
  const layer = document.createElement("div");
  layer.className = "carousel__layer";
  stage.appendChild(layer);
  return layer;
};

const getIndexForX = (x, width, total) => {
  const clamped = Math.min(Math.max(0, x), width - 1);
  return Math.min(total - 1, Math.floor(clamped / (width / total)));
};

if (stage) {
  preloadImages(images);

  const layers = [createLayer(), createLayer()];
  const total = images.length;
  let currentIndex = 0;
  let activeLayer = 0;

  const setIndex = (index) => {
    if (index === currentIndex) {
      return;
    }

    const nextLayer = activeLayer === 0 ? 1 : 0;
    layers[nextLayer].style.backgroundImage = `url("${images[index]}")`;
    layers[nextLayer].classList.add("is-active");
    layers[activeLayer].classList.remove("is-active");
    activeLayer = nextLayer;
    currentIndex = index;
  };

  const updateFromEvent = (event) => {
    const rect = stage.getBoundingClientRect();
    const index = getIndexForX(event.clientX - rect.left, rect.width, total);
    setIndex(index);
  };

  layers[0].style.backgroundImage = `url("${images[0]}")`;
  layers[0].classList.add("is-active");

  stage.addEventListener("pointermove", updateFromEvent);
  stage.addEventListener("pointerdown", updateFromEvent);
}

const aapPath = document.querySelector(".brand__logo-aap path");
if (aapPath) {
  const basePath = aapPath.getAttribute("d") || "";
  const leftEyeStart = { x: 26.6906, y: 26.8904 };
  const rightEyeStart = { x: 51.3687, y: 20.9243 };
  const tolerance = 0.02;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const formatNumber = (value) => {
    const rounded = Math.round(value * 10000) / 10000;
    return rounded.toString();
  };
  const isEyeStart = (x, y) =>
    (Math.abs(x - leftEyeStart.x) < tolerance &&
      Math.abs(y - leftEyeStart.y) < tolerance) ||
    (Math.abs(x - rightEyeStart.x) < tolerance &&
      Math.abs(y - rightEyeStart.y) < tolerance);

  const offsetEyes = (pathData, offsetX, offsetY) => {
    const tokens = pathData.match(/[a-zA-Z]|-?\d*\.?\d+/g);
    if (!tokens) {
      return pathData;
    }
    const output = [];
    let command = "";
    let inEye = false;

    for (let i = 0; i < tokens.length; ) {
      const token = tokens[i];
      if (/^[a-zA-Z]$/.test(token)) {
        command = token;
        output.push(command);
        i += 1;
        if (command === "Z" || command === "z") {
          inEye = false;
        }
        continue;
      }

      if (command === "M" || command === "L") {
        const x = parseFloat(token);
        const y = parseFloat(tokens[i + 1]);
        if (command === "M" && isEyeStart(x, y)) {
          inEye = true;
        }
        output.push(
          formatNumber(inEye ? x + offsetX : x),
          formatNumber(inEye ? y + offsetY : y)
        );
        i += 2;
        continue;
      }

      if (command === "H") {
        const x = parseFloat(token);
        output.push(formatNumber(inEye ? x + offsetX : x));
        i += 1;
        continue;
      }

      if (command === "V") {
        const y = parseFloat(token);
        output.push(formatNumber(inEye ? y + offsetY : y));
        i += 1;
        continue;
      }

      output.push(token);
      i += 1;
    }

    return output.join(" ");
  };

  const updatePointer = (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  };

  const updateEyes = () => {
    if (!basePath) {
      return;
    }
    const rect = aapPath.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clamp((pointerX - centerX) / (rect.width / 2), -1, 1);
    const dy = clamp((pointerY - centerY) / (rect.height / 2), -1, 1);
    const offsetX = dx * 2.2;
    const offsetY = dy * 1.6;

    aapPath.setAttribute("d", offsetEyes(basePath, offsetX, offsetY));
  };

  window.addEventListener("pointermove", updatePointer);
  updateEyes();
  setInterval(updateEyes, 500);
}
