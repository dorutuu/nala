"use client";
import { Sidebar } from "@/components/sidebar";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 ">{children}</div>
    </div>
  );
}
