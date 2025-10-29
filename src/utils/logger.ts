/**
 * Payment Logger
 * Logs all x402 payments for audit trail and governance
 */

import * as fs from 'fs';
import * as path from 'path';

interface PaymentLog {
  agentId: string;
  serviceId: string;
  amount: number;
  currency: string;
  recipient: string;
  txHash: string;
  timestamp: string;
  description?: string;
  status?: 'pending' | 'confirmed' | 'failed';
}

const LOG_DIR = path.join(process.cwd(), 'sessions');
const LOG_FILE = path.join(LOG_DIR, 'payment-log.json');

function ensureLogDirectory(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function loadLogs(): PaymentLog[] {
  ensureLogDirectory();
  if (!fs.existsSync(LOG_FILE)) return [];
  try {
    const data = fs.readFileSync(LOG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error loading payment logs:', error);
    return [];
  }
}

function saveLogs(logs: PaymentLog[]): void {
  ensureLogDirectory();
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('❌ Error saving payment logs:', error);
  }
}

export async function logPayment(payment: PaymentLog): Promise<void> {
  const logs = loadLogs();
  const logEntry: PaymentLog = { ...payment, status: payment.status || 'confirmed', timestamp: payment.timestamp || new Date().toISOString() };
  logs.push(logEntry);
  saveLogs(logs);
  console.log(`📝 Payment logged: ${payment.txHash}`);
}

export function getAllLogs(): PaymentLog[] {
  return loadLogs();
}

export function getAgentLogs(agentId: string): PaymentLog[] {
  return loadLogs().filter(log => log.agentId === agentId);
}

export function calculateAgentSpending(agentId: string, currency?: string): number {
  const logs = getAgentLogs(agentId);
  return logs.filter(log => !currency || log.currency === currency).reduce((total, log) => total + log.amount, 0);
}

export function exportToCSV(filename?: string): string {
  const logs = loadLogs();
  const csvFile = filename || path.join(LOG_DIR, `payment-log-${Date.now()}.csv`);
  const headers = ['Timestamp', 'Agent ID', 'Service ID', 'Amount', 'Currency', 'Recipient', 'Tx Hash', 'Status', 'Description'];
  const rows = logs.map(log => [log.timestamp, log.agentId, log.serviceId, log.amount.toString(), log.currency, log.recipient, log.txHash, log.status || 'confirmed', log.description || '']);
  const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
  fs.writeFileSync(csvFile, csv);
  console.log(`✅ Exported logs to: ${csvFile}`);
  return csvFile;
}

export function getPaymentStats(): { totalPayments: number; totalVolume: { [currency: string]: number }; uniqueAgents: number; uniqueServices: number; averagePayment: { [currency: string]: number }; } {
  const logs = loadLogs();
  const totalVolume: { [currency: string]: number } = {};
  const currencyCounts: { [currency: string]: number } = {};

  logs.forEach(log => {
    if (!totalVolume[log.currency]) {
      totalVolume[log.currency] = 0;
      currencyCounts[log.currency] = 0;
    }
    totalVolume[log.currency] += log.amount;
    currencyCounts[log.currency]++;
  });

  const averagePayment: { [currency: string]: number } = {};
  Object.keys(totalVolume).forEach(currency => {
    averagePayment[currency] = totalVolume[currency] / currencyCounts[currency];
  });

  return {
    totalPayments: logs.length,
    totalVolume,
    uniqueAgents: new Set(logs.map(log => log.agentId)).size,
    uniqueServices: new Set(logs.map(log => log.serviceId)).size,
    averagePayment
  };
}