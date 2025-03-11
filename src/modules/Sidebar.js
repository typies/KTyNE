import { EdgeworkPopup } from "./popup.js";
import PopupGenerator from "./PopupGenerator.js";
import mainPubSub from "./PubSub.js";
import sharedIdCounter from "./sharedIdCounter.js";
import fullModList from "../defaultModLists/fullList.json";
const KTANE_TIMWI_URL = "https://ktane.timwi.de/";

class Sidebar {
  constructor(itemList = []) {
    this.sidebarItems = itemList;
    this.edgeworkPopup = new EdgeworkPopup();
    this.init();
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
  };

  init() {
    this.importProjectsFromLocal();
    this.addSidebarItems(fullModList);
    this.configureStaticSidebarBtns();
    this.render();
  }

  render() {
    if (this.sidebarItems instanceof Array) {
      this.dom.sidebarListElement.replaceChildren(
        ...this.sidebarItems.map((sidebarItem) =>
          this.createSidebarLi(sidebarItem)
        )
      );
    }
    this.sortSidebar();
  }

  localStorageAdd(module) {
    localStorage.setItem(
      module.moduleName,
      JSON.stringify({
        manualList: module.manualList,
        manualUrl: module.manualUrl,
        moduleList: module.moduleList,
      })
    );
  }

  localStorageRemove(moduleName) {
    localStorage.removeItem(moduleName);
  }

  localStorageUpdate(moduleName, localStorageItem) {
    this.localStorageRemove(moduleName);
    this.localStorageAdd(localStorageItem);
  }

  importProjectsFromLocal() {
    for (let i = 0; i < window.localStorage.length; i++) {
      const localStorageKey = window.localStorage.key(i);
      const localStorageValue = window.localStorage.getItem(localStorageKey);
      const jsonValue = JSON.parse(localStorageValue);
      const moduleObj = {
        moduleName: localStorageKey,
        manualList: jsonValue.manualList,
        manualUrl: jsonValue.manualUrl,
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

  addSidebarItem(
    sidebarItem,
    reRender = true,
    skipDuplicates = false,
    hidePopup = false
  ) {
    const existingSidebarItem = this.getSidebarItem(sidebarItem.moduleName);
    if (existingSidebarItem) {
      sidebarItem.manualList = [
        ...new Set([
          ...existingSidebarItem.manualList,
          ...sidebarItem.manualList,
        ]),
      ];
      this.localStorageUpdate(sidebarItem.moduleName, sidebarItem);
      if (skipDuplicates) {
        return sidebarItem.moduleName;
      }
    } else {
      this.sidebarItems.push(sidebarItem);
      this.localStorageAdd(sidebarItem);
      if (reRender) this.render();
      if (!hidePopup)
        new PopupGenerator(`${sidebarItem.moduleName} Added`).doPopup();
      return sidebarItem;
    }
  }

  addSidebarItems(sidebarItemsList) {
    sidebarItemsList.forEach((sidebarItem) => {
      const newSidebarItemFormatted = {
        moduleName: sidebarItem.moduleName,
        manualList: sidebarItem.manualList,
        manualUrl: sidebarItem.manualUrl,
      };
      this.addSidebarItem(newSidebarItemFormatted, false, true, true);
    });
  }

  syncLists() {
    // Syncs the local storage list with the page list
    this.sidebarItems = [];
    this.importProjectsFromLocal();
  }

  openModule(sidebarItem) {
    this.openNewModule(sidebarItem.moduleName, sidebarItem.manualUrl);
    this.dom.filter.focus();
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

    editBtn.setAttribute("viewbox", "0 0 20 20");
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
      // this.editModulePopup.generate(sidebarItem).doPopup();
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
    });

    newSidebarListItem.append(editBtn);
    return newSidebarListItem;
  }
  setDefaultManual(modName, newDefaultManual) {
    const existingGroupItem = this.getSidebarItem(modName);
    new PopupGenerator(`New default set for ${modName}`, [
      { type: "label", textContent: newDefaultManual },
      { type: "close-btn" },
    ]).doPopup();
    if (existingGroupItem.manualUrl !== newDefaultManual) {
      existingGroupItem.manualUrl = newDefaultManual;
      this.localStorageUpdate(modName, {
        moduleName: modName,
        manualList: existingGroupItem.manualList,
        manualUrl: newDefaultManual,
      });
      this.syncLists();
      this.render();
    }
  }

  configureStaticSidebarBtns() {
    this.dom.filter.addEventListener("input", () => {
      this.filterSidebar(this.dom.filter.value);
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
    this.dom.filter.focus();
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

  sortSidebar() {
    const sidebarList = Array.from(this.dom.sidebarListElement.children);
    sidebarList.sort((a, b) => {
      a = a.textContent.toLowerCase();
      b = b.textContent.toLowerCase();
      if (a < b) return -1;
      return 1;
    });
    this.dom.sidebarListElement.replaceChildren(...sidebarList);
  }

  filterSidebar(filterTerm) {
    const filterTermCleaned = filterTerm.toLowerCase().trim();
    const sidebarListChildren = Array.from(
      this.dom.sidebarListElement.children
    );
    if (filterTermCleaned === "") {
      this.render();
      return;
    }
    sidebarListChildren.forEach((ele) => {
      if (
        ele.textContent.toLowerCase().includes(filterTermCleaned) ||
        ele.textContent
          .toLowerCase()
          .replace("’", "'")
          .includes(filterTermCleaned)
      ) {
        ele.classList.remove("hidden");
      } else {
        ele.classList.add("hidden");
      }
    });
  }
}

export default Sidebar;
