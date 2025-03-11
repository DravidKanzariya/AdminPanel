"use client"
import { Box, Typography } from '@mui/material'
import React from 'react'
import TrainerTable from './TrainerTable';

const ManageTrainersLayout = (props) => {

    return (

        <Box className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
           
            <Box className="col-span-1 md:col-span-12 flex flex-col md:flex-row justify-between items-center px-4 md:px-6 relative">
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Manage Trainers
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                       Trainers under {props.id}
                    </Typography>
                </Box>
               
            </Box>
          
            <Box className="col-span-1 md:col-span-12 p-4">
                <TrainerTable id={props.id} />
            </Box>
        </Box>

    );
}

export default ManageTrainersLayout
