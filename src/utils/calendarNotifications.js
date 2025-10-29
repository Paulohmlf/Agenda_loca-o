import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';

const CALENDAR_TITLE = 'Agenda Locações App';
const EVENT_TITLE = '📅 Verificar Agenda de Locações';
const ASYNC_STORAGE_EVENT_ID_KEY = 'calendar_event_id';

// 1. Pedir permissão
export async function requestCalendarPermissions() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  
  if (status === 'granted') {
    // No iOS, também precisamos de permissão para Lembretes
    if (Platform.OS === 'ios') {
      const { status: reminderStatus } = await Calendar.requestRemindersPermissionsAsync();
      if (reminderStatus !== 'granted') {
        Alert.alert('Permissão Negada', 'Permissão para Lembretes foi negada. Os alarmes podem não funcionar.');
        return false;
      }
    }
    return true;
  }
  
  Alert.alert('Permissão Negada', 'Permissão para acessar o calendário foi negada!');
  return false;
}

// 2. Encontrar ou usar o calendário Samsung/Google existente
async function getAppCalendarId() {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  console.log("Calendários encontrados:", JSON.stringify(calendars, null, 2));

  // Tenta encontrar o calendário já criado pelo app
  const existingCalendar = calendars.find(
    (calendar) => calendar.title === CALENDAR_TITLE
  );

  if (existingCalendar) {
    console.log("✅ Usando calendário existente do app:", existingCalendar.id);
    return existingCalendar.id;
  }

  // Se não existir, usa um calendário modificável do dispositivo
  console.log("Calendário do app não encontrado, procurando calendário modificável...");

  if (Platform.OS === 'android') {
    // Procura calendários modificáveis no Android
    // Prioriza Samsung Calendar, depois Google Calendar
    let writableCalendar = calendars.find(
      (cal) => 
        cal.allowsModifications && 
        cal.accessLevel === Calendar.CalendarAccessLevel.OWNER &&
        (cal.title.toLowerCase().includes('samsung') || cal.name?.toLowerCase().includes('samsung'))
    );

    // Se não encontrou Samsung, procura Google Calendar
    if (!writableCalendar) {
      writableCalendar = calendars.find(
        (cal) => 
          cal.allowsModifications && 
          cal.accessLevel === Calendar.CalendarAccessLevel.OWNER &&
          (cal.source?.type === 'com.google' || cal.ownerAccount?.includes('@gmail.com'))
      );
    }

    // Se ainda não encontrou, pega o primeiro calendário modificável
    if (!writableCalendar) {
      writableCalendar = calendars.find(
        (cal) => 
          cal.allowsModifications && 
          cal.accessLevel === Calendar.CalendarAccessLevel.OWNER &&
          cal.isVisible
      );
    }

    if (!writableCalendar) {
      Alert.alert(
        'Calendário Não Encontrado',
        'Não foi possível encontrar um calendário modificável. Por favor, certifique-se de ter um calendário configurado no seu dispositivo.'
      );
      console.error("❌ Nenhum calendário modificável encontrado no Android.");
      return null;
    }

    console.log(`✅ Usando calendário: ${writableCalendar.title} (ID: ${writableCalendar.id})`);
    return writableCalendar.id;

  } else {
    // iOS - usa o calendário padrão
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    if (!defaultCalendar) {
      Alert.alert('Erro', 'Não foi possível encontrar o calendário padrão do iOS.');
      console.error("❌ iOS: Calendário padrão não encontrado.");
      return null;
    }
    
    console.log("✅ Usando calendário padrão do iOS:", defaultCalendar.id);
    return defaultCalendar.id;
  }
}

// 3. Agendar/Atualizar o evento diário com lembrete
export async function scheduleCalendarEvent(hour, minute) {
  const calendarId = await getAppCalendarId();
  if (!calendarId) {
    console.error("❌ Não foi possível obter ID do calendário para agendar evento.");
    return null;
  }

  // Remove evento anterior ANTES de criar o novo para evitar duplicatas
  console.log("Removendo evento anterior (se existir)...");
  await removeCalendarEvent();

  const startDate = new Date();
  startDate.setHours(hour, minute, 0, 0);

  // Se o horário já passou hoje, agenda para começar amanhã
  if (startDate < new Date()) {
    console.log("Horário já passou hoje, agendando para amanhã.");
    startDate.setDate(startDate.getDate() + 1);
  }

  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + 15); // Evento de 15 minutos

  console.log(`Agendando evento para: ${startDate.toLocaleString('pt-BR')}`);

  try {
    const eventDetails = {
      title: EVENT_TITLE,
      startDate: startDate,
      endDate: endDate,
      notes: 'Lembrete automático para verificar a agenda de locações do dia.',
      alarms: [
        {
          relativeOffset: 0, // Alarme no horário exato
          method: Platform.OS === 'ios' 
            ? Calendar.AlarmMethod.ALERT 
            : Calendar.AlarmMethod.DEFAULT,
        },
      ],
      recurrenceRule: {
        frequency: Calendar.Frequency.DAILY,
        interval: 1,
      },
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
    console.log(`✅ Evento diário agendado para ${hour}:${String(minute).padStart(2, '0')} - ID: ${eventId}`);

    // Salva o ID do evento
    await AsyncStorage.setItem(ASYNC_STORAGE_EVENT_ID_KEY, eventId);
    return eventId;

  } catch (error) {
    console.error('❌ Erro ao criar evento no calendário:', error);
    Alert.alert(
      'Erro ao Criar Lembrete',
      `Não foi possível criar o lembrete no calendário.\n\nDetalhe: ${error.message}`
    );
    return null;
  }
}

// 4. Remover o evento agendado
export async function removeCalendarEvent() {
  try {
    const eventId = await AsyncStorage.getItem(ASYNC_STORAGE_EVENT_ID_KEY);
    
    if (eventId) {
      console.log(`Removendo evento com ID: ${eventId}`);
      
      // Remove o evento e suas ocorrências futuras
      await Calendar.deleteEventAsync(eventId, { futureEvents: true });
      console.log(`🗑️ Evento removido com sucesso (ID: ${eventId})`);
      
      await AsyncStorage.removeItem(ASYNC_STORAGE_EVENT_ID_KEY);
    } else {
      console.log('Nenhum ID de evento salvo para remover.');
    }
  } catch (error) {
    const errorMessage = String(error.message).toLowerCase();
    
    if (errorMessage.includes('could not find event') || errorMessage.includes('event not found')) {
      console.log('ℹ️ Evento já não existia no calendário. Limpando ID salvo.');
      await AsyncStorage.removeItem(ASYNC_STORAGE_EVENT_ID_KEY);
    } else {
      console.error('❌ Erro ao remover evento:', error);
      // Não mostra alerta para o usuário, apenas loga
    }
  }
}

// 5. Verificar se há um evento agendado
export async function hasScheduledEvent() {
  try {
    const eventId = await AsyncStorage.getItem(ASYNC_STORAGE_EVENT_ID_KEY);
    return eventId !== null;
  } catch (error) {
    console.error('Erro ao verificar evento agendado:', error);
    return false;
  }
}

// 6. Obter horário do evento agendado
export async function getScheduledEventTime() {
  try {
    const eventId = await AsyncStorage.getItem(ASYNC_STORAGE_EVENT_ID_KEY);
    if (!eventId) return null;

    const calendarId = await getAppCalendarId();
    if (!calendarId) return null;

    const event = await Calendar.getEventAsync(eventId);
    if (event && event.startDate) {
      const eventDate = new Date(event.startDate);
      return {
        hour: eventDate.getHours(),
        minute: eventDate.getMinutes(),
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter horário do evento:', error);
    return null;
  }
}
