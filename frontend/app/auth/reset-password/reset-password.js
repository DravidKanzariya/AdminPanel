"use client";

import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useResetPasswordMutation } from "@/app/redux/services/apiSlice";

export default function ResetPassword() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [resetPassword, { isLoading }] = useResetPasswordMutation();
    const [message, setMessage] = useState("");
    const [serverError, setServerError] = useState(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const onSubmit = async (formData) => {
        if (!token) {
            setServerError("Invalid or missing token.");
            return;
        }
        try {
            const response = await resetPassword({ token, password: formData.password }).unwrap();
            setMessage(response.message);
            setTimeout(() => router.push("/auth/login"), 3000);
        } catch (err) {
            setServerError(err.data?.message || "Failed to reset password.");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center text-blue-600">Reset Password</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                    {/* Password Field */}
                    <div>
                        <label className="block text-gray-700">New Password</label>
                        <input
                            type="password"
                            className="w-full mt-1 p-2 border rounded-md"
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 6, message: "Password must be at least 6 characters" }
                            })}
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="mt-4">
                        <label className="block text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            className="w-full mt-1 p-2 border rounded-md"
                            {...register("confirmPassword", {
                                required: "Confirm your password",
                                validate: value => value === watch("password") || "Passwords do not match"
                            })}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                    </div>

                    {/* Error and Success Messages */}
                    {serverError && <p className="text-red-500 text-center mt-3">{serverError}</p>}
                    {message && <p className="text-green-500 text-center mt-3">{message}</p>}

                    {/* Submit Button */}
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 mt-4 rounded-md" disabled={isLoading}>
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
