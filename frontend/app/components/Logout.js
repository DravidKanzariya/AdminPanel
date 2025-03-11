"use client"
import {  ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import React from 'react'
import { useLogoutMutation } from '../redux/services/apiSlice';
import LogoutIcon from "@mui/icons-material/Logout";

const Logout = () => {
    const [logout, { isLoading, error }] = useLogoutMutation();
    const handleClick = async () => {
        try {
            const response = await logout().unwrap();
            console.log("Logout Successful:", response);
            window.location.href = "/";
        } catch (err) {
            console.error("Logout Failed:", err);
        }
    };
    return (
        <Typography onClick={handleClick}>
            <ListItem sx={{ color: "red" }}>
                <ListItemIcon> <LogoutIcon /></ListItemIcon>
                  <ListItemText primary='Logout' />
            </ListItem>
        </Typography>
    )
}

export default Logout