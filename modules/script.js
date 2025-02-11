const KTANE_TIMWI_URL = "https://ktane.timwi.de/";
const VANILLA_MAN_URL = "https://bombmanual.com/web/index.html";
const DEFAULT_MOD_IMG = "./KeepTalkingIcon_Transparent95x95-1.png";

function Module(
    moduleName,
    imageUrl = DEFAULT_MOD_IMG,
    manualUrl = KTANE_TIMWI_URL,
    appendix = false
) {
    this.moduleName = moduleName;
    this.imageUrl = imageUrl;
    this.manualUrl = manualUrl;
    this.appendix = appendix;
}

let moduleList = [
    new Module(" - New REPO Tab"),
    new Module(
        "Wires",
        "./module-images/WireComponent.svg",
        "https://bombmanual.com/web/index.html#Wires",
        false
    ),
    new Module(
        "The Button",
        "./module-images/ButtonComponent.svg",
        "https://bombmanual.com/web/index.html#TheButton"
    ),
    new Module(
        "Keypad",
        "./module-images/KeypadComponent.svg",
        "https://bombmanual.com/web/index.html#Keypads"
    ),
    new Module(
        "Simon Says",
        "./module-images/SimonComponent.svg",
        "https://bombmanual.com/web/index.html#SimonSays"
    ),
    new Module(
        "Who's on First?",
        "./module-images/WhosOnFirstComponent.svg",
        "https://bombmanual.com/web/index.html#WhosOnFirst"
    ),
    new Module(
        "Memory",
        "./module-images/MemoryComponent.svg",
        "https://bombmanual.com/web/index.html#Memory"
    ),
    new Module(
        "Morse Code",
        "./module-images/MorseCodeComponent.svg",
        "https://bombmanual.com/web/index.html#MorseCode"
    ),
    new Module(
        "Complicated Wires",
        "./module-images/VennWireComponent.svg",
        "https://bombmanual.com/web/index.html#ComplicatedWires"
    ),
    new Module(
        "Wire Sequence",
        "./module-images/WireSequenceComponent.svg",
        "https://bombmanual.com/web/index.html#WireSequences"
    ),
    new Module(
        "Maze",
        "./module-images/MazeComponent.svg",
        "https://bombmanual.com/web/index.html#Mazes"
    ),
    new Module(
        "Password",
        "./module-images/PasswordComponent.svg",
        "https://bombmanual.com/web/index.html#Passwords"
    ),
    new Module(
        "Knob",
        "./module-images/NeedyKnobComponent.svg",
        "https://bombmanual.com/web/index.html#Knobs"
    ),
    new Module(
        "Appendix A (Indicators)",
        "./module-images/IndicatorWidget.svg",
        "https://bombmanual.com/web/index.html#AppendixA",
        true
    ),
    new Module(
        "Appendix B (Batteries)",
        "./module-images/Battery-AA.svg",
        "https://bombmanual.com/web/index.html#AppendixB",
        true
    ),
    new Module(
        "Appendix C (Ports)",
        "./module-images/RJ45.svg",
        "https://bombmanual.com/web/index.html#AppendixC",
        true
    ),
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
            openNewModule(module);
            openNewIFrame(module.manualUrl);
            moduleCounter++;
        });
    });
}

let moduleCounter = 0;

function openNewModule(module) {
    let headerList = document.querySelector(".open-modules-list");
    let newHeaderListItem = document.createElement("li");
    newHeaderListItem.classList.add("open-module-list-item");
    newHeaderListItem.setAttribute("data-module-index", moduleCounter);

    let newListItemImg = document.createElement("img");
    newListItemImg.setAttribute("src", module.imageUrl);
    newListItemImg.style.height = "50px";

    let headerListText = document.createElement("div");
    headerListText.classList.add("header-list-item");
    headerListText.textContent = module.moduleName;

    let moduleIndex = newHeaderListItem.getAttribute("data-module-index");
    newHeaderListItem.addEventListener("mousedown", (event) => {
        switch (event.button) {
            case 0:
                changeIFrame(moduleIndex);
                break;
            case 1:
                // Middle mouse click close
                closeTab(moduleIndex);
                break;
        }
    });

    newHeaderListItem.appendChild(newListItemImg);
    newHeaderListItem.appendChild(headerListText);
    headerList.appendChild(newHeaderListItem);
}

function closeTab(moduleIndex) {
    document.querySelector(`[data-iframe-index="${moduleIndex}"]`).remove();
    document.querySelector(`[data-module-index="${moduleIndex}"]`).remove();
}

function changeIFrame(moduleIndex) {
    let currentIFrame = document.querySelector(".current-iframe");
    if (currentIFrame != null) {
        toggleIFrame(currentIFrame);
    }

    let nextIFrame = document.querySelector(
        `[data-iframe-index="${moduleIndex}"]`
    );
    toggleIFrame(nextIFrame);
}

function toggleIFrame(iframe) {
    if (iframe.classList.contains("current-iframe")) {
        iframe.classList.remove("current-iframe");
        iframe.classList.add("hidden-iframe");
    } else if (iframe.classList.contains("hidden-iframe")) {
        iframe.classList.remove("hidden-iframe");
        iframe.classList.add("current-iframe");
    }
}

function openNewIFrame(url) {
    let currentIFrame = document.querySelector(".current-iframe");
    if (currentIFrame != null) toggleIFrame(currentIFrame);

    let newIFrame = document.createElement("iframe");
    newIFrame.setAttribute("src", url);
    newIFrame.setAttribute("data-iframe-index", moduleCounter);
    newIFrame.classList.add("current-iframe");
    let modulesFrame = document.querySelector(".modules");
    modulesFrame.appendChild(newIFrame);
}

populateSidebarModuleList(moduleList);

// Make gap above appendix items for module list (Can't be done with CSS easily)
let firstAppendix = document.querySelector(".appendix");
if (firstAppendix != null) firstAppendix.classList.add("first-appendix");
