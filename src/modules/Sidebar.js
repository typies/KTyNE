import {
  AddModulePopup,
  EditModulePopup,
  ExportModulesPopup,
  ImportModulesPopup,
  SidebarPopup,
  ImportDefaultListPopup,
} from "./popup.js";
import PopupGenerator from "./PopupGenerator.js";
import mainPubSub from "./PubSub.js";
import sharedIdCounter from "./sharedIdCounter.js";
import defaultModules from "../defaultModLists/vanillaModules.json";
const KTANE_TIMWI_URL = "https://ktane.timwi.de/";

class Sidebar {
  constructor(itemList = []) {
    this.sidebarItems = itemList;
    mainPubSub.subscribe("addNewModule", this.addSidebarItem.bind(this));
    mainPubSub.subscribe("addNewModules", this.addSidebarItems.bind(this));
    mainPubSub.subscribe("deleteModule", this.deleteModule.bind(this));
    mainPubSub.subscribe("replaceModule", this.handleReplaceSub.bind(this));
    mainPubSub.subscribe("toggleEditMode", this.toggleEditMode.bind(this));

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

    const defaultModuleObjs = [
      { name: "Vanilla Module", fileContents: defaultModules },
    ];

    this.importDefaultListPopup = new ImportDefaultListPopup(defaultModuleObjs);
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
  };

  init() {
    this.importProjectsFromLocal();
    if (this.sidebarItems.length === 0) {
      this.importDefaultListPopup.doPopup(true);
    }
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
    const sidebarItems = Array.from(
      this.dom.sidebarListElement.children
    );
    const matchingItem = sidebarItems.find(
      (child) => child.textContent.toLowerCase() === mName.toLowerCase()
    );
    return matchingItem;
  }

  addSidebarItem(sidebarItem, reRender = true, skipDuplicates = false) {
    if (!sidebarItem.moduleName || sidebarItem.moduleName === "") {
      try {
        const regex = /HTML\/([\w%20]+).html/;
        const regexResult = sidebarItem.manualUrl.match(regex);
        if (!regexResult) return;

        const regexName = regexResult[1].split("%20").join(" ");
        sidebarItem.moduleName = regexName;
      } catch {
        new PopupGenerator(
          `Error processing the following URL: ${sidebarItem.manualUrl}`
        ).doPopup();
      }
    }

    const trimmedModName = sidebarItem.moduleName.trim();

    const existingSidebarItem = this.getSidebarItem(trimmedModName);
    if (existingSidebarItem) {
      if (skipDuplicates) {
        return "skipped";
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

  addSidebarItems(sidebarItemsList) {
    const skippedItems = [];
    const addedItems = [];
    sidebarItemsList.forEach((sidebarItem) => {
      const newSidebarItemFormatted = {
        moduleName: sidebarItem.name,
        manualUrl: sidebarItem.url,
      };
      const skipped = this.addSidebarItem(newSidebarItemFormatted, false, true);
      if (skipped === "skipped") {
        skippedItems.push(sidebarItem.name);
      } else {
        addedItems.push(sidebarItem.name);
      }
    });
    this.render();
    if (skippedItems.length > 0) {
      if (skippedItems.length === sidebarItemsList.length) {
        new PopupGenerator("All of those modules are already known.", [
          {
            type: "close-btn",
          },
        ]).doPopup();
      } else if (
        skippedItems.length <
        sidebarItemsList.length - skippedItems.length
      ) {
        new PopupGenerator(
          `The following items were duplicates and were skipped`,
          [
            {
              type: "label",
              textContent: `${addedItems.join(", ")}`,
            },
            {
              type: "close-btn",
            },
          ]
        ).doPopup();
      } else {
        new PopupGenerator(
          `Those were mostly duplicates, But the following were added:`,
          [
            {
              type: "label",
              textContent: `${addedItems.join(", ")}`,
            },
            {
              type: "close-btn",
            },
          ]
        ).doPopup();
      }
    } else {
      new PopupGenerator(
        `The following mods were added:`,
        [
          {
            type: "div",
            textContent: `${addedItems.join(", ")}`,
            classList: "max-width-50",
          },
          {
            type: "close-btn",
          },
        ],
        null
      ).doPopup();
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
    this.localStorageRemove(sidebarItem.textContent);
    sidebarItem.remove();
    this.syncLists();
  }

  localStorageAdd(module) {
    localStorage.setItem(module.moduleName, module.manualUrl);
  }

  localStorageRemove(moduleName) {
    localStorage.removeItem(moduleName);
  }

  importProjectsFromLocal() {
    for (let i = 0; i < window.localStorage.length; i++) {
      const moduleName = window.localStorage.key(i);
      const manualUrl = window.localStorage.getItem(moduleName);
      this.sidebarItems.push({ moduleName, manualUrl });
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
    if (this.editMode) {
      // Used to maintain orange color when filter is cleared
      newSidebarListItem.classList.toggle("orange");
    }
    newSidebarListItem.addEventListener("click", () => {
      if (this.editMode) {
        this.editModulePopup.generate(sidebarItem).doPopup();
      } else {
        this.openNewModule(sidebarItem.moduleName, sidebarItem.manualUrl);
      }

      if (this.addOneMode) {
        this.toggleAddOneMode();
      }
    });
    newSidebarListItem.textContent = sidebarItem.moduleName;
    sidebarListElement.appendChild(newSidebarListItem);
  }

  configureStaticSidebarBtns() {
    const filter = this.dom.filter;
    const filterClear = this.dom.filterClear;
    const newRepoTabBtn = this.dom.newRepoTabBtn;
    const collapseSidebarBtn = this.dom.collapseSidebarBtn;
    const showSidebarBtn = this.dom.showSidebarBtn;
    const addOneBtn = this.dom.addOneBtn;
    const sidebarMenuSidebarBtn = this.dom.sidebarMenuSidebarBtn;
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
          yes: "Open",
        },
      ],
      (form) => {
        const formData = new FormData(form);
        const newTabName = formData.get("new-tab-input");
        if (!newTabName || newTabName === "") return;
        navigator.clipboard.writeText(newTabName);
        this.openNewModule(newTabName, KTANE_TIMWI_URL);
      }
    );
    newRepoTabBtn.addEventListener("click", () => {
      newRepoTabPopup.doPopup();
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
    const title = this.dom.moduleListTitle;
    const collapseSidebarBtn = this.dom.collapseSidebarBtn;
    collapseSidebarBtn.classList.toggle("hidden");
    this.collapseToggle();
    filter.focus();
    if (this.addOneMode) {
      title.textContent = "Add One Mode";
    } else {
      title.textContent = "Modules";
    }
  }

  toggleEditMode() {
    const title = this.dom.moduleListTitle;
    const addNewRepoTabBtn = this.dom.newRepoTabBtn;
    const moduleList = document.querySelectorAll(".sidebar-item");
    this.editMode = !this.editMode;
    moduleList.forEach((item) => {
      item.classList.toggle("orange");
    });
    if (this.editMode) {
      title.textContent = "Click Module To Edit";
    } else {
      title.textContent = "Modules";
    }
    addNewRepoTabBtn.classList.toggle("hidden");
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
      if (ele.textContent.toLowerCase().includes(filterTermCleaned)) {
        ele.classList.remove("hidden");
      } else {
        ele.classList.add("hidden");
      }
    });
  }
}

export default Sidebar;
