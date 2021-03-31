import axios from "axios";
import DOMPurify from "dompurify";

export default class Search {
  static htmlToElement(html) {
    const placeholder = document.createElement("div");
    placeholder.innerHTML = html;
    return placeholder.children.length
      ? placeholder.firstElementChild
      : undefined;
  }

  constructor() {
    this.injectSearchOverlayHTML();
    this.headerSearchIcon = document.querySelector(".header-search-icon");
    this.searchOverlay = document.querySelector(".search-overlay");
    this.searchOverlayCloseIcon = this.searchOverlay.querySelector(
      ".close-live-search"
    );
    this.inputField = this.searchOverlay.querySelector("#live-search-field");
    this.searchResults = this.searchOverlay.querySelector(
      ".live-search-results"
    );
    this.loaderIcon = this.searchOverlay.querySelector(".circle-loader");
    this.searchResultsListContainer = this.searchOverlay.querySelector(
      ".list-group"
    );
    this.errorMessage = this.searchOverlay.querySelector(".alert-danger");
    this.warningMessage = this.searchOverlay.querySelector(".alert-warning");

    this.previousSearchValue = "";

    this.events();
  }

  events() {
    this.headerSearchIcon.addEventListener("click", (e) => {
      e.preventDefault();
      this.openSearchOverlay();
      setTimeout(() => this.inputField.focus(), 50);
    });

    this.searchOverlayCloseIcon.addEventListener("click", (e) => {
      this.closeSearchOverlay();
    });

    this.inputField.addEventListener("keyup", () => {
      this.handleKeyStroke();
    });
  }

  reinitializeSearch() {
    this.inputField.value = "";
    this.previousSearchValue = "";
    this.hideErrorMessage();
    this.hideWarningMessage();
    this.hideSearchResults();
  }

  displayLoaderIcon() {
    this.loaderIcon.classList.add("circle-loader--visible");
  }

  hideLoaderIcon() {
    this.loaderIcon.classList.remove("circle-loader--visible");
  }

  displaySearchResults() {
    this.searchResults.classList.add("live-search-results--visible");
  }

  hideSearchResults() {
    this.searchResults.classList.remove("live-search-results--visible");
  }

  openSearchOverlay() {
    this.reinitializeSearch();
    this.searchOverlay.classList.add("search-overlay--visible");
  }

  closeSearchOverlay() {
    this.hideLoaderIcon();
    this.hideSearchResults();
    this.searchOverlay.classList.remove("search-overlay--visible");
  }

  updateSearchResults(searchResultsData = []) {
    this.searchResultsListContainer.innerHTML = "";
    let nbResultsFound = searchResultsData.length;
    if (!nbResultsFound) return this.renderWarning();
    let fragment = document.createDocumentFragment();
    fragment.appendChild(
      Search.htmlToElement(`
      <div class="list-group-item active">
        <strong>Search Results</strong> (${nbResultsFound} ${
        nbResultsFound > 1 ? "posts" : "post"
      } found)
      </div>
      `)
    );
    searchResultsData.forEach((result, index) => {
      let e = document.createElement("a");
      e.href = `/post/${result.data._id}`;
      e.className = "list-group-item list-group-item-action";
      e.innerHTML = DOMPurify.sanitize(`
        <img class="avatar-tiny" src="${result.data.author.gravatar}"> <strong>${result.data.title} #${index}</strong>
        <span class="text-muted small">by ${result.data.author.username} on ${result.data.dateFormatted}</span>
      `);
      fragment.appendChild(e);
    });
    this.searchResultsListContainer.appendChild(fragment);
  }

  hideErrorMessage() {
    this.errorMessage.classList.add("d-none");
  }

  displayErrorMessage() {
    this.errorMessage.classList.remove("d-none");
  }

  hideWarningMessage() {
    this.warningMessage.classList.add("d-none");
  }

  displayWarningMessage() {
    this.warningMessage.classList.remove("d-none");
  }

  hideAll() {
    this.hideWarningMessage();
    this.hideErrorMessage();
    this.hideSearchResults();
  }

  renderResults(searchResultsData) {
    this.hideLoaderIcon();
    this.updateSearchResults(searchResultsData);
    this.displaySearchResults();
  }

  renderError() {
    this.hideLoaderIcon();
    this.hideSearchResults();
    this.displayErrorMessage();
  }

  renderWarning() {
    this.hideLoaderIcon();
    this.hideSearchResults();
    this.displayWarningMessage();
  }

  handleKeyStroke() {
    let currentInputValue = this.inputField.value;

    if (currentInputValue == "") {
      clearTimeout(this.waitBeforeSearchRequest);
      this.hideLoaderIcon();
      this.hideAll();
    } else if (currentInputValue !== this.previousSearchValue) {
      clearTimeout(this.waitBeforeSearchRequest);
      this.hideAll();
      this.displayLoaderIcon();
      this.waitBeforeSearchRequest = setTimeout(() => {
        axios
          .post("/search", { searchTerms: currentInputValue })
          .then((response) => this.renderResults(response.data))
          .catch((err) => {
            console.log(err);
            this.renderError();
          });
      }, 750);
    }

    this.previousSearchValue = currentInputValue;
  }

  injectSearchOverlayHTML() {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
  <!-- search feature begins -->
  <div class="search-overlay">
    <div class="search-overlay-top shadow-sm">
      <div class="container container--narrow">
        <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
        <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
        <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
      </div>
    </div>

    <div class="search-overlay-bottom">
      <div class="container container--narrow py-3">
        <div class="circle-loader"></div>
        <div class="alert alert-danger text-center d-none">Error while trying to fetch posts.</div>
        <div class="alert alert-warning text-center py-3 d-none">Sorry, we could not find any post related to your search.</div>
        <div class="live-search-results">
          <div class="list-group shadow-sm"></div>
        </div>
      </div>
    </div>
  </div>
  <!-- search feature end -->
    `
    );
  }
}
