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
import { useGetAdminsQuery } from "../redux/services/apiSlice";
import EditUser from "./EditUser";
import DeleteUser from "./DeleteUser";
import { usePathname, useRouter } from "next/navigation";

export default function AdminTable(props) {
    const router = useRouter();
    const pathname = usePathname();
    const [admins, setAdmins] = useState([]);
    const [status, setStatus] = useState("all")
    const [search, setSearch] = useState("")

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const [queryPayload, setQueryPayload] = useState({
        ...paginationModel, status, id: props.id
    });

    const { data: adminData, error, isLoading: dataLoading } = useGetAdminsQuery(queryPayload);

    // console.log(adminData);

    // console.log(error.data.message);
    useEffect(() => {
        if (adminData) {
            if (Array.isArray(adminData?.admins)) {
                const formattedAdmins = adminData?.admins.map((user, index) => ({
                    id: user._id,
                    srNo: index + 1,
                    username: user.username || "N/A",
                    email: user.email || "N/A",
                    role: user.role || "N/A",
                    registeredThrough: user.registeredThrough || "N/A",
                    status: user.status,
                }));
                setAdmins(formattedAdmins);
            } else {
                // console.error("Expected an array but got:", adminData);
                // setAdmins();
                console.log("Empty admin List...1", adminData);

            }
        } else {
            setAdmins();
            console.log("Empty admin List...2", admins);
        }
    }, [adminData]);


    useEffect(() => {
        setQueryPayload({
            ...paginationModel,
            status,
            search: search.length >= 2 ? search : undefined,
            id: props.id, // Ensure id is always included
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
        const updatedUsers = admins.filter((user) => user.id !== data.id);
        setAdmins(updatedUsers);
    };

    const getUpdate = (data) => {
        const updatedUsers = admins.map((user) =>
            user.id === data.id ? data : user
        );
        setAdmins(updatedUsers);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
    };

    const handleSearch = (event) => {

        setSearch(event.target.value)
    }

    const handleRowClick = (params) => {
        console.log("parent id------------->", params.id);
        router.push(`${pathname}/${params.id}`);


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
                                rows={admins || []}
                                columns={columns}
                                loading={dataLoading}
                                paginationMode="server"
                                rowCount={adminData?.total || 0}
                                pageSizeOptions={[0, 5, 10, 20, 25]}
                                paginationModel={paginationModel}
                                onPaginationModelChange={setPaginationModel}
                                className=" overflow-scroll"
                                onRowDoubleClick={(params) => handleRowClick(params.row)}

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
