import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface PokemonListItem {
  id: number;
  name: string;
  url: string;
  image: string;
  shinyImage: string;
  gifUrl: string;
  cryUrl: string;
  legacyCryUrl: string;
}

export interface PokemonGifItem {
  id: string;
  title: string;
  url: string;
  badge: string;
  icon?: string;
  description: string;
}

export interface TypeFilter {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface StatCompareResult {
  statName: string;
  displayName: string;
  color: string;
  p1Val: number;
  p2Val: number;
  diff: number;
  winner: 1 | 2 | 0;
  p1Pct: number;
  p2Pct: number;
}

export const TYPE_FILTERS: TypeFilter[] = [
  { id: 'all', name: 'Todos', color: '#687076', icon: 'apps-outline' },
  { id: 'fire', name: 'Fuego', color: '#FF6F52', icon: 'flame-outline' },
  { id: 'water', name: 'Agua', color: '#59B1FF', icon: 'water-outline' },
  { id: 'grass', name: 'Planta', color: '#48D0B0', icon: 'leaf-outline' },
  { id: 'electric', name: 'Eléctrico', color: '#FFD86F', icon: 'flash-outline' },
  { id: 'poison', name: 'Veneno', color: '#A552CC', icon: 'skull-outline' },
  { id: 'bug', name: 'Bicho', color: '#98D8A0', icon: 'bug-outline' },
  { id: 'psychic', name: 'Psíquico', color: '#FF6584', icon: 'eye-outline' },
  { id: 'ground', name: 'Tierra', color: '#E0C068', icon: 'earth-outline' },
  { id: 'rock', name: 'Roca', color: '#B8A038', icon: 'diamond-outline' },
  { id: 'fighting', name: 'Lucha', color: '#EB4947', icon: 'barbell-outline' },
  { id: 'ghost', name: 'Fantasma', color: '#7B62A3', icon: 'contrast-outline' },
  { id: 'dragon', name: 'Dragón', color: '#546DE5', icon: 'shield-outline' },
  { id: 'fairy', name: 'Hada', color: '#FF9FF3', icon: 'sparkles-outline' },
  { id: 'ice', name: 'Hielo', color: '#86E3CE', icon: 'snow-outline' },
  { id: 'normal', name: 'Normal', color: '#A8A878', icon: 'radio-button-on-outline' },
];

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2';

  // Caches compartidos para rendimiento óptimo
  private detailsCache = new Map<number | string, any>();
  private typeCache = new Map<string, Set<string>>();
  private pokemonsCache: PokemonListItem[] | null = null;

  constructor(private http: HttpClient) {}

  // Obtener la lista de Pokémon (con cache de servicio)
  getPokemons(limit: number = 151, offset: number = 0): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon?limit=${limit}&offset=${offset}`);
  }

  // Obtener lista mapeada
  getMappedPokemons(): Observable<PokemonListItem[]> {
    if (this.pokemonsCache) {
      return of(this.pokemonsCache);
    }
    return new Observable<PokemonListItem[]>((observer) => {
      this.getPokemons(151, 0).subscribe({
        next: (response: any) => {
          const mapped: PokemonListItem[] = response.results.map((item: any) => {
            const id = this.extractIdFromUrl(item.url);
            return {
              id,
              name: item.name,
              url: item.url,
              image: this.getArtworkUrl(id),
              shinyImage: this.getShinyArtworkUrl(id),
              gifUrl: this.getAnimatedGifUrl(id),
              cryUrl: this.getCryUrl(id),
              legacyCryUrl: this.getLegacyCryUrl(id),
            };
          });
          this.pokemonsCache = mapped;
          observer.next(mapped);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  // Obtener detalles de un Pokémon por nombre o ID con caché integrado
  getPokemonDetails(nameOrId: string | number): Observable<any> {
    if (this.detailsCache.has(nameOrId)) {
      return of(this.detailsCache.get(nameOrId));
    }
    return this.http.get(`${this.apiUrl}/pokemon/${nameOrId}`).pipe(
      tap((details: any) => {
        this.detailsCache.set(nameOrId, details);
        if (details.id) {
          this.detailsCache.set(details.id, details);
          this.detailsCache.set(details.name, details);
        }
      })
    );
  }

  // Obtener lista por tipo con caché
  getPokemonsByType(typeName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/type/${typeName}`);
  }

  // Helpers de datos y traducción
  extractIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }

  formatId(id: number): string {
    return `#${id.toString().padStart(3, '0')}`;
  }

  getArtworkUrl(id: number | string): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  getShinyArtworkUrl(id: number | string): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
  }

  // GIF animado de batalla frontal (Showdown)
  getAnimatedGifUrl(id: number | string): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
  }

  // Colección de 5 GIFs animados para cada Pokémon
  getPokemonGifs(id: number | string): PokemonGifItem[] {
    return [
      {
        id: 'front',
        title: 'Frente de Batalla',
        badge: 'Showdown',
        icon: 'flash-outline',
        description: 'Animación frontal oficial en combate',
        url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`,
      },
      {
        id: 'back',
        title: 'Espalda (Entrenador)',
        badge: 'Perspectiva',
        icon: 'game-controller-outline',
        description: 'Vista posterior desde el ángulo del entrenador',
        url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${id}.gif`,
      },
      {
        id: 'front_shiny',
        title: 'Frente Variocolor',
        badge: 'Shiny',
        icon: 'sparkles-outline',
        description: 'Animación frontal en su forma Shiny',
        url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${id}.gif`,
      },
      {
        id: 'back_shiny',
        title: 'Espalda Variocolor',
        badge: 'Shiny Trasero',
        icon: 'sparkles-outline',
        description: 'Vista posterior en su forma Shiny',
        url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/shiny/${id}.gif`,
      },
      {
        id: 'gen5',
        title: 'Estilo Clásico Pixel',
        badge: 'Gen 5 Retro',
        icon: 'hardware-chip-outline',
        description: 'Animación original pixel art de Black & White',
        url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`,
      },
    ];
  }

  getCryUrl(id: number | string): string {
    return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
  }

  getLegacyCryUrl(id: number | string): string {
    return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${id}.ogg`;
  }

  getTypeColor(typeName: string): string {
    const filter = TYPE_FILTERS.find((t) => t.id === typeName?.toLowerCase());
    return filter ? filter.color : '#777777';
  }

  translateType(typeName: string): string {
    const filter = TYPE_FILTERS.find((t) => t.id === typeName?.toLowerCase());
    return filter ? filter.name : typeName;
  }

  translateStat(statName: string): string {
    const map: Record<string, string> = {
      hp: 'HP (Salud)',
      attack: 'Ataque',
      defense: 'Defensa',
      'special-attack': 'Atq. Esp.',
      'special-defense': 'Def. Esp.',
      speed: 'Velocidad',
    };
    return map[statName] || statName;
  }

  getStatColor(statName: string): string {
    const map: Record<string, string> = {
      hp: '#48D0B0',
      attack: '#FF6F52',
      defense: '#FFD86F',
      'special-attack': '#98D8A0',
      'special-defense': '#59B1FF',
      speed: '#FF6584',
    };
    return map[statName] || '#999999';
  }

  // Matriz de efectividad de tipos (atacante -> defensor)
  private typeChart: Record<string, Record<string, number>> = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
  };

  getTypeMultiplier(attackType: string, defenseType: string): number {
    const atk = attackType?.toLowerCase();
    const def = defenseType?.toLowerCase();
    if (this.typeChart[atk] && this.typeChart[atk][def] !== undefined) {
      return this.typeChart[atk][def];
    }
    return 1;
  }

  getBestTypeEffectiveness(attackerTypes: string[], defenderTypes: string[]) {
    let bestMult = 1;
    let bestAtk = attackerTypes[0] || 'normal';

    for (const atk of attackerTypes) {
      let combinedMult = 1;
      for (const def of defenderTypes) {
        combinedMult *= this.getTypeMultiplier(atk, def);
      }
      if (combinedMult > bestMult || (bestMult === 1 && combinedMult !== 1)) {
        bestMult = combinedMult;
        bestAtk = atk;
      }
    }

    let label = 'Daño Normal (x1.0)';
    let cssClass = 'normal';
    if (bestMult >= 2) {
      label = `¡Súper Efectivo! (x${bestMult})`;
      cssClass = 'super-effective';
    } else if (bestMult === 0) {
      label = '¡Sin Efecto / Inmune! (x0)';
      cssClass = 'immune';
    } else if (bestMult < 1) {
      label = `Poco Efectivo (x${bestMult})`;
      cssClass = 'not-very-effective';
    }

    return {
      bestMultiplier: bestMult,
      bestAttackerType: bestAtk,
      effectivenessLabel: label,
      effectivenessClass: cssClass,
    };
  }
}