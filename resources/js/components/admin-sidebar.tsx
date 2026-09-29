import { Link, usePage } from '@inertiajs/react';
import {
    ChartColumn,
    CircleHelp,
    ClipboardCheck,
    ClipboardList,
    Download,
    LayoutGrid,
    LineChart,
    Shield,
    Tags,
    TrendingUp,
    Users,
} from 'lucide-react';
import { AdminNavUser } from '@/components/admin-nav-user';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, reports } from '@/routes/admin';
import { index as attemptsIndex } from '@/routes/admin/attempts';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as exportReportsIndex } from '@/routes/admin/export-reports';
import { index as questionsIndex } from '@/routes/admin/questions';
import { index as quizPerformanceIndex } from '@/routes/admin/quiz-performance';
import { index as quizzesIndex } from '@/routes/admin/quizzes';
import { index as userPerformanceIndex } from '@/routes/admin/user-performance';
import { index as usersIndex } from '@/routes/admin/users';
import type { NavItem } from '@/types';

export function AdminSidebar() {
    const { name } = usePage().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Users',
            href: usersIndex(),
            icon: Users,
        },
        {
            title: 'Categories',
            href: categoriesIndex(),
            icon: Tags,
        },
        {
            title: 'Question Bank',
            href: questionsIndex(),
            icon: CircleHelp,
        },
        {
            title: 'Quizzes',
            href: quizzesIndex(),
            icon: ClipboardList,
        },
        {
            title: 'Quiz Attempts',
            href: attemptsIndex(),
            icon: ClipboardCheck,
        },
        {
            title: 'Reports & Analytics',
            href: reports(),
            icon: ChartColumn,
        },
        {
            title: 'User Performance',
            href: userPerformanceIndex(),
            icon: TrendingUp,
        },
        {
            title: 'Quiz Performance',
            href: quizPerformanceIndex(),
            icon: LineChart,
        },
        {
            title: 'Export Reports',
            href: exportReportsIndex(),
            icon: Download,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Shield className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        Admin Panel
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {name as string}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <AdminNavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
