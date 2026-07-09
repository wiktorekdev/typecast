import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import { ToastProvider } from "./components/Toast.jsx"
import { I18nProvider } from "./i18n/I18nProvider.jsx"
import "./index.css"
import "./app-theme.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </I18nProvider>
  </React.StrictMode>
)

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}
