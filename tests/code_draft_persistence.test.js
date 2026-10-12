import { test } from 'node:test';
import assert from 'node:assert/strict';

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

// Simulates the CompeteArena draft, save, run limit, and submission management logic implemented in page.tsx
class CompeteDraftController {
  constructor(roundId, storage = new MockStorage()) {
    this.roundId = roundId;
    this.storage = storage;
    this.activeQuestion = null;
    this.code = '';
    this.customInput = '';
    this.codeDrafts = {};
    this.codeDraftsRef = {};
    this.codeRef = '';
    this.runCounts = {};
    this.submittedMap = {};
    this.MAX_RUNS = 3;
    this.MAX_SUBMISSIONS = 1;
  }

  getDraftKey(qId) {
    return `codeathon_draft_${this.roundId}_${qId}`;
  }

  getRunsKey(qId) {
    return `codeathon_runs_${this.roundId}_${qId}`;
  }

  getSubmittedKey(qId) {
    return `codeathon_submitted_${this.roundId}_${qId}`;
  }

  saveCurrentDraft() {
    if (this.activeQuestion?.id) {
      const curId = this.activeQuestion.id;
      const curCode = this.codeRef;
      this.codeDraftsRef[curId] = curCode;
      this.storage.setItem(this.getDraftKey(curId), curCode);
    }
  }

  handleManualSave() {
    if (!this.activeQuestion?.id) return false;
    const curId = this.activeQuestion.id;
    const curCode = this.codeRef;
    this.codeDraftsRef[curId] = curCode;
    this.codeDrafts[curId] = curCode;
    this.storage.setItem(this.getDraftKey(curId), curCode);
    return true;
  }

  handleCodeChange(newVal) {
    this.code = newVal;
    this.codeRef = newVal;
    if (this.activeQuestion?.id) {
      const qId = this.activeQuestion.id;
      this.codeDraftsRef[qId] = newVal;
      this.codeDrafts[qId] = newVal;
      this.storage.setItem(this.getDraftKey(qId), newVal);
    }
  }

  handleRunCustom() {
    if (!this.activeQuestion) return { success: false, reason: 'NO_QUESTION' };
    const qId = this.activeQuestion.id;
    const currentRuns = this.runCounts[qId] || 0;
    if (currentRuns >= this.MAX_RUNS) {
      return { success: false, reason: 'RUN_LIMIT_REACHED', runsUsed: currentRuns };
    }
    const nextCount = currentRuns + 1;
    this.runCounts[qId] = nextCount;
    this.storage.setItem(this.getRunsKey(qId), String(nextCount));
    return { success: true, runsUsed: nextCount, runsRemaining: this.MAX_RUNS - nextCount };
  }

  handleSubmit() {
    if (!this.activeQuestion) return { success: false, reason: 'NO_QUESTION' };
    const qId = this.activeQuestion.id;
    if (this.submittedMap[qId]) {
      return { success: false, reason: 'ALREADY_SUBMITTED' };
    }
    this.submittedMap[qId] = true;
    this.storage.setItem(this.getSubmittedKey(qId), 'true');
    return { success: true, status: 'PASSED', score: this.activeQuestion.points || 100 };
  }

  handleResetTemplate() {
    if (!this.activeQuestion) return;
    const qId = this.activeQuestion.id;
    const starter = this.activeQuestion.starterCode || '';
    this.code = starter;
    this.codeRef = starter;
    this.codeDraftsRef[qId] = starter;
    delete this.codeDrafts[qId];
    this.storage.removeItem(this.getDraftKey(qId));
  }

  loadQuestionDetail(detail) {
    // 1. Save currently active draft before switching
    this.saveCurrentDraft();

    const qId = detail.id;
    this.activeQuestion = detail;

    // Load runs count
    const storedRuns = parseInt(this.storage.getItem(this.getRunsKey(qId)) || '0', 10);
    this.runCounts[qId] = isNaN(storedRuns) ? 0 : storedRuns;

    // Load submission state
    if (this.storage.getItem(this.getSubmittedKey(qId)) === 'true') {
      this.submittedMap[qId] = true;
    }

    // 2. Resolve draft
    let resolvedCode = this.codeDraftsRef[qId];
    if (resolvedCode === undefined) {
      const saved = this.storage.getItem(this.getDraftKey(qId));
      if (saved !== null) {
        resolvedCode = saved;
      }
    }

    if (resolvedCode === undefined) {
      resolvedCode = detail.starterCode || '';
    }

    this.code = resolvedCode;
    this.codeRef = resolvedCode;
    this.codeDraftsRef[qId] = resolvedCode;
    this.codeDrafts[qId] = resolvedCode;
  }
}

test('CompeteArena code draft persistence across question switches', async (t) => {
  const storage = new MockStorage();
  const controller = new CompeteDraftController('round-1', storage);

  const q1 = { id: 101, title: 'Two Sum', points: 50, starterCode: 'def two_sum(nums):\n    pass\n' };
  const q2 = { id: 102, title: 'Reverse String', points: 50, starterCode: 'def reverse_str(s):\n    pass\n' };
  const q3 = { id: 103, title: 'Binary Search', points: 100, starterCode: 'def binary_search(arr):\n    pass\n' };

  await t.test('1. Initial load of Question 1 receives starter code', () => {
    controller.loadQuestionDetail(q1);
    assert.equal(controller.code, 'def two_sum(nums):\n    pass\n');
  });

  await t.test('2. Typing code in Question 1 updates state and storage', () => {
    const q1Code = 'def two_sum(nums):\n    return [0, 1] # my in-progress solution';
    controller.handleCodeChange(q1Code);
    assert.equal(controller.code, q1Code);
    assert.equal(storage.getItem('codeathon_draft_round-1_101'), q1Code);
  });

  await t.test('3. Switching to Question 2 does not erase Question 1 code and loads Q2 starter code', () => {
    controller.loadQuestionDetail(q2);
    assert.equal(controller.code, 'def reverse_str(s):\n    pass\n');
    assert.equal(
      storage.getItem('codeathon_draft_round-1_101'),
      'def two_sum(nums):\n    return [0, 1] # my in-progress solution'
    );
  });

  await t.test('4. Typing code in Question 2 saves Q2 code', () => {
    const q2Code = 'def reverse_str(s):\n    return s[::-1]';
    controller.handleCodeChange(q2Code);
    assert.equal(controller.code, q2Code);
    assert.equal(storage.getItem('codeathon_draft_round-1_102'), q2Code);
  });

  await t.test('5. Switching back to Question 1 restores Q1 unsubmitted code', () => {
    controller.loadQuestionDetail(q1);
    assert.equal(
      controller.code,
      'def two_sum(nums):\n    return [0, 1] # my in-progress solution'
    );
  });

  await t.test('6. Resetting template on Q2 resets only Q2 without wiping Q1', () => {
    controller.loadQuestionDetail(q2);
    controller.handleResetTemplate();
    assert.equal(controller.code, 'def reverse_str(s):\n    pass\n');
    assert.equal(storage.getItem('codeathon_draft_round-1_102'), null);

    // Q1 code is still intact
    controller.loadQuestionDetail(q1);
    assert.equal(
      controller.code,
      'def two_sum(nums):\n    return [0, 1] # my in-progress solution'
    );
  });

  await t.test('7. Explicit Save Draft button saves code to storage immediately', () => {
    controller.handleCodeChange('def two_sum(nums):\n    return [i, j]');
    const saveResult = controller.handleManualSave();
    assert.equal(saveResult, true);
    assert.equal(storage.getItem('codeathon_draft_round-1_101'), 'def two_sum(nums):\n    return [i, j]');
  });

  await t.test('8. Challenge has a strict 3-time run limit per round', () => {
    controller.loadQuestionDetail(q1);

    // Run 1
    const run1 = controller.handleRunCustom();
    assert.equal(run1.success, true);
    assert.equal(run1.runsRemaining, 2);

    // Run 2
    const run2 = controller.handleRunCustom();
    assert.equal(run2.success, true);
    assert.equal(run2.runsRemaining, 1);

    // Run 3
    const run3 = controller.handleRunCustom();
    assert.equal(run3.success, true);
    assert.equal(run3.runsRemaining, 0);

    // Run 4: Exceeded!
    const run4 = controller.handleRunCustom();
    assert.equal(run4.success, false);
    assert.equal(run4.reason, 'RUN_LIMIT_REACHED');
  });

  await t.test('9. Different challenge has its own separate 3-time run limit', () => {
    controller.loadQuestionDetail(q2);
    assert.equal(controller.runCounts[102], 0);

    const q2Run1 = controller.handleRunCustom();
    assert.equal(q2Run1.success, true);
    assert.equal(q2Run1.runsRemaining, 2);

    // Q1 still has 0 runs remaining
    controller.loadQuestionDetail(q1);
    const q1RunExtra = controller.handleRunCustom();
    assert.equal(q1RunExtra.success, false);
    assert.equal(q1RunExtra.reason, 'RUN_LIMIT_REACHED');
  });

  await t.test('10. Challenge has a strict 1-time submission limit', () => {
    controller.loadQuestionDetail(q1);

    // First submission succeeds
    const sub1 = controller.handleSubmit();
    assert.equal(sub1.success, true);
    assert.equal(controller.submittedMap[101], true);
    assert.equal(storage.getItem('codeathon_submitted_round-1_101'), 'true');

    // Second submission on same challenge is blocked
    const sub2 = controller.handleSubmit();
    assert.equal(sub2.success, false);
    assert.equal(sub2.reason, 'ALREADY_SUBMITTED');
  });

  await t.test('11. Submission state persists across question switches', () => {
    controller.loadQuestionDetail(q3);
    assert.equal(Boolean(controller.submittedMap[103]), false);

    // Switch back to Q1 -> still locked
    controller.loadQuestionDetail(q1);
    assert.equal(controller.submittedMap[101], true);
    const retry = controller.handleSubmit();
    assert.equal(retry.success, false);
    assert.equal(retry.reason, 'ALREADY_SUBMITTED');
  });
});
