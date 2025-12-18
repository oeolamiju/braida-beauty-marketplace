import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { calculateRefund, getCancellationPolicies } from "./policy_service";
import db from "../db";

describe("Policy Service", () => {
  describe("calculateRefund", () => {
    beforeEach(async () => {
      await db.exec`
        DELETE FROM cancellation_policies WHERE policy_type = 'client_cancel'
      `;
      await db.exec`
        INSERT INTO cancellation_policies (policy_type, hours_threshold, refund_percentage) VALUES
        ('client_cancel', 48, 100),
        ('client_cancel', 24, 50),
        ('client_cancel', 0, 0)
      `;
    });

    afterEach(async () => {
      await db.exec`
        DELETE FROM cancellation_policies WHERE policy_type = 'client_cancel'
      `;
      await db.exec`
        INSERT INTO cancellation_policies (policy_type, hours_threshold, refund_percentage) VALUES
        ('client_cancel', 48, 100),
        ('client_cancel', 24, 50),
        ('client_cancel', 0, 0)
      `;
    });

    it("should give 100% refund for freelancer cancellations", async () => {
      const bookingAmount = 100;
      const scheduledStartTime = new Date(Date.now() + 10 * 60 * 60 * 1000);
      const cancellationTime = new Date();

      const result = await calculateRefund(
        bookingAmount,
        scheduledStartTime,
        cancellationTime,
        "freelancer"
      );

      expect(result.refundPercentage).toBe(100);
      expect(result.refundAmount).toBe(100);
      expect(result.appliedPolicy).toBe("freelancer_cancel_full_refund");
    });

    it("should give 100% refund for client cancellation >48 hours in advance", async () => {
      const bookingAmount = 100;
      const scheduledStartTime = new Date(Date.now() + 72 * 60 * 60 * 1000);
      const cancellationTime = new Date();

      const result = await calculateRefund(
        bookingAmount,
        scheduledStartTime,
        cancellationTime,
        "client"
      );

      expect(result.refundPercentage).toBe(100);
      expect(result.refundAmount).toBe(100);
      expect(result.hoursBeforeService).toBeGreaterThanOrEqual(72);
    });

    it("should give 50% refund for client cancellation between 24-48 hours", async () => {
      const bookingAmount = 100;
      const scheduledStartTime = new Date(Date.now() + 36 * 60 * 60 * 1000);
      const cancellationTime = new Date();

      const result = await calculateRefund(
        bookingAmount,
        scheduledStartTime,
        cancellationTime,
        "client"
      );

      expect(result.refundPercentage).toBe(50);
      expect(result.refundAmount).toBe(50);
      expect(result.hoursBeforeService).toBeGreaterThanOrEqual(24);
      expect(result.hoursBeforeService).toBeLessThan(48);
    });

    it("should give 0% refund for client cancellation <24 hours", async () => {
      const bookingAmount = 100;
      const scheduledStartTime = new Date(Date.now() + 12 * 60 * 60 * 1000);
      const cancellationTime = new Date();

      const result = await calculateRefund(
        bookingAmount,
        scheduledStartTime,
        cancellationTime,
        "client"
      );

      expect(result.refundPercentage).toBe(0);
      expect(result.refundAmount).toBe(0);
      expect(result.hoursBeforeService).toBeLessThan(24);
    });

    it("should calculate correct hours before service", async () => {
      const bookingAmount = 100;
      const scheduledStartTime = new Date(Date.now() + 100 * 60 * 60 * 1000);
      const cancellationTime = new Date();

      const result = await calculateRefund(
        bookingAmount,
        scheduledStartTime,
        cancellationTime,
        "client"
      );

      expect(result.hoursBeforeService).toBeGreaterThanOrEqual(99);
      expect(result.hoursBeforeService).toBeLessThanOrEqual(100);
    });

    it("should handle partial amounts correctly", async () => {
      const bookingAmount = 75.50;
      const scheduledStartTime = new Date(Date.now() + 36 * 60 * 60 * 1000);
      const cancellationTime = new Date();

      const result = await calculateRefund(
        bookingAmount,
        scheduledStartTime,
        cancellationTime,
        "client"
      );

      expect(result.refundPercentage).toBe(50);
      expect(result.refundAmount).toBe(37.75);
    });

    it("should handle edge case at exactly 48 hours", async () => {
      const bookingAmount = 100;
      const now = Date.now();
      const scheduledStartTime = new Date(now + 48 * 60 * 60 * 1000);
      const cancellationTime = new Date(now);

      const result = await calculateRefund(
        bookingAmount,
        scheduledStartTime,
        cancellationTime,
        "client"
      );

      expect(result.refundPercentage).toBe(100);
      expect(result.refundAmount).toBe(100);
    });

    it("should handle edge case at exactly 24 hours", async () => {
      const bookingAmount = 100;
      const scheduledStartTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const cancellationTime = new Date();

      const result = await calculateRefund(
        bookingAmount,
        scheduledStartTime,
        cancellationTime,
        "client"
      );

      expect(result.refundPercentage).toBe(50);
      expect(result.refundAmount).toBe(50);
    });
  });

  describe("getCancellationPolicies", () => {
    it("should retrieve cancellation policies in correct order", async () => {
      const policies = await getCancellationPolicies();

      expect(policies.length).toBeGreaterThan(0);
      expect(policies[0].hoursThreshold).toBeGreaterThanOrEqual(policies[policies.length - 1].hoursThreshold);
      
      for (const policy of policies) {
        expect(policy.policyType).toBe("client_cancel");
        expect(policy.refundPercentage).toBeGreaterThanOrEqual(0);
        expect(policy.refundPercentage).toBeLessThanOrEqual(100);
      }
    });
  });
});
