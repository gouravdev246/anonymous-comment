import { supabase } from './src/integrations/supabase/client';

async function updateSchema() {
  console.log('Starting schema update...');
  
  try {
    // Add image_url column to comments table if it doesn't exist
    console.log('Adding image_url column...');
    const { error: columnError } = await supabase.rpc('add_image_column');
    
    if (columnError) {
      // If RPC doesn't exist, try a raw SQL query
      console.log('RPC not available, trying raw query...');
      const { error: rawError } = await supabase.rpc('execute_sql', {
        sql: 'ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS image_url TEXT;'
      });
      
      if (rawError) {
        console.error('Error adding column:', rawError);
        return;
      }
    }
    
    console.log('Column added successfully');
    
    // Check if storage is properly configured
    console.log('Checking storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return;
    }
    
    const publicBucket = buckets.find(b => b.name === 'public');
    
    if (!publicBucket) {
      console.log('Creating public bucket...');
      const { error: createError } = await supabase.storage.createBucket('public', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return;
      }
    } else {
      console.log('Public bucket already exists');
    }
    
    console.log('Schema update completed successfully!');
  } catch (error) {
    console.error('Unexpected error during schema update:', error);
  }
}

updateSchema().catch(console.error); 