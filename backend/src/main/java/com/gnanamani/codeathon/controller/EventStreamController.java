package com.gnanamani.codeathon.controller;

import com.gnanamani.codeathon.service.RealtimeEventService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/v1/events")
public class EventStreamController {

    private final RealtimeEventService realtimeEventService;

    public EventStreamController(RealtimeEventService realtimeEventService) {
        this.realtimeEventService = realtimeEventService;
    }

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        return realtimeEventService.createEmitter();
    }
}
