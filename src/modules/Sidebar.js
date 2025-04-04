import { AddModulePopup, EdgeworkPopup } from "./popup.js";
import PopupGenerator from "./PopupGenerator.js";
import mainPubSub from "./PubSub.js";

// These need updated after each repo sync
import fullModList from "../defaultModLists/fullList(Apr 04 2025).json";
const FULL_LIST_URL = "../defaultModLists/fullList(Apr 04 2025).json";

const KTANE_TIMWI_URL = "https://ktane.timwi.de/";

class Sidebar {
  constructor(itemList = []) {
    this.sidebarItems = itemList;
    this.edgeworkPopup = new EdgeworkPopup();
    this.init();
    this.addNewModulePopup = new AddModulePopup();
    mainPubSub.subscribe("addNewModule", (data) =>
      this.addSidebarItem(data, true)
    );
    this.newRepoTabPopup = new PopupGenerator(
      "Opening New KTANE.TIMEWI.DE Tab",
      [
        {
          type: "label",
          textContent: "New Tab Name",
          forField: "new-tab-input",
        },
        {
          type: "textInput",
          id: "new-tab-input",
          name: "new-tab-input",
        },
        {
          type: "no-yes-btn-group",
          no: "Cancel",
          yes: "Open",
        },
      ],
      (form) => {
        const formData = new FormData(form.element);
        const newTabName = formData.get("new-tab-input");
        if (!newTabName || newTabName === "") return;
        navigator.clipboard.writeText(newTabName);
        this.openNewModule(newTabName, KTANE_TIMWI_URL);
      }
    );
    return this;
  }

  dom = {
    sidebar: document.querySelector(".sidebar"),
    sidebarListElement: document.querySelector(".sidebar .module-list"),
    newRepoTabBtn: document.querySelector(".new-repo-tab-btn"),
    filter: document.querySelector("#sidebar-filter-input"),
    moduleListTitle: document.querySelector(".module-list-title"),
    toggleSidebarBtn: document.querySelector(".toggle-sidebar-btn"),
    addOneBtn: document.querySelector(".add-one-btn"),
    edgeworkBtn: document.querySelector(".edgework-btn"),
    addModuleBtn: document.querySelector(".add-module-btn"),
    lastRepoSyncText: document.querySelector(".last-repo-sync"),
  };

  init() {
    this.importModulesFromLocal();
    this.addSidebarItems(fullModList);
    this.configureStaticSidebarBtns();
    this.dom.lastRepoSyncText.textContent =
      this.dom.lastRepoSyncText.textContent +
      ` ${FULL_LIST_URL.slice(FULL_LIST_URL.indexOf("(") + 1, FULL_LIST_URL.indexOf(")"))}`;
    this.renderSome();
  }

  renderSome(amount = 50) {
    this.renderAllMode
      ? this.renderAll()
      : this.dom.sidebarListElement.replaceChildren(
          ...this.getModules(amount).map((sidebarItem) =>
            this.createSidebarLi(sidebarItem)
          )
        );

    const renderAllBtn = document.createElement("li");
    renderAllBtn.classList.add(...["sidebar-item", "green"]);
    renderAllBtn.addEventListener("click", () => {
      this.renderAllMode = true;
      this.renderAll();
    });
    renderAllBtn.textContent = "Show all modules";
    this.dom.sidebarListElement.append(renderAllBtn);
  }

  renderAll() {
    this.dom.sidebarListElement.replaceChildren(
      ...this.getModules(this.sidebarItems.length).map((sidebarItem) =>
        this.createSidebarLi(sidebarItem)
      )
    );
  }

  getModules(amount = 50) {
    const recentModules = this.localStorageGetRecent();
    if (recentModules.length >= amount) return recentModules.slice(0, amount);

    const recentModNames = recentModules.map((item) => item.moduleName);

    const moreModules = this.sidebarItems
      .filter((item) => !recentModNames.includes(item.moduleName))
      .slice(0, amount);
    const modules = [...recentModules, ...moreModules];
    return modules;
  }

  localStorageAppendRecent(moduleItem) {
    const MAX_RECENT_AMOUNT = 50;
    if (!moduleItem || !moduleItem.moduleName || !moduleItem.manualUrl) return;
    const recentModules = this.localStorageGetRecent();
    if (recentModules >= MAX_RECENT_AMOUNT) {
      recentModules.splice(MAX_RECENT_AMOUNT);
    }
    const indexOfExistingRecent = recentModules.findIndex(
      (item) => item.moduleName === moduleItem.moduleName
    );
    if (indexOfExistingRecent === -1) {
      recentModules.unshift(moduleItem);
      window.localStorage.setItem(
        "recentModules",
        JSON.stringify(recentModules)
      );
    } else {
      recentModules.splice(indexOfExistingRecent, 1);
      const updatedRecents = [
        moduleItem,
        ...recentModules.slice(0, indexOfExistingRecent),
        ...recentModules.slice(indexOfExistingRecent),
      ];
      window.localStorage.setItem(
        "recentModules",
        JSON.stringify(updatedRecents)
      );
    }
  }

  localStorageGetRecent() {
    return JSON.parse(window.localStorage.getItem("recentModules")) || [];
  }

  localStorageUpdateRecent(newItem) {
    this.localStorageDeleteRecent(newItem.moduleName);
    this.localStorageAppendRecent(newItem);
  }

  localStorageDeleteRecent(moduleName) {
    const recentModules = this.localStorageGetRecent();
    const indexOfExistingRecent = recentModules.findIndex(
      (item) => item.moduleName === moduleName
    );
    if (indexOfExistingRecent !== -1)
      recentModules.splice(indexOfExistingRecent, 1);

    window.localStorage.setItem("recentModules", JSON.stringify(recentModules));
  }

  localStorageAddModule(module) {
    localStorage.setItem(
      module.moduleName,
      JSON.stringify({
        manualList: module.manualList,
        manualUrl: module.manualUrl,
        moduleList: module.moduleList,
        deleteable: module.deleteable,
      })
    );
  }

  localStorageRemoveModule(moduleName) {
    localStorage.removeItem(moduleName);
  }

  localStorageUpdateModule(moduleName, localStorageItem) {
    this.localStorageRemoveModule(moduleName);
    this.localStorageAddModule(localStorageItem);
  }

  importModulesFromLocal() {
    for (let i = 0; i < window.localStorage.length; i++) {
      const localStorageKey = window.localStorage.key(i);
      const localStorageValue = window.localStorage.getItem(localStorageKey);
      const jsonValue = JSON.parse(localStorageValue);
      const moduleObj = {
        moduleName: localStorageKey,
        manualList: jsonValue.manualList,
        manualUrl: jsonValue.manualUrl,
        deleteable: jsonValue.deleteable,
      };
      this.sidebarItems.push(moduleObj);
    }
  }

  getSidebarItem(mName) {
    if (!this.sidebarItems) return -1;
    return this.sidebarItems.find((item) => {
      if (item.moduleName.toLowerCase() === mName.toLowerCase()) return item;
    });
  }

  getSidebarItemElement(mName) {
    const sidebarItems = Array.from(this.dom.sidebarListElement.children);
    const matchingItem = sidebarItems.find(
      (child) => child.innerText.toLowerCase() === mName.toLowerCase()
    );
    return matchingItem;
  }

  addSidebarItem(sidebarItem, deleteable = false) {
    const existingSidebarItem = this.getSidebarItem(sidebarItem.moduleName);
    if (existingSidebarItem) {
      sidebarItem.manualList = [
        ...new Set([
          ...existingSidebarItem.manualList,
          ...sidebarItem.manualList,
        ]),
      ];
      this.localStorageUpdateModule(sidebarItem.moduleName, sidebarItem);
    } else {
      if (deleteable) sidebarItem.deleteable = true;
      this.sidebarItems.push(sidebarItem);
      this.localStorageAddModule(sidebarItem);
      return;
    }
  }

  addSidebarItems(sidebarItemsList) {
    sidebarItemsList.forEach((sidebarItem) => {
      const newSidebarItemFormatted = {
        moduleName: sidebarItem.moduleName,
        manualList: sidebarItem.manualList,
        manualUrl: sidebarItem.manualUrl,
      };
      this.addSidebarItem(newSidebarItemFormatted);
    });
  }

  syncLists() {
    // Syncs the local storage list with the page list
    this.sidebarItems = [];
    this.importModulesFromLocal();
  }

  openModule(sidebarItem, oneTimeManual = false) {
    if (oneTimeManual)
      this.openNewModule(sidebarItem.moduleName, oneTimeManual);
    else this.openNewModule(sidebarItem.moduleName, sidebarItem.manualUrl);
    this.localStorageAppendRecent(sidebarItem);
    this.dom.filter.select();
    this.dom.filter.value = "";
    this.filterSidebar("");

    if (this.addOneMode) {
      this.toggleAddOneMode();
    }
  }

  createEditSvg() {
    const editBtn = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    editBtn.classList.add("edit-svg");
    const path1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );

    editBtn.setAttribute("fill", "#87ceeb");
    path1.setAttribute("d", "M7 10L12 15L17 10");

    editBtn.appendChild(path1);
    return editBtn;
  }

  createSidebarLi(sidebarItem) {
    const newSidebarListItem = document.createElement("li");
    newSidebarListItem.classList.add("sidebar-item");
    newSidebarListItem.addEventListener("click", () =>
      this.openModule(sidebarItem)
    );
    newSidebarListItem.textContent = sidebarItem.moduleName;
    const editBtn = this.createEditSvg();
    editBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!sidebarItem.deleteable) {
        new PopupGenerator(
          `Alternative Manuals for ${sidebarItem.moduleName}`,
          [
            {
              type: "default-manual-btn-group",
              moduleName: sidebarItem.moduleName,
              btnTextList: sidebarItem.manualList,
              currentDefault: sidebarItem.manualUrl,
            },
            {
              type: "close-btn",
            },
          ],
          (data) => {
            this.setDefaultPrompt(sidebarItem, data);
          }
        ).doPopup();
      } else {
        new PopupGenerator(
          `Editing ${sidebarItem.moduleName}`,
          [
            {
              type: "label",
              textContent:
                "Default Manual (add more by adding more module with the same name)",
            },
            {
              type: "default-manual-btn-group",
              moduleName: sidebarItem.moduleName,
              btnTextList: sidebarItem.manualList,
              currentDefault: sidebarItem.manualUrl,
            },
            {
              type: "group",
              schema: [
                {
                  type: "button",
                  textContent: "Close",
                },
                {
                  type: "button",
                  textContent: "Delete",
                  listenerEvent: {
                    trigger: "click",
                    callback: (data) => {
                      data.element.closest(".popup-overlay").remove();
                      this.removeSidebarItemElement(newSidebarListItem);
                    },
                  },
                },
              ],
              classList: "form-btn-group",
            },
          ],
          (data) => {
            this.setDefaultManual(sidebarItem.moduleName, data);
          }
        ).doPopup();
      }
    });

    newSidebarListItem.append(editBtn);
    return newSidebarListItem;
  }

  removeSidebarItemElement(sidebarItem) {
    this.localStorageRemove(sidebarItem.innerText);
    this.localStorageDeleteRecent(sidebarItem.innerText);
    sidebarItem.remove();
    this.syncLists();
  }

  localStorageRemove(moduleName) {
    localStorage.removeItem(moduleName);
  }

  setDefaultPrompt(sidebarItem, manualClicked) {
    const existingGroupItem = this.getSidebarItem(sidebarItem.moduleName);
    if (existingGroupItem.manualUrl !== manualClicked) {
      new PopupGenerator(
        `This is different from your default, What would you like to do?`,
        [
          {
            type: "group",
            schema: [
              {
                type: "button",
              },
              {
                type: "button",
                btnType: "submit",
                textContent: "Open Once",
                listenerEvent: {
                  trigger: "click",
                  callback: () => {
                    this.openModule(sidebarItem, manualClicked);
                  },
                },
              },
              {
                type: "button",
                btnType: "submit",
                textContent: "Change Default",
                listenerEvent: {
                  trigger: "click",
                  callback: () => {
                    this.setDefaultManual(sidebarItem, manualClicked);
                  },
                },
              },
            ],
            classList: "form-btn-group",
          },
        ]
      ).doPopup();
    } else {
      this.openModule(sidebarItem);
    }
  }

  setDefaultManual(sidebarItem, newDefaultManual) {
    sidebarItem.manualUrl = newDefaultManual;
    this.localStorageUpdateRecent(sidebarItem);
    this.localStorageUpdateModule(sidebarItem.moduleName, sidebarItem);
    this.syncLists();
    this.renderSome();
  }

  attemptToOpen() {
    const exactMatch = this.getSidebarItem(this.dom.filter.value);
    const sidebarItems = this.dom.sidebarListElement.children;
    if (exactMatch) this.openModule(exactMatch);
    else this.openModule(this.getSidebarItem(sidebarItems[0].textContent));
  }

  configureStaticSidebarBtns() {
    this.dom.filter.addEventListener("input", () => {
      this.filterSidebar(this.dom.filter.value);
    });
    this.dom.filter.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.attemptToOpen();
      }
    });
    this.dom.toggleSidebarBtn.addEventListener("click", () =>
      this.collapseToggle()
    );
    this.dom.addOneBtn.addEventListener("click", () => {
      this.toggleAddOneMode();
    });

    document.addEventListener("keydown", (event) => {
      if (event.altKey && event.key === "n") this.newRepoTabPopup.doPopup();
    });
    this.dom.newRepoTabBtn.addEventListener("click", () => {
      this.newRepoTabPopup.doPopup();
    });
    this.dom.edgeworkBtn.addEventListener("click", () => {
      this.edgeworkPopup.doPopup();
    });
    this.dom.addModuleBtn.addEventListener("click", () => {
      this.addNewModulePopup.doPopup();
    });
  }

  collapseToggle() {
    this.dom.sidebar.classList.toggle("hidden");
    this.dom.toggleSidebarBtn.classList.toggle("rotate");
    this.dom.addOneBtn.classList.toggle("hidden");
  }

  toggleAddOneMode() {
    this.addOneMode = !this.addOneMode;
    this.collapseToggle();
    this.dom.filter.select();
    this.dom.filter.value = "";
  }

  openNewModule(modName, url) {
    mainPubSub.publish("addHeaderListItem", {
      moduleName: modName,
      manualUrl: url,
    });
  }

  moduleSort(a, b) {
    if (a.toLowerCase() < b.toLowerCase()) return -1;
    return 1;
  }

  sortSidebar() {
    const sidebarList = Array.from(this.dom.sidebarListElement.children);
    sidebarList.sort((a, b) => this.moduleSort(a.textContent, b.textContent));
    this.dom.sidebarListElement.replaceChildren(...sidebarList);
  }

  filterSidebar(filterTerm) {
    const filterTermCleaned = filterTerm.toLowerCase().trim();
    if (filterTermCleaned === "") {
      this.renderSome();
      return;
    }

    const filterFn = (list, term) => {
      return list.filter(
        (item) =>
          item.moduleName.toLowerCase().includes(term) ||
          item.moduleName.toLowerCase().replace("’", "'").includes(term)
      );
    };

    this.dom.sidebarListElement.replaceChildren();
    const matchingRecents = filterFn(
      this.localStorageGetRecent(),
      filterTermCleaned
    );
    const matchingNames = matchingRecents.map((item) => item.moduleName);
    const matchingItems = filterFn(
      this.sidebarItems.filter(
        (item) => !matchingNames.includes(item.moduleName)
      ),
      filterTermCleaned
    );

    const displayItems = [
      ...matchingRecents,
      ...matchingItems.sort((a, b) =>
        this.moduleSort(a.moduleName, b.moduleName)
      ),
    ];
    displayItems.forEach((item) =>
      this.dom.sidebarListElement.append(this.createSidebarLi(item))
    );
  }
}

export default Sidebar;
