import pageIframeManager from "./iframeManager.js";

class HeaderList {
    constructor() {}

    #idCounter = 0;

    domElements = {
        headerList: document.querySelector(".open-modules-list"),
        currentlyHighlightedHeaderItem: null,
    };

    addHeaderListItem(moduleName) {
        const newModuleId = this.#idCounter++;

        let newHeaderListItem = document.createElement("li");
        newHeaderListItem.classList.add("open-module-list-item", "clickable");
        newHeaderListItem.setAttribute("data-module-id", newModuleId);
        newHeaderListItem.textContent = moduleName;

        // Left click
        newHeaderListItem.addEventListener("click", (event) => {
            pageIframeManager.setIframeById(newModuleId);
            this.changeHighlightedHeaderItem(newModuleId);
        });
        // Middle Click (Separate 'auxclick' listener so full mouse press is used instead of only up or down)
        newHeaderListItem.addEventListener("auxclick", (event) => {
            if (event.button == 1) {
                this.closeModule(newModuleId);
            }
        });
        // Right Click( Rename header items instead of opening context menu)
        newHeaderListItem.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            this.headerItemRename(newModuleId);
        });
        // Double click
        newHeaderListItem.addEventListener("dblclick", () =>
            this.headerItemRename(newModuleId)
        );

        this.domElements.headerList.appendChild(newHeaderListItem);
        this.changeHighlightedHeaderItem(newModuleId);
    }

    closeModule(moduleId) {
        this.getHeaderListItem(moduleId).remove();
        pageIframeManager.removeIframe(moduleId);
    }

    getHeaderListItem(moduleId) {
        return this.domElements.headerList.querySelector(
            `[data-module-id="${moduleId}"]`
        );
    }

    headerItemRename(moduleId) {
        const headerItem = this.getHeaderListItem(moduleId);
        const renameInput = prompt(`Renaming ${headerItem.textContent}`);
        if (renameInput) {
            headerItem.textContent = renameInput;
        }
    }

    changeHighlightedHeaderItem(moduleId) {
        const itemToHighlight = this.getHeaderListItem(moduleId);
        const itemHighlighted = this.domElements.currentlyHighlightedHeaderItem;
        if (itemHighlighted) {
            itemHighlighted.classList.remove("current-header-item");
        }

        if (itemToHighlight === itemHighlighted) {
            // Unselect, selected tab - No time highlighted
            this.domElements.currentlyHighlightedHeaderItem = null;
        } else {
            itemToHighlight.classList.add("current-header-item");
            this.domElements.currentlyHighlightedHeaderItem = itemToHighlight;
        }
    }

    removeHighlight(moduleId) {
        this.getHeaderListItem(moduleId).classList.remove(
            "current-header-item"
        );
    }

    addHighlight(moduleId) {
        this.getHeaderListItem(moduleId).classList.add("current-header-item");
    }
}

const pageHeaderList = new HeaderList([]);
export default pageHeaderList;
