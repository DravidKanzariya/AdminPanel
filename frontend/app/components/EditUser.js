"use client"
import React from 'react'
import {
    Box, IconButton,
    Dialog, DialogTitle, DialogActions, Button, DialogContent,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import { useUpdateUserMutation } from "../redux/services/apiSlice";


const EditUser = (props) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [openEdit, setOpenEdit] = useState(false);

    const [updateUser, { isLoading: updateLoading, error: updateError }] = useUpdateUserMutation();

    const handleEditClick = (user) => {
        setSelectedUser(user);  // Store the selected user data
        setOpenEdit(true);
    };

    const handleChange = (e) => {
        if (!selectedUser) return;
        setSelectedUser({ ...selectedUser, [e.target.name]: e.target.value });
    };

    const handleEdit = async () => {
        if (!selectedUser) return;

        try {
            const response = await updateUser({
                id: selectedUser.id,
                username: selectedUser.username,
                role: selectedUser.role,
                status: selectedUser.status,
                parentId: selectedUser.parentId,
                registeredThrough: selectedUser.registeredThrough,
            }).unwrap();

            sendData(response.data);
            // console.log("parent ID:", response.parentId);
            console.log("Updated Successfully:", response);


            setOpenEdit(false);
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const sendData = (data) => {
        props.sendData(data)
    }

    return (
        <Box >
            <IconButton onClick={() => handleEditClick(props.params.row)} color="primary">
                <EditIcon />
            </IconButton>

            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={selectedUser?.username || ""}
                        onChange={handleChange}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={selectedUser?.email || ""}
                        onChange={handleChange}
                        margin="dense"
                    />


                    <FormControl fullWidth margin="dense">
                        <InputLabel>Role</InputLabel>
                        <Select
                            name="role"
                            label="Role"
                            value={selectedUser?.role || ""}
                            onChange={handleChange}
                        >
                            <MenuItem value="super-admin">Super-Admin</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="trainer">Trainer</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="dense">
                        <InputLabel>Status</InputLabel>
                        <Select
                            name="status"
                            label="Status"
                            value={selectedUser?.status || ""}
                            onChange={handleChange}
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="invitation sen">invitation sent</MenuItem>
                            <MenuItem value="invitation accepted">invitation accepted</MenuItem>
                            <MenuItem value="password not set">password not set</MenuItem>
                            <MenuItem value="verified">verified</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                    <Button onClick={handleEdit} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default EditUser