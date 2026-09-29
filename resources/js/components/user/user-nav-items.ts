import type { InertiaLinkProps } from '@inertiajs/react';
import {
    GraduationCap,
    LayoutGrid,
    type LucideIcon,
    Trophy,
} from 'lucide-react';
import { dashboard } from '@/routes';
import { index as attemptsIndex } from '@/routes/attempts';
import { index as quizzesIndex } from '@/routes/quizzes';

export const APP_BRAND = 'QuizHub';

export type UserNavItem = {
    title: string;
    /** A `null` href marks a destination whose route does not exist yet. */
    href: NonNullable<InertiaLinkProps['href']> | null;
    icon: LucideIcon;
};

export function userNavItems(teamSlug?: string | null): UserNavItem[] {
    return [
        {
            title: 'Dashboard',
            href: teamSlug ? dashboard(teamSlug) : null,
            icon: LayoutGrid,
        },
        {
            title: 'Quizzes',
            href: quizzesIndex(),
            icon: GraduationCap,
        },
        {
            title: 'My Attempts',
            href: attemptsIndex(),
            icon: Trophy,
        },
    ];
}
