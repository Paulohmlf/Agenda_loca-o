import * as Notifications from 'expo-notifications';

// 1. Configuração do Handler
// Define como o app deve lidar com notificações quando ele está ABERTO (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 2. Solicitar Permissões
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Se ainda não tem permissão, pede agora
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('❌ Permissão de notificação negada!');
    return false;
  }
  console.log('✅ Permissão de notificação concedida!');
  return true;
}

// 3. Agendar Notificação
// trigger pode ser:
// - número (segundos a partir de agora)
// - data (Date object) para agendar em data/hora específica
export async function scheduleNotification(title, body, trigger) {
  try {
    // Se passar um número, converte para segundos. Se for Date, usa direto.
    const triggerInput = typeof trigger === 'number' ? { seconds: trigger } : trigger;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: triggerInput,
    });
    
    console.log(`✅ Notificação agendada (ID: ${id}) para: ${title}`);
    return id;
  } catch (error) {
    console.error('❌ Erro ao agendar notificação:', error);
    return null;
  }
}

// 4. Envio Imediato (atalho para agendar em 1 segundo)
export async function sendImmediateNotification(title, body) {
  return await scheduleNotification(title, body, 1);
}

// 5. Cancelar Todas as Notificações
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('🗑️ Todas as notificações agendadas foram canceladas.');
}

// 6. Listar Notificações Agendadas (Útil para debug)
export async function getAllScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

export function logScheduledNotifications() {
  getAllScheduledNotifications().then(notifs => {
    console.log('📋 Lista de Notificações Agendadas:', JSON.stringify(notifs, null, 2));
  });
}