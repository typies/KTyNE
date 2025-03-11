import {
  AddModulePopup,
  EditModulePopup,
  ExportModulesPopup,
  ImportModulesPopup,
  SidebarPopup,
  EdgeworkPopup,
} from "./popup.js";
import PopupGenerator from "./PopupGenerator.js";
import mainPubSub from "./PubSub.js";
import sharedIdCounter from "./sharedIdCounter.js";
import fullModList from "../defaultModLists/fullList.json";
const KTANE_TIMWI_URL = "https://ktane.timwi.de/";

class Sidebar {
  constructor(itemList = []) {
    this.sidebarItems = itemList;
    mainPubSub.subscribe("addNewModule", this.addSidebarItem.bind(this));
    mainPubSub.subscribe("addNewModules", this.addSidebarItems.bind(this));
    mainPubSub.subscribe("deleteModule", this.deleteModule.bind(this));
    mainPubSub.subscribe("replaceModule", this.handleReplaceSub.bind(this));

    this.editModulePopup = new EditModulePopup();
    this.importModulePopup = new ImportModulesPopup();
    this.exportModulePopup = new ExportModulesPopup();
    this.addNewModulePopup = new AddModulePopup();
    this.nukeSidebarPopup = new PopupGenerator(
      "Are you sure you want to DELETE ALL SAVED MODULE?",
      [
        {
          type: "div",
          textContent: "This action is not reversable",
          classList: ["red", "center-text"],
        },
        {
          type: "no-yes-btn-group",
          no: "Get me out of here",
          yes: "Yes, I know what I'm doing",
          yesClassList: "nuke-btn",
        },
      ],
      () => this.removeAllSidebarItems()
    );
    this.edgeworkPopup = new EdgeworkPopup();

    this.sidebarPopup = new SidebarPopup(
      this.addNewModulePopup,
      this.importModulePopup,
      this.exportModulePopup,
      this.nukeSidebarPopup,
      this.importDefaultListPopup
    );
    this.init();
    return this;
  }

  dom = {
    sidebar: document.querySelector(".sidebar"),
    sidebarListElement: document.querySelector(".sidebar .module-list"),
    newRepoTabBtn: document.querySelector(".new-repo-tab-btn"),
    filter: document.querySelector("#sidebar-filter-input"),
    filterClear: document.querySelector(".sidebar-filter-clear"),
    sidebarSettings: document.querySelector(".cog-svg"),
    moduleListTitle: document.querySelector(".module-list-title"),
    collapseSidebarBtn: document.querySelector(".collapse-sidebar-btn"),
    showSidebarBtn: document.querySelector(".show-sidebar-btn"),
    sidebarMenuSidebarBtn: document.querySelector(".options-btn"),
    addOneBtn: document.querySelector(".add-one-btn"),
    edgeworkBtn: document.querySelector(".edgework-btn"),
  };

  init() {
    this.importProjectsFromLocal();
    if (this.sidebarItems.length === 0) {
      this.importDefaultListPopup.doPopup(true);
    }
    this.addSidebarItems(fullModList, true);
    this.render();
    this.configureStaticSidebarBtns();
  }

  render() {
    const sidebarListElement = this.dom.sidebarListElement;
    sidebarListElement.replaceChildren();
    if (this.sidebarItems instanceof Array) {
      this.sidebarItems.forEach((sidebarItem) =>
        this.createSidebarLi(sidebarItem)
      );
    }
    this.sortSidebar();
  }

  getSidebarItem(mName) {
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
    if (!sidebarItem.moduleName || sidebarItem.moduleName === "") {
      try {
        const regex = /HTML\/([\S%20]+).html/;
        const regexResult = sidebarItem.manualUrl.match(regex);
        if (!regexResult) return;

        const decodedName = decodeURIComponent(regexResult[1]);
        sidebarItem.moduleName = decodedName;
      } catch {
        new PopupGenerator(
          `Error processing the following URL: ${sidebarItem.manualUrl}`
        ).doPopup();
      }
    }

    const trimmedModName = sidebarItem.moduleName.trim();

    const existingSidebarItem = this.getSidebarItem(trimmedModName);
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
      new PopupGenerator(
        `${trimmedModName} already exists. Would you like to overwrite?`,
        [
          {
            type: "no-yes-btn-group",
          },
        ],
        () => {
          this.replaceSidebarItem(existingSidebarItem, sidebarItem);
          if (reRender) this.render();
        }
      ).doPopup();
    } else {
      this.sidebarItems.push(sidebarItem);
      this.localStorageAdd(sidebarItem);
      if (reRender) this.render();
      if (!hidePopup)
        new PopupGenerator(`${sidebarItem.moduleName} Added`).doPopup();
      return sidebarItem;
    }
  }

  handleReplaceSub(pubsubData) {
    this.replaceSidebarItem(
      this.getSidebarItemElement(pubsubData.old.moduleName),
      pubsubData.new
    );
  }

  replaceSidebarItem(oldSidebarItem, newSidebarItem) {
    this.removeSidebarItemElement(oldSidebarItem);
    this.addSidebarItem(newSidebarItem, true, true);
  }

  addSidebarItems(sidebarItemsList, disablePopup = false) {
    const skippedItems = [];
    const addedItems = [];
    sidebarItemsList.forEach((sidebarItem) => {
      const newSidebarItemFormatted = {
        moduleName: sidebarItem.moduleName,
        manualList: sidebarItem.manualList,
        manualUrl: sidebarItem.manualUrl,
      };
      const sidebarReturn = this.addSidebarItem(
        newSidebarItemFormatted,
        false,
        true,
        true
      );
      if (disablePopup) return;
      if (typeof sidebarReturn === "string") {
        skippedItems.push(sidebarReturn);
      } else if (sidebarReturn !== null) {
        addedItems.push(sidebarReturn.moduleName);
      } else {
        return;
      }
    });
    this.render();
    if (disablePopup) return;
    if (skippedItems.length > 50 || addedItems.length > 50) {
      new PopupGenerator(`Import complete`, [
        {
          type: "close-btn",
        },
      ]).doPopup();
    } else {
      new PopupGenerator(`Import complete`, [
        {
          type: "label",
          textContent: `Skipped: ${skippedItems.join(", ") || "None"}`,
          classList: "max-width-50",
        },
        {
          type: "label",
          textContent: ` `,
          classList: "max-width-50",
        },
        {
          type: "div",
          textContent: `Added: ${addedItems.join(", ") || "None"}`,
          classList: "max-width-50",
        },
        {
          type: "close-btn",
        },
      ]).doPopup();
    }
  }

  deleteModule(pubsubData) {
    const moduleToDelete = this.getSidebarItemElement(pubsubData.moduleName);
    this.removeSidebarItemElement(moduleToDelete);
  }

  removeAllSidebarItems() {
    localStorage.clear();
    this.syncLists();
    this.render();
  }

  removeSidebarItemElement(sidebarItem) {
    this.localStorageRemove(sidebarItem.innerText);
    sidebarItem.remove();
    this.syncLists();
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

  localStorageUpdate(moduleName, localStorageItem) {
    this.localStorageRemove(moduleName);
    this.localStorageAdd(localStorageItem);
  }

  localStorageRemove(moduleName) {
    localStorage.removeItem(moduleName);
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

  syncLists() {
    // Syncs the local storage list with the page list
    this.sidebarItems = [];
    this.importProjectsFromLocal();
  }

  createSidebarLi(sidebarItem) {
    const sidebarListElement = this.dom.sidebarListElement;
    const newSidebarListItem = document.createElement("li");
    newSidebarListItem.classList.add("sidebar-item");
    newSidebarListItem.addEventListener("click", () => {
      this.openNewModule(sidebarItem.moduleName, sidebarItem.manualUrl);
      this.dom.filter.focus();
      this.dom.filter.value = "";
      this.filterSidebar("");

      if (this.addOneMode) {
        this.toggleAddOneMode();
      }
    });
    newSidebarListItem.textContent = sidebarItem.moduleName;
    const newEditBtn = document.querySelector(".edit-svg").cloneNode(true);
    newEditBtn.classList.remove("hidden");
    newEditBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      // this.editModulePopup.generate(sidebarItem).doPopup();
      new PopupGenerator(
        `Set default manual for ${sidebarItem.moduleName}`,
        [
          {
            type: "btn-group",
            moduleName: sidebarItem.moduleName,
            btnTextList: sidebarItem.manualList,
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

    newSidebarListItem.append(newEditBtn);
    sidebarListElement.appendChild(newSidebarListItem);
  }
  setDefaultManual(modName, newDefaultManual) {
    const existingGroupItem = this.getSidebarItem(modName);
    existingGroupItem.manualUrl = newDefaultManual;
    this.localStorageUpdate(modName, {
      moduleName: modName,
      manualList: existingGroupItem.manualList,
      manualUrl: newDefaultManual,
    });
    this.syncLists();
    this.render();
  }

  configureStaticSidebarBtns() {
    const filter = this.dom.filter;
    const filterClear = this.dom.filterClear;
    const newRepoTabBtn = this.dom.newRepoTabBtn;
    const collapseSidebarBtn = this.dom.collapseSidebarBtn;
    const showSidebarBtn = this.dom.showSidebarBtn;
    const addOneBtn = this.dom.addOneBtn;
    const sidebarMenuSidebarBtn = this.dom.sidebarMenuSidebarBtn;
    const edgeworkBtn = this.dom.edgeworkBtn;
    filter.addEventListener("keydown", () => {
      this.filterSidebar(filter.value);
    });
    // Both keydown and up are used to handle multiple situations
    filter.addEventListener("keyup", () => {
      this.filterSidebar(filter.value);
    });
    filterClear.addEventListener("click", () => {
      filter.value = "";
      this.filterSidebar("");
    });
    collapseSidebarBtn.addEventListener("click", () => this.collapseToggle());
    showSidebarBtn.addEventListener("click", () => this.collapseToggle());
    addOneBtn.addEventListener("click", () => {
      this.toggleAddOneMode();
    });

    sidebarMenuSidebarBtn.addEventListener("click", () => {
      this.sidebarPopup.doPopup();
    });

    const newRepoTabPopup = new PopupGenerator(
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
    document.addEventListener("keydown", (event) => {
      if (event.altKey && event.key === "n") newRepoTabPopup.doPopup();
    });
    newRepoTabBtn.addEventListener("click", () => {
      newRepoTabPopup.doPopup();
    });
    edgeworkBtn.addEventListener("click", () => {
      this.edgeworkPopup.doPopup();
    });
  }

  collapseToggle() {
    const sidebar = this.dom.sidebar;
    const collapseSidebarBtn = this.dom.collapseSidebarBtn;
    const showSidebarBtn = this.dom.showSidebarBtn;
    const addOneBtn = this.dom.addOneBtn;
    sidebar.classList.toggle("hidden");
    collapseSidebarBtn.classList.toggle("hidden");
    showSidebarBtn.classList.toggle("hidden");
    addOneBtn.classList.toggle("hidden");
  }

  toggleAddOneMode() {
    this.addOneMode = !this.addOneMode;
    const filter = this.dom.filter;
    this.collapseToggle();
    filter.focus();
    filter.value = "";
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
    const sidebarListElement = this.dom.sidebarListElement;
    const sidebarList = Array.from(sidebarListElement.children);
    sidebarList.sort((a, b) => {
      a = a.textContent.toLowerCase();
      b = b.textContent.toLowerCase();
      if (a.includes("appendix") && b.includes("appendix")) {
        if (a.replace("appendix", "") < b.replace("appendix", "")) return -1;
        return 1;
      }
      if (a.includes("appendix")) return 1;
      if (b.includes("appendix")) return -1;
      if (a < b) return -1;
      return 1;
    });
    sidebarListElement.replaceChildren(...sidebarList);
  }

  filterSidebar(filterTerm) {
    const sidebarListElement = this.dom.sidebarListElement;
    const filterTermCleaned = filterTerm.toLowerCase().trim();
    const sidebarListChildren = Array.from(sidebarListElement.children);
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
