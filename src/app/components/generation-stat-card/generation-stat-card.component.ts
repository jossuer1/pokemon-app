import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  sparklesOutline,
  appsOutline,
  flameOutline,
  leafOutline,
  diamondOutline,
  hardwareChipOutline,
  shieldOutline,
  sunnyOutline,
  trophyOutline,
  planetOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-generation-stat-card',
  templateUrl: './generation-stat-card.component.html',
  styleUrls: ['./generation-stat-card.component.scss'],
  imports: [CommonModule, RouterLink, IonIcon],
})
export class GenerationStatCardComponent {
  // Define si es la tarjeta principal de resumen superior o una de generacion
  @Input() isPrimary = false;

  // Titulo descriptivo (ej: 'Total de Pokemon' o 'Generacion 1')
  @Input() title = '';

  // Cantidad de Pokemon contados
  @Input() count = 0;

  // Subtitulo informativo
  @Input() subtitle = 'Pokemon registrados';

  // Nombre de la region opcional
  @Input() region = '';

  // Icono para la tarjeta
  @Input() icon = 'apps-outline';

  // Color de acento de la generacion
  @Input() accentColor = '#3867d6';

  // Enlace de accion para la tarjeta principal
  @Input() actionLink = '';

  // Texto del boton o enlace de accion
  @Input() actionText = 'Ver todos';

  // Estado de seleccion activa
  @Input() isSelected = false;

  // Evento al pulsar la tarjeta
  @Output() cardClick = new EventEmitter<void>();

  // Evento al pulsar la accion
  @Output() actionClick = new EventEmitter<void>();

  constructor() {
    addIcons({
      arrowForwardOutline,
      sparklesOutline,
      appsOutline,
      flameOutline,
      leafOutline,
      diamondOutline,
      hardwareChipOutline,
      shieldOutline,
      sunnyOutline,
      trophyOutline,
      planetOutline,
    });
  }

  onCardClick(): void {
    this.cardClick.emit();
  }

  onActionClick(event: MouseEvent): void {
    event.stopPropagation();
    this.actionClick.emit();
  }
}

