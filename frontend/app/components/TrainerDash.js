"use client"
import { useState } from "react";
import {
    Drawer, List, ListItem, ListItemIcon, ListItemText,
    Box, Typography, IconButton
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ManageUsers from "./ManageUsers";
import Logout from "./Logout";
import MyProfile from "./MyProfile";


export default function Dashboard(props) {
    const [active, setActive] = useState();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawerContent = (
        <Box sx={{ width: 240, p: 2 }}>
            <Typography variant="h6" gutterBottom className="capitalize">
                Trainer Dashboard
            </Typography>
            <List>

                <ListItem
                    selected={active === "manage-users"}
                    onClick={() => {
                        setActive("manage-users");
                        setMobileOpen(false); // Close sidebar in mobile view
                    }}

                >
                    <ListItemIcon><PeopleIcon /></ListItemIcon>
                    <ListItemText  >
                        Manage Users
                    </ListItemText>
                </ListItem>
                <ListItem
                    selected={active === "my-profile"}
                    onClick={() => {
                        setActive("my-profile");
                        setMobileOpen(false); // Close sidebar in mobile view
                    }}
                >
                    <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                    <ListItemText>
                        My Profile
                    </ListItemText>
                </ListItem>

                <Logout />
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#f5f5f5" }}>
            {/* Sidebar (Permanent on Desktop, Drawer on Mobile) */}
            <Box sx={{ display: { xs: "block", md: "none" }, position: "absolute", top: 10, left: 10 }}>
                <IconButton onClick={handleDrawerToggle} color="primary">
                    <MenuIcon />
                </IconButton>
            </Box>

            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    width: 240,
                    flexShrink: 0
                }}
                open
            >
                {drawerContent}
            </Drawer>

            {/* Mobile Drawer */}
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                sx={{ display: { xs: "block", md: "none" } }}
            >
                <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
                    <IconButton onClick={handleDrawerToggle}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                {drawerContent}
            </Drawer>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, p: 3, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Box sx={{ width: "100%" }}>
                    {active !== "my-profile" && <ManageUsers id={props.id} name={props.name} />}
                    {active === "my-profile" && <MyProfile />}
                </Box>
            </Box>
        </Box>
    );
}

