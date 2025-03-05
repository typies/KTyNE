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
    edgeworkPreview: document.querySelector("#edgework-preview"),
    serialPreview: document.querySelector("#serial-preview"),
    batteriesPreview: document.querySelector("#batteries-preview"),
    portsPreview: document.querySelector("#ports-preview"),
    indicatorsPreview: document.querySelector("#indicators-preview"),
  };

  init() {
    this.configureFormButtons();
    this.domElements.serialInput.addEventListener("input", () => {
      this.validateSerialInput();
      this.domElements.serialPreview.replaceChildren(
        this.createSerialEle(this.domElements.serialInput.value)
      );
    });
    this.domElements.batteriesInput.addEventListener("input", () => {
      this.validateBatteries();
      const preview = this.createBatteriesEle(
        this.domElements.batteriesInput.value,
        this.domElements.holdersInput.value
      );
      if (preview) this.domElements.batteriesPreview.replaceChildren(preview);
    });
    this.domElements.holdersInput.addEventListener("input", () => {
      this.validateBatteries();
      const preview = this.createBatteriesEle(
        this.domElements.batteriesInput.value,
        this.domElements.holdersInput.value
      );
      if (preview) this.domElements.batteriesPreview.replaceChildren(preview);
    });
    this.domElements.portsInput.addEventListener("input", () => {
      this.validatePorts();
      console.log(this.standardizePorts(this.domElements.portsInput.value));
      this.domElements.portsPreview.replaceChildren(
        this.createPortPlatesEle(
          this.standardizePorts(this.domElements.portsInput.value)
        )
      );
    });
    const allIndicators = this.domElements.edgeworkForm.querySelectorAll(
      "input[type='radio']"
    );
    allIndicators.forEach((ele) => {
      ele.addEventListener("click", () => {
        const formData = new FormData(this.domElements.edgeworkForm);
        this.domElements.indicatorsPreview.replaceChildren(
          ...this.createIndicatorsEles(formData)
        );
      });
    });
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
      this.populateIndicators(formData);
      this.populatePortPlates(this.standardizePorts(formData.get("ports")));
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
    const serialEle = this.createSerialEle(serialValue);
    edgework.appendChild(serialEle);
  }

  createSerialEle(serialValue) {
    if (!serialValue) return;
    const newSerialEle = document.createElement("div");
    newSerialEle.classList.add("widget", "serial");
    newSerialEle.textContent = serialValue.toUpperCase();
    console.log(newSerialEle);
    return newSerialEle;
  }

  populateBatteries(batteries, holders) {
    const edgework = this.domElements.edgework;
    const batteryDiv = this.createBatteriesEle(batteries, holders);
    edgework.appendChild(batteryDiv);
  }

  createBatteriesEle(batteries, holders) {
    if (
      batteries > 2 * holders ||
      holders > batteries ||
      !batteries ||
      !holders
    ) {
      return null;
    }
    const numOfAAPairs = batteries - holders;
    const numOfD = batteries - 2 * numOfAAPairs;
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
    return batteryDiv;
  }

  populateIndicators(formData) {
    const edgework = this.domElements.edgework;
    const indicatorEles = this.createIndicatorsEles(formData);
    edgework.append(indicatorEles[0]);
    edgework.append(indicatorEles[1]);
  }

  createIndicatorsEles(formData) {
    const indicatorKeys = formData.keys().filter((key) => key.includes("ind"));
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
    return [litIndDiv, unlitIndDiv];
  }

  populatePortPlates(portList) {
    const edgework = this.domElements.edgework;
    const plateDiv = this.createPortPlatesEle(portList);
    edgework.appendChild(plateDiv);
    return;
  }

  createPortPlatesEle(portList) {
    const plateDiv = document.createElement("div");
    if (portList.length === 0) return plateDiv;
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
    return plateDiv;
  }

  validatePorts() {
    const portsInput = this.domElements.portsInput;
    portsInput.setCustomValidity("");
    this.standardizePorts(portsInput.value);
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
    const portsRegex = /[([][dvi|parallel|ps2|rj|serial|rca|empty|none| ,-]+/g;
    const plates = replacedInput.match(portsRegex);
    console.log(plates);
    if (!plates) return [];
    plates.forEach((plate, i) => {
      plates[i] = plates[i].replaceAll(/\(|\)|\[|\]/g, "");
    });
    return plates;
  }

  resetForm() {
    const edgeworkForm = this.domElements.edgeworkForm;
    edgeworkForm.reset();
    this.domElements.serialPreview.replaceChildren();
    this.domElements.batteriesPreview.replaceChildren();
    this.domElements.portsPreview.replaceChildren();
    this.domElements.indicatorsPreview.replaceChildren();
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

class AddModuleListItemPopup {
  constructor() {
    return this;
  }
  domElements = {
    popupOverlay: document.querySelector(".popup-overlay"),
    newModuleForm: document.querySelector("#add-new-module-form"),
    sidebarMenu: document.querySelector("#sidebar-options-menu"),
    addModuleBtn: document.querySelector("#add-new-module-btn"),
    closeFormBtn: document.querySelector("#close-new-module-form-btn"),
  };

  configureFormButtons() {
    const newModuleBtn = this.domElements.addModuleBtn;
    const popupOverlay = this.domElements.popupOverlay;
    const closeFormBtn = this.domElements.closeFormBtn;
    const newModuleForm = this.domElements.newModuleForm;
    const sidebarMenu = this.domElements.sidebarMenu;
    newModuleBtn.addEventListener("click", () => {
      newModuleForm.reset();
      popupOverlay.classList.remove("hidden");
      newModuleForm.classList.remove("hidden");
      sidebarMenu.classList.add("hidden");
      document.querySelector("#add-new-module-url").focus();
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

class EditModuleListItemPopup {
  constructor() {
    mainPubSub.subscribe("editModule", this.handleEditModule.bind(this));
    return this;
  }
  domElements = {
    popupOverlay: document.querySelector(".popup-overlay"),
    sidebarMenu: document.querySelector("#sidebar-options-menu"),
    editModuleForm: document.querySelector("#edit-module-form"),
    manualUrlInput: document.querySelector("#edit-module-url"),
    moduleNameInput: document.querySelector("#edit-module-name"),
    closeFormBtn: document.querySelector("#close-edit-module-form-btn"),
    deleteModuleBtn: document.querySelector("#delete-edit-module-form-btn"),
    editModuleBtn: document.querySelector("#edit-edit-module-form-btn"),
  };

  configureFormButtons() {
    const editModuleBtn = this.domElements.editModuleBtn;
    const closeFormBtn = this.domElements.closeFormBtn;
    const editModuleForm = this.domElements.editModuleForm;
    const deleteModuleBtn = this.domElements.deleteModuleBtn;
    closeFormBtn.addEventListener("click", () => {
      this.toggleHidden();
    });

    deleteModuleBtn.addEventListener("click", () => {
      mainPubSub.publish("deleteModule", {
        moduleName: this.pubsubData.moduleName,
        manualUrl: this.pubsubData.manualUrl,
      });
      this.toggleHidden();
    });

    editModuleBtn.addEventListener("click", () => {
      const formData = new FormData(editModuleForm);
      deleteModuleBtn.click();
      mainPubSub.publish("addNewModule", {
        moduleName: formData.get("name"),
        manualUrl: formData.get("url"),
      });
    });

    editModuleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      editModuleBtn.click();
    });
  }

  handleEditModule(pubsubData) {
    const manualUrlInput = this.domElements.manualUrlInput;
    const moduleNameInput = this.domElements.moduleNameInput;
    manualUrlInput.value = pubsubData.manualUrl;
    moduleNameInput.value = pubsubData.moduleName;
    manualUrlInput.size = pubsubData.manualUrl.length + 1;
    this.toggleHidden();

    this.pubsubData = pubsubData;
  }

  toggleHidden() {
    this.domElements.popupOverlay.classList.toggle("hidden");
    this.domElements.editModuleForm.classList.toggle("hidden");
  }

  resetForm() {
    this.domElements.editModuleForm.reset();
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
      new TempPopup("Adding JSON From text failed.\nError: " + error);
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
      new TempPopup(
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
      new TempPopup("Copied");
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

class TempPopup {
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
    this.doPopup();
    return this;
  }

  superOverlay = document.querySelector("#super-overlay");

  populatePopup() {
    const title = this.form.querySelector(".title");
    const label = this.form.querySelector("label");
    const input = this.form.querySelector("input");
    const submitBtn = this.form.querySelector(".submit-btn");
    const closeBtn = this.form.querySelector(".close-btn");
    if (this.message) {
      title.textContent = this.message;
    }
    if (this.inputLabel) {
      label.textContent = this.inputLabel;
      label.classList.remove("hidden");
      input.classList.remove("hidden");
    }
    if (this.submitBtnText) {
      submitBtn.classList.remove("hidden");
      submitBtn.textContent = this.submitBtnText;
    }
    if (this.submitCallback) {
      this.form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.submitCallback(input.value);
        closeBtn.click();
      });
    }
    closeBtn.textContent = this.closeBtnText;
    closeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      this.form.remove();
      this.superOverlay.classList.add("hidden");
    });
  }

  createPopupSkeleton() {
    const form = document.createElement("form");
    form.classList.add("form", "temp");
    const title = document.createElement("div");
    title.classList.add("title");
    const label = document.createElement("label");
    label.classList.add("hidden");
    const input = document.createElement("input");
    input.classList.add("hidden");
    input.setAttribute("type", "text");
    input.setAttribute("autocomplete", "off");
    const btnGroup = document.createElement("div");
    btnGroup.classList.add("form-btn-group");
    const close = document.createElement("button");
    close.classList.add("close-btn");
    close.setAttribute("type", "button");
    const submit = document.createElement("button");
    submit.classList.add("hidden");
    submit.classList.add("submit-btn");
    submit.setAttribute("type", "submit");
    btnGroup.replaceChildren(close, submit);
    form.replaceChildren(title, label, input, btnGroup);
    this.form = form;
    return form;
  }

  doPopup() {
    this.createPopupSkeleton();
    this.populatePopup();
    document.querySelector("#super-overlay").append(this.form);
    this.superOverlay.classList.remove("hidden");
    if (this.inputLabel) {
      this.form.querySelector("input").focus();
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
  AddModuleListItemPopup,
  ImportModulesPopup,
  ExportModulesPopup,
  NukeWarningPopup,
  TempPopup,
  EditModuleListItemPopup,
};
