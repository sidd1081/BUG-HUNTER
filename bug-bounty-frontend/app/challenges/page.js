import { Suspense } from "react";
import Challenge from "./challenge";

export default function Page() {
  return (
    <Suspense>
      <Challenge />
    </Suspense>
  );
}
