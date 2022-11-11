import { Routes, Route } from "../node_modules/react-router-dom/index";

import Home from "./pages/home.js";
import Login from "./pages/login.js";
import Signup from "./pages/signup.js";
import Create from "./pages/create.js";
import Edit from "./pages/edit.js";
import LeftBar from "./components/LeftBar.js";
import Menu from "./components/Menu.js";
import RequireAuth from "./components/RequireAuth";
import PersistLogin from "./components/PersistLogin";

const ROLES = {
  User: 10,
  Admin: 50,
  SuperAdmin: 99,
};

function App() {
  return (
    <div className="App">
      <header>
        <Menu />
      </header>
      <main className="container-fluid d-flex flex-wrap">
        <LeftBar />
        <div className="middle">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<PersistLogin />}>
              <Route path="/" element={<Home />} />

              {/* Protected user's routes */}
              <Route
                element={
                  <RequireAuth allowedRoles={[ROLES.User, ROLES.Admin]} />
                }
              >
                <Route path="/create" element={<Create />} />
                <Route path="/posts/:id/edit" element={<Edit />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
