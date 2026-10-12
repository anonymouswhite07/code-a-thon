package com.gnanamani.codeathon.dto;

import jakarta.validation.constraints.NotNull;

public class StartSessionRequest {

    @NotNull(message = "Round ID is required")
    private Long roundId;

    @NotNull(message = "Agreement acceptance is mandatory")
    private Boolean agreementAccepted;

    public StartSessionRequest() {}

    public StartSessionRequest(Long roundId, Boolean agreementAccepted) {
        this.roundId = roundId;
        this.agreementAccepted = agreementAccepted;
    }

    public Long getRoundId() { return roundId; }
    public void setRoundId(Long roundId) { this.roundId = roundId; }

    public Boolean getAgreementAccepted() { return agreementAccepted; }
    public void setAgreementAccepted(Boolean agreementAccepted) { this.agreementAccepted = agreementAccepted; }
}
