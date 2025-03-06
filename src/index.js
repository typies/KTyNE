import HeaderList from "./modules/HeaderList.js";
import IframeManager from "./modules/IframeManager.js";
import Sidebar from "./modules/Sidebar.js";
import "./styles/main.css";
import {
  EdgeworkPopup,
  NumberedAlphabetPopup,
  ImportModulesPopup,
  ExportModulesPopup,
} from "./modules/popup.js";

new HeaderList();
new IframeManager().init();
new Sidebar();
new EdgeworkPopup();
new NumberedAlphabetPopup();
new ImportModulesPopup().init();
new ExportModulesPopup().init();
