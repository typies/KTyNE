import pageHeaderList from "./headerList.js";
import pageIframeManager from "./iframeManager.js";

class Sidebar {
    constructor(itemList) {
        if (!itemList) {
            this.sidebarItems = [];
        }
        this.sidebarItems = itemList;
        this.init();
    }

    domElements = {
        moduleListElement: document.querySelector(".sidebar .module-list"),
    };

    render() {
        if (this.sidebarItems instanceof Array) {
            this.sidebarItems.forEach((module) => this.createSidebarLi(module));
        }
    }

    init() {
        this.render();
    }

    addSidebarItem(module) {
        this.sidebarItems.push(module);
        this.render();
    }

    addSidebarItems(modules) {
        modules.forEach((module) => {
            this.sidebarItems.push(module);
        });
        this.render();
    }

    createSidebarLi(module) {
        let newModuleListItem = document.createElement("li");
        newModuleListItem.classList.add(
            "module-list-item",
            "sidebar-item",
            "clickable"
        );

        newModuleListItem.textContent = module.moduleName;
        this.domElements.moduleListElement.appendChild(newModuleListItem);
        newModuleListItem.addEventListener("click", () => {
            pageHeaderList.addHeaderListItem(module.moduleName);
            pageIframeManager.createNewIframe(module.manualUrl);
        });
    }
}

export default new Sidebar([]);
