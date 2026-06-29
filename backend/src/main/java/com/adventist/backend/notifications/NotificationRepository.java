package com.adventist.backend.notifications;

import com.adventist.backend.customers.Customer;
import com.adventist.backend.users.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByCustomerOrderByCreatedAtDesc(Customer customer);
    List<Notification> findByUserOrderByCreatedAtDesc(AppUser user);
}
