import HeaderList from "./modules/HeaderList.js";
import IframeManager from "./modules/IframeManager.js";
import Sidebar from "./modules/Sidebar.js";
import {
  EdgeworkPopup,
  NumberedAlphabetPopup,
  AddModuleListItemPopup,
  EditModuleListItemPopup,
  ImportModulesPopup,
  ExportModulesPopup,
  NukeWarningPopup,
} from "./modules/popup.js";
import "./styles/style.css";

new HeaderList();
new IframeManager().init();
new Sidebar();
new EdgeworkPopup().init();
new NumberedAlphabetPopup().init();
new AddModuleListItemPopup().init();
new EditModuleListItemPopup().init();
new ImportModulesPopup().init();
new ExportModulesPopup().init();
new NukeWarningPopup().init();
