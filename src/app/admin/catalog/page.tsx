import { redirect } from "next/navigation";

export default function AdminCatalogRedirectPage() {
  redirect("/admin/addons");
}
