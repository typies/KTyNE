import mainPubSub from "./PubSub";
/*
{
  title: string,               - Required
  classList: List<string>
  buttonWrapperClassList: List<string>
  bigInputWrapperClassList: List<string>
  submitCallback: fn
  buttons: [{
    type: string,              - Default = "button"
    classList: List<string>,
    textContent: string,       - Required, if button is present
    event: { trigger: string, callback: fn}
  }],
  textInputs: [{
      inputLabelText: string,
      inputType: string,
      inputName: string,       - Required
      inputId: string,
      inputClassList: List<string>
      inputPlaceholder: string,
      inputAutocomplete: string,  - ("off" to turn off)
      littleInputWrapperClassList: string
      required: bool
    },
  ]
}
*/
class DefaultPopup {
  constructor(constructorData) {
    this.title = constructorData.title; // String, form title
    this.classList = constructorData.classList; // List of classes to apply to form
    this.buttonWrapperClassList = constructorData.buttonWrapperClassList;
    this.bigInputWrapperClassList = constructorData.bigInputWrapperClassList;
    this.buttons = constructorData.buttons || [{ textContent: "Close" }]; // List of Button objects
    this.inputGroupClass = constructorData.inputGroupClass;
    this.textInputs = constructorData.textInputs;
    this.submitCallback = constructorData.submitCallback;

    if (!this.verifyRequiredData()) throw Error("Invalid DefaultPopup Data");
    return this;
  }

  verifyRequiredData() {
    if (!this.title) return false;
    if (this.buttons) {
      this.buttons.forEach((btn) => {
        if (!btn.textContent) return false;
      });
    }
    if (this.textInputs) {
      this.textInputs.forEach((input) => {
        if (!input.inputName) return false;
      });
    }
    return true;
  }

  createPopup() {
    this.overlay = document.createElement("div");
    this.overlay.classList.add("popup-overlay");
    this.overlay.addEventListener("click", this.defaultClose.bind(this));

    this.form = this.createForm();
    this.overlay.replaceChildren(this.form);
    return this.overlay;
  }

  createForm() {
    const form = document.createElement("form");
    form.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    form.addEventListener("submit", (event) => {
      event.stopPropagation();
      event.preventDefault();
      if (this.submitCallback) this.submitCallback(this.form);
      this.defaultClose();
    });
    const title = document.createElement("div");
    title.classList.add("title");
    if (this.title) title.textContent = this.title;

    form.classList.add("form");
    if (this.classList) form.classList.add(...this.classList);

    const inputWrapper = this.createInputWrapper();
    const btnGroup = this.createBtnGroup(this.buttons);

    form.replaceChildren(title, inputWrapper, btnGroup);
    return form;
  }

  createInputWrapper() {
    const inputWrapper = document.createElement("div");
    if (this.bigInputWrapperClassList)
      inputWrapper.classList.add(...this.bigInputWrapperClassList);
    if (!this.textInputs) return inputWrapper;

    this.textInputs.forEach((input) => {
      const newTextEleWrapper = this.createTextEle(input);
      inputWrapper.appendChild(newTextEleWrapper);
    });

    this.focusEle = inputWrapper.children[0].querySelector("input");

    return inputWrapper;
  }

  createTextEle(textEleData) {
    const label = document.createElement("label");
    if (textEleData.inputId) label.setAttribute("for", textEleData.inputId);
    if (textEleData.inputLabelText)
      label.textContent = textEleData.inputLabelText;
    const input = document.createElement("input");
    input.type = textEleData.inputType || "text";
    if (textEleData.inputName) input.name = textEleData.inputName;
    if (textEleData.inputId) input.id = textEleData.inputId;
    if (textEleData.inputPlaceholder)
      input.placeholder = textEleData.inputPlaceholder;
    if (textEleData.inputClassList)
      input.classList.add(...textEleData.inputClassList);
    if (textEleData.inputAutocomplete)
      input.autocomplete = textEleData.inputAutocomplete;
    if (textEleData.required) input.required = true;
    const inputWrapper = document.createElement("div");
    if (textEleData.littleInputWrapperClassList)
      inputWrapper.classList.add(...textEleData.littleInputWrapperClassList);
    inputWrapper.replaceChildren(label, input);
    return inputWrapper;
  }

  createBtnGroup(buttonsData) {
    const formBtnGroup = document.createElement("div");
    if (buttonsData.classList)
      formBtnGroup.classList.add(...this.buttonWrapperClassList);
    formBtnGroup.classList.add("form-btn-group");

    if (!buttonsData) return formBtnGroup;

    buttonsData.forEach((button) => {
      const newButton = document.createElement("button");
      newButton.type = button.type || "button";
      if (button.classList) newButton.classList.add(...button.classList);
      newButton.textContent = button.textContent;
      if (button.event && button.event.trigger && button.event.callback)
        newButton.addEventListener(button.event.trigger, (event) => {
          event.stopPropagation();
          event.preventDefault();
          button.event.callback(this.form);
          if (button.type === "submit") this.defaultClose();
        });
      else if (newButton.type === "submit") {
        newButton.addEventListener("click", (event) => {
          event.stopPropagation();
          event.preventDefault();
          this.defaultSubmit();
        });
      } else {
        this.configureDefaultButton(newButton);
      }
      formBtnGroup.append(newButton);
    });
    return formBtnGroup;
  }

  configureDefaultButton(btn) {
    switch (btn.textContent.toLowerCase()) {
      case "reset":
        btn.addEventListener("click", (event) => {
          event.stopPropagation();
          this.defaultReset();
        });
        break;
      default:
        btn.addEventListener("click", (event) => {
          event.stopPropagation();
          this.defaultClose();
        });
        break;
    }
  }

  doPopup() {
    const newPopup = this.createPopup();
    document.body.appendChild(newPopup);
    if (this.focusEle) this.focusEle.focus();
  }

  defaultClose() {
    this.form.remove();
    this.overlay.remove();
  }

  defaultReset() {
    if (this.form) this.form.reset();
  }

  defaultSubmit() {
    this.formData = new FormData(this.form);
    this.form.requestSubmit();
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
    console.log(newSerialEle);
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

class ImportModulesPopup {
  constructor() {
    return this;
  }
  domElements = {
    popupOverlay: document.querySelector(".popup-overlay"),
    importModuleBtn: document.querySelector(".import-modules-btn"),
    importModuleForm: document.querySelector(".import-modules-form"),
    closeFormBtn: document.querySelector(".close-import-form-btn"),
    resetFormBtn: document.querySelector(".reset-import-form-btn"),
    textAreaInput: document.querySelector(".import-modules-text"),
    fileUploadInput: document.querySelector("#import-modules-form-file-input"),
    addExampleBtn: document.querySelector(".import-modules-example"),
    sidebarMenu: document.querySelector(".sidebar-options-menu"),
  };

  configureFormButtons() {
    const popupOverlay = this.domElements.popupOverlay;
    const resetFormBtn = this.domElements.resetFormBtn;
    const closeFormBtn = this.domElements.closeFormBtn;
    const importModuleForm = this.domElements.importModuleForm;
    const textAreaInput = this.domElements.textAreaInput;
    const fileUploadInput = this.domElements.fileUploadInput;
    const addExampleBtn = this.domElements.addExampleBtn;

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
      new DefaultPopup({
        title: "Adding JSON From text failed.\nError: " + error,
      }).doPopup();
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
      new DefaultPopup({
        title:
          "Unable to read file. Please use a properly formatted .json or .txt",
      });
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
    exportModuleForm: document.querySelector(".export-modules-form"),
    closeFormBtn: document.querySelector(".close-export-form-btn"),
    copyBtn: document.querySelector(".copy-export-form-btn"),
    textAreaOutput: document.querySelector(".export-modules-text"),
    sidebarMenu: document.querySelector(".sidebar-options-menu"),
  };

  configureFormButtons() {
    const popupOverlay = this.domElements.popupOverlay;
    const closeFormBtn = this.domElements.closeFormBtn;
    const copyBtn = this.domElements.copyBtn;
    const exportModuleForm = this.domElements.exportModuleForm;
    const textAreaOutput = this.domElements.textAreaOutput;
    closeFormBtn.addEventListener("click", () => {
      popupOverlay.classList.add("hidden");
      exportModuleForm.classList.add("hidden");
    });
    const popup = new DefaultPopup({ title: "Copied" });
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(textAreaOutput.textContent);
      popup.doPopup();
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

export {
  EdgeworkPopup,
  NumberedAlphabetPopup,
  ImportModulesPopup,
  ExportModulesPopup,
  DefaultPopup,
};
