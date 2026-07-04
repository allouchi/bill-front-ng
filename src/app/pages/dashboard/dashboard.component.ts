import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  ApexGrid,
  ApexYAxis,
  ApexTooltip,
} from 'ng-apexcharts';

import Facture from '../../models/Facture';
import { FactureService } from '../../services/factures/facture.service';
import { ClientService } from '../../services/clients/client-service';
import { ConsultantService } from '../../services/consultants/consultant-service';
import { CompanyService } from '../../services/companies/company-service';
import { SharedDataService } from '../../services/shared/shared-data-service';
import { AuthService } from '../../services/auth/auth-service';
import { fadeUp, listStagger } from '../../shared/animations/app.animations';

interface KpiCard {
  key: string;
  label: string;
  value: number;
  icon: string;
  tint: string;
  route: string;
  hint: string;
}

@Component({
  selector: 'bill-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [fadeUp, listStagger],
})
export class DashboardComponent implements OnInit {
  @ViewChild('chart') chart?: ChartComponent;

  loading = true;
  greeting = this.computeGreeting();
  userName = '';

  kpis: KpiCard[] = [
    { key: 'factures', label: 'Factures', value: 0, icon: 'bi-receipt', tint: 'violet', route: '/factures/read', hint: 'Total émises' },
    { key: 'clients', label: 'Clients', value: 0, icon: 'bi-people', tint: 'emerald', route: '/clients/read', hint: 'Portefeuille' },
    { key: 'consultants', label: 'Consultants', value: 0, icon: 'bi-person-badge', tint: 'amber', route: '/consultants/read', hint: 'Intervenants' },
    { key: 'companies', label: 'Sociétés', value: 0, icon: 'bi-building', tint: 'sky', route: '/companies/read', hint: 'Entités gérées' },
  ];

  totalRevenue = 0;
  recent: Facture[] = [];

  chartSeries: ApexAxisChartSeries = [{ name: 'Chiffre TTC', data: [] }];
  chartType: ApexChart = {
    type: 'area',
    height: 300,
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true, speed: 800 },
  };
  chartXaxis: ApexXAxis = { categories: [], labels: { style: { colors: '#8a90a6' } }, axisBorder: { show: false }, axisTicks: { show: false } };
  chartYaxis: ApexYAxis = { labels: { style: { colors: '#8a90a6' }, formatter: (v) => this.compact(v) } };
  chartStroke: ApexStroke = { curve: 'smooth', width: 3, colors: ['#6366f1'] };
  chartFill: ApexFill = {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.02, stops: [0, 90, 100] },
    colors: ['#8b5cf6'],
  };
  chartDataLabels: ApexDataLabels = { enabled: false };
  chartGrid: ApexGrid = { borderColor: 'rgba(140,140,170,0.15)', strokeDashArray: 4, xaxis: { lines: { show: false } } };
  chartTooltip: ApexTooltip = { theme: 'dark', y: { formatter: (v) => this.currency(v) } };

  hasChartData = false;

  private readonly factureService = inject(FactureService);
  private readonly clientService = inject(ClientService);
  private readonly consultantService = inject(ConsultantService);
  private readonly companyService = inject(CompanyService);
  private readonly sharedDataService = inject(SharedDataService);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.userName = user?.firstName ?? '';

    const siret = this.sharedDataService.getSiret();

    forkJoin({
      factures: siret
        ? this.factureService.findFacturesBySiret(siret, 0, 500).pipe(catchError(() => of(null)))
        : of(null),
      clients: this.clientService.findClients().pipe(catchError(() => of([]))),
      consultants: this.consultantService.findConsultants().pipe(catchError(() => of([]))),
      companies: this.companyService.findCompanies().pipe(catchError(() => of([]))),
    }).subscribe((res) => {
      const factures = res.factures?.content ?? [];
      const factureCount = res.factures?.page?.totalElements ?? factures.length;

      this.setKpi('factures', factureCount);
      this.setKpi('clients', res.clients?.length ?? 0);
      this.setKpi('consultants', res.consultants?.length ?? 0);
      this.setKpi('companies', res.companies?.length ?? 0);

      this.buildRevenue(factures);
      this.recent = [...factures]
        .sort((a, b) => (b.dateFacturation ?? '').localeCompare(a.dateFacturation ?? ''))
        .slice(0, 6);

      // Let the skeletons breathe for a beat, then reveal.
      setTimeout(() => (this.loading = false), 350);
    });
  }

  private setKpi(key: string, value: number): void {
    const kpi = this.kpis.find((k) => k.key === key);
    if (kpi) {
      kpi.value = value;
    }
  }

  private buildRevenue(factures: Facture[]): void {
    const monthOrder = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const buckets = new Map<number, number>();
    let total = 0;

    for (const f of factures) {
      const ttc = f.prixTotalTTC ?? 0;
      total += ttc;
      const raw = f.dateFacturation;
      let monthIdx = -1;
      if (raw) {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          monthIdx = d.getMonth();
        }
      }
      if (monthIdx < 0 && f.moisFacture) {
        const n = parseInt(f.moisFacture, 10);
        if (!isNaN(n)) monthIdx = Math.min(11, Math.max(0, n - 1));
      }
      if (monthIdx >= 0) {
        buckets.set(monthIdx, (buckets.get(monthIdx) ?? 0) + ttc);
      }
    }

    this.totalRevenue = total;

    const categories: string[] = [];
    const data: number[] = [];
    for (let i = 0; i < 12; i++) {
      if (buckets.has(i)) {
        categories.push(monthOrder[i]);
        data.push(Math.round(buckets.get(i)!));
      }
    }

    if (data.length === 0) {
      // Tasteful placeholder curve so the chart never looks broken.
      this.hasChartData = false;
      this.chartXaxis = { ...this.chartXaxis, categories: monthOrder };
      this.chartSeries = [{ name: 'Chiffre TTC', data: [12, 18, 15, 22, 19, 28, 24, 30, 27, 34, 31, 38] }];
    } else {
      this.hasChartData = true;
      this.chartXaxis = { ...this.chartXaxis, categories };
      this.chartSeries = [{ name: 'Chiffre TTC', data }];
    }
  }

  private computeGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  currency(v: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v ?? 0);
  }

  compact(v: number): string {
    if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
    return String(Math.round(v));
  }
}

export default DashboardComponent;
