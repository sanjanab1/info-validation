
import { createRoot } from "react-dom/client";
import Clarity from "@microsoft/clarity";
import App from "./app/App.tsx";
import "./styles/index.css";

const clarityProjectId = "wgxxulwpao";
if (clarityProjectId) {
	Clarity.init(clarityProjectId);
}

createRoot(document.getElementById("root")!).render(<App />);
  