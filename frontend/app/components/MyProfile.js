"use client";

import { useEffect, useState } from "react";
import { 
    Box, Typography, Avatar, CircularProgress, Button, TextField, Snackbar, Alert
} from "@mui/material";
import { useGetCurrentUserQuery, useUpdateUserMutation } from "@/app/redux/services/apiSlice"; 

export default function MyProfile() {
    const { data: user, isLoading, error } = useGetCurrentUserQuery();
    const [updateUser, { isLoading: isUpdating, isError, isSuccess }] = useUpdateUserMutation();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [passwordError, setPasswordError] = useState("");
    const [alert, setAlert] = useState({ open: false, message: "", severity: "" });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user?.data.username || "",
                email: user?.data.email || "",
                password: "",
                confirmPassword: ""
            });
        }
    }, [user]);    

    if (isLoading) {
        return (
            <Box className="flex justify-center items-center h-full">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box className="text-center text-red-500">
                Failed to load profile.
            </Box>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

        if (e.target.name === "confirmPassword") {
            if (e.target.value !== formData.password) {
                setPasswordError("Passwords do not match");
            } else {
                setPasswordError("");
            }
        }
    };

    const handleSave = async () => {
        if (formData.password !== formData.confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        console.log("password----->",formData.password);
        
        try {
            await updateUser({
                id: user.data._id,
                username: formData.name,
                email: formData.email,
                password: formData.password ? formData.password : undefined // Don't send empty passwords
            }).unwrap();
            
            setAlert({ open: true, message: "Profile updated successfully!", severity: "success" });
            setIsEditing(false);
        } catch (error) {
            setAlert({ open: true, message: "Failed to update profile.", severity: "error" });
        }
    };

    return (
        <Box className="flex flex-col items-center p-6 bg-white shadow-md rounded-lg w-96 mx-auto">
            <Avatar src={user?.profileImage} alt={user?.data?.name} sx={{ width: 80, height: 80 }} />

            {isEditing ? (
                <>
                    <TextField
                        label="Name"
                        name="name"
                        value={formData?.name}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={formData?.email}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="New Password"
                        name="password"
                        type="password"
                        value={formData?.password}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData?.confirmPassword}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        error={!!passwordError}
                        helperText={passwordError}
                    />
                    <Box className="flex gap-4 mt-4">
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleSave} 
                            disabled={passwordError !== "" || isUpdating}
                        >
                            {isUpdating ? "Saving..." : "Save"}
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="secondary" 
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </Button>
                    </Box>
                </>
            ) : (
                <>
                    <Typography variant="h5" className="mt-4 font-semibold">
                        {user?.data?.username || "John Doe"}
                    </Typography>
                    <Typography variant="body1" className="text-gray-600 mt-2">
                        {user?.data?.email || "johndoe@example.com"}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mt-1">
                        Role: {user?.data?.role || "Super Admin"}
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        className="mt-4" 
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Profile
                    </Button>
                </>
            )}

            {/* Snackbar for Success/Error Messages */}
            <Snackbar
                open={alert.open}
                autoHideDuration={3000}
                onClose={() => setAlert({ ...alert, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
