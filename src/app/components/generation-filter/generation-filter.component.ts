import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { appsOutline } from 'ionicons/icons';
import { GenerationSummary } from '../../services/pokemon';

@Component({
  selector: 'app-generation-filter',
  templateUrl: './generation-filter.component.html',
  styleUrls: ['./generation-filter.component.scss'],
  imports: [CommonModule, IonIcon],
})
export class GenerationFilterComponent {
  // Lista de generaciones a filtrar
  @Input() generations: GenerationSummary[] = [];

  // Identificador de la generacion seleccionada (null = Todas)
  @Input() selectedGenId: number | null = null;

  // Evento emitido al cambiar la seleccion
  @Output() filterChange = new EventEmitter<number | null>();

  constructor() {
    addIcons({ appsOutline });
  }

  onSelect(id: number | null): void {
    this.selectedGenId = id;
    this.filterChange.emit(id);
  }
}

