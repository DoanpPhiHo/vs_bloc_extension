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
      icon: "https://www.w3schools.com/css/img_5terre_wide.jpg",
      name: "sample",
    });
  });

  document.addEventListener("paste", (e) => {
    // @ts-ignore
    let files = e.clipboardData.files;
    let file = files[0];
    let fr = new FileReader();
    fr.onload = function () {
      // @ts-ignore
      document.querySelector("#my_image").src = fr.result;
      // @ts-ignore
      document.querySelector(".input-icon").value = file.name;
    };
    fr.readAsDataURL(file);
  });

  // @ts-ignore
  document.querySelector(".get-file").addEventListener("click", () => {
    // @ts-ignore
    let value = document.querySelector(".input-file").value;
    if (value) {
      fetchData(value);
    }
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

      const img = document.createElement("img");
      img.className = "color-img";
      img.src = color.icon;
      img.alt = "image load";
      img.style.width = "100%";
      img.style.height = "auto";
      img.addEventListener("click", () => {
        onColorClicked(color.content);
      });
      // addEventListener("change", (e) => {
      //   // @ts-ignore
      //   const value = e.target.value;
      //   if (!value) {
      //     // Treat empty value as delete
      //     colors.splice(colors.indexOf(color), 1);
      //   } else {
      //     color.content = value;
      //   }
      //   updateColorList(colors);
      // });

      li.appendChild(img);

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
   * @param {string} data
   */
  function fetchData(data) {
    vscode.postMessage({ type: "fetchData", value: data });
  }

  /**
   * @param {{ name: string, icon: string, content: string }} data
   */
  function addColor(data) {
    colors.push({ ...data });
    updateColorList(colors);
  }
  /**
   *
   * @param {string} value
   */
  function init(value) {
    console.log("init");
    if (colors.length === 0) {
      fetch(value)
        .then((value) => value.json())
        .then((value) => {
          for (let i = 0; i < value.code.length; i++) {
            this.addColor2(value.code[i]);
          }
        });
    }
  }
})();
