import React from "react";
import { Loader2 } from "lucide-react";

export default function AdminDashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background w-full">
      <Loader2 className="h-10 w-10 text-danger animate-spin" />
    </div>
  );
}
