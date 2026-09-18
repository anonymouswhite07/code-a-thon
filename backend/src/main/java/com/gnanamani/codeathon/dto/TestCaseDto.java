package com.gnanamani.codeathon.dto;

public class TestCaseDto {
    private Long id;
    private String inputData;
    private String expectedOutput;
    private Boolean isHidden;
    private Integer orderIndex;

    public TestCaseDto() {}

    public TestCaseDto(Long id, String inputData, String expectedOutput, Boolean isHidden, Integer orderIndex) {
        this.id = id;
        this.inputData = inputData;
        this.expectedOutput = expectedOutput;
        this.isHidden = isHidden;
        this.orderIndex = orderIndex;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInputData() { return inputData; }
    public void setInputData(String inputData) { this.inputData = inputData; }

    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

    public Boolean getIsHidden() { return isHidden; }
    public void setIsHidden(Boolean isHidden) { this.isHidden = isHidden; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
