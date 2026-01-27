'use client';

import { X, Heart, MessageSquare, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface NotificationItem {
    id: string; // Unique ID
    type: 'like' | 'comment' | 'reminder' | 'feedback';
    title: string;
    message: string;
    time: string; // Display time (e.g. "2 min ago")
    timestamp: number; // For sorting
    link: string; // Where to go on click
    read: boolean;
}

interface NotificationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: NotificationItem[];
}

export default function NotificationDrawer({ isOpen, onClose, notifications }: NotificationDrawerProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const handleClick = (link: string) => {
        onClose(); // Close drawer
        router.push(link);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart size={16} className="text-neon-green fill-neon-green" />;
            case 'comment': return <MessageSquare size={16} className="text-blue-400 fill-blue-400" />;
            case 'reminder': return <Clock size={16} className="text-yellow-400" />;
            case 'feedback': return <AlertCircle size={16} className="text-red-500" />;
            default: return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="relative w-full max-w-xs h-full bg-gray-900 border-l border-gray-800 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/20">
                    <h2 className="font-bold text-lg text-white">Notifications</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <button
                                key={notif.id}
                                onClick={() => handleClick(notif.link)}
                                className="w-full text-left p-3 rounded-xl hover:bg-black/40 transition-colors border border-transparent hover:border-gray-800 group flex items-start gap-3 relative"
                            >
                                <div className={`w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center shrink-0 bg-gray-800 ${!notif.read ? 'ring-1 ring-neon-green/50' : ''}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-200 mb-0.5 truncate">{notif.title}</p>
                                    <p className="text-xs text-gray-400 leading-snug line-clamp-2">{notif.message}</p>
                                    <span className="text-[10px] text-gray-600 mt-1 block">{notif.time}</span>
                                </div>
                                {!notif.read && (
                                    <span className="absolute top-4 right-4 w-1.5 h-1.5 bg-neon-green rounded-full"></span>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                <span className="text-2xl">💤</span>
                            </div>
                            <p className="text-sm">No new notifications</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
