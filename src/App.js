import * as React from "react";
import { Routes, Route, Outlet, Link } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Docs from "./Pages/Docs";
import Home from "./Pages/Home";

const theme = createTheme({
  palette: {
    primary: {
      main: "#AC2B37",
    },
  },
});

export default function App() {
  return (
    <div>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="docs" element={<Docs />} />
            <Route path="*" element={<NoMatch />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </div>
  );
}

function Layout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}
