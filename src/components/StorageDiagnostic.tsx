import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface LogMessage {
  text: string;
  type: 'info' | 'success' | 'error';
  timestamp: Date;
}

const StorageDiagnostic: React.FC = () => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (text: string, type: 'info' | 'success' | 'error') => {
    setLogs(prev => [...prev, { text, type, timestamp: new Date() }]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setLogs([]);
    setResult(null);
    setFileUrl(null);
    
    try {
      // Check if we can access the Supabase client
      addLog('Checking Supabase connection...', 'info');
      
      // Check if we can list buckets
      addLog('Listing storage buckets...', 'info');
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        addLog(`Error listing buckets: ${bucketError.message}`, 'error');
        setResult('error');
        return;
      }
      
      const bucketNames = buckets.map(b => b.name).join(', ');
      addLog(`Found buckets: ${bucketNames || 'none'}`, 'success');
      
      // Check or create public bucket
      const targetBucket = buckets.find(b => b.name === 'public');
      
      if (!targetBucket) {
        addLog('Bucket "public" not found, creating it...', 'info');
        const { error: createError } = await supabase.storage
          .createBucket('public', {
            public: true
          });
        
        if (createError) {
          addLog(`Error creating public bucket: ${createError.message}`, 'error');
          setResult('error');
          return;
        }
        
        addLog('Bucket "public" created successfully', 'success');
      } else {
        addLog('Bucket "public" already exists', 'success');
      }
      
      // Test upload a small file
      addLog('Testing file upload...', 'info');
      const testFile = new Blob(['test file content'], { type: 'text/plain' });
      const testFileName = `test-${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('public')
        .upload(`comment-images/${testFileName}`, testFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        addLog(`Error uploading test file: ${uploadError.message}`, 'error');
        setResult('error');
        return;
      }
      
      addLog(`Test file uploaded successfully: ${uploadData?.path}`, 'success');
      
      // Get the URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(`comment-images/${testFileName}`);
      
      setFileUrl(urlData.publicUrl);
      addLog(`File public URL: ${urlData.publicUrl}`, 'info');
      
      // Overall result
      addLog('All diagnostics passed successfully!', 'success');
      setResult('success');
    } catch (error: any) {
      addLog(`Unexpected error: ${error.message}`, 'error');
      setResult('error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleFileUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      addLog('No file selected', 'error');
      return;
    }
    
    addLog(`Uploading file: ${file.name} (${file.size} bytes)`, 'info');
    setIsRunning(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `manual-test-${Date.now()}.${fileExt}`;
      const filePath = `comment-images/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        addLog(`Error uploading file: ${error.message}`, 'error');
        return;
      }
      
      addLog(`File uploaded successfully: ${data?.path}`, 'success');
      
      // Get the URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
      
      setFileUrl(urlData.publicUrl);
      addLog(`File public URL: ${urlData.publicUrl}`, 'info');
    } catch (error: any) {
      addLog(`Unexpected error: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Storage Diagnostics</CardTitle>
        <CardDescription>Test Supabase storage functionality for image uploads</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                'Run Diagnostics'
              )}
            </Button>
            
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isRunning}
              >
                Test Manual Upload
              </Button>
            </div>
          </div>
          
          {result && (
            <Alert variant={result === 'success' ? 'default' : 'destructive'}>
              {result === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {result === 'success' ? 'Diagnostics Passed' : 'Diagnostics Failed'}
              </AlertTitle>
              <AlertDescription>
                {result === 'success' 
                  ? 'All storage tests completed successfully. File uploads should work correctly.' 
                  : 'Some tests failed. See logs for details.'}
              </AlertDescription>
            </Alert>
          )}
          
          {fileUrl && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Uploaded File:</h3>
              <img 
                src={fileUrl} 
                alt="Uploaded test file" 
                className="max-h-40 max-w-full rounded border border-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  {fileUrl}
                </a>
              </p>
            </div>
          )}
          
          <div className="border rounded-md p-4 h-80 overflow-y-auto bg-muted/50">
            <h3 className="text-sm font-medium mb-2">Diagnostic Logs:</h3>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Run diagnostics to see logs</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div key={index} className="flex text-sm">
                    <span className="text-xs text-muted-foreground w-16">
                      {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    {log.type === 'info' && <Info className="h-4 w-4 mr-2 text-blue-500" />}
                    {log.type === 'success' && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
                    {log.type === 'error' && <XCircle className="h-4 w-4 mr-2 text-red-500" />}
                    <span className={
                      log.type === 'error' 
                        ? 'text-red-600' 
                        : log.type === 'success' 
                          ? 'text-green-600' 
                          : 'text-gray-700'
                    }>
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex flex-col items-start">
        <h3 className="text-sm font-medium mb-1">Troubleshooting Tips:</h3>
        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
          <li>Make sure Supabase storage is enabled in your project</li>
          <li>Check that RLS policies allow anonymous uploads to the 'public' bucket</li>
          <li>Verify that the 'comment-images' directory has correct permissions</li>
          <li>Review browser console for additional error details</li>
        </ul>
      </CardFooter>
    </Card>
  );
};

export default StorageDiagnostic; 