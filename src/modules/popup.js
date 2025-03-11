import mainPubSub from "./PubSub";
import PopupGenerator from "./PopupGenerator.js";

class GridPopup {
  constructor() {
    this.init();
  }

  dom = {
    gridBtn: document.querySelector(".grid-btn"),
    gridPopup: document.querySelector(".grid-popup"),
    gridContainer: document.querySelector(".grid-popup .grid-container"),
    heightInput: document.querySelector("input[name='rows']"),
    widthInput: document.querySelector("input[name='cols']"),
    colorInput: document.querySelector("input[name='color']"),
    cellSizeInput: document.querySelector("input[name='cell-size']"),
    resetBtn: document.querySelector("button.reset-btn"),
    indexBtn: document.querySelector("button.swap-index-btn"),
    colorClickBtn: document.querySelector("input[name='color-onclick']"),
    addRowBtn: document.querySelector("svg.add-row-btn"),
    removeRowBtn: document.querySelector("svg.remove-row-btn"),
    addColBtn: document.querySelector("svg.add-col-btn"),
    removeColBtn: document.querySelector("svg.remove-col-btn"),
    colorCells: document.querySelectorAll(".color-cell"),
  };

  getGridRows() {
    return this.dom.gridContainer.querySelectorAll(".grid-row");
  }

  configureFormButtons() {
    document.addEventListener("keydown", (event) => {
      if (
        this.dom.gridPopup &&
        !this.dom.gridPopup.classList.contains("hidden")
      ) {
        const colorList = [
          "#0000ff",
          "#ff0000",
          "#008000",
          "#ffff00",
          "#ff00ff",
          "#ffa500",
          "#00ffff",
          "#ffffff",
          "#000000",
          "#808080",
          "#800080",
        ];
        if (event.altKey && Number.isInteger(parseInt(event.key)))
          this.setColor(colorList[event.key - 1]);
        if (event.altKey && event.key === "q") this.setColor("#000000");
        if (event.altKey && event.key === "w") this.setColor("#ffffff");
        if (event.altKey && event.key === "g") this.setColor("#808080");
        if (event.altKey && event.key === "s") this.setColor("#800080");
        if (event.altKey && event.key === "`") this.setColor("#00ffff");
      }
    });

    this.dom.gridBtn.addEventListener("click", () => {
      this.dom.gridPopup.classList.toggle("hidden");
    });

    document.addEventListener("keydown", (event) => {
      if (event.altKey && event.key === "r")
        this.dom.gridPopup.classList.toggle("hidden");
    });

    this.dom.addRowBtn.addEventListener("click", () => this.pushRows());
    this.dom.removeRowBtn.addEventListener("click", () => this.popRows());
    this.dom.addColBtn.addEventListener("click", () => this.pushCols());
    this.dom.removeColBtn.addEventListener("click", () => this.popCols());

    this.dom.colorCells.forEach((cell) => {
      cell.addEventListener("click", () => {
        this.setColor(cell.getAttribute("data-color"));
      });
    });

    this.dom.heightInput.addEventListener("change", () => {
      const newRows = parseInt(this.dom.heightInput.value);
      if (newRows < 1) return;
      const rowCount = Array.from(this.getGridRows()).length - 1;
      if (newRows < rowCount) {
        this.popRows(rowCount - newRows);
      } else {
        this.pushRows(newRows - rowCount);
      }
    });
    this.dom.widthInput.addEventListener("change", () => {
      const newCols = parseInt(this.dom.widthInput.value);
      if (newCols < 1) return;
      const colCount = Array.from(this.getGridRows())[0].children.length - 1;
      if (newCols < colCount) {
        this.popCols(colCount - newCols);
      } else {
        this.pushCols(newCols - colCount);
      }
    });
    this.dom.colorInput.addEventListener("input", () => {
      this.bgColor = this.dom.colorInput.value;
      this.dom.colorClickBtn.checked = true;
    });
    this.dom.cellSizeInput.addEventListener("input", () => {
      this.cellSize = this.dom.cellSizeInput.value;
      this.updateGridSize();
    });
    this.dom.resetBtn.addEventListener("click", () => this.createGrid());
    this.dom.indexBtn.addEventListener("click", () =>
      this.switchIndexing(this.indexStart ? 0 : 1)
    );
  }

  setColor(color) {
    if (this.bgColor === color && this.dom.colorClickBtn.checked) {
      this.dom.colorClickBtn.checked = false;
      this.dom.colorInput.value = "#ffffff";
      return;
    }
    this.bgColor = color;
    this.dom.colorClickBtn.checked = true;
    this.dom.colorInput.value = color;
  }

  createCell(textContent = null) {
    const cell = document.createElement("div");
    cell.classList.add("grid-cell");
    cell.style.fontSize = this.fontSize + "px" || "20px";

    if (!textContent && textContent !== "") {
      // Not header/row cell
      cell.setAttribute("contenteditable", "");
      cell.setAttribute("spellcheck", "false");
      cell.addEventListener("click", () => {
        if (this.dom.colorClickBtn.checked)
          cell.style.backgroundColor = this.bgColor;
        if (
          this.getLuminance(cell.style.backgroundColor) === 0 ||
          this.getLuminance(cell.style.backgroundColor) < 0.5
        )
          cell.style.color = "white";
        else if (this.getLuminance(cell.style.backgroundColor) >= 0.5)
          cell.style.color = "black";
      });
      cell.addEventListener("input", () => {
        if (cell.textContent.length > 6 && this.cellSize < 5) {
          this.cellSize = 5;
          this.updateGridSize();
        } else if (cell.textContent.length > 8 && this.cellSize < 6) {
          this.cellSize++;
          this.updateGridSize();
        }
      });
    } else {
      cell.textContent = textContent;
      cell.style.border = "none";
      cell.classList.add("index");
    }

    return cell;
  }

  createGrid() {
    this.dom.gridContainer.replaceChildren();
    const topRowIndex = document.createElement("div");
    topRowIndex.appendChild(this.createCell(""));
    topRowIndex.classList.add("grid-row");
    for (let col = 0; col < this.dom.widthInput.value; col++) {
      topRowIndex.appendChild(this.createCell(this.indexStart + col));
    }

    this.dom.gridContainer.appendChild(topRowIndex);
    for (let row = 0; row < this.dom.heightInput.value; row++) {
      this.dom.gridContainer.appendChild(this.createRow(row));
    }
    this.updateGridSize();
  }

  createRow(index) {
    const cellRow = document.createElement("div");
    cellRow.classList.add("grid-row");
    cellRow.appendChild(this.createCell(this.indexStart + index));
    for (let col = 0; col < this.dom.widthInput.value; col++) {
      const cell = this.createCell();
      cellRow.appendChild(cell);
    }
    return cellRow;
  }

  popRows(numberToPop = 1) {
    if (numberToPop === 0) return;
    const existingRows = Array.from(this.getGridRows());
    this.dom.heightInput.value = existingRows.length - 1 - numberToPop;

    if (existingRows.length <= 2) return; // index row + 1 cell
    existingRows.splice(-1 * numberToPop, numberToPop);
    this.dom.gridContainer.replaceChildren(...existingRows);
  }

  pushRows(numberToPush = 1) {
    if (numberToPush === 0) return;
    const numOfExistingRows = Array.from(this.getGridRows()).length;
    this.dom.heightInput.value = numOfExistingRows - 1 + numberToPush;

    for (let i = 0; i < numberToPush; i++) {
      this.dom.gridContainer.appendChild(
        this.createRow(numOfExistingRows + i - 1)
      );
    }
  }

  popCols(numberToPop = 1) {
    if (numberToPop === 0) return;
    const existingRows = Array.from(this.getGridRows());
    this.dom.widthInput.value =
      existingRows[0].children.length - 1 - numberToPop;

    for (let i = 0; i < numberToPop; i++) {
      existingRows.forEach((row) => {
        const existingCells = Array.from(row.querySelectorAll(".grid-cell"));
        if (existingCells.length <= 2) return; // index + 1 cell
        const keepCells = existingCells.slice(0, -1);
        row.replaceChildren(...keepCells);
      });
    }
  }

  pushCols(numberToPush = 1) {
    if (numberToPush === 0) return;
    const existingRows = Array.from(this.getGridRows());
    this.dom.widthInput.value =
      existingRows[0].children.length - 1 + numberToPush;

    for (let i = 0; i < numberToPush; i++) {
      const numOfExistingCols = existingRows[0].children.length - 1;
      existingRows[0].appendChild(
        this.createCell(this.indexStart + numOfExistingCols)
      );
      existingRows.slice(1).forEach((row) => {
        const cell = this.createCell();
        cell.addEventListener("input", () => {
          if (
            (cell.textContent.length > 6 && this.cellSize < 5) ||
            (cell.textContent.length > 8 && this.cellSize < 6)
          ) {
            this.cellSize++;
            this.updateGridSize();
          }
        });
        row.appendChild(cell);
      });
    }
  }

  switchIndexing(newIndexStart = 0) {
    const indexCells = Array.from(
      this.dom.gridContainer.querySelectorAll(".grid-cell.index")
    ).filter((cell) => cell.textContent != " ");
    indexCells.forEach((cell) => {
      cell.textContent = cell.textContent - this.indexStart + newIndexStart;
    });

    this.indexStart = newIndexStart;
  }

  getLuminance(bgColor) {
    const rgb = bgColor.replace("rgb(", "").replace(")", "").split(", ");
    const { r, g, b } = { r: rgb[0], g: rgb[1], b: rgb[2] };

    const luminance =
      (0.2126 * r) / 255 + (0.7152 * g) / 255 + (0.0722 * b) / 255;

    return luminance;
  }

  updateGridSize() {
    const cells = this.dom.gridContainer.querySelectorAll(".grid-cell");
    this.fontSize = 5 * this.cellSize > 20 ? 20 : 5 * this.cellSize;
    cells.forEach((cell) => {
      cell.style.height = 10 * this.cellSize + "px";
      cell.style.width = 10 * this.cellSize + "px";
      cell.style.fontSize = this.fontSize + "px";
    });
    this.dom.cellSizeInput.value = this.cellSize;
  }

  init() {
    this.configureFormButtons();
    this.cellSize = document.querySelector("input[name='cell-size']").value;
    this.bgColor = "#000000";
    this.indexStart = 1;
    this.createGrid();
    return this;
  }
}

class NumberedAlphabetPopup {
  constructor() {
    this.init();
    this.fillAlphaPopup();
  }

  configureFormButtons() {
    this.alphaBtn.addEventListener("click", () =>
      this.alphaPopup.classList.toggle("hidden")
    );
    document.addEventListener("keydown", (event) => {
      if (event.altKey && event.key === "a")
        this.alphaPopup.classList.toggle("hidden");
    });

    this.swapIndexBtn.addEventListener("click", () => this.swapIndexing());
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

  swapIndexing() {
    if (this.indexing === 0) this.changeLabelsOne();
    else this.changeLabelsZero();
  }

  changeLabelsZero() {
    const spans = this.alphaPopup.querySelectorAll("div span");
    spans.forEach((span, index) => {
      const spanParts = span.textContent.split(":");
      spanParts[0] = index;
      span.textContent = spanParts.join(":");
    });
    spans[9].classList.add("single-digit");
    this.indexing = 0;
  }

  changeLabelsOne() {
    const spans = this.alphaPopup.querySelectorAll("div span");
    spans.forEach((span, index) => {
      const spanParts = span.textContent.split(":");
      spanParts[0] = index + 1;
      span.textContent = spanParts.join(":");
    });
    spans[9].classList.remove("single-digit");
    this.indexing = 1;
  }

  init() {
    this.indexing = 1;
    this.alphaBtn = document.querySelector(".alphabet-btn");
    this.alphaPopup = document.querySelector(".alphabet-popup");
    this.swapIndexBtn = this.alphaPopup.querySelector(".swap-index-btn");
    this.zeroBtn = this.alphaPopup.querySelector(".zero-btn");
    this.oneBtn = this.alphaPopup.querySelector(".one-btn");
    this.configureFormButtons();
    return this;
  }
}

class EdgeworkPopup {
  constructor() {
    this.popup = new PopupGenerator(
      "Edgework",
      [
        {
          type: "group",
          schema: [
            {
              type: "label",
              forField: "serial",
              textContent: "Serial #",
            },
            {
              type: "textInput",
              name: "serial",
              id: "serial-input",
              minlength: "6",
              maxlength: "6",
              autocomplete: "off",
              required: true,
              oninputCallback: () => {
                this.validateSerialInput();
                this.form
                  .querySelector(".serial-preview")
                  .replaceChildren(
                    this.createSerialEle(this.serialInput.value)
                  );
              },
            },
            {
              type: "label",
              forField: "batteries",
              textContent: "Batteries",
            },
            {
              type: "numberInput",
              name: "batteries",
              id: "batteries-input",
              min: "0",
              max: "9",
              oninputCallback: () => {
                this.validateBatteries();
                const preview = this.createBatteriesEle(
                  this.batteriesInput.value,
                  this.holdersInput.value
                );
                if (preview) this.batteriesPreview.replaceChildren(preview);
              },
            },
            {
              type: "label",
              forField: "holders",
              textContent: "Battery Holders",
            },
            {
              type: "numberInput",
              name: "holders",
              id: "holders-input",
              min: "0",
              max: "9",
              oninputCallback: () => {
                this.validateBatteries();
                const preview = this.createBatteriesEle(
                  this.batteriesInput.value,
                  this.holdersInput.value
                );
                if (preview) this.batteriesPreview.replaceChildren(preview);
              },
            },
          ],
          classList: "edgework-first-form-row",
        },
        {
          type: "label",
          forField: "ports",
          textContent: "Ports",
        },
        {
          type: "textInput",
          name: "ports",
          id: "ports-input",
          placeholder: "ex: (dvi rj) (serial para) (empty)",
          autocomplete: "off",
          oninputCallback: () => {
            this.validatePorts();
            this.portsPreview.replaceChildren(
              this.createPortPlatesEle(
                this.standardizePorts(this.portsInput.value)
              )
            );
          },
        },
        {
          type: "label",
          forField: "lit-inds",
          textContent: "Lit Indicators",
        },
        {
          type: "textInput",
          name: "lit-inds",
          id: "lit-inds-input",
          placeholder: "ex: frk bob msa",
          autocomplete: "off",
          oninputCallback: () => {
            this.litIndsPreview.replaceChildren(
              this.createIndicatorsEles(
                this.standardizeIndicators(this.litIndsInput.value),
                "lit"
              )
            );
          },
        },
        {
          type: "label",
          forField: "unl-inds",
          textContent: "UN-Lit Indicators",
        },
        {
          type: "textInput",
          name: "unlit-inds",
          id: "unlit-inds-input",
          placeholder: "ex: frq nsa",
          autocomplete: "off",
          oninputCallback: () => {
            this.validatePorts();
            this.unlitIndsPreview.replaceChildren(
              this.createIndicatorsEles(
                this.standardizeIndicators(this.unlitIndsInput.value),
                "unlit"
              )
            );
          },
        },
        {
          type: "no-reset-yes-btn-group",
          no: "Close",
          yes: "Create",
          resetCallback: {
            trigger: "click",
            callback: () => {
              this.resetForm();
              this.resetEdgework();
            },
          },
        },
        {
          type: "group",
          classList: ["edgework-preview", "edgework"],
          schema: [
            {
              type: "group",
              classList: "serial-preview",
            },
            {
              type: "group",
              classList: "batteries-preview",
            },
            {
              type: "group",
              classList: "ports-preview",
            },
            {
              type: "group",
              classList: "lit-inds-preview",
            },
            {
              type: "group",
              classList: "unlit-inds-preview",
            },
          ],
        },
      ],
      () => {
        this.validateForm();
        if (!this.form.checkValidity()) {
          this.reportValidity();
          return;
        }
        this.resetEdgework();
        const formData = new FormData(this.form);
        this.populateSerialEle(formData.get("serial"));
        this.populateBatteries(
          formData.get("batteries"),
          formData.get("holders")
        );
        this.populateIndicators([
          this.standardizeIndicators(formData.get("lit-inds")),
          this.standardizeIndicators(formData.get("unlit-inds")),
        ]);
        this.populatePortPlates(this.standardizePorts(formData.get("ports")));
      },
      true
    );
    this.form = this.popup.form;
    this.realEdgework = document.querySelector(".header .edgework");
    this.serialInput = this.form.querySelector("#serial-input");
    this.batteriesInput = this.form.querySelector("#batteries-input");
    this.holdersInput = this.form.querySelector("#holders-input");
    this.portsInput = this.form.querySelector("#ports-input");
    this.litIndsInput = this.form.querySelector("#lit-inds-input");
    this.unlitIndsInput = this.form.querySelector("#unlit-inds-input");
    this.edgeworkPreview = this.form.querySelector(".edgework-preview");
    this.serialPreview = this.form.querySelector(".serial-preview");
    this.batteriesPreview = this.form.querySelector(".batteries-preview");
    this.portsPreview = this.form.querySelector(".ports-preview");
    this.litIndsPreview = this.form.querySelector(".lit-inds-preview");
    this.unlitIndsPreview = this.form.querySelector(".unlit-inds-preview");
    return this;
  }

  doPopup() {
    this.popup.doPopup();
  }

  validateSerialInput() {
    this.serialInput.setCustomValidity("");
    const validSerialRegex = /[A-Za-z0-9]{6}/;
    const serial = this.serialInput.value;
    if (!serial.match(validSerialRegex) || serial.length !== 6) {
      this.serialInput.setCustomValidity(
        "Invalid serial. Must be exactly 6 letters/numbers"
      );
      return false;
    }
    return true;
  }

  validateBatteries() {
    const batteries = this.batteriesInput.value;
    const holders = this.holdersInput.value;
    this.batteriesInput.setCustomValidity("");
    this.holdersInput.setCustomValidity("");
    if (batteries > 2 * holders) {
      this.batteriesInput.setCustomValidity(
        "Too much batteries not even holders!"
      );
      return false;
    }

    if (holders > batteries) {
      this.holdersInput.setCustomValidity(
        "Too much holders not enough batteries?"
      );
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
    const edgework = this.realEdgework;
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
    const edgework = this.realEdgework;
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

  populateIndicators(indsLists) {
    const edgework = this.realEdgework;
    edgework.append(this.createIndicatorsEles(indsLists[0], "lit"));
    edgework.append(this.createIndicatorsEles(indsLists[1], "unlit"));
  }

  createIndicatorsEles(indsList, className) {
    const indDivWrapper = document.createElement("div");
    indDivWrapper.classList.add("ind-wrapper");
    if (indsList.length === 0) return [];
    indsList.forEach((ind) => {
      const newInd = document.createElement("div");
      newInd.classList.add("widget", "indicator");
      newInd.textContent = ind.toUpperCase();
      if (ind !== "") newInd.classList.add(className);
      indDivWrapper.appendChild(newInd);
    });
    return indDivWrapper;
  }

  populatePortPlates(portList) {
    if (portList.length === 0) return;
    const edgework = this.realEdgework;
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
    const portsInput = this.portsInput;
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
      .replaceAll("  ", " ")
      .trim();
    const portsRegex = /[([][dvi|parallel|ps2|rj|serial|rca|empty|none| ,-]+/g;
    const plates = replacedInput.match(portsRegex);
    if (!plates) return [];
    plates.forEach((plate, i) => {
      plates[i] = plates[i].replaceAll(/\(|\)|\[|\]/g, "");
    });
    return plates;
  }

  standardizeIndicators(input) {
    if (input == "") return [];

    const replacedInput = input
      .toLowerCase()
      .replaceAll(",", " ")
      .replaceAll("  ", " ");
    const indsRegex = /(bob|car|clr|frk|frq|ind|msa|nsa|sig|snd|trn)+/g;
    const inds = replacedInput.match(indsRegex);
    if (!inds) return [];
    inds.forEach((ind, i) => {
      inds[i] = inds[i].replaceAll(/\(|\)|\[|\]/g, "");
    });
    return inds;
  }

  resetForm() {
    this.serialPreview.replaceChildren();
    this.batteriesPreview.replaceChildren();
    this.portsPreview.replaceChildren();
    this.litIndsPreview.replaceChildren();
    this.unlitIndsPreview.replaceChildren();
    this.form.reset();
    this.form.querySelector("input").focus();
  }

  resetEdgework() {
    this.realEdgework.replaceChildren();
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
            textContent: "Add New Module",
            listenerEvent: {
              trigger: "click",
              callback: () => this.addNewModulePopup.doPopup(),
            },
            classList: "add-new-module-btn",
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
        const formData = new FormData(form.element);
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
              fitcontent: true,
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
              btnType: "button",
              textContent: "Delete",
              listenerEvent: {
                trigger: "click",
                callback: (data) => {
                  mainPubSub.publish("deleteModule", existingSidebaritem);
                  data.element.closest(".popup-overlay").remove();
                },
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
    const example = `[\n  {\n    "moduleName": "Logic",\n    "manualUrl": "https://ktane.timwi.de/HTML/Logic.html"\n  },\n  {\n    "moduleName": "Silly Slots",\n    "manualUrl": "https://ktane.timwi.de/HTML/Silly%20Slots.html"\n  },\n  {\n    "manualUrl": "https://ktane.timwi.de/HTML/Yippee.html"\n  }\n]`;

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
  GridPopup,
  SidebarPopup,
  AddModulePopup,
  EditModulePopup,
  ImportModulesPopup,
  ExportModulesPopup,
  ImportDefaultListPopup,
};
