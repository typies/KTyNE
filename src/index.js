import HeaderList from "./modules/HeaderList.js";
import IframeManager from "./modules/IframeManager.js";
import Sidebar from "./modules/Sidebar.js";
import "./styles/main.css";
import {
  EdgeworkPopup,
  NumberedAlphabetPopup,
  GridPopup,
} from "./modules/popup.js";

new HeaderList();
new IframeManager();
new Sidebar();
new EdgeworkPopup();
new NumberedAlphabetPopup();
new GridPopup();
