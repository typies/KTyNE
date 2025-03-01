import pageHeaderList from "./headerList.js";
import pageIframeManager from "./iframeManager.js";
const KTANE_TIMWI_URL = "https://ktane.timwi.de/";

class Sidebar {
  constructor(itemList = []) {
    if (!itemList) {
      this.sidebarItems = [];
    }
    this.sidebarItems = itemList;
    this.init();
  }

  domElements = {
    sidebarListElement: document.querySelector(".sidebar .module-list"),
  };

  init() {
    this.render();
    this.configureSidebarBtns();
  }

  render() {
    this.domElements.sidebarListElement.replaceChildren();
    if (this.sidebarItems instanceof Array) {
      this.sidebarItems.forEach((sidebarItem) =>
        this.createSidebarLi(sidebarItem)
      );
    }
    this.sortSidebar();
  }

  addSidebarItem(sidebarItem) {
    this.sidebarItems.push(sidebarItem);
    this.render();
  }

  addSidebarItems(sidebarItems) {
    sidebarItems.forEach((sidebarItem) => {
      this.sidebarItems.push(sidebarItem);
    });
    this.render();
  }

  createSidebarLi(sidebarItem) {
    let newSidebarListItem = document.createElement("li");
    newSidebarListItem.classList.add("sidebar-item");

    newSidebarListItem.textContent = sidebarItem.moduleName;
    this.domElements.sidebarListElement.appendChild(newSidebarListItem);
    newSidebarListItem.addEventListener("click", () => {
      pageHeaderList.addHeaderListItem(sidebarItem.moduleName);
      pageIframeManager.createNewIframe(sidebarItem.manualUrl);
    });
  }

  configureSidebarBtns() {
    const filter = document.querySelector("#filter");
    const filterClear = document.querySelector("button.clear-filter");
    const newRepoTabBtn = document.querySelector("#new-repo-tab-btn");
    filter.addEventListener("keyup", () => {
      this.filterSidebar(filter.value);
    });
    filterClear.addEventListener("click", () => {
      filter.value = "";
      this.filterSidebar("");
    });
    newRepoTabBtn.addEventListener("click", () => {
      const newTabName = prompt("New Tab Name");
      if (!newTabName || newTabName === "") return;
      navigator.clipboard.writeText(newTabName);
      pageHeaderList.addHeaderListItem(newTabName);
      pageIframeManager.createNewIframe(KTANE_TIMWI_URL);
    });
  }

  sortSidebar() {
    const sidebarList = Array.from(
      this.domElements.sidebarListElement.children
    );
    sidebarList.sort((a, b) => {
      if (a.textContent.toLowerCase().includes("appendix")) return 1;
      if (a.textContent.toLowerCase() < b.textContent.toLowerCase()) return -1;
      return 1;
    });
    this.domElements.sidebarListElement.replaceChildren(...sidebarList);
  }

  filterSidebar(filterTerm) {
    const filterTermCleaned = filterTerm.toLowerCase().trim();
    if (filterTermCleaned === "") {
      this.render();
      return;
    }
    const sidebarList = Array.from(
      this.domElements.sidebarListElement.children
    );

    sidebarList.forEach((ele) => {
      if (ele.textContent.toLowerCase().includes(filterTermCleaned)) {
        ele.classList.remove("hidden");
      } else {
        ele.classList.add("hidden");
      }
    });
  }
}

export default new Sidebar();
