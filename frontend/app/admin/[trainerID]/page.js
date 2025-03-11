
"use client";
import AdminDashLayout from "@/app/components/AdminDashLayout";
import { useAuthAdminQuery, useGetCurrentUserQuery } from "@/app/redux/services/apiSlice";
import { Box, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import React from "react";

const Dashboard = () => {
const params = useParams();
  const { data: authAdmin, error: autherror, isLoading: authLoading } = useAuthAdminQuery();
  const { data: currentUserdata, error: curUser, isLoading: curUseLoading } = useGetCurrentUserQuery();

  if (authLoading) return <Typography>Loading...</Typography>;

  if (autherror) return <Typography>Error: {autherror.data?.message || "Something went wrong"}</Typography>;

  return (

    <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AdminDashLayout
        role={authAdmin.data?.role}
        id={params.trainerID}
        name={currentUserdata?.data.username}
      />
    </Box>
  );
};

export default Dashboard;
