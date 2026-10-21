import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonModal,
  IonSpinner,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  volumeHigh,
  volumeMedium,
  play,
  search,
  sparkles,
  close,
  scaleOutline,
  bodyOutline,
  fitness,
  gridOutline,
  reorderTwoOutline,
  swapHorizontal,
  listOutline,
  filmOutline,
  statsChart,
  flash,
} from 'ionicons/icons';
import {
  PokemonService,
  PokemonListItem,
  PokemonGifItem,
  TypeFilter,
  TYPE_FILTERS,
} from '../../services/pokemon';

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.page.html',
  styleUrls: ['./pokedex.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonButton,
    IonIcon,
    IonModal,
    IonSpinner,
  ],
})
export class PokedexPage implements OnInit {
  pokemons: PokemonListItem[] = [];
  loading = false;
  searchQuery = '';
  selectedType = 'all';
  filterViewMode: 'scroll' | 'grid' = 'scroll';

  // Modal de Detalle individual
  isModalOpen = false;
  selectedPokemon: PokemonListItem | null = null;
  selectedPokemonDetails: any = null;
  loadingDetails = false;
  showShiny = false;

  // Audio / Sonido
  currentPlayingId: number | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  // Pestaña activa del modal de detalles: 'stats' | 'features' | 'abilities' | 'gifs'
  detailTab: 'stats' | 'features' | 'abilities' | 'gifs' = 'stats';
  pokemonGifs: PokemonGifItem[] = [];

  // Tipos
  typeFilters: TypeFilter[] = TYPE_FILTERS;
  private typeCache = new Map<string, Set<string>>();

  constructor(public pokemonService: PokemonService) {
    addIcons({
      volumeHigh,
      volumeMedium,
      play,
      search,
      sparkles,
      close,
      scaleOutline,
      bodyOutline,
      fitness,
      gridOutline,
      reorderTwoOutline,
      swapHorizontal,
      listOutline,
      filmOutline,
      statsChart,
      flash,
    });
  }

  setDetailTab(tab: 'stats' | 'features' | 'abilities' | 'gifs') {
    this.detailTab = tab;
  }

  ngOnInit() {
    this.fetchPokemons();
  }

  fetchPokemons() {
    this.loading = true;
    this.pokemonService.getMappedPokemons().subscribe({
      next: (list) => {
        this.pokemons = list;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar Pokémon:', err);
        this.loading = false;
      },
    });
  }

  get filteredPokemons(): PokemonListItem[] {
    let list = this.pokemons;

    if (this.selectedType !== 'all') {
      const typeNames = this.typeCache.get(this.selectedType);
      if (typeNames) {
        list = list.filter((p) => typeNames.has(p.name.toLowerCase()));
      }
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const query = this.searchQuery.trim().toLowerCase().replace('#', '');
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.id.toString() === query ||
          p.id.toString().padStart(3, '0').includes(query)
      );
    }

    return list;
  }

  toggleFilterMode() {
    this.filterViewMode = this.filterViewMode === 'scroll' ? 'grid' : 'scroll';
  }

  selectType(typeId: string) {
    this.selectedType = typeId;
    if (typeId === 'all') return;

    if (!this.typeCache.has(typeId)) {
      this.pokemonService.getPokemonsByType(typeId).subscribe({
        next: (data: any) => {
          const names = new Set<string>(
            data.pokemon.map((entry: any) => entry.pokemon.name.toLowerCase())
          );
          this.typeCache.set(typeId, names);
        },
        error: (err) => console.error(`Error al cargar tipo ${typeId}:`, err),
      });
    }
  }

  playCry(event: Event | null, id: number, useLegacy = false) {
    if (event) {
      event.stopPropagation();
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    const audioUrl = useLegacy
      ? this.pokemonService.getLegacyCryUrl(id)
      : this.pokemonService.getCryUrl(id);

    this.currentPlayingId = id;
    const audio = new Audio(audioUrl);
    this.currentAudio = audio;
    audio.volume = 0.8;

    audio.onended = () => {
      if (this.currentPlayingId === id) {
        this.currentPlayingId = null;
      }
    };

    audio.onerror = () => {
      if (!useLegacy) {
        this.playCry(null, id, true);
      } else {
        this.currentPlayingId = null;
      }
    };

    audio.play().catch((err) => {
      console.warn('No se pudo reproducir audio:', err);
      this.currentPlayingId = null;
    });
  }

  openDetails(pokemon: PokemonListItem) {
    this.selectedPokemon = pokemon;
    this.showShiny = false;
    this.detailTab = 'stats';
    this.pokemonGifs = this.pokemonService.getPokemonGifs(pokemon.id);
    this.isModalOpen = true;
    this.playCry(null, pokemon.id);

    this.loadingDetails = true;
    this.pokemonService.getPokemonDetails(pokemon.id).subscribe({
      next: (details: any) => {
        this.selectedPokemonDetails = details;
        this.loadingDetails = false;
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
        this.loadingDetails = false;
      },
    });
  }

  toggleShiny() {
    this.showShiny = !this.showShiny;
  }

  closeModal() {
    this.isModalOpen = false;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentPlayingId = null;
    }
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

  getStatPercent(value: number): number {
    return Math.min(value / 180, 1);
  }

  getTotalStats(): number {
    if (!this.selectedPokemonDetails?.stats) return 0;
    return this.selectedPokemonDetails.stats.reduce(
      (acc: number, curr: any) => acc + curr.base_stat,
      0
    );
  }
}
