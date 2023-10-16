//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  console.log("event hello");

  const handleExtensionMessages = (event) => {
    const { data, type } = event.data;
    switch (type) {
      case "copy-to-clipboard":
        navigator.clipboard.writeText(data);
        // vscode.window.showInformationMessage('copied to clipboard');
        vscode.postMessage({
          command: "copy-to-clipboard"
      });
        break;
    }
  };

  window.addEventListener("message", handleExtensionMessages);
}());
