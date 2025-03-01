const KTANE_TIMWI_URL = "https://ktane.timwi.de/";

import pageSidebar from "./sidebar.js";
import popup from "./popup.js";

class Module {
  constructor(moduleName, manualUrl = KTANE_TIMWI_URL) {
    this.moduleName = moduleName;
    this.manualUrl = manualUrl;
  }
}

let defaultModuleList = [
  new Module("+ New REPO Tab"),
  new Module("Wires", "https://ktane.timwi.de/HTML/Wires.html"),
  new Module("The Button", "https://ktane.timwi.de/HTML/The%20Button.html"),
  new Module("Keypad", "https://ktane.timwi.de/HTML/Keypad.html"),
  new Module("Simon Says", "https://ktane.timwi.de/HTML/Simon%20Says.html"),
  new Module(
    "Who's on First?",
    "https://ktane.timwi.de/HTML/Who%27s%20on%20First.html"
  ),
  new Module("Memory", "https://ktane.timwi.de/HTML/Memory.html"),
  new Module("Morse Code", "https://ktane.timwi.de/HTML/Morse%20Code.html"),
  new Module(
    "Complicated Wires",
    "https://ktane.timwi.de/HTML/Complicated%20Wires.html"
  ),
  new Module(
    "Wire Sequence",
    "./module-images/WireSequenceComponent.svg",
    "https://ktane.timwi.de/HTML/Wire%20Sequence.html"
  ),
  new Module("Maze", "https://ktane.timwi.de/HTML/Maze.html"),
  new Module("Password", "https://ktane.timwi.de/HTML/Password.html"),
  new Module("Knob", "https://ktane.timwi.de/HTML/Knob.html"),
  new Module(
    "Appendix A (Indicators)",
    "https://ktane.timwi.de/HTML/Indicators.html"
  ),
  new Module(
    "Appendix B (Batteries)",
    "https://ktane.timwi.de/HTML/Batteries.html"
  ),
  new Module("Appendix C (Ports)", "https://ktane.timwi.de/HTML/Ports.html"),
];

pageSidebar.addSidebarItems(defaultModuleList);
