import HeaderList from "./modules/HeaderList.js";
import IframeManager from "./modules/IframeManager.js";
import Sidebar from "./modules/Sidebar.js";
import Draggables from "./modules/Draggables.js";
import "./styles/main.css";
import { NumberedAlphabetPopup, GridPopup } from "./modules/popup.js";

new HeaderList();
new IframeManager();
new Sidebar();
new NumberedAlphabetPopup();
new GridPopup();
Draggables;
