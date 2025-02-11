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
    new Module(" + New REPO Tab"),
    new Module(
        "Wires",
        "./module-images/WireComponent.svg",
        "https://ktane.timwi.de/HTML/Wires.html",
        false
    ),
    new Module(
        "The Button",
        "./module-images/ButtonComponent.svg",
        "https://ktane.timwi.de/HTML/The%20Button.html"
    ),
    new Module(
        "Keypad",
        "./module-images/KeypadComponent.svg",
        "https://ktane.timwi.de/HTML/Keypad.html"
    ),
    new Module(
        "Simon Says",
        "./module-images/SimonComponent.svg",
        "https://ktane.timwi.de/HTML/Simon%20Says.html"
    ),
    new Module(
        "Who's on First?",
        "./module-images/WhosOnFirstComponent.svg",
        "https://ktane.timwi.de/HTML/Who%27s%20on%20First.html"
    ),
    new Module(
        "Memory",
        "./module-images/MemoryComponent.svg",
        "https://ktane.timwi.de/HTML/Memory.html"
    ),
    new Module(
        "Morse Code",
        "./module-images/MorseCodeComponent.svg",
        "https://ktane.timwi.de/HTML/Morse%20Code.html"
    ),
    new Module(
        "Complicated Wires",
        "./module-images/VennWireComponent.svg",
        "https://ktane.timwi.de/HTML/Complicated%20Wires.html"
    ),
    new Module(
        "Wire Sequence",
        "./module-images/WireSequenceComponent.svg",
        "https://ktane.timwi.de/HTML/Wire%20Sequence.html"
    ),
    new Module(
        "Maze",
        "./module-images/MazeComponent.svg",
        "https://ktane.timwi.de/HTML/Maze.html"
    ),
    new Module(
        "Password",
        "./module-images/PasswordComponent.svg",
        "https://ktane.timwi.de/HTML/Password.html"
    ),
    new Module(
        "Knob",
        "./module-images/NeedyKnobComponent.svg",
        "https://ktane.timwi.de/HTML/Knob.html"
    ),
    new Module(
        "Appendix A (Indicators)",
        "./module-images/IndicatorWidget.svg",
        "https://ktane.timwi.de/HTML/Indicators.html",
        true
    ),
    new Module(
        "Appendix B (Batteries)",
        "./module-images/Battery-AA.svg",
        "https://ktane.timwi.de/HTML/Batteries.html",
        true
    ),
    new Module(
        "Appendix C (Ports)",
        "./module-images/RJ45.svg",
        "https://ktane.timwi.de/HTML/Ports.html",
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
