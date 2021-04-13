import Search from "./modules/Search";
import FormValidation from "./modules/FormValidation";
import Chat from "./modules/Chat";

if (document.getElementById("chat-wrapper")) {
  new Chat();
}

if (document.getElementById("registration-form")) {
  new FormValidation();
}

if (document.querySelector(".header-search-icon")) {
  new Search();
}
