import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Plus, 
  Send, 
  Reply, 
  Mail, 
  MailOpen,
  User,
  Clock
} from 'lucide-react';

const InternalMessaging = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [staff, setStaff] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Compose form state
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchStaff();
      fetchPatients();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('internal_messages')
        .select(`
          *,
          from_user:profiles!internal_messages_from_user_id_fkey(full_name, role),
          to_user:profiles!internal_messages_to_user_id_fkey(full_name, role),
          patient:patients(name)
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, role')
        .neq('user_id', user.id);

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('internal_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'internal_messages',
          filter: `to_user_id=eq.${user.id}`
        },
        (payload) => {
          fetchMessages(); // Refresh to get full data with joins
          toast.info(t('notifications.newMessage'));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!recipient || !subject || !content) {
      toast.error(t('messaging.fillAllFields'));
      return;
    }

    try {
      const { error } = await supabase
        .from('internal_messages')
        .insert({
          from_user_id: user.id,
          to_user_id: recipient,
          subject,
          content,
          patient_id: selectedPatient || null
        });

      if (error) throw error;
      
      toast.success(t('messaging.messageSent'));
      setIsComposing(false);
      setRecipient('');
      setSubject('');
      setContent('');
      setSelectedPatient('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('messaging.errorSendingMessage'));
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const { error } = await supabase
        .from('internal_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const replyToMessage = (message) => {
    setRecipient(message.from_user_id);
    setSubject(`Re: ${message.subject}`);
    setSelectedPatient(message.patient_id || '');
    setIsComposing(true);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('notifications.justNow');
    if (diffInMinutes < 60) return t('notifications.minutesAgo', { count: diffInMinutes });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('notifications.hoursAgo', { count: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    return t('notifications.daysAgo', { count: diffInDays });
  };

  const inboxMessages = messages.filter(msg => msg.to_user_id === user.id);
  const sentMessages = messages.filter(msg => msg.from_user_id === user.id);
  const unreadCount = inboxMessages.filter(msg => !msg.is_read).length;

  return (
    <div className="h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t('messaging.internalMessaging')}</h3>
        <Dialog open={isComposing} onOpenChange={setIsComposing}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('messaging.compose')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('messaging.composeMessage')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('messaging.recipient')}
                </label>
                <Select value={recipient} onValueChange={setRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('messaging.selectRecipient')} />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.full_name} ({t(`forms.${member.role}`)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('messaging.subject')}
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('messaging.enterSubject')}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('messaging.relatedPatient')} ({t('common.optional')})
                </label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('messaging.selectPatient')} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('messaging.message')}
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('messaging.enterMessage')}
                  rows={6}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsComposing(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={sendMessage}>
                  <Send className="h-4 w-4 mr-2" />
                  {t('messaging.send')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="inbox" className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inbox" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>{t('messaging.inbox')}</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center space-x-2">
            <Send className="h-4 w-4" />
            <span>{t('messaging.sent')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="flex-1">
          <ScrollArea className="h-[480px]">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : inboxMessages.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                {t('messaging.noMessages')}
              </div>
            ) : (
              <div className="space-y-2">
                {inboxMessages.map((message) => (
                  <Card 
                    key={message.id} 
                    className={`cursor-pointer transition-colors ${
                      message.is_read ? 'bg-transparent' : 'bg-primary/5'
                    }`}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.is_read) {
                        markAsRead(message.id);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {message.is_read ? (
                              <MailOpen className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Mail className="h-4 w-4 text-primary" />
                            )}
                            <span className={`font-medium ${
                              message.is_read ? 'text-muted-foreground' : ''
                            }`}>
                              {message.from_user?.full_name}
                            </span>
                          </div>
                          {message.patient && (
                            <Badge variant="outline" className="text-xs">
                              {message.patient.name}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(message.created_at)}
                        </span>
                      </div>
                      <p className={`font-medium mb-1 ${
                        message.is_read ? 'text-muted-foreground' : ''
                      }`}>
                        {message.subject}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sent" className="flex-1">
          <ScrollArea className="h-[480px]">
            {sentMessages.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
                {t('messaging.noSentMessages')}
              </div>
            ) : (
              <div className="space-y-2">
                {sentMessages.map((message) => (
                  <Card key={message.id} className="cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {t('messaging.to')}: {message.to_user?.full_name}
                          </span>
                          {message.patient && (
                            <Badge variant="outline" className="text-xs">
                              {message.patient.name}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(message.created_at)}
                        </span>
                      </div>
                      <p className="font-medium mb-1">{message.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Message Detail Dialog */}
      {selectedMessage && (
        <Dialog 
          open={!!selectedMessage} 
          onOpenChange={() => setSelectedMessage(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedMessage.subject}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>
                    {t('messaging.from')}: {selectedMessage.from_user?.full_name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                </div>
              </div>
              
              {selectedMessage.patient && (
                <Badge variant="outline">
                  {t('messaging.patient')}: {selectedMessage.patient.name}
                </Badge>
              )}
              
              <Separator />
              
              <div className="whitespace-pre-wrap text-sm">
                {selectedMessage.content}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    replyToMessage(selectedMessage);
                    setSelectedMessage(null);
                  }}
                >
                  <Reply className="h-4 w-4 mr-2" />
                  {t('messaging.reply')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InternalMessaging;