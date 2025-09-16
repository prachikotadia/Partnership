import { notificationService, NotificationType } from './supabaseNotificationService';
import { supabase } from '../lib/supabase';

export class NotificationTriggers {
  // Task-related notifications
  static async notifyTaskCreated(taskId: string, taskTitle: string, assignedTo?: string) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      // Get partner info
      const { data: userProfile } = await supabase
        .from('users')
        .select('partner_id, partner_name')
        .eq('id', currentUser.id)
        .single();

      if (userProfile?.partner_id) {
        await notificationService.notifyPartner(
          userProfile.partner_id,
          'task_created',
          'New Task Created',
          `${currentUser.user_metadata?.name || 'Your partner'} created a new task: "${taskTitle}"`,
          { task_id: taskId, task_title: taskTitle },
          {
            action_url: `/tasks?highlight=${taskId}`,
            action_text: 'View Task',
            priority: 'medium',
            category: 'tasks',
            icon: 'plus-circle',
            color: 'blue',
          }
        );
      }
    } catch (error) {
      console.error('Error creating task notification:', error);
    }
  }

  static async notifyTaskCompleted(taskId: string, taskTitle: string, completedBy: string) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      // Get partner info
      const { data: userProfile } = await supabase
        .from('users')
        .select('partner_id, partner_name')
        .eq('id', currentUser.id)
        .single();

      if (userProfile?.partner_id) {
        await notificationService.notifyPartner(
          userProfile.partner_id,
          'task_completed',
          'Task Completed! 🎉',
          `${completedBy} completed the task: "${taskTitle}"`,
          { task_id: taskId, task_title: taskTitle, completed_by: completedBy },
          {
            action_url: `/tasks?highlight=${taskId}`,
            action_text: 'View Task',
            priority: 'medium',
            category: 'tasks',
            icon: 'check-circle',
            color: 'green',
          }
        );
      }
    } catch (error) {
      console.error('Error creating task completion notification:', error);
    }
  }

  static async notifyTaskAssigned(taskId: string, taskTitle: string, assignedTo: string) {
    try {
      await notificationService.createNotification({
        user_id: assignedTo,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `You have been assigned a new task: "${taskTitle}"`,
        data: { task_id: taskId, task_title: taskTitle },
        action_url: `/tasks?highlight=${taskId}`,
        action_text: 'View Task',
        priority: 'high',
        category: 'tasks',
        icon: 'user-plus',
        color: 'purple',
      });
    } catch (error) {
      console.error('Error creating task assignment notification:', error);
    }
  }

  static async notifyTaskDue(taskId: string, taskTitle: string, dueDate: string) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      await notificationService.createNotification({
        user_id: currentUser.id,
        type: 'task_due',
        title: 'Task Due Soon',
        message: `The task "${taskTitle}" is due ${dueDate}`,
        data: { task_id: taskId, task_title: taskTitle, due_date: dueDate },
        action_url: `/tasks?highlight=${taskId}`,
        action_text: 'View Task',
        priority: 'high',
        category: 'tasks',
        icon: 'clock',
        color: 'orange',
      });
    } catch (error) {
      console.error('Error creating task due notification:', error);
    }
  }

  // Note-related notifications
  static async notifyNoteCreated(noteId: string, noteTitle: string) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      // Get partner info
      const { data: userProfile } = await supabase
        .from('users')
        .select('partner_id, partner_name')
        .eq('id', currentUser.id)
        .single();

      if (userProfile?.partner_id) {
        await notificationService.notifyPartner(
          userProfile.partner_id,
          'note_created',
          'New Note Created',
          `${currentUser.user_metadata?.name || 'Your partner'} created a new note: "${noteTitle}"`,
          { note_id: noteId, note_title: noteTitle },
          {
            action_url: `/notes?highlight=${noteId}`,
            action_text: 'View Note',
            priority: 'low',
            category: 'notes',
            icon: 'file-text',
            color: 'blue',
          }
        );
      }
    } catch (error) {
      console.error('Error creating note notification:', error);
    }
  }

  static async notifyNoteShared(noteId: string, noteTitle: string) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      // Get partner info
      const { data: userProfile } = await supabase
        .from('users')
        .select('partner_id, partner_name')
        .eq('id', currentUser.id)
        .single();

      if (userProfile?.partner_id) {
        await notificationService.notifyPartner(
          userProfile.partner_id,
          'note_shared',
          'Note Shared',
          `${currentUser.user_metadata?.name || 'Your partner'} shared a note: "${noteTitle}"`,
          { note_id: noteId, note_title: noteTitle },
          {
            action_url: `/notes?highlight=${noteId}`,
            action_text: 'View Note',
            priority: 'medium',
            category: 'notes',
            icon: 'share',
            color: 'green',
          }
        );
      }
    } catch (error) {
      console.error('Error creating note share notification:', error);
    }
  }

  // Finance-related notifications
  static async notifyExpenseAdded(expenseId: string, amount: number, category: string, currency: string = 'USD') {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      // Get partner info
      const { data: userProfile } = await supabase
        .from('users')
        .select('partner_id, partner_name')
        .eq('id', currentUser.id)
        .single();

      if (userProfile?.partner_id) {
        await notificationService.notifyPartner(
          userProfile.partner_id,
          'finance_expense',
          'New Expense Added',
          `${currentUser.user_metadata?.name || 'Your partner'} added a new expense: ${currency}${amount} for ${category}`,
          { expense_id: expenseId, amount, category, currency },
          {
            action_url: '/finance',
            action_text: 'View Finance',
            priority: 'low',
            category: 'finance',
            icon: 'dollar-sign',
            color: 'green',
          }
        );
      }
    } catch (error) {
      console.error('Error creating expense notification:', error);
    }
  }

  static async notifyBudgetAlert(budgetId: string, budgetName: string, spent: number, limit: number) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      await notificationService.createNotification({
        user_id: currentUser.id,
        type: 'finance_budget_alert',
        title: 'Budget Alert',
        message: `You've spent ${spent} of ${limit} on ${budgetName}`,
        data: { budget_id: budgetId, budget_name: budgetName, spent, limit },
        action_url: '/finance',
        action_text: 'View Budget',
        priority: 'high',
        category: 'finance',
        icon: 'alert-triangle',
        color: 'red',
      });
    } catch (error) {
      console.error('Error creating budget alert notification:', error);
    }
  }

  static async notifyGoalReached(goalId: string, goalName: string, amount: number) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      // Get partner info
      const { data: userProfile } = await supabase
        .from('users')
        .select('partner_id, partner_name')
        .eq('id', currentUser.id)
        .single();

      if (userProfile?.partner_id) {
        await notificationService.notifyPartner(
          userProfile.partner_id,
          'finance_goal_reached',
          'Savings Goal Reached! 🎉',
          `${currentUser.user_metadata?.name || 'Your partner'} reached the savings goal: ${goalName} (${amount})`,
          { goal_id: goalId, goal_name: goalName, amount },
          {
            action_url: '/finance',
            action_text: 'View Goals',
            priority: 'high',
            category: 'finance',
            icon: 'target',
            color: 'green',
          }
        );
      }
    } catch (error) {
      console.error('Error creating goal reached notification:', error);
    }
  }

  // Schedule-related notifications
  static async notifyEventCreated(eventId: string, eventTitle: string, eventDate: string) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      // Get partner info
      const { data: userProfile } = await supabase
        .from('users')
        .select('partner_id, partner_name')
        .eq('id', currentUser.id)
        .single();

      if (userProfile?.partner_id) {
        await notificationService.notifyPartner(
          userProfile.partner_id,
          'schedule_event',
          'New Event Scheduled',
          `${currentUser.user_metadata?.name || 'Your partner'} scheduled: "${eventTitle}" for ${eventDate}`,
          { event_id: eventId, event_title: eventTitle, event_date: eventDate },
          {
            action_url: '/schedule',
            action_text: 'View Event',
            priority: 'medium',
            category: 'schedule',
            icon: 'calendar',
            color: 'purple',
          }
        );
      }
    } catch (error) {
      console.error('Error creating event notification:', error);
    }
  }

  static async notifyEventReminder(eventId: string, eventTitle: string, eventTime: string) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      await notificationService.createNotification({
        user_id: currentUser.id,
        type: 'schedule_reminder',
        title: 'Event Reminder',
        message: `Don't forget: "${eventTitle}" at ${eventTime}`,
        data: { event_id: eventId, event_title: eventTitle, event_time: eventTime },
        action_url: '/schedule',
        action_text: 'View Event',
        priority: 'high',
        category: 'schedule',
        icon: 'bell',
        color: 'orange',
      });
    } catch (error) {
      console.error('Error creating event reminder notification:', error);
    }
  }

  // Bucket List notifications
  static async notifyBucketListCreated(itemId: string, itemTitle: string) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      // Get partner info
      const { data: userProfile } = await supabase
        .from('users')
        .select('partner_id, partner_name')
        .eq('id', currentUser.id)
        .single();

      if (userProfile?.partner_id) {
        await notificationService.notifyPartner(
          userProfile.partner_id,
          'bucket_list_created',
          'New Bucket List Item',
          `${currentUser.user_metadata?.name || 'Your partner'} added: "${itemTitle}" to the bucket list`,
          { item_id: itemId, item_title: itemTitle },
          {
            action_url: '/bucket-list',
            action_text: 'View Item',
            priority: 'medium',
            category: 'bucket_list',
            icon: 'list',
            color: 'purple',
          }
        );
      }
    } catch (error) {
      console.error('Error creating bucket list notification:', error);
    }
  }

  static async notifyBucketListCompleted(itemId: string, itemTitle: string) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      // Get partner info
      const { data: userProfile } = await supabase
        .from('users')
        .select('partner_id, partner_name')
        .eq('id', currentUser.id)
        .single();

      if (userProfile?.partner_id) {
        await notificationService.notifyPartner(
          userProfile.partner_id,
          'bucket_list_completed',
          'Bucket List Item Completed! 🎉',
          `${currentUser.user_metadata?.name || 'Your partner'} completed: "${itemTitle}"`,
          { item_id: itemId, item_title: itemTitle },
          {
            action_url: '/bucket-list',
            action_text: 'View Item',
            priority: 'high',
            category: 'bucket_list',
            icon: 'check-circle',
            color: 'green',
          }
        );
      }
    } catch (error) {
      console.error('Error creating bucket list completion notification:', error);
    }
  }

  // Streak notifications
  static async notifyStreakAchievement(streakType: string, days: number) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      // Get partner info
      const { data: userProfile } = await supabase
        .from('users')
        .select('partner_id, partner_name')
        .eq('id', currentUser.id)
        .single();

      if (userProfile?.partner_id) {
        await notificationService.notifyPartner(
          userProfile.partner_id,
          'streak_achievement',
          'Streak Achievement! 🏆',
          `${currentUser.user_metadata?.name || 'Your partner'} completed a ${days}-day ${streakType} streak!`,
          { streak_type: streakType, days },
          {
            action_url: '/streaks',
            action_text: 'View Streaks',
            priority: 'high',
            category: 'streaks',
            icon: 'trophy',
            color: 'gold',
          }
        );
      }
    } catch (error) {
      console.error('Error creating streak achievement notification:', error);
    }
  }

  static async notifyStreakReminder(streakType: string) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      await notificationService.createNotification({
        user_id: currentUser.id,
        type: 'streak_reminder',
        title: 'Streak Reminder',
        message: `Don't forget to check in for your ${streakType} streak!`,
        data: { streak_type: streakType },
        action_url: '/streaks',
        action_text: 'Check In',
        priority: 'medium',
        category: 'streaks',
        icon: 'bell',
        color: 'orange',
      });
    } catch (error) {
      console.error('Error creating streak reminder notification:', error);
    }
  }

  static async notifyStreakBroken(streakType: string, days: number) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      await notificationService.createNotification({
        user_id: currentUser.id,
        type: 'streak_broken',
        title: 'Streak Broken',
        message: `Your ${days}-day ${streakType} streak has been broken. Start a new one!`,
        data: { streak_type: streakType, days },
        action_url: '/streaks',
        action_text: 'Start New Streak',
        priority: 'medium',
        category: 'streaks',
        icon: 'x-circle',
        color: 'red',
      });
    } catch (error) {
      console.error('Error creating streak broken notification:', error);
    }
  }

  // Partner-related notifications
  static async notifyPartnerPairing(partnerName: string) {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      await notificationService.createNotification({
        user_id: currentUser.id,
        type: 'partner_pairing',
        title: 'Partner Connected! 💕',
        message: `You are now connected with ${partnerName}. Start collaborating!`,
        data: { partner_name: partnerName },
        action_url: '/profile',
        action_text: 'View Profile',
        priority: 'high',
        category: 'partner',
        icon: 'users',
        color: 'pink',
      });
    } catch (error) {
      console.error('Error creating partner pairing notification:', error);
    }
  }

  // System notifications
  static async notifySystemAnnouncement(userId: string, title: string, message: string) {
    try {
      await notificationService.createSystemNotification(
        userId,
        title,
        message,
        'system_announcement',
        {
          priority: 'medium',
          category: 'system',
          icon: 'info',
          color: 'gray',
        }
      );
    } catch (error) {
      console.error('Error creating system announcement notification:', error);
    }
  }
}
