//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const oldState = vscode.getState() || { colors: [] };

  /** @type {Array<{ name: string, icon: string, content: string }>} */
  let colors = oldState.colors;

  updateColorList(colors);

  // @ts-ignore
  document.querySelector(".add-color-button").addEventListener("click", () => {
    addColor({
      content: "hihi",
      icon: "https://lh3.googleusercontent.com/a-/AOh14GgofLnPE14e3bcXA6-v1W6dJWvs_uNSdLcvBqH8vQ=k-s256",
      name: "sample",
    });
  });

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "addColor": {
        addColor(message);
        break;
      }
      case "clearColors": {
        colors = [];
        updateColorList(colors);
        break;
      }
    }
  });

  /**
   * @param {Array<{ name: string, icon: string, content: string }>} colors
   */
  function updateColorList(colors) {
    const ul = document.querySelector(".color-list");
    // @ts-ignore
    ul.textContent = "";
    for (const color of colors) {
      const li = document.createElement("li");
      li.className = "color-entry";

      const colorPreview = document.createElement("div");
      colorPreview.className = "color-preview";

      colorPreview.style.backgroundColor = `#00ff00`;
      colorPreview.addEventListener("click", () => {
        onColorClicked(color.name);
      });

      const img = document.createElement("img");
      img.className = "color-img";
      img.src =
        "https://lh3.googleusercontent.com/a-/AOh14GgofLnPE14e3bcXA6-v1W6dJWvs_uNSdLcvBqH8vQ=k-s256"; //color.icon;
      img.alt = "image load";
      img.width = 200;
      img.height = 100;
      img.addEventListener("change", (e) => {
        // @ts-ignore
        const value = e.target.value;
        if (!value) {
          // Treat empty value as delete
          colors.splice(colors.indexOf(color), 1);
        } else {
          color.content = value;
        }
        updateColorList(colors);
      });
      const img2 = document.createElement("img");
    //   img2.className = "color-img2";
      img2.src =
        "url(https://lh3.googleusercontent.com/a-/AOh14GgofLnPE14e3bcXA6-v1W6dJWvs_uNSdLcvBqH8vQ=k-s256)"; //color.icon;
      img2.alt = "image load";
      img2.width = 200;
      img2.height = 100;
      img2.addEventListener("change", (e) => {
        // @ts-ignore
        const value = e.target.value;
        if (!value) {
          // Treat empty value as delete
          colors.splice(colors.indexOf(color), 1);
        } else {
          color.content = value;
        }
        updateColorList(colors);
      });
      
      colorPreview.appendChild(img);

      li.appendChild(colorPreview);
      li.append(img2);

      const input = document.createElement("input");
      input.className = "color-input";
      input.type = "text";
      input.value = color.icon;
      input.addEventListener("change", (e) => {
        // @ts-ignore
        const value = e.target.value;
        if (!value) {
          // Treat empty value as delete
          colors.splice(colors.indexOf(color), 1);
        } else {
          color.content = value;
        }
        updateColorList(colors);
      });
      li.appendChild(input);

      li.appendChild(document.createElement("br"));

      // @ts-ignore
      ul.appendChild(li);
    }

    // Update the saved state
    vscode.setState({ colors: colors });
  }

  /**
   * @param {string} color
   */
  function onColorClicked(color) {
    vscode.postMessage({ type: "colorSelected", value: color });
  }

  /**
   * @param {{ name: string, icon: string, content: string }} data
   */
  function addColor(data) {
    colors.push({ ...data });
    updateColorList(colors);
  }
})();
