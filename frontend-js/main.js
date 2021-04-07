import Search from "./modules/Search";
import FormValidation from "./modules/FormValidation";

if (document.getElementById("registration-form")) {
  new FormValidation();
}

if (document.querySelector(".header-search-icon")) {
  new Search();
}
