import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { AppToaster } from "./components/Toast"
import { I18nProvider } from "./i18n/I18nProvider"
import "./index.css"
import "./app-theme.css"

const root = document.getElementById("root")
if (!root) throw new Error("Missing #root")

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
      <AppToaster />
    </I18nProvider>
  </React.StrictMode>
)

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => {})
  })
}
