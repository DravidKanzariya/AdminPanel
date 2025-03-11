
"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuthAdminQuery, useLoginMutation } from "../redux/services/apiSlice";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const router = useRouter();

    const { data: authAdmin, error: authError, isLoading: authLoading, refetch } = useAuthAdminQuery();
    const [login, { isLoading, error }] = useLoginMutation();

    // Handle form submission
    const onSubmit = async (formData) => {
        try {
            await login(formData).unwrap();
            console.log("Login Successful");
            document.cookie && console.log("Cookies after login:", document.cookie);

            // Wait for authAdmin to be fetched
            refetch();
        } catch (err) {
            console.error("Login Failed:", err);
        }
    };

    // Redirect user when authAdmin updates
    useEffect(() => {
        if (authAdmin?.data?.role) {
            switch (authAdmin.data.role) {
                case "super-admin":
                    router.push("/super-admin");
                    break;
                case "admin":
                    router.push("/admin");
                    break;
                case "trainer":
                    router.push("/trainer");
                    break;
                case "user":
                    router.push("/user");
                    break;
                default:
                    router.push("/");
                    break;
            }
        }
    }, [authAdmin, router]);

    return (
        <Box className="flex justify-center items-center h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white p-6 rounded-lg shadow-md w-96"
            >
                <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>

                {error && (
                    <p className="text-red-500 text-center">
                        {error.data?.message || "An unexpected error occurred."}
                    </p>
                )}

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
                    <Box className="flex gap-2">

                        <Typography className="text-sm text-blue-500 cursor-pointer text-center mt-2"
                            onClick={() => router.push("/auth/forgot-password")}>
                            Forgot Password?
                        </Typography>
                    </Box>
                    <Box className="flex gap-2">

                        <Typography>Don't have an account?</Typography>
                        <Typography className="text-sm text-blue-500 cursor-pointer text-center mt-2"
                            onClick={() => router.push("/auth/register")}>
                            signUp
                        </Typography>
                    </Box>

                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </Box>

                <Button
                    type="submit"
                    className="w-full py-2 rounded-lg hover:bg-blue-600 hover:text-white transition"
                    disabled={isLoading}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </Button>
            </form>
        </Box>
    );
}
