"use client"
import * as React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAddUserMutation, useSendMailMutation, useUpdateUserMutation } from '../redux/services/apiSlice';

export default function AddUser(props) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [addUser, { isLoading, error }] = useAddUserMutation();
    const [mailUser, { isMailLoading, mailError }] = useSendMailMutation();
    const [updateUser, { isLoading: updateLoading, error: updateError }] = useUpdateUserMutation();

    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
         reset(); // Reset form fields after closing the dialog
    };

    const sendMail = (data) => {
        try {
            mailUser({
                email: data.email,
                id: data._id
            })
        } catch (error) {
            console.error("Error while mailing user:", error);
        }
    }

    const statusUpdate = async (id) => {
        try {
            await updateUser({
                id,
                status: "invitation sent",
            }).unwrap();
            console.log("User status updated successfully.");
        } catch (error) {
            console.error("Status update failed:", error);
        }
    };

    const onSubmit = async (formData) => {
        try {
            const addedUser = await addUser(formData).unwrap(); // Get response from API
            console.log("Admin added successfully:", addedUser);

            sendMail(addedUser.data);

            if (addedUser?.data._id) {
                statusUpdate(addedUser.data._id);
            } else {
                console.error("User ID not found, cannot update status.");
            }

            handleClose();
        } catch (err) {
            console.error("Error adding user:", err);
        }
    };
  
    return (
        <Box>
            <Button variant="contained" color="primary" onClick={handleOpen}>
                Add User
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Box className="mb-4">
                            <label className="block text-gray-700">Username</label>
                            <input
                                type="text"
                                {...register("username", { required: "Username is required" })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                        </Box>

                        <Box className="mb-4">
                            <label className="block text-gray-700">Email</label>
                            <input
                                type="email"
                                {...register("email", { required: "Email is required" })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </Box>

                        <Box className="mb-4">
                            <label className="block text-gray-700">Password</label>
                            <input
                                type="password"
                                {...register("password", { required: "Password is required" })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                        </Box>

                        {error && (
                            <p className="text-red-500 text-center">
                                {error.data?.message || "An unexpected error occurred."}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="w-full mt-5 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                            disabled={isLoading}
                        >
                            {isLoading ? "Adding..." : "Add User"}
                        </button>
                    </form>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
