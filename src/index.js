import HeaderList from "./modules/HeaderList.js";
import IframeManager from "./modules/IframeManager.js";
import Sidebar from "./modules/Sidebar.js";
import popups from "./modules/popup.js";
import "./styles/style.css";

new HeaderList();
new IframeManager();
new Sidebar();
new popups.EdgeworkPopup().init();
new popups.NumberedAlphabetPopup().init();
new popups.NewModuleListItemPopup().init();
new popups.NewModuleListItemManyPopup().init();
