import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const logo = fs.readFileSync(path.join(root, "public", "logo.svg"), "utf8")
const paths = logo.match(/<path[^/]*\/>/g) || []
const inner = paths.join("")

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Typecast">
  <rect width="512" height="512" rx="112" fill="#0a0a0b"/>
  <g transform="translate(56 56) scale(0.142)" fill="#fafafa">${inner}</g>
</svg>
`
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0a0b"/>
  <g transform="translate(260 145) scale(0.12)" fill="#fafafa">${inner}</g>
  <text x="520" y="335" fill="#fafafa" font-family="ui-sans-serif,system-ui,sans-serif" font-size="72" font-weight="600" letter-spacing="-1.5">Typecast</text>
  <text x="520" y="388" fill="#a1a1aa" font-family="ui-sans-serif,system-ui,sans-serif" font-size="26">Images to binary, ASCII and character art</text>
</svg>
`
fs.writeFileSync(path.join(root, "public", "icon-512.svg"), icon)
fs.writeFileSync(path.join(root, "public", "og.svg"), og)
console.log("brand assets ok")
