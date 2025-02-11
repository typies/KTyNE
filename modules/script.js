const KTANE_TIMWI_URL = "https://ktane.timwi.de/";
const VANILLA_MAN_URL = "https://bombmanual.com/web/index.html";

function Module(
    moduleName,
    imageUrl,
    appendix = false,
    manualUrl = KTANE_TIMWI_URL
) {
    this.moduleName = moduleName;
    this.imageUrl = imageUrl;
    this.manualUrl = manualUrl;
    this.appendix = appendix;
}

let moduleList = [
    new Module(" - New REPO Tab", "./KeepTalkingIcon_Transparent95x95-1.png"),
    new Module("Wires", "./module-images/WireComponent.svg"),
    new Module("The Button", "./module-images/ButtonComponent.svg"),
    new Module("Keypad", "./module-images/KeypadComponent.svg"),
    new Module("Simon Says", "./module-images/SimonComponent.svg"),
    new Module("Who's on First?", "./module-images/WhosOnFirstComponent.svg"),
    new Module("Memory", "./module-images/MemoryComponent.svg"),
    new Module("Morse Code", "./module-images/MorseCodeComponent.svg"),
    new Module("Complicated Wires", "./module-images/VennWireComponent.svg"),
    new Module("Wire Sequence", "./module-images/WireSequenceComponent.svg"),
    new Module("Maze", "./module-images/MazeComponent.svg"),
    new Module("Password", "./module-images/PasswordComponent.svg"),
    new Module("The Knob", "./module-images/NeedyKnobComponent.svg"),
    new Module(
        "Appendix A (Indicators)",
        "./module-images/IndicatorWidget.svg",
        true
    ),
    new Module(
        "Appendix B (Batteries)",
        "./module-images/Battery-AA.svg",
        true
    ),
    new Module("Appendix C (Ports)", "./module-images/RJ45.svg", true),
];

moduleList.sort((a, b) => {
    if (a.moduleName < b.moduleName && a.appendix === false) {
        return -1;
    }
    return 1;
});

function populateSidebarModuleList(moduleList) {
    let moduleListElement = document.querySelector(".sidebar .module-list");
    moduleList.forEach((module) => {
        let newModuleListItem = document.createElement("div");
        newModuleListItem.classList.add("module-list-item");
        newModuleListItem.classList.add("sidebar-item");
        if (module.appendix) newModuleListItem.classList.add("appendix");

        newModuleListItem.textContent = module.moduleName;
        moduleListElement.appendChild(newModuleListItem);
        newModuleListItem.addEventListener("click", () => {
            changeIframe(module.manualUrl);
            openNewModule(module);
        });
    });
}

function openNewModule(module) {
    let headerList = document.querySelector(".open-modules-list");
    let newHeaderListItem = document.createElement("li");
    newHeaderListItem.classList.add("open-module-list-item");

    let newListItemImg = document.createElement("img");
    newListItemImg.setAttribute("src", module.imageUrl);
    newListItemImg.style.width = "50px";

    let headerListText = document.createElement("div");
    headerListText.classList.add("header-list-item");
    headerListText.textContent = module.moduleName;

    newHeaderListItem.addEventListener("click", () => {
        changeIframe(module.manualUrl);
    });

    newHeaderListItem.appendChild(newListItemImg);
    newHeaderListItem.appendChild(headerListText);
    headerList.appendChild(newHeaderListItem);
}

function changeIframe(url) {
    let iFrame = document.querySelector(".main-iframe");
    iFrame.setAttribute("src", url);
}

populateSidebarModuleList(moduleList);

// Make gap above appendix items for module list (Can't be done with CSS easily)
let firstAppendix = document.querySelector(".appendix");
if (firstAppendix != null) firstAppendix.classList.add("first-appendix");
