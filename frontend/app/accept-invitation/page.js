import { Suspense } from "react";
import AcceptInvitation from "./accept-invitation";

export default function AuthPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AcceptInvitation />
    </Suspense>
  );
}
