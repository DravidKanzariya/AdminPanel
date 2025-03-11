import { Suspense } from "react";
import SetPassword from "./set-password";

export default function AuthPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SetPassword />
    </Suspense>
  );
}
