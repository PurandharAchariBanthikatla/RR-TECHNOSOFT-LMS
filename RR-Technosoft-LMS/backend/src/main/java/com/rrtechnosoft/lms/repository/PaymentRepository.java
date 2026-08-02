package com.rrtechnosoft.lms.repository;

import com.rrtechnosoft.lms.entity.Payment;
import com.rrtechnosoft.lms.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    @EntityGraph(attributePaths = {"student", "studentFee", "installment"})
    @Query("""
        select p from Payment p
        where (:studentId is null or p.student.id = :studentId)
          and (:studentFeeId is null or p.studentFee.id = :studentFeeId)
          and (:status is null or p.status = :status)
        order by p.createdAt desc
        """)
    Page<Payment> search(@Param("studentId") UUID studentId,
                          @Param("studentFeeId") UUID studentFeeId,
                          @Param("status") PaymentStatus status,
                          Pageable pageable);

    @EntityGraph(attributePaths = {"student", "studentFee", "installment"})
    Optional<Payment> findWithDetailsById(UUID id);

    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);

    Optional<Payment> findByGatewayPaymentId(String gatewayPaymentId);

    @EntityGraph(attributePaths = {"student", "studentFee", "installment"})
    List<Payment> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
}
