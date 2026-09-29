import type { ReactNode } from 'react';
import { UserHeader } from '@/components/user/user-header';

export default function UserLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-neutral-50 dark:bg-neutral-950">
            <UserHeader />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {children}
            </main>
        </div>
    );
}
