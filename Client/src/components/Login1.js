import React from "react";

const AutoLogin = () => {
  const handleLogin = () => {
    const loginUrl = "https://expertsolutionsgps.com/gps/public/login";
    const script = `
      document.querySelector('input[name="username"]').value = 'MANMATHKAR';
      document.querySelector('input[name="password"]').value = '123456';
      document.querySelector('form').submit();
    `;
    const popup = window.open(loginUrl, "_blank");
    if (popup) {
      popup.onload = () => {
        popup.document.body.insertAdjacentHTML(
          "beforeend",
          `<script>${script}<\/script>`
        );
      };
    }
  };

  return (
    <button onClick={handleLogin} className="px-4 py-2 bg-blue-500 text-white rounded">
      Auto-Login to GPS
    </button>
  );
};

export default AutoLogin;
