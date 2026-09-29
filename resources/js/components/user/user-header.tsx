import { Link, router, usePage } from '@inertiajs/react';
import {
    BrainCircuit,
    ChevronDown,
    LogOut,
    Menu,
    Trophy,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserInfo } from '@/components/user-info';
import {
    APP_BRAND,
    type UserNavItem,
    userNavItems,
} from '@/components/user/user-nav-items';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { index as attemptsIndex } from '@/routes/attempts';
import { edit as editProfile } from '@/routes/profile';

function SoonBadge() {
    return (
        <Badge
            variant="secondary"
            className="px-1.5 py-0 text-[10px] font-medium tracking-wide uppercase"
        >
            Soon
        </Badge>
    );
}

function BrandLogo({ href }: { href: UserNavItem['href'] }) {
    const brand = (
        <>
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <BrainCircuit className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
                {APP_BRAND}
            </span>
        </>
    );

    if (!href) {
        return <span className="flex items-center gap-2.5">{brand}</span>;
    }

    return (
        <Link href={href} className="flex items-center gap-2.5" prefetch>
            {brand}
        </Link>
    );
}

export function UserHeader() {
    const { auth, currentTeam } = usePage().props;
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();
    const cleanup = useMobileNavigation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = userNavItems(currentTeam?.slug);
    const dashboardHref = navItems[0].href;
    const user = auth.user;

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <header className="sticky top-0 z-50 border-b border-border/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:bg-neutral-950/90 dark:supports-[backdrop-filter]:bg-neutral-950/75">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
                <BrandLogo href={dashboardHref} />

                <nav className="mx-auto hidden items-center gap-1 lg:flex">
                    {navItems.map((item) =>
                        item.href ? (
                            <Link
                                key={item.title}
                                href={item.href}
                                prefetch
                                className={cn(
                                    'rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                                    isCurrentUrl(item.href) &&
                                        'bg-accent text-foreground',
                                )}
                                aria-current={
                                    isCurrentUrl(item.href) ? 'page' : undefined
                                }
                            >
                                {item.title}
                            </Link>
                        ) : (
                            <span
                                key={item.title}
                                className="flex cursor-not-allowed items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/60"
                            >
                                {item.title}
                                <SoonBadge />
                            </span>
                        ),
                    )}
                </nav>

                <div className="ml-auto flex items-center gap-1 lg:ml-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-auto gap-2 px-2 py-1.5"
                                data-test="user-menu-button"
                            >
                                <Avatar className="size-8 rounded-full">
                                    {user.avatar ? (
                                        <AvatarImage
                                            src={user.avatar}
                                            alt={user.name}
                                        />
                                    ) : null}
                                    <AvatarFallback className="rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
                                    {user.name}
                                </span>
                                <ChevronDown className="size-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <UserInfo user={user} showEmail />
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link
                                    href={editProfile()}
                                    className="block w-full cursor-pointer"
                                    onClick={cleanup}
                                    prefetch
                                >
                                    <User className="mr-2" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    href={attemptsIndex()}
                                    className="block w-full cursor-pointer"
                                    onClick={cleanup}
                                    prefetch
                                >
                                    <Trophy className="mr-2" />
                                    My Attempts
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link
                                    href={logout()}
                                    as="button"
                                    className="block w-full cursor-pointer"
                                    onClick={handleLogout}
                                    data-test="logout-button"
                                >
                                    <LogOut className="mr-2" />
                                    Log out
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Sheet
                        open={mobileMenuOpen}
                        onOpenChange={setMobileMenuOpen}
                    >
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                                aria-label="Open menu"
                                data-test="user-mobile-menu-button"
                            >
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-72 p-0">
                            <SheetHeader className="border-b">
                                <SheetTitle className="text-left">
                                    {APP_BRAND}
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-1 p-3">
                                {navItems.map((item) => {
                                    const Icon = item.icon;

                                    if (!item.href) {
                                        return (
                                            <span
                                                key={item.title}
                                                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/60"
                                            >
                                                <Icon className="size-4" />
                                                {item.title}
                                                <SoonBadge />
                                            </span>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            prefetch
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                                                isCurrentUrl(item.href) &&
                                                    'bg-accent text-foreground',
                                            )}
                                        >
                                            <Icon className="size-4" />
                                            {item.title}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
