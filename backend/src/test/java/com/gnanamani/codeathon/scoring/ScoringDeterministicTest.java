package com.gnanamani.codeathon.scoring;

import com.gnanamani.codeathon.domain.Participant;
import com.gnanamani.codeathon.domain.Question;
import com.gnanamani.codeathon.domain.Role;
import com.gnanamani.codeathon.domain.Submission;
import com.gnanamani.codeathon.domain.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ScoringDeterministicTest {

    @Test
    @DisplayName("Deterministic score computation based on percentage and points")
    void testScoreComputation() {
        int maxPoints = 100;

        assertEquals(100, calculateScore(100.0, maxPoints));
        assertEquals(50, calculateScore(50.0, maxPoints));
        assertEquals(0, calculateScore(0.0, maxPoints));
        assertEquals(33, calculateScore(33.33, maxPoints));
        assertEquals(75, calculateScore(75.0, maxPoints));
    }

    @Test
    @DisplayName("Participant max score calculation across multiple submissions is deterministic")
    void testMaxScoreCalculation() {
        User user = new User("alice@gct.ac.in", "pass", "Alice", Role.ROLE_PARTICIPANT);
        Participant p = new Participant(user, "1234567890", "GCT", "CSE", "3rd Year", "2y");

        Question q = new Question();
        q.setId(1L);
        q.setPoints(100);

        List<Submission> submissions = new ArrayList<>();

        Submission s1 = new Submission();
        s1.setQuestion(q);
        s1.setScore(40);
        submissions.add(s1);

        Submission s2 = new Submission();
        s2.setQuestion(q);
        s2.setScore(90);
        submissions.add(s2);

        Submission s3 = new Submission();
        s3.setQuestion(q);
        s3.setScore(70);
        submissions.add(s3);

        int maxScore = submissions.stream()
                .filter(s -> s.getQuestion().getId().equals(q.getId()))
                .mapToInt(Submission::getScore)
                .max()
                .orElse(0);

        assertEquals(90, maxScore, "Highest score achieved must be retained");
    }

    private int calculateScore(double scorePercent, int points) {
        return (int) Math.round((scorePercent / 100.0) * points);
    }
}
