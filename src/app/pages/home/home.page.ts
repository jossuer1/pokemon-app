import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonSpinner,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  listOutline,
  swapHorizontal,
  barChartOutline,
  arrowForwardOutline,
  refreshOutline,
  alertCircleOutline,
  flash,
  sparkles,
  shieldCheckmarkOutline,
  trophyOutline,
  appsOutline,
} from 'ionicons/icons';
import {
  PokemonService,
  GenerationsOverview,
  GenerationSummary,
} from '../../services/pokemon';
import { GenerationStatCardComponent } from '../../components/generation-stat-card/generation-stat-card.component';
import { GenerationChartComponent } from '../../components/generation-chart/generation-chart.component';
import { EntryScreenService } from '../../services/entry-screen';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonSpinner,
    GenerationStatCardComponent,
    GenerationChartComponent,
  ],
})
export class HomePage implements OnInit {
  loading = true;
  errorMessage = '';
  data: GenerationsOverview | null = null;

  constructor(
    public pokemonService: PokemonService,
    private router: Router,
    private entryScreen: EntryScreenService
  ) {
    addIcons({
      logOutOutline,
      listOutline,
      swapHorizontal,
      barChartOutline,
      arrowForwardOutline,
      refreshOutline,
      alertCircleOutline,
      flash,
      sparkles,
      shieldCheckmarkOutline,
      trophyOutline,
      appsOutline,
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(forceRefresh = false): void {
    this.loading = true;
    this.errorMessage = '';

    this.pokemonService.getGenerationsOverview(forceRefresh).subscribe({
      next: (overview) => {
        this.data = overview;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos en inicio:', err);
        this.errorMessage =
          'No se pudo conectar con la PokeAPI para cargar el resumen de generaciones. Comprueba tu red y reintenta.';
        this.loading = false;
      },
    });
  }

  goToPokedex(): void {
    this.router.navigate(['/pokedex']);
  }

  goToCompare(): void {
    this.router.navigate(['/compare']);
  }

  goToStats(genId?: number): void {
    if (genId) {
      this.router.navigate(['/stats'], { queryParams: { gen: genId } });
    } else {
      this.router.navigate(['/stats']);
    }
  }

  exitToWelcome(): void {
    this.entryScreen.show();
    void this.router.navigate(['/home']);
  }
}
