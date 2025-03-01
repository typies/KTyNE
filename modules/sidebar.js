import pageHeaderList from "./headerList.js";
import pageIframeManager from "./iframeManager.js";

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

  render() {
    if (this.sidebarItems instanceof Array) {
      this.sidebarItems.forEach((sidebarItem) =>
        this.createSidebarLi(sidebarItem)
      );
    }
  }

  init() {
    this.render();
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
    newSidebarListItem.classList.add("module-list-item", "sidebar-item");

    newSidebarListItem.textContent = sidebarItem.moduleName;
    this.domElements.sidebarListElement.appendChild(newSidebarListItem);
    newSidebarListItem.addEventListener("click", async () => {
      pageIframeManager.createNewIframe(sidebarItem.manualUrl);
      if (sidebarItem.moduleName === "+ New REPO Tab") {
        const newTabName = prompt("New Tab Name");
        if (!newTabName) return;
        navigator.clipboard.writeText(newTabName);
        pageHeaderList.addHeaderListItem(newTabName);
      } else {
        pageHeaderList.addHeaderListItem(sidebarItem.moduleName);
      }
    });
  }
}

export default new Sidebar();
