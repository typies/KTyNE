import mainPubSub from "./PubSub";

function asArray(arrOrSingle) {
  const arr = Array.isArray(arrOrSingle) ? arrOrSingle : [arrOrSingle];
  return arr;
}

class HtmlElement {
  constructor(htmlTag = "div", children = [], textContent, classList = []) {
    Object.assign(this, {
      htmlTag,
      children,
      textContent,
      classList,
    });
    this.classList = asArray(this.classList);
    this.children = asArray(this.children);
    this.createHtmlElement();
    return this;
  }

  createHtmlElement() {
    try {
      this.element = document.createElement(this.htmlTag);
      this.element.textContent = this.textContent;
      if (this.children)
        this.children.forEach((child) => this.element.appendChild(child));
      this.element.classList.add(...this.classList);
      return this.element;
    } catch (e) {
      console.error(e);
      console.warn(
        "Check HtmlFormElement/Children. New ones may need .element before element is used."
      );
    }
  }

  addChild(newChild, insertIndex = this.element.children.length) {
    if (insertIndex != 0) {
      this.element.children[insertIndex - 1].after(newChild);
    } else {
      this.element.replaceChildren(newChild, ...this.children);
    }
    this.children.splice(insertIndex, 0, newChild);
    return this.divWrapper;
  }
}

class DivWrapperEle extends HtmlElement {
  constructor(children, classList = ["column-group"]) {
    super("div", children, null, classList);
    return this;
  }
}

class OverlayElement extends DivWrapperEle {
  constructor(form, classList, stopClickClose) {
    super(form, classList);
    const hide = () => document.body.removeChild(this.element);
    if (!stopClickClose) this.element.addEventListener("click", hide);
    this.element.addEventListener("submit", (event) => {
      event.preventDefault();
      hide();
    });
    return this;
  }
}

class FormElement extends HtmlElement {
  constructor(
    title,
    children = [],
    submitCallback,
    classList = [],
    action,
    novalidate,
    stopClickPropagation = true,
    preventDefault = true
  ) {
    super("form", children, null, classList);
    Object.assign(this, {
      title,
      children,
      submitCallback,
      classList,
      action,
      novalidate,
      stopClickPropagation,
      preventDefault,
    });
    this.createFormElement();
    return this;
  }

  createFormElement() {
    this.addChild(this.title, 0);
    this.element.action = this.action;
    this.element.novalidate = this.novalidate;
    if (this.stopClickPropagation)
      this.element.addEventListener("click", (event) =>
        event.stopPropagation()
      );
    if (this.submitCallback) {
      this.element.addEventListener("submit", (event) => {
        if (this.preventDefault) event.preventDefault();
        this.submitCallback(this.element);
      });
    }
    return this.element;
  }
}

class LabelElement extends HtmlElement {
  constructor(textContent, forField, classList = ["label"]) {
    super("label", [], textContent, classList);
    Object.assign(this, {
      textContent,
      forField,
      classList,
    });
    this.createLabelElement();
    return this;
  }

  createLabelElement() {
    this.element.setAttribute("for", this.forField);
    return this.element;
  }
}

class TextInputElement extends HtmlElement {
  constructor(
    name,
    id,
    classList = [],
    value,
    placeholder,
    autocomplete,
    required,
    oninputCallback = null
  ) {
    super("input", [], null, classList);
    Object.assign(this, {
      name,
      id,
      classList,
      value,
      placeholder,
      autocomplete,
      required,
      oninputCallback,
    });
    this.createTextInputElement();
    return this;
  }

  createTextInputElement() {
    this.element.name = this.name;
    if (this.value) this.element.value = this.value;
    this.element.id = this.id || `${this.name}-id`;
    this.element.autocomplete = this.autocomplete;
    if (this.placeholder) this.element.placeholder = this.placeholder;
    this.element.required = this.required;
    this.element.addEventListener("input", this.oninputCallback);
    return this.element;
  }
}

class ButtonElement extends HtmlElement {
  constructor(
    textContent, // Default = "Close" or "Submit" if type = "submit"
    listenerEvent, // Default click & close closest form/overlay, unless submit btn
    type, // Default = "close" or "submit" if textContent = "submit"
    classList = []
  ) {
    super("button", [], textContent, classList);
    Object.assign(this, {
      textContent,
      listenerEvent,
      type,
      classList,
    });
    if (!this.type || this.type === "") this.setDefaultType();
    if (!this.textContent || this.textContent === "")
      this.setDefaultTextContent();
    if (!this.listenerEvent) this.setDefaultListenerEvent();
    this.createButtonElement();
    return this;
  }

  setDefaultType() {
    this.type = this.textContent === "sumbit" ? "submit" : "button";
  }

  setDefaultTextContent() {
    this.textContent = this.type === "submit" ? "Submit" : "Close";
  }

  setDefaultListenerEvent() {
    this.listenerEvent = {
      trigger: "click",
      callback: (event) => {
        const parentForm = this.element.closest("form");
        const parentOverlay = this.element.closest(".popup-overlay");
        if (this.type === "button") {
          document.body.removeChild(parentOverlay);
        } else if (this.type === "submit") {
          event.preventDefault();
          parentForm.requestSubmit();
        }
      },
    };
  }

  createButtonElement() {
    this.element.textContent = this.textContent; // Super will not call default functions
    this.element.type = this.type;
    this.element.addEventListener(
      this.listenerEvent.trigger,
      this.listenerEvent.callback
    );
    return this.element;
  }
}

class NewDefaultPopup {
  constructor(
    title,
    schema = [
      {
        type: "group",
        schema: [{ type: "button" }],
        classList: "form-btn-group",
      },
    ],
    formSubmit,
    dontReset = false
  ) {
    Object.assign(this, {
      title,
      formSubmit,
      dontReset,
    });

    this.form = new FormElement(
      new HtmlElement("div", [], this.title, "title").element,
      this.parseSchema(schema),
      (form) => {
        if (this.formSubmit) this.formSubmit(form);
        form.reset();
      },
      "form"
    ).element;

    this.popup = new OverlayElement(this.form, "popup-overlay");
  }

  parseSchema(schema) {
    if (!schema || schema.length === 0) return [];
    return schema.map((si) => {
      if (si.type === "group") {
        const groupChildren = this.parseSchema(si.schema);
        return new DivWrapperEle(groupChildren, si.classList).element;
      }
      if (si.type === "button") {
        return new ButtonElement(
          si.textContent,
          si.listenerEvent,
          si.btnType,
          si.classList
        ).element;
      }
      if (si.type === "textInput") {
        return new TextInputElement(
          si.name,
          si.id,
          si.classList,
          si.value,
          si.placeholder,
          si.autocomplete,
          si.required,
          si.oninputCallback
        ).element;
      }
      if (si.type === "label") {
        return new LabelElement(si.textContent, si.forField, si.classList)
          .element;
      }
      if (si.type === "no-yes-btn-group") {
        const groupChildren = this.parseSchema([
          {
            type: "group",
            schema: [
              {
                type: "button",
                textContent: si.no || "No",
              },
              {
                type: "button",
                btnType: "submit",
                textContent: si.yes || "Yes",
              },
            ],
            classList: "form-btn-group",
          },
        ]);
        return new DivWrapperEle(groupChildren, si.classList).element;
      }
      if (si.type === "no--reset-yes-btn-group") {
        const groupChildren = this.parseSchema([
          {
            type: "group",
            schema: [
              {
                type: "button",
                textContent: si.no || "No",
              },
              {
                type: "button",
                textContent: si.reset || "Reset",
              },
              {
                type: "button",
                btnType: "submit",
                textContent: si.yes || "Yes",
              },
            ],
            classList: "form-btn-group",
          },
        ]);
        return new DivWrapperEle(groupChildren, si.classList).element;
      }

      throw Error(
        "Bad form schema, could not be parsed. Missed si.type: " + si.type
      );
    });
  }

  doPopup() {
    document.body.appendChild(this.popup.element);
    if (!this.dontReset) this.form.reset();
    const anyInput = this.popup.element.querySelector("input");
    if (anyInput) anyInput.focus();
  }
}

class DefaultPopup {
  constructor(constructorData) {
    this.title = constructorData.title; // String, form title
    this.classList = constructorData.classList; // List of classes to apply to form
    this.buttonWrapperClassList = constructorData.buttonWrapperClassList;
    this.bigInputWrapperClassList = constructorData.bigInputWrapperClassList;
    this.buttons = [{ textContent: "Close" }]; // List of Button objects
    this.inputGroupClass = constructorData.inputGroupClass;
    this.textInputs = constructorData.textInputs || [];
    this.submitCallback = constructorData.submitCallback;
    this.stopEscClose = constructorData.stopEscClose || false;
    this.stopClickClose = constructorData.stopClickClose || false;

    if (constructorData.buttons) this.buttons.push(...constructorData.buttons);
    if (!this.verifyRequiredData()) throw Error("Invalid DefaultPopup Data");
    this.popup = new OverlayElement(
      new FormElement(
        new HtmlElement("div", [], this.title, "title").element,
        [
          ...this.textInputs.map((input) => this.createLabelInput(input)),
          new DivWrapperEle(
            this.buttons.map(
              (button) =>
                new ButtonElement(
                  button.textContent,
                  button.event,
                  button.type,
                  button.classList
                ).element
            ),
            "form-btn-group"
          ).element,
        ],
        (form) => {
          if (this.submitCallback) this.submitCallback(form);
          form.reset();
        },
        "form"
      ).element,
      "popup-overlay"
    );
    return this;
  }

  doPopup() {
    document.body.appendChild(this.popup.element);
    const anyInput = this.popup.element.querySelector("input");
    if (anyInput) anyInput.focus();
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
        if (!input.name) return false;
      });
    }
    return true;
  }

  createLabelInput(textEleData) {
    const label = new LabelElement(
      textEleData.inputLabelText,
      textEleData.id,
      textEleData.classList
    ).element;
    const input = new TextInputElement(
      textEleData.name,
      textEleData.id,
      textEleData.classList,
      textEleData.value,
      textEleData.placeholder,
      textEleData.autocomplete,
      textEleData.required,
      textEleData.oninputEvent
    ).element;
    const inputWrapper = new DivWrapperEle(
      [label, input],
      textEleData.littleInputWrapperClassList
    ).element;
    return inputWrapper;
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
      new NewDefaultPopup(
        "Adding JSON From text failed.\nError: " + error
      ).doPopup();

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
      new NewDefaultPopup(
        "Unable to read file. Please use a properly formatted .json or .txt"
      ).doPopup();
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
    const popup = new NewDefaultPopup("Copied");
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
  NewDefaultPopup,
};
