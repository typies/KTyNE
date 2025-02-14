class IframeManager {
    #idCounter = 0;
    constructor() {}

    domElements = {
        modulesDiv: document.querySelector(".modules"),
        pageIframe: document.createElement("iframe"),
        currentIframe: document.querySelector(".current-iframe"),
    };

    setIframeById(iframeId) {
        let nextIframe = this.getIframe(iframeId);
        if (nextIframe === this.domElements.currentIframe) {
            this.toggleHidden(nextIframe);
        } else {
            this.hideIframe(this.domElements.currentIframe);
            this.showIframe(nextIframe);
            this.domElements.currentIframe = nextIframe;
        }
    }

    createNewIframe(link) {
        if (this.domElements.currentIframe) {
            this.hideIframe(this.domElements.currentIframe);
        }

        let newIframe = document.createElement("iframe");
        newIframe.setAttribute("src", link);
        newIframe.setAttribute("data-iframe-index", this.#idCounter++);
        newIframe.classList.add("current-iframe");

        this.domElements.modulesDiv.appendChild(newIframe);
        this.domElements.currentIframe = newIframe;
    }

    removeIframe(iframeId) {
        this.getIframe(iframeId).remove();
    }

    getIframe(iframeId) {
        return this.domElements.modulesDiv.querySelector(
            `[data-iframe-index="${iframeId}"]`
        );
    }

    toggleHidden(iframe) {
        if (iframe.classList.contains("hidden-iframe")) {
            this.showIframe(iframe);
        } else {
            this.hideIframe(iframe);
        }
    }

    showIframe(iframe) {
        if (iframe.classList.contains("hidden-iframe")) {
            iframe.classList.remove("hidden-iframe");
            iframe.classList.add("current-iframe");
        }
    }

    hideIframe(iframe) {
        if (iframe.classList.contains("current-iframe")) {
            iframe.classList.remove("current-iframe");
            iframe.classList.add("hidden-iframe");
        }
    }

    hideIframeByIndex(iframeId) {
        let iframe = this.getIframe(iframeId);
        if (iframe.classList.contains("current-iframe")) {
            iframe.classList.remove("current-iframe");
            iframe.classList.add("hidden-iframe");
        }
    }
}

const pageIframeManager = new IframeManager();
export default pageIframeManager;
