import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    partnerId?: string;
  };
}

export const initializeSocket = (io: Server) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          partnerId: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        return next(new Error('Authentication error: User not found or inactive'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User ${socket.user?.name} connected with socket ${socket.id}`);

    // Join user to their personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      
      // Join partner room if user has a partner
      if (socket.user?.partnerId) {
        socket.join(`partner:${socket.user.partnerId}`);
      }
    }

    // Handle task updates
    socket.on('task:update', async (data) => {
      try {
        if (!socket.userId) return;

        // Emit to partner if exists
        if (socket.user?.partnerId) {
          socket.to(`user:${socket.user.partnerId}`).emit('task:updated', {
            ...data,
            updatedBy: socket.user.name,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Task update error:', error);
      }
    });

    // Handle note updates
    socket.on('note:update', async (data) => {
      try {
        if (!socket.userId) return;

        // Emit to partner if exists
        if (socket.user?.partnerId) {
          socket.to(`user:${socket.user.partnerId}`).emit('note:updated', {
            ...data,
            updatedBy: socket.user.name,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Note update error:', error);
      }
    });

    // Handle check-in updates
    socket.on('checkin:create', async (data) => {
      try {
        if (!socket.userId) return;

        // Emit to partner if exists
        if (socket.user?.partnerId) {
          socket.to(`user:${socket.user.partnerId}`).emit('checkin:created', {
            ...data,
            createdBy: socket.user.name,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Check-in creation error:', error);
      }
    });

    // Handle finance updates
    socket.on('finance:update', async (data) => {
      try {
        if (!socket.userId) return;

        // Emit to partner if exists
        if (socket.user?.partnerId) {
          socket.to(`user:${socket.user.partnerId}`).emit('finance:updated', {
            ...data,
            updatedBy: socket.user.name,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Finance update error:', error);
      }
    });

    // Handle schedule updates
    socket.on('schedule:update', async (data) => {
      try {
        if (!socket.userId) return;

        // Emit to partner if exists
        if (socket.user?.partnerId) {
          socket.to(`user:${socket.user.partnerId}`).emit('schedule:updated', {
            ...data,
            updatedBy: socket.user.name,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Schedule update error:', error);
      }
    });

    // Handle bucket list updates
    socket.on('bucket:update', async (data) => {
      try {
        if (!socket.userId) return;

        // Emit to partner if exists
        if (socket.user?.partnerId) {
          socket.to(`user:${socket.user.partnerId}`).emit('bucket:updated', {
            ...data,
            updatedBy: socket.user.name,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Bucket list update error:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
      if (socket.user?.partnerId) {
        socket.to(`user:${socket.user.partnerId}`).emit('typing:start', {
          ...data,
          user: socket.user.name
        });
      }
    });

    socket.on('typing:stop', (data) => {
      if (socket.user?.partnerId) {
        socket.to(`user:${socket.user.partnerId}`).emit('typing:stop', {
          ...data,
          user: socket.user.name
        });
      }
    });

    // Handle presence updates
    socket.on('presence:update', (data) => {
      if (socket.user?.partnerId) {
        socket.to(`user:${socket.user.partnerId}`).emit('presence:updated', {
          ...data,
          user: socket.user.name,
          timestamp: new Date()
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`❌ User ${socket.user?.name} disconnected: ${reason}`);
      
      // Notify partner of disconnection
      if (socket.user?.partnerId) {
        socket.to(`user:${socket.user.partnerId}`).emit('presence:updated', {
          status: 'offline',
          user: socket.user.name,
          timestamp: new Date()
        });
      }
    });
  });

  return io;
};

// Utility functions for emitting events from other parts of the application
export const emitToUser = (io: Server, userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToPartner = (io: Server, userId: string, event: string, data: any) => {
  io.to(`partner:${userId}`).emit(event, data);
};

export const emitToAll = (io: Server, event: string, data: any) => {
  io.emit(event, data);
};
