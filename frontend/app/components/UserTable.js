"use client"
import * as React from "react";
import {
    Box, CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    InputBase,

} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { useState, useEffect } from "react";
import { useGetUsersQuery } from "../redux/services/apiSlice";
import EditUser from "./EditUser";
import DeleteUser from "./DeleteUser";
import { usePathname, useRouter } from "next/navigation";

export default function UserTable(props) {
    const router = useRouter();
    const pathname = usePathname();
    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState("all")
    const [search, setSearch] = useState("")

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const [queryPayload, setQueryPayload] = useState({
        ...paginationModel, status, id: props.id
    });

    const { data: userdata, error, isLoading: dataLoading } = useGetUsersQuery(queryPayload);


    useEffect(() => {
        if (userdata) {
            if (Array.isArray(userdata?.users)) {
                const formattedUsers = userdata?.users.map((user, index) => ({
                    id: user._id,
                    srNo: index + 1,
                    username: user.username || "N/A",
                    email: user.email || "N/A",
                    role: user.role || "N/A",
                    registeredThrough: user.registeredThrough || "N/A",
                    status: user.status || "active",
                }));
                setUsers(formattedUsers);
            } else {
              
                console.log("Empty User List...1", userdata);

            }
        } else {
            setUsers();
            console.log("Empty User List...2", users);
        }
    }, [userdata]);

    useEffect(() => {
        setQueryPayload({
            ...paginationModel,
            status,
            search: search.length >= 2 ? search : undefined,
            id: props.id, 
        });
    }, [paginationModel, status, search, props.id]);
    
    const columns = [
        { field: "srNo", headerName: "Sr No.", minWidth: 70, flex: 0.5 },
        { field: "username", headerName: "Username", minWidth: 150, flex: 1 },
        { field: "email", headerName: "Email", minWidth: 200, flex: 1.2 },
        { field: "role", headerName: "Role", minWidth: 120, flex: 0.8 },
        { field: "registeredThrough", headerName: "Registered Via", minWidth: 150, flex: 1 },
        {
            field: "status",
            headerName: "Status",
            minWidth: 120,
            flex: 0.8,
            // renderCell: (params) => (
            //     <Switch
            //         checked={params.value === "active"}
            //         onChange={() => handleStatusToggle(params.row.id)}
            //         color="primary"
            //     />
            // ),
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 150,
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                    <EditUser
                        params={params}
                        sendData={getUpdate}
                    />
                    <DeleteUser
                        params={params}
                        sendData={getDelete}
                    />


                </Box>
            ),
        },
    ];

    const getDelete = (data) => {
        const updatedUsers = users.filter((user) => user.id !== data.id);
        setUsers(updatedUsers);
    };
    
    const getUpdate = (data) => {
        const updatedUsers = users.map((user) =>
            user.id === data.id ? data : user
        );
        setUsers(updatedUsers);
    };
    

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
    };

    const handleSearch = (event) => {

        setSearch(event.target.value)
    }

    return (

        <Box sx={{ width: "100%", p: 2 }}>
            {dataLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    {/* Filters and Search */}
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 2,
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 2,
                        }}
                    >
                        {/* Status Dropdown */}
                        <FormControl sx={{ minWidth: 100 }}>
                            <InputLabel id="status-label">Status</InputLabel>
                            <Select
                                labelId="status-label"
                                id="status-select"
                                value={status}
                                onChange={handleStatusChange}
                                autoWidth
                                label="Status"
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                                <MenuItem value="all">All</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Search Input */}
                        <Paper
                            component="form"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                width: { xs: "100%", sm: 400 },
                                flexGrow: 1,
                                p: "2px 4px",
                            }}
                        >
                            <InputBase
                                onChange={handleSearch}
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="Search..."
                                inputProps={{ "aria-label": "search" }}
                            />
                        </Paper>
                    </Box>

                    {/* Data Grid */}
                    <Box sx={{ width: "100%" }}>
                        {!error ? (
                            <DataGrid
                                rows={users || []}
                                columns={columns}
                                loading={dataLoading}
                                paginationMode="server"
                                rowCount={userdata?.total || 0}
                                pageSizeOptions={[0, 5, 10, 20, 25]}
                                paginationModel={paginationModel}
                                onPaginationModelChange={setPaginationModel}
                                className=" overflow-scroll"
                                sx={{
                                    "& .MuiDataGrid-root": { overflowX: "auto" },
                                    maxHeight: 490
                                }}
                            />
                        ) : (
                            <DataGrid
                                rows={[]}
                                columns={columns}
                                loading={dataLoading}
                                paginationMode="server"
                                rowCount={0}
                                pageSizeOptions={[0, 5, 10, 20, 25]}
                                paginationModel={{ page: 0, pageSize: 0 }}
                            />
                        )}
                    </Box>
                </Box>
            )}
        </Box>

    );
}
