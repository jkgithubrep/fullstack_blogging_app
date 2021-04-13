import DOMPurify from "dompurify";

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
    this.socket.on("welcome", (data) => {
      this.user = Object.assign(data);
    });
  }

  handleNewMessageSubmitted(e) {
    e.preventDefault();
    let data = {
      message: this.chatInput.value,
    };
    this.socket.emit("chatMessageFromBrowser", data);
    this.displayChatMessage({ ...data, ...this.user }, false);
    this.chatInput.value = "";
    this.chatInput.focus();
  }

  displayChatMessage(data, isFromOther = true) {
    let chatMessageHTML = DOMPurify.sanitize(
      isFromOther
        ? `
      <div class="chat-other">
        <a href="/profile/${data.username}"><img class="avatar-tiny" src="${data.gravatar}"></a>
        <div class="chat-message"><div class="chat-message-inner">
          <a href="/profile/${data.username}"><strong>${data.username}</strong></a>
         ${data.message}
        </div></div>
      </div>
      `
        : `
      <div class="chat-self">
        <div class="chat-message">
          <div class="chat-message-inner">
            ${data.message}
          </div>
        </div>
        <img class="chat-avatar avatar-tiny" src="${data.gravatar}">
      </div>
      `
    );

    this.chatLog.insertAdjacentHTML("beforeend", chatMessageHTML);
    this.chatLog.scrollTop = this.chatLog.scrollHeight;
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
