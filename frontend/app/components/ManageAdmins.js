"use client"
import { Box,  Typography } from '@mui/material'
import React from 'react'
import AddAdmin from './AddAdmin';
import AdminTable from './AdminTable';

const ManageAdmins = (props) => {
  

    return (

        <Box className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
            {/* Header Section */}
            <Box className="col-span-1 md:col-span-12 flex flex-col md:flex-row justify-between items-center px-4 md:px-6 relative">
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Manage Admins
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      admins under {props.name}
                    </Typography>
                </Box>
                <Box className="mt-3 md:mt-0">
                    
                    <AddAdmin />
                </Box>
            </Box>

            {/* User Table Section */}
            <Box className="col-span-1 md:col-span-12 p-4">
              
                <AdminTable id={props.id} />
            </Box>
        </Box>

    );
}

export default ManageAdmins
