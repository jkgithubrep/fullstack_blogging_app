import axios from "axios";

export default class FormValidation {
  constructor() {
    this.inputFields = document.querySelectorAll(
      "#registration-form .form-control"
    );
    this.insertValidationMessageElements();
    this.username = document.getElementById("username-register");
    this.username.previousValue = "";
    this.username.errors = false;
    this.username.isUnique = false;
    this.email = document.getElementById("email-register");
    this.email.previousValue = "";
    this.email.errors = false;
    this.email.isUnique = false;
    this.password = document.getElementById("password-register");
    this.password.previousValue = "";
    this.password.errors = false;
    this.password.isValid = false;
    this.submitButton = document.querySelector(
      '#registration-form button[type="submit"]'
    );
    this.events();
  }

  events() {
    this.username.addEventListener("keyup", () => {
      this.isDifferent(this.username, this.usernameHandler);
    });
    this.email.addEventListener("keyup", () => {
      this.isDifferent(this.email, this.emailHandler);
    });
    this.password.addEventListener("keyup", () => {
      this.isDifferent(this.password, this.passwordHandler);
    });
  }

  isDifferent(element, callback) {
    if (element.value === element.previousValue) return;
    element.previousValue = element.value;
    callback.call(this);
  }

  usernameHandler() {
    this.username.isUnique = false;
    this.usernameInstantValidation();
    clearTimeout(this.username.timer);
    this.username.timer = setTimeout(() => {
      if (!this.username.errors) this.usernameDeferedValidation();
    }, 800);
  }

  usernameInstantValidation() {
    if (
      this.username.value !== "" &&
      !/^[a-zA-Z0-9]+$/.test(this.username.value)
    ) {
      this.displayErrorMessage(
        this.username,
        "Username should only contain letter and numbers."
      );
    } else if (this.username.value.length < 3) {
      this.displayErrorMessage(
        this.username,
        "Username must contain at least 3 characters."
      );
    } else if (this.username.errors) this.hideErrorMessage(this.username);
    this.updateSubmitButtonState();
  }

  async usernameDeferedValidation() {
    try {
      let response = await axios.post("/doesUsernameExist", {
        username: this.username.value,
      });
      const usernameExists = response.data;
      if (usernameExists) {
        this.displayErrorMessage(this.username, "Username already taken.");
      } else {
        this.username.isUnique = true;
      }
      this.updateSubmitButtonState();
    } catch (err) {
      console.log(err.message);
    }
  }

  emailHandler() {
    this.email.isUnique = false;
    if (this.email.errors) this.hideErrorMessage(this.email);
    clearTimeout(this.email.timer);
    this.email.timer = setTimeout(() => {
      if (!this.email.errors) this.emailDeferedValidation();
    }, 800);
  }

  async emailDeferedValidation() {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (this.email.value !== "" && !emailRegex.test(this.email.value)) {
      this.displayErrorMessage(
        this.email,
        "You must enter a valid email address."
      );
    } else {
      try {
        let response = await axios.post("/doesEmailExist", {
          email: this.email.value,
        });
        const emailExists = response.data;
        if (emailExists) {
          this.displayErrorMessage(this.email, "Email already taken.");
        } else {
          this.email.isUnique = true;
        }
      } catch (err) {
        console.log(err.message);
      }
    }
    this.updateSubmitButtonState();
  }

  passwordHandler() {
    this.password.isValid = false;
    this.passwordInstantValidation();
    clearTimeout(this.password.timer);
    this.password.timer = setTimeout(() => {
      if (!this.password.errors) this.passwordDeferedValidation();
    }, 800);
  }

  passwordInstantValidation() {
    if (this.password.value.length > 50) {
      this.displayErrorMessage(
        this.password,
        "Password must not exceed 50 characters."
      );
    } else if (this.password.errors) {
      this.hideErrorMessage(this.password);
    }
    this.updateSubmitButtonState();
  }

  passwordDeferedValidation() {
    if (this.password.value.length < 8) {
      this.displayErrorMessage(
        this.password,
        "Password must have at least 8 characters."
      );
    } else {
      this.password.isValid = true;
    }
    this.updateSubmitButtonState();
  }

  allInputAreValid() {
    if (this.username.value === "" || !this.username.isUnique) return false;
    if (this.email.value === "" || !this.email.isUnique) return false;
    if (this.password.value === "" || !this.password.isValid) return false;
    return true;
  }

  updateSubmitButtonState() {
    if (this.allInputAreValid()) {
      this.activateSubmitButton();
    } else {
      this.desactivateSubmitButton();
    }
  }

  desactivateSubmitButton() {
    this.submitButton.classList.add("disabled");
  }

  activateSubmitButton() {
    this.submitButton.classList.remove("disabled");
  }

  displayErrorMessage(element, message) {
    element.errors = true;
    const validationMessageElement = element.previousSibling;
    validationMessageElement.innerHTML = message;
    validationMessageElement.classList.add("liveValidateMessage--visible");
  }

  hideErrorMessage(element) {
    element.errors = false;
    const validationMessageElement = element.previousSibling;
    validationMessageElement.classList.remove("liveValidateMessage--visible");
  }

  insertValidationMessageElements() {
    this.inputFields.forEach((input) => {
      input.insertAdjacentHTML(
        "beforebegin",
        '<div class="alert alert-danger liveValidateMessage"></div>'
      );
    });
  }
}
