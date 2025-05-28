"use client";

import { LogoutButton } from "./logout-button";

type HeaderProps = {
  username: string;
  userRole: string;
};

export function Header({ username, userRole }: HeaderProps) {
  return (
    <header className="p-4 flex justify-between items-center border-b">
      <div>
        <p className="text-sm text-muted-foreground">Logged in as {username}</p>
        <p className="text-sm font-medium">{userRole}</p>
      </div>
      <LogoutButton />
    </header>
  );
}
