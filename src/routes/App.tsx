import { HashRouter, Route, Routes } from "react-router-dom";
import WantedLogin from "./Wanted-login";
import About from "./About";
import Home from "./Home";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/wanted-login" Component={WantedLogin} />
        <Route path="/about" Component={About} />
      </Routes>
    </HashRouter>
  );
}

export default App;
