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
  close,
  swapHorizontal,
  trophy,
  listOutline,
  flash,
  scaleOutline,
  bodyOutline,
  fitness,
} from 'ionicons/icons';
import {
  PokemonService,
  PokemonListItem,
  StatCompareResult,
} from '../../services/pokemon';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.page.html',
  styleUrls: ['./compare.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonIcon,
    IonModal,
    IonSpinner,
  ],
})
export class ComparePage implements OnInit {
  pokemons: PokemonListItem[] = [];
  loading = false;

  // Luchadores
  pokemon1: PokemonListItem | null = null;
  pokemon1Details: any = null;
  loadingDetails1 = false;

  pokemon2: PokemonListItem | null = null;
  pokemon2Details: any = null;
  loadingDetails2 = false;

  // Selector modal
  isPickerOpen = false;
  pickerTarget: 1 | 2 = 1;
  pickerSearchQuery = '';

  // Audio
  currentPlayingId: number | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  statsToCompare = [
    'hp',
    'attack',
    'defense',
    'special-attack',
    'special-defense',
    'speed',
  ];

  constructor(public pokemonService: PokemonService) {
    addIcons({
      volumeHigh,
      volumeMedium,
      play,
      search,
      close,
      swapHorizontal,
      trophy,
      listOutline,
      flash,
      scaleOutline,
      bodyOutline,
      fitness,
    });
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
        this.initDefaultComparison();
      },
      error: (err) => {
        console.error('Error al cargar Pokémon para comparador:', err);
        this.loading = false;
      },
    });
  }

  initDefaultComparison() {
    if (this.pokemons.length >= 9) {
      if (!this.pokemon1) {
        const charizard = this.pokemons.find((p) => p.id === 6) || this.pokemons[5];
        if (charizard) {
          this.pokemon1 = charizard;
          this.loadDetails(1, charizard.id);
        }
      }
      if (!this.pokemon2) {
        const blastoise = this.pokemons.find((p) => p.id === 9) || this.pokemons[8];
        if (blastoise) {
          this.pokemon2 = blastoise;
          this.loadDetails(2, blastoise.id);
        }
      }
    }
  }

  loadDetails(target: 1 | 2, id: number) {
    if (target === 1) this.loadingDetails1 = true;
    if (target === 2) this.loadingDetails2 = true;

    this.pokemonService.getPokemonDetails(id).subscribe({
      next: (details: any) => {
        if (target === 1) {
          this.pokemon1Details = details;
          this.loadingDetails1 = false;
        } else {
          this.pokemon2Details = details;
          this.loadingDetails2 = false;
        }
      },
      error: (err) => {
        console.error(`Error al cargar detalles de Pokémon ${id}:`, err);
        if (target === 1) this.loadingDetails1 = false;
        if (target === 2) this.loadingDetails2 = false;
      },
    });
  }

  openPicker(target: 1 | 2) {
    this.pickerTarget = target;
    this.pickerSearchQuery = '';
    this.isPickerOpen = true;
  }

  closePicker() {
    this.isPickerOpen = false;
  }

  choosePokemon(pokemon: PokemonListItem) {
    if (this.pickerTarget === 1) {
      this.pokemon1 = pokemon;
      this.loadDetails(1, pokemon.id);
      this.playCry(null, pokemon.id);
    } else {
      this.pokemon2 = pokemon;
      this.loadDetails(2, pokemon.id);
      this.playCry(null, pokemon.id);
    }
    this.closePicker();
  }

  swapPokemons() {
    const tempP = this.pokemon1;
    this.pokemon1 = this.pokemon2;
    this.pokemon2 = tempP;

    const tempDetails = this.pokemon1Details;
    this.pokemon1Details = this.pokemon2Details;
    this.pokemon2Details = tempDetails;
  }

  get pickerFilteredPokemons(): PokemonListItem[] {
    if (!this.pickerSearchQuery || this.pickerSearchQuery.trim() === '') {
      return this.pokemons;
    }
    const q = this.pickerSearchQuery.trim().toLowerCase().replace('#', '');
    return this.pokemons.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toString() === q ||
        p.id.toString().padStart(3, '0').includes(q)
    );
  }

  getStatComparison(statName: string): StatCompareResult {
    const s1 =
      this.pokemon1Details?.stats?.find((s: any) => s.stat.name === statName)?.base_stat || 0;
    const s2 =
      this.pokemon2Details?.stats?.find((s: any) => s.stat.name === statName)?.base_stat || 0;
    const diff = Math.abs(s1 - s2);
    let winner: 1 | 2 | 0 = 0;
    if (s1 > s2) winner = 1;
    else if (s2 > s1) winner = 2;

    return {
      statName,
      displayName: this.pokemonService.translateStat(statName),
      color: this.pokemonService.getStatColor(statName),
      p1Val: s1,
      p2Val: s2,
      diff,
      winner,
      p1Pct: Math.min((s1 / 180) * 100, 100),
      p2Pct: Math.min((s2 / 180) * 100, 100),
    };
  }

  getTotalStatsFor(details: any): number {
    if (!details?.stats) return 0;
    return details.stats.reduce((acc: number, curr: any) => acc + curr.base_stat, 0);
  }

  getTotalWinnerInfo() {
    const t1 = this.getTotalStatsFor(this.pokemon1Details);
    const t2 = this.getTotalStatsFor(this.pokemon2Details);
    const diff = Math.abs(t1 - t2);
    if (t1 > t2) {
      return { winner: 1, name: this.pokemon1?.name, diff, t1, t2 };
    } else if (t2 > t1) {
      return { winner: 2, name: this.pokemon2?.name, diff, t1, t2 };
    }
    return { winner: 0, name: 'Empate', diff: 0, t1, t2 };
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
      console.warn('No se pudo reproducir sonido:', err);
      this.currentPlayingId = null;
    });
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

  getGifUrl(pokemon: PokemonListItem | null): string {
    return pokemon ? this.pokemonService.getAnimatedGifUrl(pokemon.id) : '';
  }
}
