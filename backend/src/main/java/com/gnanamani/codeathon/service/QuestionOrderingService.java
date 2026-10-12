package com.gnanamani.codeathon.service;

import com.gnanamani.codeathon.domain.Participant;
import com.gnanamani.codeathon.domain.Question;
import com.gnanamani.codeathon.domain.Round;
import com.gnanamani.codeathon.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Service
public class QuestionOrderingService {

    private final QuestionRepository questionRepository;

    public QuestionOrderingService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    /**
     * Returns the questions of a round shuffled deterministically per participant.
     * Each participant receives a unique, randomized question sequence, but the sequence
     * remains stable and consistent across page refreshes and session restarts for that participant.
     */
    public List<Question> getOrderedQuestionsForParticipant(Participant participant, Round round) {
        List<Question> questions = new ArrayList<>(questionRepository.findByRoundOrderByOrderIndexAsc(round));
        if (questions.size() <= 1) {
            return questions;
        }

        if (participant != null && participant.getId() != null) {
            long roundId = (round != null && round.getId() != null) ? round.getId() : 1L;
            // Deterministic pseudo-random seed unique to each participant + round
            long seed = participant.getId() * 10007L + roundId * 37L;
            Collections.shuffle(questions, new Random(seed));
        }
        return questions;
    }

    public List<Question> getOrderedQuestionsForParticipant(Participant participant, Long roundId) {
        List<Question> questions = new ArrayList<>(questionRepository.findByRoundIdAndIsEnabledTrueOrderByOrderIndexAsc(roundId));
        if (questions.size() <= 1) {
            return questions;
        }

        if (participant != null && participant.getId() != null) {
            long rId = (roundId != null) ? roundId : 1L;
            long seed = participant.getId() * 10007L + rId * 37L;
            Collections.shuffle(questions, new Random(seed));
        }
        return questions;
    }
}
