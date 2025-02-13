class IframeManager {
    #idCounter = 0;
    constructor() {}

    domElements = {
        pageIframe: document.createElement("iframe"),
        modulesFrame: document.querySelector(".modules"),
        currentIFrame: document.querySelector(".current-iframe"),
    };

    changeIFrame(moduleIndex) {
        this.toggleIFrame(this.domElements.currentIFrame);

        let nextIFrame = document.querySelector(
            `[data-iframe-index="${moduleIndex}"]`
        );

        if (this.domElements.currentIFrame != nextIFrame) {
            // If user clicks the same tab they're on they will just minimize the tab
            this.domElements.currentIFrame = nextIFrame;
            this.toggleIFrame(nextIFrame);
        }
    }

    openNewIframe(link) {
        if (this.domElements.currentIFrame) {
            this.toggleIFrame(this.domElements.currentIFrame);
        }

        let newIFrame = document.createElement("iframe");
        newIFrame.setAttribute("src", link);
        newIFrame.setAttribute("data-iframe-index", this.#idCounter++);
        newIFrame.classList.add("current-iframe");

        this.domElements.modulesFrame.appendChild(newIFrame);
        this.domElements.currentIFrame = newIFrame;
    }

    removeIframe(moduleIndex) {
        document.querySelector(`[data-iframe-index="${moduleIndex}"]`).remove();
    }

    toggleIFrame(iframe) {
        if (iframe.classList.contains("current-iframe")) {
            iframe.classList.remove("current-iframe");
            iframe.classList.add("hidden-iframe");
        } else if (iframe.classList.contains("hidden-iframe")) {
            iframe.classList.remove("hidden-iframe");
            iframe.classList.add("current-iframe");
        }
    }
}

const pageIframeManager = new IframeManager();
export default pageIframeManager;
