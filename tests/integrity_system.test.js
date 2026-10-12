import { test } from 'node:test';
import assert from 'node:assert/strict';

/**
 * In-memory Mock Storage simulating localStorage
 */
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] ?? null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

/**
 * Controller simulating the frontend zero-tolerance integrity state machine in /compete/[roundId]/page.tsx
 */
class ZeroToleranceIntegrityController {
  constructor(roundId, questions, storage = new MockStorage()) {
    this.roundId = roundId;
    this.questions = questions; // array of { id, title, starterCode }
    this.storage = storage;
    this.activeQuestion = questions[0] || null;
    this.code = this.activeQuestion?.starterCode || '';
    this.codeRef = this.code;
    this.codeDrafts = {};
    this.lockedQuestions = new Set();
    this.sessionToken = null;
    this.isAgreementAccepted = false;
    this.tabSwitchCount = 0;
    this.fullscreenExitCount = 0;
    this.clipboardAttemptCount = 0;
    this.isAutoSubmitting = false;
    this.isRoundCompleted = false;
    this.submissionsCount = {}; // questionId -> count
    this.recordedEvents = [];
    this.executedSubmissions = [];
  }

  startSession(agreementAccepted) {
    if (!agreementAccepted) {
      throw new Error('Mandatory integrity agreement must be explicitly accepted.');
    }
    this.isAgreementAccepted = true;
    this.sessionToken = 'sess_' + Math.random().toString(36).substring(2);
    this.recordedEvents.push({ type: 'INTEGRITY_AGREEMENT_ACCEPTED' });
    this.recordedEvents.push({ type: 'ROUND_STARTED' });
    return {
      sessionToken: this.sessionToken,
      currentQuestionId: this.activeQuestion?.id,
      lockedQuestionIds: Array.from(this.lockedQuestions)
    };
  }

  updateCode(newCode) {
    if (this.lockedQuestions.has(this.activeQuestion?.id)) {
      throw new Error('Cannot edit locked question');
    }
    this.code = newCode;
    this.codeRef = newCode;
    if (this.activeQuestion) {
      this.codeDrafts[this.activeQuestion.id] = newCode;
      this.storage.setItem(`draft_${this.roundId}_${this.activeQuestion.id}`, newCode);
    }
  }

  // Simulates handleVisibilityChange triggered when document.visibilityState becomes 'hidden'
  async triggerTabSwitch() {
    if (!this.sessionToken || !this.activeQuestion || this.isAutoSubmitting) {
      return { skipped: true };
    }

    const currentQ = this.activeQuestion;
    if (this.lockedQuestions.has(currentQ.id)) {
      return { alreadyLocked: true };
    }

    this.isAutoSubmitting = true;
    this.tabSwitchCount++;

    // 1. Submit latest code immediately
    const codeToSubmit = this.codeRef || currentQ.starterCode || '// Auto-submitted';
    const subId = 1000 + this.executedSubmissions.length;
    this.executedSubmissions.push({
      id: subId,
      questionId: currentQ.id,
      code: codeToSubmit,
      isAutoSubmission: true,
      trigger: 'TAB_SWITCH_ZERO_TOLERANCE'
    });

    // 2. Lock current question permanently
    this.lockedQuestions.add(currentQ.id);
    this.recordedEvents.push({
      type: 'TAB_HIDDEN',
      questionId: currentQ.id,
      context: 'document.visibilityState === hidden'
    });
    this.recordedEvents.push({
      type: 'QUESTION_LOCKED',
      questionId: currentQ.id,
      submissionId: subId
    });

    // 3. Advance to next question in round
    const nextQ = this.questions.find(q => !this.lockedQuestions.has(q.id));
    if (nextQ) {
      this.activeQuestion = nextQ;
      const savedDraft = this.storage.getItem(`draft_${this.roundId}_${nextQ.id}`);
      this.code = savedDraft || nextQ.starterCode || '';
      this.codeRef = this.code;
      this.recordedEvents.push({
        type: 'QUESTION_ADVANCED',
        nextQuestionId: nextQ.id
      });
    } else {
      this.activeQuestion = null;
      this.isRoundCompleted = true;
      this.recordedEvents.push({ type: 'ROUND_COMPLETED' });
    }

    this.isAutoSubmitting = false;
    return {
      autoSubmitted: true,
      lockedQuestionId: currentQ.id,
      nextQuestionId: nextQ ? nextQ.id : null,
      isRoundCompleted: this.isRoundCompleted
    };
  }

  // Simulates submit button click with up to 4 tries and -25 penalty per retry
  submitCode(questionId, code) {
    if (this.lockedQuestions.has(questionId)) {
      throw new Error('Question is locked');
    }
    const currentCount = this.submissionsCount[questionId] || 0;
    if (currentCount >= 4) {
      throw new Error('Submission limit reached: Maximum 4 submissions are allowed per challenge.');
    }

    const attemptNumber = currentCount + 1;
    const penalty = (attemptNumber - 1) * 25; // 0 on attempt 1, 25 on attempt 2, 50 on attempt 3, 75 on attempt 4
    this.submissionsCount[questionId] = attemptNumber;

    return {
      attemptNumber,
      penalty,
      allowed: true
    };
  }

  recordFullscreenExit() {
    this.fullscreenExitCount++;
    this.recordedEvents.push({ type: 'FULLSCREEN_EXITED' });
  }

  recordClipboardAttempt(action) {
    this.clipboardAttemptCount++;
    this.recordedEvents.push({ type: `${action.toUpperCase()}_ATTEMPT` });
  }
}

// -------------------------------------------------------------
// Node Test Suite
// -------------------------------------------------------------

test('Zero-Tolerance Integrity: Agreement is strictly required before starting', () => {
  const questions = [
    { id: 101, title: 'Two Sum', starterCode: 'int main() {}' },
    { id: 102, title: 'Reverse String', starterCode: 'char* rev() {}' }
  ];
  const controller = new ZeroToleranceIntegrityController(1, questions);

  assert.throws(() => {
    controller.startSession(false);
  }, /Mandatory integrity agreement must be explicitly accepted/);

  const startRes = controller.startSession(true);
  assert.ok(startRes.sessionToken);
  assert.equal(startRes.currentQuestionId, 101);
  assert.equal(startRes.lockedQuestionIds.length, 0);
  assert.equal(controller.recordedEvents[0].type, 'INTEGRITY_AGREEMENT_ACCEPTED');
});

test('Zero-Tolerance Integrity: Tab switch triggers instant auto-submit, locks question, and advances to next challenge', async () => {
  const questions = [
    { id: 101, title: 'Two Sum', starterCode: 'int main() {}' },
    { id: 102, title: 'Reverse String', starterCode: 'char* rev() {}' },
    { id: 103, title: 'Binary Search', starterCode: 'int bs() {}' }
  ];
  const controller = new ZeroToleranceIntegrityController(1, questions);
  controller.startSession(true);

  // Participant edits code for question 101
  controller.updateCode('int main() { printf("Answer 1"); return 0; }');

  // Participant switches tab (e.g., switches to Google or another application)
  const result = await controller.triggerTabSwitch();

  assert.equal(result.autoSubmitted, true);
  assert.equal(result.lockedQuestionId, 101);
  assert.equal(result.nextQuestionId, 102);
  assert.equal(result.isRoundCompleted, false);

  // Question 101 is now permanently locked
  assert.ok(controller.lockedQuestions.has(101));
  assert.throws(() => {
    controller.submitCode(101, 'some code');
  }, /Question is locked/);

  // Active question has automatically transitioned to 102
  assert.equal(controller.activeQuestion.id, 102);
  assert.equal(controller.code, 'char* rev() {}');

  // Verify submission log
  assert.equal(controller.executedSubmissions.length, 1);
  assert.equal(controller.executedSubmissions[0].questionId, 101);
  assert.equal(controller.executedSubmissions[0].code, 'int main() { printf("Answer 1"); return 0; }');
  assert.equal(controller.executedSubmissions[0].trigger, 'TAB_SWITCH_ZERO_TOLERANCE');
});

test('Zero-Tolerance Integrity: Tab switch on final question completes the round', async () => {
  const questions = [
    { id: 201, title: 'Final Boss', starterCode: 'void solve() {}' }
  ];
  const controller = new ZeroToleranceIntegrityController(2, questions);
  controller.startSession(true);

  controller.updateCode('void solve() { // incomplete }');
  const result = await controller.triggerTabSwitch();

  assert.equal(result.autoSubmitted, true);
  assert.equal(result.lockedQuestionId, 201);
  assert.equal(result.nextQuestionId, null);
  assert.equal(result.isRoundCompleted, true);
  assert.equal(controller.isRoundCompleted, true);
  assert.equal(controller.activeQuestion, null);
});

test('Submission Rules: Up to 4 attempts with progressive -25 penalty per retry, 5th attempt rejected', () => {
  const questions = [{ id: 301, title: 'Algorithm Challenge', starterCode: '' }];
  const controller = new ZeroToleranceIntegrityController(1, questions);
  controller.startSession(true);

  // Attempt 1: 0 penalty
  const att1 = controller.submitCode(301, 'try 1');
  assert.equal(att1.attemptNumber, 1);
  assert.equal(att1.penalty, 0);

  // Attempt 2: 25 penalty
  const att2 = controller.submitCode(301, 'try 2');
  assert.equal(att2.attemptNumber, 2);
  assert.equal(att2.penalty, 25);

  // Attempt 3: 50 penalty
  const att3 = controller.submitCode(301, 'try 3');
  assert.equal(att3.attemptNumber, 3);
  assert.equal(att3.penalty, 50);

  // Attempt 4: 75 penalty
  const att4 = controller.submitCode(301, 'try 4');
  assert.equal(att4.attemptNumber, 4);
  assert.equal(att4.penalty, 75);

  // Attempt 5: Rejected
  assert.throws(() => {
    controller.submitCode(301, 'try 5');
  }, /Submission limit reached: Maximum 4 submissions are allowed per challenge\./);
});

test('Integrity Audit Counter: Fullscreen and clipboard violations are tracked accurately', () => {
  const questions = [{ id: 401, title: 'Challenge', starterCode: '' }];
  const controller = new ZeroToleranceIntegrityController(1, questions);
  controller.startSession(true);

  controller.recordFullscreenExit();
  controller.recordFullscreenExit();
  assert.equal(controller.fullscreenExitCount, 2);

  controller.recordClipboardAttempt('paste');
  controller.recordClipboardAttempt('copy');
  assert.equal(controller.clipboardAttemptCount, 2);

  const eventTypes = controller.recordedEvents.map(e => e.type);
  assert.ok(eventTypes.includes('FULLSCREEN_EXITED'));
  assert.ok(eventTypes.includes('PASTE_ATTEMPT'));
  assert.ok(eventTypes.includes('COPY_ATTEMPT'));
});
