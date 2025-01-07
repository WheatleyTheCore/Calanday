import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

const CustomAppBar = () => {
  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: "flex",
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            CalenDay
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "end",
            }}
          >
            <Link href="/">
              <Button sx={{ fontWeight: 500, color: "white" }}>Main App</Button>
            </Link>
            <Link href="/docs">
              <Button sx={{ fontWeight: 500, color: "white" }}>Docs</Button>
            </Link>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
export default CustomAppBar;
