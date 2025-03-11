"use client"

import { useForm } from "react-hook-form";
import { useRegisterMutation, useSendMailMutation, useUpdateUserMutation } from "@/app/redux/services/apiSlice";
import { Box } from "@mui/material";


export default function App() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [signup, { isLoading, error }] = useRegisterMutation();
    const [mailUser, { isMailLoading, mailError }] = useSendMailMutation();
    const [updateUser, { isLoading: updateLoading, error: updateError }] = useUpdateUserMutation();

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
            const response = await signup(formData).unwrap();
            // console.log("formdata-----", formData);
            console.log("registration Successful:", response);

            sendMail(response.data);

            if (response?.data._id) {
                statusUpdate(response.data._id);
            } else {
                console.error("User ID not found, cannot update status.");
            }

            window.location.href = "/auth/login";
        } catch (err) {
            console.error("registration Failed: Username not found", err);
        }
    };
    return (

        <Box className="flex justify-center items-center h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white p-6 rounded-lg shadow-md w-96"
            >
                <h2 className="text-2xl font-semibold text-center mb-4">SingUp</h2>

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
                    {isLoading ? "Processing..." : "SignUp"}
                </button>
            </form>
        </Box>
    );
}


