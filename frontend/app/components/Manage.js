"use client";
import ManageTrainersLayout from "./ManageTrainerLayout";
import ManageUsersLayout from "./ManageUserLayout";
import { Box } from "@mui/system";

export default function Manage(props) {    
    return (
    <Box>
        {
            props.manage === "trainers"? <ManageTrainersLayout id={props.id}/> : <ManageUsersLayout id={props.id}/>
        }
    </Box>
    );
}
