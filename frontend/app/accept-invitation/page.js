"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAcceptInvitationMutation } from "../redux/services/apiSlice";

export default function AcceptInvitation() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token"); // Get token from URL
    const [acceptInvitation] = useAcceptInvitationMutation();

    useEffect(() => {
        // console.log("Received token:", token); // Debugging
        if (token) {
            acceptInvitation({ token })
                .unwrap()
                .then((response) => {
                    console.log("Success response:", response); // Debugging
                    router.push(response.redirectTo || `/set-password?token=${token}`);
                })
                .catch((error) => {
                    console.error("Error in accept invitation:", error); // Debugging
                     router.push("/expired-link");
                });
        }
    }, [token]);
    
    return <p>Processing...</p>;
}
