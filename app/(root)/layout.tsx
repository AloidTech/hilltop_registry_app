import "../globals.css";
import { NavBarDeskt, NavBarMobile } from "@/components/NavBar";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative antialiased">
      <div className="md:fixed md:block top-0 left-0 h-full hidden z-50">
        <NavBarDeskt />
      </div>
      <div className="md:ml-12 md:pb-0 ml-0 pb-18">{children}</div>
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50">
        <NavBarMobile />
      </div>
    </div>
  );
}
