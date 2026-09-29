import Swal from 'sweetalert2';

const darkSwalOptions = {
    background: '#171717',
    color: '#fafafa',
    iconColor: '#f59e0b',
    cancelButtonColor: '#374151',
};

export async function confirmDelete(): Promise<boolean> {
    const result = await Swal.fire({
        ...darkSwalOptions,
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
    });

    return result.isConfirmed;
}

export async function confirmAction(options: {
    title: string;
    text?: string;
    html?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmButtonColor?: string;
}): Promise<boolean> {
    const result = await Swal.fire({
        ...darkSwalOptions,
        title: options.title,
        text: options.text,
        html: options.html,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: options.confirmButtonText ?? 'Confirm',
        cancelButtonText: options.cancelButtonText ?? 'Cancel',
        confirmButtonColor: options.confirmButtonColor ?? '#2563eb',
    });

    return result.isConfirmed;
}

/** @deprecated Use confirmDelete instead */
export const confirmDeleteUser = confirmDelete;
