import { createRoot } from "react-dom/client";
import { init } from "@getalby/bitcoin-connect-react";
import App from "./App";
import "./index.css";

init({ appName: "Presidential Executive Orders" });

createRoot(document.getElementById("root")!).render(<App />);
