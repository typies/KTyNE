import mainPubSub from "./PubSub.js";
import sharedIdCounter from "./sharedIdCounter.js";

class IframeManager {
  constructor() {
    mainPubSub.subscribe("addIframe", this.createNewIframe.bind(this));
    mainPubSub.subscribe("removeIframe", this.removeIframeById.bind(this));
    mainPubSub.subscribe("tabChange", this.setIframeById.bind(this));
    this.splitEnabled = false;
    this.configureStaticButtons();
    return this;
  }

  dom = {
    manualsDiv: document.querySelector(".manuals"),
    pageIframe: document.createElement("iframe"),
    splitBtn: document.querySelector(".split-button"),
  };

  configureStaticButtons() {
    const splitBtn = this.dom.splitBtn;
    splitBtn.addEventListener("click", () => {
      this.toggleSplitFrame();
      splitBtn.classList.toggle("selected");
    });
  }

  setIframeById(pubsubData) {
    const iframeClicked = this.getIframeById(pubsubData.iframeId);
    if (iframeClicked === this.currentIframe) {
      this.setCurrentIframe(null);
    } else if (iframeClicked === this.alternateIframe) {
      this.setAlternateIframe(null);
    } else {
      this.changeIframe(pubsubData.iframeId);
    }
  }

  changeIframe(iframeId) {
    if (!this.alternateIframe && this.splitEnabled) {
      this.setAlternateIframe(this.getIframeById(iframeId));
      return;
    }
    this.setCurrentIframe(this.getIframeById(iframeId));
  }

  createNewIframe(pubsubData) {
    const manualsDiv = this.dom.manualsDiv;
    const newIframeId = sharedIdCounter.getId();
    let newIframe = document.createElement("iframe");
    newIframe.setAttribute("src", pubsubData.manualUrl);
    newIframe.setAttribute("data-iframe-id", newIframeId);
    newIframe.classList.add("hidden-iframe");

    manualsDiv.appendChild(newIframe);
  }

  removeIframeById(pubsubData) {
    const toRemove = this.getIframeById(pubsubData.iframeId);
    if (toRemove === this.currentIframe) this.setCurrentIframe(null);
    if (toRemove === this.alternateIframe) this.setAlternateIframe(null);

    toRemove.remove();
  }

  setCurrentIframe(iframe) {
    if (this.currentIframe) {
      mainPubSub.publish("removeHeaderItemClass", {
        headerListItemId: this.getIdByIframe(this.currentIframe),
        headerClass: "current-header-item",
      });
      this.currentIframe.classList.remove("current-iframe");
      this.currentIframe.classList.add("hidden-iframe");
    }
    this.currentIframe = iframe;
    if (iframe) {
      mainPubSub.publish("addHeaderItemClass", {
        headerListItemId: this.getIdByIframe(iframe),
        headerClass: "current-header-item",
      });
      iframe.classList.remove("hidden-iframe");
      iframe.classList.remove("alternate-iframe");
      iframe.classList.add("current-iframe");
    }
  }
  setAlternateIframe(iframe) {
    if (this.alternateIframe) {
      mainPubSub.publish("removeHeaderItemClass", {
        headerListItemId: this.getIdByIframe(this.alternateIframe),
        headerClass: "alternate-header-item",
      });
      this.alternateIframe.classList.remove("alternate-iframe");
      this.alternateIframe.classList.add("hidden-iframe");
    }
    this.alternateIframe = iframe;
    if (iframe) {
      mainPubSub.publish("addHeaderItemClass", {
        headerListItemId: this.getIdByIframe(iframe),
        headerClass: "alternate-header-item",
      });
      iframe.classList.remove("hidden-iframe");
      iframe.classList.remove("current-iframe");
      iframe.classList.add("alternate-iframe");
    }
  }

  getIframeById(iframeId) {
    const manualsDiv = this.dom.manualsDiv;
    return manualsDiv.querySelector(`[data-iframe-id="${iframeId}"]`);
  }

  getIdByIframe(iframe) {
    return iframe.getAttribute("data-iframe-id");
  }

  toggleSplitFrame() {
    this.splitEnabled = !this.splitEnabled;
    this.dom.manualsDiv.classList.toggle("split");
    if (!this.alternateIframe) return;
    if (this.splitEnabled) {
      this.alternateIframe.classList.remove("hidden-iframe");
      mainPubSub.publish("addHeaderItemClass", {
        headerListItemId: this.getIdByIframe(this.alternateIframe),
        headerClass: "alternate-header-item",
      });
    } else {
      this.alternateIframe.classList.add("hidden-iframe");
      mainPubSub.publish("removeHeaderItemClass", {
        headerListItemId: this.getIdByIframe(this.alternateIframe),
        headerClass: "alternate-header-item",
      });
    }
  }
}

export default IframeManager;
