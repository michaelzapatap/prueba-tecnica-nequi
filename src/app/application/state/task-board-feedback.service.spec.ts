import { TestBed } from '@angular/core/testing';

import { DomainError } from '../../domain/errors/domain-error';
import { TaskBoardFeedbackService } from './task-board-feedback.service';

describe('TaskBoardFeedbackService', () => {
  let feedback: TaskBoardFeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    feedback = TestBed.inject(TaskBoardFeedbackService);
  });

  it('maps domain errors to validation feedback', () => {
    feedback.report(new DomainError('Invalid input.'));
    expect(feedback.errorMessage()).toBe('Revisa los datos ingresados.');
  });

  it('maps unexpected errors and can clear the message', () => {
    feedback.report(new Error('Unexpected.'));
    expect(feedback.errorMessage()).toContain('No pudimos');
    feedback.clear();
    expect(feedback.errorMessage()).toBeNull();
  });
});
