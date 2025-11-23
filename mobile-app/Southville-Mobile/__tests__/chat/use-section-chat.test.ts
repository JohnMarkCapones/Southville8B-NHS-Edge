import { calculateUnread } from "@/hooks/use-section-chat";

describe("calculateUnread", () => {
	it("returns 0 when no messages", () => {
		const result = calculateUnread([], null);
		expect(result).toBe(0);
	});

	it("counts all messages when lastRead is null", () => {
		const msgs = [
			{ id: "1", conversation_id: "c", sender_id: "u", content: "a", created_at: "2025-01-01T00:00:00.000Z" },
			{ id: "2", conversation_id: "c", sender_id: "u", content: "b", created_at: "2025-01-01T01:00:00.000Z" },
		] as any;
		expect(calculateUnread(msgs, null)).toBe(2);
	});

	it("counts only messages after lastRead", () => {
		const msgs = [
			{ id: "1", conversation_id: "c", sender_id: "u", content: "a", created_at: "2025-01-01T00:00:00.000Z" },
			{ id: "2", conversation_id: "c", sender_id: "u", content: "b", created_at: "2025-01-01T01:00:00.000Z" },
			{ id: "3", conversation_id: "c", sender_id: "u", content: "c", created_at: "2025-01-01T02:00:00.000Z" },
		] as any;
		expect(calculateUnread(msgs, "2025-01-01T01:00:00.000Z")).toBe(1);
	});
});
