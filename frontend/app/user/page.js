
"use client";
import UserDash from "@/app/components/UserDash"
import { useAuthAdminQuery, useGetCurrentUserQuery } from "@/app/redux/services/apiSlice";
import { Box, Typography } from "@mui/material";
import React from "react";

const Dashboard = () => {

  const { data: authAdmin, error: autherror, isLoading: authLoading } = useAuthAdminQuery();
  const { data: currentUserdata, error: curUser, isLoading: curUseLoading } = useGetCurrentUserQuery();

  console.log(currentUserdata?.data);

  if (authLoading) return <Typography>Loading...</Typography>;

  if (autherror) return <Typography>Error: {autherror.data?.message || "Something went wrong"}</Typography>;

  return (

    <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <UserDash role={authAdmin.data?.role} name={currentUserdata?.data.username} />
    </Box>
  );
};

export default Dashboard;
