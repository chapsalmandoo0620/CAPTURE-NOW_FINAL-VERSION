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

        // 3. Manual Cascade Deletion
        // We must rigorously delete all dependent rows to avoid Foreign Key violations.

        // A. Handle Meetups Hosted by User (Need to clear dependencies first)
        const { data: hostedMeetups } = await adminSupabase
            .from('meetups')
            .select('id')
            .eq('host_id', userId);

        const hostedMeetupIds = hostedMeetups?.map(m => m.id) || [];

        if (hostedMeetupIds.length > 0) {
            // Delete feedback on these meetups
            await adminSupabase.from('meetup_feedback').delete().in('meetup_id', hostedMeetupIds);
            // Delete participants in these meetups
            await adminSupabase.from('meetup_participants').delete().in('meetup_id', hostedMeetupIds);
        }

        // B. Handle User's Participation & Activity
        // Delete feedback created BY user
        await adminSupabase.from('meetup_feedback').delete().eq('reviewer_id', userId);
        // Delete feedback RECEIVED by user (star/manner)
        await adminSupabase.from('meetup_feedback').delete().or(`star_player_id.eq.${userId},manner_player_id.eq.${userId}`);

        // Delete participation in OTHER meetups
        await adminSupabase.from('meetup_participants').delete().eq('user_id', userId);

        // Delete meetups hosted by user (now safe)
        if (hostedMeetupIds.length > 0) {
            await adminSupabase.from('meetups').delete().in('id', hostedMeetupIds);
        }

        // C. General Content
        await adminSupabase.from('post_likes').delete().eq('user_id', userId);
        await adminSupabase.from('post_comments').delete().eq('user_id', userId);
        await adminSupabase.from('highlights').delete().eq('user_id', userId);

        // D. Social & Chat
        await adminSupabase.from('follows').delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`);
        await adminSupabase.from('messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
        // Conversations: checking constraint is tricky, but try deleting involving user
        await adminSupabase.from('conversations').delete().or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

        // 4. Delete Profile Data (Database)
        const { error: dbError } = await adminSupabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (dbError) {
            console.error('Database deletion error:', dbError);
            return NextResponse.json({ error: `Database error deleting user: ${dbError.message}` }, { status: 500 });
        }

        // 5. Delete Auth User (Authentication)
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
