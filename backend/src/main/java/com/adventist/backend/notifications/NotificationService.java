package com.adventist.backend.notifications;

import com.adventist.backend.common.ResourceNotFoundException;
import com.adventist.backend.customers.Customer;
import com.adventist.backend.customers.CustomerRepository;
import com.adventist.backend.users.AppUser;
import com.adventist.backend.users.AppUserRepository;
import com.adventist.backend.users.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final CustomerRepository customerRepository;
    private final AppUserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, CustomerRepository customerRepository, AppUserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void create(Customer customer, String title, String message) {
        if (customer != null) {
            notificationRepository.save(new Notification(customer, title, message));
        }
    }

    @Transactional
    public void create(AppUser user, String title, String message) {
        if (user != null) {
            notificationRepository.save(new Notification(user, title, message));
        }
    }

    @Transactional
    public void createForRole(UserRole role, String title, String message) {
        userRepository.findByRoleAndActiveTrue(role).forEach(user -> create(user, title, message));
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> listMine(AppUser user) {
        List<Notification> notifications = new ArrayList<>(notificationRepository.findByUserOrderByCreatedAtDesc(user));
        customerRepository.findByEmailIgnoreCase(user.getEmail())
                .ifPresent(customer -> notifications.addAll(notificationRepository.findByCustomerOrderByCreatedAtDesc(customer)));
        return notifications.stream()
                .sorted(Comparator.comparing(Notification::getCreatedAt).reversed())
                .map(NotificationDto::from)
                .toList();
    }

    @Transactional
    public NotificationDto markRead(Long id, AppUser user) {
        Notification notification = notificationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("notification not found"));
        boolean ownsUserNotification = notification.getUser() != null && notification.getUser().getId().equals(user.getId());
        boolean ownsCustomerNotification = customerRepository.findByEmailIgnoreCase(user.getEmail())
                .map(customer -> notification.getCustomer() != null && notification.getCustomer().getId().equals(customer.getId()))
                .orElse(false);
        if (!ownsUserNotification && !ownsCustomerNotification) {
            throw new ResourceNotFoundException("notification not found");
        }
        notification.setRead(true);
        return NotificationDto.from(notification);
    }
}
