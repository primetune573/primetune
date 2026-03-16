const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
    console.log('🌱 Seeding sample services...');

    const samples = [
        {
            name: 'Premium Oil Change',
            description: 'Premium engine oil replacement and filter change using high-quality synthetic oil.',
            price: 8500,
            duration_hours: 1,
            category: 'Maintenance',
            image_url: 'https://images.unsplash.com/photo-1589149098258-3e9102ca9333?q=80&w=800&auto=format&fit=crop',
            is_emergency: false,
            included_items: ['Synthetic Oil', 'Oil Filter', 'Fluid Level Check', 'Engine Cleanup']
        },
        {
            name: 'Tire Rotation & Balancing',
            description: 'Extend the life of your tires with precision rotation and electronic balancing.',
            price: 5000,
            duration_hours: 1,
            category: 'Maintenance',
            image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=800&auto=format&fit=crop',
            is_emergency: false,
            included_items: ['4-Wheel Rotation', 'Digital Balancing', 'Tire Pressure Check']
        },
        {
            name: 'Full Interior Detailing',
            description: 'Deep sanitary cleaning of seats, carpets, and dashboard to restore that factory-fresh feel.',
            price: 12000,
            duration_hours: 3,
            category: 'Cleaning',
            image_url: 'https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=800&auto=format&fit=crop',
            is_emergency: false,
            included_items: ['Deep Vacuuming', 'Steam Cleaning', 'Leather Conditioning', 'Odor Neutralizer']
        },
        {
            name: 'Showroom Shine Polish',
            description: 'Restore your car showroom shine with a multi-stage machine polish and wax coating.',
            price: 10000,
            duration_hours: 2,
            category: 'Cleaning',
            image_url: 'https://images.unsplash.com/photo-1552933529-e359b24772fe?q=80&w=800&auto=format&fit=crop',
            is_emergency: false,
            included_items: ['Pressure Wash', 'Clay Bar Treatment', 'Machine Polish', 'Carnauba Wax']
        }
    ];

    for (const s of samples) {
        const { error } = await supabase.from('services').upsert(s, { onConflict: 'name' });
        if (error) console.error(`Error seeding ${s.name}:`, error.message);
        else console.log(`✅ Seeded: ${s.name}`);
    }

    console.log('\n✨ Seeding Complete!');
}

seed();
