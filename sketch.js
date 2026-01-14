const aapPath = document.querySelector(".brand__logo-aap path");
if (aapPath) {
  const basePath = aapPath.getAttribute("d") || "";
  const leftEyeStart = { x: 26.6906, y: 26.8904 };
  const rightEyeStart = { x: 51.3687, y: 20.9243 };
  const tolerance = 1;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let targetX = pointerX;
  let targetY = pointerY;
  let framePending = false;
  const ease = 0.8;

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
    const maxX = Math.max(centerX, window.innerWidth - centerX);
    const maxY = Math.max(centerY, window.innerHeight - centerY);
    const dx = clamp((pointerX - centerX) / maxX, -1, 1);
    const dy = clamp((pointerY - centerY) / maxY, -1, 1);
    const offsetX = dx * 2.2;
    const offsetY = dy * 1.6;

    aapPath.setAttribute("d", offsetEyes(basePath, offsetX, offsetY));
  };

  const requestUpdate = () => {
    if (framePending) {
      return;
    }
    framePending = true;
    requestAnimationFrame(() => {
      framePending = false;
      const deltaX = targetX - pointerX;
      const deltaY = targetY - pointerY;
      pointerX += deltaX * ease;
      pointerY += deltaY * ease;
      updateEyes();
      if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
        requestUpdate();
      }
    });
  };

  const updatePointer = (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    requestUpdate();
  };

  window.addEventListener("pointermove", updatePointer);
  window.addEventListener("pointerdown", updatePointer);
  window.addEventListener("resize", requestUpdate);
  requestUpdate();
}
