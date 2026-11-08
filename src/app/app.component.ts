import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { flash, sparkles, flashOutline, arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [CommonModule, IonApp, IonRouterOutlet, IonIcon],
})
export class AppComponent implements OnInit {
  showSplash = true;
  isFading = false;

  constructor() {
    addIcons({
      flash,
      sparkles,
      flashOutline,
      arrowForwardOutline,
    });
  }

  ngOnInit() {
    // Auto descartar la pantalla de carga luego de 2.4s con transición suave
    setTimeout(() => {
      this.dismissSplash();
    }, 2400);
  }

  dismissSplash() {
    if (this.isFading || !this.showSplash) return;
    this.isFading = true;
    setTimeout(() => {
      this.showSplash = false;
    }, 450);
  }
}
