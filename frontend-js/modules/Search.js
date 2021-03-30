import axios from "axios";

export default class Search {
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
      ".search-results-list-items-container"
    );
    this.searchResultsCount = this.searchOverlay.querySelector(
      ".list-group-item-count"
    );
    this.previousSearchValue = "";
    this.searchResultsData = [];
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
    this.searchOverlay.classList.add("search-overlay--visible");
  }

  closeSearchOverlay() {
    this.searchOverlay.classList.remove("search-overlay--visible");
    this.inputField.value = "";
    this.hideSearchResults();
  }

  updateSearchResults() {
    let searchResultsData = this.searchResultsData;
    let nbResultsFound = searchResultsData.length;
    this.searchResultsCount.innerText = `${nbResultsFound} ${
      nbResultsFound > 1 ? "items" : "item"
    }`;
    let fragment = document.createDocumentFragment();
    searchResultsData.forEach((result, index) => {
      let e = document.createElement("a");
      e.href = `/post/${result.data._id}`;
      e.className = "list-group-item list-group-item-action";
      e.innerHTML = `
        <img class="avatar-tiny" src="${result.data.author.gravatar}"> <strong>${result.data.title} #${index}</strong>
        <span class="text-muted small">by ${result.data.author.username} on ${result.data.dateFormatted}</span>
      `;
      fragment.appendChild(e);
    });
    this.searchResultsListContainer.innerHTML = "";
    this.searchResultsListContainer.appendChild(fragment);
  }

  handleKeyStroke() {
    let currentInputValue = this.inputField.value;

    this.hideSearchResults();

    if (
      currentInputValue !== "" &&
      currentInputValue !== this.previousSearchValue
    ) {
      clearTimeout(this.waitBeforeSearchRequest);
      this.displayLoaderIcon();
      this.waitBeforeSearchRequest = setTimeout(() => {
        axios
          .post("/search", { searchTerms: currentInputValue })
          .then((response) => {
            this.searchResultsData = response.data;
            this.updateSearchResults();
            this.hideLoaderIcon();
            this.displaySearchResults();
          })
          .catch((err) => {
            console.log(err);
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
        <div class="live-search-results">
          <div class="list-group shadow-sm">
            <div class="list-group-item active"><strong>Search Results</strong> (<span class="list-group-item-count">4 items</span> found)</div>
            <div class="search-results-list-items-container">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- search feature end -->
    `
    );
  }
}
