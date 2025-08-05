import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../integrations/supabase/client';
import  Layout  from '../components/Layout';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CalendarIcon, Clock, User, Phone } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch appointments and transform them into calendar events
  const fetchAppointments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(name, telephone),
          doctor:profiles!appointments_doctor_id_fkey(full_name)
        `)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      const calendarEvents = data?.map(appointment => {
        const startDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(endDateTime.getHours() + 1); // Default 1-hour duration

        return {
          id: appointment.id,
          title: `${appointment.patient?.name} - ${appointment.treatment}`,
          start: startDateTime,
          end: endDateTime,
          resource: {
            ...appointment,
            patientName: appointment.patient?.name,
            patientPhone: appointment.patient?.telephone,
            doctorName: appointment.doctor?.full_name
          }
        };
      }) || [];

      setAppointments(data || []);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error(t('messages.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handle event drag and drop for rescheduling
  const moveEvent = useCallback(async ({ event, start, end }) => {
    try {
      const appointmentDate = moment(start).format('YYYY-MM-DD');
      const appointmentTime = moment(start).format('HH:mm:ss');

      const { error } = await supabase
        .from('appointments')
        .update({
          appointment_date: appointmentDate,
          appointment_time: appointmentTime
        })
        .eq('id', event.id);

      if (error) throw error;

      // Update local state
      const updatedEvents = events.map(evt =>
        evt.id === event.id
          ? { ...evt, start, end }
          : evt
      );
      setEvents(updatedEvents);
      
      toast.success(t('calendar.appointmentRescheduled'));
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error(t('calendar.errorRescheduling'));
    }
  }, [events, t]);

  // Event selection handler
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  // Custom event component
  const EventComponent = ({ event }) => (
    <div className="p-1 text-xs">
      <div className="font-semibold truncate">{event.resource.patientName}</div>
      <div className="text-gray-600 truncate">{event.resource.treatment}</div>
      <Badge 
        variant={event.resource.status === 'completed' ? 'default' : 
                event.resource.status === 'cancelled' ? 'destructive' : 'secondary'}
        className="text-xs mt-1"
      >
        {t(`appointmentStatus.${event.resource.status}`)}
      </Badge>
    </div>
  );

  // Calendar toolbar
  const CustomToolbar = ({ label, onNavigate, onView }) => (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('PREV')}
        >
          {t('calendar.previous')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('TODAY')}
        >
          {t('calendar.today')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('NEXT')}
        >
          {t('calendar.next')}
        </Button>
      </div>
      
      <h2 className="text-xl font-semibold">{label}</h2>
      
      <div className="flex gap-2">
        <Button
          variant={view === Views.MONTH ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView(Views.MONTH)}
        >
          {t('calendar.month')}
        </Button>
        <Button
          variant={view === Views.WEEK ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView(Views.WEEK)}
        >
          {t('calendar.week')}
        </Button>
        <Button
          variant={view === Views.DAY ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView(Views.DAY)}
        >
          {t('calendar.day')}
        </Button>
      </div>
    </div>
  );

  // Event details modal/sidebar
  const EventDetails = ({ event, onClose }) => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {t('calendar.appointmentDetails')}
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{event.resource.patientName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{event.resource.patientPhone}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>{moment(event.start).format('LLLL')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{event.resource.treatment}</span>
          </div>
          
          {event.resource.tooth && (
            <div>
              <span className="font-medium">{t('appointments.tooth')}: </span>
              <span>{event.resource.tooth}</span>
            </div>
          )}
          
          {event.resource.notes && (
            <div>
              <span className="font-medium">{t('appointments.notes')}: </span>
              <span>{event.resource.notes}</span>
            </div>
          )}
          
          <div>
            <span className="font-medium">{t('appointments.status')}: </span>
            <Badge 
              variant={event.resource.status === 'completed' ? 'default' : 
                      event.resource.status === 'cancelled' ? 'destructive' : 'secondary'}
            >
              {t(`appointmentStatus.${event.resource.status}`)}
            </Badge>
          </div>
          
          <div>
            <span className="font-medium">{t('scheduler.doctor')}: </span>
            <span>{event.resource.doctorName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{t('calendar.calendarView')}</h1>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <CustomToolbar
                label=""
                onNavigate={(action) => {
                  if (action === 'PREV') {
                    setDate(moment(date).subtract(1, view.toLowerCase()).toDate());
                  } else if (action === 'NEXT') {
                    setDate(moment(date).add(1, view.toLowerCase()).toDate());
                  } else if (action === 'TODAY') {
                    setDate(new Date());
                  }
                }}
                onView={setView}
              />
              
              <div style={{ height: '600px' }} className={isRTL ? 'rtl' : 'ltr'}>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  view={view}
                  onView={setView}
                  date={date}
                  onNavigate={setDate}
                  onSelectEvent={handleSelectEvent}
                  onEventDrop={moveEvent}
                  onEventResize={moveEvent}
                  resizable
                  draggableAccessor={() => true}
                  components={{
                    event: EventComponent,
                    toolbar: () => null // We use custom toolbar
                  }}
                  messages={{
                    allDay: t('calendar.allDay'),
                    previous: t('calendar.previous'),
                    next: t('calendar.next'),
                    today: t('calendar.today'),
                    month: t('calendar.month'),
                    week: t('calendar.week'),
                    day: t('calendar.day'),
                    agenda: t('calendar.agenda'),
                    date: t('calendar.date'),
                    time: t('calendar.time'),
                    event: t('calendar.event'),
                    noEventsInRange: t('calendar.noAppointments')
                  }}
                  rtl={isRTL}
                />
              </div>
            </CardContent>
          </Card>
          
          {selectedEvent && (
            <EventDetails 
              event={selectedEvent} 
              onClose={() => setSelectedEvent(null)} 
            />
          )}
        </div>
      </Layout>
    </DndProvider>
  );
};

export default CalendarPage;