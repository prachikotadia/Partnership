import React, { useState, useEffect } from 'react';
import { supabaseTaskService } from '../services/supabaseTaskService';
import { supabaseNotesService } from '../services/supabaseNotesService';
import { supabaseFinanceService } from '../services/supabaseFinanceService';
import { supabaseScheduleService } from '../services/supabaseScheduleService';
import { supabaseBucketListService } from '../services/supabaseBucketListService';
import { supabaseEngagementService } from '../services/supabaseEngagementService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export const SupabaseServicesTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results: Record<string, string> = {};

    try {
      // Test Task Service
      try {
        const tasks = await supabaseTaskService.getTasks();
        results.tasks = `✅ ${tasks.length} tasks loaded`;
      } catch (error) {
        results.tasks = `❌ Error: ${error}`;
      }

      // Test Notes Service
      try {
        const notes = await supabaseNotesService.getNotes();
        results.notes = `✅ ${notes.length} notes loaded`;
      } catch (error) {
        results.notes = `❌ Error: ${error}`;
      }

      // Test Finance Service
      try {
        const entries = await supabaseFinanceService.getFinanceEntries();
        results.finance = `✅ ${entries.length} finance entries loaded`;
      } catch (error) {
        results.finance = `❌ Error: ${error}`;
      }

      // Test Schedule Service
      try {
        const items = await supabaseScheduleService.getScheduleItems();
        results.schedule = `✅ ${items.length} schedule items loaded`;
      } catch (error) {
        results.schedule = `❌ Error: ${error}`;
      }

      // Test Bucket List Service
      try {
        const items = await supabaseBucketListService.getBucketListItems();
        results.bucketList = `✅ ${items.length} bucket list items loaded`;
      } catch (error) {
        results.bucketList = `❌ Error: ${error}`;
      }

      // Test Engagement Service
      try {
        const checkIns = await supabaseEngagementService.getCheckIns();
        results.engagement = `✅ ${checkIns.length} check-ins loaded`;
      } catch (error) {
        results.engagement = `❌ Error: ${error}`;
      }

    } catch (error) {
      console.error('Test error:', error);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const testCreateOperations = async () => {
    setIsLoading(true);
    const results: Record<string, string> = {};

    try {
      // Test creating a task
      try {
        const task = await supabaseTaskService.createTask({
          title: 'Test Task',
          description: 'This is a test task',
          priority: 'medium',
          status: 'todo',
          created_by: 'test-user'
        });
        results.taskCreate = task ? '✅ Task created successfully' : '❌ Failed to create task';
      } catch (error) {
        results.taskCreate = `❌ Error: ${error}`;
      }

      // Test creating a note
      try {
        const note = await supabaseNotesService.createNote({
          title: 'Test Note',
          content: 'This is a test note',
          is_pinned: false,
          created_by: 'test-user'
        });
        results.noteCreate = note ? '✅ Note created successfully' : '❌ Failed to create note';
      } catch (error) {
        results.noteCreate = `❌ Error: ${error}`;
      }

      // Test creating a finance entry
      try {
        const entry = await supabaseFinanceService.createFinanceEntry({
          title: 'Test Entry',
          amount: 100,
          currency: 'USD',
          category: 'expense',
          date: new Date().toISOString().split('T')[0],
          created_by: 'test-user'
        });
        results.financeCreate = entry ? '✅ Finance entry created successfully' : '❌ Failed to create finance entry';
      } catch (error) {
        results.financeCreate = `❌ Error: ${error}`;
      }

    } catch (error) {
      console.error('Create test error:', error);
    }

    setTestResults(prev => ({ ...prev, ...results }));
    setIsLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Services Test</CardTitle>
        <CardDescription>
          Testing all Supabase services to ensure they're working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={runTests} disabled={isLoading} variant="outline">
            {isLoading ? 'Testing...' : 'Test Read Operations'}
          </Button>
          <Button onClick={testCreateOperations} disabled={isLoading} variant="outline">
            {isLoading ? 'Creating...' : 'Test Create Operations'}
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Test Results:</h3>
          {Object.entries(testResults).map(([key, result]) => (
            <div key={key} className="text-sm">
              <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {result}
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500">
          <p>This test verifies that all your Supabase services are working correctly.</p>
          <p>If you see errors, make sure:</p>
          <ul className="list-disc list-inside mt-1">
            <li>You're logged in to the app</li>
            <li>The database schema has been run</li>
            <li>Your Supabase project is properly configured</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
