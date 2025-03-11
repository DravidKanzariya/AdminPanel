"use client"
import React from 'react'
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { useDeleteUserMutation } from "../redux/services/apiSlice";
import {
    Box, IconButton,
    Dialog, DialogTitle, DialogActions, Button,
} from "@mui/material";


const DeleteUser = (props) => {
    const [openDelete, setOpenDelete] = useState(false);
    const [deleteUser, { isLoading: delIsLoading, error: delError }] = useDeleteUserMutation();
    
    const sendDelete = (data)=>{
        props.sendData(data)
    }

    const handleDelete = async (id) => {
        try {
            const response = await deleteUser({ id }).unwrap();
            console.log("Deleted Successfully:", response);
            sendDelete(response.data);
            setOpenDelete(false);
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };


    return (
        <Box>

            <IconButton onClick={() => setOpenDelete(true)} color="error">
                <DeleteIcon />
            </IconButton>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)} fullWidth maxWidth="xs">
                <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
                    <Button onClick={() => handleDelete(props.params.row.id)} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default DeleteUser