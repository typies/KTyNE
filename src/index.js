import HeaderList from "./modules/HeaderList.js";
import IframeManager from "./modules/IframeManager.js";
import Sidebar from "./modules/Sidebar.js";
import Interactjs from "./modules/Interactjs.js";
import "./styles/main.css";
import {
  NumberedAlphabetPopup,
  GridPopup,
  CalcPopup,
} from "./modules/popup.js";

new HeaderList();
new IframeManager();
new Sidebar();
new NumberedAlphabetPopup();
new GridPopup();
new CalcPopup();
Interactjs;
