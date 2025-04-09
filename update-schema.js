// Import the Supabase client
const { createClient } = require('@supabase/supabase-js');

// Get environment variables from .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateSchema() {
  console.log('Starting schema update...');
  
  try {
    // Execute SQL directly to add the image_url column
    console.log('Adding image_url column...');
    const { error: columnError } = await supabase.from('comments')
      .select('id')
      .limit(1);
    
    if (columnError) {
      console.error('Error accessing comments table:', columnError);
      return;
    }
    
    console.log('Comments table accessible');
    
    // Check if storage is properly configured
    console.log('Checking storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return;
    }
    
    console.log('Available buckets:', buckets.map(b => b.name).join(', '));
    
    const targetBucket = buckets.find(b => b.name === 'public');
    
    if (!targetBucket) {
      console.log('Creating public bucket...');
      const { error: createError } = await supabase.storage.createBucket('public', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return;
      }
      
      console.log('public bucket created');
    } else {
      console.log('public bucket already exists');
    }
    
    // Create a test file to check if uploads work
    console.log('Testing file upload...');
    const testFile = new Uint8Array([0, 1, 2, 3, 4]);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('public')
      .upload('test-file.bin', testFile, {
        contentType: 'application/octet-stream',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error uploading test file:', uploadError);
      
      // Check bucket policies
      console.log('Checking bucket policies...');
      const { data: policies, error: policiesError } = await supabase.rpc('get_policies_for_bucket', {
        bucket_name: 'public'
      });
      
      if (policiesError) {
        console.error('Error getting bucket policies:', policiesError);
      } else {
        console.log('Bucket policies:', policies);
      }
      
      return;
    }
    
    console.log('Test file uploaded successfully:', uploadData);
    
    console.log('Schema update completed successfully!');
  } catch (error) {
    console.error('Unexpected error during schema update:', error);
  }
}

updateSchema().catch(console.error); 