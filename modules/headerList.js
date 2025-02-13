import pageIframeManager from "./iframeManager.js";

class HeaderList {
    #idCounter = 0;
    #currentHighlight = 0;
    constructor(openModules) {
        if (!this.openModules) {
            this.openModules = [];
        }
        this.openModules = openModules;
    }

    domElements = {
        headerList: document.querySelector(".open-modules-list"),
    };

    addHeaderListItem(module) {
        this.openModules.push(module);
        let newHeaderListItem = document.createElement("li");
        newHeaderListItem.classList.add("open-module-list-item");
        newHeaderListItem.setAttribute("data-module-index", this.#idCounter++);

        let headerListText = document.createElement("div");
        headerListText.classList.add("header-list-item");
        headerListText.textContent = module.moduleName;

        let moduleIndex = newHeaderListItem.getAttribute("data-module-index");
        newHeaderListItem.addEventListener("mousedown", (event) => {
            switch (event.button) {
                case 0:
                    pageIframeManager.changeIFrame(moduleIndex);
                    this.highlightHeaderItem(moduleIndex);
                    break;
                case 1:
                    // Middle mouse click close
                    this.openModules.splice(
                        this.openModules.indexOf(module),
                        1
                    );
                    newHeaderListItem.remove();
                    pageIframeManager.removeIframe(moduleIndex);
                    break;
                case 2:
                    this.headerItemRename(newHeaderListItem);
            }
        });
        newHeaderListItem.addEventListener("dblclick", this.headerItemRename);
        newHeaderListItem.appendChild(headerListText);
        this.domElements.headerList.appendChild(newHeaderListItem);
        this.highlightHeaderItem(moduleIndex);
    }

    headerItemRename(newHeaderListItem) {
        newHeaderListItem =
            newHeaderListItem instanceof MouseEvent ? this : newHeaderListItem;
        const text = newHeaderListItem.querySelector(".header-list-item");
        const renameInput = prompt(`Renaming ${text.textContent}`);
        if (renameInput) {
            text.textContent = renameInput;
        }
    }

    highlightHeaderItem(index) {
        this.domElements.headerList
            .querySelector(`[data-module-index="${this.#currentHighlight}"]`)
            .classList.remove("current-header-item");
        this.#currentHighlight = index;
        this.domElements.headerList
            .querySelector(`[data-module-index="${index}"]`)
            .classList.add("current-header-item");
    }

    removeHighlightHeaderItem(index) {}

    render() {
        this.domElements.headerList.textContent = "";
        this.openModules.forEach((module) => {
            addHeaderListItem(module);
        });
    }
}

const pageHeaderList = new HeaderList([]);
export default pageHeaderList;
