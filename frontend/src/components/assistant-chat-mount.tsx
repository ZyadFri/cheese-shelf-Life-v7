"use client";

import { usePathname } from "next/navigation";

import { AssistantChat } from "@/components/assistant-chat";

export function AssistantChatMount() {
  const pathname = usePathname();
  if (pathname === "/app/project-guide") return null;
  return <AssistantChat />;
}
