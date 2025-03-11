"use client"

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl:
            //  "http://localhost:5000/api", 
            "https://adminpanel-ooix.onrender.com/api",
        credentials: "include",
    }),
    tagTypes: ["User", "Admin", "Trainer"],
    endpoints: (builder) => ({

        register: builder.mutation({
            query: (credentials) => ({
                url: '/auth/register',
                method: 'POST',
                body: credentials,
            }),
        }),

        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
                credentials: "include",
            }),
        }),

        logout: builder.mutation({
            query: (credentials) => ({
                url: '/auth/logout',
                method: 'POST',
                credentials: "include",
            }),
        }),

        authAdmin: builder.query({
            query: () => "/dashboard",
        }),

        addUser: builder.mutation({
            query: (credentials) => ({
                url: '/dashboard/add-user',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ["User", "Admin", "Trainer"]
        }),

        getCurrentUser: builder.query({
            query: () => `/dashboard/get-current-user`,
        }),

        getUsers: builder.query({
            query: ({ page, pageSize, id = "", status = "", search = "" } = {}) => search ? `/dashboard/get-users?id=${id}&search=${search}&page=${page}&pageSize=${pageSize}&status=${status}` : `/dashboard/get-users?id=${id}&page=${page}&pageSize=${pageSize}&status=${status}`,
            transformResponse: (response) => ({
                users: response.data.Users,
                total: response.data.total,
            }),

            providesTags: ["User"], // Marks this query with "User" tag
        }),

        getTrainers: builder.query({
            query: ({ page, pageSize, id = "", status = "", search = "" } = {}) => search ? `/dashboard/get-trainers?id=${id}&search=${search}&page=${page}&pageSize=${pageSize}&status=${status}` : `/dashboard/get-trainers?id=${id}&page=${page}&pageSize=${pageSize}&status=${status}`,
            transformResponse: (response) => ({
                trainers: response.data.Trainers,
                total: response.data.total,
            }),

            providesTags: ["Trainer"], // Marks this query with "User" tag
        }),

        getAdmins: builder.query({
            query: ({ page, pageSize, id = "", status = "", search = "" } = {}) => search ? `/dashboard/get-admins?id=${id}&search=${search}&page=${page}&pageSize=${pageSize}&status=${status}` : `/dashboard/get-admins?id=${id}&page=${page}&pageSize=${pageSize}&status=${status}`,
            transformResponse: (response) => ({
                admins: response.data.Admins,
                total: response.data.total,
            }),

            providesTags: ["Admin"], // Marks this query with "User" tag
        }),

        deleteUser: builder.mutation({
            query: ({ id }) => ({
                url: `/dashboard/delete-user/${id}`,
                method: 'DELETE',

            }),
            invalidatesTags: ["User", "Admin", "Trainer"], // Invalidates the "User" tag to refetch data
        }),

        updateUser: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/dashboard/update-user/${id}`,
                method: 'PATCH',
                body: patch,
                credentials: "include",
            }),
            async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
                try {
                    const { data: updatedUser } = await queryFulfilled;


                    dispatch(apiSlice.util.updateQueryData('getUsers', undefined, (draft) => {
                        console.log("Draft state:", draft); // Debugging

                        if (!Array.isArray(draft)) return;

                        const userIndex = draft.findIndex((user) => user.id === id);
                        if (userIndex !== -1) {
                            draft[userIndex] = { ...draft[userIndex], ...updatedUser };
                        }
                    }));



                } catch (error) {
                    console.error("Failed to update user:", error);
                }
            },
            invalidatesTags: ['User', "Admin", "Trainer"],
        }),

        sendMail: builder.mutation({
            query: (credentials) => ({
                url: '/auth/send-verification-email',
                method: 'POST',
                body: credentials,
                credentials: "include",
            }),
        }),

        acceptInvitation: builder.mutation({
            query: ({ token }) => ({
                url: "/auth/accept-invitation",
                method: "POST",
                body: { token },
            }),
        }),

        setPassword: builder.mutation({
            query: ({ token, password }) => ({
                url: "/auth/set-password",
                method: "PATCH",
                body: { token, password },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }),
        }),

        forgotPassword: builder.mutation({
            query: (email) => ({
                url: "/mail/forgot-password",
                method: "POST",
                body: email,
            }),
        }),

        resetPassword: builder.mutation({
            query: (data) => ({
                url: "/mail/reset-password",
                method: "POST",
                body: data,
            }),
        }),

        setStatus: builder.mutation({
            query: ({ token, status }) => ({
                url: "/auth/set-status",
                method: "PATCH",
                body: { token, status },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }),
        }),

    })
});

export const { useLoginMutation,
    useLogoutMutation,
    useRegisterMutation,
    useAuthAdminQuery,
    useAddUserMutation,
    useGetUsersQuery,
    useDeleteUserMutation,
    useUpdateUserMutation,
    useGetCurrentUserQuery,
    useGetTrainersQuery,
    useGetAdminsQuery,
    useSendMailMutation,
    useSetPasswordMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useAcceptInvitationMutation,
    useSetStatusMutation,

} = apiSlice