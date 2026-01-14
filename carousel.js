const images = [
  { src: "assets/beeld1.webp", position: "center 75%" },
  { src: "assets/beeld2.webp", position: "center 70%" },
  { src: "assets/beeld3.webp", position: "center center" },
  { src: "assets/beeld4.webp", position: "center center" },
  { src: "assets/beeld5.webp", position: "center center" }
];

const stage = document.getElementById("carousel-stage");

const preloadImages = (sources) => {
  sources.forEach(({ src }) => {
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
    const image = images[index];
    layers[nextLayer].style.backgroundImage = `url("${image.src}")`;
    layers[nextLayer].style.backgroundPosition =
      image.position || "center center";
    layers[nextLayer].classList.add("is-active");
    layers[activeLayer].classList.remove("is-active");
    activeLayer = nextLayer;
    currentIndex = index;
  };

  const updateFromEvent = (event) => {
    if (event.target && event.target.closest(".contact")) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    const index = getIndexForX(event.clientX - rect.left, rect.width, total);
    setIndex(index);
  };

  layers[0].style.backgroundImage = `url("${images[0].src}")`;
  layers[0].style.backgroundPosition =
    images[0].position || "center center";
  layers[0].classList.add("is-active");

  stage.addEventListener("pointermove", updateFromEvent);
  stage.addEventListener("pointerdown", updateFromEvent);
}
