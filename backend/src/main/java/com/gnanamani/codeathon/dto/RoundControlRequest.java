package com.gnanamani.codeathon.dto;

public class RoundControlRequest {
    private String action; // START, PAUSE, RESUME, END, LOCK, UNLOCK
    private Integer durationMinutes;

    public RoundControlRequest() {}

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
}
