import { Injectable, signal } from '@angular/core';

import { DomainError } from '../../domain/errors/domain-error';

@Injectable({ providedIn: 'root' })
export class TaskBoardFeedbackService {
  private readonly errorState = signal<string | null>(null);

  readonly errorMessage = this.errorState.asReadonly();

  clear(): void {
    this.errorState.set(null);
  }

  report(error: unknown): void {
    this.errorState.set(
      error instanceof DomainError
        ? 'Revisa los datos ingresados.'
        : 'No pudimos completar la acción. Inténtalo de nuevo.',
    );
  }
}
