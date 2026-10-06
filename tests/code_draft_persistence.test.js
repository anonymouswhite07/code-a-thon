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

// Simulates the CompeteArena draft management logic implemented in page.tsx
class CompeteDraftController {
  constructor(roundId, storage = new MockStorage()) {
    this.roundId = roundId;
    this.storage = storage;
    this.activeQuestion = null;
    this.code = '';
    this.codeDrafts = {};
    this.codeDraftsRef = {};
    this.codeRef = '';
  }

  getDraftKey(qId) {
    return `codeathon_draft_${this.roundId}_${qId}`;
  }

  saveCurrentDraft() {
    if (this.activeQuestion?.id) {
      const curId = this.activeQuestion.id;
      const curCode = this.codeRef;
      this.codeDraftsRef[curId] = curCode;
      this.storage.setItem(this.getDraftKey(curId), curCode);
    }
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

  const q1 = { id: 101, title: 'Two Sum', starterCode: 'def two_sum(nums):\n    pass\n' };
  const q2 = { id: 102, title: 'Reverse String', starterCode: 'def reverse_str(s):\n    pass\n' };
  const q3 = { id: 103, title: 'Binary Search', starterCode: 'def binary_search(arr):\n    pass\n' };

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

  await t.test('6. Switching back to Question 2 restores Q2 unsubmitted code', () => {
    controller.loadQuestionDetail(q2);
    assert.equal(controller.code, 'def reverse_str(s):\n    return s[::-1]');
  });

  await t.test('7. Resetting template on Q2 resets only Q2 without wiping Q1', () => {
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

  await t.test('8. Switching to Question 3 with fresh storage works seamlessly', () => {
    controller.loadQuestionDetail(q3);
    assert.equal(controller.code, 'def binary_search(arr):\n    pass\n');
  });
});
