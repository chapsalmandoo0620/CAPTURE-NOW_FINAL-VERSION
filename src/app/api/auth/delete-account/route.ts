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
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!serviceRoleKey) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
        return NextResponse.json({ error: 'Server configuration error: Missing Service Key' }, { status: 500 });
    }

    // Safety Check: Did user copy the Anon key by mistake?
    if (serviceRoleKey === anonKey) {
        console.error('Configuration Error: SUPABASE_SERVICE_ROLE_KEY is same as ANON_KEY');
        return NextResponse.json({
            error: 'Configuration Error: You put the Public Anon Key into SUPABASE_SERVICE_ROLE_KEY. Please use the Service Role Secret (starts with ey... but different from Anon Key).'
        }, { status: 500 });
    }

    // Basic Format Check
    if (!serviceRoleKey.startsWith('eyJ')) {
        console.error('Configuration Error: SUPABASE_SERVICE_ROLE_KEY format invalid');
        return NextResponse.json({ error: 'Configuration Error: Invalid Service Role Key format. It should be a JWT starting with "eyJ".' }, { status: 500 });
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
        console.log(`Starting account deletion for user: ${userId}`);

        // Helper to check errors
        const checkError = (step: string, error: any) => {
            if (error) {
                console.error(`Error in step: ${step}`, error);
                throw new Error(`${step} failed: ${error.message}`);
            }
        };

        // 3. Manual Cascade Deletion (Robust ID-based)

        // A. Handle Meetups Hosted by User
        // We first need to delete everything ON these meetups.
        const { data: hostedMeetups, error: meetError } = await adminSupabase
            .from('meetups')
            .select('id')
            .eq('host_id', userId);
        checkError('Fetch Hosted Meetups', meetError);

        const hostedMeetupIds = hostedMeetups?.map(m => m.id) || [];
        console.log(`Found ${hostedMeetupIds.length} hosted meetups to clear.`);

        if (hostedMeetupIds.length > 0) {
            // Delete Feedback on hosted meetups
            const { error: fError } = await adminSupabase
                .from('meetup_feedback')
                .delete()
                .in('meetup_id', hostedMeetupIds);
            checkError('Delete Feedback on Hosted Meetups', fError);

            // Delete Participants on hosted meetups
            const { error: pError } = await adminSupabase
                .from('meetup_participants')
                .delete()
                .in('meetup_id', hostedMeetupIds);
            checkError('Delete Participants on Hosted Meetups', pError);

            // Delete the Meetups themselves
            const { error: mError } = await adminSupabase
                .from('meetups')
                .delete()
                .in('id', hostedMeetupIds);
            checkError('Delete Hosted Meetups', mError);
        }

        // B. Handle User's Personal Activity (Feedback, Participation, Content)

        // 1. Delete Feedback WRITTEN by user
        // Explicitly selecting to be sure
        const { error: writtenFeedbackError } = await adminSupabase
            .from('meetup_feedback')
            .delete()
            .eq('reviewer_id', userId);
        checkError('Delete Written Feedback', writtenFeedbackError);

        // 2. Delete Feedback RECEIVED (referenced as star/manner player)
        // This is crucial to avoid "not-null" violations if we are the star player
        // We do this in two passes to be safe
        const { error: receivedStarError } = await adminSupabase
            .from('meetup_feedback')
            .delete()
            .eq('star_player_id', userId);
        checkError('Delete Star Player Feedback', receivedStarError);

        const { error: receivedMannerError } = await adminSupabase
            .from('meetup_feedback')
            .delete()
            .eq('manner_player_id', userId);
        checkError('Delete Manner Player Feedback', receivedMannerError);

        // 3. Delete Meetup Participation (as a guest)
        const { error: participationError } = await adminSupabase
            .from('meetup_participants')
            .delete()
            .eq('user_id', userId);
        checkError('Delete Meetup Participation', participationError);

        // 4. Delete Social (Leads to FK violations in 'users' if not cleared)
        const { error: followsError1 } = await adminSupabase.from('follows').delete().eq('follower_id', userId);
        const { error: followsError2 } = await adminSupabase.from('follows').delete().eq('following_id', userId);
        checkError('Delete Follows 1', followsError1);
        checkError('Delete Follows 2', followsError2);

        // 5. Delete Content (Likes, Comments, Highlights)
        const { error: likesError } = await adminSupabase.from('post_likes').delete().eq('user_id', userId);
        checkError('Delete Likes', likesError);

        const { error: commentsError } = await adminSupabase.from('post_comments').delete().eq('user_id', userId);
        checkError('Delete Comments', commentsError);

        const { error: postsError } = await adminSupabase.from('highlights').delete().eq('user_id', userId);
        checkError('Delete Highlights', postsError);

        // 6. Delete Messages (Sender OR Receiver)
        // Note: Supabase likely doesn't cascade this well automatically.
        const { error: msgError } = await adminSupabase
            .from('messages')
            .delete()
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
        checkError('Delete Messages', msgError);

        const { error: convError } = await adminSupabase
            .from('conversations')
            .delete()
            .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
        checkError('Delete Conversations', convError);


        console.log('Dependencies cleared. Deleting User Profile...');

        // 4. Delete Profile Data (Database)
        const { error: dbError } = await adminSupabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (dbError) {
            console.error('Database deletion error (Final Step):', dbError);
            // This is the specific error user saw. Now we should benefit from previous cleanup.
            // If it still fails, the error message will be returned clearly.
            throw new Error(`Database delete failed: ${dbError.message} (Details: ${dbError.details})`);
        }

        // 5. Delete Auth User (Authentication)
        console.log('Profile deleted. Deleting Auth...');
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error('Auth deletion error:', deleteError);
            throw new Error(`Auth delete failed: ${deleteError.message}`);
        }

        return NextResponse.json({ message: 'Account deleted successfully' });

    } catch (error: any) {
        console.error('Delete Account Handler Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.details || 'Check server logs'
        }, { status: 500 });
    }
}
