import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
    // 1. Verify User Session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Init Admin Client (Service Role)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        const userId = user.id;

        // 3. Delete Profile Data (Database)
        // Ideally handled by CASCADE, but explicit delete safeguards against orphan rows if constraints are missing.
        // We delete from 'users' table using the admin client to bypass RLS potentially (though user can delete own).
        // Using admin client ensures it works regardless of RLS policies for simple user deletion.
        const { error: dbError } = await adminSupabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (dbError) {
            console.error('Database deletion error:', dbError);
            // Non-blocking? If profile delete fails, might not want to delete Auth.
            // But let's assume we want to force delete.
        }

        // 4. Delete Auth User (Authentication)
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error('Auth deletion error:', deleteError);
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Account deleted successfully' });

    } catch (error: any) {
        console.error('Server error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
