'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Upload, Check, Loader2 } from 'lucide-react';

interface AnalysisResult {
  match_percentage?: number;
  missing_skills?: string[];
  strengths?: string[];
  recommendations?: string[];
  // Add other specific properties your API returns
}

interface AnalysisStatus {
  status: 'processing' | 'completed' | 'error';
  result?: AnalysisResult;
  error_message?: string;
}

export function ResumeScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const router = useRouter();

  const pollAnalysisStatus = async (id: string, attempts = 0): Promise<void> => {
    const MAX_ATTEMPTS = 30; // 1 minute maximum (2s * 30)

    if (attempts >= MAX_ATTEMPTS) {
      setError('Analysis timed out. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/status/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AnalysisStatus = await response.json();

      switch (data.status) {
        case 'completed':
          if (data.result) {
            setLoading(false);
            try {
              sessionStorage.setItem('analysisResult', JSON.stringify(data.result));
              router.push('/dashboard');
            } catch (err) {
              console.error('Failed to save to session storage:', err);
              setError('Failed to save analysis results');
            }
          }
          break;
        case 'error':
          throw new Error(data.error_message || 'Analysis failed');
        case 'processing':
          setProgress((oldProgress) => Math.min(oldProgress + 5, 90));
          setTimeout(() => pollAnalysisStatus(id, attempts + 1), 2000);
          break;
      }
    } catch (err) {
      console.error('Polling error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!file || !jobDescription) {
      setError('Please provide both resume and job description');
      return;
    }
    
    setLoading(true);
    setError('');
    setProgress(10);
    
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.job_id) {
        setProgress(30);
        pollAnalysisStatus(data.job_id);
      } else {
        throw new Error('No job ID received from server');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      setLoading(false);
      setProgress(0);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a PDF file');
      setFile(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">JobMatch Analyzer</CardTitle>
          <CardDescription className="text-center">
            Upload your resume and paste the job description to get personalized insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resume-upload">Upload Resume (PDF)</Label>
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('resume-upload')?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload a PDF version of your resume</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {file && (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" /> {file.name}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                className="min-h-[200px] max-h-[400px] overflow-y-auto resize-none"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Resume'
              )}
            </Button>
            {loading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {progress < 30 
                    ? "Starting analysis..."
                    : "Analyzing your resume... This may take a few moments."}
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
