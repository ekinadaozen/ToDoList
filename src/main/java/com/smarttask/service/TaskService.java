package com.smarttask.service;

import com.smarttask.dto.request.CreateTaskRequest;
import com.smarttask.dto.request.UpdateTaskRequest;
import com.smarttask.dto.response.TaskResponse;
import com.smarttask.entity.Task;
import com.smarttask.entity.User;
import com.smarttask.enums.TaskStatus;
import com.smarttask.exception.ResourceNotFoundException;
import com.smarttask.repository.TaskRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    // ── Query ───────────────────────────────────────────────────────

    public List<TaskResponse> getAllTasks() {
        User user = getCurrentUser();
        return taskRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TaskResponse getTaskById(Long id) {
        Task task = findTaskForCurrentUser(id);
        return toResponse(task);
    }

    // ── Command ─────────────────────────────────────────────────────

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request) {
        User user = getCurrentUser();

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .deadline(request.getDeadline())
                .user(user)
                .build();

        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    @Transactional
    public TaskResponse updateTask(Long id, UpdateTaskRequest request) {
        Task task = findTaskForCurrentUser(id);

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getDeadline() != null) {
            task.setDeadline(request.getDeadline());
        }

        Task updated = taskRepository.save(task);
        return toResponse(updated);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = findTaskForCurrentUser(id);
        taskRepository.delete(task);
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private Task findTaskForCurrentUser(Long taskId) {
        User user = getCurrentUser();
        return taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }

    private TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .deadline(task.getDeadline())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
