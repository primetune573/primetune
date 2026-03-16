const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey || serviceRoleKey === 'YOUR_SUPABASE_SERVICE_ROLE_KEY') {
    console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function isUUID(uuid) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

async function migrate() {
    console.log('🚀 Starting Migration to Supabase...');

    // 1. Migrate Services
    console.log('\n--- Migrating Services ---');
    const servicesPath = path.join(process.cwd(), 'services.json');
    if (fs.existsSync(servicesPath)) {
        const services = JSON.parse(fs.readFileSync(servicesPath, 'utf-8'));
        for (const svc of services) {
            const data = {
                name: svc.name,
                description: svc.summary || '',
                price: svc.price,
                duration_hours: svc.duration_hours,
                category: svc.category,
                image_url: svc.image || '',
                is_emergency: svc.emergency || false,
                included_items: svc.included || [],
                created_at: svc.created_at || new Date().toISOString()
            };

            // Only include ID if it's a valid UUID
            if (svc.id && isUUID(svc.id)) {
                data.id = svc.id;
            }

            const { error } = await supabase.from('services').upsert(data, { onConflict: 'name' });
            if (error) console.error(`Error migrating service ${svc.name}:`, error.message);
            else console.log(`✅ Migrated service: ${svc.name}`);
        }
    }

    // 2. Migrate Availability Blocks
    console.log('\n--- Migrating Availability Blocks ---');
    const blocksPath = path.join(process.cwd(), 'availability_blocks.json');
    if (fs.existsSync(blocksPath)) {
        const blocks = JSON.parse(fs.readFileSync(blocksPath, 'utf-8'));

        // Holidays (Full Day)
        for (const b of blocks.holidays || []) {
            const { error } = await supabase.from('availability_blocks').insert({
                type: 'full-day',
                date: b.date,
                reason: b.reason,
                created_at: b.created_at || new Date().toISOString()
            });
            // Silently ignore duplicates for blocks (or handle)
            if (error && !error.message.includes('duplicate key')) {
                console.error(`Error migrating holiday ${b.date}:`, error.message);
            } else if (!error) {
                console.log(`✅ Migrated holiday: ${b.date}`);
            }
        }

        // Partial Blocks
        for (const b of blocks.blocked_slots || []) {
            const { error } = await supabase.from('availability_blocks').insert({
                type: 'partial',
                date: b.date,
                start_hour: b.start_hour,
                end_hour: b.end_hour,
                reason: b.reason,
                created_at: b.created_at || new Date().toISOString()
            });
            if (error && !error.message.includes('duplicate key')) {
                console.error(`Error migrating block ${b.date} ${b.start_hour}-${b.end_hour}:`, error.message);
            } else if (!error) {
                console.log(`✅ Migrated block: ${b.date} (${b.start_hour}:00 - ${b.end_hour}:00)`);
            }
        }
    }

    // 3. Migrate Bookings
    console.log('\n--- Migrating Bookings ---');
    const bookingsPath = path.join(process.cwd(), 'bookings_export.xlsx');
    if (fs.existsSync(bookingsPath)) {
        const buf = fs.readFileSync(bookingsPath);
        const wb = xlsx.read(buf, { type: 'buffer' });
        const ws = wb.Sheets['Bookings'];
        if (ws) {
            const records = xlsx.utils.sheet_to_json(ws);
            for (const r of records) {
                const status = (r['Status'] || 'pending').toLowerCase();

                const data = {
                    booking_number: r['Booking Number'],
                    customer_name: r['Customer'],
                    customer_phone: r['Phone'] ? String(r['Phone']) : '',
                    car_brand: r['Vehicle']?.split(' ')[1] || '',
                    car_model: r['Vehicle']?.split(' ')[2] || '',
                    car_year: r['Vehicle']?.split(' ')[0] || '',
                    service_names_snapshot: r['Services'] ? r['Services'].split(', ') : [],
                    total_price: parseFloat(r['Total Price']) || 0,
                    duration_hours: parseFloat(r['Duration (hrs)']) || 1,
                    booking_date: r['Date'],
                    booking_time: r['Time'],
                    status: status,
                    notes: r['Notes'] || '',
                    cancellation_reason: r['Cancellation Reason'] || '',
                    created_at: r['Created At'] || new Date().toISOString(),
                    updated_at: r['Updated At'] || new Date().toISOString()
                };

                const { error } = await supabase.from('bookings').upsert(data, { onConflict: 'booking_number' });
                if (error) console.error(`Error migrating booking ${r['Booking Number']}:`, error.message);
                else console.log(`✅ Migrated booking: ${r['Booking Number']}`);
            }
        }
    }

    console.log('\n✨ Migration Complete!');
}

migrate();
