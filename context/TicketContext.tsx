
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ticket, TicketReply } from '../types';

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'status' | 'date' | 'replies' | 'unreadAdmin' | 'unreadUser'>) => void;
  addReply: (ticketId: string, reply: Omit<TicketReply, 'id' | 'date'>) => void;
  closeTicket: (id: string) => void;
  markAsRead: (id: string, role: 'user' | 'admin') => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('vanphal_tickets');
    return saved ? JSON.parse(saved) : [
      {
        id: 'T-1001',
        userId: '2',
        userName: 'Amit Kumar',
        email: 'amit@example.com',
        subject: 'Bulk Order Inquiry',
        message: 'Looking to buy 50 jars for a corporate event. Do you offer discounts?',
        status: 'open',
        date: new Date().toLocaleDateString(),
        replies: [],
        unreadAdmin: true,
        unreadUser: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('vanphal_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const addTicket = (data: any) => {
    const newTicket: Ticket = {
      ...data,
      id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
      status: 'open',
      date: new Date().toLocaleString(),
      replies: [],
      unreadAdmin: true,
      unreadUser: false
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const addReply = (ticketId: string, replyData: any) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const newReply: TicketReply = {
          ...replyData,
          id: `R-${Date.now()}`,
          date: new Date().toLocaleString()
        };
        return {
          ...t,
          replies: [...t.replies, newReply],
          unreadAdmin: replyData.authorRole === 'user',
          unreadUser: replyData.authorRole === 'admin',
          status: 'open' // Re-open if closed and someone replies
        };
      }
      return t;
    }));
  };

  const closeTicket = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'closed' } : t));
  };

  const markAsRead = (id: string, role: 'user' | 'admin') => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          unreadAdmin: role === 'admin' ? false : t.unreadAdmin,
          unreadUser: role === 'user' ? false : t.unreadUser
        };
      }
      return t;
    }));
  };

  return (
    <TicketContext.Provider value={{ tickets, addTicket, addReply, closeTicket, markAsRead }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) throw new Error('useTickets must be used within a TicketProvider');
  return context;
};
