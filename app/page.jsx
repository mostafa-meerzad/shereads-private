import { requireUser } from "@/lib/serverAuth";
import Welcome from "@/components/pages/Welcome";

export default function HomePage() {
  // Server-side: redirect to /login if not authenticated
  requireUser();

  return (
    <div>
      <Welcome />
    </div>
  );
  
};
