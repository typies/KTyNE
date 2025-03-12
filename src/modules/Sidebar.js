import { AddModulePopup, EdgeworkPopup } from "./popup.js";
import PopupGenerator from "./PopupGenerator.js";
import mainPubSub from "./PubSub.js";
import sharedIdCounter from "./sharedIdCounter.js";
import fullModList from "../defaultModLists/fullList(Mar 11 2025).json";
const FULL_LIST_URL = "../defaultModLists/fullList(Mar 11 2025).json";

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
    filterClear: document.querySelector(".sidebar-filter-clear"),
    moduleListTitle: document.querySelector(".module-list-title"),
    collapseSidebarBtn: document.querySelector(".collapse-sidebar-btn"),
    showSidebarBtn: document.querySelector(".show-sidebar-btn"),
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
    this.render();
  }

  render() {
    this.dom.sidebarListElement.replaceChildren(
      ...this.getFiftyModules().map((sidebarItem) =>
        this.createSidebarLi(sidebarItem)
      )
    );
  }

  getFiftyModules() {
    const recentModules = this.localStorageGetRecent();
    if (recentModules.length === 50) return recentModules;

    const recentModNames = recentModules.map((item) => item.moduleName);

    const moreModules = this.sidebarItems
      .filter((item) => !recentModNames.includes(item.moduleName))
      .slice(0, 50);
    const fifty = [...recentModules, ...moreModules];
    return fifty;
  }

  localStorageAppendRecent(moduleItem) {
    if (!moduleItem || !moduleItem.moduleName || !moduleItem.manualUrl) return;
    const recentModules = this.localStorageGetRecent();
    if (recentModules >= 50) {
      recentModules.splice(50);
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

  openModule(sidebarItem) {
    this.openNewModule(sidebarItem.moduleName, sidebarItem.manualUrl);
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
    path1.setAttribute(
      "d",
      "M3.8 12.963L2 18l4.8-.63L18.11 6.58a2.612 2.612 0 00-3.601-3.785L3.8 12.963z"
    );

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
          `Set default manual for ${sidebarItem.moduleName}`,
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
            this.setDefaultManual(sidebarItem.moduleName, data);
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

  setDefaultManual(modName, newDefaultManual) {
    const existingGroupItem = this.getSidebarItem(modName);
    new PopupGenerator(`New default set for ${modName}`, [
      { type: "label", textContent: newDefaultManual },
      { type: "close-btn" },
    ]).doPopup();
    if (existingGroupItem.manualUrl !== newDefaultManual) {
      existingGroupItem.manualUrl = newDefaultManual;
      const newItem = {
        moduleName: modName,
        manualList: existingGroupItem.manualList,
        manualUrl: newDefaultManual,
      };
      this.localStorageUpdateRecent(newItem);
      this.localStorageUpdateModule(modName, newItem);
      this.syncLists();
      this.render();
    }
  }

  attemptToOpen() {
    const exactMatch = this.getSidebarItem(this.dom.filter.value);
    const sidebarItems = this.dom.sidebarListElement.children;
    if (exactMatch) this.openModule(exactMatch);
    else if (sidebarItems.length === 1)
      this.openModule(this.getSidebarItem(sidebarItems[0].textContent));
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
    this.dom.filterClear.addEventListener("click", () => {
      this.dom.filter.value = "";
      this.filterSidebar("");
    });
    this.dom.collapseSidebarBtn.addEventListener("click", () =>
      this.collapseToggle()
    );
    this.dom.showSidebarBtn.addEventListener("click", () =>
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
    this.dom.collapseSidebarBtn.classList.toggle("hidden");
    this.dom.showSidebarBtn.classList.toggle("hidden");
    this.dom.addOneBtn.classList.toggle("hidden");
  }

  toggleAddOneMode() {
    this.addOneMode = !this.addOneMode;
    this.collapseToggle();
    this.dom.filter.select();
    this.dom.filter.value = "";
  }

  openNewModule(modName, url) {
    mainPubSub.publish("addIframe", { manualUrl: url });
    mainPubSub.publish("addHeaderListItem", { moduleName: modName });
    mainPubSub.publish("tabChange", {
      iframeId: sharedIdCounter.getId(),
    });
    sharedIdCounter.incrementId();
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
      this.render();
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
