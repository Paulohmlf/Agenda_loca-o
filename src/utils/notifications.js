// notifications.js
// Arquivo simplificado — sistema de notificações desativado

// Este módulo foi desativado porque o app não usa mais notificações locais.
// Mantemos placeholders vazios para evitar erros de importação em outras partes do código.

export async function requestNotificationPermissions() {
  console.log('🔕 Notificações desativadas — nenhuma permissão solicitada.');
  return false;
}

export async function scheduleNotification() {
  console.log('🔕 Notificações desativadas — nenhum agendamento realizado.');
  return null;
}

export async function cancelAllNotifications() {
  console.log('🔕 Notificações desativadas — nada para cancelar.');
}

export async function sendImmediateNotification() {
  console.log('🔕 Notificações desativadas — envio imediato desativado.');
}

export async function getAllScheduledNotifications() {
  console.log('🔕 Notificações desativadas — lista vazia retornada.');
  return [];
}

export function logScheduledNotifications() {
  console.log('🔕 Notificações desativadas — sem logs.');
}
