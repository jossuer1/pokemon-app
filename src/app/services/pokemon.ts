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
  { id: 'all', name: 'Todos', color: '#687076', icon: '⭐' },
  { id: 'fire', name: 'Fuego', color: '#FF6F52', icon: '🔥' },
  { id: 'water', name: 'Agua', color: '#59B1FF', icon: '💧' },
  { id: 'grass', name: 'Planta', color: '#48D0B0', icon: '🍃' },
  { id: 'electric', name: 'Eléctrico', color: '#FFD86F', icon: '⚡' },
  { id: 'poison', name: 'Veneno', color: '#A552CC', icon: '☠️' },
  { id: 'bug', name: 'Bicho', color: '#98D8A0', icon: '🐛' },
  { id: 'psychic', name: 'Psíquico', color: '#FF6584', icon: '🔮' },
  { id: 'ground', name: 'Tierra', color: '#E0C068', icon: '🏜️' },
  { id: 'rock', name: 'Roca', color: '#B8A038', icon: '🪨' },
  { id: 'fighting', name: 'Lucha', color: '#EB4947', icon: '🥊' },
  { id: 'ghost', name: 'Fantasma', color: '#7B62A3', icon: '👻' },
  { id: 'dragon', name: 'Dragón', color: '#546DE5', icon: '🐉' },
  { id: 'fairy', name: 'Hada', color: '#FF9FF3', icon: '✨' },
  { id: 'ice', name: 'Hielo', color: '#86E3CE', icon: '❄️' },
  { id: 'normal', name: 'Normal', color: '#A8A878', icon: '🔘' },
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
        badge: 'Showdown ⚔️',
        description: 'Animación frontal oficial en combate',
        url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`,
      },
      {
        id: 'back',
        title: 'Espalda (Entrenador)',
        badge: 'Perspectiva 🎮',
        description: 'Vista posterior desde el ángulo del entrenador',
        url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${id}.gif`,
      },
      {
        id: 'front_shiny',
        title: 'Frente Variocolor',
        badge: 'Shiny ✨',
        description: 'Animación frontal en su forma Shiny',
        url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${id}.gif`,
      },
      {
        id: 'back_shiny',
        title: 'Espalda Variocolor',
        badge: 'Shiny Trasero ✨',
        description: 'Vista posterior en su forma Shiny',
        url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/shiny/${id}.gif`,
      },
      {
        id: 'gen5',
        title: 'Estilo Clásico Pixel',
        badge: 'Gen 5 Retro 👾',
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
}