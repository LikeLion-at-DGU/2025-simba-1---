document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const idI = $("username");
  const idField = $("username_field");
  const idErr = $("username_check");
  const idOK = $("username_textcontainer");
  const IdClear = $("id_clear");

  const pwInput = $("password");
  const cfInput = $("confirm");
  const nextBtn = $("nextBtn");

  const pwGuide = $("password_textcontainer");
  const pwErr = $("password_error");
  const cfErr = $("confirm_error");

  const inputFields = document.querySelectorAll(".input_field");
  const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,20}$/;

  let usernameValid = false;
  let passwordValid = false;
  let pwMatch = false;

  // ID 중복 검사
  idOK.style.display = "none";

  let idTimer;
  idI.addEventListener("input", () => {
    clearTimeout(idTimer);
    resetIdUI();

    const value = idI.value.trim();
    if (!value) {
      usernameValid = false;
      updateSubmit();
      return;
    }

    idTimer = setTimeout(() => {
      fetch(`/accounts/checkid/?username=${encodeURIComponent(value)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(({ exists }) => {
          usernameValid = !exists;
          exists ? setIdError("이미 사용 중인 아이디입니다.") : setIdSuccess();
          updateSubmit();
        })
        .catch(() => {
          usernameValid = false;
          setIdError("아이디 확인 실패");
          updateSubmit();
        });
    }, 400);
  });

  function resetIdUI() {
    idField.classList.remove("error", "success");
    idErr.style.display = "none";
    idOK.style.display = "none";
    IdClear.src = IdClear.dataset.defaultIcon;
  }
  function setIdError(msg) {
    idField.classList.add("error");
    idErr.textContent = msg;
    idErr.style.display = "block";
    idOK.style.display = "none";
    IdClear.src = IdClear.dataset.errorIcon || IdClear.dataset.defaultIcon;
  }
  function setIdSuccess() {
    idField.classList.add("success");
    idOK.textContent = "좋은 아이디네요!";
    idOK.style.display = "block";
    IdClear.src = IdClear.dataset.successIcon;
  }

  IdClear.addEventListener("click", () => {
    idI.value = "";
    resetIdUI();
    usernameValid = false;
    updateSubmit();
    idI.focus();
  });

  [pwInput, cfInput].forEach((el) => el.addEventListener("input", validate));
  validate(); // 최초 1회

  function validate() {
    const pw = pwInput.value.trim();
    const cf = cfInput.value.trim();

    let pwOK = false;
    pwGuide.style.display = pw ? "none" : "block";

    // 모든 필드 초기화
    inputFields.forEach((field) => {
      const input = field.querySelector("input");
      if (input && input.id === "username") return;
      field.classList.remove("error", "success");
      const img = field.querySelector("img");
      
      if (img && input)
        img.src =
          input.dataset.defaultIcon || "/static/icons/account_default.svg";
    });

    // PW 유효성 검사
    if (!pw) {
      pwGuide.textContent =
        "영어,숫자,특수문자를 포함하여 8-20자 이내로 작성해주세요.";
      pwErr.style.display = "none";
    } else if (pw.length < 8) {
      pwErr.textContent = "비밀번호는 8자 이상이어야 합니다.";
      pwErr.style.display = "block";
    } else if (pw.length > 20) {
      pwErr.textContent = "비밀번호는 20자 이하이어야 합니다.";
      pwErr.style.display = "block";
    } else if (!/[!@#$%^&*()_\-+={[}\]|\\:;"'<>,.?/]/.test(pw)) {
      pwErr.textContent = "비밀번호는 특수문자를 포함해야 합니다.";
      pwErr.style.display = "block";
    } else if (!pwRegex.test(pw)) {
      pwErr.textContent = "영문과 숫자를 모두 포함해야 합니다.";
      pwErr.style.display = "block";
    } else {
      pwOK = true;
      pwGuide.textContent = "사용 가능한 비밀번호입니다.";
      pwErr.style.display = "none";
    }

    if (pw && !pwOK) markField("password", "error");
    if (pwOK)
      markField("password", "success", "/static/icons/account_chdeck.svg");

    // pw, Confirm 일치
    const same = pwOK && cf && pw === cf;
    cfErr.style.display = cf && !same ? "block" : "none";

    if (cf && !same)
      markField("confirm", "error", "/static/icons/account_alert.svg");
    if (same)
      markField("confirm", "success", "/static/icons/account_chdeck.svg");

    passwordValid = pwOK;
    pwMatch = same;
    updateSubmit();
  }

  function markField(inputId, state, iconPath) {
    inputFields.forEach((field) => {
      const input = field.querySelector("input");
      if (input && input.id === inputId) {
        field.classList.add(state);
        if (iconPath) {
          const img = field.querySelector("img");
          if (img) img.src = iconPath;
        }
      }
    });
  }

  // 비밀번호 표시 토글 아이콘
  document.querySelectorAll(".toggle-icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      const input = icon.previousElementSibling;
      const def = icon.dataset.defaultIcon;
      const tog = icon.dataset.toggleIcon;
      if (input.type === "password") {
        input.type = "text";
        icon.src = tog;
      } else {
        input.type = "password";
        icon.src = def;
      }
    });
  });

  // 제출 버튼 활성화
  function updateSubmit() {
    const ok = usernameValid && passwordValid && pwMatch;
    nextBtn.disabled = !ok;
    nextBtn.classList.toggle("active", ok);
  }
  updateSubmit();

  // 제출 방지
  $("signupForm").addEventListener("submit", (e) => {
    if (nextBtn.disabled) e.preventDefault();
  });
});
