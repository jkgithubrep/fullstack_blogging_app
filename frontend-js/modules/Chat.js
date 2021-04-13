export default class Chat {
  constructor() {
    this.chatOpenedOnce = false;
    this.chatWrapper = document.getElementById("chat-wrapper");
    this.injectHTML();
    this.openChatIcon = document.querySelector(".header-chat-icon");
    this.closeChatIcon = document.querySelector(".chat-title-bar-close");
    this.chatForm = document.getElementById("chatForm");
    this.chatLog = document.getElementById("chatLog");
    this.chatInput = document.getElementById("chatField");
    this.events();
  }

  events() {
    this.chatForm.addEventListener("submit", (e) =>
      this.handleNewMessageSubmitted(e)
    );
    this.openChatIcon.addEventListener("click", () => this.openChat());
    this.closeChatIcon.addEventListener("click", () => this.closeChat());
  }

  openChat() {
    if (!this.chatOpenedOnce) {
      this.openSocketConnection();
      this.chatOpenedOnce = true;
    }
    this.chatWrapper.classList.add("chat--visible");
  }

  closeChat() {
    this.chatWrapper.classList.remove("chat--visible");
  }

  openSocketConnection() {
    this.socket = io();
    this.socket.on("chatMessageFromServer", (data) =>
      this.displayChatMessage(data)
    );
  }

  handleNewMessageSubmitted(e) {
    e.preventDefault();
    this.socket.emit("chatMessageFromBrowser", {
      message: this.chatInput.value,
    });
    this.chatInput.value = "";
    this.chatInput.focus();
  }

  displayChatMessage(data) {
    this.chatLog.insertAdjacentHTML("beforeend", `<p>${data.message}</p>`);
  }

  injectHTML() {
    this.chatWrapper.insertAdjacentHTML(
      "beforeend",
      `
        <div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span></div>

        <div id="chatLog" class="chat-log"></div>

        <form id="chatForm" class="chat-form border-top">
          <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
        </form>
      `
    );
  }
}
