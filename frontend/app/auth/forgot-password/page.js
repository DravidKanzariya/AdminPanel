"use client";
import { useForm } from "react-hook-form";
import { Box, Button } from "@mui/material";
import { useState } from "react";
import { useForgotPasswordMutation } from "@/app/redux/services/apiSlice";

export default function ForgotPassword() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
    const [message, setMessage] = useState("");

    const onSubmit = async (formData) => {
        try {
            const response = await forgotPassword(formData).unwrap();
            setMessage(response.message);
        } catch (err) {
            setMessage("Failed to send reset link.");
        }
    };

    return (
        <Box className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-semibold text-center mb-4">Forgot Password</h2>
                
                {message && <p className="text-center text-green-600">{message}</p>}
                
                <Box className="mb-4">
                    <label className="block text-gray-700">Enter your Email</label>
                    <input
                        type="email"
                        {...register("email", { required: "Email is required" })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </Box>

                <Button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 hover:text-white transition" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send mail"}
                </Button>
            </form>
        </Box>
    );
}
