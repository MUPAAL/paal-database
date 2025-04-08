"use client";

import { Button } from "./Button_S";
import { useAuth } from "./AuthProvider";

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Button 
      variant="secondary" 
      onClick={logout}
      className="w-full"
    >
      Logout
    </Button>
  );
}
