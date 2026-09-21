import { addMonths, format, isBefore, isToday, parseISO } from 'date-fns';
import { EmiScheduleItem, EmiStatus, PaymentMethod } from '../types';

/**
 * Calculate Monthly EMI using standard Reducing-Balance Amortization formula
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 *
 * @param principal Loan principal amount (P)
 * @param annualInterestRate Annual interest rate in percentage (e.g. 12 for 12%)
 * @param tenureMonths Tenure in months (n)
 * @returns Monthly EMI amount rounded to nearest integer
 */
export function calculateEmi(principal: number, annualInterestRate: number, tenureMonths: number): number {
  if (!principal || !tenureMonths || principal <= 0 || tenureMonths <= 0) return 0;
  if (!annualInterestRate || annualInterestRate <= 0) {
    return Math.round(principal / tenureMonths);
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);

  return Math.round(emi);
}

/**
 * Generate full reducing-balance EMI schedule table
 */
export function generateEmiSchedule(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number,
  startDateStr: string
): {
  schedule: EmiScheduleItem[];
  emiAmount: number;
  totalInterest: number;
  totalPayable: number;
} {
  const emiAmount = calculateEmi(principal, annualInterestRate, tenureMonths);
  const monthlyRate = (annualInterestRate || 0) / 12 / 100;
  const startDate = startDateStr ? parseISO(startDateStr) : new Date();

  let currentBalance = principal;
  let totalInterestAccrued = 0;
  const schedule: EmiScheduleItem[] = [];

  const today = new Date();

  for (let i = 1; i <= tenureMonths; i++) {
    const dueDate = addMonths(startDate, i);
    const dueDateStr = format(dueDate, 'yyyy-MM-dd');

    let interestComponent = Math.round(currentBalance * monthlyRate);
    let principalComponent = emiAmount - interestComponent;

    // Handle rounding / last installment adjustments
    if (i === tenureMonths || currentBalance - principalComponent < 0) {
      principalComponent = currentBalance;
      interestComponent = Math.max(0, emiAmount - principalComponent);
    }

    currentBalance = Math.max(0, currentBalance - principalComponent);
    totalInterestAccrued += interestComponent;

    let status: EmiStatus = 'UPCOMING';
    if (isToday(dueDate)) {
      status = 'DUE';
    } else if (isBefore(dueDate, today)) {
      status = 'OVERDUE';
    }

    schedule.push({
      emiNumber: i,
      dueDate: dueDateStr,
      principal: principalComponent,
      interest: interestComponent,
      emiAmount: principalComponent + interestComponent,
      paidAmount: 0,
      remainingAmount: principalComponent + interestComponent,
      status: status,
    });
  }

  const totalPayable = principal + totalInterestAccrued;

  return {
    schedule,
    emiAmount,
    totalInterest: totalInterestAccrued,
    totalPayable,
  };
}

/**
 * Calculate Expected Returns for Bishi Investment Plans
 */
export function calculateInvestmentReturn(
  amount: number,
  annualReturnRate: number,
  durationMonths: number,
  frequency: 'MONTHLY' | 'QUARTERLY' | 'LUMP_SUM' = 'MONTHLY'
): {
  expectedReturn: number;
  totalPayout: number;
  payoutPerCycle: number;
} {
  if (!amount || amount <= 0 || !durationMonths || durationMonths <= 0) {
    return { expectedReturn: 0, totalPayout: 0, payoutPerCycle: 0 };
  }

  // Simple annual rate prorated by duration months
  const expectedReturn = Math.round(amount * (annualReturnRate / 100) * (durationMonths / 12));
  const totalPayout = amount + expectedReturn;

  let cycles = durationMonths;
  if (frequency === 'QUARTERLY') {
    cycles = Math.max(1, Math.floor(durationMonths / 3));
  } else if (frequency === 'LUMP_SUM') {
    cycles = 1;
  }

  const payoutPerCycle = Math.round(expectedReturn / cycles);

  return {
    expectedReturn,
    totalPayout,
    payoutPerCycle,
  };
}

/**
 * Calculate penalty on overdue EMIs
 */
export function calculateOverduePenalty(overdueAmount: number, daysOverdue: number, penaltyRateAnnual = 24): number {
  if (!overdueAmount || overdueAmount <= 0 || !daysOverdue || daysOverdue <= 0) return 0;
  const dailyRate = penaltyRateAnnual / 365 / 100;
  return Math.round(overdueAmount * dailyRate * daysOverdue);
}
