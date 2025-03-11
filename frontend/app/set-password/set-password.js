"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetPasswordMutation, useSetStatusMutation, useUpdateUserMutation } from "../redux/services/apiSlice";

const SetPassword = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [setPassword, { isLoading, isError, error, isSuccess }] = useSetPasswordMutation();
    const [setStatus, { isStatusLoading, isStatusError, statuserror, isStatusSuccess }] = useSetStatusMutation();
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [serverError, setServerError] = useState(null);

    useEffect(() => {
  
        if (token) {


            setTimeout(async () => {

                try {
                    await setStatus({ token: token, status:"password not set" }).unwrap();

                } catch (err) {
                    setServerError(err.data?.message || "Something went wrong!");
                }
            }, 300000);
        }
        
    }, [token]);

    const onSubmit = async (data) => {
        if (!token) {
            setServerError("Invalid or missing token.");
            return;
        }

        try {
            await setPassword({ token, password: data.password }).unwrap();
            router.push("/auth/login");
        } catch (err) {
            setServerError(err.data?.message || "Something went wrong!");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center text-blue-600">Set New Password</h2>
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

                    {/* Error Messages */}
                    {serverError && <p className="text-red-500 text-center mt-3">{serverError}</p>}
                    {isError && <p className="text-red-500 text-center mt-3">{error?.data?.message || "Error setting password"}</p>}
                    {isSuccess && <p className="text-green-500 text-center mt-3">Password set successfully!</p>}

                    {/* Submit Button */}
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 mt-4 rounded-md" disabled={isLoading}>
                        {isLoading ? "Setting Password..." : "Set Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetPassword;
