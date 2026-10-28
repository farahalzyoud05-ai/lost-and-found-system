const inputs = document.querySelectorAll(".otp-input");
const verifyBtn = document.getElementById("verifyBtn");
const result = document.getElementById("result");
const timerDisplay = document.getElementById("timer");
const resendBtn = document.getElementById("resendBtn");

// ===== OTP Input Handling =====
inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    if (input.value.length === 1 && index < inputs.length - 1) {
      inputs[index + 1].focus(); // move to next box
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && index > 0 && input.value === "") {
      inputs[index - 1].focus(); // move back
    }
  });
});

verifyBtn.addEventListener("click", () => {
  let otpCode = "";
  inputs.forEach(input => otpCode += input.value);
  result.textContent = "Entered OTP: " + otpCode;
});

// ===== Countdown Timer (1 minute) =====
let countdown = 60;
let timer = setInterval(() => {
  countdown--;
  timerDisplay.textContent = "Resend OTP in " + countdown + "s";

  if (countdown <= 0) {
    clearInterval(timer);
    timerDisplay.textContent = "You can resend OTP now";
    resendBtn.disabled = false;
  }
}, 1000);

resendBtn.addEventListener("click", () => {
  alert("New OTP has been sent to your email!");
  resendBtn.disabled = true;
  countdown = 60;
  timerDisplay.textContent = "Resend OTP in 60s";
  timer = setInterval(() => {
    countdown--;
    timerDisplay.textContent = "Resend OTP in " + countdown + "s";
    if (countdown <= 0) {
      clearInterval(timer);
      timerDisplay.textContent = "You can resend OTP now";
      resendBtn.disabled = false;
    }
  }, 1000);
});