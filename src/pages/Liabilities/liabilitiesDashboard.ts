import type {
  CashForecast,
  LiabilityCreditor,
  LiabilityRecord,
  LoanRecord,
  LoanRepayment,
  LiabilitiesApiData,
} from "./liabilities.api";

export interface LiabilityMetric {
  label: string;
  amount: number;
  kind: "total" | "overdue" | "loan" | "cash";
}

export interface LiabilityCategoryTotal {
  label: string;
  amount: number;
  color: string;
}

export interface CreditorBalance {
  id: number;
  name: string;
  type: string;
  owed: number;
  overdue: number;
  nextDue: string | null;
}

export interface SchoolBalance {
  id: number | null;
  name: string;
  owedToUs: number;
  weOwe: number;
}

export interface StatutoryPayment {
  id: number;
  creditor: string;
  reference: string;
  period: string;
  dueDate: string;
  amount: number;
  status: string;
}

export interface LoanSummary {
  id: number;
  reference: string;
  creditor: string;
  school: string;
  borrowed: number;
  paid: number;
  balance: number;
  nextInstallment: number;
  nextDue: string | null;
  interestRate: number;
  currency: string;
}

export interface LiabilitiesDashboardModel {
  metrics: LiabilityMetric[];
  schoolBalances: SchoolBalance[];
  schoolTotals: {
    owedToUs: number;
    weOwe: number;
    bankBalance: number;
    forecast: number;
  };
  categories: LiabilityCategoryTotal[];
  topCreditors: CreditorBalance[];
  statutoryPayments: StatutoryPayment[];
  loans: LoanSummary[];
  upcomingTotal: number;
}

const categoryDetails: Record<
  LiabilityRecord["category"],
  { label: string; color: string }
> = {
  current_payables: { label: "Current payables", color: "#172448" },
  accrued_expenses_tax: { label: "Accrued expenses and tax", color: "#2aa4dd" },
  long_term_debt: { label: "Long-term debt", color: "#5b8fc1" },
};

const creditorTypeLabels: Record<LiabilityCreditor["creditor_type"], string> = {
  lender: "Lender",
  statutory_tax: "Statutory tax",
  trade_payable: "Trade payable",
  insurer: "Insurer",
  utility: "Utility",
  statutory_remittance: "Statutory remittance",
  fleet_fuel: "Fleet and fuel",
  it_comms: "IT and communications",
};

const numeric = (value: string | number | null | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const outstanding = (liability: LiabilityRecord): number =>
  numeric(liability.outstanding_amount);

function inCampus(
  schoolId: number | null,
  schoolIds: Set<number>,
  includeUnassigned: boolean,
): boolean {
  return includeUnassigned
    ? schoolId === null || schoolIds.has(schoolId)
    : schoolId !== null && schoolIds.has(schoolId);
}

function formatMonth(date: string): string {
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("en-GB", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(parsed);
}

function creditorName(
  id: number,
  creditorById: Map<number, LiabilityCreditor>,
): string {
  return creditorById.get(id)?.name ?? `Creditor #${id}`;
}

function isStatutoryCreditor(
  type: LiabilityCreditor["creditor_type"] | undefined,
): boolean {
  return type === "statutory_tax" || type === "statutory_remittance";
}

function buildCreditorBalances(
  liabilities: LiabilityRecord[],
  loans: LoanRecord[],
  repayments: LoanRepayment[],
  creditors: LiabilityCreditor[],
  asOfDate: string,
): CreditorBalance[] {
  const creditorById = new Map(creditors.map((creditor) => [creditor.id, creditor]));
  const loanById = new Map(loans.map((loan) => [loan.id, loan]));
  const balances = new Map<number, CreditorBalance>();
  const addBalance = (
    creditorId: number,
    amount: number,
    overdue: number,
    nextDue: string | null,
  ) => {
    const creditor = creditorById.get(creditorId);
    const balance = balances.get(creditorId) ?? {
      id: creditorId,
      name: creditorName(creditorId, creditorById),
      type: creditor ? creditorTypeLabels[creditor.creditor_type] : "Creditor",
      owed: 0,
      overdue: 0,
      nextDue: null,
    };

    balance.owed += amount;
    balance.overdue += overdue;
    if (nextDue && (!balance.nextDue || nextDue < balance.nextDue)) {
      balance.nextDue = nextDue;
    }
    balances.set(creditorId, balance);
  };

  for (const liability of liabilities) {
    const amount = outstanding(liability);
    if (amount <= 0) continue;

    addBalance(
      liability.creditor,
      amount,
      liability.status === "overdue" ? amount : 0,
      liability.due_date >= asOfDate ? liability.due_date : null,
    );
  }

  for (const loan of loans) {
    const amount = numeric(loan.outstanding_balance);
    if (amount <= 0 || loan.status !== "active") continue;
    addBalance(loan.creditor, amount, 0, loan.next_installment_date);
  }

  for (const repayment of repayments) {
    const loan = loanById.get(repayment.loan);
    const amount = numeric(repayment.installment_outstanding);
    if (!loan || amount <= 0) continue;

    const late =
      repayment.status === "overdue" ||
      (repayment.paid_date !== null && repayment.paid_date > repayment.due_date);
    addBalance(
      loan.creditor,
      0,
      late ? amount : 0,
      repayment.due_date >= asOfDate && repayment.status !== "paid"
        ? repayment.due_date
        : null,
    );
  }

  return Array.from(balances.values()).sort((a, b) => b.owed - a.owed);
}

function currentForecasts(
  forecasts: CashForecast[],
  schoolIds: Set<number>,
  includeUnassigned: boolean,
  asOfDate: string,
): CashForecast[] {
  const nearest = new Map<number | null, CashForecast>();

  for (const forecast of forecasts) {
    if (
      forecast.forecast_date < asOfDate ||
      !inCampus(forecast.school, schoolIds, includeUnassigned)
    ) {
      continue;
    }
    const previous = nearest.get(forecast.school);
    if (!previous || forecast.forecast_date < previous.forecast_date) {
      nearest.set(forecast.school, forecast);
    }
  }

  return Array.from(nearest.values());
}

export function buildLiabilitiesDashboard(
  data: LiabilitiesApiData,
  campus: string | null,
  section: string | null = null,
): LiabilitiesDashboardModel {
  const includeUnassigned = !campus && !section;
  const selectedSchools = campus
    ? data.schools.filter((school) => school.campus === campus)
    : data.schools;
  const visibleSchools = section
    ? selectedSchools.filter((school) => school.level === section)
    : selectedSchools;
  const schoolIds = new Set(visibleSchools.map((school) => school.id));
  const asOfDate = data.dashboard.as_of_date;
  const schoolById = new Map(data.schools.map((school) => [school.id, school]));
  const creditorById = new Map(
    data.creditors.map((creditor) => [creditor.id, creditor]),
  );
  const selectedLiabilities = data.liabilities.filter((liability) =>
    inCampus(liability.school, schoolIds, includeUnassigned),
  );
  const selectedLoans = data.loans.filter(
    (loan) =>
      ((includeUnassigned && loan.school === null) ||
        (loan.school !== null && schoolIds.has(loan.school))) &&
      loan.status === "active",
  );
  const selectedAccounts = data.bankAccounts.filter(
    (account) =>
      account.is_active &&
      inCampus(account.school, schoolIds, includeUnassigned),
  );
  const selectedRepayments = data.repayments.filter((repayment) =>
    selectedLoans.some((loan) => loan.id === repayment.loan),
  );
  const openLiabilities = selectedLiabilities.filter(
    (liability) => outstanding(liability) > 0,
  );
  const outstandingTotal = openLiabilities.reduce(
    (total, liability) => total + outstanding(liability),
    0,
  );
  const loanBalance = selectedLoans.reduce(
    (total, loan) => total + numeric(loan.outstanding_balance),
    0,
  );
  const overdueTotal = includeUnassigned
    ? data.dashboard.summary.overdue
    : openLiabilities
        .filter((liability) => liability.status === "overdue")
        .reduce((total, liability) => total + outstanding(liability), 0);
  const bankBalance = selectedAccounts.reduce(
    (total, account) => total + numeric(account.balance),
    0,
  );
  const forecastRows = currentForecasts(
    data.cashForecasts,
    schoolIds,
    includeUnassigned,
    asOfDate,
  );
  const forecastBalance = forecastRows.reduce(
    (total, forecast) => total + numeric(forecast.forecast_balance),
    0,
  );

  const categoryTotals = new Map<LiabilityRecord["category"], number>();
  for (const liability of openLiabilities) {
    categoryTotals.set(
      liability.category,
      (categoryTotals.get(liability.category) ?? 0) + outstanding(liability),
    );
  }
  categoryTotals.set(
    "long_term_debt",
    (categoryTotals.get("long_term_debt") ?? 0) + loanBalance,
  );
  const categories = (
    Object.keys(categoryDetails) as LiabilityRecord["category"][]
  ).map((category) => ({
    label: categoryDetails[category].label,
    amount: categoryTotals.get(category) ?? 0,
    color: categoryDetails[category].color,
  }));

  const creditors = buildCreditorBalances(
    openLiabilities,
    selectedLoans,
    selectedRepayments,
    data.creditors,
    asOfDate,
  );
  const schoolBalances: SchoolBalance[] = visibleSchools.map((school) => {
    const schoolLiabilities = openLiabilities
      .filter((liability) => liability.school === school.id)
      .reduce((total, liability) => total + outstanding(liability), 0);
    const schoolLoans = selectedLoans
      .filter((loan) => loan.school === school.id)
      .reduce((total, loan) => total + numeric(loan.outstanding_balance), 0);
    const fees = data.schoolFees.breakdown.find((row) => row.id === school.id);

    return {
      id: school.id,
      name: school.name,
      owedToUs: fees?.fees_not_received ?? 0,
      weOwe: schoolLiabilities + schoolLoans,
    };
  });
  const unassignedLiabilities = openLiabilities
    .filter((liability) => liability.school === null)
    .reduce((total, liability) => total + outstanding(liability), 0);
  const unassignedLoans = selectedLoans
    .filter((loan) => loan.school === null)
    .reduce((total, loan) => total + numeric(loan.outstanding_balance), 0);
  if (includeUnassigned && unassignedLiabilities + unassignedLoans > 0) {
    schoolBalances.push({
      id: null,
      name: "Group / unassigned",
      owedToUs: 0,
      weOwe: unassignedLiabilities + unassignedLoans,
    });
  }
  schoolBalances.sort((a, b) => a.name.localeCompare(b.name));

  const statutoryPayments: StatutoryPayment[] = selectedLiabilities
    .filter((liability) => {
      const type = creditorById.get(liability.creditor)?.creditor_type;
      return isStatutoryCreditor(type);
    })
    .map((liability) => {
      const creditor = creditorById.get(liability.creditor);
      const latePaid =
        liability.paid_date !== null &&
        liability.paid_date > liability.due_date;
      const status =
        liability.status === "paid"
          ? latePaid
            ? "Paid late"
            : "Paid"
          : liability.status === "overdue"
            ? "Overdue"
            : liability.status === "due_soon"
              ? "Due soon"
              : "Current";

      return {
        id: liability.id,
        creditor: creditorName(liability.creditor, creditorById),
        reference: creditor?.reference_number || liability.description,
        period: formatMonth(liability.issued_date),
        dueDate: liability.due_date,
        amount:
          liability.status === "paid"
            ? numeric(liability.paid_amount)
            : outstanding(liability),
        status,
      };
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const loans: LoanSummary[] = selectedLoans.map((loan) => {
    const payments = selectedRepayments
      .filter((repayment) => repayment.loan === loan.id)
      .sort((a, b) => a.due_date.localeCompare(b.due_date));
    const nextPayment = payments.find(
      (payment) =>
        payment.status !== "paid" && payment.due_date >= asOfDate,
    );

    return {
      id: loan.id,
      reference: loan.loan_reference,
      creditor: creditorName(loan.creditor, creditorById),
      school: loan.school !== null
        ? schoolById.get(loan.school)?.name ?? "School unavailable"
        : "Group",
      borrowed: numeric(loan.principal_amount),
      paid: numeric(loan.principal_amount) - numeric(loan.outstanding_balance),
      balance: numeric(loan.outstanding_balance),
      nextInstallment: nextPayment
        ? numeric(nextPayment.installment_outstanding)
        : 0,
      nextDue: nextPayment?.due_date ?? loan.next_installment_date,
      interestRate: numeric(loan.annual_interest_rate),
      currency: loan.currency,
    };
  });

  const upcomingTotal = statutoryPayments
    .filter((payment) => payment.status !== "Paid" && payment.status !== "Paid late")
    .reduce((total, payment) => total + payment.amount, 0);

  const metrics: LiabilityMetric[] = [
    {
      label: "Total owed",
      amount: outstandingTotal + loanBalance,
      kind: "total",
    },
    {
      label: "Overdue",
      amount: overdueTotal,
      kind: "overdue",
    },
    {
      label: "Loan balance",
      amount: loanBalance,
      kind: "loan",
    },
    {
      label: "Bank cash balance",
      amount: bankBalance,
      kind: "cash",
    },
  ];

  return {
    metrics,
    schoolBalances,
    schoolTotals: {
      owedToUs: schoolBalances.reduce((total, row) => total + row.owedToUs, 0),
      weOwe: schoolBalances.reduce((total, row) => total + row.weOwe, 0),
      bankBalance,
      forecast: forecastBalance,
    },
    categories,
    topCreditors: creditors.slice(0, 5),
    statutoryPayments,
    loans,
    upcomingTotal,
  };
}

export function formatCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat("en-UG", { maximumFractionDigits: 0 }).format(
    amount,
  );
}

export function formatLiabilityCurrency(amount: number): string {
  return `UGX ${formatCompact(amount)}`;
}
