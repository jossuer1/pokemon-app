import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonSpinner,
  IonModal,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  listOutline,
  swapHorizontal,
  barChartOutline,
  logOutOutline,
  refreshOutline,
  alertCircleOutline,
  arrowForwardOutline,
  volumeHigh,
  volumeMedium,
  sparkles,
  close,
  scaleOutline,
  bodyOutline,
  fitness,
  flash,
  appsOutline,
  flameOutline,
  waterOutline,
  leafOutline,
  flashOutline,
  skullOutline,
  bugOutline,
  eyeOutline,
  earthOutline,
  diamondOutline,
  barbellOutline,
  contrastOutline,
  shieldOutline,
  sparklesOutline,
  snowOutline,
  radioButtonOnOutline,
  searchOutline,
} from 'ionicons/icons';
import {
  PokemonService,
  GenerationsOverview,
  GenerationSummary,
  GenerationSpeciesItem,
  PokemonListItem,
  PokemonGifItem,
} from '../../services/pokemon';
import { EntryScreenService } from '../../services/entry-screen';
import { GenerationStatCardComponent } from '../../components/generation-stat-card/generation-stat-card.component';
import { GenerationFilterComponent } from '../../components/generation-filter/generation-filter.component';
import { GenerationChartComponent } from '../../components/generation-chart/generation-chart.component';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonSpinner,
    IonModal,
    GenerationStatCardComponent,
    GenerationFilterComponent,
    GenerationChartComponent,
  ],
})
export class StatsPage implements OnInit {
  loading = true;
  errorMessage = '';

  data: GenerationsOverview | null = null;
  selectedGenId: number | null = null;

  // Audio para reproducir grito de Pokemon
  currentPlayingId: number | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  // Modal de detalle individual al hacer clic en un Pokemon de la generacion
  isModalOpen = false;
  selectedPokemon: PokemonListItem | null = null;
  selectedPokemonDetails: any = null;
  loadingDetails = false;
  showShiny = false;
  detailTab: 'stats' | 'features' | 'abilities' | 'gifs' = 'stats';
  pokemonGifs: PokemonGifItem[] = [];

  constructor(
    public pokemonService: PokemonService,
    private route: ActivatedRoute,
    private router: Router,
    private entryScreen: EntryScreenService
  ) {
    addIcons({
      listOutline,
      swapHorizontal,
      barChartOutline,
      logOutOutline,
      refreshOutline,
      alertCircleOutline,
      arrowForwardOutline,
      volumeHigh,
      volumeMedium,
      sparkles,
      close,
      scaleOutline,
      bodyOutline,
      fitness,
      flash,
      appsOutline,
      flameOutline,
      waterOutline,
      leafOutline,
      flashOutline,
      skullOutline,
      bugOutline,
      eyeOutline,
      earthOutline,
      diamondOutline,
      barbellOutline,
      contrastOutline,
      shieldOutline,
      sparklesOutline,
      snowOutline,
      radioButtonOnOutline,
      searchOutline,
    });
  }

  exitToWelcome(): void {
    this.entryScreen.show();
    void this.router.navigate(['/pokedex']);
  }

  ngOnInit(): void {
    // Escuchar parametro opcional ?gen=1
    this.route.queryParamMap.subscribe((params) => {
      const genParam = params.get('gen');
      if (genParam) {
        const parsed = parseInt(genParam, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 9) {
          this.selectedGenId = parsed;
        }
      }
    });

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
        console.error('Error al cargar estadisticas de generaciones:', err);
        this.errorMessage =
          'No se pudieron obtener las estadisticas desde la PokeAPI. Por favor verifica tu conexion a internet e intenta nuevamente.';
        this.loading = false;
      },
    });
  }

  onSelectGeneration(id: number | null): void {
    this.selectedGenId = id;
  }

  getSelectedGeneration(): GenerationSummary | null {
    if (!this.data || this.selectedGenId === null) return null;
    return this.data.generations.find((g) => g.id === this.selectedGenId) || null;
  }

  getFilteredPokemonList(): GenerationSpeciesItem[] {
    const selectedGen = this.getSelectedGeneration();
    return selectedGen ? selectedGen.pokemonSpecies : [];
  }

  // Reproducir sonido (cry)
  playCry(event: Event, id: number): void {
    event.stopPropagation();
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    if (this.currentPlayingId === id) {
      this.currentPlayingId = null;
      return;
    }

    this.currentPlayingId = id;
    const url = this.pokemonService.getCryUrl(id);
    const audio = new Audio(url);
    this.currentAudio = audio;

    audio.onended = () => {
      this.currentPlayingId = null;
      this.currentAudio = null;
    };

    audio.onerror = () => {
      const fallbackUrl = this.pokemonService.getLegacyCryUrl(id);
      const fallbackAudio = new Audio(fallbackUrl);
      this.currentAudio = fallbackAudio;
      fallbackAudio.onended = () => {
        this.currentPlayingId = null;
        this.currentAudio = null;
      };
      fallbackAudio.play().catch(() => {
        this.currentPlayingId = null;
      });
    };

    audio.play().catch(() => {
      this.currentPlayingId = null;
    });
  }

  // Abrir modal de detalles para el Pokemon seleccionado
  openDetails(pokemon: GenerationSpeciesItem): void {
    const item: PokemonListItem = {
      id: pokemon.id,
      name: pokemon.name,
      url: pokemon.url,
      image: pokemon.image,
      shinyImage: pokemon.shinyImage,
      gifUrl: pokemon.gifUrl,
      cryUrl: pokemon.cryUrl,
      legacyCryUrl: pokemon.legacyCryUrl,
    };

    this.selectedPokemon = item;
    this.isModalOpen = true;
    this.loadingDetails = true;
    this.showShiny = false;
    this.detailTab = 'stats';
    this.selectedPokemonDetails = null;
    this.pokemonGifs = this.pokemonService.getPokemonGifs(pokemon.id);

    this.pokemonService.getPokemonDetails(pokemon.id).subscribe({
      next: (details) => {
        this.selectedPokemonDetails = details;
        this.loadingDetails = false;
      },
      error: (err) => {
        console.error('Error cargando detalles del pokemon:', err);
        this.loadingDetails = false;
      },
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedPokemon = null;
    this.selectedPokemonDetails = null;
  }

  toggleShiny(): void {
    this.showShiny = !this.showShiny;
  }

  setDetailTab(tab: 'stats' | 'features' | 'abilities' | 'gifs'): void {
    this.detailTab = tab;
  }

  formatId(id: number): string {
    return this.pokemonService.formatId(id);
  }

  getTypeColor(typeName: string): string {
    return this.pokemonService.getTypeColor(typeName);
  }

  translateType(typeName: string): string {
    return this.pokemonService.translateType(typeName);
  }

  translateStat(statName: string): string {
    return this.pokemonService.translateStat(statName);
  }

  getStatColor(statName: string): string {
    return this.pokemonService.getStatColor(statName);
  }
}
