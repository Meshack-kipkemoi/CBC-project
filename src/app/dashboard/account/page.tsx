import { AccountPage } from "@/sections/account/account";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountsPage() {
  return <AccountPage />;
}
