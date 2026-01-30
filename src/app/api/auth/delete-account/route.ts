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
    let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // Sanitize
    serviceRoleKey = serviceRoleKey.trim();
    anonKey = anonKey.trim();

    // Debugging (Safe Log)
    console.log(`[DeleteAccount] Using Service Key: ${serviceRoleKey.substring(0, 10)}...`);
    console.log(`[DeleteAccount] Using Anon Key: ${anonKey.substring(0, 10)}...`);

    if (!serviceRoleKey) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
        return NextResponse.json({ error: 'Server configuration error: Missing Service Key' }, { status: 500 });
    }

    // Safety Check: Did user copy the Anon key by mistake?
    // We check both exact match and simplistic length match if they are suspiciously similar
    if (serviceRoleKey === anonKey) {
        console.error('Configuration Error: SUPABASE_SERVICE_ROLE_KEY is same as ANON_KEY');
        return NextResponse.json({
            error: 'Configuration Error: You put the Public Anon Key into SUPABASE_SERVICE_ROLE_KEY. Please use the Service Role Secret (starts with ey... but different from Anon Key).'
        }, { status: 500 });
    }

    // Deep Inspection: Decode JWT to check role
    try {
        const payloadBase64 = serviceRoleKey.split('.')[1];
        if (!payloadBase64) {
            throw new Error('Invalid JWT format (no payload)');
        }

        const decodedJson = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
        console.log('[DeleteAccount] Service Key Role Claim:', decodedJson.role);

        if (decodedJson.role !== 'service_role') {
            console.error(`Configuration Error: Key has role '${decodedJson.role}', expected 'service_role'`);
            return NextResponse.json({
                error: `Configuration Error: The key you provided is for the '${decodedJson.role}' role. You MUST use the 'service_role' key (Secret) from Supabase settings.`
            }, { status: 500 });
        }
    } catch (e: any) {
        console.error('Failed to parse Service Key JWT:', e);
        return NextResponse.json({
            error: 'Configuration Error: Invalid Service Role Key format. Could not parse JWT.',
            details: e.message
        }, { status: 500 });
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

    // 3. Execution: Delete User via Admin API
    // Note: We rely on Database ON DELETE CASCADE constraints to clean up related data (meetups, messages, etc).
    // The user MUST run the `migration_cascade.sql` script for this to work without FK violations.

    try {
        const userId = user.id;
        console.log(`[DeleteAccount] Requesting deletion for user: ${userId}`);

        // 1. Delete Auth User (Triggers cascade to public.users -> meetups -> etc)
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error('[DeleteAccount] Auth deletion error:', deleteError);
            return NextResponse.json({
                error: `Failed to delete account. Cause: ${deleteError.message}`,
                details: deleteError
            }, { status: 500 });
        }

        console.log('[DeleteAccount] Success.');
        return NextResponse.json({ message: 'Account deleted successfully' });

    } catch (error: any) {
        console.error('[DeleteAccount] Unexpected Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
        }, { status: 500 });
    }
}
