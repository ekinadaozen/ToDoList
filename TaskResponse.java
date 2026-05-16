package com.smarttask.dto.response;

import com.smarttask.enums.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private LocalDate deadline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TaskResponse() {
    }

    public TaskResponse(Long id, String title, String description, TaskStatus status,
                        LocalDate deadline, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.deadline = deadline;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // ── Builder ─────────────────────────────────────────────────────

    public static TaskResponseBuilder builder() {
        return new TaskResponseBuilder();
    }

    public static class TaskResponseBuilder {
        private Long id;
        private String title;
        private String description;
        private TaskStatus status;
        private LocalDate deadline;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public TaskResponseBuilder id(Long id) { this.id = id; return this; }
        public TaskResponseBuilder title(String title) { this.title = title; return this; }
        public TaskResponseBuilder description(String description) { this.description = description; return this; }
        public TaskResponseBuilder status(TaskStatus status) { this.status = status; return this; }
        public TaskResponseBuilder deadline(LocalDate deadline) { this.deadline = deadline; return this; }
        public TaskResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public TaskResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public TaskResponse build() {
            return new TaskResponse(id, title, description, status, deadline, createdAt, updatedAt);
        }
    }
}
