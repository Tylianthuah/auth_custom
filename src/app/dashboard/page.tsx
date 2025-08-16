import { checkAuth } from "@/auth/nextjs/actions";
import { redirect } from "next/navigation";
import React from "react";

const Dashboard = async () => {
  let isAuthenticated = await checkAuth();
  if (!isAuthenticated) redirect("/sign-in");
  return <div>Dashboard page</div>;
};

export default Dashboard;
