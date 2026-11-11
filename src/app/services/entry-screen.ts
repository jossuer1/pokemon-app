import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EntryScreenService {
  private readonly visibleSubject = new BehaviorSubject(true);
  readonly isVisible$ = this.visibleSubject.asObservable();

  show(): void {
    this.visibleSubject.next(true);
  }

  hide(): void {
    this.visibleSubject.next(false);
  }
}
