import mainPubSub from "./PubSub";
import PopupGenerator from "./PopupGenerator.js";

class NumberedAlphabetPopup {
  constructor() {
    this.init();
    this.fillAlphaPopup();
  }

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

  fillAlphaPopup() {
    const alphaPopup = document.querySelector(".alphabet-popup");
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 1; i <= 26; i++) {
      const newSpan = document.createElement("span");
      newSpan.textContent = `${i}:${alphabet[i - 1]}`;
      if (i < 10) {
        newSpan.classList.add("single-digit");
      }
      alphaPopup.appendChild(newSpan);
    }
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

class EdgeworkPopup {
  constructor() {
    this.fillIndTable();
    this.init();
    return this;
  }
  domElements = {
    popupOverlay: document.querySelector(".popup-overlay"),
    edgework: document.querySelector(".edgework"),
    edgeworkForm: document.querySelector(".edgework-form"),
    newEdgeworkBtn: document.querySelector(".edgework-btn"),
    serialInput: document.querySelector("#serial-input"),
    batteriesInput: document.querySelector("#batteries-input"),
    holdersInput: document.querySelector("#holders-input"),
    portsInput: document.querySelector("#ports"),
    closeFormBtn: document.querySelector(".edgework-form-close-btn"),
    resetFormBtn: document.querySelector(".edgework-form-reset-btn"),
    edgeworkPreview: document.querySelector(".edgework-preview"),
    serialPreview: document.querySelector(".serial-preview"),
    batteriesPreview: document.querySelector(".batteries-preview"),
    portsPreview: document.querySelector(".ports-preview"),
    indicatorsPreview: document.querySelector(".indicators-preview"),
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

  fillIndTable() {
    const indTable = document.querySelector(".ind-table");
    const possibleIndicators = [
      "bob",
      "car",
      "clr",
      "frk",
      "frq",
      "ind",
      "msa",
      "nsa",
      "sig",
      "snd",
      "trn",
    ];
    possibleIndicators.forEach((indName) => {
      const indGroup = document.createElement("div");
      indGroup.classList.add("ind-group");
      const label = document.createElement("label");
      label.textContent = indName.toUpperCase();
      const noneRadio = this.createRadio(
        `${indName}-ind`,
        indName,
        "none",
        true
      );
      const litRadio = this.createRadio(
        `${indName}-ind`,
        `lit-${indName}`,
        "lit",
        false
      );
      const unlitRadio = this.createRadio(
        `${indName}-ind`,
        `unlit-${indName}`,
        "unlit",
        false
      );
      indGroup.replaceChildren(label, noneRadio, litRadio, unlitRadio);
      indTable.appendChild(indGroup);
    });
  }

  createRadio(name, id, value, checked = false) {
    const newRadio = document.createElement("input");
    newRadio.setAttribute("type", "radio");
    newRadio.setAttribute("name", name);
    newRadio.setAttribute("id", id);
    newRadio.setAttribute("value", value);
    if (checked) newRadio.setAttribute("checked", "");
    return newRadio;
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
      document.querySelector("#serial-input").focus();
    });

    closeFormBtn.addEventListener("click", () => {
      popupOverlay.classList.add("hidden");
      edgeworkForm.classList.add("hidden");
    });

    resetFormBtn.addEventListener("click", () => {
      this.resetForm();
      this.resetEdgework();
      document.querySelector("#serial-input").focus();
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
    return newSerialEle;
  }

  populateBatteries(batteries, holders) {
    if (!batteries || !holders) return;
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
    if (portList.length === 0) return;
    const edgework = this.domElements.edgework;
    const plateDiv = this.createPortPlatesEle(portList);
    edgework.appendChild(plateDiv);
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

class SidebarPopup {
  constructor(
    addNewModulePopup,
    importModulePopup,
    exportModulesPopup,
    nukeSidebarPopup,
    importDefaultListPopup
  ) {
    this.addNewModulePopup = addNewModulePopup;
    this.importModulePopup = importModulePopup;
    this.exportModulesPopup = exportModulesPopup;
    this.nukeSidebarPopup = nukeSidebarPopup;
    this.importDefaultListPopup = importDefaultListPopup;
    this.popup = new PopupGenerator("Options", [
      {
        type: "group",
        schema: [
          {
            type: "button",
            btnType: "button",
            textContent: "Add new Module",
            listenerEvent: {
              trigger: "click",
              callback: () => this.addNewModulePopup.doPopup(),
            },
            classList: "add-new-module-btn",
          },
          {
            type: "button",
            btnType: "submit",
            textContent: this.editMode ? "Exit Edit Mode" : "Enter Edit Mode",
            listenerEvent: {
              trigger: "click",
              callback: () => mainPubSub.publish("toggleEditMode"),
            },
            classList: ["edit-mode-btn", this.editMode ? "orange" : null],
          },
          {
            type: "button",
            btnType: "submit",
            textContent: "Import Module List",
            listenerEvent: {
              trigger: "click",
              callback: () => this.importModulePopup.doPopup(),
            },
            classList: "import-modules-btn",
          },
          {
            type: "button",
            btnType: "submit",
            textContent: "Export Module List",
            listenerEvent: {
              trigger: "click",
              callback: () => this.exportModulesPopup.doPopup(),
            },
            classList: ["export-modules-btn"],
          },
          {
            type: "button",
            btnType: "submit",
            textContent: "Delete All Modules",
            listenerEvent: {
              trigger: "click",
              callback: () => this.nukeSidebarPopup.doPopup(),
            },
            classList: "nuke-module-list-btn",
          },
          {
            type: "button",
            btnType: "submit",
            textContent: "Import Default Mod List",
            listenerEvent: {
              trigger: "click",
              callback: () => this.importDefaultListPopup.doPopup(),
            },
          },
        ],
        classList: ["column-group", "even-list"],
      },
    ]);
  }

  doPopup() {
    this.popup.doPopup();
  }
}

class AddModulePopup {
  constructor() {
    this.popup = new PopupGenerator(
      "Add New Module",
      [
        {
          type: "group",
          schema: [
            {
              type: "label",
              forField: "url",
              textContent: "Module URL",
            },
            {
              type: "textInput",
              name: "url",
              id: "url",
              placeholder: "https://ktane.timwi.de/HTML/Logic.html",
              autocomplete: "off",
              required: true,
            },
            {
              type: "label",
              forField: "name",
              textContent: "Module Name",
            },
            {
              type: "textInput",
              name: "name",
              id: "name",
              placeholder: "Logic",
              autocomplete: "off",
            },
          ],
        },
        {
          type: "group",
          classList: "form-btn-group",
          schema: [
            {
              type: "button",
            },
            {
              type: "button",
              btnType: "submit",
            },
          ],
        },
      ],
      (form) => {
        const formData = new FormData(form);
        mainPubSub.publish("addNewModule", {
          moduleName: formData.get("name"),
          manualUrl: formData.get("url"),
        });
      }
    );
  }

  doPopup() {
    this.popup.doPopup();
  }
}

class EditModulePopup {
  constructor(existingSidebaritem) {
    this.existingSidebaritem = existingSidebaritem;
    this.popup = this.generate({});
    return this;
  }

  generate(existingSidebaritem) {
    return new PopupGenerator(
      "Edit Module",
      [
        {
          type: "group",
          schema: [
            {
              type: "label",
              forField: "url",
              textContent: "Module URL",
            },
            {
              type: "textInput",
              name: "url",
              id: "url",
              value: existingSidebaritem.manualUrl,
              autocomplete: "off",
              required: true,
            },
            {
              type: "label",
              forField: "name",
              textContent: "Module Name",
            },
            {
              type: "textInput",
              name: "name",
              id: "name",
              value: existingSidebaritem.moduleName,
              autocomplete: "off",
            },
          ],
        },
        {
          type: "group",
          schema: [
            {
              type: "button",
              textContent: "Cancel",
            },
            {
              type: "button",
              btnType: "submit",
              textContent: "Delete",
              listenerEvent: {
                trigger: "click",
                callback: () =>
                  this.removeSidebarItemElement(existingSidebaritem),
              },
            },
            {
              type: "button",
              btnType: "submit",
              textContent: "Edit",
            },
          ],
          classList: "form-btn-group",
        },
      ],
      (form) => {
        const formData = new FormData(form.element);
        mainPubSub.publish("replaceModule", {
          old: existingSidebaritem,
          new: {
            moduleName: formData.get("name"),
            manualUrl: formData.get("url"),
          },
        });
      },
      true
    );
  }
}

class ImportModulesPopup {
  constructor() {
    this.popup = new PopupGenerator(
      "Import Modules",
      [
        {
          type: "label",
          forField: "file-upload",
          textContent: "Enter/Upload JSON",
        },
        {
          type: "group",
          schema: [
            {
              type: "fileInput",
              accept: ".json,.txt",
              name: "import-modules-file",
              id: "import-modules-form-file-input",
              autocomplete: "off",
              listenerEvent: {
                trigger: "change",
                callback: (caller) => this.handleFileUpload(caller),
              },
            },
            {
              type: "button",
              textContent: "Show me an example",
              classList: "import-modules-example",
              listenerEvent: {
                trigger: "click",
                callback: (caller) => this.handleExample(caller),
              },
            },
          ],
          classList: "file-wrapper",
        },
        {
          type: "contenteditableDiv",
          name: "import-module-text",
          classList: ["import-modules-text", "popup-text-area"],
          autocomplete: "off",
          spellcheck: "false",
        },
        {
          type: "group",
          schema: [
            {
              type: "button",
            },
            {
              type: "button",
              textContent: "Reset",
              listenerEvent: {
                trigger: "click",
                callback: () => {
                  this.form.reset();
                  this.textArea.textContent = "";
                },
              },
            },
            {
              type: "button",
              btnType: "submit",
              textContent: "Add all",
            },
          ],
          classList: "form-btn-group",
        },
      ],
      () => this.processTextarea()
    );
    this.form = this.popup.form;
    this.textArea = this.form.querySelector("div.popup-text-area");
  }

  doPopup() {
    this.popup.doPopup();
  }

  processTextarea() {
    const formText = this.textArea.textContent;
    if (!formText || formText === "") return;
    try {
      const formTextCleaned = formText.replace(/(|\t|\n|\r)/gm, "");
      const newModules = JSON.parse(formTextCleaned);
      mainPubSub.publish("addNewModules", newModules);
      return true;
    } catch (error) {
      new PopupGenerator(
        "Adding JSON From text failed.\nError: " + error
      ).doPopup();

      return false;
    }
  }

  handleFileUpload(caller) {
    const file = caller.element.files[0];
    const form = this.popup.form;
    const textAreaInput = form.querySelector(".popup-text-area");
    if (!file) return;

    const fr = new FileReader();
    fr.onload = () => {
      textAreaInput.textContent = fr.result;
    };
    fr.onerror = () => {
      new PopupGenerator(
        "Unable to read file. Please use a properly formatted .json or .txt"
      ).doPopup();
    };
    fr.readAsText(file);
  }

  handleExample(caller) {
    const form = this.popup.form;
    const textAreaInput = form.querySelector(".popup-text-area");
    const example = `[\n  {\n    "name": "Logic",\n    "url": "https://ktane.timwi.de/HTML/Logic.html"\n  },\n  {\n    "name": "Silly Slots",\n    "url": "https://ktane.timwi.de/HTML/Silly%20Slots.html"\n  },\n  {\n    "url": "https://ktane.timwi.de/HTML/Yippee.html"\n  }\n]`;

    if (textAreaInput.hasAttribute("contenteditable")) {
      this.currentTextInputValue = textAreaInput.textContent;

      caller.element.textContent = "Hide Example";
      textAreaInput.textContent = example;
      textAreaInput.removeAttribute("contenteditable");
      return;
    }

    caller.element.textContent = "Show me an example";
    textAreaInput.textContent = this.currentTextInputValue;
    textAreaInput.setAttribute("contenteditable", "");
  }
}

class ExportModulesPopup {
  constructor() {
    this.copiedPopup = new PopupGenerator("Copied");
    this.popup = new PopupGenerator("Export Modules", [
      {
        type: "div",
        classList: ["export-modules-text", "popup-text-area"],
      },
      {
        type: "group",
        schema: [
          {
            type: "button",
          },
          {
            type: "button",
            textContent: "Copy",
            listenerEvent: {
              trigger: "click",
              callback: () => this.copyToClipboard(this.textArea.textContent),
            },
            classList: "copy-export-form-btn",
          },
          {
            type: "button",
            btnType: "button",
            textContent: "Export",
            listenerEvent: {
              trigger: "click",
              callback: () => this.processExport(),
            },
          },
        ],
        classList: "form-btn-group",
      },
    ]);
    this.form = this.popup.form;
    this.textArea = this.form.querySelector("div.popup-text-area");
  }

  processExport() {
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

    const output = JSON.stringify(storageItems, null, 2);
    this.textArea.textContent = output;
    this.copyToClipboard(output);
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    this.copiedPopup.doPopup();
  }

  doPopup() {
    this.popup.doPopup();
  }
}

class ImportDefaultListPopup {
  constructor(modFilesList) {
    this.btnSchemaList = modFilesList.map((mfObj) => {
      return {
        type: "button",
        textContent: mfObj.name,
        listenerEvent: {
          trigger: "click",
          callback: (caller) => {
            if (!Array.from(caller.element.classList).includes("green")) {
              caller.element.classList.add("green");
              new PopupGenerator(`${mfObj.name} Added`).doPopup();
            }
            mainPubSub.publish("addNewModules", mfObj.fileContents);
          },
        },
      };
    });
    return this;
  }

  doPopup(pageLoad = false) {
    new PopupGenerator("Default Mod List Options", [
      {
        type: "div",
        textContent: pageLoad
          ? "Looks like you don't have any saved modules. Would you like to add one of these preset lists?"
          : "Select Mod Lists you would like to add",
        classList: "title",
      },
      {
        type: "group",
        schema: [...this.btnSchemaList],
        classList: ["column-group", "even-list"],
      },
      {
        type: "close-btn",
      },
    ]).doPopup();
  }
}

export {
  EdgeworkPopup,
  NumberedAlphabetPopup,
  SidebarPopup,
  AddModulePopup,
  EditModulePopup,
  ImportModulesPopup,
  ExportModulesPopup,
  ImportDefaultListPopup,
};
