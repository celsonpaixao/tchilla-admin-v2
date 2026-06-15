export interface DashboardMetrics {
  totalReserva: number;
  receitaMensal: number;
  reservaConcluidas: number;
  reservaCancelados: number;
}

export interface AgendamentoMetrics {
  numeroClientes: number;
  numeroParceiros: number;
  totalReservas: number;
  reservasConcluidas: number;
  reservasCanceladas: number;
  reservasSupervisor: number;
  receitaTotal: number;
}

export interface UserMetrics {
  totalUsuarios: number;
  totalClientes: number;
  totalParceiros: number;
  ano: number;
  mes: number;
}

export interface UserChartDataPoint {
  mes: number;
  totalUsuarios: number;
  totalClientes: number;
  totalParceiros: number;
}

export interface UserChartData {
  ano: number;
  dados: UserChartDataPoint[];
}
