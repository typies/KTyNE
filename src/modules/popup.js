import mainPubSub from "./PubSub";

class EdgeworkPopup {
  constructor() {
    return this;
  }
  domElements = {
    popupOverlay: document.querySelector(".popup-overlay"),
    edgework: document.querySelector(".edgework"),
    edgeworkForm: document.querySelector(".edgework-form"),
    newEdgeworkBtn: document.querySelector(".edgework-btn"),
    serialInput: document.querySelector("#serial"),
    batteriesInput: document.querySelector("#batteries"),
    holdersInput: document.querySelector("#holders"),
    portsInput: document.querySelector("#ports"),
    closeFormBtn: document.querySelector("#edgework-form-close-btn"),
    resetFormBtn: document.querySelector("#edgework-form-reset-btn"),
  };

  init() {
    this.configureFormButtons();
    this.domElements.serialInput.addEventListener("input", () =>
      this.validateSerialInput()
    );
    this.domElements.batteriesInput.addEventListener("input", () =>
      this.validateBatteries()
    );
    this.domElements.holdersInput.addEventListener("input", () =>
      this.validateBatteries()
    );
    this.domElements.portsInput.addEventListener("input", () =>
      this.validatePorts()
    );
    return this;
  }

  configureFormButtons() {
    const newEdgeworkBtn = this.domElements.newEdgeworkBtn;
    const popupOverlay = this.domElements.popupOverlay;
    const closeFormBtn = this.domElements.closeFormBtn;
    const resetFormBtn = this.domElements.resetFormBtn;
    const edgeworkForm = this.domElements.edgeworkForm;
    newEdgeworkBtn.addEventListener("click", () => {
      popupOverlay.classList.remove("hidden");
      edgeworkForm.classList.remove("hidden");
      document.querySelector("#serial").focus();
    });

    closeFormBtn.addEventListener("click", () => {
      popupOverlay.classList.add("hidden");
      edgeworkForm.classList.add("hidden");
    });

    resetFormBtn.addEventListener("click", () => {
      this.resetForm();
      this.resetEdgework();
      document.querySelector("#serial").focus();
    });

    edgeworkForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.validateForm();
      if (!edgeworkForm.checkValidity()) {
        edgeworkForm.reportValidity();
        return;
      }
      this.resetEdgework();
      const formData = new FormData(edgeworkForm);
      this.populateSerialEle(formData.get("serial"));
      this.populateBatteries(
        formData.get("batteries"),
        formData.get("holders")
      );
      this.populatePortPlates(this.standardizePorts(formData.get("ports")));
      this.populateIndicators(
        formData,
        formData.keys().filter((key) => key.includes("ind"))
      );
      popupOverlay.classList.add("hidden");
      edgeworkForm.classList.add("hidden");
    });
  }

  validateSerialInput() {
    const serialInput = this.domElements.serialInput;
    serialInput.setCustomValidity("");
    const validSerialRegex = /[A-Za-z0-9]{6}/;
    const serial = serialInput.value;
    if (!serial.match(validSerialRegex) || serial.length !== 6) {
      serialInput.setCustomValidity(
        "Invalid serial. Must be exactly 6 letters/numbers"
      );
      return false;
    }
    return true;
  }

  validateBatteries() {
    const batteriesInput = this.domElements.batteriesInput;
    const holdersInput = this.domElements.holdersInput;
    const batteries = batteriesInput.value;
    const holders = holdersInput.value;
    batteriesInput.setCustomValidity("");
    holdersInput.setCustomValidity("");
    if (batteries > 2 * holders) {
      batteriesInput.setCustomValidity("Too much batteries not even holders!");
      return false;
    }

    if (holders > batteries) {
      holdersInput.setCustomValidity("Too much holders not enough batteries?");
      return false;
    }
    return true;
  }

  validateForm() {
    this.validateSerialInput();
    this.validateBatteries();
    this.validatePorts();
  }

  populateSerialEle(serialValue) {
    const edgework = this.domElements.edgework;
    if (!serialValue) return;
    const newSerialEle = document.createElement("div");
    newSerialEle.classList.add("widget", "serial");
    newSerialEle.textContent = serialValue.toUpperCase();
    edgework.appendChild(newSerialEle);
  }

  populateBatteries(batteries, holders) {
    const numOfAAPairs = batteries - holders;
    const numOfD = batteries - 2 * numOfAAPairs;
    const edgework = this.domElements.edgework;
    const batteryDiv = document.createElement("div");
    batteryDiv.classList.add("battery-wrapper");

    for (let i = 0; i < numOfAAPairs; i++) {
      const newAAWidget = document.createElement("div");
      newAAWidget.classList.add("widget", "battery", "aa");
      batteryDiv.appendChild(newAAWidget);
    }

    for (let i = 0; i < numOfD; i++) {
      const newDWidget = document.createElement("div");
      newDWidget.classList.add("widget", "battery", "d");
      batteryDiv.appendChild(newDWidget);
    }
    edgework.appendChild(batteryDiv);
  }

  populateIndicators(formData, indicatorKeys) {
    const edgework = this.domElements.edgework;
    const litIndDiv = document.createElement("div");
    litIndDiv.classList.add("ind-wrapper");
    const unlitIndDiv = document.createElement("div");
    unlitIndDiv.classList.add("ind-wrapper");
    indicatorKeys.forEach((key) => {
      const indVal = formData.get(key);
      if (indVal === "none") return;
      const newIndicator = document.createElement("div");
      newIndicator.classList.add("widget", "indicator");
      newIndicator.textContent = key.split("-")[0].toUpperCase();
      if (indVal === "lit") {
        newIndicator.classList.add("lit");
        litIndDiv.appendChild(newIndicator);
      }
      if (indVal === "unlit") {
        newIndicator.classList.add("unlit");
        unlitIndDiv.appendChild(newIndicator);
      }
    });
    edgework.append(litIndDiv);
    edgework.append(unlitIndDiv);
  }

  populatePortPlates(portList) {
    const edgework = this.domElements.edgework;
    if (portList.length === 0) return;
    const plateDiv = document.createElement("div");
    portList.forEach((plate) => {
      const newPlate = document.createElement("div");
      newPlate.classList.add("widget", "portplate");
      const ports = plate.split(" ");
      ports.forEach((port) => {
        const newPort = document.createElement("span");
        if (port !== "") newPort.classList.add(port.toLowerCase());
        newPlate.appendChild(newPort);
      });
      plateDiv.appendChild(newPlate);
    });
    edgework.appendChild(plateDiv);
    return;
  }

  validatePorts() {
    const portsInput = this.domElements.portsInput;
    portsInput.setCustomValidity("");
    this.standardizePorts(portsInput.value);

    return true;
  }

  standardizePorts(input) {
    if (input == "") return [];

    const replacedInput = input
      .toLowerCase()
      .replaceAll(/dvid|dvi-d/g, "dvi")
      .replaceAll("para", "parallel")
      .replaceAll("ps/2", "ps2")
      .replaceAll(/rj-45|rj45/g, "rj")
      .replaceAll(/stereo|stereo rca|stereo-rca|ster/g, "rca")
      .replaceAll(",", " ")
      .replaceAll("  ", " ");
    const portsRegex =
      /[([][dvi|parallel|ps2|rj|serial|rca|empty|none| ,-]+[)\]]/g;
    const plates = replacedInput.match(portsRegex);
    if (!plates) return [];
    plates.forEach((plate, i) => {
      plates[i] = plates[i].replaceAll(/\(|\)|\[|\]/g, "");
    });
    return plates;
  }

  resetForm() {
    const edgeworkForm = this.domElements.edgeworkForm;
    edgeworkForm.reset();
    return this;
  }

  resetEdgework() {
    const edgework = this.domElements.edgework;
    edgework.replaceChildren();
    return this;
  }
}

class NumberedAlphabetPopup {
  constructor() {}

  domElements = {
    alphaBtn: document.querySelector(".alphabet-btn"),
    zeroBtn: document.querySelector(".zero-btn"),
    oneBtn: document.querySelector(".one-btn"),
    alphaPopup: document.querySelector(".alphabet-popup"),
  };
  configureFormButtons() {
    const alphaBtn = this.domElements.alphaBtn;
    const alphaPopup = this.domElements.alphaPopup;
    const zeroBtn = this.domElements.zeroBtn;
    const oneBtn = this.domElements.oneBtn;
    alphaBtn.addEventListener("click", () => {
      alphaPopup.classList.toggle("hidden");
      alphaPopup.classList.toggle("selected");
    });

    zeroBtn.addEventListener("click", () => {
      this.changeLabelsZero();
    });

    oneBtn.addEventListener("click", () => {
      this.changeLabelsOne();
    });
  }

  changeLabelsZero() {
    const zeroBtn = this.domElements.zeroBtn;
    const oneBtn = this.domElements.oneBtn;
    const spans = this.domElements.alphaPopup.querySelectorAll("div span");
    spans.forEach((span, index) => {
      const spanParts = span.textContent.split(":");
      spanParts[0] = index;
      span.textContent = spanParts.join(":");
    });
    spans[9].classList.add("single-digit");
    zeroBtn.classList.add("selected");
    oneBtn.classList.remove("selected");
  }

  changeLabelsOne() {
    const zeroBtn = this.domElements.zeroBtn;
    const oneBtn = this.domElements.oneBtn;
    const spans = this.domElements.alphaPopup.querySelectorAll("div span");
    spans.forEach((span, index) => {
      const spanParts = span.textContent.split(":");
      spanParts[0] = index + 1;
      span.textContent = spanParts.join(":");
    });
    spans[9].classList.remove("single-digit");
    zeroBtn.classList.remove("selected");
    oneBtn.classList.add("selected");
  }

  init() {
    this.configureFormButtons();
    return this;
  }
}

class NewModuleListItemPopup {
  constructor() {
    return this;
  }
  domElements = {
    newModuleBtn: document.querySelector("#add-new-module-btn"),
    popupOverlay: document.querySelector(".popup-overlay"),
    newModuleForm: document.querySelector("#add-new-module-form"),
    importModuleBtn: document.querySelector("#import-modules-btn"),
    closeFormBtn: document.querySelector("#close-new-module-form-btn"),
    sidebarMenu: document.querySelector("#sidebar-options-menu"),
  };

  configureFormButtons() {
    const newModuleBtn = this.domElements.newModuleBtn;
    const popupOverlay = this.domElements.popupOverlay;
    const closeFormBtn = this.domElements.closeFormBtn;
    const newModuleForm = this.domElements.newModuleForm;
    const importModuleBtn = this.domElements.importModuleBtn;
    const sidebarMenu = this.domElements.sidebarMenu;
    newModuleBtn.addEventListener("click", () => {
      newModuleForm.reset();
      popupOverlay.classList.remove("hidden");
      newModuleForm.classList.remove("hidden");
      sidebarMenu.classList.add("hidden");
      document.querySelector("#add-new-module-url").focus();
    });

    importModuleBtn.addEventListener("click", () => {
      newModuleForm.classList.add("hidden");
    });

    closeFormBtn.addEventListener("click", () => {
      popupOverlay.classList.add("hidden");
      newModuleForm.classList.add("hidden");
      sidebarMenu.classList.add("hidden");
    });

    newModuleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(newModuleForm);
      mainPubSub.publish("addNewModule", {
        moduleName: formData.get("name"),
        manualUrl: formData.get("url"),
      });
      popupOverlay.classList.add("hidden");
      newModuleForm.classList.add("hidden");
    });
  }

  resetForm() {
    const newModuleForm = this.domElements.newModuleForm;
    newModuleForm.reset();
    return this;
  }

  init() {
    this.configureFormButtons();
    return this;
  }
}

class ImportModulesPopup {
  constructor() {
    return this;
  }
  domElements = {
    popupOverlay: document.querySelector(".popup-overlay"),
    importModuleBtn: document.querySelector("#import-modules-btn"),
    importModuleForm: document.querySelector("#import-modules-form"),
    closeFormBtn: document.querySelector("#close-import-form-btn"),
    resetFormBtn: document.querySelector("#reset-import-form-btn"),
    textAreaInput: document.querySelector("#import-modules-text"),
    fileUploadInput: document.querySelector("#import-modules-file"),
    addExampleBtn: document.querySelector("#import-modules-example"),
    sidebarMenu: document.querySelector("#sidebar-options-menu"),
  };

  configureFormButtons() {
    const importModuleBtn = this.domElements.importModuleBtn;
    const popupOverlay = this.domElements.popupOverlay;
    const resetFormBtn = this.domElements.resetFormBtn;
    const closeFormBtn = this.domElements.closeFormBtn;
    const importModuleForm = this.domElements.importModuleForm;
    const textAreaInput = this.domElements.textAreaInput;
    const fileUploadInput = this.domElements.fileUploadInput;
    const addExampleBtn = this.domElements.addExampleBtn;
    const sidebarMenu = this.domElements.sidebarMenu;
    importModuleBtn.addEventListener("click", () => {
      importModuleForm.reset();
      popupOverlay.classList.remove("hidden");
      importModuleForm.classList.remove("hidden");
      sidebarMenu.classList.add("hidden");
    });

    resetFormBtn.addEventListener("click", () => {
      this.resetForm();
      textAreaInput.focus();
    });

    closeFormBtn.addEventListener("click", () => {
      popupOverlay.classList.add("hidden");
      importModuleForm.classList.add("hidden");
    });

    addExampleBtn.addEventListener("click", (event) =>
      this.handleExample(event)
    );

    fileUploadInput.addEventListener(
      "change",
      this.handleFileUpload.bind(this)
    );

    importModuleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formText = textAreaInput.textContent;
      if (formText && formText !== "") {
        if (!this.processTextarea(formText)) return;
      }

      popupOverlay.classList.add("hidden");
      importModuleForm.classList.add("hidden");
      this.resetForm();
    });
  }

  handleExample(event) {
    const textAreaInput = this.domElements.textAreaInput;
    const example = `[\n  {\n    "name": "Logic",\n    "url": "https://ktane.timwi.de/HTML/Logic.html"\n  },\n  {\n    "name": "Silly Slots",\n    "url": "https://ktane.timwi.de/HTML/Silly%20Slots.html"\n  },\n  {\n    "url": "https://ktane.timwi.de/HTML/Yippee.html"\n  }\n]`;

    if (textAreaInput.hasAttribute("contenteditable")) {
      this.currentTextInputValue = textAreaInput.textContent;

      event.target.textContent = "Hide Example";
      textAreaInput.textContent = example;
      textAreaInput.removeAttribute("contenteditable");
      return;
    }

    event.target.textContent = "Show me an example";
    textAreaInput.textContent = this.currentTextInputValue;
    textAreaInput.setAttribute("contenteditable", "");
  }

  processTextarea(formText) {
    try {
      const formTextCleaned = formText.replace(/(|\t|\n|\r)/gm, "");
      const newModules = JSON.parse(formTextCleaned);
      mainPubSub.publish("addNewModules", newModules);
      return true;
    } catch (error) {
      new BasicPopup("Adding JSON From text failed.\nError: " + error);
      return false;
    }
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    const textAreaInput = this.domElements.textAreaInput;
    if (!file) return;

    const fr = new FileReader();
    fr.onload = () => {
      textAreaInput.textContent = fr.result;
    };
    fr.onerror = () => {
      alert(
        "Unable to read file. Please use a properly formatted .json or .txt"
      );
    };
    fr.readAsText(file);
  }

  resetForm() {
    const importModuleForm = this.domElements.importModuleForm;
    const textAreaInput = this.domElements.textAreaInput;
    const addExampleBtn = this.domElements.addExampleBtn;
    importModuleForm.reset();
    textAreaInput.textContent = "";
    if (textAreaInput.hasAttribute("readonly")) addExampleBtn.click();
    return this;
  }

  init() {
    this.configureFormButtons();
    return this;
  }
}

class ExportModulesPopup {
  constructor() {
    return this;
  }
  domElements = {
    popupOverlay: document.querySelector(".popup-overlay"),
    exportModuleBtn: document.querySelector("#export-modules-btn"),
    exportModuleForm: document.querySelector("#export-modules-form"),
    closeFormBtn: document.querySelector("#close-export-form-btn"),
    copyBtn: document.querySelector("#copy-export-form-btn"),
    textAreaOutput: document.querySelector("#export-modules-text"),
    sidebarMenu: document.querySelector("#sidebar-options-menu"),
  };

  configureFormButtons() {
    const exportModuleBtn = this.domElements.exportModuleBtn;
    const popupOverlay = this.domElements.popupOverlay;
    const closeFormBtn = this.domElements.closeFormBtn;
    const copyBtn = this.domElements.copyBtn;
    const exportModuleForm = this.domElements.exportModuleForm;
    const textAreaOutput = this.domElements.textAreaOutput;
    const sidebarMenu = this.domElements.sidebarMenu;
    exportModuleBtn.addEventListener("click", () => {
      exportModuleForm.reset();
      popupOverlay.classList.remove("hidden");
      exportModuleForm.classList.remove("hidden");
      sidebarMenu.classList.add("hidden");
    });
    closeFormBtn.addEventListener("click", () => {
      popupOverlay.classList.add("hidden");
      exportModuleForm.classList.add("hidden");
    });
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(textAreaOutput.textContent);
      new BasicPopup("Copied");
    });

    exportModuleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      //export modules list and put it in textAreaOutput
      const storageItems = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const moduleName = window.localStorage.key(i);
        const manualUrl = window.localStorage.getItem(moduleName);
        storageItems.push({ name: moduleName, url: manualUrl });
      }
      storageItems.sort((a, b) => {
        if (a.name.toLowerCase().includes("appendix")) return 1;
        if (b.name.toLowerCase().includes("appendix")) return -1;
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
        return 1;
      });

      textAreaOutput.textContent = JSON.stringify(storageItems, null, 2);
    });
  }

  resetForm() {
    const exportModuleForm = this.domElements.exportModuleForm;
    const textAreaOutput = this.domElements.textAreaOutput;
    exportModuleForm.reset();
    textAreaOutput.textContent = "";
    return this;
  }

  init() {
    this.configureFormButtons();
    return this;
  }
}

class BasicPopup {
  constructor(
    message,
    inputLabel,
    submitBtnText,
    submitCallback,
    closeBtnText = "Close"
  ) {
    this.message = message;
    this.inputLabel = inputLabel;
    this.submitBtnText = submitBtnText;
    this.submitCallback = submitCallback;
    this.closeBtnText = closeBtnText;
    this.init();
    return this;
  }
  domElements = {
    superOverlay: document.querySelector("#super-overlay"),
    generalForm: document.querySelector("#general-popup"),
    generalPopupTitle: document.querySelector("#general-popup-title"),
    closePopup: document.querySelector("#general-close-btn"),
    submitPopup: document.querySelector("#general-submit-btn"),
    generalPopupLabel: document.querySelector("#general-popup-label"),
    generalPopupInput: document.querySelector("#general-input"),
  };

  init() {
    const superOverlay = this.domElements.superOverlay;
    const generalForm = this.domElements.generalForm;
    const generalPopupTitle = this.domElements.generalPopupTitle;
    const closePopup = this.domElements.closePopup;
    const submitPopup = this.domElements.submitPopup;
    const generalPopupLabel = this.domElements.generalPopupLabel;
    const generalPopupInput = this.domElements.generalPopupInput;

    const doCallback = () => {
      this.submitCallback(generalPopupInput.value);
      close();
    };

    const close = () => {
      superOverlay.classList.add("hidden");
      generalForm.classList.add("hidden");
      generalPopupLabel.classList.add("hidden");
      generalPopupInput.classList.add("hidden");
      closePopup.classList.remove("hidden");
      submitPopup.classList.add("hidden");
      closePopup.removeEventListener("click", close);
      submitPopup.removeEventListener("click", doCallback);
    };

    superOverlay.classList.remove("hidden");
    generalForm.classList.remove("hidden");

    generalPopupTitle.textContent = this.message;
    generalPopupInput.value = "";
    closePopup.textContent = this.closeBtnText;

    closePopup.addEventListener("click", close);

    if (this.inputLabel) {
      generalPopupLabel.textContent = this.inputLabel;
      generalPopupLabel.classList.remove("hidden");
      generalPopupInput.classList.remove("hidden");
      submitPopup.classList.remove("hidden");
      generalPopupInput.focus();
    }

    if (this.submitBtnText) {
      submitPopup.textContent = this.submitBtnText;
      submitPopup.addEventListener("click", doCallback);
    }
  }
}

class NukeWarningPopup {
  constructor() {
    return this;
  }
  domElements = {
    popupOverlay: document.querySelector(".popup-overlay"),
    closeFormBtn: document.querySelector("#close-nuke-warning-btn"),
    startNukeBtn: document.querySelector("#nuke-module-list-btn"),
    nukePopup: document.querySelector("#nuke-warning"),
    sidebarMenu: document.querySelector("#sidebar-options-menu"),
  };

  configureFormButtons() {
    const startNukeBtn = this.domElements.startNukeBtn;
    const nukePopup = this.domElements.nukePopup;
    const popupOverlay = this.domElements.popupOverlay;
    const closeFormBtn = this.domElements.closeFormBtn;
    const sidebarMenu = this.domElements.sidebarMenu;
    startNukeBtn.addEventListener("click", () => {
      popupOverlay.classList.remove("hidden");
      nukePopup.classList.remove("hidden");
      sidebarMenu.classList.add("hidden");
    });

    closeFormBtn.addEventListener("click", () => {
      popupOverlay.classList.add("hidden");
      nukePopup.classList.add("hidden");
    });

    nukePopup.addEventListener("submit", (event) => {
      event.preventDefault();
      mainPubSub.publish("nukeModuleList");
      popupOverlay.classList.add("hidden");
      nukePopup.classList.add("hidden");
    });
  }

  init() {
    this.configureFormButtons();
    return this;
  }
}

export {
  EdgeworkPopup,
  NumberedAlphabetPopup,
  NewModuleListItemPopup,
  ImportModulesPopup,
  ExportModulesPopup,
  NukeWarningPopup,
  BasicPopup,
};
