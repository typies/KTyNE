import pageIframeManager from "./iframeManager.js";

class HeaderList {
    constructor() {}

    #idCounter = 0;

    domElements = {
        headerList: document.querySelector(".open-modules-list"),
        currentlyHighlightedHeaderItem: null,
    };

    addHeaderListItem(moduleName) {
        const newHeaderListItemId = this.#idCounter++;

        let newHeaderListItem = document.createElement("li");
        newHeaderListItem.classList.add("open-module-list-item", "clickable");
        newHeaderListItem.setAttribute("data-module-id", newHeaderListItemId);
        newHeaderListItem.textContent = moduleName;

        // Left click
        newHeaderListItem.addEventListener("click", (event) => {
            pageIframeManager.setIframeById(newHeaderListItemId);
            this.changeHighlightedHeaderItem(newHeaderListItemId);
        });
        // Middle Click (Separate 'auxclick' listener so full mouse press is used instead of only up or down)
        newHeaderListItem.addEventListener("auxclick", (event) => {
            if (event.button == 1) {
                this.closeHeaderListItem(newHeaderListItemId);
            }
        });
        // Right Click( Rename header items instead of opening context menu)
        newHeaderListItem.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            this.headerItemRename(newHeaderListItemId);
        });
        // Double click
        newHeaderListItem.addEventListener("dblclick", () =>
            this.headerItemRename(newHeaderListItemId)
        );

        this.domElements.headerList.appendChild(newHeaderListItem);
        this.changeHighlightedHeaderItem(newHeaderListItemId);
    }

    closeHeaderListItem(headerListItemId) {
        this.getHeaderListItem(headerListItemId).remove();
        pageIframeManager.removeIframeById(headerListItemId);
    }

    getHeaderListItem(headerListItemId) {
        return this.domElements.headerList.querySelector(
            `[data-module-id="${headerListItemId}"]`
        );
    }

    headerItemRename(headerListItemId) {
        const headerItem = this.getHeaderListItem(headerListItemId);
        const renameInput = prompt(`Renaming ${headerItem.textContent}`);
        if (renameInput) {
            headerItem.textContent = renameInput;
        }
    }

    changeHighlightedHeaderItem(headerListItemId) {
        const itemToHighlight = this.getHeaderListItem(headerListItemId);
        const itemHighlighted = this.domElements.currentlyHighlightedHeaderItem;
        if (itemHighlighted) {
            itemHighlighted.classList.remove("current-header-item");
        }

        if (itemToHighlight === itemHighlighted) {
            // Unselect, selected tab - No highlight
            this.domElements.currentlyHighlightedHeaderItem = null;
        } else {
            itemToHighlight.classList.add("current-header-item");
            this.domElements.currentlyHighlightedHeaderItem = itemToHighlight;
        }
    }
}

const pageHeaderList = new HeaderList([]);
export default pageHeaderList;
