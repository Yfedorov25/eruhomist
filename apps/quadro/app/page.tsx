import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

// Bare "/" -> default locale. (No locale-detection middleware: UK is the audience.)
export default function RootIndex() {
  redirect(`/${defaultLocale}`);
}
