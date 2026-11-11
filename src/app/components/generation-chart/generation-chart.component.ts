import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  pieChartOutline,
  barChartOutline,
  refreshOutline,
} from 'ionicons/icons';
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  DoughnutController,
  BarController,
  ChartConfiguration,
} from 'chart.js';
import { GenerationSummary } from '../../services/pokemon';

Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  DoughnutController,
  BarController
);

@Component({
  selector: 'app-generation-chart',
  templateUrl: './generation-chart.component.html',
  styleUrls: ['./generation-chart.component.scss'],
  imports: [CommonModule, IonIcon],
})
export class GenerationChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  // Lista de resumenes por generacion
  @Input() generations: GenerationSummary[] = [];

  // Tipo de grafico ('doughnut' o 'bar')
  @Input() chartType: 'doughnut' | 'bar' = 'doughnut';

  // Mostrar selector para alternar tipo de grafico
  @Input() showTypeToggle = true;

  // Evento al seleccionar una generacion desde la leyenda o el grafico
  @Output() generationSelected = new EventEmitter<number>();

  @ViewChild('chartCanvas', { static: false })
  chartCanvas?: ElementRef<HTMLCanvasElement>;

  private chartInstance: Chart | null = null;

  constructor() {
    addIcons({ pieChartOutline, barChartOutline, refreshOutline });
  }

  ngAfterViewInit(): void {
    this.createOrUpdateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['generations'] || changes['chartType']) {
      this.createOrUpdateChart();
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  setChartType(type: 'doughnut' | 'bar'): void {
    if (this.chartType !== type) {
      this.chartType = type;
      this.createOrUpdateChart();
    }
  }

  onLegendItemClick(gen: GenerationSummary): void {
    this.generationSelected.emit(gen.id);
  }

  private destroyChart(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  private createOrUpdateChart(): void {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      return;
    }

    if (!this.generations || this.generations.length === 0) {
      this.destroyChart();
      return;
    }

    this.destroyChart();

    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const labels = this.generations.map((g) => g.shortName);
    const dataValues = this.generations.map((g) => g.pokemonCount);
    const backgroundColors = this.generations.map((g) => g.color);
    const regions = this.generations.map((g) => g.region);

    const isDoughnut = this.chartType === 'doughnut';

    const config: ChartConfiguration = {
      type: isDoughnut ? 'doughnut' : 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Pokemon registrados',
            data: dataValues,
            backgroundColor: backgroundColors,
            borderColor: isDoughnut ? '#ffffff' : backgroundColors,
            borderWidth: isDoughnut ? 3 : 1,
            borderRadius: isDoughnut ? 0 : 8,
            hoverOffset: isDoughnut ? 12 : 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 900,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: {
            display: false, // La leyenda personalizada ofrece mejor interactividad y diseño
          },
          tooltip: {
            backgroundColor: '#0d2259',
            titleColor: '#ffffff',
            bodyColor: '#ffd700',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 12,
            displayColors: true,
            callbacks: {
              title: (items) => {
                const idx = items[0]?.dataIndex ?? 0;
                const gen = this.generations[idx];
                return gen ? `${gen.displayName} (${regions[idx]})` : '';
              },
              label: (context) => {
                const val = context.parsed?.y ?? context.parsed;
                return ` ${val} Pokemon`;
              },
            },
          },
        },
        scales: isDoughnut
          ? {}
          : {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: '#64748b',
                  font: {
                    weight: 600,
                    size: 11,
                  },
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: '#f1f5f9',
                },
                ticks: {
                  color: '#94a3b8',
                  font: {
                    size: 11,
                  },
                },
              },
            },
        onClick: (_, elements) => {
          if (elements && elements.length > 0) {
            const index = elements[0].index;
            const selected = this.generations[index];
            if (selected) {
              this.generationSelected.emit(selected.id);
            }
          }
        },
      },
    };

    this.chartInstance = new Chart(ctx, config);
  }
}

