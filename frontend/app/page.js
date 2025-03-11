"use client"

import { Box, Button, Link, Typography } from "@mui/material"

export default function App() {

  return (
    <Box className="w-full h-screen flex justify-center items-center">
      <Box className="">
        <Typography className="font-semibold text-2xl p-4">
          Welcome to Landing page
        </Typography>
        <Box className="flex justify-between">
          <Button variant="contained" href="/auth/login">
            Login
          </Button>
          <Button variant="contained" href="/auth/register">
            signUp
          </Button>
        </Box>
      </Box>


    </Box>
  )
}