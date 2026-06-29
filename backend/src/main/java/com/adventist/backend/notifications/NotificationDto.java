package com.adventist.backend.notifications;

import java.time.Instant;

public record NotificationDto(Long id, String title, String message, boolean read, Instant createdAt) {
    public static NotificationDto from(Notification notification) {
        return new NotificationDto(notification.getId(), notification.getTitle(), notification.getMessage(), notification.isRead(), notification.getCreatedAt());
    }
}
