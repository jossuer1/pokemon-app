import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet, IonIcon } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { flash, sparkles, flashOutline, arrowForwardOutline } from 'ionicons/icons';
import { EntryScreenService } from './services/entry-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [CommonModule, IonApp, IonRouterOutlet, IonIcon],
})
export class AppComponent {
  isFading = false;

  constructor(
    public entryScreen: EntryScreenService,
    private router: Router
  ) {
    addIcons({
      flash,
      sparkles,
      flashOutline,
      arrowForwardOutline,
    });
  }

  dismissSplash(targetRoute: string = '/pokedex') {
    if (this.isFading) return;
    this.isFading = true;
    setTimeout(() => {
      this.entryScreen.hide();
      this.isFading = false;
      void this.router.navigate([targetRoute]);
    }, 450);
  }
}
